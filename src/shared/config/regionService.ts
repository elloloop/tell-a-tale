export interface Region {
  code: string;
  name: string;
  path: string;
}

export const SUPPORTED_REGIONS: Region[] = [
  { code: 'us', name: 'United States', path: 'us' },
  { code: 'eu', name: 'Europe', path: 'eu' },
  { code: 'ap', name: 'Asia Pacific', path: 'ap' },
  { code: 'global', name: 'Global', path: 'global' },
];

export const regionService = {
  // Parse region from hostname/domain
  getRegionFromDomain: (hostname?: string): string => {
    if (!hostname && typeof window !== 'undefined') {
      hostname = window.location.hostname;
    }
    
    if (!hostname) return 'global';
    
    // Simple domain-based region detection
    if (hostname.includes('.eu') || hostname.includes('europe')) {
      return 'eu';
    }
    if (hostname.includes('.ap') || hostname.includes('asia')) {
      return 'ap';
    }
    if (hostname.includes('.us') || hostname.includes('america')) {
      return 'us';
    }
    
    // Default to global for unknown domains
    return 'global';
  },

  // Get region from localStorage override or domain
  getCurrentRegion: (): string => {
    if (typeof window !== 'undefined') {
      const storedRegion = window.localStorage.getItem('userRegion');
      if (storedRegion && SUPPORTED_REGIONS.some(r => r.code === storedRegion)) {
        return storedRegion;
      }
    }
    return regionService.getRegionFromDomain();
  },

  // Set region override in localStorage
  setRegionOverride: (regionCode: string): void => {
    if (typeof window !== 'undefined') {
      if (SUPPORTED_REGIONS.some(r => r.code === regionCode)) {
        window.localStorage.setItem('userRegion', regionCode);
      }
    }
  },

  // Clear region override
  clearRegionOverride: (): void => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('userRegion');
    }
  },

  // Get region info by code
  getRegionInfo: (code: string): Region | undefined => {
    return SUPPORTED_REGIONS.find(r => r.code === code);
  },

  // Get region path for S3 structure
  getRegionPath: (regionCode?: string): string => {
    const code = regionCode || regionService.getCurrentRegion();
    const region = regionService.getRegionInfo(code);
    return region?.path || 'global';
  },
};