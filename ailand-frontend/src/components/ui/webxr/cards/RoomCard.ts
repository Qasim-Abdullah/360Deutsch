import * as THREE from "three";
import { drawGradientButton } from "../buttons/GradientButton";
import { createIconButton } from "../buttons/3DButton";

type CardData = {
  title: string;
  imageUrl: string;
  subtitle?: string;
  cta?: string;
  onOpenRoom?: () => void;
};

export function createRoomCard({
  title,
  imageUrl,
  subtitle,
  cta = "SEHEN",
  onOpenRoom,
}: CardData) {
  const group = new THREE.Group();

  const geometry = new THREE.PlaneGeometry(0.7, 0.9);
  const material = new THREE.MeshPhysicalMaterial({
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
  });

  const panel = new THREE.Mesh(geometry, material);
  panel.renderOrder = 1;

  const iconButton = createIconButton({
    iconUrl: "/icons/rooms/cube.png",
    position: new THREE.Vector3(0.23, 0.33, 0.01),
    onClick: () => {
      onOpenRoom?.();
    },
  });

  iconButton.userData.onEnter = () => {
    onOpenRoom?.();
  };
  
  console.log("image    ", imageUrl)
  group.add(iconButton);


  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1300;
  const ctx = canvas.getContext("2d")!;

  const W = canvas.width;
  const H = canvas.height;

  const cardR = 70;
  const pad = 70;
  const imgH = 700;
  const imgR = 55;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  let loadedImg: HTMLImageElement | null = null;
  let iconImg: HTMLImageElement | null = null;
  let state = 0;
  const total = 1;

  const lineW = W - 120 - pad * 2;

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

  const drawImageBlock = (img: HTMLImageElement) => {
    const x = 60 + pad;
    const y = 60 + pad;
    const w = W - 120 - pad * 2;
    const h = imgH;

    ctx.save();
    roundRect(x, y, w, h, imgR);
    ctx.clip();

    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const scale = Math.min(w / iw, h / ih);

    const sw = iw * scale;
    const sh = ih * scale;
    const dx = x + (w - sw) / 2;
    const dy = y + (h - sh) / 2;

    ctx.drawImage(img, dx, dy, sw, sh);
    ctx.restore();
  };

  const drawCenteredText = (
    t: string,
    font: string,
    color: string,
    startY: number,
  ) => {
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = "center";

    const words = t.split(" ");
    let cur = "";
    let y = startY;

    for (let i = 0; i < words.length; i++) {
      const test = cur ? cur + " " + words[i] : words[i];
      if (ctx.measureText(test).width > lineW) {
        ctx.fillText(cur, W / 2, y);
        y += 54;
        cur = words[i];
      } else {
        cur = test;
      }
    }
    if (cur) {
      ctx.fillText(cur, W / 2, y);
      y += 64;
    }

    ctx.restore();
    return y;
  };

  const drawText = () => {
    ctx.clearRect(0, 0, W, H);

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.28)";
    ctx.shadowBlur = 55;
    ctx.shadowOffsetY = 25;
    roundRect(60, 60, W - 120, H - 120, cardR);
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundRect(60, 60, W - 120, H - 120, cardR);
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.restore();

    if (iconImg) {
      const size = 200;
      const x = W - 60 - pad - size + 110;
      const y = pad - 90;
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.drawImage(iconImg, x, y, size, size + 100);
      ctx.restore();
    }

    if (loadedImg) drawImageBlock(loadedImg);

    let y = 60 + pad + imgH + 100;
    y = drawCenteredText(title, "700 78px Arial", "rgba(18,18,18,0.9)", y);

    if (subtitle) {
      y = drawCenteredText(
        subtitle,
        "500 44px Arial",
        "rgba(120,120,120,1)",
        y,
      );
      y += 5;
    }

    const x = 60 + pad;
    const baseY = y - 20;

    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x + lineW, baseY);
    ctx.stroke();
    ctx.restore();

    const btnY = baseY + 45;

    drawGradientButton({
      ctx,
      rr: roundRect,
      W,
      y: btnY,
      text: cta,
    });
  };

  drawText();

  group.userData.next = () => {
    state = 0;
    drawText();
    texture.needsUpdate = true;
  };

  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    loadedImg = img;
    drawText();
    texture.needsUpdate = true;
  };
  img.src = imageUrl;
  img.onload = () => {
    loadedImg = img;
    drawText();
    texture.needsUpdate = true;
  };

  // const icon = new Image();
  // icon.crossOrigin = "anonymous";
  // icon.src = "/icons/rooms/cube.png";
  // icon.onload = () => {
  //   iconImg = icon;
  //   drawText();
  //   texture.needsUpdate = true;
  // };

  const textMat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
    depthTest: true,
  });

  const textPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.66, 0.86),
    textMat,
  );
  textPlane.position.z = 0.002;
  textPlane.renderOrder = 2;
  group.add(textPlane);

  const btnGeo = new THREE.PlaneGeometry(0.42, 0.17);

  const btnMat = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
    depthWrite: false,
    depthTest: true,
    colorWrite: false,
  });
  const btn = new THREE.Mesh(btnGeo, btnMat);
  btn.position.set(0, -0.32, 0.01);
  btn.name = "cta";
  btn.renderOrder = 3;
  group.add(btn);

  return group;
}
