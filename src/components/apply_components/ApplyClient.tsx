'use client';

import React, { useState, useEffect, useMemo, useRef, useLayoutEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  UserCheck,
  Wallet,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Clock,
  Smartphone,
  Tag,
  X,
  Check,
  Briefcase,
  GraduationCap,
  FolderCheck,
  ExternalLink,
  Camera,
  Edit3,
  Download,
  Info,
  ArrowUpRight,
} from 'lucide-react';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';
import { emptyCandidateProfile } from '@/data/candidateDefaults';
import { fetchWithAuth } from '@/lib/axios';
import { usePlatformSettings, getPlatformContacts } from '@/hooks/usePlatformQueries';
import { storage } from '@/lib/store';
import { FinancialSnapshot, JobPosition, CandidateDocument } from '@/types';

interface ApplyClientProps {
  initialJob: any;
}

type ApplyTab = 'position' | 'profile' | 'media' | 'payment';

const TABS: Array<{ id: ApplyTab; step: string; title: string }> = [
  { id: 'position', step: '১', title: 'পদ নির্বাচন' },
  { id: 'profile', step: '২', title: 'তথ্য ও সনদ' },
  { id: 'media', step: '৩', title: 'ছবি ও স্বাক্ষর' },
  { id: 'payment', step: '৪', title: 'পেমেন্ট ও সাবমিট' },
];

