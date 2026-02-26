import * as THREE from "three";

export type Conjugation = {
  ich: string;
  du: string;
  er: string;
  wir?: string;
  ihr?: string;
  sie?: string;
};

type ConjugationCardProps = {
  infinitive: string;
  forms: Conjugation;
};

export function createConjugationCard({
  infinitive,
  forms,
}: ConjugationCardProps) {
  const group = new THREE.Group();

  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.9),
    new THREE.MeshPhysicalMaterial({
      transparent: true,
      opacity: 1,
      roughness: 0.25,
      metalness: 0,
      transmission: 1,
      thickness: 0.25,
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
  canvas.height = 1400;
  const ctx = canvas.getContext("2d")!;

  const W = canvas.width;
  const H = canvas.height;
  const R = 72;

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const rr = (
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

    const sidePad = 120;
    const topPad = 120;
    const bottomPad = 120;

    // Background rounded card
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.25)";
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 28;

    rr(
      sidePad,
      topPad,
      W - sidePad * 2,
      H - topPad - bottomPad,
      R
    );

    ctx.fillStyle = "rgba(255,255,255,0.78)";
    ctx.fill();
    ctx.restore();

    ctx.textAlign = "center";

    // Small label
    ctx.fillStyle = "rgba(50,50,50,0.6)";
    ctx.font = "500 38px Arial";
    ctx.fillText("VERB", W / 2, 260);

    // Infinitive
    ctx.fillStyle = "rgba(20,20,20,0.9)";
    ctx.font = "600 90px Arial";
    ctx.fillText(infinitive, W / 2, 380);

    // Gradient underline
    const gradient = ctx.createLinearGradient(
      W / 2 - 220,
      420,
      W / 2 + 220,
      420
    );
    gradient.addColorStop(0, "#5a47c7");
    gradient.addColorStop(0.5, "#9160a8");
    gradient.addColorStop(1, "#dc9b6c");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 220, 440);
    ctx.lineTo(W / 2 + 220, 440);
    ctx.stroke();


    // Conjugation rows
    ctx.textAlign = "left";

    const rows = [
      ["ich", forms.ich],
      ["du", forms.du],
      ["er/sie/es", forms.er],
      forms.wir ? ["wir", forms.wir] : null,
      forms.ihr ? ["ihr", forms.ihr] : null,
      forms.sie ? ["sie", forms.sie] : null,
    ].filter(Boolean) as [string, string][];

    let y = 580;

    rows.forEach(([pronoun, verb]) => {
      ctx.fillStyle = "rgba(70,70,70,0.85)";
      ctx.font = "500 52px Arial";
      ctx.fillText(pronoun, 280, y);

      ctx.textAlign = "right";
      ctx.fillStyle = "rgba(25,25,25,0.95)";
      ctx.font = "600 56px Arial";
      ctx.fillText(verb, W - 280, y);

      ctx.textAlign = "left";
      y += 110;
    });
  };

  draw();
  texture.needsUpdate = true;

  const textPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(0.66, 0.86),
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
