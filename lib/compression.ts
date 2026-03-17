'use server';

export async function compressData(data: any): Promise<string> {
  const jsonString = JSON.stringify(data);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const stream = blob.stream();
  const compressedStream = stream.pipeThrough(
    new CompressionStream('gzip')
  );
  const compressedBlob = await new Response(compressedStream).blob();
  return btoa(await compressedBlob.text());
}

export async function decompressData(compressed: string): Promise<any> {
  try {
    const binaryString = atob(compressed);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/gzip' });
    const stream = blob.stream();
    const decompressedStream = stream.pipeThrough(
      new DecompressionStream('gzip')
    );
    const decompressedBlob = await new Response(decompressedStream).blob();
    const text = await decompressedBlob.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('[v0] Decompression error:', error);
    return null;
  }
}

// Lightweight data serialization for low-bandwidth environments
export function serializeForBandwidth(data: any, compressionLevel: 'high' | 'medium' | 'low' = 'medium'): string {
  if (compressionLevel === 'high') {
    return Buffer.from(JSON.stringify(data)).toString('base64');
  }
  
  // Medium compression - remove unnecessary whitespace and nulls
  const cleaned = Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);
  
  return JSON.stringify(cleaned);
}
