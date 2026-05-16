export async function extractMetadata(file) {
  const result = {
    name: file.name,
    size: (file.size / 1024).toFixed(2) + ' KB',
    type: file.type || 'Unknown',
    lastModified: new Date(file.lastModified).toLocaleString(),
    extraInfo: []
  };

  if (file.type.startsWith('image/')) {
    try {
      const url = URL.createObjectURL(file);
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
      result.extraInfo.push(`Resolution: ${img.width} x ${img.height}`);
      URL.revokeObjectURL(url);
    } catch {
      // Ignore
    }
  }

  result.extraInfo.push('Educational Note: Full EXIF/XMP parsing typically requires a dedicated library like `exifr`.');

  return result;
}
