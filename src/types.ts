export interface VintageItem {
  id: string;
  imagePaths: string[];
  analysis: ItemAnalysis;
  listing?: ListingData;
  createdAt: Date;
}

export interface ItemAnalysis {
  title: string;
  description: string;
  category: string;
  era: string;
  condition: string;
  conditionDetails: string[];
  keywords: string[];
  suggestedPrice: PriceRange;
  reasoning?: string; // Extended thinking output
  brandOrMaker?: string;
  materials?: string[];
  measurements?: string;
  flaws?: string[];
}

export interface PriceRange {
  low: number;
  high: number;
  recommended: number;
  reasoning: string;
}

export interface ListingData {
  platform: 'ebay' | 'depop' | 'poshmark';
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  shipping: ShippingDetails;
  status: 'draft' | 'posted' | 'sold';
  url?: string;
}

export interface ShippingDetails {
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shippingType: 'calculated' | 'flat' | 'free';
  cost?: number;
}

export interface AnalyzeOptions {
  useExtendedThinking?: boolean;
  targetPlatforms?: Array<'ebay' | 'depop' | 'poshmark'>;
  priceResearch?: boolean;
}
