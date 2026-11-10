import decode, { init } from '/vendor/heic/decode.js';

const decoderReady = fetch('/wasm/heic_dec.wasm', { credentials: 'same-origin' })
  .then((response) => {
    if (!response.ok) throw new Error('Le décodeur HEIC est indisponible.');
    return response.arrayBuffer();
  })
  .then((buffer) => WebAssembly.compile(buffer))
  .then((module) => init(module));

self.onmessage = async ({ data }) => {
  try {
    await decoderReady;
    const image = await decode(data.buffer);
    self.postMessage({
      id: data.id,
      ok: true,
      width: image.width,
      height: image.height,
      pixels: image.data.buffer,
    }, { transfer: [image.data.buffer] });
  } catch (error) {
    self.postMessage({
      id: data.id,
      ok: false,
      message: error instanceof Error ? error.message : 'Décodage HEIC impossible.',
    });
  }
};
