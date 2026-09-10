"use client"

import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import {
  CANVAS_FONT,
  computeGridDimensions,
  getBrightness,
  brightnessToChar,
  mixTowardGray,
} from "@/lib/ascii-art"

type CameraStatus = "idle" | "requesting" | "streaming" | "error"

type GridPhysics = {
  columns: number
  rows: number
  offsetX: Float32Array
  offsetY: Float32Array
  velocityX: Float32Array
  velocityY: Float32Array
}

// Grid units (1 unit = 1 character cell), tuned for a snappy push + soft settle.
const MOUSE_RADIUS = 5
const REPEL_STRENGTH = 900
const SPRING_STRENGTH = 120
const DAMPING = 10

function ensureGridPhysics(
  ref: RefObject<GridPhysics | null>,
  columns: number,
  rows: number
): GridPhysics {
  const current = ref.current
  if (current && current.columns === columns && current.rows === rows) return current

  const size = columns * rows
  const next: GridPhysics = {
    columns,
    rows,
    offsetX: new Float32Array(size),
    offsetY: new Float32Array(size),
    velocityX: new Float32Array(size),
    velocityY: new Float32Array(size),
  }
  ref.current = next
  return next
}

export function useAsciiWebcam() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const requestIdRef = useRef(0)
  // Holds the latest renderFrame so the recursive rAF callback below can call
  // it without referencing the `renderFrame` const from inside its own definition.
  const renderFrameRef = useRef<(requestId: number, timestamp?: number) => void>(() => {})

  // Read live inside the render loop without restarting the camera effect.
  const monochromeRef = useRef(0)
  const [monochrome, setMonochromeState] = useState(0)

  // Mouse position in canvas grid space (null when the pointer isn't over the canvas).
  const mouseGridRef = useRef<{ x: number; y: number } | null>(null)
  const gridPhysicsRef = useRef<GridPhysics | null>(null)
  const lastFrameTimeRef = useRef<number | null>(null)

  const [status, setStatus] = useState<CameraStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  const setMonochrome = useCallback((value: number) => {
    monochromeRef.current = value
    setMonochromeState(value)
  }, [])

  const renderFrame = useCallback((requestId: number, timestamp: number = performance.now()) => {
    if (requestId !== requestIdRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      animationFrameRef.current = requestAnimationFrame((t) => renderFrameRef.current(requestId, t))
      return
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: true })
    if (!ctx) return

    const { columns, rows } = computeGridDimensions(video.videoWidth, video.videoHeight)
    canvas.width = columns
    canvas.height = rows

    ctx.drawImage(video, 0, 0, columns, rows)
    const { data: pixels } = ctx.getImageData(0, 0, columns, rows)

    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, columns, rows)
    ctx.font = CANVAS_FONT
    ctx.textBaseline = "top"

    const amount = monochromeRef.current

    const lastTime = lastFrameTimeRef.current
    const dt = lastTime === null ? 1 / 60 : Math.min((timestamp - lastTime) / 1000, 0.05)
    lastFrameTimeRef.current = timestamp

    const physics = ensureGridPhysics(gridPhysicsRef, columns, rows)
    const mouse = mouseGridRef.current
    const dampingFactor = Math.max(0, 1 - DAMPING * dt)

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < columns; x++) {
        const i = (y * columns + x) * 4
        const r = pixels[i]
        const g = pixels[i + 1]
        const b = pixels[i + 2]

        const brightness = getBrightness(r, g, b)
        const char = brightnessToChar(brightness)
        if (char === " ") continue

        const idx = y * columns + x
        let offsetX = physics.offsetX[idx]
        let offsetY = physics.offsetY[idx]
        let velocityX = physics.velocityX[idx]
        let velocityY = physics.velocityY[idx]

        if (mouse) {
          const dx = x + offsetX - mouse.x
          const dy = y + offsetY - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MOUSE_RADIUS && dist > 0.0001) {
            const force = (1 - dist / MOUSE_RADIUS) * REPEL_STRENGTH
            velocityX += (dx / dist) * force * dt
            velocityY += (dy / dist) * force * dt
          }
        }

        // Gravity pulling displaced characters back toward their resting grid position.
        velocityX += -offsetX * SPRING_STRENGTH * dt
        velocityY += -offsetY * SPRING_STRENGTH * dt
        velocityX *= dampingFactor
        velocityY *= dampingFactor

        offsetX += velocityX * dt
        offsetY += velocityY * dt

        physics.offsetX[idx] = offsetX
        physics.offsetY[idx] = offsetY
        physics.velocityX[idx] = velocityX
        physics.velocityY[idx] = velocityY

        const finalR = mixTowardGray(r, brightness, amount)
        const finalG = mixTowardGray(g, brightness, amount)
        const finalB = mixTowardGray(b, brightness, amount)

        ctx.fillStyle = `rgb(${finalR}, ${finalG}, ${finalB})`
        ctx.fillText(char, x + offsetX, y + offsetY)
      }
    }

    animationFrameRef.current = requestAnimationFrame((t) => renderFrameRef.current(requestId, t))
  }, [])

  useEffect(() => {
    renderFrameRef.current = renderFrame
  }, [renderFrame])

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  const startCamera = useCallback(async () => {
    if (typeof window === "undefined") return

    if (!window.isSecureContext) {
      setStatus("error")
      setError("Camera access requires a secure (HTTPS or localhost) connection.")
      return
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus("error")
      setError("Camera access isn't supported in this browser.")
      return
    }

    setStatus("requesting")
    setError(null)
    const requestId = ++requestIdRef.current

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })

      if (requestId !== requestIdRef.current || !videoRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      streamRef.current = stream
      const video = videoRef.current
      video.srcObject = stream

      await new Promise<void>((resolve) => {
        if (video.readyState >= 1) {
          resolve()
        } else {
          video.onloadedmetadata = () => resolve()
        }
      })

      if (requestId !== requestIdRef.current) return

      await video.play()
      setStatus("streaming")
      renderFrame(requestId)
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return
      if (requestId !== requestIdRef.current) return

      setStatus("error")
      setError(
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Camera permission was denied."
          : "Couldn't access the camera."
      )
    }
  }, [renderFrame])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Track at window level (not on the canvas) since UI overlays sit on top of it
    // and would otherwise swallow pointer events before they reach the canvas.
    const updateMouseGrid = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return

      mouseGridRef.current = {
        x: ((event.clientX - rect.left) / rect.width) * canvas.width,
        y: ((event.clientY - rect.top) / rect.height) * canvas.height,
      }
    }

    const clearMouseGrid = () => {
      mouseGridRef.current = null
    }

    window.addEventListener("pointermove", updateMouseGrid)
    window.addEventListener("blur", clearMouseGrid)
    document.documentElement.addEventListener("pointerleave", clearMouseGrid)

    return () => {
      window.removeEventListener("pointermove", updateMouseGrid)
      window.removeEventListener("blur", clearMouseGrid)
      document.documentElement.removeEventListener("pointerleave", clearMouseGrid)
    }
  }, [])

  useEffect(() => {
    return () => {
      requestIdRef.current++
      stopStream()
    }
  }, [stopStream])

  return { videoRef, canvasRef, status, error, monochrome, setMonochrome, startCamera }
}
