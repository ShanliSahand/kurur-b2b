"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { revalidatePath } from "next/cache";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-kurur-key-change-in-production"
);

export async function getPlans() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { monthlyPrice: 'asc' }
    });
    return { success: true, plans };
  } catch (error) {
    console.error("Get plans error:", error);
    return { success: false, error: "خطا در دریافت پلن‌ها" };
  }
}

export async function upgradeSubscription(plan: "SILVER" | "GOLD" | "PLATINUM", months: number) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kurur_session")?.value;

    if (!token) return { success: false, error: "لطفاً وارد شوید" };

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    // 1. Get current user and the new plan's price
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "کاربر یافت نشد" };

    const newPlan = await prisma.plan.findUnique({ where: { type: plan } });
    if (!newPlan) return { success: false, error: "پلن مورد نظر یافت نشد" };

    const now = new Date();
    
    // 2. Calculate the exact end date
    let baseDate = now;
    
    // If user has an active paid subscription, calculate the value of remaining days
    if (user.subscriptionType !== "BASIC" && user.subscriptionEnd && user.subscriptionEnd > now) {
      const remainingMs = user.subscriptionEnd.getTime() - now.getTime();
      const remainingDays = Math.max(0, Math.floor(remainingMs / (1000 * 3600 * 24)));
      
      if (remainingDays > 0) {
        const oldPlan = await prisma.plan.findUnique({ where: { type: user.subscriptionType } });
        
        if (oldPlan) {
          const dailyRateOldPlan = oldPlan.monthlyPrice / 30;
          const creditValue = remainingDays * dailyRateOldPlan;
          
          const dailyRateNewPlan = newPlan.monthlyPrice / 30;
          const extraDaysOnNewPlan = Math.floor(creditValue / dailyRateNewPlan);
          
          console.log(`Upgrade: ${remainingDays} days left on ${user.subscriptionType}. Credit: ${creditValue}. Converted to ${extraDaysOnNewPlan} days on ${plan}.`);
          
          baseDate = new Date(now.getTime() + extraDaysOnNewPlan * 24 * 60 * 60 * 1000);
        }
      }
    }

    // 3. Add the newly purchased months to the base date
    const newEndDate = new Date(baseDate);
    newEndDate.setMonth(newEndDate.getMonth() + months);

    // 4. Update the user
    await prisma.user.update({
      where: { id: userId },
      data: { 
        subscriptionType: plan,
        subscriptionStart: now, 
        subscriptionEnd: newEndDate,
        monthlyContacts: 0, 
      },
    });

    // --- RECORD TRANSACTION ---
    const planPrice = newPlan.monthlyPrice * months; 
    const fakeBankRef = "REF-" + Math.floor(Math.random() * 1000000000);

    await prisma.transaction.create({
      data: {
        userId: userId,
        amount: planPrice,
        planType: plan,
        months: months,
        referenceId: fakeBankRef,
        status: "SUCCESS",
      }
    });
    // --------------------------

    revalidatePath("/panel");
    revalidatePath("/search");
    revalidatePath("/plans");

    return { success: true };
  } catch (error) {
    console.error("Upgrade subscription error:", error);
    return { success: false, error: "خطا در سیستم پرداخت" };
  }
}