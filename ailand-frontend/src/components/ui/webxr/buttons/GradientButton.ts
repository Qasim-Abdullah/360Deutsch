type DrawButtonParams = {
  ctx: CanvasRenderingContext2D;
  rr: (x: number, y: number, w: number, h: number, r: number) => void;
  W: number;
  y: number;
  text: string;

  bw?: number;
  bh?: number;
  fontSize?: number;
  arrowSize?: number;
};

export function drawGradientButton({
  ctx,
  rr,
  W,
  y,
  text,
  bw = 420,
  bh = 110,
  fontSize = 46,
  arrowSize = 46,
}: DrawButtonParams) {
  const bx = W / 2 - bw / 2;

  // Gradient background
  const grad = ctx.createLinearGradient(bx, y, bx + bw, y);
  grad.addColorStop(0, "#5a47c7");
  grad.addColorStop(0.25, "#9160a8");
  grad.addColorStop(1, "#dc9b6c");

  ctx.fillStyle = grad;
  rr(bx, y, bw, bh, bh / 2);
  ctx.fill();

  // Text + arrow (centered as a group)
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${fontSize}px Inter, Arial, sans-serif`;
  ctx.textAlign = "left";

  const textY = y + bh * 0.65;
  const textWidth = ctx.measureText(text).width;
  const totalWidth = textWidth + arrowSize * 0.8 + arrowSize;
  const startX = W / 2 - totalWidth / 2;

  // Text
  ctx.fillText(text, startX, textY);

  // Arrow
  const ax = startX + textWidth + arrowSize * 0.8;
  const ay = textY - arrowSize * 0.25;

  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(ax + arrowSize, ay);
  ctx.lineTo(ax + arrowSize * 0.75, ay - arrowSize * 0.35);
  ctx.moveTo(ax + arrowSize, ay);
  ctx.lineTo(ax + arrowSize * 0.75, ay + arrowSize * 0.35);
  ctx.stroke();
}
