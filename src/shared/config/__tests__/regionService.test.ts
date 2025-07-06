import { regionService, SUPPORTED_REGIONS } from '../regionService';

describe('Region Service', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getRegionFromDomain', () => {
    it('should return "eu" for European domains', () => {
      expect(regionService.getRegionFromDomain('app.eu')).toBe('eu');
      expect(regionService.getRegionFromDomain('tell-a-tale.europe.com')).toBe('eu');
    });

    it('should return "ap" for Asia Pacific domains', () => {
      expect(regionService.getRegionFromDomain('app.ap')).toBe('ap');
      expect(regionService.getRegionFromDomain('tell-a-tale.asia.com')).toBe('ap');
    });

    it('should return "us" for US domains', () => {
      expect(regionService.getRegionFromDomain('app.us')).toBe('us');
      expect(regionService.getRegionFromDomain('tell-a-tale.america.com')).toBe('us');
    });

    it('should return "global" for unknown domains', () => {
      expect(regionService.getRegionFromDomain('example.com')).toBe('global');
      expect(regionService.getRegionFromDomain('localhost')).toBe('global');
    });
  });

  describe('getCurrentRegion', () => {
    it('should return stored region from localStorage if valid', () => {
      localStorage.setItem('userRegion', 'eu');
      expect(regionService.getCurrentRegion()).toBe('eu');
    });

    it('should ignore invalid stored region and use domain detection', () => {
      localStorage.setItem('userRegion', 'invalid');
      // Without explicit hostname, should return global
      expect(regionService.getCurrentRegion()).toBe('global');
    });

    it('should use domain detection when no stored region', () => {
      // Without explicit hostname, should return global
      expect(regionService.getCurrentRegion()).toBe('global');
    });
  });

  describe('setRegionOverride', () => {
    it('should store valid region code in localStorage', () => {
      regionService.setRegionOverride('eu');
      expect(localStorage.getItem('userRegion')).toBe('eu');
    });

    it('should not store invalid region code', () => {
      regionService.setRegionOverride('invalid');
      expect(localStorage.getItem('userRegion')).toBeNull();
    });
  });

  describe('clearRegionOverride', () => {
    it('should remove userRegion from localStorage', () => {
      localStorage.setItem('userRegion', 'eu');
      regionService.clearRegionOverride();
      expect(localStorage.getItem('userRegion')).toBeNull();
    });
  });

  describe('getRegionInfo', () => {
    it('should return region info for valid code', () => {
      const region = regionService.getRegionInfo('eu');
      expect(region).toEqual({ code: 'eu', name: 'Europe', path: 'eu' });
    });

    it('should return undefined for invalid code', () => {
      const region = regionService.getRegionInfo('invalid');
      expect(region).toBeUndefined();
    });
  });

  describe('getRegionPath', () => {
    it('should return path for specified region code', () => {
      expect(regionService.getRegionPath('eu')).toBe('eu');
      expect(regionService.getRegionPath('us')).toBe('us');
    });

    it('should return path for current region when no code specified', () => {
      localStorage.setItem('userRegion', 'ap');
      expect(regionService.getRegionPath()).toBe('ap');
    });

    it('should return "global" for invalid region code', () => {
      expect(regionService.getRegionPath('invalid')).toBe('global');
    });
  });

  describe('SUPPORTED_REGIONS', () => {
    it('should contain all required regions', () => {
      expect(SUPPORTED_REGIONS).toEqual([
        { code: 'us', name: 'United States', path: 'us' },
        { code: 'eu', name: 'Europe', path: 'eu' },
        { code: 'ap', name: 'Asia Pacific', path: 'ap' },
        { code: 'global', name: 'Global', path: 'global' },
      ]);
    });
  });
});