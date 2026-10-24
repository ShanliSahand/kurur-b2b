"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAdminPlans() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { monthlyPrice: "asc" }
    });
    return { success: true, plans };
  } catch (error) {
    return { success: false, error: "خطا در دریافت پلن‌ها" };
  }
}

export async function updatePlanPrice(id: string, newPrice: number) {
  try {
    if (newPrice <= 0) {
      return { success: false, error: "قیمت باید بزرگتر از صفر باشد" };
    }

    await prisma.plan.update({
      where: { id },
      data: { monthlyPrice: newPrice }
    });

    revalidatePath("/admin/plans");
    revalidatePath("/plans"); // Update the user-facing plans page
    revalidatePath("/panel");

    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در بروزرسانی قیمت" };
  }
}