import fs from 'fs/promises';
import path from 'path';
import { VintageItem } from './types.js';

export interface WebsiteListing {
  id: string;
  item: VintageItem;
  status: 'active' | 'sold' | 'archived';
  postedAt: Date;
  soldAt?: Date;
  ebayItemId?: string;
  ebayUrl?: string;
  views: number;
  featured: boolean;
}

/**
 * Simple JSON-based database for website listings
 * In production, use a real database like PostgreSQL, MongoDB, etc.
 */
export class Database {
  private dbPath: string;
  private listings: Map<string, WebsiteListing> = new Map();

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(process.cwd(), 'data', 'listings.json');
  }

  /**
   * Initialize database
   */
  async init() {
    const dir = path.dirname(this.dbPath);
    await fs.mkdir(dir, { recursive: true });

    try {
      const data = await fs.readFile(this.dbPath, 'utf-8');
      const listings = JSON.parse(data);
      this.listings = new Map(Object.entries(listings));
    } catch (error) {
      // Database doesn't exist yet, start fresh
      this.listings = new Map();
      await this.save();
    }
  }

  /**
   * Save database to disk
   */
  private async save() {
    const data = Object.fromEntries(this.listings);
    await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2));
  }

  /**
   * Add a new listing
   */
  async addListing(item: VintageItem, ebayData?: { itemId: string; url: string }): Promise<WebsiteListing> {
    const listing: WebsiteListing = {
      id: item.id,
      item,
      status: 'active',
      postedAt: new Date(),
      ebayItemId: ebayData?.itemId,
      ebayUrl: ebayData?.url,
      views: 0,
      featured: false,
    };

    this.listings.set(item.id, listing);
    await this.save();

    return listing;
  }

  /**
   * Get all active listings
   */
  async getActiveListings(): Promise<WebsiteListing[]> {
    return Array.from(this.listings.values())
      .filter(l => l.status === 'active')
      .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
  }

  /**
   * Get listing by ID
   */
  async getListing(id: string): Promise<WebsiteListing | null> {
    return this.listings.get(id) || null;
  }

  /**
   * Mark listing as sold
   */
  async markAsSold(id: string): Promise<void> {
    const listing = this.listings.get(id);
    if (listing) {
      listing.status = 'sold';
      listing.soldAt = new Date();
      await this.save();
    }
  }

  /**
   * Increment view count
   */
  async incrementViews(id: string): Promise<void> {
    const listing = this.listings.get(id);
    if (listing) {
      listing.views++;
      await this.save();
    }
  }

  /**
   * Set featured status
   */
  async setFeatured(id: string, featured: boolean): Promise<void> {
    const listing = this.listings.get(id);
    if (listing) {
      listing.featured = featured;
      await this.save();
    }
  }

  /**
   * Delete listing
   */
  async deleteListing(id: string): Promise<void> {
    this.listings.delete(id);
    await this.save();
  }

  /**
   * Get statistics
   */
  async getStats() {
    const all = Array.from(this.listings.values());
    return {
      total: all.length,
      active: all.filter(l => l.status === 'active').length,
      sold: all.filter(l => l.status === 'sold').length,
      totalViews: all.reduce((sum, l) => sum + l.views, 0),
      totalRevenue: all
        .filter(l => l.status === 'sold')
        .reduce((sum, l) => sum + (l.item.analysis.suggestedPrice.recommended || 0), 0),
    };
  }
}
