import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id).trim();

    if (!cleanId) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid certificate or matriculation number." },
        { status: 400 }
      );
    }

    // Build flexible candidate search variations
    const withSlashes = cleanId.replace(/-/g, "/");
    const withHyphens = cleanId.replace(/\//g, "-");
    const strippedPrefix = cleanId.replace(/^NSUK[\/-](SR[\/-])?/i, "");

    const candidates = Array.from(
      new Set([
        cleanId,
        withSlashes,
        withHyphens,
        `NSUK/SR-${strippedPrefix}`,
        `NSUK/SR/${strippedPrefix}`,
        `NSUK/SR-FT/${strippedPrefix.replace(/^FT[\/-]?/i, "")}`,
        `NSUK/SR/FT/${strippedPrefix.replace(/^FT[\/-]?/i, "")}`,
        strippedPrefix,
      ])
    ).filter(Boolean);

    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          ...candidates.map((c) => ({ certificateNumber: { equals: c, mode: "insensitive" as const } })),
          ...candidates.map((c) => ({ matricNumber: { equals: c, mode: "insensitive" as const } })),
          { certificateNumber: { endsWith: strippedPrefix, mode: "insensitive" } },
          { matricNumber: { endsWith: strippedPrefix, mode: "insensitive" } },
          { fullName: { equals: cleanId, mode: "insensitive" } },
          { id: cleanId },
        ],
      },
    });

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "NSUK Public Verification Portal";

    if (!certificate) {
      // Record failed verification attempt for security analytics
      try {
        await prisma.verificationLog.create({
          data: {
            query: cleanId,
            status: "NOT_FOUND",
            ipAddress,
            userAgent,
          },
        });
      } catch (logErr) {
        console.warn("Audit logging failed:", logErr);
      }

      return NextResponse.json(
        {
          success: false,
          error: `No academic credential matching "${cleanId}" was found in the Senate Central Register.`,
        },
        { status: 404 }
      );
    }

    // Record verified audit log
    try {
      await prisma.verificationLog.create({
        data: {
          certificateId: certificate.id,
          query: certificate.certificateNumber || certificate.matricNumber,
          status: "SUCCESS",
          ipAddress,
          userAgent,
        },
      });
    } catch (logErr) {
      console.warn("Audit logging failed:", logErr);
    }

    return NextResponse.json({
      success: true,
      certificate,
    });
  } catch (error: unknown) {
    console.error("Verification query error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
