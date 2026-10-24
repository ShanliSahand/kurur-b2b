"use server";

import { prisma } from "@/lib/prisma";

export async function getAdminStats() {
  try {
    // 1. Count Users
    const totalUsers = await prisma.user.count();
    const buyers = await prisma.user.count({ where: { role: "BUYER" } });
    const sellers = await prisma.user.count({ where: { role: "SELLER" } });
    const both = await prisma.user.count({ where: { role: "BOTH" } });

    // 2. Count Requests & Ads
    const totalRequests = await prisma.request.count();
    const activeRequests = await prisma.request.count({ where: { status: "OPEN" } });
    
    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({ where: { status: "OPEN" } });

    // 3. Count Active Subscriptions
    const now = new Date();
    const activeSilver = await prisma.user.count({ 
      where: { subscriptionType: "SILVER", subscriptionEnd: { gt: now } } 
    });
    const activeGold = await prisma.user.count({ 
      where: { subscriptionType: "GOLD", subscriptionEnd: { gt: now } } 
    });
    const activePlatinum = await prisma.user.count({ 
      where: { subscriptionType: "PLATINUM", subscriptionEnd: { gt: now } } 
    });
    
    // 4. Calculate Revenue
    const transactions = await prisma.transaction.findMany({
      where: { status: "SUCCESS" }
    });
    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    // 5. Recent Activity
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, fullName: true, phone: true, role: true, createdAt: true }
    });

    const recentRequests = await prisma.request.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { 
        id: true, 
        title: true, 
        createdAt: true, 
        city: { select: { name: true } },
        buyer: { select: { fullName: true, companyName: true } } 
      }
    });

    const recentProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { 
        id: true, 
        title: true, 
        createdAt: true,
        city: { select: { name: true } },
        seller: { select: { fullName: true, companyName: true } } 
      }
    });

    return {
      success: true,
      stats: {
        users: { total: totalUsers, buyers, sellers, both },
        requests: { total: totalRequests, active: activeRequests },
        products: { total: totalProducts, active: activeProducts },
        subscriptions: { silver: activeSilver, gold: activeGold, platinum: activePlatinum },
        revenue: totalRevenue,
        recentUsers,
        recentRequests,
        recentProducts
      }
    };
  } catch (error) {
    console.error("Admin stats error:", error);
    return { success: false, error: "خطا در دریافت اطلاعات" };
  }
}