'use client';

import React, { useRef, useState, useLayoutEffect, useEffect, useCallback } from 'react';

interface SubTabItem {
  id: string;
  label: string;
}

interface SubHubNavBarProps {
  subTabs: SubTabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function SubHubNavBar({
  subTabs,
  activeTab,
  onTabChange,
}: SubHubNavBarProps) {
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

  const currentHubKey = subTabs.map((s) => s.id).join(',');
  const prevHubKeyRef = useRef(currentHubKey);

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
    const isNewHub = prevHubKeyRef.current !== currentHubKey;
    if (isNewHub) {
      prevHubKeyRef.current = currentHubKey;
      setHasMounted(false);
    }
    updateIndicator();
    const timer = setTimeout(() => {
      setHasMounted(true);
    }, 40);
    return () => clearTimeout(timer);
  }, [updateIndicator, currentHubKey]);

  useEffect(() => {
    window.addEventListener('resize', updateIndicator);
    return () => window.removeEventListener('resize', updateIndicator);
  }, [updateIndicator]);

  if (!subTabs || subTabs.length <= 1) return null;

  return (
    <div
      ref={containerRef}
      className="relative mb-6 flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200/90 shadow-2xs"
    >
      {/* Sliding fluid animated green background pill */}
      <div
        className={`absolute rounded-lg bg-emerald-600 shadow-sm shadow-emerald-600/30 pointer-events-none ${
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

      {subTabs.map((sub) => {
        const isSubActive = activeTab === sub.id;
        return (
          <button
            key={sub.id}
            ref={(el) => {
              if (el) buttonRefs.current.set(sub.id, el);
              else buttonRefs.current.delete(sub.id);
            }}
            type="button"
            onClick={() => onTabChange(sub.id)}
            className={`relative z-10 px-3.5 py-1.5 rounded-lg text-xs transition-colors duration-200 cursor-pointer select-none ${
              isSubActive
                ? 'text-white font-semibold'
                : 'text-slate-600 hover:text-slate-900 font-medium hover:bg-slate-100/50'
            }`}
          >
            {sub.label}
          </button>
        );
      })}
    </div>
  );
}
