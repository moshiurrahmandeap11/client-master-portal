import type { CandidateDocument } from './documents.types';
import type { JobAlertPreference } from './notifications.types';
export type { CandidateDocument };

export interface EducationRecord {


  id?: string;


  level: string; // 'SSC', 'HSC', 'Diploma', 'Honours', 'Masters'


  degree: string;


  boardOrUni: string;


  roll?: string;


  reg?: string;


  year?: string;


  result?: string;


  majorSubject?: string;


  institutionName?: string;


  academicStatus?: 'COMPLETED' | 'CURRENTLY_STUDYING' | 'RESULT_PENDING' | 'DISCONTINUED';


  expectedPassingYear?: string;


  resultType?: 'GPA' | 'CGPA' | 'DIVISION' | 'CLASS' | 'PERCENTAGE' | 'PASS_FAIL' | 'GRADE';


  scale?: number;


  gpa?: number;


  cgpa?: number;


  divisionOrClass?: string;


  percentage?: number;


  isPrimary?: boolean;


  certificateDocumentId?: string;


  certificateFileUrl?: string;


  certificateFileName?: string;


  verificationStatus?: 'NOT_SUBMITTED' | 'PENDING_REVIEW' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED' | 'NEEDS_CORRECTION' | 'EXPIRED';


  verificationRemarks?: string;


  verifiedAt?: string;


  verifiedBy?: string;


}


export interface ExperienceRecord {


  id: string;


  designation: string;


  organization: string;


  startDate: string;


  endDate: string;


  isCurrent: boolean;


  responsibilities: string;
  company?: string;
  duration?: string;


}


export interface TrainingRecord {
  id: string;
  title: string;
  institute: string;
  duration: string;
  year: string;
  subject?: string;
  credentialUrl?: string;
  certificateDocumentId?: string;
  certificateFileUrl?: string;
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

export interface AddressDetails {


  careOf?: string;


  villageRoad?: string;


  division?: string;


  district?: string;


  upazilaThana?: string;


  postOffice?: string;


  postCode?: string;


}


export interface CandidateProfile {
  id?: string;
  isEmailVerified?: boolean;
  googleId?: string;


  passwordHash?: string;


  presentAddressDetails?: AddressDetails;


  permanentAddressDetails?: AddressDetails;


  sameAsPresentAddress?: boolean;


  name: string;


  nameBn: string;


  fatherName: string;


  motherName: string;


  fatherNameBn?: string;


  motherNameBn?: string;


  fatherNid?: string;


  fatherNidUrl?: string;


  motherNid?: string;


  motherNidUrl?: string;


  nagorikCertificateUrl?: string;


  nidFrontUrl?: string;


  nidBackUrl?: string;
  nidUrl?: string;


  birthCertificateUrl?: string;


  characterCertificateUrl?: string;


  documents?: CandidateDocument[];


  customDocuments?: CandidateDocument[];


  email: string;


  phone: string;


  username?: string;


  dob: string;


  gender: 'male' | 'female';


  nid: string;


  division?: string;


  district: string;


  address: string;


  permanentAddress?: string;


  nationality?: string;


  maritalStatus?: 'single' | 'married' | 'other';
  religion?: string;


  photoUrl: string;


  signatureUrl: string;


  education: EducationRecord[];


  walletBalance: number;


  // Extended Smart Fields


  quota?: 'none' | 'freedom_fighter' | 'disabled' | 'ethnic_minority' | 'ansar';


  quotaCertificateUrl?: string;


  skills?: string[];


  experiences?: ExperienceRecord[];


  trainings?: TrainingRecord[];


  languages?: string[];


  profileCompletionPercentage?: number;


  isVerified?: boolean;


  accountStatus?: 'active' | 'suspended' | 'banned';


  alertPreferences?: JobAlertPreference;


  careerPreferences?: import('./matching.types').CareerPreferences;
  careerObjective?: string;
  professionalSummary?: string;
  currentPosition?: string;
  currentOrganization?: string;
  expectedSalary?: string;
  adminNotes?: Array<{
    id: string;
    authorId: string;
    authorName: string;
    text: string;
    createdAt: string;
  }>;
  adminAuditHistory?: Array<{
    timestamp: string;
    adminId: string;
    action: string;
    changedFields: string[];
    notes: string;
    reason?: string;
  }>;


}
