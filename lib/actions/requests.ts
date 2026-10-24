"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { revalidatePath } from "next/cache";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-kurur-key-change-in-production"
);

export async function createRequest(data: {
  title: string;
  categoryId: string;
  quantity: string;
  unit?: string;
  budget?: string;
  deliveryTime?: string;
  description?: string;
  provinceId: string;
  cityId: string;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kurur_session")?.value;

    if (!token) return { success: false, error: "برای ثبت درخواست باید وارد شوید" };

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    if (!userId) return { success: false, error: "توکن نامعتبر است" };

    await prisma.request.create({
      data: {
        title: data.title,
        categoryId: data.categoryId,
        quantity: data.quantity,
        unit: data.unit || null,
        budget: data.budget || null,
        deliveryTime: data.deliveryTime || null,
        description: data.description || null,
        provinceId: data.provinceId,
        cityId: data.cityId,
        buyerId: userId,
        countryId: "cmveryvks0000v6pk7eobf6f4",
      },
    });

    revalidatePath("/panel");
    revalidatePath("/search");

    return { success: true };
  } catch (error) {
    console.error("Create request error:", error);
    return { success: false, error: "خطا در ثبت درخواست" };
  }
}

export async function getRequests(filters: {
  query?: string;
  categoryIds?: string[];
  cityNames?: string[];
}) {
  try {
    const whereClause: any = {
      status: "OPEN", 
    };

    if (filters.query && filters.query.trim() !== "") {
      whereClause.OR = [
        { title: { contains: filters.query, mode: "insensitive" } },
        { description: { contains: filters.query, mode: "insensitive" } }
      ];
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      whereClause.categoryId = { in: filters.categoryIds };
    }

    if (filters.cityNames && filters.cityNames.length > 0) {
      whereClause.city = { name: { in: filters.cityNames } };
    }

    const requests = await prisma.request.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        province: true,
        city: true,
        buyer: {
          select: {
            fullName: true,
            photoUrl: true
          }
        }
      }
    });

    return { success: true, requests };
  } catch (error) {
    console.error("Fetch requests error:", error);
    return { success: false, error: "خطا در دریافت درخواست‌ها" };
  }
}

export async function getSuppliers(filters: {
  query?: string;
  cityNames?: string[];
}) {
  try {
    const whereClause: any = {
      role: {
        in: ["SELLER", "BOTH"]
      }
    };

    if (filters.query && filters.query.trim() !== "") {
      whereClause.OR = [
        { companyName: { contains: filters.query, mode: "insensitive" } },
        { fullName: { contains: filters.query, mode: "insensitive" } }
      ];
    }

    if (filters.cityNames && filters.cityNames.length > 0) {
      whereClause.city = { name: { in: filters.cityNames } };
    }

    const suppliers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        fullName: true,
        companyName: true,
        photoUrl: true,
        phone: true,
        email: true,
        whatsapp: true,
        telegram: true,
        wechat: true,
        address: true,
        city: { select: { name: true } },
        province: { select: { name: true } },
        products: {
          where: { status: "OPEN" },
          take: 3,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            price: true,
            images: true
          }
        }
      },
      take: 50
    });
    
    return { success: true, suppliers };
  } catch (error) {
    console.error("Fetch suppliers error:", error);
    return { success: false, error: "خطا در دریافت تامین‌کنندگان" };
  }
}

export async function getProducts(filters: {
  query?: string;
  categoryIds?: string[];
  cityNames?: string[];
}) {
  try {
    const whereClause: any = {
      status: "OPEN",
    };

    if (filters.query && filters.query.trim() !== "") {
      whereClause.OR = [
        { title: { contains: filters.query, mode: "insensitive" } },
        { description: { contains: filters.query, mode: "insensitive" } }
      ];
    }

    if (filters.categoryIds && filters.categoryIds.length > 0) {
      whereClause.categoryId = { in: filters.categoryIds };
    }

    if (filters.cityNames && filters.cityNames.length > 0) {
      whereClause.city = { name: { in: filters.cityNames } };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        province: true,
        city: true,
        seller: {
          select: {
            fullName: true,
            companyName: true,
            photoUrl: true
          }
        }
      }
    });

    return { success: true, products };
  } catch (error) {
    console.error("Fetch products error:", error);
    return { success: false, error: "خطا در دریافت آگهی‌ها" };
  }
}

export async function deleteRequest(requestId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kurur_session")?.value;
    if (!token) return { success: false, error: "لطفاً وارد شوید" };

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const request = await prisma.request.findUnique({ where: { id: requestId } });
    if (!request || request.buyerId !== userId) {
      return { success: false, error: "شما دسترسی به حذف این مورد را ندارید" };
    }

    await prisma.request.delete({ where: { id: requestId } });
    
    revalidatePath("/panel");
    revalidatePath("/search");
    return { success: true };
  } catch (error) {
    console.error("Delete request error:", error);
    return { success: false, error: "خطا در حذف درخواست" };
  }
}

// --- THIS WAS THE MISSING FUNCTION ---
export async function getRequestById(id: string) {
  try {
    const request = await prisma.request.findUnique({
      where: { id },
      include: {
        category: true,
        province: true,
        city: true,
      }
    });
    if (!request) return { success: false, error: "درخواست یافت نشد" };
    return { success: true, request };
  } catch (error) {
    return { success: false, error: "خطا" };
  }
}

export async function updateRequest(id: string, data: {
  title: string;
  categoryId: string;
  quantity: string;
  unit?: string;
  budget?: string;
  deliveryTime?: string;
  description?: string;
  provinceId: string;
  cityId: string;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kurur_session")?.value;
    if (!token) return { success: false, error: "لطفاً وارد شوید" };

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    // Verify ownership
    const existingRequest = await prisma.request.findUnique({ where: { id } });
    if (!existingRequest || existingRequest.buyerId !== userId) {
      return { success: false, error: "شما دسترسی به ویرایش این مورد را ندارید" };
    }

    await prisma.request.update({
      where: { id },
      data: {
        title: data.title,
        categoryId: data.categoryId,
        quantity: data.quantity,
        unit: data.unit || null,
        budget: data.budget || null,
        deliveryTime: data.deliveryTime || null,
        description: data.description || null,
        provinceId: data.provinceId,
        cityId: data.cityId,
      },
    });

    revalidatePath("/panel");
    revalidatePath("/search");
    return { success: true };
  } catch (error) {
    console.error("Update request error:", error);
    return { success: false, error: "خطا در ویرایش درخواست" };
  }
}