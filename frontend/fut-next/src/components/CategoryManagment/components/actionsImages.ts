// src/app/utils/file-utils.ts

/**
 * Converts a local URL (data URL or object URL) to a File object
 * @param url - The URL to convert (blob: URL or data: URL)
 * @param filename - The desired filename
 * @param mimeType - The MIME type of the file (optional, detected from data URLs)
 * @returns Promise that resolves to a File object
 */
export async function urlToFile(
  url: string,
  filename: string,
  mimeType?: string
): Promise<File | undefined> {
  // Handle different URL types
  if (url.startsWith("data:")) {
    // For data URLs, extract the MIME type if not provided
    if (!mimeType) {
      const dataUrlMimeMatch = url.match(/^data:([^;]+);/);
      mimeType = dataUrlMimeMatch
        ? dataUrlMimeMatch[1]
        : "application/octet-stream";
    }

    // Convert data URL to blob
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, { type: mimeType });
  } else if (url.startsWith("blob:")) {
    // For object URLs (blob: URLs)
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], filename, {
      type: mimeType || blob.type || "application/octet-stream",
    });
  } else {
    // For regular URLs, fetch them
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new File([blob], filename, {
        type: mimeType || blob.type || "application/octet-stream",
      });
    } catch (error) {
      console.error("Error converting URL to file:", error);
      // throw new Error(`Failed to convert URL to file: ${error.message}`);
    }
  }
}

/**
 * Creates a FormData object with file fields from URLs
 * @param formData - Initial form data (or regular object)
 * @param urlFields - Map of field names to URLs that should be converted to files
 * @param fileNames - Map of field names to desired filenames
 * @returns Promise that resolves to FormData with files added
 */
export async function createFormDataWithFiles(
  formData: Record<string, any>,
  urlFields: Record<string, string>,
  fileNames: Record<string, string> = {}
): Promise<FormData> {
  const formDataObj = new FormData();

  // Add regular form fields
  Object.entries(formData).forEach(([key, value]) => {
    // Skip URL fields that will be handled separately
    if (!urlFields[key]) {
      formDataObj.append(key, value as string);
    }
  });

  // Process URL fields and convert to files
  const filePromises = Object.entries(urlFields).map(async ([key, url]) => {
    try {
      if (url) {
        const filename =
          fileNames[key] || `${key}-${Date.now()}.${getExtensionFromUrl(url)}`;
        const file = (await urlToFile(url, filename)) as File;
        formDataObj.append(key, file);
      }
    } catch (error) {
      console.error(`Error processing URL field ${key}:`, error);
    }
  });

  // Wait for all file conversions to complete
  await Promise.all(filePromises);

  return formDataObj;
}

/**
 * Gets file extension from URL or data URL
 */
export function getExtensionFromUrl(url: string): string {
  if (url.startsWith("data:")) {
    // Extract mime type from data URL and convert to extension
    const mimeMatch = url.match(/^data:([^;]+);/);
    if (mimeMatch) {
      const mime = mimeMatch[1];
      if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
      if (mime.includes("png")) return "png";
      if (mime.includes("gif")) return "gif";
      if (mime.includes("pdf")) return "pdf";
      // Add more mime types as needed
      return mime.split("/")[1] || "bin";
    }
    return "bin";
  } else {
    // Extract extension from regular URL
    const urlParts = url.split(/[#?]/)[0].split(".");
    return urlParts.pop()?.toLowerCase() || "bin";
  }
}
