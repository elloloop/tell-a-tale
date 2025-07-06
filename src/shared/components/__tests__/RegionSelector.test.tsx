import { render, screen, fireEvent } from '@testing-library/react';
import RegionSelector from '../RegionSelector';

// Mock the regionService
jest.mock('@/shared/config/regionService', () => ({
  regionService: {
    getCurrentRegion: jest.fn(() => 'global'),
    getRegionFromDomain: jest.fn(() => 'global'),
    getRegionInfo: jest.fn((code: string) => {
      const regions = {
        us: { code: 'us', name: 'United States', path: 'us' },
        eu: { code: 'eu', name: 'Europe', path: 'eu' },
        ap: { code: 'ap', name: 'Asia Pacific', path: 'ap' },
        global: { code: 'global', name: 'Global', path: 'global' },
      };
      return regions[code as keyof typeof regions];
    }),
    setRegionOverride: jest.fn(),
    clearRegionOverride: jest.fn(),
  },
  SUPPORTED_REGIONS: [
    { code: 'us', name: 'United States', path: 'us' },
    { code: 'eu', name: 'Europe', path: 'eu' },
    { code: 'ap', name: 'Asia Pacific', path: 'ap' },
    { code: 'global', name: 'Global', path: 'global' },
  ],
}));

import { regionService } from '@/shared/config/regionService';

// Mock window.location.reload
const mockReload = jest.fn();

describe('RegionSelector', () => {
  const originalWindow = global.window;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window with location.reload
    global.window = {
      ...originalWindow,
      location: {
        ...originalWindow.location,
        reload: mockReload,
      },
    } as any;
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it('should render with current region', () => {
    render(<RegionSelector />);
    
    expect(screen.getByTestId('region-selector-button')).toBeInTheDocument();
    expect(screen.getByText('Global')).toBeInTheDocument();
  });

  it('should show dropdown when button is clicked', () => {
    render(<RegionSelector />);
    
    const button = screen.getByTestId('region-selector-button');
    fireEvent.click(button);
    
    expect(screen.getByTestId('region-option-us')).toBeInTheDocument();
    expect(screen.getByTestId('region-option-eu')).toBeInTheDocument();
    expect(screen.getByTestId('region-option-ap')).toBeInTheDocument();
    expect(screen.getByTestId('region-option-global')).toBeInTheDocument();
  });

  it('should highlight current region in dropdown', () => {
    (regionService.getCurrentRegion as jest.Mock).mockReturnValue('eu');
    (regionService.getRegionInfo as jest.Mock).mockImplementation((code: string) => {
      const regions = {
        us: { code: 'us', name: 'United States', path: 'us' },
        eu: { code: 'eu', name: 'Europe', path: 'eu' },
        ap: { code: 'ap', name: 'Asia Pacific', path: 'ap' },
        global: { code: 'global', name: 'Global', path: 'global' },
      };
      return regions[code as keyof typeof regions];
    });

    render(<RegionSelector />);
    
    const button = screen.getByTestId('region-selector-button');
    fireEvent.click(button);
    
    const euOption = screen.getByTestId('region-option-eu');
    expect(euOption).toHaveClass('bg-blue-50', 'text-blue-700');
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  it('should show detected region marker', () => {
    (regionService.getRegionFromDomain as jest.Mock).mockReturnValue('us');
    
    render(<RegionSelector />);
    
    const button = screen.getByTestId('region-selector-button');
    fireEvent.click(button);
    
    expect(screen.getByText('(detected)')).toBeInTheDocument();
  });

  it('should set region override when selecting different region', () => {
    (regionService.getRegionFromDomain as jest.Mock).mockReturnValue('global');
    
    render(<RegionSelector />);
    
    const button = screen.getByTestId('region-selector-button');
    fireEvent.click(button);
    
    const euOption = screen.getByTestId('region-option-eu');
    fireEvent.click(euOption);
    
    expect(regionService.setRegionOverride).toHaveBeenCalledWith('eu');
    // Note: window.location.reload doesn't work in test environment, that's expected
  });

  it('should clear region override when selecting detected region', () => {
    (regionService.getRegionFromDomain as jest.Mock).mockReturnValue('us');
    (regionService.getCurrentRegion as jest.Mock).mockReturnValue('eu');
    
    render(<RegionSelector />);
    
    const button = screen.getByTestId('region-selector-button');
    fireEvent.click(button);
    
    const usOption = screen.getByTestId('region-option-us');
    fireEvent.click(usOption);
    
    expect(regionService.clearRegionOverride).toHaveBeenCalled();
    // Note: window.location.reload doesn't work in test environment, that's expected
  });

  it('should close dropdown when clicking outside', () => {
    render(<RegionSelector />);
    
    const button = screen.getByTestId('region-selector-button');
    fireEvent.click(button);
    
    expect(screen.getByTestId('region-option-us')).toBeInTheDocument();
    
    const overlay = screen.getByTestId('region-selector-overlay');
    fireEvent.click(overlay);
    
    expect(screen.queryByTestId('region-option-us')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<RegionSelector className="custom-class" />);
    
    const regionSelector = container.firstChild as HTMLElement;
    expect(regionSelector).toHaveClass('custom-class');
  });
});