function ApplyFormContent({ initialJob }: ApplyClientProps) {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = (params?.id as string) || initialJob?.id;

  const [job, setJob] = useState<any>(initialJob);
  const [activeTab, setActiveTab] = useState<ApplyTab>('position');

  // Fluid sliding pill indicator for tabs
  const tabContainerRef = useRef<HTMLDivElement>(null);
  const tabBtnRefs = useRef<Map<ApplyTab, HTMLButtonElement>>(new Map());
  const [pillStyle, setPillStyle] = useState({ left: 0, top: 0, width: 0, height: 0, opacity: 0 });
  const [pillReady, setPillReady] = useState(false);

  const updateTabPill = useCallback(() => {
    const btn = tabBtnRefs.current.get(activeTab);
    if (btn) {
      setPillStyle({
        left: btn.offsetLeft,
        top: btn.offsetTop,
        width: btn.offsetWidth,
        height: btn.offsetHeight,
        opacity: 1,
      });
    }
  }, [activeTab]);

  useLayoutEffect(() => {
    updateTabPill();
    const t = setTimeout(() => setPillReady(true), 40);
    return () => clearTimeout(t);
  }, [updateTabPill]);

  useEffect(() => {
    window.addEventListener('resize', updateTabPill);
    return () => window.removeEventListener('resize', updateTabPill);
  }, [updateTabPill]);

  useEffect(() => {
    if (!jobId) return;
    fetch(`/api/jobs/${jobId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && data.job) setJob(data.job);
      })
      .catch(() => {});
  }, [jobId]);

  const positions: JobPosition[] = useMemo(() => {
    return job?.positions && job.positions.length > 0
      ? job.positions
      : [
          {
            title: job?.title || 'আবেদনের পদ',
            grade: job?.grade || '',
            posts: job?.totalPosts || 1,
            salary: job?.salary || '',
            minEducation: job?.minEducation || '',
            govtFee: job?.govtFee ?? 200,
          },
        ];
  }, [job]);

  const initialPositionParam = searchParams.get('position');
  const initialPosition = useMemo(() => {
    if (initialPositionParam) {
      const match = positions.find(
        (p) =>
          p.title.toLowerCase() === initialPositionParam.toLowerCase() ||
          p.title.includes(initialPositionParam),
      );
      if (match) return match;
    }
    return positions[0];
  }, [positions, initialPositionParam]);

  const { data: platformSettings } = usePlatformSettings();
  const platformContacts = getPlatformContacts(platformSettings);

  const [selectedPosition, setSelectedPosition] = useState<JobPosition>(initialPosition);
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Wallet'>('bKash');
  const [trxId, setTrxId] = useState('');
  const [userProfile, setUserProfile] = useState<any>(emptyCandidateProfile);
  const [vaultDocs, setVaultDocs] = useState<CandidateDocument[]>([]);
  const [selectedEduLevels, setSelectedEduLevels] = useState<string[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  const [senderPhone, setSenderPhone] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateDistrict, setCandidateDistrict] = useState('');
  const [useWalletSplit, setUseWalletSplit] = useState(false);
  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState<string | null>(null);
  const [isUploadingScreenshot, setIsUploadingScreenshot] = useState(false);

  // Photo & Signature Resizer Modal
  const [isResizerOpen, setIsResizerOpen] = useState(false);
  const [resizerMode, setResizerMode] = useState<'photo' | 'signature'>('photo');
  const [resizedImage, setResizedImage] = useState<string | null>(null);
  const [resizedDimensions, setResizedDimensions] = useState<{
    width: number;
    height: number;
    sizeKb: number;
  } | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [resizerSuccessMsg, setResizerSuccessMsg] = useState<string | null>(null);

  // Submission & Expiration States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [createdOrderNumber, setCreatedOrderNumber] = useState<string>('');

  const isExpired = Boolean(
    (job && CentralDeadlineEngine.evaluateDeadline(job).isClosed) ||
      job?.status === 'EXPIRED' ||
      job?.status === 'CLOSED' ||
      (job?.deadline && (job.deadline.includes('সমাপ্ত') || job.deadline.includes('শেষ'))),
  );

  // Discount & Coupon State
  const [availableOffers, setAvailableOffers] = useState<{
    coupons: any[];
    raffleCampaign: any | null;
  } | null>(null);
  const [inputCouponCode, setInputCouponCode] = useState('');
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);
  const [appliedSnapshot, setAppliedSnapshot] = useState<FinancialSnapshot | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  useEffect(() => {
    setSelectedPosition(initialPosition);
  }, [initialPosition]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const u = storage.getUser();
    if (u) {
      setUserProfile(u);
      if (u.name) setCandidateName(u.name);
      if (u.phone) setSenderPhone(u.phone);
      if (u.district) setCandidateDistrict(u.district);
      if (Array.isArray(u.education) && u.education.length > 0) {
        setSelectedEduLevels(u.education.map((e: any) => e.level));
      }
    }

    fetchWithAuth('/api/profile', { headers: { 'Cache-Control': 'no-cache' }, cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        const profile = d.user || d.profile;
        if (d.success && profile) {
          setUserProfile(profile);
          if (profile.name) setCandidateName(profile.name);
          if (profile.phone) setSenderPhone(profile.phone);
          if (profile.district) setCandidateDistrict(profile.district);
          if (Array.isArray(profile.education) && profile.education.length > 0) {
            setSelectedEduLevels(profile.education.map((e: any) => e.level));
          }
        }
      })
      .catch(() => {});

    const localDocs = storage.getDocuments();
    setVaultDocs(localDocs);
    if (localDocs.length > 0) setSelectedDocIds(localDocs.map((d) => d.id));

    fetchWithAuth('/api/documents', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.documents) && d.documents.length > 0) {
          setVaultDocs(d.documents);
          setSelectedDocIds(d.documents.map((x: any) => x.id));
        }
      })
      .catch(() => {});
  }, []);

  const baseGovtFee = selectedPosition.govtFee ?? job?.govtFee ?? 200;
  const baseServiceFee = job?.serviceFee ?? 50;
  const effectiveCouponDiscount = appliedSnapshot ? appliedSnapshot.couponDiscount : 0;
  const effectiveRaffleDiscount = appliedSnapshot ? appliedSnapshot.raffleBonusDiscount : 0;
  const totalFee = appliedSnapshot ? appliedSnapshot.totalPayable : baseGovtFee + baseServiceFee;
  const splitWalletAmount = useWalletSplit ? Math.min(userProfile?.walletBalance || 0, totalFee) : 0;
  const netCashAmount = Math.max(0, totalFee - splitWalletAmount);

  const validateDiscounts = async (
    couponToApply: string | null,
    raffleId?: string,
    overrideGovtFee?: number,
  ) => {
    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
      const gFee = overrideGovtFee !== undefined ? overrideGovtFee : baseGovtFee;
      const campaignId =
        raffleId !== undefined ? raffleId : availableOffers?.raffleCampaign?.id || undefined;
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          governmentFee: gFee,
          serviceCharge: baseServiceFee,
          couponCode: couponToApply ? couponToApply.trim().toUpperCase() : undefined,
          raffleCampaignId: campaignId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.valid && data.snapshot) {
        setAppliedSnapshot(data.snapshot);
        if (couponToApply) {
          setAppliedCouponCode(couponToApply.trim().toUpperCase());
          setCouponSuccess(
            `কুপন "${couponToApply.toUpperCase()}" যুক্ত হয়েছে (৳${data.snapshot.couponDiscount} ছাড়)।`,
          );
        }
      } else {
        setCouponError(data.error || 'কুপনটি প্রযোজ্য নয়।');
        if (couponToApply) setAppliedCouponCode(null);
      }
    } catch {
      setCouponError('কুপন যাচাই করা যায়নি।');
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  useEffect(() => {
    fetch('/api/discounts/available')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.success) {
          setAvailableOffers({
            coupons: data.coupons || [],
            raffleCampaign: data.raffleCampaign || null,
          });
          if (data.raffleCampaign) {
            validateDiscounts(null, data.raffleCampaign.id);
          }
        }
      })
      .catch(() => {});
  }, [job?.govtFee, job?.serviceFee]);

  const handleSelectPosition = (pos: JobPosition) => {
    setSelectedPosition(pos);
    const newGovtFee = pos.govtFee ?? job?.govtFee ?? 200;
    validateDiscounts(appliedCouponCode, undefined, newGovtFee);
  };

  const handleApplyCoupon = () => {
    if (!inputCouponCode.trim()) return;
    validateDiscounts(inputCouponCode.trim());
  };

  const handleRemoveCoupon = () => {
    setInputCouponCode('');
    setAppliedCouponCode(null);
    setCouponSuccess(null);
    setCouponError(null);
    if (availableOffers?.raffleCampaign) {
      validateDiscounts(null, availableOffers.raffleCampaign.id);
    } else {
      setAppliedSnapshot(null);
    }
  };

  const handleOpenResizer = (mode: 'photo' | 'signature') => {
    setResizerMode(mode);
    setResizedImage(null);
    setResizedDimensions(null);
    setResizerSuccessMsg(null);
    setIsResizerOpen(true);
  };

  const handleProcessImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setResizerSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const targetWidth = 300;
        const targetHeight = resizerMode === 'photo' ? 300 : 80;
        const maxKb = resizerMode === 'photo' ? 100 : 60;

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

          let quality = 0.92;
          let dataUrl = canvas.toDataURL('image/jpeg', quality);
          let kb = Math.round((dataUrl.length * 3) / 4 / 1024);

          while (kb > maxKb && quality > 0.4) {
            quality -= 0.08;
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            kb = Math.round((dataUrl.length * 3) / 4 / 1024);
          }

          setResizedImage(dataUrl);
          setResizedDimensions({ width: targetWidth, height: targetHeight, sizeKb: kb });
          setIsProcessingImage(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyResizedToProfile = async () => {
    if (!resizedImage) return;
    let finalUrl = resizedImage;
    try {
      const blobRes = await fetch(resizedImage);
      const blob = await blobRes.blob();
      const formData = new FormData();
      formData.append(
        'file',
        blob,
        resizerMode === 'photo' ? 'teletalk_photo_300x300.jpg' : 'teletalk_signature_300x80.jpg',
      );
      formData.append('docType', resizerMode);
      formData.append(
        'docTitle',
        resizerMode === 'photo' ? 'প্রার্থীর পাসপোর্ট ছবি (৩০০×৩০০)' : 'ডিজিটাল স্বাক্ষর (৩০০×৮০)',
      );
      const uploadRes = await fetchWithAuth('/api/candidate/upload-document', {
        method: 'POST',
        body: formData,
      });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json().catch(() => ({}));
        if (uploadData?.fileUrl) finalUrl = uploadData.fileUrl;
      }
    } catch {}

    const user = storage.getUser();
    if (resizerMode === 'photo') {
      setUserProfile((prev: any) => ({ ...prev, photoUrl: finalUrl }));
      user.photoUrl = finalUrl;
      setResizerSuccessMsg('ছবি প্রোফাইলে সংরক্ষণ করা হয়েছে।');
    } else {
      setUserProfile((prev: any) => ({ ...prev, signatureUrl: finalUrl }));
      user.signatureUrl = finalUrl;
      setResizerSuccessMsg('স্বাক্ষর প্রোফাইলে সংরক্ষণ করা হয়েছে।');
    }
    storage.updateUser(user);
    window.dispatchEvent(new Event('cs_user_changed'));

    setTimeout(() => {
      setIsResizerOpen(false);
      setResizerSuccessMsg(null);
    }, 1000);
  };

  const handleDownloadResized = (dataUrl: string | null | undefined, defaultFilename: string) => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = defaultFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleToggleEduLevel = (level: string) => {
    if (selectedEduLevels.includes(level)) {
      if (selectedEduLevels.length === 1) {
        alert('অন্তত একটি শিক্ষাগত সনদ নির্বাচন থাকতে হবে।');
        return;
      }
      setSelectedEduLevels((prev) => prev.filter((l) => l !== level));
    } else {
      setSelectedEduLevels((prev) => [...prev, level]);
    }
  };

  const handleToggleDocId = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((id) => id !== docId) : [...prev, docId],
    );
  };

  const handlePaymentScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingScreenshot(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('docType', 'payment_proof');
      formData.append('docTitle', 'পেমেন্ট স্ক্রিনশট');
      const res = await fetch('/api/candidate/upload-document', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.fileUrl) {
        setPaymentScreenshotUrl(data.fileUrl);
      } else {
        alert(data.error || 'আপলোড ব্যর্থ হয়েছে');
      }
    } catch {
      alert('স্ক্রিনশট আপলোডে সমস্যা হয়েছে');
    } finally {
      setIsUploadingScreenshot(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod !== 'Wallet' && !trxId.trim()) {
      setActiveTab('payment');
      alert('অনুগ্রহ করে ট্রানজ্যাকশন আইডি (TrxID) প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const me = await fetchWithAuth('/api/auth/me', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const meData = await me.json().catch(() => ({}));
      if (!me.ok || !meData.isLoggedIn) {
        router.push(
          '/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search),
        );
        return;
      }

      const res = await fetchWithAuth('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          organization: job.organization,
          postName: `${selectedPosition.title}${selectedPosition.grade ? ` (${selectedPosition.grade})` : ''}`,
          candidateName: candidateName || userProfile?.name || '',
          candidatePhone: senderPhone || userProfile?.phone || '',
          candidateDistrict: candidateDistrict || userProfile?.district || '',
          totalAmount: totalFee,
          paymentMethod,
          trxId: trxId || (paymentMethod === 'Wallet' ? 'WALLET-AUTO-DEBIT' : ''),
          status: 'pending_payment',
          senderPhone,
          paymentScreenshotUrl: paymentScreenshotUrl || undefined,
          walletDeduction:
            paymentMethod === 'Wallet' ? totalFee : useWalletSplit ? splitWalletAmount : 0,
          cashPaid: paymentMethod === 'Wallet' ? 0 : useWalletSplit ? netCashAmount : totalFee,
          governmentFee: baseGovtFee,
          serviceCharge: baseServiceFee,
          couponDiscount: effectiveCouponDiscount,
          raffleDiscount: effectiveRaffleDiscount,
          financialSnapshot: appliedSnapshot || undefined,
          submittedEducation: (userProfile?.education || []).filter((e: any) =>
            selectedEduLevels.includes(e.level),
          ),
          submittedEducationLevels: selectedEduLevels,
          attachedDocuments: vaultDocs
            .filter((d) => selectedDocIds.includes(d.id))
            .map((d) => ({
              id: d.id,
              title: d.title,
              type: d.type,
              url: d.dataUrl || d.fileUrl || (d as any).url || '',
              uploadDate: d.uploadDate,
              fileSize: d.fileSize,
            })),
        }),
      });

      const data = await res.json();
      const app = data.createdApp || data.application || data.data;
      if (res.ok && data.success && app) {
        setCreatedOrderNumber(app.trackingNumber || app.id);
        try {
          storage.addApplication(app);
          if (paymentMethod === 'Wallet' || (useWalletSplit && splitWalletAmount > 0)) {
            const user = storage.getUser();
            user.walletBalance =
              typeof data.walletBalance === 'number'
                ? data.walletBalance
                : Math.max(0, (user.walletBalance || 0) - (app.totalAmount || 0));
            storage.updateUser(user);
            window.dispatchEvent(new Event('cs_wallet_changed'));
            window.dispatchEvent(new Event('cs_user_changed'));
          }
          window.dispatchEvent(new CustomEvent('cs_application_submitted', { detail: app }));
        } catch {}
        setOrderSuccess(true);
      } else {
        alert(data.error || data.message || 'আবেদন জমা দিতে সমস্যা হয়েছে।');
      }
    } catch (err: any) {
      alert('নেটওয়ার্ক সমস্যা: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!job) {
    return (
      <div className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto" />
        <p className="text-slate-600 font-medium text-sm">সার্কুলারের তথ্য লোড হচ্ছে...</p>
      </div>
    );
  }

  const educations: any[] = Array.isArray(userProfile?.education) ? userProfile.education : [];
  const photoPreviewSrc =
    userProfile?.photoUrl && !userProfile.photoUrl.includes('/apply/')
      ? userProfile.photoUrl
      : vaultDocs.find((d) => d.type === 'photo')?.dataUrl ||
        vaultDocs.find((d) => d.type === 'photo')?.fileUrl ||
        '';
  const signaturePreviewSrc =
    userProfile?.signatureUrl && !userProfile.signatureUrl.includes('/apply/')
      ? userProfile.signatureUrl
      : vaultDocs.find((d) => d.type === 'signature')?.dataUrl ||
        vaultDocs.find((d) => d.type === 'signature')?.fileUrl ||
        '';

  const paymentNumber =
    paymentMethod === 'bKash'
      ? platformContacts.bkashNumber || platformContacts.supportPhone
      : platformContacts.nagadNumber || platformContacts.bkashNumber || platformContacts.supportPhone;

  return (
    <div className="bg-slate-50/80 min-h-[calc(100vh-140px)]">
      <div className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Back Link */}
        <Link
          href={`/jobs/${job?.id || jobId}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>সার্কুলার বিবরণে ফিরে যান</span>
        </Link>

        {/* Clean Minimalist Header */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">{job.title}</h1>
            <p className="text-xs text-slate-500">
              {job.organization}
              {job.grade ? ` • ${job.grade}` : ''} • মোট পদ: {job.totalPosts} টি
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
            <div className="text-left md:text-right">
              <span className="text-[11px] text-slate-500 block">সর্বমোট প্রদেয় ফি</span>
              <span className="text-xl font-black font-mono text-slate-900">৳{totalFee}</span>
            </div>
          </div>
        </div>

        {orderSuccess ? (
          /* Success Screen */
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center space-y-5 max-w-2xl mx-auto">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900">আবেদন সফলভাবে জমা হয়েছে</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                অপারেটর যাচাই শেষে আপনার ড্যাশবোর্ডে Applicant Copy (PDF) আপলোড করা হবে।
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl max-w-sm mx-auto text-xs text-slate-700 border border-slate-200 text-left space-y-2">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">ট্র্যাকিং নম্বর</span>
                <span className="font-bold font-mono text-slate-900">{createdOrderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">পদ</span>
                <span className="font-semibold text-slate-900">{selectedPosition.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">মাধ্যম</span>
                <span className="font-semibold text-slate-900">{paymentMethod}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-800">মোট পরিশোধ</span>
                <span className="font-bold text-slate-900 font-mono">৳{totalFee}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <Link
                href="/dashboard/applications"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all"
              >
                <UserCheck className="w-4 h-4" />
                <span>আবেদন ট্র্যাক করুন</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-all"
              >
                <span>ড্যাশবোর্ড</span>
              </Link>
            </div>
          </div>
        ) : isExpired ? (
          /* Expired Notice */
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-slate-900">আবেদনের সময়সীমা শেষ হয়েছে</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                শেষ তারিখ ({job.deadline}) অতিক্রান্ত হওয়ায় নতুন আবেদন গ্রহণ করা যাচ্ছে না।
              </p>
            </div>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl"
            >
              <Briefcase className="w-4 h-4" />
              <span>চলমান চাকরি দেখুন</span>
            </Link>
          </div>
        ) : (
          /* Full-Width 2-Column Tabbed Application Layout */
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT MAIN COLUMN (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Fluid Sliding Tab Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-1.5">
                <div ref={tabContainerRef} className="relative grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  <div
                    aria-hidden="true"
                    style={{
                      left: pillStyle.left,
                      top: pillStyle.top,
                      width: pillStyle.width,
                      height: pillStyle.height,
                      opacity: pillStyle.opacity,
                    }}
                    className={`absolute rounded-xl bg-slate-900 pointer-events-none ${
                      pillReady ? 'transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]' : ''
                    }`}
                  />
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        ref={(el) => {
                          if (el) tabBtnRefs.current.set(tab.id, el);
                        }}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative z-10 px-3 py-2.5 rounded-xl text-left transition-colors duration-200 flex items-center gap-2.5 cursor-pointer ${
                          isActive ? 'text-white' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors duration-200 ${
                            isActive ? 'bg-white/15 text-white' : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {tab.step}
                        </span>
                        <span className="text-xs font-semibold truncate">{tab.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div key={activeTab} className="animate-fluid-tab">

              {/* TAB 1: POSITION SELECTION */}
              {activeTab === 'position' && (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                      কাঙ্ক্ষিত পদ ও গ্রেড নির্বাচন
                    </h2>
                    <span className="text-xs font-medium text-slate-500">
                      {positions.length} টি পদ
                    </span>
                  </div>

                  <div className="space-y-3">
                    {positions.map((pos, idx) => {
                      const isSelected = selectedPosition.title === pos.title;
                      const pGovtFee = pos.govtFee ?? job.govtFee ?? 200;
                      const pTotal = pGovtFee + baseServiceFee;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectPosition(pos)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected
                              ? 'border-slate-900 bg-slate-50/80'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 border ${
                                isSelected
                                  ? 'border-slate-900 bg-slate-900 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </div>
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-sm">{pos.title}</h4>
                                {pos.grade && (
                                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium text-[11px] rounded">
                                    {pos.grade}
                                  </span>
                                )}
                                <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium text-[11px] rounded">
                                  {pos.posts} টি পদ
                                </span>
                              </div>
                              {(pos.minEducation || pos.salary) && (
                                <p className="text-xs text-slate-500 line-clamp-1">
                                  {[pos.minEducation, pos.salary ? `স্কেল: ${pos.salary}` : '']
                                    .filter(Boolean)
                                    .join(' • ')}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                            <div className="text-[11px] text-slate-500">
                              সরকারি ৳{pGovtFee} + সার্ভিস ৳{baseServiceFee}
                            </div>
                            <div className="text-sm font-bold text-slate-900 font-mono">
                              মোট ৳{pTotal}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <span>পরবর্তী: তথ্য ও সনদ</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PROFILE & VAULT DOCUMENTS */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                      প্রার্থীর তথ্য ও ভল্ট সনদ
                    </h2>
                    <Link
                      href="/dashboard/profile"
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline inline-flex items-center gap-1"
                    >
                      <span>প্রোফাইল আপডেট</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {[
                      { label: 'প্রার্থীর নাম (English)', value: userProfile?.name || candidateName },
                      { label: 'পিতার নাম', value: userProfile?.fatherName },
                      { label: 'মাতার নাম', value: userProfile?.motherName },
                      { label: 'মোবাইল নম্বর', value: userProfile?.phone || senderPhone },
                      { label: 'এনআইডি নম্বর', value: userProfile?.nid, mono: true },
                      { label: 'নিজ জেলা', value: userProfile?.district || candidateDistrict },
                    ].map((item, i) => (
                      <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-slate-500 block text-[11px] mb-0.5">{item.label}</span>
                        {item.value ? (
                          <span className={`font-semibold text-slate-900 ${item.mono ? 'font-mono' : ''}`}>
                            {item.value}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">তথ্য যোগ করা নেই</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Educational Qualifications */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
                      <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-slate-600" />
                        শিক্ষাগত যোগ্যতা ({selectedEduLevels.length} টি নির্বাচিত)
                      </span>
                      {educations.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setSelectedEduLevels(educations.map((e: any) => e.level))}
                          className="text-[11px] font-semibold text-slate-700 hover:underline cursor-pointer"
                        >
                          সব নির্বাচন
                        </button>
                      )}
                    </div>

                    {educations.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-xs">
                        কোনো শিক্ষাগত তথ্য নেই।{' '}
                        <Link href="/dashboard/education" className="text-slate-900 font-semibold underline">
                          যুক্ত করুন
                        </Link>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {educations.map((edu: any, idx: number) => {
                          const isChecked = selectedEduLevels.includes(edu.level);
                          return (
                            <div
                              key={idx}
                              onClick={() => handleToggleEduLevel(edu.level)}
                              className={`p-3 flex items-center justify-between gap-3 cursor-pointer ${
                                isChecked ? 'bg-white' : 'bg-slate-50/60 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="w-4 h-4 accent-slate-900 rounded border-slate-300"
                                />
                                <div>
                                  <div className="font-semibold text-slate-900">
                                    {edu.level} — {edu.degree}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {edu.boardOrUni} {edu.roll ? `• রোল: ${edu.roll}` : ''}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right text-[11px]">
                                <div className="font-semibold text-slate-900">{edu.result}</div>
                                <div className="text-slate-400">{edu.year}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Vault Documents */}
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-b border-slate-200">
                      <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <FolderCheck className="w-4 h-4 text-slate-600" />
                        ভল্ট ডকুমেন্ট ({selectedDocIds.length} টি সংযুক্ত)
                      </span>
                      <Link
                        href="/dashboard/vault"
                        className="text-[11px] font-semibold text-slate-700 hover:underline"
                      >
                        + ভল্টে যোগ করুন
                      </Link>
                    </div>

                    {vaultDocs.length === 0 ? (
                      <div className="p-4 text-center text-slate-500 text-xs">
                        ভল্টে কোনো ডকুমেন্ট সংরক্ষিত নেই।
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 max-h-52 overflow-y-auto">
                        {vaultDocs.map((doc) => {
                          const isChecked = selectedDocIds.includes(doc.id);
                          return (
                            <div
                              key={doc.id}
                              onClick={() => handleToggleDocId(doc.id)}
                              className={`p-3 flex items-center justify-between gap-3 cursor-pointer ${
                                isChecked ? 'bg-white' : 'bg-slate-50/60 opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {}}
                                  className="w-4 h-4 accent-slate-900 rounded border-slate-300"
                                />
                                <span className="font-medium text-slate-900 truncate">{doc.title}</span>
                              </div>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                  isChecked
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-500'
                                }`}
                              >
                                {isChecked ? 'সংযুক্ত' : 'বাদ'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('position')}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      ← পূর্ববর্তী
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('media')}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <span>পরবর্তী: ছবি ও স্বাক্ষর</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: PHOTO & SIGNATURE */}
              {activeTab === 'media' && (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-5">
                  <div className="pb-3 border-b border-slate-100">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">ছবি ও ডিজিটাল স্বাক্ষর</h2>
                    <p className="text-xs text-slate-500">
                      টেলিটক মাপ: ছবি ৩০০×৩০০ px (&lt;১০০ KB) এবং স্বাক্ষর ৩০০×৮০ px (&lt;৬০ KB)
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {photoPreviewSrc ? (
                          <img
                            src={photoPreviewSrc}
                            alt="Candidate Photo"
                            className="w-16 h-16 object-cover rounded-xl border border-slate-300 bg-white shrink-0"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 shrink-0">
                            <Camera className="w-6 h-6" />
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-900">পাসপোর্ট ছবি (৩০০×৩০০)</div>
                          <p className="text-[11px] text-slate-500">
                            {photoPreviewSrc ? 'সংযুক্ত আছে' : 'সংযুক্ত নেই'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenResizer('photo')}
                          className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>রিসাইজ ও সেট</span>
                        </button>
                        {photoPreviewSrc && (
                          <button
                            type="button"
                            onClick={() => handleDownloadResized(photoPreviewSrc, 'photo_300x300.jpg')}
                            className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {signaturePreviewSrc ? (
                          <div className="w-24 h-16 flex items-center justify-center bg-white border border-slate-300 rounded-xl p-1 shrink-0">
                            <img
                              src={signaturePreviewSrc}
                              alt="Candidate Signature"
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-16 rounded-xl border border-dashed border-slate-300 bg-white flex items-center justify-center text-slate-400 shrink-0">
                            <Edit3 className="w-5 h-5" />
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-slate-900">ডিজিটাল স্বাক্ষর (৩০০×৮০)</div>
                          <p className="text-[11px] text-slate-500">
                            {signaturePreviewSrc ? 'সংযুক্ত আছে' : 'সংযুক্ত নেই'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenResizer('signature')}
                          className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>রিসাইজ ও সেট</span>
                        </button>
                        {signaturePreviewSrc && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDownloadResized(signaturePreviewSrc, 'signature_300x80.jpg')
                            }
                            className="py-2 px-3 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="text-slate-600">নিজে আবেদন করতে চাইলে রিসাইজকৃত ফাইল ডাউনলোড করে ব্যবহার করুন।</span>
                    <a
                      href={job?.sourceUrl || 'https://alljobs.teletalk.com.bd'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg font-semibold shrink-0"
                    >
                      <span>অফিশিয়াল পোর্টাল</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      ← পূর্ববর্তী
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('payment')}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <span>পরবর্তী: পেমেন্ট</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 4: PAYMENT & CONFIRMATION */}
              {activeTab === 'payment' && (
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 space-y-5">
                  <div className="pb-3 border-b border-slate-100">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900">পেমেন্ট মাধ্যম ও নিশ্চিতকরণ</h2>
                  </div>

                  {/* Coupon Box */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-slate-500" />
                        কুপন কোড (ঐচ্ছিক)
                      </span>
                      {appliedCouponCode && (
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <X className="w-3 h-3" /> মুছুন
                        </button>
                      )}
                    </div>
                    {!appliedCouponCode ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={inputCouponCode}
                          onChange={(e) => setInputCouponCode(e.target.value)}
                          placeholder="কুপন কোড লিখুন"
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono uppercase focus:outline-none focus:ring-2 focus:ring-slate-400"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={isValidatingCoupon || !inputCouponCode.trim()}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs rounded-lg cursor-pointer"
                        >
                          {isValidatingCoupon ? '...' : 'প্রয়োগ'}
                        </button>
                      </div>
                    ) : (
                      <div className="p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 flex justify-between">
                        <span>{appliedCouponCode}</span>
                        <span>-৳{effectiveCouponDiscount}</span>
                      </div>
                    )}
                    {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}
                    {couponSuccess && <p className="text-[11px] text-emerald-700">{couponSuccess}</p>}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      data-testid="payment-method-bkash"
                      onClick={() => setPaymentMethod('bKash')}
                      className={`text-left p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        paymentMethod === 'bKash'
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-pink-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        বিকাশ
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">bKash</div>
                        <div className="text-[11px] text-slate-500">Send Money</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      data-testid="payment-method-nagad"
                      onClick={() => setPaymentMethod('Nagad')}
                      className={`text-left p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                        paymentMethod === 'Nagad'
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-lg bg-orange-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        নগদ
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">Nagad</div>
                        <div className="text-[11px] text-slate-500">Send Money</div>
                      </div>
                    </button>

                    {(() => {
                      const userBal = userProfile?.walletBalance ?? 0;
                      const isInsufficient = userBal < totalFee;
                      return (
                        <button
                          type="button"
                          data-testid="payment-method-wallet"
                          disabled={isInsufficient}
                          onClick={() => setPaymentMethod('Wallet')}
                          className={`text-left p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                            isInsufficient
                              ? 'opacity-60 bg-slate-50 border-slate-200 cursor-not-allowed'
                              : paymentMethod === 'Wallet'
                              ? 'border-slate-900 bg-slate-50 cursor-pointer'
                              : 'border-slate-200 hover:border-slate-300 cursor-pointer'
                          }`}
                        >
                          <div
                            className={`w-9 h-9 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 ${
                              isInsufficient ? 'bg-slate-400 text-white' : 'bg-slate-900 text-white'
                            }`}
                          >
                            <Wallet className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">ওয়ালেট</div>
                            <div
                              className={`text-[11px] font-semibold ${
                                isInsufficient ? 'text-rose-600' : 'text-slate-600'
                              }`}
                            >
                              ৳{userBal} {isInsufficient && '(অপর্যাপ্ত)'}
                            </div>
                          </div>
                        </button>
                      );
                    })()}
                  </div>

                  {/* Payment Inputs */}
                  {paymentMethod !== 'Wallet' ? (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4 text-xs">
                      <div className="flex items-start gap-2 text-slate-700">
                        <Smartphone className="w-4 h-4 text-slate-600 mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-900">
                            {paymentMethod === 'bKash' ? 'বিকাশ নম্বর: ' : 'নগদ নম্বর: '}
                          </span>
                          <strong className="text-slate-900 font-mono text-sm">
                            {paymentNumber || 'অ্যাডমিন সেটিংসে নম্বর যুক্ত নেই'}
                          </strong>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            উক্ত নম্বরে ৳{netCashAmount} Send Money করে নিচের তথ্য দিন।
                          </p>
                        </div>
                      </div>

                      {(userProfile?.walletBalance || 0) > 0 && (
                        <label className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 cursor-pointer">
                          <span className="flex items-center gap-2 font-semibold text-slate-900">
                            <input
                              type="checkbox"
                              checked={useWalletSplit}
                              onChange={(e) => setUseWalletSplit(e.target.checked)}
                              className="w-4 h-4 accent-slate-900 rounded"
                            />
                            ওয়ালেট থেকে ৳{Math.min(userProfile?.walletBalance || 0, totalFee)} ব্যবহার করুন
                          </span>
                          <span className="font-mono font-bold text-slate-900">
                            বাকি: ৳{netCashAmount}
                          </span>
                        </label>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            ট্রানজ্যাকশন আইডি (TrxID) *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="TrxID লিখুন"
                            value={trxId}
                            onChange={(e) => setTrxId(e.target.value.toUpperCase())}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-slate-400"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                            প্রেরক মোবাইল নম্বর *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="01XXXXXXXXX"
                            value={senderPhone}
                            onChange={(e) => setSenderPhone(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-slate-400"
                          />
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                          পেমেন্ট স্ক্রিনশট (ঐচ্ছিক)
                        </label>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,application/pdf"
                          onChange={handlePaymentScreenshotUpload}
                          disabled={isUploadingScreenshot}
                          className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-300 file:text-[11px] file:font-semibold file:bg-white file:text-slate-700 cursor-pointer"
                        />
                        {paymentScreenshotUrl && (
                          <p className="mt-1 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> স্ক্রিনশট সংযুক্ত হয়েছে
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-800">
                      <div className="font-semibold">ওয়ালেট থেকে ৳{totalFee} পরিশোধ করা হবে</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        অবশিষ্ট ব্যালেন্স: ৳{(userProfile?.walletBalance ?? 0) - totalFee}
                      </div>
                    </div>
                  )}

                  {/* Navigation & Submit */}
                  <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('media')}
                      className="w-full sm:w-auto px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
                    >
                      ← পূর্ববর্তী
                    </button>
                    <button
                      type="submit"
                      data-testid="submit-application-btn"
                      disabled={isSubmitting}
                      className="w-full sm:flex-1 py-3 px-6 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>সাবমিট হচ্ছে...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>আবেদন নিশ্চিত করুন (৳{totalFee})</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* RIGHT STICKY SUMMARY SIDEBAR (4 cols) */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
                  আবেদন সারসংক্ষেপ
                </h3>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-500">নির্বাচিত পদ</span>
                    <span className="font-semibold text-slate-900 text-right">
                      {selectedPosition.title}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">সরকারি ফি</span>
                    <span className="font-mono font-semibold text-slate-900">৳{baseGovtFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">সার্ভিস চার্জ</span>
                    <span className="font-mono font-semibold text-slate-900">৳{baseServiceFee}</span>
                  </div>
                  {effectiveCouponDiscount > 0 && (
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>কুপন ছাড় ({appliedCouponCode})</span>
                      <span className="font-mono">-৳{effectiveCouponDiscount}</span>
                    </div>
                  )}
                  {effectiveRaffleDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>বোনাস ছাড়</span>
                      <span className="font-mono">-৳{effectiveRaffleDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t border-slate-100 text-sm">
                    <span className="font-bold text-slate-900">সর্বমোট প্রদেয়</span>
                    <span className="font-black font-mono text-slate-900">৳{totalFee}</span>
                  </div>
                </div>

                {/* Readiness Checklist */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="text-[11px] font-semibold text-slate-500">প্রস্তুতি স্ট্যাটাস</div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">প্রোফাইল তথ্য</span>
                    <span className="font-semibold text-slate-900">
                      {userProfile?.fatherName && userProfile?.nid ? 'সম্পূর্ণ' : 'আংশিক'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">ছবি (৩০০×৩০০)</span>
                    <span className="font-semibold text-slate-900">
                      {photoPreviewSrc ? 'প্রস্তুত' : 'নেই'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">স্বাক্ষর (৩০০×৮০)</span>
                    <span className="font-semibold text-slate-900">
                      {signaturePreviewSrc ? 'প্রস্তুত' : 'নেই'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Interactive Photo & Signature Resizer Modal */}
      {isResizerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {resizerMode === 'photo'
                    ? 'ছবি রিসাইজার (৩০০ × ৩০০ px)'
                    : 'স্বাক্ষর রিসাইজার (৩০০ × ৮০ px)'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  সর্বোচ্চ সাইজ: {resizerMode === 'photo' ? '১০০ KB' : '৬০ KB'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsResizerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resizerSuccessMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{resizerSuccessMsg}</span>
              </div>
            )}

            <div className="border-2 border-dashed border-slate-300 hover:border-slate-500 rounded-xl p-6 text-center bg-slate-50 cursor-pointer relative">
              <input
                data-testid="resizer-file-input"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleProcessImage}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-1 pointer-events-none">
                <div className="text-xs font-semibold text-slate-800">
                  ছবি নির্বাচন করুন (JPG, PNG, WEBP)
                </div>
                <div className="text-[11px] text-slate-500">
                  স্বয়ংক্রিয়ভাবে নির্ধারিত সাইজে রূপান্তর হবে
                </div>
              </div>
            </div>

            {isProcessingImage && (
              <div className="p-4 text-center text-xs text-slate-600">প্রসেস করা হচ্ছে...</div>
            )}

            {resizedImage && resizedDimensions && !isProcessingImage && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 bg-white p-3 rounded-lg border border-slate-200">
                  <img
                    src={resizedImage}
                    alt="Resized Output"
                    style={{
                      width: resizerMode === 'photo' ? '110px' : '190px',
                      height: resizerMode === 'photo' ? '110px' : '50px',
                    }}
                    className="object-contain border border-slate-300 rounded bg-white"
                  />
                  <div className="space-y-1 text-xs text-slate-600">
                    <div>
                      রেজোলিউশন:{' '}
                      <strong className="font-mono text-slate-900">
                        {resizedDimensions.width} × {resizedDimensions.height} px
                      </strong>
                    </div>
                    <div>
                      সাইজ:{' '}
                      <strong className="font-mono text-slate-900">
                        {resizedDimensions.sizeKb} KB
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyResizedToProfile}
                    className="w-full sm:flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>আবেদনে সেট করুন</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadResized(
                        resizedImage,
                        resizerMode === 'photo'
                          ? 'teletalk_photo_300x300.jpg'
                          : 'teletalk_signature_300x80.jpg',
                      )
                    }
                    className="w-full sm:w-auto px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>ডাউনলোড</span>
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> ব্রাউজারেই নিরাপদে প্রসেস হয়
              </span>
              <button
                type="button"
                onClick={() => setIsResizerOpen(false)}
                className="font-semibold text-slate-600 hover:underline cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ApplyClient({ initialJob }: ApplyClientProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 py-16 text-center space-y-3">
          <div className="w-9 h-9 border-4 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600">আবেদন ফরম লোড হচ্ছে...</p>
        </div>
      }
    >
      <ApplyFormContent initialJob={initialJob} />
    </Suspense>
  );
}
