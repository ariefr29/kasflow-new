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
        "flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border",
        type === 'success'
          ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-200"
          : "bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-200"
      )}>
        <Icon size={20} className={clsx(
          type === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
        )} />
        <span className="text-sm font-medium pr-2">{message}</span>
        <button
          onClick={handleClose}
          className={clsx(
            "p-1 rounded-lg transition-colors",
            type === 'success'
              ? "hover:bg-emerald-100 dark:hover:bg-emerald-900"
              : "hover:bg-rose-100 dark:hover:bg-rose-900"
          )}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
