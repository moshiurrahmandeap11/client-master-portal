export interface CandidateDocument {
  id: string;
  type: string;
  title: string;
  fileName: string;
  fileSize: string;
  dimensions?: string;
  uploadDate: string;
  dataUrl?: string;
  fileUrl?: string;
  category?: string;
  isVerified?: boolean;
  verificationStatus?: 'NOT_SUBMITTED' | 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'NEEDS_CORRECTION';
  verificationRemarks?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  checksumSha256?: string;
  mimeType?: string;
  educationRecordId?: string;
  secureUrl?: string;
  version?: number;
  replacedAt?: string;
  previousVersionId?: string;
}
