"use server";

import { prisma } from "@/lib/prisma";

export async function getAdminUsers() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        city: { select: { name: true } },
        _count: {
          select: { requests: true, products: true }
        }
      }
    });
    return { success: true, users };
  } catch (error) {
    return { success: false, error: "خطا در دریافت کاربران" };
  }
}

export async function deleteUser(id: string) {
  try {
    await prisma.user.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در حذف کاربر" };
  }
}