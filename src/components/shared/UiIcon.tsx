'use client';

import React from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck,
  FileText,
  Flame,
  Globe,
  GraduationCap,
  Headphones,
  Image as ImageIcon,
  KeyRound,
  Landmark,
  Lightbulb,
  Lock,
  Mail,
  PenTool,
  Pin,
  Printer,
  Radio,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  Train,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react';
import {
  FaBuildingColumns,
  FaCamera,
  FaCertificate,
  FaHandshake,
  FaIdCard,
  FaLandmarkFlag,
  FaPenNib,
  FaRobot,
  FaRss,
  FaShieldHalved,
  FaStar,
} from 'react-icons/fa6';

export type IconName =
  | 'govt'
  | 'bank'
  | 'private_bank'
  | 'ngo'
  | 'teacher'
  | 'railway'
  | 'private'
  | 'defence'
  | 'photo'
  | 'signature'
  | 'nid'
  | 'certificate'
  | 'cv'
  | 'globe'
  | 'api'
  | 'rss'
  | 'ocr'
  | 'manual'
  | 'alert'
  | 'support'
  | 'star'
  | 'bolt'
  | 'sparkles'
  | 'shield'
  | 'bot'
  | 'warning'
  | 'tip'
  | 'check'
  | 'close'
  | 'external';

interface UiIconProps {
  name: string;
  className?: string;
}

export function UiIcon({ name, className = 'w-4 h-4' }: UiIconProps) {
  switch (name) {
    case 'govt':
      return <FaLandmarkFlag className={className} />;
    case 'bank':
    case 'private_bank':
      return <FaBuildingColumns className={className} />;
    case 'ngo':
      return <FaHandshake className={className} />;
    case 'teacher':
      return <GraduationCap className={className} />;
    case 'railway':
      return <Train className={className} />;
    case 'private':
      return <Building2 className={className} />;
    case 'defence':
      return <FaShieldHalved className={className} />;
    case 'photo':
      return <FaCamera className={className} />;
    case 'signature':
      return <FaPenNib className={className} />;
    case 'nid':
      return <FaIdCard className={className} />;
    case 'certificate':
      return <FaCertificate className={className} />;
    case 'cv':
      return <FileText className={className} />;
    case 'globe':
      return <Globe className={className} />;
    case 'api':
      return <Zap className={className} />;
    case 'rss':
      return <FaRss className={className} />;
    case 'ocr':
      return <Search className={className} />;
    case 'manual':
      return <PenTool className={className} />;
    case 'alert':
      return <ShieldAlert className={className} />;
    case 'support':
      return <Headphones className={className} />;
    case 'star':
      return <FaStar className={className} />;
    case 'bolt':
      return <Zap className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'shield':
      return <ShieldCheck className={className} />;
    case 'bot':
      return <FaRobot className={className} />;
    case 'warning':
      return <AlertTriangle className={className} />;
    case 'tip':
      return <Lightbulb className={className} />;
    case 'check':
      return <Check className={className} />;
    case 'close':
      return <X className={className} />;
    case 'external':
      return <ArrowUpRight className={className} />;
    default:
      return <Briefcase className={className} />;
  }
}

export {
  AlertTriangle,
  ArrowUpRight,
  Award,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck,
  FileText,
  Flame,
  Globe,
  GraduationCap,
  Headphones,
  ImageIcon,
  KeyRound,
  Landmark,
  Lightbulb,
  Lock,
  Mail,
  PenTool,
  Pin,
  Printer,
  Radio,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  Train,
  Users,
  Wallet,
  X,
  Zap,
};
