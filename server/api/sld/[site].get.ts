import { auth } from "~/server/utils/auth";
import { fetchAuraStorageFile } from "~/server/utils/auraStorage";
import fs from "node:fs/promises";
import path from "node:path";

export default defineEventHandler(async (event) => {
  // 1. BetterAuth Session Verification
  // Only authenticated users can access confidential Single Line Diagrams
  const session = await auth.api.getSession({
    headers: toWebRequest(event).headers
  });

  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Autentikasi diperlukan. Silakan login terlebih dahulu untuk mengakses diagram SLD."
    });
  }

  // 2. Validate requested site parameter
  const site = getRouterParam(event, 'site')?.toLowerCase();
  if (!site || (site !== 'tahuna' && site !== 'sangihe')) {
    throw createError({
      statusCode: 404,
      statusMessage: "Not Found",
      message: `Site SLD '${site}' tidak valid. Pilihan yang tersedia: tahuna, sangihe.`
    });
  }

  const config = useRuntimeConfig();
  const fileKey = site === 'sangihe'
    ? (config.auraStorageSldSangihe || '0060d4c0-3078-4081-8e15-98af2668c3f3.png')
    : (config.auraStorageSldTahuna || 'f1adbf22-32af-4aff-871c-375f3dd0b329.png');

  // 3. Fetch from AuraStorage with caching and fallback
  try {
    const file = await fetchAuraStorageFile(fileKey);

    // ETag revalidation for client performance
    const clientEtag = getHeader(event, 'if-none-match');
    if (clientEtag && clientEtag === file.etag) {
      setResponseStatus(event, 304);
      return null;
    }

    setHeader(event, 'Content-Type', file.contentType || 'image/png');
    setHeader(event, 'Cache-Control', 'private, max-age=3600, stale-while-revalidate=86400');
    setHeader(event, 'ETag', file.etag);
    setHeader(event, 'Content-Length', file.size);

    return send(event, file.buffer, file.contentType || 'image/png');
  } catch (error: any) {
    console.error(`[AuraStorage] Error fetching SLD for site '${site}':`, error?.message || error);

    // Resilient fallback: Server-side non-public backup asset
    try {
      const fallbackPath = path.resolve(process.cwd(), `server/assets/sld/${site}.png`);
      const fallbackBuffer = await fs.readFile(fallbackPath);
      setHeader(event, 'Content-Type', 'image/png');
      setHeader(event, 'Cache-Control', 'private, max-age=300');
      return send(event, fallbackBuffer, 'image/png');
    } catch (fallbackError) {
      throw createError({
        statusCode: 502,
        statusMessage: "Bad Gateway",
        message: `Gagal memuat diagram SLD ${site} dari AuraStorage.`
      });
    }
  }
});
