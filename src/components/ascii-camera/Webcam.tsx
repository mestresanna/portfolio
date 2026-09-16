"use client"

import { useEffect, useState, useSyncExternalStore } from "react"

import { useAsciiWebcam } from "@/hooks/use-ascii-webcam"
import { useTheme } from "@/hooks/use-theme"

const CONSENT_COOKIE = "ascii-camera-consent"
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

const consentListeners = new Set<() => void>()

function subscribeConsent(callback: () => void) {
  consentListeners.add(callback)
  return () => consentListeners.delete(callback)
}

function getConsentSnapshot(): "granted" | "declined" | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`))
  let value: string | null = null
  try {
    value = match ? decodeURIComponent(match[1]) : null
  } catch {
    // Malformed cookie value (e.g. hand-edited via devtools) — treat as unset
    // rather than letting decodeURIComponent's URIError crash the render.
    value = null
  }
  return value === "granted" || value === "declined" ? value : null
}

function getConsentServerSnapshot(): "granted" | "declined" | null {
  return null
}

function writeConsentCookie(value: "granted" | "declined") {
  document.cookie = `${CONSENT_COOKIE}=${value}; max-age=${CONSENT_MAX_AGE}; path=/; samesite=lax; secure`
  consentListeners.forEach((listener) => listener())
}

export function Webcam() {
  const { videoRef, canvasRef, status, error, setMonochrome, startCamera, stopCamera } =
    useAsciiWebcam()
  const consent = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getConsentServerSnapshot)
  const { theme } = useTheme()
  // Tracks only an *explicit* toggle action (button, or Yes/No in the
  // prompt) — null means "no explicit choice this session yet", so the
  // camera defaults to on unless the user had already declined before
  // (persisted via the cookie). This is a plain derivation, not state
  // synced from `consent` via an effect, so toggling the camera back on
  // always correctly re-asks rather than being overwritten back to off.
  const [manualOverride, setManualOverride] = useState<boolean | null>(null)
  const cameraOn = manualOverride ?? consent !== "declined"
  const requesting = status === "requesting"
  const showConsentPrompt =
    cameraOn && consent !== "granted" && (status === "idle" || status === "error")

  // Dark theme => grayscale ascii render, light theme => full color.
  useEffect(() => {
    setMonochrome(theme === "dark" ? 1 : 0)
  }, [theme, setMonochrome])

  // If the user previously said yes, skip the prompt and go straight back to
  // the camera instead of asking again — on every page load (once `consent`
  // resolves past the SSR snapshot) and on every fresh mount from client-side
  // navigation (e.g. returning from /work), and whenever they toggle the
  // camera back on. Gating on `status === "idle"` (rather than a "did we
  // already try" ref) lets this correctly retry on each fresh mount /
  // toggle-on without looping once a request is in flight or settled.
  useEffect(() => {
    if (cameraOn && consent === "granted" && status === "idle") startCamera()
  }, [cameraOn, consent, status, startCamera])

  useEffect(() => {
    if (status === "streaming") writeConsentCookie("granted")
  }, [status])

  const handleDecline = () => {
    writeConsentCookie("declined")
    // Otherwise showConsentPrompt (cameraOn && consent !== "granted") would
    // stay true and immediately re-show the same prompt.
    setManualOverride(false)
  }

  const handleToggleCamera = () => {
    if (cameraOn) {
      stopCamera()
      setManualOverride(false)
    } else {
      setManualOverride(true)
    }
  }

  return (
    <>
      {cameraOn && (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="hidden" />
          <canvas ref={canvasRef} className="fixed inset-0 h-screen w-screen" />
        </>
      )}

      {!cameraOn && (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/images/poster_background.png"
          className="fixed inset-0 h-screen w-screen object-cover"
        >
          <source src="/videos/output.webm" type="video/webm" />
          <source src="/videos/output.mp4" type="video/mp4" />
        </video>
      )}

	<button
	  type="button"
	  onClick={handleToggleCamera}
	  aria-pressed={cameraOn}
	  aria-label={cameraOn ? "Turn camera off" : "Turn camera on"}
	  title={cameraOn ? "Turn camera off" : "Turn camera on"}
	  className="fixed right-4 top-[calc(3%+2rem)] z-40 flex h-10 w-10 items-center justify-center border border-foreground bg-foreground text-background rounded-md backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground"
	>
	  <svg
	    width="20"
	    height="20"
	    viewBox="0 0 24 24"
	    fill="none"
	    stroke="currentColor"
	    strokeWidth="1.75"
	    strokeLinecap="round"
	    strokeLinejoin="round"
	    aria-hidden="true"
	  >
	    <path d="M3 8.5a2 2 0 0 1 2-2h1.5l1.2-1.8a1 1 0 0 1 .84-.45h6.92a1 1 0 0 1 .84.45L17.5 6.5H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-9Z" />
	    <circle cx="12" cy="13" r="3.3" />
	    {!cameraOn && <line x1="3" y1="3" x2="21" y2="21" />}
	  </svg>
	</button>

      {showConsentPrompt && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/poster_background.png)" }}
        />
      )}

      {showConsentPrompt && (
	<div className="fixed inset-0 z-30 flex items-center justify-center p-4">
	  <div className="w-full max-w-sm border border-neutral-900 bg-white p-6 text-neutral-900 rounded-lg">
	    {status === "error" && error && (
	      <p className="mb-5 border-b border-neutral-900/20 pb-4 text-xs uppercase tracking-wide text-neutral-600">
		{error}
	      </p>
	    )}

	    <div className="mb-8">
	      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-neutral-500">
		Camera
	      </p>

	      <p className="text-lg leading-snug">
		Do you want to enable your camera to have a cool effect?
	      </p>
	    </div>

	    <div className="flex gap-2">
	      <button
		type="button"
		onClick={startCamera}
		className="border border-neutral-900 rounded-lg bg-neutral-900 px-5 py-2 text-sm text-white transition-colors hover:bg-white hover:text-neutral-900"
	      >
		Yes
	      </button>

	      <button
		type="button"
		onClick={handleDecline}
		className="border border-neutral-900 rounded-lg px-5 py-2 text-sm transition-colors hover:bg-neutral-900 hover:text-white"
	      >
		No
	      </button>
	    </div>

	    <p className="mt-6 max-w-xs text-xs leading-relaxed text-neutral-500">
	      If you decline, you will see a video background instead of the effect.
	    </p>
	  </div>
	</div>
      )}

      {requesting && (
        <div className="fixed inset-0 z-30 flex items-center justify-center from-neutral-700 via-neutral-900 to-black background-blend-mode hard-light">
          <div
            role="status"
            aria-label="Requesting camera access"
            className="h-14 w-14 animate-spin rounded-full border-4 border-white/20 border-t-white"
          />
        </div>
      )}

    </>
  )
}
