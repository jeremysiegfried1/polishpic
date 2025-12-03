'use client';

import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [subtlety, setSubtlety] = useState(50); // 0-100 slider
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  const backdrops = [
    { name: 'Office Blur', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&w=800' },
    { name: 'Studio Gray', url: 'https://images.unsplash.com/photo-1510070112810-d4f60d7c2b6c?ixlib=rb-4.0.3&w=800' },
    { name: 'Clean White', url: 'https://images.unsplash.com/photo-1558618666-194e9df0e39b?ixlib=rb-4.0.3&w=800' },
    { name: 'Modern Blue', url: 'https://images.unsplash.com/photo-1557682257-2f9c37c9d3e8?ixlib=rb-4.0.3&w=800' },
    { name: 'Corporate Dark', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=800' },
  ];

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      setModelsLoaded(true);
    } catch (err) {
      console.error('Model load error:', err);
    }
  };

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      detectFace();
    } catch (err) {
      alert('Camera access needed for magic. Allow and retry!');
    }
  };

  const detectFace = async () => {
    if (!modelsLoaded || !videoRef.current) return;
    const video = videoRef.current;
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    if (detections) {
      setFaceDetected(true);
      // Draw oval frame around face
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const box = detections.detection.box;
        ctx.beginPath();
        ctx.ellipse(box.x + box.width / 2, box.y + box.height / 2, box.width / 1.5, box.height, 0, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
      }
    } else {
      setFaceDetected(false);
    }
    requestAnimationFrame(detectFace);
  };

  const capturePhoto = () => {
    if (!faceDetected) {
      alert('Position your face in the oval for best results!');
      return;
    }
    setLoading(true);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/png');
    setCapturedImage(imageData);
    setTimeout(() => applyEnhancements(imageData), 500); // Simulate processing
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

      // Subtlety-based filters (natural: low values = minimal changes)
      const bright = 1 + (subtlety / 100) * 0.15;
      const contrast = 1 + (subtlety / 100) * 0.1;
      const blur = (subtlety / 100) * 2; // px
      const sat = 1 + (subtlety / 100) * 0.3;

      ctx.filter = `brightness(${bright}) contrast(${contrast}) blur(${blur}px) saturate(${sat})`;
      ctx.drawImage(img, 0, 0);

      // Face-specific: Use landmarks for eye/teeth (simplified)
      // In full, detect landmarks and adjust regions—here, global for MVP

      const enhanced = canvas.toDataURL('image/png');
      setEnhancedImage(enhanced);
      setLoading(false);
      setShowPreview(true);
    };
  };

  const applyBackdrop = (url, isSelected = false) => {
    if (!enhancedImage) return;
    const img = new Image();
    img.src = enhancedImage;
    img.onload = () => {
      const backdrop = new Image();
      backdrop.src = url;
      backdrop.crossOrigin = 'anonymous';
      backdrop.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(backdrop, 0, 0, canvas.width, canvas.height);
        // Extract face (simple crop from original + resize)
        ctx.drawImage(img, 200, 100, 400, 400);
        // Watermark
        ctx.font = 'bold 40px Inter';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText('PolishPic.com', 20, canvas.height - 30);
        const final = canvas.toDataURL('image/png');
        setEnhancedImage(final);
      };
    };
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    setShowPreview(false);
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    setCapturedImage(null);
    setEnhancedImage(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 flex flex-col items-center justify-center p-4 font-inter">
      {/* Hero Section */}
      <div className="text-center mb-12 fade-in">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-4 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          PolishPic
        </h1>
        <p className="text-xl text-gray-600 max-w-md mx-auto">
          Natural AI headshot enhancer. Look 20% better in seconds—no uncanny fakes.
        </p>
      </div>

      {/* Camera Modal */}
      {!showPreview ? (
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
          {!isCameraOpen ? (
            <div className="p-8 text-center">
              <button onClick={openCamera} className="btn-primary w-full mb-4">
                Start Your Glow-Up
              </button>
              <p className="text-sm text-gray-500">One snap, instant pro results.</p>
            </div>
          ) : (
            <div className="relative p-4">
              <video ref={videoRef} className="w-full rounded-2xl" playsInline muted />
              <canvas ref={canvasRef} className="overlay-frame" />
              {faceDetected ? (
                <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full text-sm">
                  Perfect position—ready to snap!
                </p>
              ) : (
                <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-red-500 bg-opacity-80 px-4 py-2 rounded-full text-sm">
                  Center your face in the oval
                </p>
              )}
              <div className="flex justify-center space-x-4 mt-4">
                <button onClick={capturePhoto} disabled={loading || !faceDetected} className="btn-primary">
                  {loading ? <div className="loading-spinner w-6 h-6 mx-auto" /> : 'Snap!'}
                </button>
                <button onClick={closeCamera} className="btn-secondary">Cancel</button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Preview Section */
        <div className="w-full max-w-4xl space-y-6 fade-in">
          {/* Before/After Toggle */}
          <div className="flex justify-center space-x-4">
            <img src={capturedImage} alt="Before" className="w-48 h-64 object-cover rounded-2xl shadow-lg" />
            <div className="loading-spinner w-8 h-8 my-auto" /> {/* Arrow icon */}
            <img src={enhancedImage} alt="After" className="w-48 h-64 object-cover rounded-2xl shadow-lg" />
          </div>

          {/* Subtlety Slider */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 mb-2">Enhancement Level: {subtlety}%</label>
            <input
              type="range"
              min="0" max="100" value={subtlety}
              onChange={(e) => { setSubtlety(e.target.value); applyEnhancements(capturedImage); }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Backdrop Selector */}
          <div className="grid grid-cols-5 gap-4 justify-center">
            {backdrops.map((bd) => (
              <button
                key={bd.name}
                onClick={() => applyBackdrop(bd.url)}
                className="btn-secondary w-full h-20 bg-cover bg-center rounded-xl overflow-hidden hover:shadow-md"
                style={{ backgroundImage: `url(${bd.url})` }}
              >
                <span className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">{bd.name}</span>
              </button>
            ))}
          </div>

          {/* Final Preview & CTA */}
          <div className="preview-card p-6 text-center">
            <img src={enhancedImage} alt="Final" className="w-full max-w-md mx-auto rounded-2xl mb-4" />
            <p className="text-sm text-gray-500 mb-4">Watermarked preview—unlock HD for crisp, print-ready quality.</p>
            <button className="btn-primary w-full mb-2">Download HD ($4)</button>
            <div className="flex justify-center space-x-4 text-sm text-gray-500">
              <button onClick={() => {/* Share logic */}}>Share on LinkedIn</button>
              <button onClick={() => {/* Share logic */}}>Share on X</button>
            </div>
            <button onClick={closeCamera} className="text-indigo-600 underline mt-4">Try Again</button>
          </div>
        </div>
      )}
    </main>
  );
}
