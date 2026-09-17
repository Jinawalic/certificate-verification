import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, authenticated: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    const payload = verifySessionToken(sessionCookie);
    if (!payload) {
      return NextResponse.json(
        { success: false, authenticated: false, error: "Session expired or invalid" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        department: payload.department,
      },
    });
  } catch (error: unknown) {
    console.error("Auth me check error:", error);
    return NextResponse.json(
      { success: false, authenticated: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
