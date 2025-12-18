import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import clsx from 'clsx';

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => setIsVisible(true));
    
    // Auto close after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose?.();
    }, 300); // Match exit animation duration
  };

  const Icon = type === 'success' ? CheckCircle : XCircle;
  
  return (
    <div 
      className={clsx(
        "fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ease-out",
        isVisible && !isLeaving ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <div className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md",
        type === 'success' 
          ? "bg-emerald-50/95 border-emerald-200 text-emerald-800" 
          : "bg-rose-50/95 border-rose-200 text-rose-800"
      )}>
        <Icon size={20} className={type === 'success' ? 'text-emerald-600' : 'text-rose-600'} />
        <span className="text-sm font-medium pr-2">{message}</span>
        <button 
          onClick={handleClose}
          className={clsx(
            "p-1 rounded-lg transition-colors",
            type === 'success' ? "hover:bg-emerald-100" : "hover:bg-rose-100"
          )}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
