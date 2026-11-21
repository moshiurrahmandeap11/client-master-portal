'use client';
import { matchJobQuery, matchGradeComprehensive, parseSalaryRange, toBn, toEnDigits } from '@/lib/search-helper';
import { fetchPublicJobs } from '@/services/jobs.service';
import { useQuery } from '@tanstack/react-query';
import { CentralDeadlineEngine } from '@/lib/deadlines/engine';

import { usePlatformContext } from '@/components/shared/layout/ConditionalLayout';
import HeroSection from '@/components/shared/HeroSection';
import JobSearchSection from '@/components/jobs_components/JobSearchSection';
import JobLogo from '@/components/shared/JobLogo';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Sparkles,
  BookOpen,
  Bell,
  Star,
  Briefcase, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  GraduationCap,
  Building2,
  Users,
  Banknote,
  Calendar,
  Filter,
  Flame,
  Award,
  Download,
  PhoneCall,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  FileCheck,
  Zap,
  Play,
  LayoutGrid,
  Landmark,
  Train,
  Stethoscope,
  Wrench,
  HeartHandshake,
  MessageSquare,
  X
} from 'lucide-react';
import { FaStar } from 'react-icons/fa6';
import { JobCircular } from '@/types';

const candidateReviews = [
  {
    id: 1,
    name: "তানভীর আহমেদ",
    role: "সহকারী পরিচালক, বাংলাদেশ ব্যাংক",
    institution: "ঢাকা বিশ্ববিদ্যালয়",
    initials: "তা",
        textInitials: "text-slate-950",
    quote: "আগে সাইবার ক্যাফেতে ৩-৪ ঘণ্টা লাইনে দাঁড়িয়ে ছবি রিসাইজ করা নিয়ে ঝামেলায় পড়তাম। চাকরি সেবায় মাত্র একবার তথ্য সেভ করে রেখেছিলাম, ডেডলাইনের দিন রাতে ১ ক্লিকে রিকোয়েস্ট দিতেই ১৫ মিনিটের মাথায় টেলিটক পেমেন্ট সহ অফিশিয়াল অ্যাপ্লিকেন্ট কপি পেয়ে গেছি!"
  },
  {
    id: 2,
    name: "ফারহানা ইয়াসমিন",
    role: "সহকারী শিক্ষক, DPE নিয়োগ",
    institution: "চট্টগ্রাম",
    initials: "ফা",
        textInitials: "text-white",
    quote: "আমাদের গ্রামের বাড়ি রাঙ্গুনিয়ায় ভালো কম্পিউটার দোকান নেই। মোবাইলেই চাকরি সেবা থেকে প্রাথমিক শিক্ষক নিয়োগে আবেদন করেছি। টিম নিজে থেকেই ৩০০x৩০০ ছবি ও স্বাক্ষর নিখুঁতভাবে রিসাইজ করে সাবমিট করেছে। কোনো ভুল হয়নি।"
  },
  {
    id: 3,
    name: "মাহমুদুল হাসান",
    role: "স্টেশন মাস্টার ও খালাসী আবেদন",
    institution: "রাজশাহী কলেজ",
    initials: "মা",
        textInitials: "text-slate-950",
    quote: "একই সার্কুলারে একাধিক পদে আবেদনের ক্ষেত্রে ফি কীভাবে কাটবে তা নিয়ে সংশয়ে ছিলাম। এখানকার পদভেদে আলাদা ড্রয়ার সিস্টেম ও ক্লিয়ার ফি ব্রেকডাউন দেখে সাথে সাথে নিশ্চিন্তে বুকিং দিয়েছি। বিকাশ পেমেন্টের সাথে সাথেই এসএমএস পেয়েছি।"
  },
  {
    id: 4,
    name: "সাদিয়া আফরিন",
    role: "অফিসার ক্যাশ, সোনালী ব্যাংক",
    institution: "সিলেট",
    initials: "সা",
        textInitials: "text-white",
    quote: "মহিলা চাকরিপ্রার্থীদের জন্য ঘরে বসে নিশ্চিন্তে আবেদন করতে পারা অনেক বড় স্বস্তি। তথ্যের সর্বোচ্চ নিরাপত্তা আর সঠিক সময়ে টেলিটকের ইউজার আইডি ও পাসওয়ার্ড ড্যাশবোর্ডে গুছিয়ে পাওয়ার সুবিধাটা অসাধারণ।"
  },
  {
    id: 5,
    name: "নাজমুল করিম",
    role: "উপ-পরিদর্শক (SI) ও সার্জেন্ট",
    institution: "খুলনা বিশ্ববিদ্যালয়",
    initials: "না",
        textInitials: "text-white",
    quote: "পুলিশের বিশাল ফর্ম পূরণ করতে গিয়ে ক্যাফেওয়ালারা প্রায়ই বানানে ভুল করে। চাকরি সেবার টিম আমার এনআইডি ও সার্টিফিকেটের প্রতিটি অক্ষর মিলিয়ে নিখুঁতভাবে সাবমিট করেছে। অ্যাপ্লিকেন্ট কপি ড্যাশবোর্ডেই পেয়েছি।"
  },
  {
    id: 6,
    name: "নুসরাত জাহান রিয়া",
    role: "উপ-সহকারী কৃষি কর্মকর্তা (DAE)",
    institution: "বরিশাল বিএম কলেজ",
    initials: "নু",
        textInitials: "text-slate-950",
    quote: "ডকুমেন্ট ভল্টে ছবি ও স্বাক্ষর একবার আপলোড করার পর যেকোনো সার্কুলারে আবেদন করা এখন মাত্র কয়েক সেকেন্ডের ব্যাপার! সাইবার ক্যাফের বাড়তি ফি ও হয়রানি থেকে পুরোপুরি মুক্তি পেয়েছি।"
  },
  {
    id: 7,
    name: "আরিফুল ইসলাম",
    role: "ফিল্ড অফিসার, NSI গোয়েন্দা",
    institution: "রংপুর কারমাইকেল কলেজ",
    initials: "আ",
        textInitials: "text-white",
    quote: "এনএসআই সার্কুলারের শেষ দিন সার্ভার ডাউন ছিল, ক্যাফেতে গিয়েও আবেদন করতে পারছিলাম না। চাকরি সেবার ডেডিকেটেড হাই-স্পিড টিম শেষ মুহূর্তেও আমার আবেদন ও ফি পেমেন্ট ১০০% সফল করেছে!"
  },
  {
    id: 8,
    name: "জাহিদুল ইসলাম রিফাত",
    role: "বৈজ্ঞানিক কর্মকর্তা, বারি (BARI)",
    institution: "বাংলাদেশ কৃষি বিশ্ববিদ্যালয়, ময়মনসিংহ",
    initials: "জা",
        textInitials: "text-white",
    quote: "অফিসিয়াল সার্কুলার লিংক ও পদভিত্তিক গ্রেড/বেতনের স্বচ্ছ বিবরণ আমাকে সঠিক পদে আবেদন করতে সাহায্য করেছে। আবেদন শেষে দ্রুত অফিসিয়াল টেলিটক পিডিএফ কপি হাতে পেয়েছি।"
  },
  {
    id: 9,
    name: "মেহজাবিন তাসনিম",
    role: "সহকারী রাজস্ব কর্মকর্তা (ARO), এনবিআর",
    institution: "কুমিল্লা ভিক্টোরিয়া কলেজ",
    initials: "মে",
        textInitials: "text-white",
    quote: "কাস্টমস ও ভ্যাট এক্সাইজ সার্কুলারে দ্রুত ও নিরাপদে আবেদন করতে পেরেছি। পেমেন্ট গেটওয়ে খুবই ফাস্ট এবং কোনো অতিরিক্ত গোপন চার্জ ছিল না। সত্যি নির্ভরযোগ্য সেবা।"
  },
  {
    id: 10,
    name: "ইমরান হোসেন",
    role: "পোস্টাল অপারেটর, ডাক অধিদপ্তর",
    institution: "বগুড়া আজিজুল হক কলেজ",
    initials: "ই",
        textInitials: "text-slate-950",
    quote: "ডাক বিভাগের আবেদনে ৩টি ভিন্ন পদের জন্য আলাদা ফি বুঝতে সমস্যা হচ্ছিল। চাকরি সেবার পদভিত্তিক ফি ড্রয়ার দেখে স্পষ্ট বুঝে আবেদন করেছি। গ্রাহক সেবা টিম সত্যিই প্রশংসনীয়।"
  },
  {
    id: 11,
    name: "আফসানা চৌধুরী",
    role: "এক্সিকিউটিভ অফিসার, পূবালী ব্যাংক",
    institution: "নোয়াখালী বিজ্ঞান ও প্রযুক্তি বিশ্ববিদ্যালয়",
    initials: "আফ",
        textInitials: "text-white",
    quote: "বেসরকারি ও রাষ্ট্রায়ত্ত ব্যাংকের চাকরির বিজ্ঞপ্তি সবার আগে পাওয়া এবং এক জায়গা থেকেই সরাসরি আবেদন কনফার্ম করার সুবিধা দারুণ। আমার সব বন্ধুদের এখন চাকরি সেবা রেকমেন্ড করি।"
  },
  {
    id: 12,
    name: "শাকিল আহমেদ",
    role: "৪৭তম বিসিএস (সাধারণ ক্যাডার)",
    institution: "জাহাঙ্গীরনগর বিশ্ববিদ্যালয়",
    initials: "শা",
        textInitials: "text-white",
    quote: "বিসিএসের বিশাল ক্যাডার পছন্দক্রম তালিকা পূরণ করা অনেক স্পর্শকাতর কাজ। চাকরি সেবার এক্সপার্টরা যত্ন নিয়ে আমার ক্যাডার চয়েস নির্ভুলভাবে এন্ট্রি করে দিয়েছেন। থ্যাঙ্ক ইউ চাকরি সেবা টিম!"
  },
  {
    id: 13,
    name: "মোশাররফ করিম রনি",
    role: "কম্পিউটার অপারেটর, তথ্য কমিশন",
    institution: "পাবনা এডওয়ার্ড কলেজ",
    initials: "মো",
        textInitials: "text-slate-950",
    quote: "আমার টাইপিং টেস্টের সার্টিফিকেট ও এনআইডি ফাইলগুলো ওরা খুব যত্ন সহকারে আপলোড করেছে। কোথাও ভুল থাকলে সাথে সাথে হোয়াটসঅ্যাপে ফোন দিয়ে ক্রসচেক করে নিশ্চিত করেছে।"
  },
  {
    id: 14,
    name: "রোকসানা আক্তার",
    role: "সিনিয়র স্টাফ নার্স, স্বাস্থ্য অধিদপ্তর",
    institution: "ঢাকা নার্সিং কলেজ",
    initials: "রো",
        textInitials: "text-slate-950",
    quote: "ডিউটির কারণে সাইবার ক্যাফেতে যাওয়ার সময় পেতাম না। ডিউটি শেষে রাতে ঘুমানোর আগে মোবাইল থেকে ১ ক্লিকে নার্সিং পদে আবেদন বুকিং দিয়েছি, সকালে উঠে দেখি টেলিটক স্লিপ রেডি!"
  }
];

