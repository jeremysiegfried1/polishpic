'use client';

import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [selectedBackdrop, setSelectedBackdrop] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const backdrops = [
    { name: 'Office Blur', url: 'https://www.freepik.com/free-photo/blurred-office-background_1234567.jpg' }, // Replace with real free URLs from Freepik/Unsplash
    { name: 'Studio Gray', url: 'https://unsplash.com/photos/gray-studio-background-abc123.jpg' },
    { name: 'Modern White', url: 'https://unsplash.com/photos/white-office-wall-def456.jpg' },
    { name: 'Professional Blue', url: 'https://freepik.com/free-photo/blue-gradient-background-ghi789.jpg' },
    { name: 'Corporate Green', url: 'https://unsplash.com/photos/green-office-backdrop-jkl012.jpg' },
  ];

  useEffect(() => {
    async function loadModels() {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models'); // Download models folder from face-api.js GitHub and host in public/
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      setModelsLoaded(true);
    }
    loadModels();
  }, []);

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      detectFace(); // Start face detection for frame
    } catch (err) {
      alert("Camera access denied or not available");
    }
  };

  const detectFace = async () => {
    if (!modelsLoaded || !videoRef.current) return;
    const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    if (detection) {
      // Draw frame around face (oval guide)
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const landmarks = detection.landmarks;
      // Simple oval frame around face
      ctx.beginPath();
      ctx.ellipse(landmarks.getJawOutline()[8].x, landmarks.getJawOutline()[8].y, 150, 200, 0, 0, 2 * Math.PI);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
    }
    requestAnimationFrame(detectFace);
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);
    applyEnhancements(imageData);
  };

  const applyEnhancements = (imageSrc) => {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      // Lighting (brightness/contrast)
      ctx.filter = 'brightness(1.1) contrast(1.05)';

      // Skin smoothing (simple blur on face area - use faceapi for position)
      // For simplicity, blur whole but in real, use landmarks
      ctx.filter += ' blur(1px)';

      // Teeth whitening & eye brightening (color adjust - detect with landmarks)
      // Placeholder: Increase saturation on mouth/eyes areas
      ctx.filter += ' saturate(1.2)';

      ctx.drawImage(img, 0, 0);
      const enhanced = canvas.toDataURL('image/png');
      setEnhancedImage(enhanced);
    };
  };

  const applyBackdrop = (backdropUrl) => {
    if (!enhancedImage) return;
    const img = new Image();
    img.src = enhancedImage;
    img.onload = () => {
      const backdropImg = new Image();
      backdropImg.src = backdropUrl;
      backdropImg.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(backdropImg, 0, 0, canvas.width, canvas.height); // Backdrop first
        ctx.drawImage(img, 0, 0); // Face on top
        // Add watermark
        ctx.font = '30px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('PolishPic Watermark', 20, canvas.height - 20);
        setEnhancedImage(canvas.toDataURL('image/png'));
      };
    };
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setCapturedImage(null);
    setEnhancedImage(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md bg-white rounded-3xl shadow-2xl p-10">
        <h1 className="text-4xl font-extrabold text-indigo-900 mb-3">PolishPic</h1>
        <p className="text-lg text-gray-600 mb-8">Natural headshot enhancer for pros. Free & instant.</p>

        {!isCameraOpen ? (
          <button
            onClick={openCamera}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-10 rounded-xl shadow-md transform hover:scale-105 transition duration-300"
          >
            Start Enhancement
          </button>
        ) : (
          <div className="relative">
            <video ref={videoRef} className="w-full rounded-2xl shadow-lg" playsInline muted />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full overlay-frame" />
            <button
              onClick={capturePhoto}
              className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-xl shadow-md"
            >
              Snap!
            </button>
            <button onClick={closeCamera} className="ml-4 bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-xl">
              Cancel
            </button>
          </div>
        )}

        {enhancedImage && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Your Enhanced Headshot</h2>
            <img src={enhancedImage} alt="Enhanced" className="w-full rounded-2xl shadow-lg mb-4" />
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {backdrops.map((bd) => (
                <button
                  key={bd.name}
                  onClick={() => {
                    setSelectedBackdrop(bd.url);
                    applyBackdrop(bd.url);
                  }}
                  className="bg-gray-200 hover:bg-gray-300 py-2 px-4 rounded-lg"
                >
                  {bd.name}
                </button>
              ))}
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-xl">
              Buy HD ($4) - Coming Soon
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
