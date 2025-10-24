import chokidar, { FSWatcher } from 'chokidar';
import path from 'path';
import { EventEmitter } from 'events';

export interface WatcherOptions {
  folder: string;
  fileTypes?: string[];
  debounceMs?: number;
}

export class ImageWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null;
  private options: Required<WatcherOptions>;
  private newImages: Set<string> = new Set();
  private debounceTimer: NodeJS.Timeout | null = null;

  constructor(options: WatcherOptions) {
    super();
    this.options = {
      fileTypes: ['.jpg', '.jpeg', '.png', '.heic', '.webp'],
      debounceMs: 2000,
      ...options,
    };
  }

  /**
   * Start watching folder for new images
   */
  start(): void {
    console.log(`📸 Watching folder: ${this.options.folder}`);
    console.log(`   File types: ${this.options.fileTypes.join(', ')}`);

    this.watcher = chokidar.watch(this.options.folder, {
      persistent: true,
      ignoreInitial: true, // Don't process existing files
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
    });

    this.watcher.on('add', (filePath: string) => {
      const ext = path.extname(filePath).toLowerCase();
      if (this.options.fileTypes.includes(ext)) {
        this.handleNewImage(filePath);
      }
    });

    this.watcher.on('error', (error: unknown) => {
      this.emit('error', error);
    });

    this.emit('started');
  }

  /**
   * Stop watching
   */
  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.emit('stopped');
  }

  /**
   * Handle new image with debouncing (batch multiple images together)
   */
  private handleNewImage(filePath: string): void {
    console.log(`📷 New image detected: ${path.basename(filePath)}`);
    this.newImages.add(filePath);

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Wait for more images, then emit batch
    this.debounceTimer = setTimeout(() => {
      const images = Array.from(this.newImages);
      this.newImages.clear();
      this.emit('images', images);
    }, this.options.debounceMs);
  }

  /**
   * Check if folder exists and is accessible
   */
  static async validateFolder(folder: string): Promise<boolean> {
    try {
      const fs = await import('fs/promises');
      const stats = await fs.stat(folder);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }
}
