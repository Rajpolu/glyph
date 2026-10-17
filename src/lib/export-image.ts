import { toPng, toSvg, toBlob } from "html-to-image";
import confetti from "canvas-confetti";

function filterNoExport(node: Node): boolean {
  if (node instanceof HTMLTextAreaElement) return false;
  if (node instanceof HTMLElement && node.classList.contains("no-export")) return false;
  return true;
}

interface ExportDimensions {
  width: number;
  height: number;
  restore: () => void;
}

function prepareElementForExport(element: HTMLElement): ExportDimensions {
  const originalWidth = element.style.width;
  const originalMinWidth = element.style.minWidth;
  const originalTransform = element.style.transform;

  // Temporarily reset any transform on element
  element.style.transform = "none";

  // Check if code content has horizontal overflow beyond current container
  const codeEl = (element.querySelector(".prism-code")?.parentElement as HTMLElement) || element.querySelector("pre");
  let targetWidth = element.offsetWidth || element.clientWidth;
  if (codeEl && codeEl.scrollWidth > codeEl.clientWidth) {
    const extra = codeEl.scrollWidth - codeEl.clientWidth + 16;
    targetWidth += extra;
    element.style.width = `${targetWidth}px`;
    element.style.minWidth = `${targetWidth}px`;
  }

  const width = Math.round(targetWidth);
  const height = Math.round(element.offsetHeight || element.clientHeight);

  return {
    width,
    height,
    restore: () => {
      element.style.width = originalWidth;
      element.style.minWidth = originalMinWidth;
      element.style.transform = originalTransform;
    },
  };
}

export async function exportToPng(
  element: HTMLElement,
  filename = "glyph-snippet.png",
  scale = 2
): Promise<void> {
  if (!element) return;

  if (document.fonts) {
    await document.fonts.ready;
  }

  const { width, height, restore } = prepareElementForExport(element);

  try {
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: scale,
      width,
      height,
      canvasWidth: width,
      canvasHeight: height,
      skipAutoScale: true,
      cacheBust: true,
      style: {
        transform: "none",
        margin: "0",
      },
      filter: filterNoExport,
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } finally {
    restore();
  }
}

export async function exportToSvg(
  element: HTMLElement,
  filename = "glyph-snippet.svg"
): Promise<void> {
  if (!element) return;

  if (document.fonts) {
    await document.fonts.ready;
  }

  const { width, height, restore } = prepareElementForExport(element);

  try {
    const dataUrl = await toSvg(element, {
      width,
      height,
      cacheBust: true,
      style: {
        transform: "none",
        margin: "0",
      },
      filter: filterNoExport,
    });

    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } finally {
    restore();
  }
}

export async function copyImageToClipboard(
  element: HTMLElement,
  scale = 2
): Promise<boolean> {
  if (!element) return false;

  if (document.fonts) {
    await document.fonts.ready;
  }

  const { width, height, restore } = prepareElementForExport(element);

  try {
    const blob = await toBlob(element, {
      quality: 1,
      pixelRatio: scale,
      width,
      height,
      canvasWidth: width,
      canvasHeight: height,
      skipAutoScale: true,
      cacheBust: true,
      style: {
        transform: "none",
        margin: "0",
      },
      filter: filterNoExport,
    });

    if (!blob) {
      throw new Error("Failed to generate image blob");
    }

    if (!navigator.clipboard || typeof ClipboardItem === "undefined") {
      throw new Error("Clipboard API not supported in this browser");
    }

    const item = new ClipboardItem({ "image/png": blob });
    await navigator.clipboard.write([item]);
    return true;
  } finally {
    restore();
  }
}

export function fireConfetti() {
  try {
    confetti({
      particleCount: 65,
      spread: 70,
      origin: { y: 0.75 },
      colors: ["#6366f1", "#a855f7", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"],
      disableForReducedMotion: true,
    });
  } catch (err) {
    console.error("Confetti error:", err);
  }
}

export async function exportCarouselToPdf(
  element: HTMLElement,
  slidesCount: number,
  setSlideIndex: (index: number) => Promise<void> | void,
  filename = "glyph-carousel.pdf",
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (!element || slidesCount <= 0) return;
  const { jsPDF } = await import("jspdf");
  let pdf: InstanceType<typeof jsPDF> | null = null;

  for (let i = 0; i < slidesCount; i++) {
    onProgress?.(i + 1, slidesCount);
    await setSlideIndex(i);
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (document.fonts) await document.fonts.ready;

    const { width, height, restore } = prepareElementForExport(element);
    try {
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        width,
        height,
        canvasWidth: width,
        canvasHeight: height,
        skipAutoScale: true,
        cacheBust: true,
        style: { transform: "none", margin: "0" },
        filter: filterNoExport,
      });

      const orientation = width >= height ? "landscape" : "portrait";
      if (!pdf) {
        pdf = new jsPDF({
          orientation,
          unit: "px",
          format: [width, height],
          hotfixes: ["px_scaling"],
        });
        pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
      } else {
        pdf.addPage([width, height], orientation);
        pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
      }
    } finally {
      restore();
    }
  }

  if (pdf) {
    pdf.save(filename);
  }
}

