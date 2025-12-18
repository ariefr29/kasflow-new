import React from 'react';
import clsx from 'clsx';

/**
 * Reusable tab switcher component
 * @param {Object} props
 * @param {Array<{key: string, label: string}>} props.tabs - Array of tab objects
 * @param {string} props.activeTab - Currently active tab key
 * @param {Function} props.onTabChange - Callback when tab changes
 * @param {boolean} props.disabled - Whether tabs are disabled
 */
export default function TabSwitcher({ tabs, activeTab, onTabChange, disabled = false }) {
    return (
        <div className="flex p-1 gap-1 bg-slate-100 rounded-xl overflow-x-auto">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    onClick={() => !disabled && onTabChange(tab.key)}
                    disabled={disabled}
                    className={clsx(
                        "flex-1 py-2 rounded-lg font-medium text-xs transition-all whitespace-nowrap",
                        activeTab === tab.key
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-slate-500 hover:text-slate-700",
                        disabled && "cursor-not-allowed opacity-60"
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}