export default function HomePage() {
  const { homeSections, initialJobs, homeHero } = usePlatformContext();
  const jobsCms = homeSections?.find(s => s.type === 'jobs' || s.id === 'sec-home-jobs');
  const howItWorksCms = homeSections?.find(s => s.type === 'how-it-works' || s.id === 'sec-home-how-it-works');
  const ctaBannerCms = homeSections?.find(s => s.type === 'cta' || s.id === 'sec-home-cta-banner');
  const reviewsCms = homeSections?.find(s => s.type === 'testimonials' || s.id === 'sec-home-reviews');
  const faqCms = homeSections?.find(s => s.type === 'faq' || s.id === 'sec-home-faq');

  const reviewsToDisplay = useMemo(() => {
    const items = reviewsCms?.content?.items;
    if (Array.isArray(items) && items.length > 0) {
            return items.map((item: any, idx: number) => ({
        id: item.id || idx + 1,
        name: item.name || item.title || 'বেনামী চাকরিপ্রার্থী',
        role: item.role || 'সহকারী কর্মকর্তা • সরকারি/ব্যাংক',
        institution: item.institution || item.desc?.slice(0, 30) || 'বাংলাদেশ',
        initials: (item.name || item.title || 'চ')[0] || 'চ',
                textInitials: 'text-white',
        quote: item.quote || item.desc || item.title || 'চাকরি সেবা প্ল্যাটফর্মের মাধ্যমে দ্রুত আবেদন সম্পন্ন করতে পেরেছি।'
      }));
    }
    return candidateReviews;
  }, [reviewsCms]);

  const { data: publicJobs = [] } = useQuery({
    queryKey: ['publicJobs'],
    queryFn: fetchPublicJobs,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [jobsList, setJobsList] = useState<any[]>(initialJobs && initialJobs.length > 0 ? initialJobs : []);

  useEffect(() => {
    if (publicJobs.length > 0) {
      setJobsList(publicJobs);
    }
  }, [publicJobs]);
  const [selectedJobType, setSelectedJobType] = useState('all');
  const [selectedEducation, setSelectedEducation] = useState('all');
  const [selectedOrg, setSelectedOrg] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSalary, setSelectedSalary] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [onlyUrgent, setOnlyUrgent] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'new_today' | 'ongoing' | 'ending_soon' | 'ending_today'>('all');

  const [calcEducation, setCalcEducation] = useState('any');
  const [calcAge, setCalcAge] = useState<number>(26);
  const [matcherActive, setMatcherActive] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const togglePositions = (jobId: string) => {
    setExpandedJobId(prev => prev === jobId ? null : jobId);
  };

  // Pagination state: 3 columns x 3 rows = exactly 9 jobs (3 lines of cards)
  const [currentPage, setCurrentPage] = useState(1);
  const JOBS_PER_PAGE = 9;

  const categoryScrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollCategoryLeft, setCanScrollCategoryLeft] = useState(false);
  const [canScrollCategoryRight, setCanScrollCategoryRight] = useState(true);

  const checkCategoryScroll = () => {
    if (categoryScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
      setCanScrollCategoryLeft(scrollLeft > 10);
      setCanScrollCategoryRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scrollCategory = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      categoryScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (catId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedCategory(catId);
    
    // Reset conflicting search filters so category jobs display cleanly
    if (selectedJobType !== 'all') {
      setSelectedJobType('all');
    }
    if (statusFilter !== 'all') {
      setStatusFilter('all');
    }
    if (onlyUrgent) {
      setOnlyUrgent(false);
    }

    // Auto-scroll the clicked pill into center view smoothly
    const btn = e.currentTarget;
    if (categoryScrollRef.current && btn) {
      const container = categoryScrollRef.current;
      const btnLeft = btn.offsetLeft;
      const btnWidth = btn.offsetWidth;
      const containerWidth = container.clientWidth;
      
      const targetScroll = btnLeft - (containerWidth / 2) + (btnWidth / 2);
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    checkCategoryScroll();
    window.addEventListener('resize', checkCategoryScroll);
    return () => window.removeEventListener('resize', checkCategoryScroll);
  }, []);

  const statusCounts = useMemo(() => {
    let newToday = 0;
    let ongoing = 0;
    let endingSoon = 0;
    let endingToday = 0;

    const isRecentJob = (job: any) => {
      if (job.featured || job.isHot) return true;
      const pub = String(job.publishedDate || '');
      if (pub.includes('আজ')) return true;
      if (job.createdAt) {
        const ageHours = (Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60);
        if (!isNaN(ageHours) && ageHours <= 48) return true;
      }
      return false;
    };

    jobsList.forEach(job => {
      const days = job.daysRemaining ?? 15;
      const isExpired = job.status === 'EXPIRED' || days <= 0 || CentralDeadlineEngine.evaluateDeadline(job).isClosed;
      
      if (!isExpired) {
        ongoing++;
        if (isRecentJob(job)) {
          newToday++;
        }
        if (days > 0 && days <= 7) {
          endingSoon++;
        }
        if (days <= 1) {
          endingToday++;
        }
      }
    });

    return {
      newToday,
      ongoing,
      endingSoon,
      endingToday
    };
  }, [jobsList]);

  const categories = useMemo(() => [
    { id: 'all', label: 'সকল চাকরি', Icon: LayoutGrid, count: jobsList.length },
    { id: 'govt', label: 'সরকারি / বিসিএস', Icon: Landmark, count: jobsList.filter(j => j.category === 'govt' || j.category === 'railway' || j.categoryLabel?.includes('সরকারি') || j.categoryLabel?.includes('বিসিএস')).length },
    { id: 'bank', label: 'ব্যাংক জব', Icon: Banknote, count: jobsList.filter(j => j.category === 'bank' || j.categoryLabel?.includes('ব্যাংক')).length },
    { id: 'teacher', label: 'শিক্ষক নিয়োগ', Icon: GraduationCap, count: jobsList.filter(j => j.category === 'teacher' || j.categoryLabel?.includes('শিক্ষক')).length },
    { id: 'railway', label: 'বাংলাদেশ রেলওয়ে', Icon: Train, count: jobsList.filter(j => j.category === 'railway' || j.categoryLabel?.includes('রেলওয়ে')).length },
    { id: 'defense', label: 'প্রতিরক্ষা ও পুলিশ', Icon: ShieldCheck, count: jobsList.filter(j => j.category === 'defense' || j.categoryLabel?.includes('প্রতিরক্ষা') || j.categoryLabel?.includes('পুলিশ')).length },
    { id: 'health', label: 'স্বাস্থ্য ও চিকিৎসা', Icon: Stethoscope, count: jobsList.filter(j => j.category === 'health' || j.categoryLabel?.includes('স্বাস্থ্য')).length },
    { id: 'engineer', label: 'ইঞ্জিনিয়ারিং ও টেকনিক্যাল', Icon: Wrench, count: jobsList.filter(j => j.category === 'engineer' || j.categoryLabel?.includes('ইঞ্জিনিয়ারিং')).length },
    { id: 'ngo', label: 'এনজিও ও উন্নয়ন সংস্থা', Icon: HeartHandshake, count: jobsList.filter(j => j.category === 'ngo' || j.categoryLabel?.includes('এনজিও')).length },
    { id: 'private', label: 'বেসরকারি ও কর্পোরেট', Icon: Briefcase, count: jobsList.filter(j => j.category === 'private' || j.categoryLabel?.includes('বেসরকারি')).length },
  ], [jobsList]);

  const districtsList = [
    'সকল জেলা', 'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 
    'সিলেট', 'রংপুর', 'ময়মনসিংহ', 'কুমিল্লা', 'বগুড়া', 'নোয়াখালী'
  ];

  const handleSearch = () => {
    const el = document.getElementById('circulars-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedJobType('all');
    setSelectedEducation('all');
    setSelectedOrg('all');
    setSelectedGrade('all');
    setSelectedSalary('all');
    setSelectedCategory('all');
    setSelectedDistrict('all');
    setStatusFilter('all');
    setOnlyUrgent(false);
    setMatcherActive(false);
  };

  const handleSelectStatusFilter = (target: 'new_today' | 'ongoing' | 'ending_soon' | 'ending_today') => {
    // Auto-cancel urgent button so multiple filters are never active together
    setOnlyUrgent(false);
    // If clicked card is already active, toggle off to 'all', otherwise select only this one
    setStatusFilter(prev => prev === target ? 'all' : target);
    document.getElementById('circulars-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleToggleUrgent = () => {
    // Auto-cancel any selected status card so only urgent is active
    setStatusFilter('all');
    setOnlyUrgent(prev => !prev);
    document.getElementById('circulars-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const activeFilterCount = (selectedOrg !== 'all' ? 1 : 0) + 
                            (selectedGrade !== 'all' ? 1 : 0) + 
                            (selectedSalary !== 'all' ? 1 : 0) +
                            (selectedDistrict !== 'all' ? 1 : 0);

  const filteredJobs = useMemo(() => {
    return jobsList.filter((job) => {
      // Category pills filter
      if (selectedCategory !== 'all' && job.category !== selectedCategory) return false;
      
      // Job Type dropdown
      if (selectedJobType !== 'all') {
        const catLabel = job.categoryLabel || '';
        if (selectedJobType === 'govt' && !(job.category === 'govt' || job.category === 'railway' || catLabel.includes('সরকারি') || catLabel.includes('বিসিএস'))) return false;
        if (selectedJobType === 'bank' && !(job.category === 'bank' || catLabel.includes('ব্যাংক'))) return false;
        if (selectedJobType === 'teacher' && !(job.category === 'teacher' || catLabel.includes('শিক্ষক'))) return false;
        if (selectedJobType === 'railway' && !(job.category === 'railway' || catLabel.includes('রেলওয়ে'))) return false;
        if (selectedJobType === 'ngo' && !(job.category === 'ngo' || catLabel.includes('এনজিও'))) return false;
        if (selectedJobType === 'private' && !(job.category === 'private' || catLabel.includes('বেসরকারি'))) return false;
      }

      // Education qualification dropdown
      if (selectedEducation !== 'all') {
        const minEdu = job.minEducation || '';
        if (selectedEducation === 'hsc' && !minEdu.includes('HSC') && !minEdu.includes('উচ্চ মাধ্যমিক') && !minEdu.includes('এইচএসসি')) return false;
        if (selectedEducation === 'graduate' && !minEdu.includes('স্নাতক') && !minEdu.includes('ডিগ্রি') && !minEdu.includes('অনার্স') && !minEdu.includes('Honours')) return false;
        if (selectedEducation === 'postgraduate' && !minEdu.includes('মাস্টার্স') && !minEdu.includes('স্নাতকোত্তর') && !minEdu.includes('Masters')) return false;
      }

      // Organization filter
      if (selectedOrg !== 'all' && !(job.organization || '').includes(selectedOrg)) return false;

      // Grade filter (supports single, range, or composite grade matching)
      if (!matchGradeComprehensive(job.grade, selectedGrade)) return false;

      // Salary range filter (dynamically parsed for all 20 national pay grades)
      if (selectedSalary !== 'all') {
        const { min, max } = parseSalaryRange(job.salary);
        if (selectedSalary === 'under_25k' && (min === 0 || min > 25000)) return false;
        if (selectedSalary === '25k_50k' && (max < 25000 || min > 50000)) return false;
        if (selectedSalary === 'above_35k' && max < 35000) return false;
      }

      // District quota/eligibility filter
      if (selectedDistrict !== 'all') {
        const d = job.districts || '';
        if (d && !d.includes('সকল জেলা') && !d.includes(selectedDistrict)) return false;
      }

      if (onlyUrgent && (job.daysRemaining ?? 15) > 3) return false;

      // Status Metric Card Filtering
      if (statusFilter === 'new_today') {
        const days = job.daysRemaining ?? 15;
        const isExpired = job.status === 'EXPIRED' || days <= 0 || CentralDeadlineEngine.evaluateDeadline(job).isClosed;
        if (isExpired) return false;
        const pub = String(job.publishedDate || '');
        const createdAt = (job as any).createdAt ? new Date((job as any).createdAt).getTime() : 0;
        const within48h = createdAt > 0 && (Date.now() - createdAt) <= 48 * 60 * 60 * 1000;
        const isNew = Boolean(job.featured || job.isHot || pub.includes('আজ') || within48h);
        if (!isNew) return false;
      } else if (statusFilter === 'ongoing') {
        if (job.status === 'EXPIRED' || (job.daysRemaining ?? 15) <= 0 || CentralDeadlineEngine.evaluateDeadline(job).isClosed) return false;
      } else if (statusFilter === 'ending_soon') {
        if (job.daysRemaining === undefined || job.daysRemaining > 7 || job.daysRemaining <= 0 || CentralDeadlineEngine.evaluateDeadline(job).isClosed) return false;
      } else if (statusFilter === 'ending_today') {
        if (job.daysRemaining === undefined || job.daysRemaining > 1 || job.daysRemaining < 0 || CentralDeadlineEngine.evaluateDeadline(job).isClosed) return false;
      }

      // Keyword search input (smart bilingual, multi-field & position-level matching)
      if (searchQuery.trim()) {
        if (!matchJobQuery(job, searchQuery)) return false;
      }

      if (matcherActive) {
        if (calcAge < job.minAge || calcAge > job.maxAge) return false;
        if (calcEducation === 'hsc' && job.minEducation.includes('স্নাতক')) return false;
      }

      return true;
    });
  }, [jobsList, selectedCategory, selectedJobType, selectedEducation, selectedOrg, selectedGrade, selectedSalary, selectedDistrict, onlyUrgent, statusFilter, searchQuery, matcherActive, calcAge, calcEducation]);

  // Reset to first page whenever search or filter criteria change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedJobType, selectedEducation, selectedOrg, selectedGrade, selectedSalary, selectedCategory, selectedDistrict, onlyUrgent, statusFilter]);

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE;
    return filteredJobs.slice(startIndex, startIndex + JOBS_PER_PAGE);
  }, [filteredJobs, currentPage]);

  return (
    <div className="pb-20">
      {/* 2. CHAKRI SHEBA HERO SECTION */}
      <HeroSection initialData={homeHero} />

      {/* MODERN JOB SEARCH SECTION */}
      {(jobsCms?.content?.showSearchBar !== false) && (
        <JobSearchSection 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedJobType={selectedJobType}
          setSelectedJobType={setSelectedJobType}
          selectedEducation={selectedEducation}
          setSelectedEducation={setSelectedEducation}
          selectedOrg={selectedOrg}
          setSelectedOrg={setSelectedOrg}
          selectedGrade={selectedGrade}
          setSelectedGrade={setSelectedGrade}
          selectedSalary={selectedSalary}
          setSelectedSalary={setSelectedSalary}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          districtsList={districtsList}
          onSearch={handleSearch}
          onReset={handleResetFilters}
          onCategoryReset={() => setSelectedCategory('all')}
          activeFilterCount={activeFilterCount}
        />
      )}

      {/* 3. LIVE JOB STATUS DASHBOARD METRICS (4 Clean Cards) */}
      {(jobsCms?.content?.showStatusCards !== false) && (
        <section className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            
            {/* 1. আজ নতুন */}
            <button
              type="button"
              onClick={() => handleSelectStatusFilter('new_today')}
              className={`p-4 sm:p-5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                statusFilter === 'new_today'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200/90 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs sm:text-sm font-normal ${
                  statusFilter === 'new_today' ? 'text-emerald-100' : 'text-slate-600'
                }`}>
                  আজ নতুন
                </span>
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  statusFilter === 'new_today' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700'
                }`}>
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-normal">
                {toBn(statusCounts.newToday)} টি চাকরি
              </div>
            </button>

            {/* 2. আবেদন চলছে */}
            <button
              type="button"
              onClick={() => handleSelectStatusFilter('ongoing')}
              className={`p-4 sm:p-5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                statusFilter === 'ongoing'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200/90 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs sm:text-sm font-normal ${
                  statusFilter === 'ongoing' ? 'text-emerald-100' : 'text-slate-600'
                }`}>
                  আবেদন চলছে
                </span>
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  statusFilter === 'ongoing' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Briefcase className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-normal">
                {toBn(statusCounts.ongoing)} টি চাকরি
              </div>
            </button>

            {/* 3. শেষ হতে চলেছে */}
            <button
              type="button"
              onClick={() => handleSelectStatusFilter('ending_soon')}
              className={`p-4 sm:p-5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                statusFilter === 'ending_soon'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200/90 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs sm:text-sm font-normal ${
                  statusFilter === 'ending_soon' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  শেষ হতে চলেছে
                </span>
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  statusFilter === 'ending_soon' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-normal">
                {toBn(statusCounts.endingSoon)} টি চাকরি
              </div>
            </button>

            {/* 4. আজ শেষ */}
            <button
              type="button"
              onClick={() => handleSelectStatusFilter('ending_today')}
              className={`p-4 sm:p-5 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                statusFilter === 'ending_today'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-200/90 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs sm:text-sm font-normal ${
                  statusFilter === 'ending_today' ? 'text-slate-300' : 'text-slate-600'
                }`}>
                  আজ শেষ
                </span>
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                  statusFilter === 'ending_today' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Flame className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-normal">
                {toBn(statusCounts.endingToday)} টি চাকরি
              </div>
            </button>

          </div>
        </section>
      )}

      <div className="space-y-12 mt-8">
      {/* STEP 07: DYNAMIC JOB FEED DISCOVERY STRIP */}
      <div className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-normal text-sm sm:text-base text-white">তাজা জব ফিড এক্সপ্লোরার</span>
                <span className="bg-emerald-900 text-emerald-200 text-[10px] font-normal px-2 py-0.5 rounded-full uppercase tracking-wider">নতুন</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-normal">সময় ও তারিখ অনুযায়ী চাকরির সার্কুলার ফিল্টার করুন</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Link
              href="/todays-jobs"
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-normal transition-all flex items-center gap-1.5 shadow-xs"
            >
              <Clock className="w-3.5 h-3.5 text-white" />
              <span>আজকের চাকরি</span>
            </Link>

            <Link
              href="/latest-jobs"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-normal transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-slate-300" />
              <span>সর্বশেষ সব চাকরি</span>
            </Link>

            <Link
              href="/featured-jobs"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-normal transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-slate-300" />
              <span>বিশেষ সার্কুলার</span>
            </Link>

            <Link
              href="/closing-soon"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-normal transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>জরুরি ডেডলাইন</span>
            </Link>

            <Link
              href="/daily-jobs"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-normal transition-all border border-slate-700 flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-300" />
              <span>দৈনিক আর্কাইভ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. CIRCULARS SECTION */}
      <section id="circulars-section" className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24 space-y-6">
        
        {/* Section Header - Beautiful Responsive Layout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <h2 className="text-lg sm:text-xl font-normal text-slate-900 tracking-tight">
                {jobsCms?.title || 'সকল চলমান চাকরির সার্কুলার'}
              </h2>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-normal px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>{toBn(filteredJobs.length)}টি সক্রিয়</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal">
              {jobsCms?.subtitle || 'যেকোনো বিজ্ঞপ্তিতে ১-ক্লিকেই আমাদের প্রফেশনাল টিম দিয়ে আবেদন সম্পন্ন করতে পারবেন।'}
            </p>
          </div>

          {/* Quick Urgency Toggle */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleToggleUrgent}
              className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs sm:text-sm font-normal transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                onlyUrgent 
                  ? 'bg-emerald-700 text-white shadow-xs' 
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${onlyUrgent ? 'text-white' : 'text-emerald-700'}`} />
              <span>জরুরি ডেডলাইন (৩ দিনের মধ্যে শেষ)</span>
            </button>
          </div>
        </div>

        {/* 6. ELIGIBILITY & AGE MATCHER TOOL CARD */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-[15px] sm:text-[16px] text-slate-900">
                    বয়স ও শিক্ষাগত যোগ্যতা ম্যাচিং টুল
                  </h3>
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-black px-2 py-0.5 rounded-full uppercase">
                    ক্যালকুলেটর
                  </span>
                </div>
                <p className="text-[12px] sm:text-[13px] text-slate-500">
                  আপনার বর্তমান বয়স ও সনদ অনুযায়ী আপনি কোন কোন বিজ্ঞপ্তিতে আবেদনের যোগ্য তা নিমেষেই দেখুন
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMatcherActive(!matcherActive)}
                className={`px-3.5 py-2 rounded-xl text-[13px] sm:text-[14px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  matcherActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white border border-slate-300 text-slate-700 hover:border-emerald-500 hover:text-emerald-700'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{matcherActive ? 'ফিল্টার সক্রিয় (বন্ধ করুন)' : 'যোগ্যতা ফিল্টার চালু করুন'}</span>
              </button>
            </div>
          </div>

          {matcherActive && (
            <div className="mt-4 pt-3.5 border-t border-emerald-100 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center animate-in fade-in duration-200">
              <div className="md:col-span-6 space-y-1.5">
                <div className="flex items-center justify-between text-[13px] font-bold text-slate-700">
                  <span>আপনার বর্তমান বয়স:</span>
                  <span className="text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg font-black text-[14px]">
                    {toBn(calcAge)} বছর
                  </span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={40}
                  value={calcAge}
                  onChange={(e) => setCalcAge(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                  <span>১৮ বছর</span>
                  <span>৩০ বছর (সাধারণ)</span>
                  <span>৩২ বছর (কোটা)</span>
                  <span>৪০ বছর</span>
                </div>
              </div>

              <div className="md:col-span-6 space-y-1.5">
                <label className="block text-[13px] font-bold text-slate-700">
                  সর্বোচ্চ শিক্ষাগত সনদ:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'any', label: 'যেকোনো' },
                    { id: 'hsc', label: 'এইচএসসি' },
                    { id: 'graduate', label: 'স্নাতক+' }
                  ].map((edu) => (
                    <button
                      key={edu.id}
                      type="button"
                      onClick={() => setCalcEducation(edu.id)}
                      className={`py-2 px-2.5 rounded-xl text-[13px] font-bold text-center transition-all cursor-pointer ${
                        calcEducation === edu.id
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {edu.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        

        {/* Category Pills with Perfectly Centered Left & Right Arrow Buttons */}
        {(jobsCms?.content?.showCategoryFilter !== false) && (
          <div className="relative flex items-center my-3 group">
          {/* Left Arrow Button (Vertically Centered with top-1/2 -translate-y-1/2) */}
          {canScrollCategoryLeft && (
            <button
              type="button"
              onClick={() => scrollCategory('left')}
              aria-label="পূর্ববর্তী ক্যাটাগরি"
              className="absolute -left-1 sm:-left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
          )}

          {/* Scrollable Track (Symmetrical py-1.5) */}
          <div
            ref={categoryScrollRef}
            onScroll={checkCategoryScroll}
            className="flex items-center gap-2 overflow-x-auto py-1.5 scrollbar-none whitespace-nowrap scroll-smooth w-full px-1"
          >
            {categories.map((cat) => {
              const IconComp = cat.Icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={(e) => handleCategoryClick(cat.id, e)}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-normal whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-emerald-800'
                  }`}
                >
                  <IconComp className={`w-3.5 h-3.5 flex-shrink-0 transition-colors ${
                    isSelected ? 'text-white' : 'text-emerald-700'
                  }`} />
                  <span>{cat.label} ({cat.count})</span>
                </button>
              );
            })}
          </div>

          {/* Right Arrow Button (Vertically Centered with top-1/2 -translate-y-1/2) */}
          {canScrollCategoryRight && (
            <button
              type="button"
              onClick={() => scrollCategory('right')}
              aria-label="পরবর্তী ক্যাটাগরি"
              className="absolute -right-1 sm:-right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white shadow-md border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          )}
        </div>
        )}

        {/* Circular Cards Grid */}
        {filteredJobs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedJobs.map((job) => {
              const isExpired = Boolean(
                CentralDeadlineEngine.evaluateDeadline(job).isClosed ||
                (job as any).status === 'EXPIRED' || 
                (job as any).status === 'CLOSED' ||
                (job.deadline && (job.deadline.includes('সমাপ্ত') || job.deadline.includes('শেষ')))
              );
              const isUrgent = !isExpired && job.daysRemaining <= 3;

              return (
                <div 
                  key={job.id} 
                  className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-950/5 transition-all duration-300 p-6 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Top Badge */}
                  {job.featured && (
                    <div className="absolute top-0 right-0 bg-emerald-700 text-white text-xs font-normal px-3 py-0.5 rounded-bl-xl shadow-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>হট সার্কুলার</span>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Badges Bar */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-emerald-50 text-emerald-800 text-xs font-normal px-2.5 py-1 rounded-md border border-emerald-200">
                        {job.categoryLabel || (job as any).category?.titleBn || 'সরকারি'}
                      </span>
                      {job.positions && job.positions.length > 1 ? (
                        <span className="bg-slate-100 text-slate-800 text-xs font-normal px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1">
                          <Layers className="w-3.5 h-3.5 text-slate-600" />
                          <span>{job.positions.length}টি ভিন্ন পদ {job.grade || job.positions?.[0]?.grade ? `(${job.grade || job.positions?.[0]?.grade})` : ''}</span>
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-800 text-xs font-normal px-2.5 py-1 rounded-md border border-slate-200">
                          {job.grade || job.positions?.[0]?.grade || 'সরকারি গ্রেড'}
                        </span>
                      )}
                      <span className="bg-slate-100 text-slate-800 text-xs font-normal px-2.5 py-1 rounded-md border border-slate-200 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-600" />
                        {(job as any).totalPositions || job.totalPosts || 1} টি পদ
                      </span>
                      <span className={`text-xs font-normal px-2.5 py-1 rounded-md flex items-center gap-1 ml-auto ${
                        isUrgent ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        {job.daysRemaining ?? Math.max(0, Math.ceil((new Date(job.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} দিন বাকি
                      </span>
                    </div>

                    {/* Org & Title */}
                    <div>
                      <p className="text-[15px] font-semibold text-emerald-700 flex items-center gap-2 mb-1.5">
                        <JobLogo logo={job.logo} organization={job.organization} size="sm" />
                        <span className="truncate">{job.organization}</span>
                      </p>
                      <Link href={`/jobs/${job.id}`} className="group-hover:text-emerald-700 transition-colors">
                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {job.title}
                        </h3>
                      </Link>
                    </div>

                    {/* Summary Card */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2 text-[15px] text-slate-700">
                      <div className="flex items-start gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800">যোগ্যতা: </span>
                          <span className="text-slate-600">{job.minEducation || (job as any).eligibility?.education || job.positions?.[0]?.minEducation || 'বিজ্ঞপ্তি অনুসারে'}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Banknote className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <div>
                          <span className="font-bold text-slate-800">বেতন: </span>
                          <span className="text-slate-600">{job.salary || job.positions?.[0]?.salary || 'জাতীয় পে স্কেল অনুযায়ী'}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-200 text-[14px] flex items-center justify-between gap-1 flex-wrap">
                        <span className="text-slate-500 whitespace-nowrap">শেষ তারিখ: <strong className="text-slate-800 font-bold">{job.deadlineFormatted || (job.deadline ? new Date(job.deadline).toISOString().split('T')[0] : job.deadline)}</strong></span>
                        <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 whitespace-nowrap">
                          {job.feeRange ? (
                            <span>ফি: {job.feeRange} + ৳{job.serviceFee || 50}</span>
                          ) : (
                            <span>ফি: ৳{job.govtFee || (job as any).officialFee || 200} + ৳{job.serviceFee || 50}</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Multi-Position Collapsible Drawer (Option 1) */}
                    {job.positions && job.positions.length > 1 && (
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden transition-all duration-300 shadow-xs">
                        <button
                          type="button"
                          onClick={() => togglePositions(job.id)}
                          className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer group/toggle"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center flex-shrink-0">
                              <Layers className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-[15px] font-bold text-slate-800 group-hover/toggle:text-emerald-800 transition-colors">
                              পদসমূহের তালিকা ও গ্রেড ({job.positions.length}টি পদ)
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-[13px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex-shrink-0">
                            {expandedJobId === job.id ? (
                              <>
                                <span>লুকান</span>
                                <ChevronUp className="w-3.5 h-3.5" />
                              </>
                            ) : (
                              <>
                                <span>দেখুন</span>
                                <ChevronDown className="w-3.5 h-3.5" />
                              </>
                            )}
                          </span>
                        </button>

                        {expandedJobId === job.id && (
                          <div className="px-3.5 pb-3 pt-1 border-t border-slate-200 space-y-2 animate-in fade-in duration-200">
                            <div className="space-y-2 divide-y divide-slate-100">
                              {job.positions.map((pos: any, pIdx: number) => (
                                <div key={pIdx} className="pt-3 pb-1.5 first:pt-0 space-y-1.5">
                                  {/* Position Title & Post Count Badge */}
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[15px] font-bold text-slate-900 leading-snug">
                                      {pIdx + 1}. {pos.title}
                                    </span>
                                    <span className="bg-emerald-100 text-emerald-800 text-[13px] font-bold px-2.5 py-0.5 rounded-lg border border-emerald-200 whitespace-nowrap flex-shrink-0">
                                      {pos.posts} টি পদ
                                    </span>
                                  </div>

                                  {/* Badges: Grade, Salary Scale & Specific Fee */}
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-slate-800 font-semibold bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[13px]">
                                      {pos.grade} • {pos.salary}
                                    </span>
                                    {pos.govtFee && (
                                      <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md text-[13px]">
                                        সরকারি ফি: ৳{pos.govtFee}
                                      </span>
                                    )}
                                  </div>

                                  {/* Full Educational Qualification (No truncation, 100% visible) */}
                                  <div className="text-[13px] bg-white p-2 rounded-xl border border-slate-200 flex items-start gap-1.5">
                                    <span className="font-bold text-slate-800 flex-shrink-0 inline-flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-emerald-700" /> যোগ্যতা:</span>
                                    <span className="text-slate-600 leading-relaxed font-medium">
                                      {pos.minEducation}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Position Accordion (if exists) */}

                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-100 mt-4">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="px-3 py-2 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-50 font-normal text-xs sm:text-sm text-center transition-colors"
                    >
                      সার্কুলার নোটিশ
                    </Link>
                    {isExpired ? (
                      <div className="px-3 py-2 rounded-xl bg-slate-100 text-slate-500 font-normal text-xs sm:text-sm text-center border border-slate-200 flex items-center justify-center gap-1.5 cursor-not-allowed select-none">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>সময় শেষ</span>
                      </div>
                    ) : (
                      <Link
                        href={`/apply/${job.id}`}
                        className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-normal text-xs sm:text-sm text-center shadow-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <span>আবেদন করুন</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        {/* Pagination Bar: Modern, Responsive & Pixel-Perfect */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-6 border-t border-slate-200 w-full">
            {/* Information Count */}
            <p className="text-[14px] sm:text-[16px] text-slate-600 font-medium text-center sm:text-left">
              মোট <strong className="text-emerald-800 font-bold">{toBn(filteredJobs.length)}টি</strong> সার্কুলারের মধ্যে{' '}
              <strong className="text-slate-900 font-bold">
                {toBn((currentPage - 1) * JOBS_PER_PAGE + 1)} - {toBn(Math.min(currentPage * JOBS_PER_PAGE, filteredJobs.length))}
              </strong>{' '}
              দেখাচ্ছে (পেজ {toBn(currentPage)}/{toBn(totalPages)})
            </p>

            {/* Pagination Controls Island */}
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 bg-slate-50/90 p-1.5 rounded-2xl border border-slate-200/90 shadow-xs">
              {/* Previous Page Button */}
              <button
                type="button"
                onClick={() => {
                  if (currentPage > 1) {
                    setCurrentPage(prev => prev - 1);
                    document.getElementById('circulars-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                disabled={currentPage === 1}
                aria-label="পূর্ববর্তী পেজ"
                className={`h-8 w-8 sm:h-10 sm:w-auto sm:px-3.5 rounded-xl font-bold text-[14px] sm:text-[16px] transition-all flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer ${
                  currentPage === 1
                    ? 'bg-slate-100 text-slate-300 border border-slate-200/60 cursor-not-allowed'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 shadow-xs'
                }`}
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">পূর্ববর্তী</span>
              </button>

              {/* Numbered Page Buttons */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                {(() => {
                  let pages: (number | string)[] = [];
                  if (totalPages <= 7) {
                    pages = Array.from({ length: totalPages }, (_, i) => i + 1);
                  } else if (currentPage <= 4) {
                    pages = [1, 2, 3, 4, 5, 'dots', totalPages];
                  } else if (currentPage >= totalPages - 3) {
                    pages = [1, 'dots', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
                  } else {
                    pages = [1, 'dots-l', currentPage - 1, currentPage, currentPage + 1, 'dots-r', totalPages];
                  }

                  return pages.map((item, idx) => {
                    if (typeof item === 'string') {
                      return (
                        <span
                          key={`dots-${idx}`}
                          className="w-6 sm:w-8 h-8 sm:h-10 flex items-center justify-center text-slate-400 font-bold text-xs sm:text-sm select-none"
                        >
                          •••
                        </span>
                      );
                    }
                    const isCurrent = currentPage === item;
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => {
                          setCurrentPage(item);
                          document.getElementById('circulars-section')?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl font-bold text-[14px] sm:text-[16px] transition-all flex items-center justify-center flex-shrink-0 cursor-pointer ${
                          isCurrent
                            ? 'bg-emerald-700 text-white shadow-xs scale-[1.03]'
                            : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-emerald-50/60 hover:text-emerald-800 hover:border-emerald-200 shadow-2xs'
                        }`}
                      >
                        {toBn(item)}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Next Page Button */}
              <button
                type="button"
                onClick={() => {
                  if (currentPage < totalPages) {
                    setCurrentPage(prev => prev + 1);
                    document.getElementById('circulars-section')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                disabled={currentPage === totalPages}
                aria-label="পরবর্তী পেজ"
                className={`h-8 w-8 sm:h-10 sm:w-auto sm:px-3.5 rounded-xl font-bold text-[14px] sm:text-[16px] transition-all flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer ${
                  currentPage === totalPages
                    ? 'bg-slate-100 text-slate-300 border border-slate-200/60 cursor-not-allowed'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
                }`}
              >
                <span className="hidden sm:inline">পরবর্তী</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
          </>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">কোনো সার্কুলার খুঁজে পাওয়া যায়নি</h3>
            <p className="text-[16px] text-slate-600">আপনার ফিল্টার শর্ত পরিবর্তন করে আবার চেষ্টা করুন।</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); setSelectedDistrict('all'); setOnlyUrgent(false); setMatcherActive(false); }}
              className="px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl"
            >
              সকল সার্কুলার দেখুন
            </button>
          </div>
        )}

      </section>

      {/* 5. HOW OUR JOB APPLICATION SERVICE WORKS */}
      {(howItWorksCms?.isVisible !== false) && (
        <section 
          id="how-it-works" 
          style={{
            backgroundColor: howItWorksCms?.style?.backgroundColor || undefined,
            backgroundImage: howItWorksCms?.style?.backgroundColor ? 'none' : undefined,
            color: howItWorksCms?.style?.textColor || undefined
          }}
          className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 scroll-mt-24"
        >
          <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
            <span className="text-xs font-normal uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              {howItWorksCms?.content?.badge || 'সহজ ৩ ধাপের প্রক্রিয়া'}
            </span>
            <h2 className="text-lg sm:text-2xl font-normal text-slate-900">
              {howItWorksCms?.title || 'কীভাবে ঘরে বসেই নির্ভুল চাকরি আবেদন করবেন?'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-normal">
              {howItWorksCms?.subtitle || 'সাইবার ক্যাফেতে ঘণ্টার পর ঘণ্টা বসে থাকার ঝামেলা শেষ! আপনার সুবিধার্থে আধুনিক স্মার্ট সিস্টেম:'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {(howItWorksCms?.content?.items && howItWorksCms.content.items.length > 0 ? howItWorksCms.content.items : [
              {
                step: 1,
                title: '১ বার ডকুমেন্ট ভল্টে সেভ রাখুন',
                desc: 'আপনার পাসপোর্ট ছবি, স্বাক্ষর, এনআইডি এবং শিক্ষাগত সনদের তথ্য মাত্র একবার আপলোড করুন। আমাদের সিস্টেম নিজে থেকেই ৩০০x৩০০ ও ৩০০x৮০ পিক্সেল সাইজে কনভার্ট করে রাখবে।'
              },
              {
                step: 2,
                title: 'পছন্দের জবে আবেদন বুকিং দিন',
                desc: 'যেকোনো সরকারি বা ব্যাংক বিজ্ঞপ্তির নিচে আবেদন করুন চাপুন। বিকাশ/নগদে সরকারি ফি ও সামান্য টিম সার্ভিস চার্জ পেমেন্ট করলেই সরাসরি রিকোয়েস্ট চলে যাবে।'
              },
              {
                step: 3,
                title: 'টিম আবেদন শেষ করে স্লিপ দেবে',
                desc: 'আমাদের অভিজ্ঞ এক্সপার্ট টিম অফিশিয়াল পোর্টালে নিখুঁতভাবে ফর্ম পূরণ করে সরকারি ফি দিয়ে আপনার ড্যাশবোর্ডে অ্যাপ্লিকেন্ট কপি পিডিএফ আপলোড করে দেবে এবং এসএমএস যাবে!'
              }
            ]).map((stepItem: any, sIdx: number) => (
              <div key={sIdx} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs relative overflow-hidden group hover:border-emerald-500 transition-all space-y-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 font-normal text-base flex items-center justify-center border border-emerald-200">
                  {stepItem.step || sIdx + 1}
                </div>
                <h3 className="text-sm sm:text-base font-normal text-slate-900">
                  {stepItem.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {stepItem.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. FREE PREVIOUS EXAM QUESTIONS TEASER BANNER */}
      {(ctaBannerCms?.isVisible !== false) && (
        <section className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8">
          <div 
            style={{
              backgroundColor: ctaBannerCms?.style?.backgroundColor || undefined,
              backgroundImage: ctaBannerCms?.style?.backgroundColor ? 'none' : undefined,
              color: ctaBannerCms?.style?.textColor || undefined
            }}
            className="bg-emerald-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="space-y-1.5 max-w-xl">
              <span className="bg-white/20 text-white text-xs font-normal px-2.5 py-0.5 rounded uppercase tracking-wider">
                {ctaBannerCms?.content?.badge || 'ফ্রি ডাউনলোড হাব'}
              </span>
              <h3 className="text-lg sm:text-xl font-normal text-white">
                {ctaBannerCms?.title || 'বিসিএস ও ব্যাংক পরীক্ষার বিগত ১০ বছরের প্রশ্ন ও সমাধান (PDF)'}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed font-normal">
                {ctaBannerCms?.subtitle || 'প্রিলিমিনারি ও লিখিত পরীক্ষার পূর্ণাঙ্গ প্রশ্নব্যাংক ব্যাখ্যাসহ ডাউনলোড করুন সম্পূর্ণ বিনামূল্যে।'}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={ctaBannerCms?.content?.buttonUrl || '/questions'}
                className="px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-normal text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-emerald-700" />
                <span>{ctaBannerCms?.content?.buttonLabel || 'ফ্রি প্রশ্নব্যাংক ডাউনলোড'}</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 7. CANDIDATE TESTIMONIALS & REVIEWS SECTION (Auto-Scrolling Marquee) */}
      {(reviewsCms?.isVisible !== false) && (
        <section id="reviews-section" className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 scroll-mt-24">
          <div 
            style={{
              backgroundColor: reviewsCms?.style?.backgroundColor || undefined,
              backgroundImage: reviewsCms?.style?.backgroundColor ? 'none' : undefined,
              color: reviewsCms?.style?.textColor || undefined
            }}
            className="bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-sm relative overflow-hidden"
          >
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto space-y-2 mb-6 relative z-10">
              <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 text-emerald-400 px-3.5 py-1 rounded-full text-xs font-normal tracking-wide shadow-xs">
                <span className="flex items-center gap-0.5 text-emerald-400">{Array.from({ length: 5 }).map((_, i) => <FaStar key={i} className="w-3 h-3" />)}</span>
                <span>{reviewsCms?.content?.badge || '৪.৯/৫ গড় রেটিং • ৩,৫০০+ ভেরিফাইড আবেদনকারী'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-normal text-white tracking-tight">
                {reviewsCms?.title || 'সফল চাকরিপ্রার্থীদের বাস্তব অভিজ্ঞতা ও মতামত'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
                {reviewsCms?.subtitle || 'সাইবার ক্যাফেতে ঘণ্টার পর ঘণ্টা লাইনে দাঁড়ানোর ভোগান্তি ছাড়াই কীভাবে শত শত চাকরিপ্রার্থী ঘরে বসেই শতভাগ নির্ভুল আবেদন সেবা পেয়েছেন:'}
              </p>
            </div>

          {/* Infinite Auto-Scrolling Reviews Marquee (Pauses on Hover) */}
          <div className="relative z-10 overflow-hidden w-full py-2">
            <div className="animate-marquee-scroll flex gap-4 sm:gap-5">
              {[...reviewsToDisplay, ...reviewsToDisplay].map((rev, index) => (
                <div
                  key={`${rev.id}-${index}`}
                  className="w-[285px] sm:w-[340px] bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-700 transition-all flex flex-col justify-between space-y-3 flex-shrink-0 cursor-default select-none shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-0.5 text-emerald-400 text-xs">{Array.from({ length: 5 }).map((_, i) => <FaStar key={i} className="w-3 h-3" />)}</div>
                      <span className="text-[11px] text-emerald-400 font-normal bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>ভেরিফাইড</span>
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal italic line-clamp-4">
                      “{rev.quote}”
                    </p>
                  </div>
                  <div className="pt-2.5 border-t border-slate-700 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-normal text-xs flex-shrink-0 shadow-xs">
                      {rev.initials}
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs sm:text-sm font-normal text-white leading-tight truncate">{rev.name}</div>
                      <div className="text-[11px] text-emerald-400 font-normal leading-tight truncate">{rev.role}</div>
                      <div className="text-[10px] text-slate-400 truncate">{rev.institution}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
      )}

      {/* 8. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION) */}
      {(faqCms?.isVisible !== false) && (
        <section 
          id="faq-section" 
          style={{
            backgroundColor: faqCms?.style?.backgroundColor || undefined,
            backgroundImage: faqCms?.style?.backgroundColor ? 'none' : undefined,
            color: faqCms?.style?.textColor || undefined
          }}
          className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 scroll-mt-24"
        >
          <div className="text-center space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-0.5 rounded-full text-xs font-normal">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
              <span>{faqCms?.content?.badge || 'সাধারণ জিজ্ঞাসা • স্পষ্ট উত্তর'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-normal text-slate-900 tracking-tight">
              {faqCms?.title || 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
              {faqCms?.subtitle || 'অনলাইন আবেদন ও চাকরি সেবা প্ল্যাটফর্ম সংক্রান্ত আপনার সকল প্রয়োজনীয় প্রশ্নের সহজ ও দ্রুত সমাধান:'}
            </p>
          </div>

          {/* Accordion Items List */}
          <div className="space-y-3.5">
            {((faqCms?.content?.faqs && faqCms.content.faqs.length > 0) ? faqCms.content.faqs : [
              {
                q: "আমি ঘরে বসে আবেদন করলে সেটা কি ১০০% নির্ভুল হবে এবং অফিশিয়াল স্লিপ পাব?",
                a: "হ্যাঁ, শতভাগ নিশ্চয়তা। আমাদের প্ল্যাটফর্মে কাজ করেন অভিজ্ঞ সরকারি ও ব্যাংক নিয়োগ এক্সপার্ট টিম। আপনার দেওয়া তথ্য পুঙ্খানুপুঙ্খ যাচাই করে অফিশিয়াল পোর্টালে (যেমন: Teletalk, Bangladesh Bank, BPSC) ফর্ম পূরণ করা হয় এবং ফি পরিশোধের পর প্রাপ্ত অফিশিয়াল Applicant Copy (User ID & Password সহ) আপনার ড্যাশবোর্ডে আপলোড করে এসএমএস দেওয়া হয়।"
              },
              {
                q: "আবেদনের সরকারি ফি ও সার্ভিস চার্জ কীভাবে এবং কখন পরিশোধ করতে হবে?",
                a: "আপনি বিকাশ (bKash), নগদ (Nagad), রকেট বা আপনার চাকরি সেবা ওয়ালেট ব্যালেন্সের মাধ্যমে অতি সহজে পেমেন্ট করতে পারবেন। সরকারি নির্ধারিত ফি-এর সাথে সামান্য সার্ভিস চার্জ যুক্ত থাকে। আবেদন সফলভাবে সাবমিট ও কনফার্ম না হওয়া পর্যন্ত আপনার টাকা সম্পূর্ণ নিরাপদ থাকে।"
              },
              {
                q: "আমার ছবি ও স্বাক্ষর কি নিজে রিসাইজ (300x300, 300x80) করতে হবে?",
                a: "একদমই না! সাইবার ক্যাফের মতো আপনাকে কোনো ফটোশপ বা রিসাইজিং সফটওয়্যার নিয়ে ভাবতে হবে না। আপনি শুধু মোবাইল ক্যামেরা দিয়ে তোলা সাধারণ ছবি ও সাদা কাগজে সই করা ছবি আপলোড করবেন, আমাদের স্মার্ট সিস্টেম নিজে থেকেই সরকারি নীতিমালার ৩০০x৩০০ ও ৩০০x৮০ পিক্সেল এবং নির্দিষ্ট কেবি (KB) সাইজে স্বয়ংক্রিয়ভাবে কনভার্ট করে নেবে।"
              },
              {
                q: "আবেদনের পর প্রবেশপত্র (Admit Card) ও পরীক্ষার সিট প্ল্যান কীভাবে পাব?",
                a: "আপনার আবেদন সম্পন্ন হওয়ার পর অফিশিয়াল রিক্রুটমেন্ট কর্তৃপক্ষ যখনই পরীক্ষার তারিখ ও প্রবেশপত্র ছাড়বে, সাথে সাথেই আপনার মোবাইলে এসএমএস ও হোয়াটসঅ্যাপে নোটিফিকেশন যাবে এবং আমাদের পোর্টাল থেকেই সরাসরি প্রবেশপত্র ডাউনলোড করতে পারবেন।"
              },
              {
                q: "আমার ব্যক্তিগত তথ্য ও শিক্ষাগত সনদের নিরাপত্তা কেমন?",
                a: "আমরা এনক্রিপ্টেড ডাটাবেজ ও ক্লাউড সিকিউরিটি প্রোটোকল ব্যবহার করি। আপনার ব্যক্তিগত কাগজপত্র, এনআইডি বা ছবি শুধুমাত্র আপনার নির্দিষ্ট আবেদন ফর্ম পূরণের উদ্দেশ্যেই ব্যবহৃত হয় এবং কোনো তৃতীয় পক্ষের কাছে প্রকাশ করা হয় না।"
              },
              {
                q: "কোনো সার্কুলারে একাধিক পদে আবেদনের সুযোগ থাকলে আমি কীভাবে আবেদন করব?",
                a: "যেসব সার্কুলারে একাধিক পদ বা গ্রেড রয়েছে (যেমন: বাংলাদেশ ব্যাংক, রেলওয়ে বা কাস্টমস), সেখানে সার্কুলার কার্ডের ওপর থাকা 'পদ ও ফি দেখুন' ড্রয়ারে ক্লিক করে আপনার যোগ্যতানুযায়ী যেকোনো এক বা একাধিক পদ পছন্দ করে সহজেই আলাদা বা সমন্বিত আবেদন বুকিং দিতে পারবেন।"
              }
            ]).map((item: any, index: number) => {
              const isOpen = openFaqIndex === index;
              return (
                <div
                  key={index}
                  className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                    isOpen
                      ? 'border-emerald-500 shadow-md shadow-emerald-950/5 ring-1 ring-emerald-500/20'
                      : 'border-slate-200/90 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className={`text-[16px] sm:text-[17px] font-bold leading-snug ${
                      isOpen ? 'text-emerald-800' : 'text-slate-800'
                    }`}>
                      {item.q || item.question || item.title}
                    </span>
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 ${
                      isOpen ? 'bg-emerald-100 text-emerald-800 rotate-180' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-[15px] sm:text-[16px] text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in-50 duration-200">
                      <p className="pt-3">{item.a || item.answer || item.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* FAQ Support Footer Card */}
          <div className="mt-8 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-5 sm:p-6 text-center space-y-3">
            <h4 className="text-base sm:text-lg font-bold text-slate-900">
              আপনার কি আরও কোনো প্রশ্ন বা সহায়তা প্রয়োজন?
            </h4>
            <p className="text-[14px] sm:text-[15px] text-slate-600 max-w-lg mx-auto">
              আমাদের অভিজ্ঞ কাস্টমার কেয়ার টিম প্রতিদিন সকাল ৯টা থেকে রাত ১১টা পর্যন্ত সরাসরি সহায়তার জন্য প্রস্তুত।
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <a
                href="https://wa.me/8801700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[15px] shadow-sm flex items-center gap-2 transition-all hover:scale-105"
              >
                <MessageSquare className="w-4 h-4" />
                <span>হোয়াটসঅ্যাপে সরাসরি কথা বলুন</span>
              </a>
              <a
                href="tel:+8801700000000"
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-[15px] shadow-xs flex items-center gap-2 transition-all"
              >
                <PhoneCall className="w-4 h-4 text-emerald-700" />
                <span>কল করুন (হটলাইন)</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 9. DYNAMIC CUSTOM CMS SECTIONS ADDED FROM BUILDER */}
      {(homeSections || [])
        .filter((s: any) => s.isVisible !== false && !['hero', 'how-it-works', 'cta', 'testimonials', 'faq', 'jobs'].includes(s.type) && !['sec-home-hero', 'sec-home-how-it-works', 'sec-home-cta-banner', 'sec-home-reviews', 'sec-home-faq', 'sec-home-jobs'].includes(s.id))
        .map((sec: any, idx: number) => {
          if (sec.type === 'banner-image') {
            return (
              <section key={sec.id || idx} className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 shadow-lg group">
                  <img 
                    src={sec.content?.imageUrl || 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&auto=format&fit=crop&q=80'} 
                    alt={sec.title || 'ব্যানার'}
                    style={{
                      height: sec.style?.imageHeight === 'sm' ? '200px' : sec.style?.imageHeight === 'lg' ? '450px' : '320px',
                      width: '100%',
                      objectFit: 'cover'
                    }}
                    className="w-full transition-transform duration-300 group-hover:scale-105"
                  />
                  {(sec.title || sec.content?.badge || sec.content?.buttonLabel) && (
                    <div className="absolute inset-0 bg-slate-950/60 flex flex-col justify-end p-6 sm:p-10 text-white space-y-3">
                      {sec.content?.badge && (
                        <span className="inline-block px-3 py-1 bg-emerald-700 text-white rounded-full text-xs font-bold uppercase tracking-wider w-fit">
                          {sec.content.badge}
                        </span>
                      )}
                      <h3 className="text-2xl sm:text-3xl font-black">{sec.title}</h3>
                      {sec.subtitle && <p className="text-sm sm:text-base text-slate-200 max-w-xl">{sec.subtitle}</p>}
                      {(sec.content?.buttonUrl || sec.content?.linkUrl) && (
                        <Link
                          href={sec.content?.buttonUrl || sec.content?.linkUrl}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-950 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition-colors w-fit"
                        >
                          <span>{sec.content?.buttonLabel || 'বিস্তারিত দেখুন'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </section>
            );
          }

          if (sec.type === 'features') {
            return (
              <section key={sec.id || idx} className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="text-center mb-8 space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{sec.title}</h3>
                  {sec.subtitle && <p className="text-sm sm:text-base text-slate-600">{sec.subtitle}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {(sec.content?.items || []).map((item: any, i: number) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                      <h4 className="font-bold text-base text-slate-900">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc || item.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          if (sec.type === 'text') {
            return (
              <section key={sec.id || idx} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm space-y-4">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 border-l-4 border-emerald-600 pl-3">
                    {sec.title}
                  </h3>
                  {sec.subtitle && <p className="text-sm text-slate-600 leading-relaxed pl-4">{sec.subtitle}</p>}
                  {sec.content?.bodyText && (
                    <p className="text-sm text-slate-700 leading-relaxed pl-4 whitespace-pre-line">{sec.content.bodyText}</p>
                  )}
                </div>
              </section>
            );
          }

          return null;
        })}

      </div>
    </div>
  );
}
