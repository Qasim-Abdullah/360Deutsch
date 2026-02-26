import * as THREE from "three";

type AdverbCardProps = {
  word: string;
  comparative: string;
  superlative: string;
};

export function createAdverbCard({
  word,
  comparative,
  superlative,
}: AdverbCardProps) {
  const group = new THREE.Group();

  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.62),
    new THREE.MeshPhysicalMaterial({
      transparent: true,
      roughness: 0.25,
      metalness: 0,
      transmission: 1,
      thickness: 0.22,
      ior: 1.45,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      depthWrite: false,
    })
  );

  panel.renderOrder = 1;
  group.add(panel);

  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 950;

  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const W = canvas.width;

  const roundRect = (
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) => {
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
  };

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* Main container */
  roundRect(120, 120, W - 240, 700, 70);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fill();

  ctx.textAlign = "center";

  /* ADVERB label + base word */
  ctx.fillStyle = "rgba(50,50,50,0.6)";
  ctx.font = "500 34px Arial";
  ctx.fillText("ADVERB", W / 2, 200);

  ctx.fillStyle = "rgba(20,20,20,0.9)";
  ctx.font = "600 48px Arial";
  ctx.fillText(word, W / 2, 260);

  const drawSection = (
    y: number,
    label: string,
    value: string,
    c1: string,
    c2: string
  ) => {
    const boxY = y + 80;

    roundRect(W / 2 - 300, boxY, 600, 120, 40);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fill();

    ctx.fillStyle = "rgba(20,20,20,0.9)";
    ctx.font = "600 56px Arial";
    ctx.fillText(value, W / 2, boxY + 78);

    const grad = ctx.createLinearGradient(
      W / 2 - 200,
      0,
      W / 2 + 200,
      0
    );
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);

    roundRect(W / 2 - 200, boxY - 70, 400, 80, 40);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "700 40px Arial";
    ctx.fillText(label, W / 2, boxY - 18);
  };

  drawSection(320, "Komparativ", comparative, "#ff9f5a", "#a066ff");
  drawSection(580, "Superlativ", superlative, "#6b8cff", "#4fd1c5");

  texture.needsUpdate = true;

  const textPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.66, 0.62),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
    })
  );

  textPlane.position.z = 0.002;
  textPlane.renderOrder = 2;
  group.add(textPlane);

  return group;
}
