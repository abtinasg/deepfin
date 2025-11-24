'use client';

import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastCounter = 0;
let addToastCallback: ((message: string, type: ToastType) => void) | null = null;

export function toast(message: string, type: ToastType = 'info') {
  if (addToastCallback) {
    addToastCallback(message, type);
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    addToastCallback = (message: string, type: ToastType) => {
      const id = toastCounter++;
      setToasts((prev) => [...prev, { id, message, type }]);
      
      // Auto remove after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    return () => {
      addToastCallback = null;
    };
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[300px] animate-in slide-in-from-right ${
            t.type === 'success'
              ? 'bg-green-50 text-green-900 border border-green-200'
              : t.type === 'error'
              ? 'bg-red-50 text-red-900 border border-red-200'
              : 'bg-blue-50 text-blue-900 border border-blue-200'
          }`}
        >
          {t.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
          {t.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
          {t.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
          
          <span className="flex-1 text-sm font-medium">{t.message}</span>
          
          <button
            onClick={() => removeToast(t.id)}
            className="hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
