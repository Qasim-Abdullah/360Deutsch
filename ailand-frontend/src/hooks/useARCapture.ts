"use client";

export async function captureXRFrameBase64(
  view: XRView,
  gl: WebGLRenderingContext,
  glBinding: any,
  fbo: WebGLFramebuffer
) {
  const cam: any = (view as any).camera;
  if (!cam) return null;

  const tex = glBinding.getCameraImage(cam);
  if (!tex) return null;

  const w = cam.width;
  const h = cam.height;
  const pixels = new Uint8Array(w * h * 4);

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    tex,
    0
  );
  gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(w, h);

  for (let y = 0; y < h; y++) {
    const src = (h - 1 - y) * w * 4;
    const dst = y * w * 4;
    img.data.set(pixels.subarray(src, src + w * 4), dst);
  }

  ctx.putImageData(img, 0, 0);

  const blob = await new Promise<Blob | null>((r) =>
    canvas.toBlob(r, "image/jpeg", 0.7)
  );
  if (!blob) return null;

  const buf = await blob.arrayBuffer();
  console.log("CAM:", cam.width, cam.height);

  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
