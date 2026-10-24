"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAdminLocations() {
  try {
    const countries = await prisma.country.findMany({
      include: {
        provinces: {
          include: {
            cities: { orderBy: { name: 'asc' } },
            _count: { select: { cities: true } }
          },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    return { success: true, countries };
  } catch (error) {
    return { success: false, error: "خطا در دریافت موقعیت‌ها" };
  }
}

// --- COUNTRY ACTIONS ---
export async function addCountry(name: string) {
  try {
    await prisma.country.create({ data: { name: name.trim() } });
    revalidatePath("/admin/locations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در ثبت کشور. ممکن است تکراری باشد." };
  }
}

export async function updateCountry(id: string, name: string) {
  try {
    await prisma.country.update({ where: { id }, data: { name: name.trim() } });
    revalidatePath("/admin/locations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در ویرایش کشور" };
  }
}

export async function deleteCountry(id: string) {
  try {
    await prisma.country.delete({ where: { id } });
    revalidatePath("/admin/locations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "امکان حذف این کشور وجود ندارد." };
  }
}

// --- PROVINCE ACTIONS ---
export async function addProvince(countryId: string, name: string) {
  try {
    await prisma.province.create({ data: { name: name.trim(), countryId } });
    revalidatePath("/admin/locations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در ثبت استان." };
  }
}

export async function updateProvince(id: string, name: string) {
  try {
    await prisma.province.update({ where: { id }, data: { name: name.trim() } });
    revalidatePath("/admin/locations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در ویرایش استان" };
  }
}

export async function deleteProvince(id: string) {
  try {
    await prisma.province.delete({ where: { id } });
    revalidatePath("/admin/locations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "امکان حذف این استان وجود ندارد." };
  }
}

// --- CITY ACTIONS ---
export async function addCity(provinceId: string, name: string) {
  try {
    await prisma.city.create({ data: { name: name.trim(), provinceId } });
    revalidatePath("/admin/locations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در ثبت شهر." };
  }
}

export async function updateCity(id: string, name: string) {
  try {
    await prisma.city.update({ where: { id }, data: { name: name.trim() } });
    revalidatePath("/admin/locations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در ویرایش شهر" };
  }
}

export async function deleteCity(id: string) {
  try {
    await prisma.city.delete({ where: { id } });
    revalidatePath("/admin/locations");
    return { success: true };
  } catch (error) {
    return { success: false, error: "امکان حذف این شهر وجود ندارد." };
  }
}