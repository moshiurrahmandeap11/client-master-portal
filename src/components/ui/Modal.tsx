'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className={cn('w-full max-w-md rounded-2xl bg-white p-6 shadow-xl', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h3 className="mb-4 text-lg font-bold text-slate-900">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
