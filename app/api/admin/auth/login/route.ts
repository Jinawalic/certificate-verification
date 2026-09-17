import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSessionToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please provide both staff email and security passcode." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Look up admin officer in database
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: cleanEmail },
    });

    if (!adminUser || !adminUser.passwordHash) {
      return NextResponse.json(
        { success: false, error: "Invalid officer credentials or account not registered." },
        { status: 401 }
      );
    }

    if (!adminUser.isActive) {
      return NextResponse.json(
        { success: false, error: "Officer account has been deactivated by the Registry." },
        { status: 403 }
      );
    }

    // Verify hashed password
    const isPasswordValid = verifyPassword(password, adminUser.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid security passcode." },
        { status: 401 }
      );
    }

    // Create cryptographic session token
    const token = createSessionToken({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      department: adminUser.department,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        department: adminUser.department,
      },
      message: `Welcome back, ${adminUser.name}. Authentication verified.`,
    });

    // Set secure HTTP-only session cookie
    response.cookies.set({
      name: "admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: unknown) {
    console.error("Login error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
