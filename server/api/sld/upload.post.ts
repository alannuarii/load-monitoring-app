import { auth } from "~/server/utils/auth";
import { uploadToAuraStorage, clearAuraStorageCache } from "~/server/utils/auraStorage";

export default defineEventHandler(async (event) => {
  // 1. Session verification
  const session = await auth.api.getSession({
    headers: toWebRequest(event).headers
  });

  if (!session || !session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Autentikasi diperlukan untuk mengunggah diagram SLD."
    });
  }

  // 2. Read multipart form data
  const formData = await readMultipartFormData(event);
  if (!formData || formData.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "File tidak ditemukan dalam request."
    });
  }

  const fileItem = formData.find(item => item.name === 'file');
  if (!fileItem || !fileItem.data || fileItem.data.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Field 'file' wajib diisi."
    });
  }

  const siteItem = formData.find(item => item.name === 'site');
  const site = siteItem ? siteItem.data.toString().toLowerCase() : 'tahuna';

  const filename = fileItem.filename || `sld_${site}_${Date.now()}.png`;
  const mimeType = fileItem.type || 'image/png';

  try {
    const result = await uploadToAuraStorage(fileItem.data, filename, mimeType);

    // Invalidate memory cache so newly uploaded file is served
    if (result?.file?.stored_name) {
      clearAuraStorageCache(result.file.stored_name);
    }
    clearAuraStorageCache();

    return {
      success: true,
      site,
      file: result.file,
      message: "SLD berhasil diunggah ke AuraStorage."
    };
  } catch (error: any) {
    console.error('[AuraStorage] Upload error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: "Upload Error",
      message: error?.message || "Gagal mengunggah file ke AuraStorage."
    });
  }
});
