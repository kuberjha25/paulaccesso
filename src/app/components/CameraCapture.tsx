import { useRef, useState, useEffect } from "react";
import { Camera, RotateCcw, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  capturedImage?: string;
}

export function CameraCapture({ onCapture, capturedImage }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [captureTimestamp, setCaptureTimestamp] = useState<string>("");
  const [permissionDenied, setPermissionDenied] = useState(false);

  const initCamera = async () => {
    try {
      setError(null);
      setPermissionDenied(false);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setError(null);
      }
    } catch (err) {
      console.error("Camera error:", err);
      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          setPermissionDenied(true);
          setError("Camera access was denied");
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device");
        } else if (err.name === "NotReadableError") {
          setError("Camera is already in use by another application");
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError("Unable to access camera");
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      await initCamera();
    };

    init();

    return () => {
      mounted = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        // Add timestamp overlay
        const timestamp = new Date().toLocaleString();
        context.fillStyle = "rgba(0, 0, 0, 0.7)";
        context.fillRect(0, canvas.height - 40, canvas.width, 40);
        context.fillStyle = "white";
        context.font = "16px Arial";
        context.fillText(timestamp, 10, canvas.height - 15);

        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        onCapture(imageData);

        // Stop camera stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  const retake = () => {
    onCapture("");
    // Restart camera
    initCamera();
  };

  // Update timestamp every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Save timestamp when photo is captured
  useEffect(() => {
    if (capturedImage) {
      setCaptureTimestamp(new Date().toLocaleString());
    }
  }, [capturedImage]);

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-violet-50 to-cyan-50 border-2 border-violet-200">
        {permissionDenied && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-md text-center">
              <div className="size-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <Camera className="size-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Camera Access Required
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                To capture visitor photos, please allow camera access in your browser.
              </p>
              <div className="space-y-3 text-left bg-slate-50 p-4 rounded-lg mb-4">
                <p className="text-xs font-semibold text-slate-700">How to enable:</p>
                <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
                  <li>Click the camera icon 🎥 in your browser's address bar</li>
                  <li>Select "Allow" or "Always allow"</li>
                  <li>Click the "Try Again" button below</li>
                </ol>
              </div>
              <Button
                onClick={initCamera}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
              >
                <Camera className="size-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}
        
        {error && !permissionDenied && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-50 to-cyan-50 p-6">
            <div className="bg-white rounded-lg p-6 shadow-lg max-w-md text-center">
              <div className="size-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <Camera className="size-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Camera Error
              </h3>
              <p className="text-sm text-slate-600 mb-4">{error}</p>
              <Button
                onClick={initCamera}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
              >
                <RotateCcw className="size-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        )}
        
        {!capturedImage && !error && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Timestamp Overlay */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded text-sm font-medium">
              {currentTime}
            </div>
          </>
        )}
        
        {capturedImage && (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />
            {/* Timestamp Overlay on Captured Image */}
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded text-sm font-medium">
              {captureTimestamp}
            </div>
          </div>
        )}
        
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="flex gap-2">
        {!capturedImage ? (
          <Button
            onClick={capturePhoto}
            disabled={!stream || !!error}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="size-4 mr-2" />
            Capture Photo
          </Button>
        ) : (
          <Button 
            onClick={retake} 
            variant="outline" 
            className="w-full border-violet-300 hover:bg-violet-50 text-violet-700"
          >
            <RotateCcw className="size-4 mr-2" />
            Retake Photo
          </Button>
        )}
      </div>
    </div>
  );
}