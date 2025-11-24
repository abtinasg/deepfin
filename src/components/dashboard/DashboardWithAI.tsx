'use client';

import { useState, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import AIChatPanel from '@/components/ai/AIChatPanel';
import { MessageSquare, X } from 'lucide-react';

interface DashboardWithAIProps {
  children: ReactNode;
}

export default function DashboardWithAI({ children }: DashboardWithAIProps) {
  const [showAI, setShowAI] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>

      {/* AI Sidebar */}
      <div
        className={`transition-all duration-300 ${
          showAI ? 'w-96' : 'w-0'
        } overflow-hidden`}
      >
        {showAI && (
          <div className="h-full">
            <AIChatPanel compact showContext />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <Button
        onClick={() => setShowAI(!showAI)}
        className={`fixed bottom-6 ${
          showAI ? 'right-[25rem]' : 'right-6'
        } z-50 h-14 w-14 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl transition-all hover:scale-110`}
        title={showAI ? 'Close AI' : 'Open AI Copilot'}
      >
        {showAI ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageSquare className="w-6 h-6" />
        )}
      </Button>
    </div>
  );
}
