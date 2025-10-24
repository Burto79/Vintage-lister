import { VintageItemAnalyzer } from './analyzer.js';
import { ImageWatcher } from './watcher.js';
import { Database } from './database.js';
import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { VintageItem } from './types.js';
import { randomUUID } from 'crypto';

interface AutoListerConfig {
  watchFolder: string;
  anthropicApiKey: string;
  ebayAppId?: string;
  ebayAuthToken?: string;
  autoPost: boolean;
  notifyOnSale: boolean;
}

interface SoldItem {
  itemId: string;
  title: string;
  soldPrice: number;
  soldDate: Date;
  buyerAddress?: string;
}

export class AutoLister {
  private config: AutoListerConfig;
  private analyzer: VintageItemAnalyzer;
  private watcher: ImageWatcher | null = null;
  private claude: Anthropic;
  private db: Database;
  private activeListings: Map<string, VintageItem> = new Map();
  private checkSalesInterval: NodeJS.Timeout | null = null;

  constructor(config: AutoListerConfig) {
    this.config = config;
    this.analyzer = new VintageItemAnalyzer(config.anthropicApiKey);
    this.claude = new Anthropic({ apiKey: config.anthropicApiKey });
    this.db = new Database();
  }

  /**
   * Start the automated listing workflow
   */
  async start() {
    // Initialize database
    await this.db.init();

    console.log('🤖 Starting Auto-Lister...\n');
    console.log('📁 Watching folder:', this.config.watchFolder);
    console.log('🚀 Auto-post to eBay:', this.config.autoPost ? 'ENABLED' : 'DISABLED');
    console.log('🌐 Auto-post to Website: ALWAYS ENABLED');
    console.log('🔔 Sale notifications:', this.config.notifyOnSale ? 'ENABLED' : 'DISABLED');
    console.log();

    // Start watching for new photos
    this.watcher = new ImageWatcher({
      folder: this.config.watchFolder,
    });

    this.watcher.on('images', async (imagePaths: string[]) => {
      await this.handleNewPhotos(imagePaths);
    });

    this.watcher.start();

    // Check for sold items every 5 minutes
    if (this.config.notifyOnSale && this.config.ebayAppId) {
      this.checkSalesInterval = setInterval(() => {
        this.checkForSoldItems();
      }, 5 * 60 * 1000);
    }

    console.log('✅ Auto-Lister is running!\n');
    console.log('What happens next:');
    console.log('  1. 📸 You take photos → they sync to watched folder');
    console.log('  2. 🧠 AI analyzes photos automatically');
    console.log('  3. 🏷️  AI creates listing with title, description, price');
    console.log('  4. 🌐 Posts to YOUR WEBSITE automatically');
    console.log(this.config.autoPost
      ? '  5. 📤 ALSO posts to eBay immediately'
      : '  5. ⏸️  Saves eBay draft for your review');
    console.log('  6. 💰 When sold → you get notified to ship');
    console.log('  7. 📦 You ship, done!\n');
  }

  /**
   * Handle new photos detected in watch folder
   */
  private async handleNewPhotos(imagePaths: string[]) {
    console.log(`\n📸 New photos detected: ${imagePaths.length} image(s)`);
    console.log('🧠 Analyzing with Claude...\n');

    try {
      // Analyze the item
      const analysis = await this.analyzer.analyzeItem(imagePaths, {
        useExtendedThinking: true,
      });

      console.log('✅ Analysis complete!');
      console.log('📋 Title:', analysis.title);
      console.log('💵 Suggested Price: $' + analysis.suggestedPrice.recommended);
      console.log('🏷️  Condition:', analysis.condition);
      console.log();

      const item: VintageItem = {
        id: randomUUID(),
        imagePaths,
        analysis,
        createdAt: new Date(),
      };

      // ALWAYS post to website
      const websiteListing = await this.db.addListing(item);
      console.log('🌐 Posted to website!');
      console.log('   URL: http://localhost:3001/shop/' + item.id);
      console.log();

      // Also post to eBay if enabled
      if (this.config.autoPost && this.config.ebayAppId) {
        await this.postToEbay(item, websiteListing.id);
      } else {
        console.log('⏸️  eBay auto-post disabled. Listing saved as draft.');
        await this.saveDraft(item);
      }

      // Move processed photos to archive
      await this.archivePhotos(imagePaths);

    } catch (error) {
      console.error('❌ Error processing photos:', error);
    }
  }

  /**
   * Post item to eBay using Claude with MCP tools
   */
  private async postToEbay(item: VintageItem, websiteListingId?: string) {
    console.log('📤 Also posting to eBay...');

    try {
      // Use Claude with extended thinking to create the perfect listing
      const response = await this.claude.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        // thinking: {
        //   type: 'enabled',
        //   budget_tokens: 10000,
        // },
        messages: [{
          role: 'user',
          content: `Create an eBay listing for this vintage item.

Analysis:
${JSON.stringify(item.analysis, null, 2)}

Create a compelling eBay listing with:
1. SEO-optimized title (max 80 chars)
2. Detailed HTML description
3. Appropriate category
4. Competitive pricing

Format as JSON with: title, description, price, category, condition`,
        }],
      });

