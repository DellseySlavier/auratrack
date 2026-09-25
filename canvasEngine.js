/**
 * AuraTrack 高保真 Canvas 渲染引擎
 * 拥有完整的播放器矢量图标（随机、上一曲、大播放键、下一曲、循环、心形）与细腻阴影排版
 */

// 1. 矢量图标绘制函数
function drawHeart(ctx, x, y, color, scale = 1, filled = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3.6;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(18, 9);
  ctx.bezierCurveTo(18, 4, 13.5, 0, 8.5, 0);
  ctx.bezierCurveTo(3.8, 0, 0, 3.8, 0, 8.5);
  ctx.bezierCurveTo(0, 15, 7.5, 21.5, 18, 30);
  ctx.bezierCurveTo(28.5, 21.5, 36, 15, 36, 8.5);
  ctx.bezierCurveTo(36, 3.8, 32.2, 0, 27.5, 0);
  ctx.bezierCurveTo(22.5, 0, 18, 4, 18, 9);
  ctx.closePath();
  if (filled) ctx.fill();
  else ctx.stroke();
  ctx.restore();
}

function drawPrev(ctx, cx, cy, color, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.fillRect(-22, -20, 5.5, 40);

  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(16, -20);
  ctx.lineTo(16, 20);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawNext(ctx, cx, cy, color, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.fillStyle = color;
  ctx.fillRect(16.5, -20, 5.5, 40);

  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(-16, -20);
  ctx.lineTo(-16, 20);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawShuffle(ctx, cx, cy, color, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 4.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(-24, -14);
  ctx.lineTo(-8, -14);
  ctx.bezierCurveTo(-2, -14, 2, 14, 8, 14);
  ctx.lineTo(24, 14);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-24, 14);
  ctx.lineTo(-8, 14);
  ctx.bezierCurveTo(-2, 14, 2, -14, 8, -14);
  ctx.lineTo(24, -14);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(16, -20);
  ctx.lineTo(24, -14);
  ctx.lineTo(16, -8);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(16, 8);
  ctx.lineTo(24, 14);
  ctx.lineTo(16, 20);
  ctx.stroke();
  ctx.restore();
}

function drawRepeat(ctx, cx, cy, color, scale = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 4.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const w = 36, h = 24, r = 8;
  ctx.beginPath();
  ctx.moveTo(-w / 2 + r, -h / 2);
  ctx.lineTo(w / 2 - r, -h / 2);
  ctx.arcTo(w / 2, -h / 2, w / 2, -h / 2 + r, r);
  ctx.lineTo(w / 2, h / 2 - r);
  ctx.arcTo(w / 2, h / 2, w / 2 - r, h / 2, r);
  ctx.lineTo(-w / 2 + r, h / 2);
  ctx.arcTo(-w / 2, h / 2, -w / 2, h / 2 - r, r);
  ctx.lineTo(-w / 2, -h / 2 + r);
  ctx.arcTo(-w / 2, -h / 2, -w / 2 + r, -h / 2, r);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(w / 2 - 12, -h / 2 - 7);
  ctx.lineTo(w / 2 + 2, -h / 2);
  ctx.lineTo(w / 2 - 12, -h / 2 + 7);
  ctx.stroke();
  ctx.restore();
}

// 2. 核心海报渲染器
function renderAuraPoster(canvas, opts) {
  const ctx = canvas.getContext("2d");
  const {
    width = 1320,
    height = 2868,
    image = null,
    title = "青色がすき。",
    artist = "keiju · Midnight Radio",
    account = "@DellseySlavier Studio",
    palette = [],
    bgColor = "#2C363D",
    theme = "glass",
    borderRadius = 28
  } = opts;

  canvas.width = width;
  canvas.height = height;

  const scale = width / 1080;
  const marginX = 80 * scale;
  const contentWidth = width - marginX * 2;
  const jacketSize = contentWidth;
  const jacketX = marginX;

  // 判断背景明暗
  const isLight = isColorLight(bgColor);
  const textColor = isLight ? "#1e293b" : "#f8fafc";
  const subTextColor = isLight ? "rgba(30, 41, 59, 0.65)" : "rgba(248, 250, 252, 0.65)";
  const trackBarBg = isLight ? "rgba(30, 41, 59, 0.12)" : "rgba(248, 250, 252, 0.22)";

  // 计算垂直间距居中
  const infoH = 140 * scale;
  const progressH = 120 * scale;
  const controlsH = 180 * scale;
  const paletteH = 160 * scale;
  const totalContentH = jacketSize + infoH + progressH + controlsH + paletteH;
  const jacketY = Math.max(100 * scale, (height - totalContentH) / 2);

  // A. 绘制背景
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // B. 风格分支：流光毛玻璃特效
  if (theme === "glass") {
    const p1 = palette[0] || "#6366f1";
    const p2 = palette[1] || palette[0] || "#ec4899";
    
    // 大范围环境散射光
    const glow = ctx.createRadialGradient(
      width * 0.5, jacketY + jacketSize * 0.45, 20,
      width * 0.5, jacketY + jacketSize * 0.45, width * 0.75
    );
    glow.addColorStop(0, p1 + "77");
    glow.addColorStop(0.5, p2 + "44");
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
  }

  // C. 绘制专辑封面
  ctx.save();
  const radius = theme === "retro" ? jacketSize / 2 : borderRadius * scale;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(jacketX, jacketY, jacketSize, jacketSize, radius);
  } else {
    ctx.rect(jacketX, jacketY, jacketSize, jacketSize);
  }
  ctx.clip();

  if (image && image.complete && image.naturalWidth > 0) {
    const iw = image.naturalWidth;
    const ih = image.naturalHeight;
    const coverScale = Math.max(jacketSize / iw, jacketSize / ih);
    const fw = iw * coverScale;
    const fh = ih * coverScale;
    const fx = jacketX + (jacketSize - fw) / 2;
    const fy = jacketY + (jacketSize - fh) / 2;
    ctx.drawImage(image, fx, fy, fw, fh);
  } else {
    // 默认空图占位渐变
    const phGrad = ctx.createLinearGradient(jacketX, jacketY, jacketX + jacketSize, jacketY + jacketSize);
    phGrad.addColorStop(0, "#475569");
    phGrad.addColorStop(1, "#1e293b");
    ctx.fillStyle = phGrad;
    ctx.fillRect(jacketX, jacketY, jacketSize, jacketSize);
  }
  ctx.restore();

  // 若为复古黑胶，加中心圆环
  if (theme === "retro") {
    ctx.save();
    ctx.beginPath();
    ctx.arc(jacketX + jacketSize / 2, jacketY + jacketSize / 2, 45 * scale, 0, Math.PI * 2);
    ctx.fillStyle = bgColor;
    ctx.fill();
    ctx.lineWidth = 6 * scale;
    ctx.strokeStyle = textColor;
    ctx.stroke();
    ctx.restore();
  }

  // D. 歌曲标题 & 心形 & 艺术家
  const infoY = jacketY + jacketSize + 56 * scale;

  ctx.save();
  ctx.fillStyle = textColor;
  ctx.font = `700 ${Math.round(54 * scale)}px "Zen Maru Gothic", "Noto Sans SC", -apple-system, sans-serif`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  // 标题文字（带微字距）
  let currentX = marginX;
  const titleText = title || "Untitled";
  const titleLetterSpacing = 2 * scale;
  for (let i = 0; i < titleText.length; i++) {
    const ch = titleText[i];
    ctx.fillText(ch, currentX, infoY);
    currentX += ctx.measureText(ch).width + titleLetterSpacing;
    if (currentX > marginX + contentWidth - 80 * scale) {
      ctx.fillText("...", currentX, infoY);
      break;
    }
  }

  // 心形收藏图标
  drawHeart(ctx, marginX + contentWidth - 36 * scale, infoY + 14 * scale, textColor, scale, false);

  // 艺术家名字
  ctx.fillStyle = subTextColor;
  ctx.font = `500 ${Math.round(33 * scale)}px "Plus Jakarta Sans", "Noto Sans SC", sans-serif`;
  ctx.fillText(artist || "Unknown Artist", marginX, infoY + 76 * scale);
  ctx.restore();

  // E. 进度条 & 时间戳
  const progressY = infoY + 140 * scale;
  ctx.save();
  // 灰色底槽
  ctx.fillStyle = trackBarBg;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(marginX, progressY, contentWidth, 5 * scale, 3 * scale);
  else ctx.fillRect(marginX, progressY, contentWidth, 5 * scale);
  ctx.fill();

  // 已播放白色条 (38%)
  const currentProgress = contentWidth * 0.38;
  ctx.fillStyle = textColor;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(marginX, progressY, currentProgress, 5 * scale, 3 * scale);
  else ctx.fillRect(marginX, progressY, currentProgress, 5 * scale);
  ctx.fill();

  // 圆形指示旋钮
  ctx.beginPath();
  ctx.arc(marginX + currentProgress, progressY + 2.5 * scale, 9 * scale, 0, Math.PI * 2);
  ctx.fillStyle = textColor;
  ctx.fill();

  // 播放时间 01:24 / 03:45
  ctx.fillStyle = subTextColor;
  ctx.font = `500 ${Math.round(24 * scale)}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("01:24", marginX, progressY + 36 * scale);
  ctx.textAlign = "right";
  ctx.fillText("03:45", marginX + contentWidth, progressY + 36 * scale);
  ctx.restore();

  // F. 播放控制中心 5 组矢量按钮
  const controlsY = progressY + 146 * scale;
  const centerX = width / 2;

  ctx.save();
  // 1. 播放/暂停大圆键
  const playRadius = 78 * scale;
  ctx.beginPath();
  ctx.arc(centerX, controlsY, playRadius, 0, Math.PI * 2);
  ctx.strokeStyle = textColor;
  ctx.lineWidth = 5 * scale;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX - 12 * scale, controlsY - 24 * scale);
  ctx.lineTo(centerX + 24 * scale, controlsY);
  ctx.lineTo(centerX - 12 * scale, controlsY + 24 * scale);
  ctx.closePath();
  ctx.fillStyle = textColor;
  ctx.fill();

  // 2. 上一曲与下一曲
  drawPrev(ctx, centerX - 210 * scale, controlsY, textColor, scale);
  drawNext(ctx, centerX + 210 * scale, controlsY, textColor, scale);

  // 3. 随机与循环
  drawShuffle(ctx, centerX - 380 * scale, controlsY, subTextColor, scale);
  drawRepeat(ctx, centerX + 380 * scale, controlsY, subTextColor, scale);
  ctx.restore();

  // G. COLOR PALETTE 调色板色带
  const paletteY = controlsY + 160 * scale;
  ctx.save();
  // 标题
  ctx.fillStyle = subTextColor;
  ctx.font = `600 ${Math.round(18 * scale)}px "Plus Jakarta Sans", sans-serif`;
  ctx.textAlign = "center";
  ctx.letterSpacing = `${5 * scale}px`;
  ctx.fillText("COLOR PALETTE", centerX, paletteY);

  // 5 色色带
  const barY = paletteY + 34 * scale;
  const barHeight = 16 * scale;
  const activePalette = (palette && palette.length >= 5) ? palette.slice(0, 5) : [
    "#4A6370", "#73A0B1", "#98B6BE", "#BDCBCC", "#EBF1F2"
  ];
  const singleBarW = contentWidth / activePalette.length;

  activePalette.forEach((hex, i) => {
    const bx = marginX + i * singleBarW;
    ctx.fillStyle = hex;
    ctx.fillRect(bx, barY, singleBarW, barHeight);

    // HEX 码
    ctx.fillStyle = subTextColor;
    ctx.font = `500 ${Math.round(17 * scale)}px "Zen Maru Gothic", monospace`;
    ctx.letterSpacing = "0px";
    ctx.textAlign = "center";
    ctx.fillText(hex.toUpperCase(), bx + singleBarW / 2, barY + barHeight + 30 * scale);
  });
  ctx.restore();

  // H. 底部署名水印
  if (account) {
    ctx.save();
    ctx.fillStyle = subTextColor;
    ctx.font = `500 ${Math.round(20 * scale)}px "Plus Jakarta Sans", sans-serif`;
    ctx.textAlign = "center";
    ctx.fillText(account, centerX, height - 70 * scale);
    ctx.restore();
  }
}

function isColorLight(hex) {
  if (!hex) return false;
  const clean = hex.replace("#", "");
  if (clean.length === 6) {
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 175;
  }
  return false;
}