export async function exportCarouselSlidesToPng(
  element: HTMLElement,
  slidesCount: number,
  setSlideIndex: (index: number) => Promise<void> | void,
  baseFilename = "slide",
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (!element || slidesCount <= 0) return;

  for (let i = 0; i < slidesCount; i++) {
    onProgress?.(i + 1, slidesCount);
    await setSlideIndex(i);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await exportToPng(element, `${baseFilename}-${i + 1}.png`, 2);
  }
}

/**
 * Exports the canvas element as an animated WebM video.
 * Uses a top-to-bottom wipe reveal effect (2s reveal + 0.5s hold).
 * Falls back gracefully if MediaRecorder or WebM is unsupported.
 */
export async function exportToAnimation(
  element: HTMLElement,
  filename = "glyph-animation.webm",
  onProgress?: (pct: number) => void
): Promise<void> {
  if (!element) return;

  if (typeof MediaRecorder === "undefined") {
    throw new Error("MediaRecorder is not supported in this browser");
  }

  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : MediaRecorder.isTypeSupported("video/webm;codecs=vp8")
    ? "video/webm;codecs=vp8"
    : MediaRecorder.isTypeSupported("video/webm")
    ? "video/webm"
    : null;

  if (!mimeType) {
    throw new Error("WebM video format is not supported in this browser");
  }

  if (document.fonts) {
    await document.fonts.ready;
  }

  const { width, height, restore } = prepareElementForExport(element);
  const PIXEL_RATIO = 1.5;
  const canvasW = Math.round(width * PIXEL_RATIO);
  const canvasH = Math.round(height * PIXEL_RATIO);

  // Capture the full rendered image snapshot
  let dataUrl: string;
  try {
    dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: PIXEL_RATIO,
      width,
      height,
      canvasWidth: canvasW,
      canvasHeight: canvasH,
      skipAutoScale: true,
      cacheBust: true,
      style: { transform: "none", margin: "0" },
      filter: filterNoExport,
    });
  } finally {
    restore();
  }

  // Load the captured PNG into an Image element
  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((res) => {
    img.onload = () => res();
  });

  // Create the recording canvas (hidden, off-screen)
  const canvas = document.createElement("canvas");
  canvas.width = canvasW;
  canvas.height = canvasH;
  canvas.style.position = "fixed";
  canvas.style.top = "-9999px";
  canvas.style.left = "-9999px";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d")!;

  const FPS = 30;
  const REVEAL_FRAMES = 60; // 2 seconds
  const HOLD_FRAMES = 15;   // 0.5 seconds
  const TOTAL_FRAMES = REVEAL_FRAMES + HOLD_FRAMES;

  const stream = canvas.captureStream(FPS);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 4_000_000,
  });
  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      document.body.removeChild(canvas);
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve();
    };

    recorder.onerror = (e) => {
      document.body.removeChild(canvas);
      reject(e);
    };

    recorder.start(100); // collect data every 100ms

    let frame = 0;
    const tick = () => {
      const progress = Math.min(1, frame / REVEAL_FRAMES);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      // Fill dark background
      ctx.fillStyle = "#090a0f";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw revealed portion (top-down wipe + fade-in)
      const revealHeight = Math.round(canvas.height * eased);
      if (revealHeight > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, canvas.width, revealHeight);
        ctx.clip();
        ctx.globalAlpha = 0.3 + eased * 0.7;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      onProgress?.(Math.round((frame / TOTAL_FRAMES) * 100));
      frame++;

      if (frame < TOTAL_FRAMES) {
        setTimeout(tick, 1000 / FPS);
      } else {
        // Final full frame then stop recording
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        onProgress?.(100);
        setTimeout(() => recorder.stop(), 200);
      }
    };

    tick();
  });
}
