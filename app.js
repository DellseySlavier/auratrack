// AuraTrack 主应用逻辑与状态联动
const appState = {
  title: "青色がすき。",
  artist: "keiju · Midnight Radio",
  account: "@DellseySlavier Studio",
  width: 1320,
  height: 2868,
  theme: "glass",
  bgColor: "#2C363D",
  borderRadius: 28,
  palette: ["#4A6370", "#73A0B1", "#98B6BE", "#BDCBCC", "#EBF1F2"],
  image: null
};

// 获取界面节点
const canvas = document.getElementById("mainCanvas");
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const inputTitle = document.getElementById("inputTitle");
const inputArtist = document.getElementById("inputArtist");
const inputAccount = document.getElementById("inputAccount");
const cornerRange = document.getElementById("cornerRange");
const swatchList = document.getElementById("swatchList");
const customColorPicker = document.getElementById("customColorPicker");
const btnDownload = document.getElementById("btnDownload");
const themePicker = document.getElementById("themePicker");
const presetIndicator = document.getElementById("presetIndicator");
const presetGrid = document.querySelector(".preset-grid");

function init() {
  setupEventListeners();
  loadDefaultImage();
  renderPaletteSwatches();
}

function loadDefaultImage() {
  // 生成高质感默认示例封面
  const img = new Image();
  img.onload = () => {
    appState.image = img;
    const colors = extractColorsFromImage(img, 5);
    appState.palette = colors.map(c => c.hex);
    appState.bgColor = appState.palette[0] || "#2C363D";
    customColorPicker.value = appState.bgColor;
    renderPaletteSwatches();
    redraw();
  };
  img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1000' height='1000' viewBox='0 0 1000 1000'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%233a4f66'/%3E%3Cstop offset='50%25' stop-color='%234d7085'/%3E%3Cstop offset='100%25' stop-color='%2388a6b5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg)'/%3E%3Ccircle cx='500' cy='460' r='240' fill='rgba(255,255,255,0.12)'/%3E%3Cpath d='M380 430 L500 320 L620 430 Z' fill='rgba(255,255,255,0.22)'/%3E%3Ctext x='500' y='580' font-family='sans-serif' font-size='42' font-weight='600' fill='%23ffffff' text-anchor='middle'%3EAuraTrack Visual%3C/text%3E%3Ctext x='500' y='630' font-family='sans-serif' font-size='24' fill='rgba(255,255,255,0.7)' text-anchor='middle'%3ETap or drag image to replace%3C/text%3E%3C/svg%3E";
}

function redraw() {
  renderAuraPoster(canvas, appState);
}

function setupEventListeners() {
  // 文字输入
  inputTitle.addEventListener("input", (e) => {
    appState.title = e.target.value;
    redraw();
  });

  inputArtist.addEventListener("input", (e) => {
    appState.artist = e.target.value;
    redraw();
  });

  inputAccount.addEventListener("input", (e) => {
    appState.account = e.target.value;
    redraw();
  });

  cornerRange.addEventListener("input", (e) => {
    appState.borderRadius = parseInt(e.target.value, 10);
    redraw();
  });

  // 图片选取与拖拽
  dropZone.addEventListener("click", () => fileInput.click());
  canvas.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedImage(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedImage(e.target.files[0]);
    }
  });

  // 风格切换
  themePicker.addEventListener("click", (e) => {
    if (e.target.dataset.theme) {
      document.querySelectorAll(".seg-btn").forEach(b => b.classList.remove("active"));
      e.target.classList.add("active");
      appState.theme = e.target.dataset.theme;
      redraw();
    }
  });

  // 尺寸预设
  presetGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".preset-card");
    if (!card) return;
    document.querySelectorAll(".preset-card").forEach(c => c.classList.remove("active"));
    card.classList.add("active");

    appState.width = parseInt(card.dataset.w, 10);
    appState.height = parseInt(card.dataset.h, 10);
    presetIndicator.textContent = card.dataset.name;
    redraw();
  });

  // 自定义颜色拾取
  customColorPicker.addEventListener("input", (e) => {
    appState.bgColor = e.target.value;
    redraw();
  });

  // 导出下载
  btnDownload.addEventListener("click", () => {
    const link = document.createElement("a");
    // 改用全新项目名称与用户指定的 Studio 署名
    link.download = `AuraTrack_${appState.title.replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

function processSelectedImage(file) {
  const reader = new FileReader();
  reader.onload = (evt) => {
    const img = new Image();
    img.onload = () => {
      appState.image = img;
      // 提取色板
      const colors = extractColorsFromImage(img, 5);
      appState.palette = colors.map(c => c.hex);
      appState.bgColor = appState.palette[0] || "#2C363D";
      customColorPicker.value = appState.bgColor;
      renderPaletteSwatches();
      redraw();
    };
    img.src = evt.target.result;
  };
  reader.readAsDataURL(file);
}

function renderPaletteSwatches() {
  swatchList.innerHTML = "";
  appState.palette.forEach((hex) => {
    const swatch = document.createElement("div");
    swatch.className = `swatch-item ${hex === appState.bgColor ? "active" : ""}`;
    swatch.style.backgroundColor = hex;
    swatch.title = hex;
    swatch.addEventListener("click", () => {
      document.querySelectorAll(".swatch-item").forEach(s => s.classList.remove("active"));
      swatch.classList.add("active");
      appState.bgColor = hex;
      customColorPicker.value = hex;
      redraw();
    });
    swatchList.appendChild(swatch);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // 等待字体加载完成后重新刷新一次 Canvas，保证文字字形完美
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
});
