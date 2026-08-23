"use client";

import React, { useRef, useState, useEffect } from "react";
import { Camera, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { uploadFile } from "@/lib/storage";
import { useSession } from "next-auth/react";

interface WebcamCaptureProps {
  onCaptureConfirm: (selfieUrl: string) => void;
}

export default function WebcamCapture({ onCaptureConfirm }: WebcamCaptureProps) {
  const { data: session } = useSession();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stream]);

  // Attach stream to video element when active
  useEffect(() => {
    if (cameraActive && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  const startCamera = async () => {
    setErrorMsg(null);
    setCapturedImage(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setCameraActive(true);
    } catch (err: unknown) {
      console.error("Webcam access error:", err);
      const errorObj = err as { name?: string };
      setErrorMsg(
        errorObj.name === "NotAllowedError" || errorObj.name === "PermissionDeniedError"
          ? "Camera permission denied. Please allow camera access in your browser settings."
          : "Webcam not found or unsupported by your device."
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const handleStartCountdown = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          takeSnapshot();
          return null;
        }
        return prev !== null ? prev - 1 : null;
      });
    }, 1000);
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleConfirmPhoto = async () => {
    if (!capturedImage) return;

    setUploading(true);
    setErrorMsg(null);

    try {
      // Convert Data URL → Blob → File
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const fileName = `selfie-${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: "image/jpeg" });
      const userId = session?.user?.id || "user-selfie";

      // Upload via lib/storage helper using browser client to "selfies" bucket (Rule 1, Rule 2, Rule 3)
      const publicUrl = await uploadFile("selfies", file, userId);
      onCaptureConfirm(publicUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[Storage Error] Supabase selfie upload failed:", message);
      setErrorMsg(`Failed to upload selfie to storage: ${message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Off-screen canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {errorMsg && (
        <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2.5 font-medium">
          <AlertCircle className="size-5 shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main View Area */}
      <div className="relative w-full max-w-md mx-auto aspect-4/3 rounded-3xl bg-neutral-900 overflow-hidden border-2 border-neutral-200 dark:border-neutral-800 shadow-lg flex items-center justify-center">

        {/* State 1: Camera Inactive & No Capture */}
        {!cameraActive && !capturedImage && (
          <div className="p-6 text-center space-y-4 text-white">
            <div className="w-16 h-16 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center mx-auto border border-teal-500/30">
              <Camera className="size-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold tracking-tight">Live Identity Selfie</h3>
              <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                Press the button below to enable your camera and take a live face verification photo.
              </p>
            </div>
            <button
              type="button"
              onClick={startCamera}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-semibold text-xs transition-all shadow-md shadow-teal-600/20 cursor-pointer inline-flex items-center gap-2"
            >
              <Camera className="size-4" />
              Start Camera
            </button>
          </div>
        )}

        {/* State 2: Camera Active Preview */}
        {cameraActive && (
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* Face Guidelines Overlay */}
            <div className="absolute inset-0 border-[3px] border-dashed border-teal-400/60 rounded-[45%] mx-auto my-6 w-[55%] pointer-events-none flex items-center justify-center">
              <span className="text-[10px] uppercase tracking-widest text-teal-300 font-bold bg-black/60 px-2 py-0.5 rounded-full">
                Fit Face Here
              </span>
            </div>

            {/* Live Instruction Bar */}
            <div className="absolute top-3 left-3 right-3 bg-black/70 backdrop-blur-sm text-white text-[10px] py-1.5 px-3 rounded-xl flex items-center justify-between font-medium">
              <span>👓 Remove glasses</span>
              <span>🎧 No earphones</span>
              <span>💡 Good lighting</span>
            </div>

            {/* Countdown Overlay */}
            {countdown !== null && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center text-white">
                <span className="text-6xl font-black animate-ping text-teal-400">{countdown}</span>
              </div>
            )}

            {/* Capture Controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 px-4">
              <button
                type="button"
                onClick={handleStartCountdown}
                disabled={countdown !== null}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-xs shadow-lg shadow-teal-600/30 transition-all cursor-pointer inline-flex items-center gap-2 disabled:opacity-60"
              >
                <Camera className="size-4" />
                {countdown !== null ? `Capturing in ${countdown}...` : "Snap Photo"}
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="px-4 py-2.5 rounded-xl bg-black/60 hover:bg-black/80 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* State 3: Photo Captured Preview */}
        {capturedImage && (
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
            <img
              src={capturedImage}
              alt="Selfie capture preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-emerald-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-md">
              <CheckCircle2 className="size-3" /> Photo Ready
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Actions */}
      {capturedImage && (
        <div className="flex justify-center gap-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={handleRetake}
            disabled={uploading}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            Retake Photo
          </button>
          <button
            type="button"
            onClick={handleConfirmPhoto}
            disabled={uploading}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Saving Selfie...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="size-4" />
                <span>Use This Photo</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
