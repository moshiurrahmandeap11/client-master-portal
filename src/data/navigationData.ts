export interface NavLinkItem {
  label: string;
  href: string;
  badge?: string;
}

export const MAIN_NAV_LINKS: NavLinkItem[] = [
  { label: 'সব চাকরি', href: '/jobs' },
  { label: 'সর্বশেষ চাকরি', href: '/latest-jobs' },
  { label: 'ক্যাটাগরি', href: '/categories' },
  { label: 'এডমিট কার্ড', href: '/admit-cards' },
  { label: 'ফলাফল', href: '/exam-results' },
  { label: 'প্রস্তুতি', href: '/preparation' },
];

export const DASHBOARD_NAV_LINKS: NavLinkItem[] = [
  { label: 'ড্যাশবোর্ড', href: '/dashboard' },
  { label: 'প্রোফাইল', href: '/dashboard/profile' },
  { label: 'ডকুমেন্ট ভল্ট', href: '/dashboard/vault' },
  { label: 'আমার আবেদন', href: '/dashboard/applications' },
  { label: 'পছন্দের চাকরি', href: '/dashboard/recommended-jobs' },
  { label: 'সংরক্ষিত চাকরি', href: '/dashboard/saved-jobs' },
  { label: 'ওয়ালেট', href: '/dashboard/wallet' },
  { label: 'লেনদেন', href: '/dashboard/transactions' },
  { label: 'জব অ্যালার্ট', href: '/dashboard/alerts' },
  { label: 'সেটিংস', href: '/dashboard/settings' },
];

export const FOOTER_QUICK_LINKS: NavLinkItem[] = [
  { label: 'আমাদের সম্পর্কে', href: '/about' },
  { label: 'কীভাবে আবেদন করবেন', href: '/how-it-works' },
  { label: 'সাধারণ জিজ্ঞাসা', href: '/faq' },
  { label: 'যোগাযোগ', href: '/contact' },
  { label: 'প্রাইভেসি পলিসি', href: '/privacy' },
  { label: 'শর্তাবলী', href: '/terms' },
];
