import { z } from "zod";

// Define the mapping of Sharp-supported formats to MIME types
const ImageFormats = {
    avif: "image/avif",
    dz: "application/dzi", // Deep Zoom Image format
    fits: "image/fits",
    gif: "image/gif",
    heif: "image/heif",
    input: "application/octet-stream", // Generic binary format
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    jp2: "image/jp2",
    jxl: "image/jxl",
    magick: "image/x-magick",
    openslide: "application/openslide",
    pdf: "application/pdf",
    png: "image/png",
    ppm: "image/x-portable-pixmap",
    raw: "image/raw",
    svg: "image/svg+xml",
    tiff: "image/tiff",
    tif: "image/tiff",
    v: "image/v-codec", // Video codec format
    webp: "image/webp",
} as const;

// Create the format enum schema based on Sharp formats
const formatSchema = z.enum([
    "avif",
    "dz",
    "fits",
    "gif",
    "heif",
    "input",
    "jpeg",
    "jpg",
    "jp2",
    "jxl",
    "magick",
    "openslide",
    "pdf",
    "png",
    "ppm",
    "raw",
    "svg",
    "tiff",
    "tif",
    "v",
    "webp",
]);

// Create the MIME type enum schema
const mimeTypeSchema = z.enum([
    "image/avif",
    "application/dzi",
    "image/fits",
    "image/gif",
    "image/heif",
    "application/octet-stream",
    "image/jpeg",
    "image/jp2",
    "image/jxl",
    "image/x-magick",
    "application/openslide",
    "application/pdf",
    "image/png",
    "image/x-portable-pixmap",
    "image/raw",
    "image/svg+xml",
    "image/tiff",
    "image/v-codec",
    "image/webp",
]);

// Export types
type ImageFormat = z.infer<typeof formatSchema>;
type MimeType = z.infer<typeof mimeTypeSchema>;

/**
 * Get MIME type for a given image format
 * @param format - The file format/extension (e.g., 'jpg', 'png')
 * @returns The corresponding MIME type
 * @throws Error if format is not supported
 */
function getMimeTypeFromFormat(format: string): string {
    // Clean and validate the format
    const cleanFormat = format.toLowerCase().trim().replace(".", "");

    // Validate format using Zod
    const result = formatSchema.safeParse(cleanFormat);

    if (!result.success) {
        const supportedFormats = Object.keys(ImageFormats).join(", ");
        throw new Error(
            `Unsupported image format: ${format}. Supported formats are: ${supportedFormats}`,
        );
    }

    return ImageFormats[result.data as ImageFormat];
}

// Type-safe wrapper with specific return type
function getImageMimeType(format: ImageFormat): MimeType {
    return ImageFormats[format];
}

export {
    getMimeTypeFromFormat,
    getImageMimeType,
    ImageFormats,
    type ImageFormat,
    type MimeType,
    formatSchema as zodImageFormat,
};
