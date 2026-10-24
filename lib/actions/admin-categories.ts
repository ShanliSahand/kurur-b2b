"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAdminCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { requests: true, products: true }
        }
      }
    });
    return { success: true, categories };
  } catch (error) {
    return { success: false, error: "خطا در دریافت دسته‌بندی‌ها" };
  }
}

export async function createCategory(name: string) {
  try {
    if (!name || name.trim() === "") {
      return { success: false, error: "نام دسته‌بندی نمی‌تواند خالی باشد" };
    }

    await prisma.category.create({
      data: { name: name.trim() }
    });

    revalidatePath("/admin/categories");
    revalidatePath("/search");
    revalidatePath("/post");
    revalidatePath("/ad/post");

    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "این دسته‌بندی قبلاً وجود دارد" };
    }
    return { success: false, error: "خطا در ثبت دسته‌بندی" };
  }
}

export async function updateCategory(id: string, name: string) {
  try {
    if (!name || name.trim() === "") {
      return { success: false, error: "نام دسته‌بندی نمی‌تواند خالی باشد" };
    }

    await prisma.category.update({
      where: { id },
      data: { name: name.trim() }
    });

    revalidatePath("/admin/categories");
    revalidatePath("/search");
    revalidatePath("/post");
    revalidatePath("/ad/post");

    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { success: false, error: "این دسته‌بندی قبلاً وجود دارد" };
    }
    return { success: false, error: "خطا در ویرایش دسته‌بندی" };
  }
}

export async function deleteCategory(id: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { requests: true, products: true } }
      }
    });

    if (!category) return { success: false, error: "دسته‌بندی یافت نشد" };

    if (category._count.requests > 0 || category._count.products > 0) {
      return { 
        success: false, 
        error: "این دسته‌بندی دارای درخواست یا آگهی فعال است و قابل حذف نیست." 
      };
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    revalidatePath("/search");
    revalidatePath("/post");
    revalidatePath("/ad/post");

    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در حذف دسته‌بندی" };
  }
}