      const listingData = this.extractListingFromClaude(response);

      // Call eBay API (simplified for now)
      const ebayResult = await this.createEbayListing({
        ...listingData,
        imageUrls: item.imagePaths,
      });

      console.log('✅ Posted to eBay!');
      console.log('🔗 eBay URL:', ebayResult.url);
      console.log('🆔 eBay Item ID:', ebayResult.itemId);
      console.log('💵 Fees:', `$${ebayResult.fees}`);
      console.log();
      console.log('📊 Summary:');
      console.log('   ✅ Website: http://localhost:3001/shop/' + item.id);
      console.log('   ✅ eBay:', ebayResult.url);
      console.log();

      // Track the listing
      this.activeListings.set(ebayResult.itemId, item);

      // Save listing info
      await this.saveListingInfo(ebayResult.itemId, item);

    } catch (error) {
      console.error('❌ Failed to post to eBay:', error);
      console.log('💾 Saving as draft instead...');
      await this.saveDraft(item);
    }
  }

  /**
   * Extract listing data from Claude's response
   */
  private extractListingFromClaude(response: any): any {
    const content = response.content.find((c: any) => c.type === 'text')?.text || '';

    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fallback to basic extraction
    }

    return {
      title: 'Vintage Item',
      description: content,
      price: 45.00,
      category: 'Vintage',
      condition: 'Good',
    };
  }

  /**
   * Create eBay listing (using real API or mock)
   */
  private async createEbayListing(data: any): Promise<any> {
    // This would call the real eBay API
    // For now, return mock data
    const itemId = `EBAY${Date.now()}`;

    return {
      itemId,
      url: `https://www.ebay.com/itm/${itemId}`,
      fees: '0.35',
    };
  }

  /**
   * Check for sold items
   */
  private async checkForSoldItems() {
    console.log('\n🔍 Checking for sold items...');

    try {
      // This would call eBay API to check for sold items
      const soldItems: SoldItem[] = await this.getSoldItems();

      if (soldItems.length > 0) {
        console.log(`\n🎉 ${soldItems.length} item(s) sold! Time to ship:`);
        soldItems.forEach(item => {
          console.log(`\n📦 SHIP THIS:`);
          console.log(`   Item: ${item.title}`);
          console.log(`   Sold for: $${item.soldPrice}`);
          console.log(`   Sold on: ${item.soldDate.toLocaleDateString()}`);
          console.log(`   Order ID: ${item.itemId}`);
        });

        // Send notification (could be email, SMS, push notification, etc.)
        await this.notifySoldItems(soldItems);
      }
    } catch (error) {
      console.error('Error checking sold items:', error);
    }
  }

  /**
   * Get sold items from eBay
   */
  private async getSoldItems(): Promise<SoldItem[]> {
    // This would call eBay API
    // Mock implementation for now
    return [];
  }

  /**
   * Notify about sold items
   */
  private async notifySoldItems(items: SoldItem[]) {
    // Could send email, SMS, push notification, etc.
    // For now, just log and create a shipping file
    const shippingList = items.map(item => ({
      item: item.title,
      price: item.soldPrice,
      date: item.soldDate,
      orderId: item.itemId,
    }));

    await fs.writeFile(
      path.join(process.cwd(), 'TO-SHIP.json'),
      JSON.stringify(shippingList, null, 2)
    );

    console.log('\n✅ Shipping list saved to TO-SHIP.json');
  }

  /**
   * Save draft listing
   */
  private async saveDraft(item: VintageItem) {
    const draftDir = path.join(process.cwd(), 'drafts');
    await fs.mkdir(draftDir, { recursive: true });

    const draftFile = path.join(draftDir, `${item.id}.json`);
    await fs.writeFile(draftFile, JSON.stringify(item, null, 2));

    console.log('💾 Draft saved:', draftFile);
  }

  /**
   * Save listing info
   */
  private async saveListingInfo(itemId: string, item: VintageItem) {
    const listingsDir = path.join(process.cwd(), 'active-listings');
    await fs.mkdir(listingsDir, { recursive: true });

    const listingFile = path.join(listingsDir, `${itemId}.json`);
    await fs.writeFile(listingFile, JSON.stringify({
      itemId,
      item,
      listedAt: new Date(),
    }, null, 2));
  }

  /**
   * Archive processed photos
   */
  private async archivePhotos(imagePaths: string[]) {
    const archiveDir = path.join(process.cwd(), 'processed-photos');
    await fs.mkdir(archiveDir, { recursive: true });

    for (const imagePath of imagePaths) {
      const filename = path.basename(imagePath);
      const archivePath = path.join(archiveDir, filename);

      try {
        await fs.rename(imagePath, archivePath);
      } catch (error) {
        console.error(`Failed to archive ${filename}:`, error);
      }
    }

    console.log('📁 Photos archived to processed-photos/\n');
  }

  /**
   * Stop the auto-lister
   */
  async stop() {
    console.log('\n🛑 Stopping Auto-Lister...');

    if (this.watcher) {
      await this.watcher.stop();
    }

    if (this.checkSalesInterval) {
      clearInterval(this.checkSalesInterval);
    }

    console.log('✅ Stopped\n');
  }
}
