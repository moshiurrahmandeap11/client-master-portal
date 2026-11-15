'use client';
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Briefcase, 
  GraduationCap, 
  Flame, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight,
  Building2, 
  Banknote, 
  Award,
  MapPin,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface JobSearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedJobType: string;
  setSelectedJobType: (type: string) => void;
  selectedEducation: string;
  setSelectedEducation: (edu: string) => void;
  selectedOrg: string;
  setSelectedOrg: (org: string) => void;
  selectedGrade: string;
  setSelectedGrade: (grade: string) => void;
  selectedSalary: string;
  setSelectedSalary: (salary: string) => void;
  selectedDistrict?: string;
  setSelectedDistrict?: (district: string) => void;
  districtsList?: string[];
  onSearch: () => void;
  onReset: () => void;
  onCategoryReset?: () => void;
  activeFilterCount: number;
}

interface CustomSelectOption {
  value: string;
  label: string;
}

function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
}: {
  id?: string;
  value: string;
  onChange: (val: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentOption = options.find((o) => o.value === value);
  const displayLabel = currentOption ? currentOption.label : placeholder || 'নির্বাচন করুন';

  return (
    <div className="relative" ref={ref}>
      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-800 bg-white hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 transition-all flex items-center justify-between text-left cursor-pointer shadow-2xs"
      >
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-700 pointer-events-none" />
        )}
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 pointer-events-none shrink-0 ${
            isOpen ? 'rotate-180 text-slate-900' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 max-h-60 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-y-auto text-xs sm:text-sm py-1 animate-in fade-in duration-150">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left transition-colors flex items-center justify-between cursor-pointer ${
                opt.value === value
                  ? 'bg-emerald-50 text-emerald-800 font-normal'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950 font-normal'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 ml-2" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function JobSearchSection({
  searchQuery,
  setSearchQuery,
  selectedJobType,
  setSelectedJobType,
  selectedEducation,
  setSelectedEducation,
  selectedOrg,
  setSelectedOrg,
  selectedGrade,
  setSelectedGrade,
  selectedSalary,
  setSelectedSalary,
  selectedDistrict = 'all',
  setSelectedDistrict,
  districtsList = ['সকল জেলা', 'ঢাকা', 'চট্টগ্রাম', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'সিলেট', 'রংপুর', 'ময়মনসিংহ', 'কুমিল্লা', 'বগুড়া', 'নোয়াখালী'],
  onSearch,
  onReset,
  onCategoryReset,
  activeFilterCount
}: JobSearchSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const chipsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (chipsScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = chipsScrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }
  };

  useEffect(() => {
    checkScroll();
    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(checkScroll, 200);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  const scrollChips = (direction: 'left' | 'right') => {
    if (chipsScrollRef.current) {
      const scrollAmount = 240;
      chipsScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 320);
    }
  };

  const popularSearches = [
    { label: 'সরকারি চাকরি', type: 'govt', keyword: '' },
    { label: 'ব্যাংক চাকরি', type: 'bank', keyword: '' },
    { label: 'শিক্ষক নিয়োগ', type: 'teacher', keyword: '' },
    { label: 'রেলওয়ে চাকরি', type: 'railway', keyword: '' },
    { label: 'এনজিও চাকরি', type: 'ngo', keyword: '' },
    { label: 'বেসরকারি চাকরি', type: 'private', keyword: '' },
    { label: 'সহকারী পরিচালক', type: 'all', keyword: 'সহকারী পরিচালক' },
    { label: 'অফিস সহকারী', type: 'all', keyword: 'অফিস সহকারী' },
    { label: 'ইঞ্জিনিয়ার', type: 'all', keyword: 'ইঞ্জিনিয়ার' },
    { label: 'কম্পিউটার অপারেটর', type: 'all', keyword: 'কম্পিউটার' },
  ];

  const handleChipClick = (chip: { label: string; type: string; keyword: string }) => {
    if (onCategoryReset) {
      onCategoryReset();
    }
    if (chip.type !== 'all') {
      setSelectedJobType(chip.type);
      setSearchQuery('');
    } else if (chip.keyword) {
      setSearchQuery(chip.keyword);
      setSelectedJobType('all');
    } else {
      setSearchQuery(chip.label);
    }
    onSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const hasAnyFilterActive = activeFilterCount > 0 || 
                             selectedJobType !== 'all' || 
                             selectedEducation !== 'all' || 
                             searchQuery.trim() !== '' ||
                             (selectedDistrict && selectedDistrict !== 'all');

  const jobTypeOptions: CustomSelectOption[] = [
    { value: 'all', label: 'সব ধরনের চাকরি' },
    { value: 'govt', label: 'সরকারি চাকরি' },
    { value: 'bank', label: 'ব্যাংক চাকরি' },
    { value: 'teacher', label: 'শিক্ষক নিয়োগ' },
    { value: 'railway', label: 'রেলওয়ে চাকরি' },
    { value: 'ngo', label: 'এনজিও চাকরি' },
    { value: 'private', label: 'বেসরকারি চাকরি' },
  ];

  const educationOptions: CustomSelectOption[] = [
    { value: 'all', label: 'সব যোগ্যতা' },
    { value: 'hsc', label: 'এইচএসসি (HSC)' },
    { value: 'graduate', label: 'স্নাতক (ডিগ্রি/অনার্স)' },
    { value: 'postgraduate', label: 'মাস্টার্স (স্নাতকোত্তর)' },
  ];

  const orgOptions: CustomSelectOption[] = [
    { value: 'all', label: 'সকল প্রতিষ্ঠান' },
    { value: 'বাংলাদেশ ব্যাংক', label: 'বাংলাদেশ ব্যাংক' },
    { value: 'বিসিএস', label: 'বিসিএস / পিএসসি' },
    { value: 'রেলওয়ে', label: 'বাংলাদেশ রেলওয়ে' },
    { value: 'পেট্রোবাংলা', label: 'পেট্রোবাংলা' },
    { value: 'বিদ্যুৎ', label: 'বিদ্যুৎ উন্নয়ন বোর্ড' },
    { value: 'শিক্ষা', label: 'শিক্ষা মন্ত্রণালয় / অধিদপ্তর' },
    { value: 'পুলিশ', label: 'পুলিশ ও স্বরাষ্ট্র' },
    { value: 'আশুগঞ্জ', label: 'আশুগঞ্জ পাওয়ার' },
  ];

  const gradeOptions: CustomSelectOption[] = [
    { value: 'all', label: 'সকল গ্রেড' },
    { value: '৯ম গ্রেড', label: '৯ম গ্রেড (১ম শ্রেণি)' },
    { value: '১০ম গ্রেড', label: '১০ম গ্রেড (২য় শ্রেণি)' },
    { value: '১১তম - ১৬তম', label: '১১তম - ১৬তম গ্রেড' },
    { value: '১৭তম - ২০তম', label: '১৭তম - ২০তম গ্রেড' },
  ];

  const salaryOptions: CustomSelectOption[] = [
    { value: 'all', label: 'সকল বেতন স্কেল' },
    { value: 'under_25k', label: 'শুরুর মূল বেতন ২৫,০০০ এর নিচে' },
    { value: '25k_50k', label: 'স্কেল ২৫,০০০ থেকে ৫০,০০০ টাকা' },
    { value: 'above_35k', label: 'সর্বোচ্চ স্কেল ৩৫,০০০ টাকার বেশি' },
  ];

  const districtOptions: CustomSelectOption[] = districtsList.map(dist => ({
    value: dist === 'সকল জেলা' ? 'all' : dist,
    label: dist,
  }));

  return (
    <section className="bg-slate-50 border-b border-slate-200 py-3.5 sm:py-5 lg:py-6 px-4 sm:px-6 lg:px-8 relative z-20">
      <div className="w-full max-w-[1536px] 2xl:max-w-[1680px] mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 lg:p-6 space-y-4">
          
          {/* First Row: Search Inputs & Action Button */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            
            {/* 1. Job title / Keyword input */}
            <div className="md:col-span-5">
              <label htmlFor="search-keyword" className="block text-xs sm:text-sm font-normal text-slate-700 mb-1.5">
                পদের নাম বা কীওয়ার্ড
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  id="search-keyword"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="পদের নাম, প্রতিষ্ঠানের নাম বা কীওয়ার্ড লিখুন..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-normal text-slate-900 placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 focus:outline-none transition-all bg-white hover:border-slate-400"
                />
              </div>
            </div>

            {/* 2. Job Type Custom Dropdown */}
            <div className="md:col-span-3">
              <label className="block text-xs sm:text-sm font-normal text-slate-700 mb-1.5">
                চাকরির ধরন
              </label>
              <CustomSelect
                id="job-type-select"
                value={selectedJobType}
                onChange={(val) => {
                  setSelectedJobType(val);
                  if (onCategoryReset) onCategoryReset();
                }}
                options={jobTypeOptions}
                icon={Briefcase}
              />
            </div>

            {/* 3. Education Qualification Custom Dropdown */}
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-normal text-slate-700 mb-1.5">
                শিক্ষাগত যোগ্যতা
              </label>
              <CustomSelect
                id="education-select"
                value={selectedEducation}
                onChange={setSelectedEducation}
                options={educationOptions}
                icon={GraduationCap}
              />
            </div>

            {/* 4. Primary Search Button */}
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={onSearch}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-normal text-xs sm:text-sm shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>চাকরি খুঁজুন</span>
              </button>
            </div>

          </div>

          {/* Toggle for Advanced Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-normal transition-all flex items-center gap-1.5 cursor-pointer border ${
                  showAdvanced || activeFilterCount > 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700" />
                <span>উন্নত ফিল্টার</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-700 text-white text-[10px] font-normal flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              {hasAnyFilterActive && (
                <button
                  type="button"
                  onClick={onReset}
                  className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-normal text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>রিসেট করুন</span>
                </button>
              )}
            </div>
          </div>

          {/* Collapsible Advanced Filters Drawer */}
          {showAdvanced && (
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 animate-in fade-in duration-200">
              
              {/* 1. Organization Dropdown */}
              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>প্রতিষ্ঠান / সংস্থা</span>
                </label>
                <CustomSelect
                  value={selectedOrg}
                  onChange={setSelectedOrg}
                  options={orgOptions}
                />
              </div>

              {/* 2. Grade Dropdown */}
              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  <span>জাতীয় বেতন স্কেল গ্রেড</span>
                </label>
                <CustomSelect
                  value={selectedGrade}
                  onChange={setSelectedGrade}
                  options={gradeOptions}
                />
              </div>

              {/* 3. Salary Range Dropdown */}
              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1 flex items-center gap-1">
                  <Banknote className="w-3.5 h-3.5 text-emerald-700" />
                  <span>বেতন স্কেল পরিসীমা</span>
                </label>
                <CustomSelect
                  value={selectedSalary}
                  onChange={setSelectedSalary}
                  options={salaryOptions}
                />
              </div>

              {/* 4. District Dropdown */}
              <div>
                <label className="block text-xs font-normal text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>জেলা ভিত্তিক যোগ্যতা</span>
                </label>
                <CustomSelect
                  value={selectedDistrict}
                  onChange={(val) => setSelectedDistrict?.(val)}
                  options={districtOptions}
                />
              </div>

            </div>
          )}

          {/* Third Row: Popular Searches */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
            
            <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-normal text-slate-700 flex-shrink-0">
              <Flame className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">জনপ্রিয় অনুসন্ধান:</span>
              <span className="sm:hidden">জনপ্রিয়:</span>
            </div>

            {/* Scroll Container with Left/Right Arrow Buttons */}
            <div className="relative flex items-center min-w-0 flex-1 overflow-hidden">
              {canScrollLeft && (
                <button
                  type="button"
                  onClick={() => scrollChips('left')}
                  aria-label="পূর্ববর্তী চিপস দেখুন"
                  className="absolute left-0 z-10 w-6 h-6 rounded-full bg-white/95 shadow-xs border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Chips Track */}
              <div 
                ref={chipsScrollRef}
                onScroll={checkScroll}
                className="flex items-center gap-2 overflow-x-auto scrollbar-none whitespace-nowrap scroll-smooth px-1 py-1"
              >
                {popularSearches.map((chip, idx) => {
                  const isActive = (chip.type !== 'all' && selectedJobType === chip.type) || 
                                   (chip.keyword && searchQuery === chip.keyword);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChipClick(chip)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-normal transition-all cursor-pointer whitespace-nowrap ${
                        isActive
                          ? 'bg-emerald-700 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>

              {canScrollRight && (
                <button
                  type="button"
                  onClick={() => scrollChips('right')}
                  aria-label="পরবর্তী চিপস দেখুন"
                  className="absolute right-0 z-10 w-6 h-6 rounded-full bg-white/95 shadow-xs border border-slate-200 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
