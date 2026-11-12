export interface JobPosition {


  title: string;


  grade: string;


  posts: number;


  salary: string;


  minEducation: string;


  govtFee?: number;
  experience?: string;
}


export interface JobCircular {


  id: string;


  title: string;


  organization: string;


  logo: string;


  category: 'govt' | 'bank' | 'railway' | 'defense' | 'teacher' | 'ngo' | 'private' | 'company' | 'health' | 'engineer' | 'international' | 'overseas';


  categoryLabel: string;


  grade: string;


  totalPosts: number;


  salary: string;


  minEducation: string;


  minAge: number;


  maxAge: number;


  districts: string;


  deadline: string;


  daysRemaining: number;


  govtFee: number;


  serviceFee: number;


  officialLink: string;
  applicationUrl?: string;


  circularImage: string;


  circularPdfUrl?: string;


  circularPages?: string[];


  audioSummary: string;


  featured?: boolean;


  publishedDate: string;


  requirements: string[];


  positions?: JobPosition[];


  feeRange?: string;


  ageCutOffDate?: string;


  smsPrefix?: string;
  smsFormat?: string;


  minCgpa?: number;


  minDivision?: '1st' | '2nd';


  allowThirdDivision?: boolean;


  minFirstDivisionsCount?: number;


  documentsRequired?: string[];


  seoTitle?: string;


  seoDescription?: string;


  seoKeywords?: string[];


  bengaliDescription?: string;


  faqItems?: Array<{ question: string; answer: string }>;


  aiGeneratedAt?: string;


  slug?: string;


  refNo?: string;


  designation?: string;


  eligibility?: string;


  pdfUrl?: string;


  status?: string;


  isHot?: boolean;


  createdAt?: string;


  lastVerifiedAt?: string;


  updatedAt?: string;
  orgType?: string;
  subCategory?: string;
  employmentType?: 'full_time' | 'part_time' | 'contractual' | 'internship' | 'project';
  workArrangement?: 'on_site' | 'hybrid' | 'remote';
  division?: string;
  district?: string;
  upazila?: string;
  salaryType?: 'fixed' | 'range' | 'negotiable' | 'not_disclosed';
  applicationStartDate?: string;
  applicationMethod?: string;
  applicationInstructions?: string;
  selectionProcess?: string;
  experienceYears?: string;
  skills?: string[];
  canonicalUrl?: string;
  robotsDirective?: string;
  ogImage?: string;
  twitterImage?: string;
  verificationStatus?: 'UNVERIFIED' | 'AI_EXTRACTED' | 'MANUAL_ENTERED' | 'MANUAL_CORRECTED' | 'SOURCE_REVIEWED' | 'VERIFIED';
  verificationConfidence?: number;
  verificationNotes?: string;
  verifiedBy?: string;
  revisionHistory?: Array<{
    timestamp: string;
    adminId: string;
    action: string;
    changedFields: string[];
    summary: string;
  }>;
}

export interface EligibilityResult {


  status: 'eligible' | 'not_eligible' | 'need_info' | 'needs_review';


  statusLabel: string;


  reasons: string[];


  ageCalculated?: {


    years: number;


    months: number;


    days: number;


    meetsAge: boolean;


  };


  educationMatch?: {


    matched: boolean;


    required: string;


    provided: string;


  };


  resultMatch?: {


    matched: boolean;


    hasThirdDivision: boolean;


    firstDivisionsCount: number;


    details: string;


  };


  positionsEvaluated?: {


    title: string;


    grade: string;


    posts: number;


    minEducation: string;


    govtFee?: number;


    isEligible: boolean;


    reason: string;


  }[];


  eligiblePositionsCount?: number;


  totalPositionsCount?: number;


}
