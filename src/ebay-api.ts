import axios, { AxiosInstance } from 'axios';
import FormData from 'form-data';
import fs from 'fs/promises';
import { VintageItem, ListingData } from './types.js';

export interface EbayConfig {
  appId: string;
  certId: string;
  devId: string;
  authToken: string;  // OAuth token
  sandbox?: boolean;
}

export interface EbayListingResponse {
  itemId: string;
  listingUrl: string;
  fees: {
    insertionFee: number;
    totalFees: number;
  };
}

export class EbayAPI {
  private config: EbayConfig;
  private client: AxiosInstance;
  private baseUrl: string;

  constructor(config: EbayConfig) {
    this.config = config;
    this.baseUrl = config.sandbox
      ? 'https://api.sandbox.ebay.com'
      : 'https://api.ebay.com';

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'X-EBAY-API-SITEID': '0', // US site
        'X-EBAY-API-COMPATIBILITY-LEVEL': '967',
      },
    });
  }

  /**
   * Create and publish a listing to eBay
   */
  async createListing(item: VintageItem, autoPublish = true): Promise<EbayListingResponse> {
    const { analysis } = item;

    // Step 1: Upload images to eBay Picture Services (EPS)
    const imageUrls = await this.uploadImages(item.imagePaths);

    // Step 2: Create the listing using Trading API
    const listingPayload = {
      Item: {
        Title: this.formatTitle(analysis.title),
        Description: this.formatDescription(analysis),
        PrimaryCategory: {
          CategoryID: await this.findBestCategory(analysis.category),
        },
        StartPrice: analysis.suggestedPrice.recommended.toString(),
        ConditionID: this.mapCondition(analysis.condition),
        Country: 'US',
        Currency: 'USD',
        DispatchTimeMax: 3,
        ListingDuration: 'GTC', // Good 'til Cancelled
        ListingType: 'FixedPriceItem',
        PaymentMethods: 'PayPal',
        PayPalEmailAddress: process.env.PAYPAL_EMAIL || '',
        PictureDetails: {
          PictureURL: imageUrls,
        },
        PostalCode: process.env.SHIP_FROM_ZIP || '90210',
        Quantity: 1,
        ReturnPolicy: {
          ReturnsAcceptedOption: 'ReturnsAccepted',
          RefundOption: 'MoneyBack',
          ReturnsWithinOption: 'Days_30',
          ShippingCostPaidByOption: 'Buyer',
        },
        ShippingDetails: {
          ShippingType: 'Calculated',
          ShippingServiceOptions: [{
            ShippingService: 'USPSPriority',
            FreeShipping: false,
          }],
        },
        Site: 'US',
      },
    };

    try {
      const response = await this.callTradingAPI('AddFixedPriceItem', listingPayload);

      return {
        itemId: response.ItemID,
        listingUrl: `https://www.ebay.com/itm/${response.ItemID}`,
        fees: {
          insertionFee: parseFloat(response.Fees?.InsertionFee?.Value || '0'),
          totalFees: parseFloat(response.Fees?.TotalFees?.Value || '0'),
        },
      };
    } catch (error) {
      console.error('eBay listing creation failed:', error);
      throw new Error(`Failed to create eBay listing: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload images to eBay Picture Services
   */
  private async uploadImages(imagePaths: string[]): Promise<string[]> {
    const uploadedUrls: string[] = [];

    for (const imagePath of imagePaths.slice(0, 12)) { // eBay allows max 12 images
      try {
        const imageData = await fs.readFile(imagePath);
        const formData = new FormData();
        formData.append('file', imageData, { filename: 'image.jpg' });

        const response = await this.callTradingAPI('UploadSiteHostedPictures', {
          PictureName: `vintage_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        }, formData);

        if (response.SiteHostedPictureDetails?.FullURL) {
          uploadedUrls.push(response.SiteHostedPictureDetails.FullURL);
        }
      } catch (error) {
        console.error(`Failed to upload image ${imagePath}:`, error);
      }
    }

    return uploadedUrls;
  }

  /**
   * Call eBay Trading API
   */
  private async callTradingAPI(callName: string, payload: any, formData?: FormData): Promise<any> {
    const headers = {
      'X-EBAY-API-CALL-NAME': callName,
      'X-EBAY-API-CERT-NAME': this.config.certId,
      'X-EBAY-API-APP-NAME': this.config.appId,
      'X-EBAY-API-DEV-NAME': this.config.devId,
      'X-EBAY-API-SITEID': '0',
      ...( formData ? formData.getHeaders() : {}),
    };

    const xmlPayload = this.buildXMLRequest(callName, payload);

    try {
      const response = await axios.post(
        `${this.baseUrl}/ws/api.dll`,
        formData || xmlPayload,
        { headers }
      );

      return this.parseXMLResponse(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Build XML request for eBay Trading API
   */
  private buildXMLRequest(callName: string, data: any): string {
    // Simplified XML builder - in production, use a proper XML library
    let xml = `<?xml version="1.0" encoding="utf-8"?>`;
    xml += `<${callName}Request xmlns="urn:ebay:apis:eBLBaseComponents">`;
    xml += `<RequesterCredentials><eBayAuthToken>${this.config.authToken}</eBayAuthToken></RequesterCredentials>`;
    xml += this.objectToXML(data);
    xml += `</${callName}Request>`;
    return xml;
  }

  /**
   * Convert object to XML (simplified)
   */
  private objectToXML(obj: any, indent = ''): string {
    let xml = '';
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      if (Array.isArray(value)) {
        value.forEach(item => {
          xml += `${indent}<${key}>${typeof item === 'object' ? this.objectToXML(item, indent + '  ') : item}</${key}>`;
        });
      } else if (typeof value === 'object') {
        xml += `${indent}<${key}>${this.objectToXML(value, indent + '  ')}</${key}>`;
      } else {
        xml += `${indent}<${key}>${this.escapeXML(String(value))}</${key}>`;
      }
    }
    return xml;
  }

  /**
   * Parse XML response (simplified)
   */
  private parseXMLResponse(xml: string): any {
    // In production, use a proper XML parser like fast-xml-parser
    // This is a simplified version
    const match = xml.match(/<ItemID>(\d+)<\/ItemID>/);
    return {
      ItemID: match ? match[1] : null,
      // Add more parsing as needed
    };
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Format title for eBay (80 char limit)
   */
  private formatTitle(title: string): string {
    if (title.length <= 80) return title;
    return title.substring(0, 77) + '...';
  }

  /**
   * Format description with HTML for eBay
   */
  private formatDescription(analysis: any): string {
    let html = `<![CDATA[`;
    html += `<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">`;
    html += `<h2 style="color: #333;">${analysis.title}</h2>`;
    html += `<p style="font-size: 14px; line-height: 1.6;">${analysis.description}</p>`;

    html += `<h3 style="color: #666; border-bottom: 2px solid #ddd; padding-bottom: 5px;">Details</h3>`;
    html += `<ul style="font-size: 14px;">`;
    html += `<li><strong>Era:</strong> ${analysis.era}</li>`;
    html += `<li><strong>Condition:</strong> ${analysis.condition}</li>`;
    if (analysis.brandOrMaker) {
      html += `<li><strong>Brand:</strong> ${analysis.brandOrMaker}</li>`;
    }
    html += `</ul>`;

    if (analysis.flaws?.length) {
      html += `<h3 style="color: #c00;">⚠️ Please Note</h3>`;
      html += `<ul style="font-size: 14px; color: #666;">`;
      analysis.flaws.forEach((flaw: string) => {
        html += `<li>${flaw}</li>`;
      });
      html += `</ul>`;
    }

    html += `<p style="font-size: 12px; color: #999; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px;">`;
    html += `AI-analyzed vintage item. Fast shipping. Questions? Feel free to ask!`;
    html += `</p>`;
    html += `</div>`;
    html += `]]>`;
    return html;
  }

  /**
   * Find best category for the item
   */
  private async findBestCategory(category: string): Promise<string> {
    // Map common categories to eBay category IDs
    const categoryMap: Record<string, string> = {
      'Women\'s Vintage Clothing': '175759',
      'Men\'s Vintage Clothing': '175758',
      'Vintage Jewelry': '48579',
      'Vintage Accessories': '175756',
      'Vintage Home Decor': '20679',
      'Collectibles': '1',
    };

    return categoryMap[category] || '20081'; // Default: Vintage category
  }

  /**
   * Map condition to eBay condition ID
   */
  private mapCondition(condition: string): string {
    const conditionMap: Record<string, string> = {
      'New': '1000',
      'Like New': '1500',
      'Excellent': '2000',
      'Very Good': '2500',
      'Good': '3000',
      'Acceptable': '4000',
      'For Parts': '7000',
    };

    return conditionMap[condition] || '3000'; // Default: Good
  }

  /**
   * Get listing status
   */
  async getListingStatus(itemId: string): Promise<any> {
    const payload = {
      ItemID: itemId,
      DetailLevel: 'ReturnAll',
    };

    return await this.callTradingAPI('GetItem', payload);
  }

  /**
   * End a listing
   */
  async endListing(itemId: string, reason: string = 'NotAvailable'): Promise<void> {
    const payload = {
      ItemID: itemId,
      EndingReason: reason,
    };

    await this.callTradingAPI('EndFixedPriceItem', payload);
  }
}
