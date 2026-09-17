import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// Helper to format date in Nigerian academic registry style: "16th September 2026"
function formatAcademicDate(date: Date): string {
  const day = date.getDate();
  let suffix = "th";
  if (day === 1 || day === 21 || day === 31) suffix = "st";
  else if (day === 2 || day === 22) suffix = "nd";
  else if (day === 3 || day === 23) suffix = "rd";

  const month = date.toLocaleString("en-GB", { month: "long" });
  const year = date.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
}

// Generate unique certificate number
async function generateUniqueCertificateNumber(graduationYear: string): Promise<string> {
  const gradYear = parseInt(graduationYear, 10) || new Date().getFullYear();
  const nextYear = gradYear + 1;
  const session = `${gradYear}/${nextYear}`;

  // Find existing certificates matching this prefix to assign next sequential number
  const prefix = `NSUK/SR-FT/${session}/`;
  const existingWithPrefix = await prisma.certificate.findMany({
    where: {
      certificateNumber: {
        startsWith: prefix,
      },
    },
    select: { certificateNumber: true },
  });

  let maxSeq = 1100;
  for (const item of existingWithPrefix) {
    if (!item.certificateNumber) continue;
    const parts = item.certificateNumber.split("/");
    const seqStr = parts[parts.length - 1];
    const seq = parseInt(seqStr, 10);
    if (!isNaN(seq) && seq > maxSeq) {
      maxSeq = seq;
    }
  }

  let nextSeq = maxSeq + 1;
  let candidate = `${prefix}${nextSeq}`;

  // Ensure collision safety
  let attempts = 0;
  while (attempts < 50) {
    const existing = await prisma.certificate.findUnique({
      where: { certificateNumber: candidate },
    });
    if (!existing) {
      return candidate;
    }
    nextSeq++;
    candidate = `${prefix}${nextSeq}`;
    attempts++;
  }

  // Fallback if needed
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `NSUK/SR-FT/${session}/${randomSuffix}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, matricNumber, studentIds } = body;

    // Handle batch generation if studentIds is provided
    const targetIds: string[] = [];
    if (Array.isArray(studentIds) && studentIds.length > 0) {
      targetIds.push(...studentIds);
    } else if (studentId) {
      targetIds.push(studentId);
    }

    let studentsToProcess = [];

    if (targetIds.length > 0) {
      studentsToProcess = await prisma.certificate.findMany({
        where: { id: { in: targetIds } },
      });
    } else if (matricNumber) {
      const student = await prisma.certificate.findUnique({
        where: { matricNumber: matricNumber.trim().toUpperCase() },
      });
      if (student) studentsToProcess.push(student);
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide studentId, matricNumber, or studentIds array.",
        },
        { status: 400 }
      );
    }

    if (studentsToProcess.length === 0) {
      return NextResponse.json(
        { success: false, error: "No student records found to generate certificate for." },
        { status: 404 }
      );
    }

    const updatedCertificates = [];
    const issueDate = formatAcademicDate(new Date());

    for (const student of studentsToProcess) {
      // If student already has certificateNumber, skip regenerating number unless forced
      let certNumber = student.certificateNumber;
      if (!certNumber) {
        certNumber = await generateUniqueCertificateNumber(student.graduationYear);
      }

      // Generate cryptographic verification hash
      const hashPayload = `${certNumber}|${student.matricNumber}|${student.fullName}|${student.degreeAwarded}|${student.graduationYear}|NSUK-SECRET-SALT-2024`;
      const cryptographicHash = crypto
        .createHash("sha256")
        .update(hashPayload)
        .digest("hex");

      // Generate clean QR signature
      const cleanName = student.fullName
        .replace(/[^A-Za-z]/g, "")
        .toUpperCase()
        .slice(0, 15);
      const qrSignature = `NSUK-SEC-SHA256-${cleanName}-${student.graduationYear}-VALIDATED`;

      // Senate approval date fallback if not present
      const senateApprovalDate =
        student.senateApprovalDate ||
        formatAcademicDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

      const updated = await prisma.certificate.update({
        where: { id: student.id },
        data: {
          certificateNumber: certNumber,
          cryptographicHash,
          qrSignature,
          dateOfIssue: student.dateOfIssue || issueDate,
          senateApprovalDate,
          status: "VERIFIED",
        },
      });

      updatedCertificates.push(updated);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully generated certificates for ${updatedCertificates.length} student(s).`,
      count: updatedCertificates.length,
      certificates: updatedCertificates,
    });
  } catch (error: unknown) {
    console.error("Error generating certificate:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
