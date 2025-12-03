'use client';

import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [subtlety, setSubtlety] = useState(60);
  const [loading, setLoading] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const backdrops = [
    { name: 'Office Blur', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600' },
    { name: 'Studio Gray', url: 'https://images.unsplash.com/photo-1510070112810-d4f60d7c2b6c?w=1600' },
    { name: 'Clean White', url: 'https://images.unsplash.com/photo-1558618666-194e9df0e39b?w=1600' },
    { name: 'Modern Blue', url: 'https://images.unsplash.com/photo-1557682257-2f9c37c9d3e8?w=1600' },
    { name: 'Corporate Dark', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600' },
  ];

  const examples = [
    "https://images.unsplash.com/photo-1556157382-97eda2d9aa07?w=800",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800",
  ];

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  const openCamera = async () => {
    setIsCameraOpen(true);
    setShowPreview(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        detectFace();
      }
    } catch (err) {
      alert('Camera access required');
    }
  };

  const detectFace = async () => {
    if (!modelsLoaded || !videoRef.current) return;
    const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    setFaceDetected(!!detection);
    if (detection) {
      const box = detection.detection.box;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.ellipse(box.x + box.width / 2, box.y + box.height / 2, box.width / 1.6, box.height / 1.1, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    requestAnimationFrame(detectFace);
  };

  const capturePhoto = () => {
    if (!faceDetected) return alert('Please center your face');
    setLoading(true);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedImage(dataUrl);
    enhancePhoto(dataUrl);
  };

  const enhancePhoto = (src) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');

      const level = subtlety / 100;
      ctx.filter = `brightness(${1 + level * 0.2}) contrast(${1 + level * 0.15}) saturate(${1 + level * 0.3}) blur(${level * 1.5}px)`;
      ctx.drawImage(img, 0,0);

      const result = canvas.toDataURL('image/png');
      setEnhancedImage(result);
      setShowPreview(true);
      setLoading(false);
    };
  };

  const applyBackdrop = (url) => {
    if (!enhancedImage) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = enhancedImage;
    img.onload = () => {
      const bg = new Image();
      bg.crossOrigin = 'anonymous';
      bg.src = url;
      bg.onload = () => {
        const c = document.createElement('canvas');
        c.width = 800; c.height = 1000;
        const ctx = c.getContext('2d');
        ctx.drawImage(bg, 0, 0, c.width, c.height);
        ctx.globalAlpha = 1;
        ctx.drawImage(img, 150, 100, 500, 800);
        ctx.font = 'bold 48px Arial';
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('PolishPic.com', 50, c.height - 50);
        setEnhancedImage(c.toDataURL());
      };
    };
  };

  const closeAll = () => {
    setIsCameraOpen(false); setShowPreview(false); setCapturedImage(null); setEnhancedImage(null);
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
  };

  return (
    <>
      {/* === BEAUTIFUL BUSINESS LANDING PAGE === */}
      {!isCameraOpen && !showPreview && (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
          {/* Header */}
          <header className="bg-white shadow-sm px-8 py-5 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-indigo-700">PolishPic</h1>
            <nav className="space-x-8 hidden lg:flex">
              <a href="#examples" className="text-gray-600 hover:text-indigo-700">Examples</a>
              <a href="#how" className="text-gray-600 hover:text-indigo-700">How it Works</a>
              <a href="#pricing" className="text-gray-600 hover:text-indigo-700">Pricing</a>
            </nav>
          </header>

          {/* Hero */}
          <section className="pt-20 pb-32 px-8 text-center">
            <h1 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
              Professional LinkedIn & Business Headshots<br/>in Seconds
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
              No fake AI look — just natural enhancement, perfect lighting, and corporate backdrops. Look executive instantly.
            </p>
            <button onClick={openCamera} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xl font-bold py-5 px-12 rounded-full shadow-xl transform hover:scale-105 transition">
              Create Your Headshot Now
            </button>
          </section>

          {/* Examples */}
          <section id="examples" className="py-20 bg-white">
            <h2 className="text-4xl font-bold text-center mb-12">Real Results</h2>
            <Carousel showThumbs={false} autoPlay infiniteLoop interval={4000} className="max-w-5xl mx-auto">
              {examples.map((url, i) => (
                <img key={i} src={url} alt="Professional headshot" className="rounded-2xl shadow-2xl mx-auto" />
              ))}
            </Carousel>
          </section>
        </div>
      )}

      {/* === CAMERA + ENHANCEMENT MODAL === */}
      {(isCameraOpen || showPreview) && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative">
            <button onClick={closeAll} className="absolute top-4 right-6 text-3xl text-gray-500 hover:text-gray-800">&times;</button>

            {!showPreview ? (
              <>
                <h2 className="text-3xl font-bold text-center mb-6">Position Your Face</h2>
                <div className="relative mx-auto max-w-lg">
                  <video ref={videoRef} className="w-full rounded-2xl" playsInline muted />
                  <canvas ref={canvasRef} className="absolute inset-0" />
                  {!faceDetected && <p className="text-center text-red-600 mt-4 font-medium">Center your face in the oval</p>}
                </div>
                <div className="text-center mt-8">
                  <button onClick={capturePhoto} disabled={loading || !faceDetected} className="bg-green-600 hover:bg-green-700 text-white text-xl font-bold py-4 px-12 rounded-full">
                    {loading ? 'Enhancing...' : 'Snap & Enhance'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-center mb-6">Your Professional Headshot</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-center font-medium mb-2">Original</p>
                    <img src={capturedImage} className="rounded-2xl shadow-lg w-full" />
                  </div>
                  <div>
                    <p className="text-center font-medium mb-2">Enhanced</p>
                    <img src={enhancedImage} className="rounded-2xl shadow-lg w-full" />
                  </div>
                </div>

                <div className="mb-8">
                  <label className="block text-center font-medium mb-3">Enhancement Strength: {subtlety}%</label>
                  <input type="range" min="0" max="100" value={subtlety} onChange={(e) => { setSubtlety(e.target.value); enhancePhoto(capturedImage); }} className="w-full h-3 rounded-lg appearance-none cursor-pointer" />
                </div>

                <div>
                  <p className="text-center font-medium mb-4">Choose Background</p>
                  <div className="grid grid-cols-3 gap-4">
                    {backdrops.map(b => (
                      <button key={b.name} onClick={() => applyBackdrop(b.url)} className="rounded-xl overflow-hidden shadow hover:shadow-xl transition">
                        <img src={b.url} alt={b.name} className="w-full h-32 object-cover" />
                        <p className="text-xs py-1 bg-black bg-opacity-50 text-white">{b.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-center mt-10">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xl py-5 px-16 rounded-full shadow-xl">
                    Download HD – $4
                  </button>
                  <p className="text-sm text-gray-500 mt-4">Watermark removed on purchase</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
