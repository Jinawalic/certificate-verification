/**
 * Official academic certificate interfaces & verification utilities
 * for Nasarawa State University, Keffi
 */

export interface VerifiedCertificate {
  id?: string;
  certificateNumber?: string | null;
  matricNumber: string;
  fullName: string;
  faculty: string;
  department: string;
  degreeAwarded: string;
  classOfDegree: string;
  graduationYear: string;
  dateOfIssue?: string | null;
  senateApprovalDate?: string | null;
  status: "PENDING" | "VERIFIED" | "SUSPENDED" | "REVOKED";
  cryptographicHash?: string | null;
  qrSignature?: string | null;
  studentPhotoUrl?: string | null;
  createdAt?: string | Date;
}

/**
 * Standard normalize function for certificate lookup and URL routing
 */
export function normalizeCertificateId(id: string): string {
  return decodeURIComponent(id)
    .trim()
    .toUpperCase()
    .replace(/\//g, "-")
    .replace(/\s+/g, "");
}
