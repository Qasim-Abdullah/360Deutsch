import * as THREE from "three";


const SMALL = {
  panelW: 0.7,
  panelH: 0.62,
  canvasW: 1024,
  canvasH: 950,
  texW: 0.66,
  texH: 0.62,
} as const;

const TALL = {
  panelW: 0.7,
  panelH: 0.9,
  canvasW: 1024,
  canvasH: 1400,
  texW: 0.66,
  texH: 0.86,
} as const;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
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

function createGlassPanel(
  w: number,
  h: number,
  thickness = 0.22
): THREE.Mesh {
  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshPhysicalMaterial({
      transparent: true,
      roughness: 0.25,
      metalness: 0,
      transmission: 1,
      thickness,
      ior: 1.45,
      clearcoat: 1,
      clearcoatRoughness: 0.15,
      depthWrite: false,
    })
  );
  panel.renderOrder = 1;
  return panel;
}

type TwoSection = {
  label: string;
  value: string;
  c1: string;
  c2: string;
};

function drawTwoSections(
  ctx: CanvasRenderingContext2D,
  W: number,
  sections: TwoSection[]
) {
  roundRect(ctx, 120, 120, W - 240, 700, 70);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.fill();

  const yOffsets = [230, 490];
  sections.forEach((section, i) => {
    const y = yOffsets[i];
    const boxY = y + 80;

    roundRect(ctx, W / 2 - 300, boxY, 600, 120, 40);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fill();

    ctx.fillStyle = "rgba(20,20,20,0.9)";
    ctx.font = "600 56px Arial";
    ctx.textAlign = "center";
    ctx.fillText(section.value, W / 2, boxY + 78);

    const grad = ctx.createLinearGradient(W / 2 - 200, 0, W / 2 + 200, 0);
    grad.addColorStop(0, section.c1);
    grad.addColorStop(1, section.c2);
    roundRect(ctx, W / 2 - 200, boxY - 70, 400, 80, 40);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.font = "700 40px Arial";
    ctx.fillText(section.label, W / 2, boxY - 18);
  });
}

function createCardWithCanvas(
  size: typeof SMALL | typeof TALL,
  draw: (ctx: CanvasRenderingContext2D, W: number, H: number) => void
): THREE.Group {
  const group = new THREE.Group();
  group.add(createGlassPanel(size.panelW, size.panelH, size === TALL ? 0.25 : 0.22));

  const canvas = document.createElement("canvas");
  canvas.width = size.canvasW;
  canvas.height = size.canvasH;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw(ctx, size.canvasW, size.canvasH);
  texture.needsUpdate = true;

  const textPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(size.texW, size.texH),
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


export type AdjectiveForms = {
  comparative: string;
  superlative: string;
};

export function createAdjectiveCard({
  comparative,
  superlative,
}: AdjectiveForms) {
  return createCardWithCanvas(SMALL, (ctx, W) => {
    drawTwoSections(ctx, W, [
      { label: "Komparativ", value: comparative, c1: "#ff9f5a", c2: "#a066ff" },
      { label: "Superlativ", value: superlative, c1: "#6b8cff", c2: "#4fd1c5" },
    ]);
  });
}

export type NumberForms = {
  word: string;
  ordinal: string;
};

export function createNumberCard({ word, ordinal }: NumberForms) {
  return createCardWithCanvas(SMALL, (ctx, W) => {
    drawTwoSections(ctx, W, [
      { label: "Kardinal", value: word, c1: "#ff9f5a", c2: "#a066ff" },
      { label: "Ordinal", value: ordinal, c1: "#6b8cff", c2: "#4fd1c5" },
    ]);
  });
}

export type PronounForms = {
  word: string;
  nominative: string;
  accusative: string;
  dative: string;
  genitive: string;
};

export function createPronounCard({
  word,
  nominative,
  accusative,
  dative,
  genitive,
}: PronounForms) {
  return createCardWithCanvas(TALL, (ctx, W, H) => {
    const R = 72;
    const sidePad = 120;
    const topPad = 120;
    const bottomPad = 120;

    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 28;
    roundRect(ctx, sidePad, topPad, W - sidePad * 2, H - topPad - bottomPad, R);
    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.fill();
    ctx.restore();

    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(50,50,50,0.6)";
    ctx.font = "500 38px Arial";
    ctx.fillText("PRONOMEN", W / 2, 260);
    ctx.fillStyle = "rgba(20,20,20,0.9)";
    ctx.font = "600 90px Arial";
    ctx.fillText(word, W / 2, 380);

    const gradient = ctx.createLinearGradient(W / 2 - 220, 420, W / 2 + 220, 420);
    gradient.addColorStop(0, "#5a47c7");
    gradient.addColorStop(0.5, "#9160a8");
    gradient.addColorStop(1, "#dc9b6c");
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 220, 440);
    ctx.lineTo(W / 2 + 220, 440);
    ctx.stroke();

    ctx.textAlign = "left";
    const rows: [string, string][] = [
      ["Nominativ", nominative],
      ["Akkusativ", accusative],
      ["Dativ", dative],
      ["Genitiv", genitive],
    ];
    let y = 580;
    rows.forEach(([label, value]) => {
      ctx.fillStyle = "rgba(70,70,70,0.85)";
      ctx.font = "500 52px Arial";
      ctx.fillText(label, 280, y);
      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(25,25,25,0.95)";
      ctx.font = "600 56px Arial";
      ctx.fillText(value, W - 280, y);
      ctx.textAlign = "left";
      y += 110;
    });
  });
}

export type PrepositionForms = {
  word: string;
  meaning: string;
};

export function createPrepositionCard({ word, meaning }: PrepositionForms) {
  return createCardWithCanvas(SMALL, (ctx, W) => {
    drawTwoSections(ctx, W, [
      { label: "Präposition", value: word, c1: "#ff9f5a", c2: "#a066ff" },
      { label: "Bedeutung", value: meaning, c1: "#6b8cff", c2: "#4fd1c5" },
    ]);
  });
}

export function createHelloCard() {
  return createCardWithCanvas(SMALL, (ctx, W) => {
    roundRect(ctx, 120, 120, W - 240, 700, 70);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fill();
    roundRect(ctx, W / 2 - 300, 380, 600, 140, 50);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.fill();
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(20,20,20,0.9)";
    ctx.font = "700 72px Arial";
    ctx.fillText("Hello", W / 2, 470);
  });
}
