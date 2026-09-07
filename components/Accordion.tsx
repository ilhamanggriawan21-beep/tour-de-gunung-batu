'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: React.ReactNode;
}

export default function Accordion({ items }: { items: FAQItem[] }) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id || null);

  const toggle = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div
            key={item.id}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-brand-sky/30 shadow-card overflow-hidden transition-all"
          >
            <button
              onClick={() => toggle(item.id)}
              className="w-full px-6 py-5 text-left flex items-center justify-between focus:outline-none"
            >
              <span className="font-bold text-brand-navy text-base sm:text-lg">
                {item.question}
              </span>
              <div className={`p-2 rounded-full bg-brand-royal/10 text-brand-royal transition-transform ${isOpen ? 'rotate-180 bg-brand-royal text-white' : ''}`}>
                <ChevronDown className="w-5 h-5" />
              </div>
            </button>
            {isOpen && (
              <div className="px-6 pb-6 text-slate-700 text-sm sm:text-base leading-relaxed border-t border-slate-100 pt-4 space-y-2">
                {item.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
