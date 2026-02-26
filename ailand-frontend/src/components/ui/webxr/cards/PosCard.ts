import * as THREE from "three";
import { drawGradientButton } from "../buttons/GradientButton";

type CategoryCardData = {
  title: string;
  subtitle?: string;
  iconUrl: string;
  cta?: string;
};

export function createPosCard({
  title,
  subtitle,
  iconUrl,
  cta = "ÖFFNEN",
}: CategoryCardData) {
  const group = new THREE.Group();

  // --- glass panel ---
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.7),
    new THREE.MeshPhysicalMaterial({
      transparent: true,
      opacity: 1,
      roughness: 0.35,
      metalness: 0,
      transmission: 1,
      thickness: 0.2,
      ior: 1.45,
      clearcoat: 1,
      clearcoatRoughness: 0.2,
      depthWrite: false,
      depthTest: true,
    })
  );
  panel.renderOrder = 1;
  group.add(panel);

  // --- canvas ---
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  const W = canvas.width;
  const H = canvas.height;
  const pad = 20;

  const imgH = 600;
  const imgR = 55;

  const cardR = 70;
  const lineW = W - 120 - pad * 2;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  let iconImg: HTMLImageElement | null = null;

  const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
  };

  const drawCenteredText = (
    t: string,
    font: string,
    color: string,
    y: number,
  ) => {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "center";

    const words = t.split(" ");
    let cur = "";

    for (const w of words) {
      const test = cur ? cur + " " + w : w;
      if (ctx.measureText(test).width > lineW) {
        ctx.fillText(cur, W / 2, y);
        y += 54;
        cur = w;
      } else {
        cur = test;
      }
    }

    if (cur) ctx.fillText(cur, W / 2, y);
    ctx.restore();
    return y + 64;
  };

  const drawImageBlock = (img: HTMLImageElement) => {
    const x = 60 + pad;
    const y = 50 + pad;
    const w = W - 120 - pad * 2;
    const h = imgH;

    ctx.save();
    roundRect(x, y, w, h, imgR);
    ctx.clip();

    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const scale = Math.min(w / iw, h / ih) * 1.15;

    const sw = iw * scale;
    const sh = ih * scale;
    const dx = x + (w - sw) / 2;
    const dy = y + (h - sh) / 2;

    ctx.drawImage(img, dx, dy, sw, sh);
    ctx.restore();
  };


  const draw = () => {
    ctx.clearRect(0, 0, W, H);

    // card background
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 25;
    roundRect(60, 60, W - 120, H - 120, cardR);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundRect(60, 60, W - 120, H - 120, cardR);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    // icon
    if (iconImg) {

      ctx.save();
      ctx.globalAlpha = 0.9;
      if (iconImg) drawImageBlock(iconImg);

      ctx.restore();
    }

    let y = imgH;

    y = drawCenteredText(
      title,
      "700 82px Arial",
      "rgba(18,18,18,0.9)",
      y,
    );

    if (subtitle) {
      y = drawCenteredText(
        subtitle,
        "500 43px Arial",
        "rgba(120,120,120,1)",
        y,
      );
    }

    drawGradientButton({
      ctx,
      rr: roundRect,
      W,
      y: H - 280,
      text: cta,
    });
  };

  draw();

  // icon loading
  const icon = new Image();
  icon.crossOrigin = "anonymous";
  icon.src = iconUrl;
  icon.onload = () => {
    iconImg = icon;
    draw();
    texture.needsUpdate = true;
  };

  // --- texture plane ---
  const textPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.66, 0.66),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      depthTest: true,
    }),
  );
  textPlane.position.z = 0.002;
  textPlane.renderOrder = 2;
  group.add(textPlane);

  // --- CTA hit area ---
  const btn = new THREE.Mesh(
    new THREE.PlaneGeometry(0.42, 0.17),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: true,
      colorWrite: false,
    }),
  );
  
  // canvas button position
  const btnCanvasY = H - 280;

  // convert canvas → world
  const planeH = 0.66;
  const worldY = (0.5 - btnCanvasY / H) * planeH;

  btn.position.set(0, worldY, 0.01);

  btn.name = "cta";
  btn.renderOrder = 3;
  group.add(btn);

  return group;
}
