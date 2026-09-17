import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Format serial number cleanly from certificate number
function formatSerialNumber(certNum: string): string {
  if (certNum.startsWith("NSUK/SR-")) {
    return certNum.replace("NSUK/SR-", "");
  }
  if (certNum.startsWith("NSUK/")) {
    return certNum.replace("NSUK/", "");
  }
  return certNum;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, certificateNumber, matricNumber } = body;

    if (!id && !certificateNumber && !matricNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a certificateNumber, matricNumber, or id to print.",
        },
        { status: 400 }
      );
    }

    // Locate the student certificate record
    let student = null;
    if (id) {
      student = await prisma.certificate.findUnique({ where: { id } });
    }
    if (!student && certificateNumber) {
      student = await prisma.certificate.findUnique({
        where: { certificateNumber: certificateNumber.trim() },
      });
    }
    if (!student && matricNumber) {
      student = await prisma.certificate.findUnique({
        where: { matricNumber: matricNumber.trim().toUpperCase() },
      });
    }

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Official graduate record not found in the Senate registry." },
        { status: 404 }
      );
    }

    if (!student.certificateNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot print: Certificate number has not been generated for this candidate. Please generate certificate first.",
        },
        { status: 400 }
      );
    }

    // Authoritative Audit Log: record print action in VerificationLog
    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "NSUK Senate Admin Printer";

    try {
      await prisma.verificationLog.create({
        data: {
          certificateId: student.id,
          query: student.certificateNumber,
          status: "PRINTED",
          ipAddress,
          userAgent,
        },
      });
    } catch (logErr) {
      console.warn("Could not write print audit log:", logErr);
    }

    // Assemble authoritative printable statement of result data
    const printableData = {
      id: student.id,
      studentName: student.fullName,
      matricNumber: student.matricNumber,
      certificateNumber: student.certificateNumber,
      serialNumber: formatSerialNumber(student.certificateNumber),
      faculty: student.faculty,
      department: student.department,
      degreeType: student.degreeAwarded,
      degreeClass: student.classOfDegree,
      graduationYear: student.graduationYear,
      issueDate: student.dateOfIssue || student.senateApprovalDate || "5th December, 2024",
      senateApprovalDate: student.senateApprovalDate,
      cryptographicHash: student.cryptographicHash,
      qrSignature: student.qrSignature,
      status: student.status,
    };

    return NextResponse.json({
      success: true,
      printableData,
      student,
      message: `Official Statement of Result for ${student.fullName} prepared for printing.`,
    });
  } catch (error: unknown) {
    console.error("Error in print certificate endpoint:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim();
    const certificateNumber = searchParams.get("certificateNumber")?.trim();
    const matricNumber = searchParams.get("matricNumber")?.trim();

    if (!id && !certificateNumber && !matricNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a certificateNumber, matricNumber, or id to print.",
        },
        { status: 400 }
      );
    }

    let student = null;
    if (id) {
      student = await prisma.certificate.findUnique({ where: { id } });
    }
    if (!student && certificateNumber) {
      student = await prisma.certificate.findUnique({
        where: { certificateNumber },
      });
    }
    if (!student && matricNumber) {
      student = await prisma.certificate.findUnique({
        where: { matricNumber: matricNumber.toUpperCase() },
      });
    }

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Official graduate record not found." },
        { status: 404 }
      );
    }

    if (!student.certificateNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Certificate has not been issued yet for this student.",
        },
        { status: 400 }
      );
    }

    const printableData = {
      id: student.id,
      studentName: student.fullName,
      matricNumber: student.matricNumber,
      certificateNumber: student.certificateNumber,
      serialNumber: formatSerialNumber(student.certificateNumber),
      faculty: student.faculty,
      department: student.department,
      degreeType: student.degreeAwarded,
      degreeClass: student.classOfDegree,
      graduationYear: student.graduationYear,
      issueDate: student.dateOfIssue || student.senateApprovalDate || "5th December, 2024",
      senateApprovalDate: student.senateApprovalDate,
      cryptographicHash: student.cryptographicHash,
      qrSignature: student.qrSignature,
      status: student.status,
    };

    return NextResponse.json({
      success: true,
      printableData,
      student,
    });
  } catch (error: unknown) {
    console.error("Error in GET print certificate:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
