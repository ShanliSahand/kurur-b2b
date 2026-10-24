"use server";

import { prisma } from "@/lib/prisma";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { sendOtpSms } from "@/lib/sms";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "super-secret-kurur-key-change-in-production"
);

export async function sendOtp(phone: string) {
  try {
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    const iran = await prisma.country.findFirst({
      where: { name: "ایران" }
    });

    if (!iran) {
      throw new Error("Country 'Iran' not found in database. Did you run the seed script?");
    }

    const user = await prisma.user.upsert({
      where: { phone },
      update: { otpCode, otpExpiresAt },
      create: { 
        phone, 
        otpCode, 
        otpExpiresAt,
        countryId: iran.id
      },
    });

    await sendOtpSms(phone, otpCode);
    //console.log(`\n📱 OTP for ${phone} is: ${otpCode}\n`);

    return { success: true, isNewUser: !user.fullName };
  } catch (error) {
    console.error("Error sending OTP:", error);
    return { success: false, error: "خطا در ارسال کد تایید" };
  }
}

export async function verifyOtp(phone: string, code: string) {
  try {
    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user || user.otpCode !== code) {
      return { success: false, error: "کد تایید نامعتبر است" };
    }

    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      return { success: false, error: "کد تایید منقضی شده است" };
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiresAt: null, isPhoneVerified: true },
    });

    // --- RECORD LOGIN HISTORY ---
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        userAgent: "Web Browser",
        ipAddress: "127.0.0.1", 
      }
    });
    // ----------------------------

    const token = await new SignJWT({ userId: user.id, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    (await cookies()).set("kurur_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    if (!updatedUser.fullName) {
      return { success: true, redirectTo: "/register" };
    } else {
      return { success: true, redirectTo: "/panel" };
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return { success: false, error: "خطا در بررسی کد تایید" };
  }
}

export async function completeRegistration(data: { 
  fullName: string; 
  companyName?: string; 
  role: "BUYER" | "SELLER" | "BOTH";
  email?: string;
  countryId?: string;
  provinceId?: string;
  cityId?: string;
  fixNumber?: string;
  address?: string;
  whatsapp?: string;
  wechat?: string;
  telegram?: string;
  photoUrl?: string;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kurur_session")?.value;

    if (!token) {
      return { success: false, error: "شما وارد نشده‌اید" };
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    if (!userId) {
      return { success: false, error: "توکن نامعتبر است" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        companyName: data.companyName || null,
        role: data.role,
        email: data.email || null,
        countryId: data.countryId || null,
        provinceId: data.provinceId || null,
        cityId: data.cityId || null,
        fixNumber: data.fixNumber || null,
        address: data.address || null,
        whatsapp: data.whatsapp || null,
        wechat: data.wechat || null,
        telegram: data.telegram || null,
        photoUrl: data.photoUrl || null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error completing registration:", error);
    return { success: false, error: "خطا در ذخیره اطلاعات" };
  }
}

export async function updateProfile(data: {
  fullName: string;
  companyName?: string;
  email?: string;
  fixNumber?: string;
  address?: string;
  whatsapp?: string;
  wechat?: string;
  telegram?: string;
  photoUrl?: string;
  countryId?: string;
  provinceId?: string;
  cityId?: string;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kurur_session")?.value;

    if (!token) return { success: false, error: "شما وارد نشده‌اید" };

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;

    await prisma.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        companyName: data.companyName || null,
        email: data.email || null,
        fixNumber: data.fixNumber || null,
        address: data.address || null,
        whatsapp: data.whatsapp || null,
        wechat: data.wechat || null,
        telegram: data.telegram || null,
        photoUrl: data.photoUrl || null,
        countryId: data.countryId || undefined,
        provinceId: data.provinceId || null,
        cityId: data.cityId || null,
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Update profile error:", error);
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return { success: false, error: "این ایمیل قبلاً برای کاربر دیگری ثبت شده است. لطفاً از ایمیل دیگری استفاده کنید." };
    }
    return { success: false, error: "خطا در ذخیره اطلاعات" };
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("kurur_session")?.value;
    
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        fullName: true, 
        companyName: true, 
        role: true, 
        phone: true,
        subscriptionType: true,
        subscriptionEnd: true,
      }
    });
    
    return user;
  } catch (error) {
    return null;
  }
}

export async function logout() {
  try {
    (await cookies()).delete("kurur_session");
    return { success: true };
  } catch (error) {
    return { success: false, error: "خطا در خروج" };
  }
}