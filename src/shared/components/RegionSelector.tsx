'use client';

import { useState } from 'react';
import { regionService, SUPPORTED_REGIONS } from '@/shared/config/regionService';

interface RegionSelectorProps {
  className?: string;
}

export default function RegionSelector({ className = '' }: RegionSelectorProps) {
  const [currentRegion, setCurrentRegion] = useState(regionService.getCurrentRegion());
  const [isOpen, setIsOpen] = useState(false);

  const handleRegionChange = (regionCode: string) => {
    if (regionCode === regionService.getRegionFromDomain()) {
      // If selecting the detected region, clear override
      regionService.clearRegionOverride();
    } else {
      // Set region override
      regionService.setRegionOverride(regionCode);
    }
    setCurrentRegion(regionCode);
    setIsOpen(false);
    
    // Reload page to apply region change
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  const detectedRegion = regionService.getRegionFromDomain();
  const currentRegionInfo = regionService.getRegionInfo(currentRegion);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
        data-testid="region-selector-button"
      >
        <span>🌍</span>
        <span>{currentRegionInfo?.name || 'Global'}</span>
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
          {SUPPORTED_REGIONS.map((region) => (
            <button
              key={region.code}
              onClick={() => handleRegionChange(region.code)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                currentRegion === region.code ? 'bg-blue-50 text-blue-700' : ''
              }`}
              data-testid={`region-option-${region.code}`}
            >
              <span>{region.name}</span>
              {region.code === detectedRegion && (
                <span className="text-xs text-gray-500">(detected)</span>
              )}
              {currentRegion === region.code && (
                <span className="text-blue-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
          data-testid="region-selector-overlay"
        />
      )}
    </div>
  );
}