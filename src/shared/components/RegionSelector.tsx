'use client';

import { useState, useEffect } from 'react';

// Supported languages
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'te', name: 'తెలుగు' },
];

function detectLanguageFromDomain(hostname?: string): string {
  if (!hostname && typeof window !== 'undefined') {
    hostname = window.location.hostname;
  }
  if (!hostname) return 'en';
  if (hostname.includes('bullikatha.web.app')) return 'te';
  if (hostname.includes('penloop.web.app')) return 'en';
  // Add more mappings as needed
  return 'en';
}

interface LanguageSelectorProps {
  className?: string;
}

export default function LanguageSelector({ className = '' }: LanguageSelectorProps) {
  // Hydration-safe: default to domain-detected language
  const [currentLanguage, setCurrentLanguage] = useState(() => detectLanguageFromDomain());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('userLanguage');
      if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
        setCurrentLanguage(stored);
      } else {
        // If not stored, set based on domain
        setCurrentLanguage(detectLanguageFromDomain(window.location.hostname));
      }
    }
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setCurrentLanguage(langCode);
    setIsOpen(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('userLanguage', langCode);
      // Optionally reload or trigger i18n update here
    }
  };

  const currentLanguageInfo = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        data-testid="language-selector-button"
      >
        <span>🌐</span>
        <span>{currentLanguageInfo?.name || 'Language'}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          {SUPPORTED_LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                currentLanguage === lang.code ? 'bg-blue-50 text-blue-700' : ''
              }`}
              data-testid={`language-option-${lang.code}`}
            >
              <span>{lang.name}</span>
              {currentLanguage === lang.code && <span className="text-blue-600">✓</span>}
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
          data-testid="language-selector-overlay"
        />
      )}
    </div>
  );
}
