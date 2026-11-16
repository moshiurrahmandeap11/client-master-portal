'use client';

import React, { useRef, useState, useLayoutEffect, useEffect, useCallback } from 'react';

export interface FluidTabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  count?: number | string | null;
  badge?: number | string | null;
}

export interface FluidTabBarProps {
  tabs: FluidTabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'white' | 'slate' | 'dark' | 'transparent';
  pillColor?: string;
}

export default function FluidTabBar({
  tabs,
  activeTab,
  onChange,
  className = '',
  size = 'md',
  variant = 'white',
  pillColor = 'bg-emerald-600',
}: FluidTabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const [indicatorStyle, setIndicatorStyle] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    opacity: number;
  }>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    opacity: 0,
  });

  const [hasMounted, setHasMounted] = useState(false);

  const tabsKey = tabs.map((t) => t.id).join(',');
  const prevTabsKeyRef = useRef(tabsKey);

  const updateIndicator = useCallback(() => {
    const activeBtn = buttonRefs.current.get(activeTab);
    const container = containerRef.current;
    if (activeBtn && container) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        top: activeBtn.offsetTop,
        width: activeBtn.offsetWidth,
        height: activeBtn.offsetHeight,
        opacity: 1,
      });
    }
  }, [activeTab]);

  useLayoutEffect(() => {
    const isNewTabSet = prevTabsKeyRef.current !== tabsKey;
    if (isNewTabSet) {
      prevTabsKeyRef.current = tabsKey;
      setHasMounted(false);
    }
    updateIndicator();
    const timer = setTimeout(() => {
      setHasMounted(true);
    }, 40);
    return () => clearTimeout(timer);
  }, [updateIndicator, tabsKey]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  if (!tabs || tabs.length === 0) return null;

  const bgContainer =
    variant === 'slate'
      ? 'bg-slate-100 border-slate-200'
      : variant === 'dark'
      ? 'bg-slate-900/90 border-slate-800'
      : variant === 'transparent'
      ? 'bg-transparent border-transparent'
      : 'bg-white border-slate-200/90 shadow-2xs';

  const pyClass = size === 'sm' ? 'py-1 px-3 text-xs' : 'py-1.5 px-3.5 text-xs';
  const inactiveTextClass =
    variant === 'dark'
      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50';

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-wrap items-center gap-1.5 p-1 rounded-xl border ${bgContainer} ${className}`}
    >
      {/* Sliding fluid animated green background pill */}
      <div
        className={`absolute rounded-lg ${pillColor} shadow-sm shadow-emerald-600/30 pointer-events-none ${
          hasMounted
            ? 'transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]'
            : 'transition-none'
        }`}
        style={{
          left: `${indicatorStyle.left}px`,
          top: `${indicatorStyle.top}px`,
          width: `${indicatorStyle.width}px`,
          height: `${indicatorStyle.height}px`,
          opacity: indicatorStyle.opacity,
        }}
      />

      {tabs.map((tab) => {
        const isSubActive = activeTab === tab.id;
        const Icon = tab.icon;
        const badgeValue = tab.count !== undefined ? tab.count : tab.badge;

        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) buttonRefs.current.set(tab.id, el);
              else buttonRefs.current.delete(tab.id);
            }}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`relative z-10 ${pyClass} rounded-lg font-semibold transition-colors duration-200 cursor-pointer select-none flex items-center gap-1.5 whitespace-nowrap ${
              isSubActive
                ? 'text-white'
                : inactiveTextClass
            }`}
          >
            {Icon && <Icon className={`w-3.5 h-3.5 ${isSubActive ? 'text-white' : variant === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />}
            <span>{tab.label}</span>
            {badgeValue !== undefined && badgeValue !== null && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSubActive
                    ? 'bg-white/20 text-white'
                    : variant === 'dark'
                    ? 'bg-slate-800 text-slate-300 border border-slate-700'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {badgeValue}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
