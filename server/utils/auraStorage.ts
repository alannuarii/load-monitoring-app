/**
 * AuraStorage Integration Utility
 *
 * REST API client for AuraStorage (https://aurastorage.serveer.biz.id)
 * Dokumentasi:
 * - GET    /api/files/[stored_name]  -> Akses file publik
 * - POST   /api/upload               -> Upload file (Bearer API Key)
 * - DELETE /api/files/[stored_name]  -> Hapus file (Bearer API Key)
 */

export interface AuraUploadResponse {
  success: boolean;
  file?: {
    stored_name: string;
    original_name: string;
    mime_type: string;
    size: number;
    url: string;
  };
  message?: string;
}

interface CacheItem {
  buffer: Buffer;
  contentType: string;
  etag: string;
  size: number;
  timestamp: number;
}

// In-memory cache to optimize performance and prevent repeated external network requests
const fileCache = new Map<string, CacheItem>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour cache TTL

/**
 * Extract clean stored_name from full URL or raw filename
 */
export function extractStoredName(storedNameOrUrl: string): string {
  if (!storedNameOrUrl) return '';
  if (storedNameOrUrl.startsWith('http://') || storedNameOrUrl.startsWith('https://')) {
    const parts = storedNameOrUrl.split('/');
    return parts[parts.length - 1] || storedNameOrUrl;
  }
  return storedNameOrUrl.trim();
}

/**
 * Get direct AuraStorage URL for a given stored_name
 */
export function getAuraStorageFileUrl(storedNameOrUrl: string): string {
  const config = useRuntimeConfig();
  const baseUrl = (config.auraStorageBaseUrl || 'https://aurastorage.serveer.biz.id').replace(/\/+$/, '');
  const storedName = extractStoredName(storedNameOrUrl);
  return `${baseUrl}/api/files/${storedName}`;
}

/**
 * Fetch a file from AuraStorage by stored_name or full URL
 * Cached in memory for high performance.
 */
export async function fetchAuraStorageFile(storedNameOrUrl: string): Promise<CacheItem> {
  const storedName = extractStoredName(storedNameOrUrl);
  if (!storedName) {
    throw new Error('AuraStorage: stored_name cannot be empty');
  }

  // Check in-memory cache
  const cached = fileCache.get(storedName);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return cached;
  }

  const url = getAuraStorageFileUrl(storedName);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`AuraStorage responded with HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || 'image/png';
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const etag = `W/"${buffer.length}-${storedName}"`;

  const item: CacheItem = {
    buffer,
    contentType,
    etag,
    size: buffer.length,
    timestamp: Date.now()
  };

  fileCache.set(storedName, item);
  return item;
}

/**
 * Clear in-memory cache for a specific file or all files
 */
export function clearAuraStorageCache(storedNameOrUrl?: string): void {
  if (storedNameOrUrl) {
    const storedName = extractStoredName(storedNameOrUrl);
    fileCache.delete(storedName);
  } else {
    fileCache.clear();
  }
}

/**
 * Upload a file to AuraStorage
 * Requires AURA_STORAGE_API_KEY with Bearer token
 */
export async function uploadToAuraStorage(
  fileData: Buffer | Uint8Array | Blob,
  filename: string,
  mimeType: string = 'image/png'
): Promise<AuraUploadResponse> {
  const config = useRuntimeConfig();
  const baseUrl = (config.auraStorageBaseUrl || 'https://aurastorage.serveer.biz.id').replace(/\/+$/, '');
  const apiKey = config.auraStorageApiKey;

  if (!apiKey) {
    throw new Error('AuraStorage API Key (AURA_STORAGE_API_KEY) is not configured');
  }

  const formData = new FormData();
  let blob: Blob;

  if (fileData instanceof Blob) {
    blob = fileData;
  } else {
    blob = new Blob([fileData as any], { type: mimeType });
  }

  formData.append('file', blob, filename);

  const response = await fetch(`${baseUrl}/api/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    },
    body: formData
  });

  const data = (await response.json()) as AuraUploadResponse;

  if (!response.ok || !data.success) {
    throw new Error(data.message || `AuraStorage upload failed with status ${response.status}`);
  }

  return data;
}

/**
 * Delete a file from AuraStorage permanently
 * Requires AURA_STORAGE_API_KEY with Bearer token
 */
export async function deleteFromAuraStorage(storedNameOrUrl: string): Promise<boolean> {
  const config = useRuntimeConfig();
  const baseUrl = (config.auraStorageBaseUrl || 'https://aurastorage.serveer.biz.id').replace(/\/+$/, '');
  const apiKey = config.auraStorageApiKey;
  const storedName = extractStoredName(storedNameOrUrl);

  if (!apiKey) {
    throw new Error('AuraStorage API Key (AURA_STORAGE_API_KEY) is not configured');
  }

  const response = await fetch(`${baseUrl}/api/files/${storedName}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${apiKey}`
    }
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || `AuraStorage delete failed with status ${response.status}`);
  }

  // Clear from local cache
  fileCache.delete(storedName);
  return true;
}
