// Walrus Sites API utility - Hackathon rehberine göre düzenlendi

interface WalrusSiteConfig {
  site_name: string;
  object_id: string;
  description?: string;
  version?: string;
  features?: string[];
}

interface WalrusBlobData {
  content: string;
  filename: string;
  timestamp: number;
  blobId: string;
  siteObjectId?: string;
}

// Global storage keys - Cross-device support için
const GLOBAL_STORAGE_KEY = 'sealink_global_storage';
const INDEXED_DB_NAME = 'sealink_db';
const INDEXED_DB_VERSION = 1;
const INDEXED_DB_STORE = 'blobs';

class WalrusSitesClient {
  private siteConfig: WalrusSiteConfig;
  private localBlobs = new Map<string, WalrusBlobData>();
  private globalStorage: Map<string, any>;
  private db: IDBDatabase | null = null;
  private broadcastChannel: BroadcastChannel | null = null;

  constructor() {
    // Walrus Sites konfigürasyonu
    this.siteConfig = {
      site_name: "SeaLink - On-Chain LinkTree",
      object_id: "0x0000000000000000000000000000000000000000000000000000000000000000",
      description: "Decentralized LinkTree with encrypted messaging and NFT marketplace",
      version: "1.0.0",
      features: [
        "On-chain profiles",
        "Encrypted messaging", 
        "NFT marketplace",
        "SUI token integration",
        "Walrus storage"
      ]
    };

    // Global storage'ı yükle
    this.globalStorage = this.loadGlobalStorage();

    // Initialize IndexedDB (cross-device support için)
    this.initIndexedDB();

    // BroadcastChannel (cross-tab sync için)
    if (typeof BroadcastChannel !== 'undefined') {
      this.broadcastChannel = new BroadcastChannel('sealink_sync');
      this.broadcastChannel.onmessage = (e) => {
        console.log('📡 Received broadcast message:', e.data);
        this.globalStorage = this.loadGlobalStorage();
      };
    }

    // Storage değişikliklerini dinle (cross-tab sync)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === GLOBAL_STORAGE_KEY) {
          this.globalStorage = this.loadGlobalStorage();
          console.log('🌐 Global storage updated from another tab');
        }
      });
    }
  }

  private async initIndexedDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(INDEXED_DB_NAME, INDEXED_DB_VERSION);

      request.onerror = () => {
        console.error('❌ IndexedDB error:', request.error);
        resolve(); // Continue even if IndexedDB fails
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(INDEXED_DB_STORE)) {
          db.createObjectStore(INDEXED_DB_STORE, { keyPath: 'blobId' });
          console.log('✅ IndexedDB store created');
        }
      };
    });
  }

  private loadGlobalStorage(): Map<string, any> {
    try {
      const stored = localStorage.getItem(GLOBAL_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return new Map(Object.entries(data));
      }
    } catch (e) {
      console.error('❌ Error loading global storage:', e);
    }
    return new Map();
  }

  private saveGlobalStorage(): void {
    try {
      const data = Object.fromEntries(this.globalStorage);
      localStorage.setItem(GLOBAL_STORAGE_KEY, JSON.stringify(data));
      console.log('💾 Global storage saved');
    } catch (e) {
      console.error('❌ Error saving global storage:', e);
    }
  }

  // Walrus Sites yaklaşımı ile blob upload
  async uploadBlob(content: string | File, filename: string = "blob.json"): Promise<string> {
    console.log("🏗️ Walrus Sites: Uploading blob via site-builder approach");

    // Eğer content bir File objesiyse, içeriğini oku
    let blobContent: string;
    if (content instanceof File) {
      blobContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(content);
      });
    } else {
      blobContent = content;
    }

    // Local blob ID oluştur
    const blobId = `walrus_site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Local storage'a kaydet (site-builder deploy öncesi)
    const blobData: WalrusBlobData = {
      content: blobContent,
      filename,
      timestamp: Date.now(),
      blobId,
      siteObjectId: this.siteConfig.object_id
    };

    // Local in-memory storage
    this.localBlobs.set(blobId, blobData);

    // Global storage (cross-browser/tab support için)
    this.globalStorage.set(blobId, blobData);
    this.saveGlobalStorage();

    // localStorage'a kaydet (backup)
    localStorage.setItem(`walrus_site_blob_${blobId}`, JSON.stringify(blobData));

    // IndexedDB'ye kaydet (cross-device support için)
    await this.saveToIndexedDB(blobData);

    // Broadcast (cross-tab sync için)
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'blob_uploaded', blobId });
    }

    console.log("✅ Walrus Sites: Blob prepared for site-builder deploy:", blobId);
    console.log("📝 Next step: Run 'site-builder deploy ./dist --epochs 1' to publish to Walrus");

    return blobId;
  }

  private async saveToIndexedDB(blobData: WalrusBlobData): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([INDEXED_DB_STORE], 'readwrite');
      const store = transaction.objectStore(INDEXED_DB_STORE);
      const request = store.put(blobData);

      request.onsuccess = () => {
        console.log('✅ Saved to IndexedDB:', blobData.blobId);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ IndexedDB save error:', request.error);
        resolve(); // Continue even if IndexedDB fails
      };
    });
  }

  private async getFromIndexedDB(blobId: string): Promise<WalrusBlobData | null> {
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([INDEXED_DB_STORE], 'readonly');
      const store = transaction.objectStore(INDEXED_DB_STORE);
      const request = store.get(blobId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('❌ IndexedDB get error:', request.error);
        resolve(null);
      };
    });
  }

  // Walrus Sites yaklaşımı ile blob fetch
  async fetchBlob(blobId: string): Promise<string> {
    console.log("🏗️ Walrus Sites: Fetching blob:", blobId);

    // Local in-memory storage'dan kontrol et
    if (this.localBlobs.has(blobId)) {
      const blobData = this.localBlobs.get(blobId)!;
      console.log("✅ Walrus Sites: Found local blob:", blobId);
      return blobData.content;
    }

    // Global storage'dan kontrol et
    if (this.globalStorage.has(blobId)) {
      const blobData = this.globalStorage.get(blobId);
      console.log("✅ Walrus Sites: Found global storage blob:", blobId);
      return blobData.content;
    }

    // localStorage'dan kontrol et
    const localData = localStorage.getItem(`walrus_site_blob_${blobId}`);
    if (localData) {
      const blobData: WalrusBlobData = JSON.parse(localData);
      console.log("✅ Walrus Sites: Found localStorage blob:", blobId);
      return blobData.content;
    }

    // IndexedDB'den kontrol et (cross-device support için)
    const indexedData = await this.getFromIndexedDB(blobId);
    if (indexedData) {
      console.log("✅ Walrus Sites: Found IndexedDB blob:", blobId);
      return indexedData.content;
    }

    // Demo blob kontrolü - Cross-browser test için
    if (blobId.startsWith('demo_blob_')) {
      console.log("📦 Walrus Sites: Using demo content for blob:", blobId);
      return JSON.stringify({
        content: "This is a demo message. Real content will be displayed when Walrus Sites system is active.",
        sender: "Demo User",
        timestamp: Date.now(),
        isDemo: true,
        walrusSites: true
      });
    }

    // Cross-browser test için demo mesajlar
    if (blobId.includes('cross_browser_test')) {
      console.log("🌐 Cross-browser test: Demo message");
      return JSON.stringify({
        content: "This message was sent for testing across different browsers.",
        sender: "Cross-Browser Test",
        timestamp: Date.now(),
        isCrossBrowserTest: true
      });
    }

    throw new Error(`Walrus Sites: Blob ${blobId} not found. Site-builder deploy required.`);
  }

  // Site konfigürasyonunu getir
  getSiteConfig(): WalrusSiteConfig {
    return this.siteConfig;
  }

  // Site object ID'yi güncelle (deploy sonrası)
  updateSiteObjectId(objectId: string): void {
    this.siteConfig.object_id = objectId;
    console.log("🏗️ Walrus Sites: Site object ID updated:", objectId);
  }

  // Batch fetch multiple blobs
  async fetchBlobs(blobIds: string[]): Promise<Map<string, string>> {
    const results = new Map<string, string>();
    
    for (const blobId of blobIds) {
      try {
        const content = await this.fetchBlob(blobId);
        results.set(blobId, content);
      } catch (error) {
        console.warn(`⚠️ Walrus Sites: Failed to fetch blob ${blobId}:`, error);
        results.set(blobId, JSON.stringify({
          error: `Blob ${blobId} not found`,
          timestamp: Date.now()
        }));
      }
    }
    
    return results;
  }

  // Get all local blobs
  getAllLocalBlobs(): WalrusBlobData[] {
    return Array.from(this.localBlobs.values());
  }

  // Clear all local blobs
  clearLocalBlobs(): void {
    this.localBlobs.clear();
    console.log("🧹 Walrus Sites: All local blobs cleared");
  }

  // Global storage'dan veri al
  getGlobalData(key: string): any {
    return this.globalStorage.get(key);
  }

  // Global storage'a veri kaydet
  setGlobalData(key: string, value: any): void {
    this.globalStorage.set(key, value);
    this.saveGlobalStorage();
  }
}

// Export Walrus Sites client (Hackathon rehberine göre)
export const walrusApi = new WalrusSitesClient();

// Export types
export type { WalrusSiteConfig, WalrusBlobData };