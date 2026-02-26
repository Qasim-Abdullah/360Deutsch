export type DrawAudioGradientButtonParams = {
  ctx: CanvasRenderingContext2D;
  rr: (x: number, y: number, w: number, h: number, r: number) => void;
  W: number;
  y: number;

  bw?: number;
  bh?: number;
  iconSize?: number;
};

export function drawAudioGradientButton({
  ctx,
  rr,
  W,
  y,
  bw = 110,
  bh = 110,
  iconSize = 46,
}: DrawAudioGradientButtonParams) {
  const bx = W - 120 - bw - 24;

  /* ---------- gradient background ---------- */
  const grad = ctx.createLinearGradient(bx, y, bx + bw, y);
  grad.addColorStop(1, "#5a47c7");


  ctx.fillStyle = grad;
  rr(bx, y, bw, bh, bh / 2);
  ctx.fill();

  /* ---------- speaker icon (centered) ---------- */
  const cx = bx + bw / 2;
  const cy = y + bh / 2;

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // speaker body
  ctx.beginPath();
  ctx.moveTo(cx - iconSize * 0.35, cy - iconSize * 0.25);
  ctx.lineTo(cx - iconSize * 0.15, cy - iconSize * 0.25);
  ctx.lineTo(cx + iconSize * 0.15, cy - iconSize * 0.45);
  ctx.lineTo(cx + iconSize * 0.15, cy + iconSize * 0.45);
  ctx.lineTo(cx - iconSize * 0.15, cy + iconSize * 0.25);
  ctx.lineTo(cx - iconSize * 0.35, cy + iconSize * 0.25);
  ctx.closePath();
  ctx.stroke();

  // sound wave
  ctx.beginPath();
  ctx.arc(
    cx + iconSize * 0.25,
    cy,
    iconSize * 0.35,
    -0.5,
    0.5
  );
  ctx.stroke();
}
