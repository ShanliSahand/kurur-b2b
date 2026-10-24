"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { revalidatePath } from "next/cache";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-kurur-key-change-in-production"
);

export async function createProduct(data: {
  title: string;
  categoryId: string;
  price?: string;
  minOrder?: string;
  dataSheetUrl?: string;
  description?: string;
  provinceId: string;
  cityId: string;
  images: string[];
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kurur_session")?.value;

    if (!token) return { success: false, error: "برای ثبت آگهی باید وارد شوید" };

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    if (!userId) return { success: false, error: "توکن نامعتبر است" };

    await prisma.product.create({
      data: {
        title: data.title,
        categoryId: data.categoryId,
        price: data.price || null,
        minOrder: data.minOrder || null,
        dataSheetUrl: data.dataSheetUrl || null,
        description: data.description || null,
        provinceId: data.provinceId,
        cityId: data.cityId,
        sellerId: userId,
        countryId: "cmveryvks0000v6pk7eobf6f4",
        images: data.images,
      },
    });

    revalidatePath("/panel");
    revalidatePath("/search");

    return { success: true };
  } catch (error) {
    console.error("Create product error:", error);
    return { success: false, error: "خطا در ثبت آگهی" };
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

export async function getProductById(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        province: true,
        city: true,
        seller: {
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
            province: { select: { name: true } },
            city: { select: { name: true } },
          }
        }
      }
    });

    if (!product) return { success: false, error: "محصول یافت نشد" };

    return { success: true, product };
  } catch (error) {
    console.error("Fetch product error:", error);
    return { success: false, error: "خطا در دریافت محصول" };
  }
}

export async function deleteProduct(productId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kurur_session")?.value;
    if (!token) return { success: false, error: "لطفاً وارد شوید" };

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.sellerId !== userId) {
      return { success: false, error: "شما دسترسی به حذف این مورد را ندارید" };
    }

    await prisma.product.delete({ where: { id: productId } });
    
    revalidatePath("/panel");
    revalidatePath("/search");
    return { success: true };
  } catch (error) {
    console.error("Delete product error:", error);
    return { success: false, error: "خطا در حذف آگهی" };
  }
}

export async function updateProduct(id: string, data: {
  title: string;
  categoryId: string;
  price?: string;
  minOrder?: string;
  dataSheetUrl?: string;
  description?: string;
  provinceId: string;
  cityId: string;
  images?: string[];
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kurur_session")?.value;
    if (!token) return { success: false, error: "لطفاً وارد شوید" };

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    // Verify ownership
    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct || existingProduct.sellerId !== userId) {
      return { success: false, error: "شما دسترسی به ویرایش این مورد را ندارید" };
    }

    await prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        categoryId: data.categoryId,
        price: data.price || null,
        minOrder: data.minOrder || null,
        dataSheetUrl: data.dataSheetUrl || null,
        description: data.description || null,
        provinceId: data.provinceId,
        cityId: data.cityId,
        ...(data.images && { images: data.images }),
      },
    });

    revalidatePath("/panel");
    revalidatePath("/search");
    return { success: true };
  } catch (error) {
    console.error("Update product error:", error);
    return { success: false, error: "خطا در ویرایش آگهی" };
  }
}