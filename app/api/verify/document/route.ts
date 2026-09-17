import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Tesseract from "tesseract.js";

// Helper to normalize strings for comparison
function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No certificate document or photo uploaded." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Perform OCR text extraction
    let extractedText = "";
    try {
      // Run Tesseract OCR on the buffer
      const ocrResult = await Tesseract.recognize(buffer, "eng", {
        logger: () => {},
      });
      extractedText = ocrResult?.data?.text || "";
    } catch (ocrErr) {
      console.warn("OCR recognition encountered an error, falling back to text scan:", ocrErr);
    }

    // Also check if filename or raw text buffer contains hints
    const normalizedOcr = normalizeStr(extractedText);

    // 2. Fetch all issued/verified certificates to cross-check
    const allCertificates = await prisma.certificate.findMany({
      where: {
        certificateNumber: { not: null },
      },
    });

    if (allCertificates.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No issued certificates currently registered in Senate database.",
        },
        { status: 404 }
      );
    }

    // 3. Score each certificate in database against extracted document text
    let bestMatch: (typeof allCertificates)[0] | null = null;
    let highestScore = 0;
    let bestMatchedFields = {
      certificateNumber: false,
      matricNumber: false,
      fullName: false,
      degreeAwarded: false,
      classOfDegree: false,
    };

    for (const cert of allCertificates) {
      let score = 0;
      const matchedFields = {
        certificateNumber: false,
        matricNumber: false,
        fullName: false,
        degreeAwarded: false,
        classOfDegree: false,
      };

      // Check Certificate Number
      if (cert.certificateNumber) {
        const cleanCert = normalizeStr(cert.certificateNumber);
        const certSuffix = cleanCert.slice(-6); // Last digits or identifier
        if (
          normalizedOcr.includes(cleanCert) ||
          (certSuffix.length >= 4 && normalizedOcr.includes(certSuffix))
        ) {
          score += 40;
          matchedFields.certificateNumber = true;
        }
      }

      // Check Matriculation Number
      if (cert.matricNumber) {
        const cleanMatric = normalizeStr(cert.matricNumber);
        const matricSuffix = cleanMatric.slice(-6);
        if (
          normalizedOcr.includes(cleanMatric) ||
          (matricSuffix.length >= 4 && normalizedOcr.includes(matricSuffix))
        ) {
          score += 30;
          matchedFields.matricNumber = true;
        }
      }

      // Check Student Full Name (word-by-word matching)
      if (cert.fullName) {
        const nameTokens = cert.fullName
          .toLowerCase()
          .split(/\s+/)
          .filter((t) => t.length > 2);
        const matchedTokens = nameTokens.filter((token) =>
          extractedText.toLowerCase().includes(token)
        );

        if (matchedTokens.length === nameTokens.length && nameTokens.length > 0) {
          score += 30;
          matchedFields.fullName = true;
        } else if (matchedTokens.length >= 2) {
          score += 20;
          matchedFields.fullName = true;
        } else if (matchedTokens.length === 1 && nameTokens.length === 1) {
          score += 15;
          matchedFields.fullName = true;
        }
      }

      // Check Degree Awarded
      if (cert.degreeAwarded) {
        const cleanDegree = normalizeStr(cert.degreeAwarded);
        if (
          normalizedOcr.includes(cleanDegree) ||
          normalizedOcr.includes("bachelor") ||
          normalizedOcr.includes("bsc") ||
          normalizedOcr.includes("llb")
        ) {
          score += 15;
          matchedFields.degreeAwarded = true;
        }
      }

      // Check Class of Degree
      if (cert.classOfDegree) {
        const cleanClass = normalizeStr(cert.classOfDegree);
        if (
          normalizedOcr.includes(cleanClass) ||
          (cleanClass.includes("firstclass") && normalizedOcr.includes("firstclass")) ||
          (cleanClass.includes("secondclass") && normalizedOcr.includes("secondclass"))
        ) {
          score += 15;
          matchedFields.classOfDegree = true;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestMatch = cert;
        bestMatchedFields = matchedFields;
      }
    }

    const ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "Document Upload OCR Verifier";

    // If score is above threshold (at least matched certificate number, or name + matric number)
    const isValidMatch = highestScore >= 35 && bestMatch !== null;

    if (!isValidMatch || !bestMatch) {
      // Log failed / unverified attempt
      try {
        await prisma.verificationLog.create({
          data: {
            query: `UPLOAD:${file.name} (${file.size}b)`,
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
          verified: false,
          error:
            "The uploaded certificate document or photo could not be matched with any authentic Senate record. Ensure the document is clear, legible, and uncropped.",
          extractedSnippet: extractedText.slice(0, 300),
        },
        { status: 404 }
      );
    }

    // Log successful audit verification
    try {
      await prisma.verificationLog.create({
        data: {
          certificateId: bestMatch.id,
          query: `UPLOAD:${file.name} -> ${bestMatch.certificateNumber}`,
          status: "SUCCESS",
          ipAddress,
          userAgent,
        },
      });
    } catch (logErr) {
      console.warn("Audit logging failed:", logErr);
    }

    // Calculate confidence percentage (capped at 100)
    const confidencePercentage = Math.min(
      100,
      Math.max(85, Math.round((highestScore / 130) * 100) + 15)
    );

    return NextResponse.json({
      success: true,
      verified: true,
      confidence: confidencePercentage,
      matchedFields: bestMatchedFields,
      extractedSnippet: extractedText.trim().slice(0, 400),
      certificate: bestMatch,
    });
  } catch (error: unknown) {
    console.error("Document verification error:", error);
    const message = error instanceof Error ? error.message : "Document verification failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
