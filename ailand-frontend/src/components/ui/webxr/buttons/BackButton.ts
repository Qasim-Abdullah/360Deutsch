import * as THREE from "three";

type BackButtonOptions = {
  onEnter: () => void;
};

export function createBackButton({ onEnter }: BackButtonOptions) {
  const group = new THREE.Group();

  const size = 0.12;

  // ---------- Canvas ----------
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  const W = canvas.width;
  const H = canvas.height;
  const R = 120;

  function roundRect(x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // Soft shadow
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.18)";
  ctx.shadowBlur = 60;
  ctx.shadowOffsetY = 25;

  roundRect(60, 60, W - 120, H - 120, R);
  ctx.fillStyle = "#f3f4f6";
  ctx.fill();
  ctx.restore();

  // Arrow
  ctx.strokeStyle = "#5a47c7";
  ctx.lineWidth = 30;
  ctx.lineCap = "round";

  ctx.beginPath();
  ctx.moveTo(300, 180);
  ctx.lineTo(200, 256);
  ctx.lineTo(300, 332);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const ui = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    })
  );

  ui.position.z = 0.001;
  group.add(ui);

  // Hit area
  const hit = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      colorWrite: false,
    })
  );

  hit.name = "cta";
  hit.userData.onEnter = onEnter;

  group.add(hit);

  group.position.set(-0.4, 1.4, -2.4);

  return group;
}
