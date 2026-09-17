import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const faculty = searchParams.get("faculty")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";

    const where: any = {};

    if (faculty && faculty !== "All") {
      where.faculty = faculty;
    }

    if (status && status !== "All") {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { matricNumber: { contains: search, mode: "insensitive" } },
        { certificateNumber: { contains: search, mode: "insensitive" } },
        { department: { contains: search, mode: "insensitive" } },
      ];
    }

    const students = await prisma.certificate.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    const totalCount = await prisma.certificate.count();
    const issuedCount = await prisma.certificate.count({
      where: {
        certificateNumber: { not: null },
      },
    });
    const pendingCount = await prisma.certificate.count({
      where: {
        OR: [
          { certificateNumber: null },
          { status: "PENDING" },
        ],
      },
    });
    const verifiedStatusCount = await prisma.certificate.count({
      where: { status: "VERIFIED" },
    });

    // Calculations for today's verifications
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const verifiedToday = await prisma.verificationLog.count({
      where: {
        verifiedAt: {
          gte: startOfToday,
        },
      },
    });

    const totalPrinted = await prisma.verificationLog.count({
      where: {
        status: "PRINTED",
      },
    });

    return NextResponse.json({
      success: true,
      students,
      stats: {
        total: totalCount,
        issued: issuedCount,
        verified: verifiedStatusCount,
        pending: pendingCount,
        verifiedToday,
        totalPrinted,
      },
    });
  } catch (error: unknown) {
    console.error("Error fetching students:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      originalMatricNumber,
      matricNumber,
      fullName,
      faculty,
      department,
      degreeAwarded,
      classOfDegree,
      graduationYear,
      certificateNumber,
      senateApprovalDate,
      dateOfIssue,
      status,
    } = body;

    if (!matricNumber || !fullName) {
      return NextResponse.json(
        { success: false, error: "Full Name and Matric Number are required fields." },
        { status: 400 }
      );
    }

    // Locate the student record
    let existingStudent = null;
    if (id) {
      existingStudent = await prisma.certificate.findUnique({ where: { id } });
    }
    if (!existingStudent && originalMatricNumber) {
      existingStudent = await prisma.certificate.findUnique({
        where: { matricNumber: originalMatricNumber },
      });
    }
    if (!existingStudent && matricNumber) {
      existingStudent = await prisma.certificate.findUnique({
        where: { matricNumber },
      });
    }

    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: "Student record not found in the official registry." },
        { status: 404 }
      );
    }

    // Check matricNumber uniqueness if changed
    const targetMatric = matricNumber.trim().toUpperCase();
    if (targetMatric !== existingStudent.matricNumber) {
      const duplicateMatric = await prisma.certificate.findUnique({
        where: { matricNumber: targetMatric },
      });
      if (duplicateMatric && duplicateMatric.id !== existingStudent.id) {
        return NextResponse.json(
          { success: false, error: `Matric number '${targetMatric}' is already assigned to another student.` },
          { status: 400 }
        );
      }
    }

    // Check certificateNumber uniqueness if changed
    const targetCertNumber = certificateNumber ? certificateNumber.trim() : null;
    if (targetCertNumber && targetCertNumber !== existingStudent.certificateNumber) {
      const duplicateCert = await prisma.certificate.findUnique({
        where: { certificateNumber: targetCertNumber },
      });
      if (duplicateCert && duplicateCert.id !== existingStudent.id) {
        return NextResponse.json(
          { success: false, error: `Certificate number '${targetCertNumber}' is already registered.` },
          { status: 400 }
        );
      }
    }

    // Recalculate cryptographic seal if certificate number exists
    let cryptographicHash = existingStudent.cryptographicHash;
    let qrSignature = existingStudent.qrSignature;

    if (targetCertNumber) {
      const hashPayload = `${targetCertNumber}|${targetMatric}|${fullName.trim()}|${degreeAwarded || existingStudent.degreeAwarded}|${graduationYear || existingStudent.graduationYear}|NSUK-SECRET-SALT-2024`;
      cryptographicHash = crypto.createHash("sha256").update(hashPayload).digest("hex");
      const cleanName = fullName.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
      qrSignature = `NSUK-SEC-SHA256-${cleanName}-${graduationYear || existingStudent.graduationYear}-VALIDATED`;
    }

    const updated = await prisma.certificate.update({
      where: { id: existingStudent.id },
      data: {
        fullName: fullName.trim(),
        matricNumber: targetMatric,
        faculty: faculty || existingStudent.faculty,
        department: department || existingStudent.department,
        degreeAwarded: degreeAwarded || existingStudent.degreeAwarded,
        classOfDegree: classOfDegree || existingStudent.classOfDegree,
        graduationYear: graduationYear ? String(graduationYear).trim() : existingStudent.graduationYear,
        certificateNumber: targetCertNumber,
        dateOfIssue: dateOfIssue !== undefined ? dateOfIssue : existingStudent.dateOfIssue,
        senateApprovalDate: senateApprovalDate !== undefined ? senateApprovalDate : existingStudent.senateApprovalDate,
        status: status || (targetCertNumber ? "VERIFIED" : "PENDING"),
        cryptographicHash,
        qrSignature,
      },
    });

    return NextResponse.json({
      success: true,
      student: updated,
      message: `Record for ${updated.fullName} updated successfully.`,
    });
  } catch (error: unknown) {
    console.error("Error updating student:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get("id")?.trim() || "";
    let matricNumber = searchParams.get("matricNumber")?.trim() || "";

    // Also check body if not in query params
    if (!id && !matricNumber) {
      try {
        const body = await request.json();
        if (body?.id) id = body.id;
        if (body?.matricNumber) matricNumber = body.matricNumber;
      } catch {
        // Body was empty or not json, continue
      }
    }

    if (!id && !matricNumber) {
      return NextResponse.json(
        { success: false, error: "Please provide student ID or Matric Number to delete." },
        { status: 400 }
      );
    }

    let existingStudent = null;
    if (id) {
      existingStudent = await prisma.certificate.findUnique({ where: { id } });
    }
    if (!existingStudent && matricNumber) {
      existingStudent = await prisma.certificate.findUnique({
        where: { matricNumber: matricNumber.toUpperCase() },
      });
    }

    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: "Student record not found in database." },
        { status: 404 }
      );
    }

    // Delete associated verification audit logs
    await prisma.verificationLog.deleteMany({
      where: { certificateId: existingStudent.id },
    });

    // Delete the certificate
    await prisma.certificate.delete({
      where: { id: existingStudent.id },
    });

    return NextResponse.json({
      success: true,
      message: `Student record for ${existingStudent.fullName} (${existingStudent.matricNumber}) has been permanently deleted.`,
    });
  } catch (error: unknown) {
    console.error("Error deleting student:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
