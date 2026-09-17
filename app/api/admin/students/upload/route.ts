import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Helper to parse CSV lines taking into account quoted fields with commas
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (insideQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

export async function POST(request: NextRequest) {
  try {
    let csvText = "";

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json(
          { success: false, error: "No CSV file provided in upload request." },
          { status: 400 }
        );
      }
      csvText = await file.text();
    } else if (contentType.includes("application/json")) {
      const body = await request.json();
      if (typeof body.csvText === "string") {
        csvText = body.csvText;
      } else if (Array.isArray(body.students)) {
        // Direct array of students uploaded
        const students = body.students;
        let inserted = 0;
        let updated = 0;

        for (const s of students) {
          if (!s.matricNumber || !s.fullName) continue;

          await prisma.certificate.upsert({
            where: { matricNumber: s.matricNumber.trim() },
            create: {
              matricNumber: s.matricNumber.trim(),
              fullName: s.fullName.trim(),
              faculty: s.faculty?.trim() || "Faculty of Natural & Applied Sciences",
              department: s.department?.trim() || "Academic Registry",
              degreeAwarded: s.degreeAwarded?.trim() || "Bachelor of Science (B.Sc.)",
              classOfDegree: s.classOfDegree?.trim() || "Second Class Honours",
              graduationYear: String(s.graduationYear || new Date().getFullYear()).trim(),
              senateApprovalDate: s.senateApprovalDate?.trim() || null,
              status: "PENDING",
              certificateNumber: null, // Certificate number is NOT set yet
              dateOfIssue: null,
              cryptographicHash: null,
              qrSignature: null,
            },
            update: {
              fullName: s.fullName.trim(),
              faculty: s.faculty?.trim(),
              department: s.department?.trim(),
              degreeAwarded: s.degreeAwarded?.trim(),
              classOfDegree: s.classOfDegree?.trim(),
              graduationYear: String(s.graduationYear || new Date().getFullYear()).trim(),
              senateApprovalDate: s.senateApprovalDate?.trim() || null,
            },
          });
          inserted++;
        }

        return NextResponse.json({
          success: true,
          message: `Successfully processed ${inserted} student records.`,
          count: inserted,
        });
      } else {
        return NextResponse.json(
          { success: false, error: "Invalid JSON body format." },
          { status: 400 }
        );
      }
    } else {
      // Plain text CSV
      csvText = await request.text();
    }

    if (!csvText || !csvText.trim()) {
      return NextResponse.json(
        { success: false, error: "Uploaded CSV file is empty." },
        { status: 400 }
      );
    }

    const lines = csvText
      .split(/\r\n|\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length <= 1) {
      return NextResponse.json(
        { success: false, error: "The CSV file does not contain any student rows." },
        { status: 400 }
      );
    }

    // Parse header
    const rawHeaders = parseCsvLine(lines[0]).map((h) =>
      h.toLowerCase().replace(/[^a-z0-9]/g, "")
    );

    // Map column indices
    const nameIdx = rawHeaders.findIndex(
      (h) => h.includes("fullname") || h.includes("name") || h.includes("student")
    );
    const matricIdx = rawHeaders.findIndex(
      (h) => h.includes("matric") || h.includes("regno") || h.includes("matricnumber")
    );
    const facultyIdx = rawHeaders.findIndex((h) => h.includes("faculty"));
    const deptIdx = rawHeaders.findIndex(
      (h) => h.includes("dept") || h.includes("department")
    );
    const degreeIdx = rawHeaders.findIndex(
      (h) => h.includes("degree") || h.includes("programme") || h.includes("course")
    );
    const classIdx = rawHeaders.findIndex(
      (h) => h.includes("class") || h.includes("grade") || h.includes("division")
    );
    const yearIdx = rawHeaders.findIndex(
      (h) => h.includes("gradyear") || h.includes("graduation") || h.includes("year")
    );
    const senateIdx = rawHeaders.findIndex(
      (h) => h.includes("senate") || h.includes("approval")
    );

    if (nameIdx === -1 || matricIdx === -1) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid CSV format. Missing required 'Full Name' or 'Matric Number' header columns.",
        },
        { status: 400 }
      );
    }

    const createdStudents = [];
    const errors = [];
    let insertedCount = 0;
    let updatedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i]);
      if (row.length === 0 || !row[nameIdx] || !row[matricIdx]) {
        continue;
      }

      const fullName = row[nameIdx];
      const matricNumber = row[matricIdx].toUpperCase();
      const faculty = (facultyIdx !== -1 && row[facultyIdx]) || "Faculty of Natural & Applied Sciences";
      const department = (deptIdx !== -1 && row[deptIdx]) || "Department of Academic Registry";
      const degreeAwarded = (degreeIdx !== -1 && row[degreeIdx]) || "Bachelor of Science (B.Sc.)";
      const classOfDegree = (classIdx !== -1 && row[classIdx]) || "Second Class Honours (Upper Division)";
      const graduationYear = (yearIdx !== -1 && row[yearIdx]) || String(new Date().getFullYear());
      const senateApprovalDate = (senateIdx !== -1 && row[senateIdx]) || null;

      try {
        const existing = await prisma.certificate.findUnique({
          where: { matricNumber },
        });

        if (existing) {
          // If already exists, update demographic records while preserving existing certificateNumber if already issued
          const updated = await prisma.certificate.update({
            where: { matricNumber },
            data: {
              fullName,
              faculty,
              department,
              degreeAwarded,
              classOfDegree,
              graduationYear,
              senateApprovalDate: senateApprovalDate || existing.senateApprovalDate,
            },
          });
          createdStudents.push(updated);
          updatedCount++;
        } else {
          // Create new student without certificate number
          const created = await prisma.certificate.create({
            data: {
              matricNumber,
              fullName,
              faculty,
              department,
              degreeAwarded,
              classOfDegree,
              graduationYear,
              senateApprovalDate,
              status: "PENDING",
              certificateNumber: null, // Certificate number is not on CSV, will be generated later
              dateOfIssue: null,
              cryptographicHash: null,
              qrSignature: null,
            },
          });
          createdStudents.push(created);
          insertedCount++;
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        errors.push(`Row ${i + 1} (${matricNumber}): ${message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${insertedCount + updatedCount} student records (${insertedCount} new, ${updatedCount} updated).`,
      insertedCount,
      updatedCount,
      errors: errors.length > 0 ? errors : undefined,
      students: createdStudents,
    });
  } catch (error: unknown) {
    console.error("Error processing CSV upload:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
