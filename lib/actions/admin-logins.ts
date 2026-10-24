"use server";

import { prisma } from "@/lib/prisma";

export async function getAdminLogins() {
  try {
    const logins = await prisma.loginHistory.findMany({
      orderBy: { loginAt: "desc" },
      include: {
        user: { select: { fullName: true, companyName: true, phone: true, role: true } }
      }
    });
    return { success: true, logins };
  } catch (error) {
    return { success: false, error: "خطا در دریافت تاریخچه ورود" };
  }
}