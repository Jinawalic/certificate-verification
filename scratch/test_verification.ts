import "dotenv/config";
import prisma from "../lib/prisma";

async function runTests() {
  console.log("=== Testing Prisma Verification Lookup ===");

  const testQueries = [
    "NSUK/SR-FT/2023/2024/2543",
    "FT/2023/2024/2543",
    "NSUK/SR/FT/2023/2024/2543",
    "NSUK/NAS/CSC/20/0912",
    "Jinawa Titus Torhile",
    "FT/2024/2025/1102",
    "NON_EXISTENT_12345",
  ];

  for (const q of testQueries) {
    const cleanId = q.trim();
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

    const cert = await prisma.certificate.findFirst({
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

    if (cert) {
      console.log(`✓ Query "${q}" matched student: ${cert.fullName} (${cert.certificateNumber})`);
    } else {
      console.log(`✗ Query "${q}" not found (as expected for unknown queries)`);
    }
  }

  // Also check verification logs
  const logsCount = await prisma.verificationLog.count();
  console.log(`Total verification logs in database: ${logsCount}`);
}

runTests()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
