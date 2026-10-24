"use server";

import { prisma } from "@/lib/prisma";

export async function getAdminTransactions() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { fullName: true, companyName: true, phone: true } }
      }
    });
    return { success: true, transactions };
  } catch (error) {
    return { success: false, error: "خطا در دریافت تراکنش‌ها" };
  }
}