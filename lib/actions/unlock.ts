"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { revalidatePath } from "next/cache";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-kurur-key-change-in-production"
);

export async function unlockContact(requestId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kurur_session")?.value;

    if (!token) return { success: false, error: "لطفاً وارد شوید" };

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    // 1. Get the current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return { success: false, error: "کاربر یافت نشد" };

    const now = new Date();

    // 2. Check if the user has an active paid subscription
    if (user.subscriptionType === "BASIC") {
      return { 
        success: false, 
        error: "اشتراک پایه شما اجازه مشاهده اطلاعات تماس را نمی‌دهد. لطفاً اشتراک تهیه کنید.",
        needsCredits: true 
      };
    }

    // 3. Check if the subscription has expired
    if (user.subscriptionEnd && user.subscriptionEnd < now) {
      return { 
        success: false, 
        error: "اشتراک شما منقضی شده است. لطفاً برای ادامه استفاده، اشتراک خود را تمدید کنید.",
        needsCredits: true 
      };
    }

    // 4. Determine the monthly limit based on the plan
    let maxContacts = 0;
    if (user.subscriptionType === "SILVER") maxContacts = 10;
    else if (user.subscriptionType === "GOLD") maxContacts = 50;
    else if (user.subscriptionType === "PLATINUM") maxContacts = 100;

    // 5. Check if they have reached their monthly limit
    if (user.monthlyContacts >= maxContacts) {
      return { 
        success: false, 
        error: `سقف مشاهده اطلاعات تماس در اشتراک شما (${maxContacts} عدد در ماه) به پایان رسیده است.`,
        needsCredits: true 
      };
    }

    // 6. Get the request to find the buyer
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        buyer: {
          select: {
            id: true,
            phone: true,
            fullName: true,
            companyName: true,
            email: true,
            fixNumber: true,
            whatsapp: true,
            telegram: true,
            wechat: true,
          }
        }
      }
    });

    if (!request || !request.buyer) {
      return { success: false, error: "درخواست یافت نشد" };
    }

    // Prevent users from unlocking their own requests
    if (request.buyerId === userId) {
       return { success: true, contact: request.buyer, isOwn: true };
    }

    // 7. Increment the monthly counter
    await prisma.user.update({
      where: { id: userId },
      data: { monthlyContacts: user.monthlyContacts + 1 },
    });

    revalidatePath("/panel");
    revalidatePath("/search");

    return { success: true, contact: request.buyer };

  } catch (error) {
    console.error("Unlock error:", error);
    return { success: false, error: "خطا در سیستم" };
  }
}