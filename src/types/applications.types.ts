import type { EducationRecord } from './user.types';
import type { FinancialSnapshot } from './admin.types';

export interface ApplicationStatusHistoryItem {


  status: 'draft' | 'pending_payment' | 'processing' | 'submitted' | 'fee_paid' | 'completed' | 'admit_issued' | 'rejected';


  date: string;


  notes?: string;


  updatedBy?: string;


}


export interface ApplicationRequest {


  id: string;


  submittedAt?: string;


  jobId: string;


  jobTitle: string;


  organization: string;


  postName: string;


  candidateName: string;


  candidatePhone: string;


  candidateDistrict: string;


  date: string;


  totalAmount: number;


  paymentMethod: 'bKash' | 'Nagad' | 'Wallet';


  trxId?: string;


  status: 'pending_payment' | 'processing' | 'completed' | 'admit_issued' | 'rejected' | 'draft' | 'submitted' | 'fee_paid';


  teleTalkTrackingId?: string;
  teleTalkUserId?: string;


  teleTalkPassword?: string;


  corporateTrackingId?: string;


  submissionChannel?: string;


  applicantCopyPdfUrl?: string;

  admitCardUrl?: string;


  notes?: string;


  statusHistory?: ApplicationStatusHistoryItem[];


  userReportedStatus?: string;


  verificationType?: 'user_reported' | 'admin_verified' | 'officially_verified';


  governmentFee?: number;


  serviceCharge?: number;


  couponDiscount?: number;


  raffleDiscount?: number;


  financialSnapshot?: FinancialSnapshot;


  senderPhone?: string;


  paymentScreenshotUrl?: string;


  walletDeduction?: number;


  cashPaid?: number;


  submittedEducation?: EducationRecord[];


  submittedEducationLevels?: string[];


  createdAt?: string;


  pdfUrl?: string;


  rejectionReason?: string;


  candidateId?: string;


  attachedDocuments?: Array<{


    id: string;


    title: string;


    type?: string;


    url: string;


    uploadDate?: string;


    fileSize?: string;


  }>;


}
