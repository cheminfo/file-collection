export function blobToStream(blobGetter: () => Promise<Blob>) {
  const { writable, readable } = new TransformStream<
    Uint8Array<ArrayBuffer>,
    Uint8Array<ArrayBuffer>
  >();

  async function propagateErrorToStream(error: unknown) {
    await Promise.allSettled([writable.abort(error), readable.cancel(error)]);
  }

  async function pipeFetchToStream() {
    const blob = await blobGetter();
    await blob.stream().pipeTo(writable);
  }

  void pipeFetchToStream().catch(propagateErrorToStream);

  return readable;
}
