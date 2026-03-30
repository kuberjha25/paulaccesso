import { useRef, useState, useEffect } from "react";
import { Camera, RotateCcw, AlertCircle, Image, Upload, X, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

export function CameraCapture({ onCapture, capturedImage }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [facingMode, setFacingMode] = useState("user"); // "user" for front, "environment" for back

  const initCamera = async (mode = facingMode) => {
    try {
      // Stop existing stream if any
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      setError(null);
      setPermissionDenied(false);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
      }
    } catch (err) {
      // If exact facingMode fails, try without exact constraint
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setStream(mediaStream);
        }
      } catch (fallbackErr) {
        if (fallbackErr.name === "NotAllowedError") {
          setPermissionDenied(true);
          setError("Camera access was denied");
        } else if (fallbackErr.name === "NotFoundError") {
          setError("No camera found");
        } else {
          setError(`Camera error: ${fallbackErr.message}`);
        }
      }
    }
  };

  const switchCamera = async () => {
    const newMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(newMode);
    await initCamera(newMode);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large! Maximum size is 5MB");
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target.result;
        setPreviewUrl(imageData);
        onCapture(imageData);
        setShowGallery(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target.result;
        setPreviewUrl(imageData);
        onCapture(imageData);
        setShowGallery(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChooseFromDevice = () => {
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    setShowGallery(false);
    setFacingMode("user");
    initCamera("user");
  };

  useEffect(() => {
    initCamera();
    return () => {
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
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.8);
      onCapture(imageData);
      
      // Stop the stream after capturing
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const retake = () => {
    onCapture("");
    setPreviewUrl(null);
    initCamera();
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border-2 border-blue-200 dark:border-gray-600">
        {permissionDenied && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Camera Access Required
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Please allow camera access in your browser.
              </p>
              <Button onClick={() => initCamera()}>Try Again</Button>
            </div>
          </div>
        )}

        {error && !permissionDenied && (
          <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-800 p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <Button onClick={() => initCamera()}>Retry</Button>
            </div>
          </div>
        )}

        {!capturedImage && !error && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}

        <canvas ref={canvasRef} className="hidden" />
        
        {/* Flip Camera Button - Only show when camera is active */}
        {!capturedImage && !error && stream && (
          <button
            onClick={switchCamera}
            className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
            title="Switch Camera"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {!capturedImage && (
          <>
            <Button
              onClick={capturePhoto}
              disabled={!stream || !!error}
              className="flex-1 min-w-[120px]"
            >
              <Camera className="w-4 h-4 mr-2" /> Capture
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowGallery(true)}
              className="flex-1 min-w-[120px]"
            >
              <Image className="w-4 h-4 mr-2" /> Gallery
            </Button>
          </>
        )}
        {capturedImage && (
          <Button onClick={retake} variant="outline" className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" /> Retake
          </Button>
        )}
      </div>

      {/* Gallery Dialog - Mobile & Desktop Friendly */}
      <Dialog open={showGallery} onOpenChange={setShowGallery}>
        <DialogContent className="max-w-md sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Choose Photo</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
              onClick={handleChooseFromDevice}
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag & drop or click to select
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supports: JPG, PNG, GIF (Max 5MB)
              </p>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              capture={undefined}
            />

            {/* Camera Option (Mobile) */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">OR</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleCameraClick}
              className="w-full"
            >
              <Camera className="w-4 h-4 mr-2" /> Take Photo with Camera
            </Button>

            {/* Preview if selected */}
            {previewUrl && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">Preview</p>
                  <button
                    onClick={() => setPreviewUrl(null)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}