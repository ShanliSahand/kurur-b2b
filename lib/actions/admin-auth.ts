"use server";

import { prisma } from "@/lib/prisma";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const ADMIN_JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "super-secret-admin-key-change-in-production"
);

export async function loginAdmin(email: string, password: string) {
  try {
    const admin = await prisma.admin.findUnique({ where: { email } });
    
    if (!admin) return { success: false, error: "ایمیل یا رمز عبور اشتباه است" };

    // Compare plaintext password with hashed password in DB
    const isValid = await bcrypt.compare(password, admin.passwordHash);
    
    if (!isValid) return { success: false, error: "ایمیل یا رمز عبور اشتباه است" };

    // Create an Admin JWT token
    const token = await new SignJWT({ adminId: admin.id, role: admin.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("12h") // Admin sessions expire quickly
      .sign(ADMIN_JWT_SECRET);

    // Set a separate admin cookie
    (await cookies()).set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 12 * 60 * 60, // 12 hours
    });

    return { success: true };
  } catch (error) {
    console.error("Admin login error:", error);
    return { success: false, error: "خطا در سیستم" };
  }
}

export async function logoutAdmin() {
  (await cookies()).delete("admin_session");
  return { success: true };
}

export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, ADMIN_JWT_SECRET);
    const adminId = payload.adminId as string;

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
      select: { id: true, email: true, fullName: true, role: true }
    });

    return admin;
  } catch (error) {
    return null;
  }
}