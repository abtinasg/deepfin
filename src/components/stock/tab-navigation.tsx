'use client';

import { useState } from 'react';
import { StockTab } from '@/types/stock';
import { motion } from 'framer-motion';

interface TabNavigationProps {
  activeTab: StockTab;
  onTabChange: (tab: StockTab) => void;
}

const tabs: { id: StockTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'fra', label: 'FRA' },
  { id: 'sentiment', label: 'Sentiment' },
  { id: 'news', label: 'News' },
  { id: 'learn', label: 'Learn' },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative py-4 text-base font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
