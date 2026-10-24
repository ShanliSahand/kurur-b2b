"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAdminAds() {
  try {
    const ads = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        city: { select: { name: true } },
        seller: { select: { fullName: true, companyName: true, phone: true } }
      }
    });
    return { success: true, ads };
  } catch (error) {
    return { success: false, error: "خطا در دریافت آگهی‌ها" };
  }
}

export async function deleteAdminAd(id: string) {
  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/admin/ads");
    revalidatePath("/search");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در حذف آگهی" };
  }
}

export async function toggleAdStatus(id: string, newStatus: "OPEN" | "CLOSED") {
  try {
    await prisma.product.update({
      where: { id },
      data: { status: newStatus }
    });

    revalidatePath("/admin/ads");
    revalidatePath("/search");
    revalidatePath("/panel");

    return { success: true };
  } catch (error) {
    console.error("Toggle ad status error:", error);
    return { success: false, error: "خطا در تغییر وضعیت" };
  }
}