"use client"

import { useEffect, useSyncExternalStore } from "react"

import { useAsciiWebcam } from "@/hooks/use-ascii-webcam"

const CONSENT_COOKIE = "ascii-camera-consent"
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

const consentListeners = new Set<() => void>()

function subscribeConsent(callback: () => void) {
  consentListeners.add(callback)
  return () => consentListeners.delete(callback)
}

function getConsentSnapshot(): "granted" | "declined" | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`))
  const value = match ? decodeURIComponent(match[1]) : null
  return value === "granted" || value === "declined" ? value : null
}

function getConsentServerSnapshot(): "granted" | "declined" | null {
  return null
}

function writeConsentCookie(value: "granted" | "declined") {
  document.cookie = `${CONSENT_COOKIE}=${value}; max-age=${CONSENT_MAX_AGE}; path=/; samesite=lax`
  consentListeners.forEach((listener) => listener())
}

export function Webcam() {
  const { videoRef, canvasRef, status, error, monochrome, setMonochrome, startCamera } =
    useAsciiWebcam()
  const consent = useSyncExternalStore(subscribeConsent, getConsentSnapshot, getConsentServerSnapshot)
  const declined = consent === "declined"
  const awaitingResponse = !declined && status !== "streaming"

  // If the user previously said yes, skip the prompt and go straight back to
  // the camera instead of asking again — on every page load (once `consent`
  // resolves past the SSR snapshot) and on every fresh mount from client-side
  // navigation (e.g. returning from /work). Gating on `status === "idle"`
  // (rather than a "did we already try" ref) lets this correctly retry on
  // each fresh mount without looping once a request is in flight or settled.
  useEffect(() => {
    if (consent === "granted" && status === "idle") startCamera()
  }, [consent, status, startCamera])

  useEffect(() => {
    if (status === "streaming") writeConsentCookie("granted")
  }, [status])

  const handleDecline = () => {
    writeConsentCookie("declined")
  }

  return (
    <>
      {!declined && (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="hidden" />
          <canvas ref={canvasRef} className="fixed inset-0 h-screen w-screen" />
        </>
      )}

      {declined && (
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

      {awaitingResponse && (
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/poster_background.png)" }}
        />
      )}

      {awaitingResponse && (
        <div className="fixed inset-0 z-30 flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-4 rounded-lg border border-white/40 bg-white/10 p-6 text-center text-neutral-900 shadow-lg backdrop-blur-md">
            {status === "error" && error && <p className="max-w-xs text-sm">{error}</p>}
            <p className="max-w-xs text-sm">Do you want to enable your camera to have a cool effect?
	    <br />
	    This is just in your personal browser, it is just for you ;) 
	    </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={startCamera}
                disabled={status === "requesting"}
                className="rounded-md border border-neutral-900/30 px-4 py-2 text-sm hover:bg-neutral-900/10 disabled:opacity-50"
              >
                {status === "requesting" ? "Requesting access…" : "Yes"}
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="rounded-md border border-neutral-900/30 px-4 py-2 text-sm hover:bg-neutral-900/10"
              >
                No
              </button>

            </div>
	      <p className="max-w-xs text-sm">If you decline, you will see a video background instead of the effect.</p>
          </div>
        </div>
      )}

      {status === "streaming" && (
        <div className="fixed left-6 top-1/2 z-20 -translate-y-1/2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={monochrome}
            onChange={(event) => setMonochrome(Number(event.target.value))}
            aria-label="Monochrome intensity"
            className="h-32 w-2 appearance-none"
            style={{ writingMode: "vertical-lr", direction: "rtl" }}
          />
        </div>
      )}
    </>
  )
}
