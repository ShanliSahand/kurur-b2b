"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAdminRequests() {
  try {
    const requests = await prisma.request.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        city: { select: { name: true } },
        buyer: { select: { fullName: true, companyName: true, phone: true } }
      }
    });
    return { success: true, requests };
  } catch (error) {
    return { success: false, error: "خطا در دریافت درخواست‌ها" };
  }
}

export async function deleteAdminRequest(id: string) {
  try {
    await prisma.request.delete({ where: { id } });
    revalidatePath("/admin/requests");
    revalidatePath("/search");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در حذف درخواست" };
  }
}

export async function toggleRequestStatus(id: string, newStatus: "OPEN" | "CLOSED") {
  try {
    await prisma.request.update({
      where: { id },
      data: { status: newStatus }
    });

    revalidatePath("/admin/requests");
    revalidatePath("/search");
    revalidatePath("/panel");

    return { success: true };
  } catch (error) {
    console.error("Toggle request status error:", error);
    return { success: false, error: "خطا در تغییر وضعیت" };
  }
}