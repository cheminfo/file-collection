export function encode(buffer: Uint8Array): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('loadend', () => {
      const dataUrl = reader.result as string;

      // resolve without the `data:...;base64,` part
      resolve(dataUrl.slice(dataUrl.indexOf(',') + 1));
    });
    reader.readAsDataURL(new Blob([buffer]));
  });
}

export async function decode(base64: string): Promise<Uint8Array> {
  const dataUrl = `data:application/octet-binary;base64,${base64}`;
  const response = await fetch(dataUrl);
  const arrayBuffer = await response.arrayBuffer();

  return new Uint8Array(arrayBuffer);
}
