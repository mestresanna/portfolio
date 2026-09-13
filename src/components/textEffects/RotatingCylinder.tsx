"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface RotatingCylinderProps {
  /** Text wrapped around the cylinder's curved surface */
  text?: string;
  /** Image URL drawn onto the same surface as the text */
  imageSrc?: string;
  /** Cylinder radius */
  radius?: number;
  /** Cylinder length (world X axis, since it lies horizontally) */
  length?: number;
  className?: string;
}

export default function RotatingCylinder({
  text = "ANNA MESTRES • ANNA MESTRES • ANNA MESTRES • ",
  imageSrc,
  radius = 1.2,
  length = 4,
  className = "",
}: RotatingCylinderProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ---------- Scene setup ----------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(3, 4, 5);
    scene.add(ambient, dir);

    // ---------- Build the label texture (image + text) ----------
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d")!;

    // Greedy word-wrap: break `fullText` into lines no wider than maxWidth
    // (measured with whatever font is currently set on ctx2d).
    function wrapLines(ctx2d: CanvasRenderingContext2D, fullText: string, maxWidth: number) {
      const words = fullText.split(" ");
      const lines: string[] = [];
      let current = "";
      for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (current && ctx2d.measureText(candidate).width > maxWidth) {
          lines.push(current);
          current = word;
        } else {
          current = candidate;
        }
      }
      if (current) lines.push(current);
      return lines;
    }

    // Word-wrap `fullText` at the largest font size (down to minSize) whose
    // wrapped lines still fit within maxHeight — so the whole paragraph is
    // shown once, sized to fit, instead of being tiled/repeated.
    function fitWrappedLines(
      ctx2d: CanvasRenderingContext2D,
      fullText: string,
      maxWidth: number,
      maxHeight: number,
      startSize: number,
      minSize: number
    ) {
      for (let size = startSize; size >= minSize; size -= 2) {
        const font = `bold ${size}px sans-serif`;
        ctx2d.font = font;
        const lines = wrapLines(ctx2d, fullText, maxWidth);
        const lineHeight = size * 1.3;
        if (lines.length * lineHeight <= maxHeight) {
          return { font, lineHeight, lines };
        }
      }
      const font = `bold ${minSize}px sans-serif`;
      ctx2d.font = font;
      return { font, lineHeight: minSize * 1.3, lines: wrapLines(ctx2d, fullText, maxWidth) };
    }

    function drawLabel(img?: HTMLImageElement) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // The circumference is split into a text panel and (if there's an
      // image) an image panel, side by side — together they wrap the
      // cylinder exactly once, no tiling/repeating.
      const textPanelWidth = img ? canvas.width / 2 : canvas.width;

      if (img) {
        const imagePanelWidth = canvas.width - textPanelWidth;
        // "cover"-style crop so the image fills its panel without stretching.
        const panelAspect = imagePanelWidth / canvas.height;
        const imgAspect = img.width / img.height;
        let sx = 0;
        let sy = 0;
        let sw = img.width;
        let sh = img.height;
        if (imgAspect > panelAspect) {
          sw = img.height * panelAspect;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / panelAspect;
          sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, textPanelWidth, 0, imagePanelWidth, canvas.height);
      }

      // Draw the paragraph normally (horizontal, word-wrapped, multi-line)
      // onto an offscreen canvas, then rotate that 90° onto the text panel
      // of the real texture canvas. The geometry wraps canvas-X around the
      // tube's circumference and canvas-Y along its length — rotating the
      // text swaps that, so the paragraph reads along the cylinder's
      // length (horizontal on screen once it's laid on its side) instead
      // of wrapping around the roll axis, with multiple lines stacked
      // around the circumference instead of one giant line.
      const textCanvas = document.createElement("canvas");
      textCanvas.width = canvas.height; // length budget (px)
      textCanvas.height = textPanelWidth; // this panel's circumference share, drawn once
      const textCtx = textCanvas.getContext("2d")!;

      const marginX = 40;
      const { font, lineHeight, lines } = fitWrappedLines(
        textCtx,
        text,
        textCanvas.width - marginX * 2,
        textCanvas.height - 24,
        56,
        16
      );

      textCtx.fillStyle = "#ffffff";
      textCtx.font = font;
      textCtx.textBaseline = "middle";
      textCtx.textAlign = "left";
      lines.forEach((line, i) => {
        textCtx.fillText(line, marginX, lineHeight / 2 + 12 + i * lineHeight);
      });

      ctx.save();
      ctx.translate(textPanelWidth / 2, canvas.height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.drawImage(textCanvas, -textCanvas.width / 2, -textCanvas.height / 2);
      ctx.restore();

      texture.needsUpdate = true;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    drawLabel(); // draw immediately with just the red background + text

    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => drawLabel(img);
      img.src = imageSrc;
    }

    // ---------- Cylinder geometry, laid horizontally ----------
    // Default CylinderGeometry axis is Y; wrap it in a group rotated
    // 90° on Z so the cylinder's own axis lies along world X. The label
    // texture is pre-rotated to compensate (see drawLabel), so the text
    // still reads along that horizontal length axis. Capped
    // (openEnded: false) so it reads as a solid 3D object.
    const geometry = new THREE.CylinderGeometry(radius, radius, length, 64, 1, false);
    const sideMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.FrontSide,
    });
    const capMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    // CylinderGeometry groups: 0 = side, 1 = top cap, 2 = bottom cap.
    const cylinder = new THREE.Mesh(geometry, [sideMaterial, capMaterial, capMaterial]);

    const group = new THREE.Group();
    group.rotation.z = Math.PI / 2; // lay it on its side
    group.add(cylinder);
    scene.add(group);

    // ---------- Drag-to-orbit interaction ----------
    // Because the group is rotated 90° on Z, spinning the cylinder around
    // its local Y ("yaw") reads visually as a horizontal roll around world
    // X — rolling it forward/back cycles which wrapped lines are
    // front-facing, like a drum. Vertical drag ("pitch", local X) tilts it
    // end-over-end so it can be freely orbited and inspected as a solid.
    let isDragging = false;
    let lastX = 0;
    let lastY = 0;
    let velocityYaw = 0;
    let velocityPitch = 0;

    function onPointerDown(e: PointerEvent) {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      velocityYaw = 0;
      velocityPitch = 0;
      renderer.domElement.setPointerCapture(e.pointerId);
    }
    function onPointerMove(e: PointerEvent) {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      const deltaYaw = dx * 0.01;
      const deltaPitch = dy * 0.01;
      cylinder.rotation.y += deltaYaw;
      cylinder.rotation.x += deltaPitch;
      velocityYaw = deltaYaw;
      velocityPitch = deltaPitch;
    }
    function onPointerUp() {
      isDragging = false;
    }

    renderer.domElement.style.touchAction = "none";
    renderer.domElement.style.cursor = "grab";
    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // ---------- Render loop ----------
    let frameId: number;
    function animate() {
      frameId = requestAnimationFrame(animate);

      if (!isDragging) {
        // gentle inertia; yaw decays to a slow idle roll so new wrapped
        // lines keep drifting into view, pitch just decays to rest.
        velocityYaw *= 0.96;
        velocityPitch *= 0.96;
        cylinder.rotation.y += velocityYaw + 0.002;
        cylinder.rotation.x += velocityPitch;
      }

      renderer.render(scene, camera);
    }
    animate();

    // ---------- Resize handling ----------
    function handleResize() {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    }
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    // ---------- Cleanup ----------
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      geometry.dispose();
      sideMaterial.dispose();
      capMaterial.dispose();
      texture.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [text, imageSrc, radius, length]);

  return <div ref={mountRef} className={`h-full w-full ${className}`} />;
}
