export function drawPagination(
  ctx: CanvasRenderingContext2D,
  state: number,
  total: number,
  x: number,
  y: number,
  lineW: number,
) {
  if (total <= 1) return;

  const cur = state + 1;

  let nums: number[] = [];
  let showLeftDots = false;
  let showRightDots = false;

  if (total === 2) {
    nums = [1, 2];
  } else if (total === 3) {
    if (cur === 1) {
      nums = [1, 2];
      showRightDots = true;
    } else {
      nums = [2, 3];
      showLeftDots = true;
    }
  } else {
    if (cur === 1) {
      nums = [1, 2];
      showRightDots = true;
    } else if (cur === total) {
      nums = [total - 1, total];
      showLeftDots = true;
    } else {
      nums = [cur, cur + 1];
      showLeftDots = true;
      if (cur + 1 < total) showRightDots = true;
    }
  }

  let count = nums.length + (showLeftDots ? 1 : 0) + (showRightDots ? 1 : 0);
  let px = x + lineW - count * 60;

  if (showLeftDots) {
    ctx.fillStyle = "rgba(40,40,40,0.5)";
    ctx.font = "500 32px Arial";
    ctx.fillText("...", px + 6, y);
    px += 60;
  }

  nums.forEach((n) => {
    if (n === cur) {
      ctx.save();
      ctx.strokeStyle = "rgba(80,120,255,0.9)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(px + 20, y - 12, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      ctx.fillStyle = "rgba(40,120,255,1)";
      ctx.font = "700 34px Arial";
    } else {
      ctx.fillStyle = "rgba(40,40,40,0.7)";
      ctx.font = "500 32px Arial";
    }

    ctx.fillText(String(n), px + 10, y);
    px += 60;
  });

  if (showRightDots) {
    ctx.fillStyle = "rgba(40,40,40,0.5)";
    ctx.font = "500 32px Arial";
    ctx.fillText("...", px + 6, y);
  }
}
