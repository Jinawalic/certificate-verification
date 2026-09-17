import "dotenv/config";
import prisma from "../lib/prisma";
import { hashPassword } from "../lib/auth";

const INITIAL_CERTIFICATES = [
  {
    certificateNumber: "NSUK/SR-FT/2023/2024/2543",
    matricNumber: "NSUK/NAS/CSC/20/0912",
    fullName: "Jinawa Titus Torhile",
    faculty: "Faculty of Natural & Applied Sciences",
    department: "Department of Computer Science",
    degreeAwarded: "B.Sc. (Hons.) Computer Science",
    classOfDegree: "Second Class Upper Division",
    graduationYear: "2024",
    dateOfIssue: "5th December, 2024",
    senateApprovalDate: "28th October 2024",
    status: "VERIFIED",
    cryptographicHash: "7d89ac023f990146e2098b182e04f260389de71b4c3b5d12a6582a93175ef102",
    qrSignature: "NSUK-SEC-SHA256-JINAWATITUS-2024-VALIDATED",
  },
  {
    certificateNumber: "NSUK/SR-FT/2024/2025/1102",
    matricNumber: "NSUK/NAS/CSC/20/1042",
    fullName: "Ibrahim Danladi Musa",
    faculty: "Faculty of Natural & Applied Sciences",
    department: "Department of Computer Science",
    degreeAwarded: "Bachelor of Science (B.Sc.) in Computer Science",
    classOfDegree: "First Class Honours",
    graduationYear: "2024",
    dateOfIssue: "28th October 2024",
    senateApprovalDate: "28th October 2024",
    status: "VERIFIED",
    cryptographicHash: "7d89ac023f990146e2098b182e04f260389de71b4c3b5d12a6582a93175ef102",
    qrSignature: "NSUK-SEC-SHA256-IBRAHIMMUSA-2024-VALIDATED",
  },
  {
    certificateNumber: "NSUK/SR-FT/2024/2025/1103",
    matricNumber: "NSUK/LAW/CIL/19/0312",
    fullName: "Fatima Aliyu Bello",
    faculty: "Faculty of Law",
    department: "Department of Common & Islamic Law",
    degreeAwarded: "Bachelor of Laws (LL.B.)",
    classOfDegree: "Second Class Honours (Upper Division)",
    graduationYear: "2024",
    dateOfIssue: "28th October 2024",
    senateApprovalDate: "28th October 2024",
    status: "VERIFIED",
    cryptographicHash: "9a2f778d91b403487cbb9f182e04f260389de71b4c3b5d12a6582a93175ef320",
    qrSignature: "NSUK-SEC-SHA256-FATIMABELLO-2024-VALIDATED",
  },
  {
    certificateNumber: "NSUK/SR-FT/2024/2025/1104",
    matricNumber: "NSUK/ADM/BUS/20/0541",
    fullName: "Emmanuel Chukwudi Eze",
    faculty: "Faculty of Administration & Business",
    department: "Department of Business Administration",
    degreeAwarded: "Bachelor of Science (B.Sc.) in Business Administration",
    classOfDegree: "Second Class Honours (Upper Division)",
    graduationYear: "2024",
    dateOfIssue: "28th October 2024",
    senateApprovalDate: "28th October 2024",
    status: "VERIFIED",
    cryptographicHash: "f1409d6c49832aa68b2011400e998273b5a176210f88927e1fba734891cc8461",
    qrSignature: "NSUK-SEC-SHA256-EMMANUELEZE-2024-VALIDATED",
  },
  {
    certificateNumber: "NSUK/SR-FT/2024/2025/1105",
    matricNumber: "NSUK/FAS/BCH/20/0819",
    fullName: "Zainab Abubakar Sadiq",
    faculty: "Faculty of Natural & Applied Sciences",
    department: "Department of Biochemistry",
    degreeAwarded: "Bachelor of Science (B.Sc.) in Biochemistry",
    classOfDegree: "First Class Honours",
    graduationYear: "2024",
    dateOfIssue: "28th October 2024",
    senateApprovalDate: "28th October 2024",
    status: "VERIFIED",
    cryptographicHash: "8b7309ea873d6110f0b4d4582f12918e97a3f5509cba11928091dd72605f7781",
    qrSignature: "NSUK-SEC-SHA256-ZAINABSADIQ-2024-VALIDATED",
  },
  {
    certificateNumber: "NSUK/SR-FT/2024/2025/1106",
    matricNumber: "NSUK/ENG/ELE/20/0174",
    fullName: "Abubakar Abdurrahman Muhammad Dan-Kano Al-Hassan",
    faculty: "Faculty of Engineering",
    department: "Department of Electrical & Electronics Engineering",
    degreeAwarded: "Bachelor of Engineering (B.Eng.) in Electrical Engineering",
    classOfDegree: "First Class Honours",
    graduationYear: "2024",
    dateOfIssue: "28th October 2024",
    senateApprovalDate: "28th October 2024",
    status: "VERIFIED",
    cryptographicHash: "4c118744b8989c93883a45c3b9b47e4b5e7d56637e163b27b8bfca73a8712a88",
    qrSignature: "NSUK-SEC-SHA256-ABUBAKARALHASSAN-2024-VALIDATED",
  },
];

async function main() {
  console.log("Seeding authoritative certificates into database...");

  for (const cert of INITIAL_CERTIFICATES) {
    await prisma.certificate.upsert({
      where: { matricNumber: cert.matricNumber },
      update: cert,
      create: cert,
    });
  }

  // Seed default Registry Admin users with hashed password "12345678"
  const adminPassword = "12345678";
  const passwordHash = hashPassword(adminPassword);

  await prisma.adminUser.upsert({
    where: { email: "registrar@nsuk.edu.ng" },
    update: {
      passwordHash,
      isActive: true,
      name: "Registrar Senate Division",
      department: "Senate Academic Records Division",
    },
    create: {
      name: "Registrar Senate Division",
      email: "registrar@nsuk.edu.ng",
      passwordHash,
      role: "REGISTRAR",
      department: "Senate Academic Records Division",
      isActive: true,
    },
  });

  await prisma.adminUser.upsert({
    where: { email: "admin@nsuk.edu.ng" },
    update: {
      passwordHash,
      isActive: true,
      name: "University System Administrator",
      department: "Information & Communication Technology Centre",
    },
    create: {
      name: "University System Administrator",
      email: "admin@nsuk.edu.ng",
      passwordHash,
      role: "SUPER_ADMIN",
      department: "Information & Communication Technology Centre",
      isActive: true,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
