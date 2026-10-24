"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-kurur-key-change-in-production"
);

export async function getPanelData() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kurur_session")?.value;

    if (!token) return { success: false, error: "لطفاً وارد شوید" };

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        country: true,
        province: true,
        city: true,
      },
    });

    if (!user) return { success: false, error: "کاربر یافت نشد" };

    let requests: any[] = [];
    let products: any[] = [];

    if (user.role === "BUYER") {
      requests = await prisma.request.findMany({
        where: { buyerId: user.id },
        orderBy: { createdAt: "desc" },
        include: { category: true, province: true, city: true },
      });
    } else if (user.role === "SELLER") {
      requests = await prisma.request.findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
        include: { category: true, province: true, city: true, buyer: { select: { fullName: true } } },
      });
      products = await prisma.product.findMany({
        where: { sellerId: user.id },
        orderBy: { createdAt: "desc" },
        include: { category: true, province: true, city: true },
      });
    } else if (user.role === "BOTH") {
      requests = await prisma.request.findMany({
        where: { buyerId: user.id },
        orderBy: { createdAt: "desc" },
        include: { category: true, province: true, city: true },
      });
      products = await prisma.product.findMany({
        where: { sellerId: user.id },
        orderBy: { createdAt: "desc" },
        include: { category: true, province: true, city: true },
      });
    }

    const totalRequests = requests.length;
    const activeRequests = requests.filter(r => r.status === "OPEN").length;
    
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === "OPEN").length;

    return { 
      success: true, 
      user, 
      requests, 
      products, 
      stats: { totalRequests, activeRequests, totalProducts, activeProducts } 
    };
  } catch (error) {
    console.error("Panel data error:", error);
    return { success: false, error: "خطا در دریافت اطلاعات" };
  }
}

export async function getUserProfile() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kurur_session")?.value;

    if (!token) return { success: false, error: "لطفاً وارد شوید" };

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        country: true,
        province: true,
        city: true,
      },
    });

    if (!user) return { success: false, error: "کاربر یافت نشد" };

    return { success: true, user };
  } catch (error) {
    console.error("Get profile error:", error);
    return { success: false, error: "خطا در دریافت اطلاعات" };
  }
}