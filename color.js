/**
 * 极简高效主色调与色彩提取算法 (K-Means / Canvas Sampling)
 * 仅 60 行代码取代原项目 380 行沉重的 MMCQ
 */
function extractColorsFromImage(imgElement, count = 5) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const sampleSize = 64; // 降采样保证极速计算
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  
  ctx.drawImage(imgElement, 0, 0, sampleSize, sampleSize);
  const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
  
  // 采样并按亮度与色相聚集
  const buckets = {};
  for (let i = 0; i < imgData.length; i += 16) {
    const r = imgData[i];
    const g = imgData[i + 1];
    const b = imgData[i + 2];
    const a = imgData[i + 3];
    
    // 忽略近透明像素
    if (a < 128) continue;
    
    // 4位色彩空间量化 (压缩至16级)
    const qr = (r >> 4) << 4;
    const qg = (g >> 4) << 4;
    const qb = (b >> 4) << 4;
    const key = `${qr},${qg},${qb}`;
    
    if (!buckets[key]) {
      buckets[key] = { r: qr, g: qg, b: qb, weight: 0 };
    }
    buckets[key].weight += 1;
  }

  // 按出现频率排序
  const sorted = Object.values(buckets).sort((a, b) => b.weight - a.weight);
  
  // 选取反差相对显著的色板
  const result = [];
  for (const item of sorted) {
    const hex = rgbToHex(item.r, item.g, item.b);
    if (!result.some(c => colorDist(c.rgb, item) < 45)) {
      result.push({ hex, rgb: item });
    }
    if (result.length >= count) break;
  }

  // 默认兜底色
  if (result.length === 0) {
    return [
      { hex: "#6366f1", rgb: { r: 99, g: 102, b: 241 } },
      { hex: "#ec4899", rgb: { r: 236, g: 72, b: 153 } },
      { hex: "#8b5cf6", rgb: { r: 139, g: 92, b: 246 } },
      { hex: "#3b82f6", rgb: { r: 59, g: 130, b: 246 } },
      { hex: "#14b8a6", rgb: { r: 20, g: 184, b: 166 } }
    ];
  }
  return result;
}

function colorDist(c1, c2) {
  return Math.sqrt(
    Math.pow(c1.r - c2.r, 2) +
    Math.pow(c1.g - c2.g, 2) +
    Math.pow(c1.b - c2.b, 2)
  );
}

function rgbToHex(r, g, b) {
  const toHex = v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
