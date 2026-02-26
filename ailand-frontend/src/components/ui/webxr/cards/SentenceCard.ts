import * as THREE from "three";

type Example = {
  de: string;
  en: string;
};

type SentenceCardProps = {
  examples: Example[];
};

export function createSentenceCard({ examples }: SentenceCardProps) {
  const group = new THREE.Group();

  /* ---------- SHORTER CARD ---------- */
  const CARD_WIDTH = 0.9;
  const CARD_HEIGHT = 0.75;

  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT),
    new THREE.MeshPhysicalMaterial({
      transparent: true,
      transmission: 1,
      thickness: 0.2,
      roughness: 0.25,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      ior: 1.45,
      depthWrite: false,
    })
  );

  panel.renderOrder = 1;
  group.add(panel);

  /* ---------- CANVAS ---------- */
  const canvas = document.createElement("canvas");
  canvas.width = 1000;
  canvas.height = 800;

  const ctx = canvas.getContext("2d")!;
  const W = canvas.width;
  const H = canvas.height;

  const PAD = 80;
  const R = 60;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const pages = examples.map((e) => e);
  const total = pages.length;
  let state = 0;

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

  const draw = () => {
    ctx.clearRect(0, 0, W, H);

    const cardX = PAD;
    const cardY = PAD;
    const cardW = W - PAD * 2;
    const cardH = H - PAD * 2;

    /* ---------- CARD ---------- */
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 35;
    ctx.shadowOffsetY = 18;
    roundRect(cardX, cardY, cardW, cardH, R);
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.fill();
    ctx.restore();

    ctx.save();
    roundRect(cardX, cardY, cardW, cardH, R);
    ctx.clip();

    /* ---------- TOP GRADIENT ---------- */
    const gradient = ctx.createLinearGradient(cardX, 0, cardX + cardW, 0);
    gradient.addColorStop(0, "#5a47c7");
    gradient.addColorStop(0.5, "#9160a8");
    gradient.addColorStop(1, "#dc9b6c");

    ctx.fillStyle = gradient;
    const gradientY = cardY + 147;
    ctx.fillRect(cardX + 40, gradientY, cardW - 80, 6);

    /* ---------- TITLE ---------- */
    ctx.fillStyle = "rgba(20,20,20,0.6)";
    ctx.font = "400 35px Arial";
    ctx.fillText("Beispiele", cardX + 40, cardY + 130);

    /* ---------- CONTENT (CENTERED) ---------- */
    const ex = pages[state];

    const contentCenterY = cardY + cardH / 2 - 40;
    const x = cardX + 50;
    const maxWidth = cardW - 100;

    ctx.fillStyle = "#111";
    ctx.font = "700 52px Arial";
    const germanEndY = wrapText(ctx, ex.de, x, contentCenterY, maxWidth, 75);

    ctx.fillStyle = "rgba(60,60,60,0.75)";
    ctx.font = "400 38px Arial";
    wrapText(ctx, ex.en, x, germanEndY + 70, maxWidth, 50);


    /* ---------- PAGINATION AREA ---------- */
    const paginationY = cardY + cardH - 55;
    const centerX = cardX + cardW / 2;

    const spacing = 60;
    const startX = centerX - ((total - 1) * spacing) / 2;

    for (let i = 0; i < total; i++) {
      const xPos = startX + i * spacing;

      if (i === state) {
        const ringGradient = ctx.createLinearGradient(
          xPos - 25,
          0,
          xPos + 25,
          0
        );
        ringGradient.addColorStop(0, "#5a47c7");
        ringGradient.addColorStop(0.5, "#9160a8");
        ringGradient.addColorStop(1, "#dc9b6c");

        ctx.lineWidth = 6;
        ctx.strokeStyle = ringGradient;
        ctx.beginPath();
        ctx.arc(xPos, paginationY, 20, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "#111";
        ctx.font = "600 20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${i + 1}`, xPos, paginationY + 1);
      } else {
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.beginPath();
        ctx.arc(xPos, paginationY, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* ---------- ARROWS ---------- */
    ctx.fillStyle = "#333";
    ctx.font = "700 70px Arial";
    ctx.textAlign = "center";

    const arrowOffset = 90;
    const arrowY = paginationY - 10;

    ctx.fillText("‹", cardX + arrowOffset, arrowY);
    ctx.fillText("›", cardX + cardW - arrowOffset, arrowY);

    ctx.restore();
    texture.needsUpdate = true;
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const width = ctx.measureText(testLine).width;

      if (width > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + " ";
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }

    ctx.fillText(line, x, currentY);
    return currentY;
  };


  draw();

  /* ---------- NAVIGATION ---------- */
  group.userData.next = () => {
    state = (state + 1) % total;
    draw();
  };

  group.userData.prev = () => {
    state = (state - 1 + total) % total;
    draw();
  };

  /* ---------- TEXT PLANE ---------- */
  const textPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(CARD_WIDTH, CARD_HEIGHT),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    })
  );

  textPlane.position.z = 0.002;
  textPlane.renderOrder = 2;
  group.add(textPlane);

  /* ---------- ARROW HIT AREAS ---------- */
  const leftHit = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 0.2),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      colorWrite: false,
    })
  );
  leftHit.position.set(
    -CARD_WIDTH / 2 + 0.18,  // more inward
    -CARD_HEIGHT / 2 + 0.16, // higher
    0.01
  );
  leftHit.name = "prev";
  group.add(leftHit);

  const rightHit = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 0.2),
    new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: false,
      colorWrite: false,
    })
  );
  rightHit.position.set(
    CARD_WIDTH / 2 - 0.18,   // more inward
    -CARD_HEIGHT / 2 + 0.16, // higher
    0.01
  ); rightHit.name = "next";
  group.add(rightHit);

  return group;
}
