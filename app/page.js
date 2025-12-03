'use client';

import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [selectedBackdrop, setSelectedBackdrop] = useState(0);
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
    { before: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400', after: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
    { before: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', after: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
    { before: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', after: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400' },
  ];

  useEffect(() => {
    const loadModels = async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        setModelsLoaded(true);
      } catch (err) {
        console.error(err);
      }
    };
    loadModels();
  }, []);

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      detectFace();
    } catch (err) {
      alert('Camera permission needed');
    }
  };

  const detectFace = async () => {
    if (!modelsLoaded || !videoRef.current) return;
    const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    setFaceDetected(!!detections);
    if (detections) {
      const box = detections.detection.box;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.8)';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.ellipse(box.x + box.width / 2, box.y + box.height / 2, box.width / 1.5, box.height, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    requestAnimationFrame(detectFace);
  };

  const capturePhoto = () => {
    if (!faceDetected) return alert('Center your face in the frame');
    setLoading(true);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedImage(dataUrl);
    setTimeout(() => applyEnhancements(dataUrl), 1000);
  };

  const applyEnhancements = (src) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const level = subtlety / 100;
      ctx.filter = `brightness(${1 + level * 0.15}) contrast(${1 + level * 0.1}) saturate(${1 + level * 0.25}) blur(${level * 1}px)`;
      ctx.drawImage(img, 0, 0);
      const result = canvas.toDataURL('image/png');
      setEnhancedImage(result);
      setLoading(false);
      setShowPreview(true);
    };
  };

  const applyBackdrop = (url) => {
    if (!enhancedImage) return;
    const img = new Image();
    img.src = enhancedImage;
    img.onload = () => {
      const bg = new Image();
      bg.src = url;
      bg.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 100, 150, 600, 700);
        ctx.font = 'bold 40px Inter';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText('PolishPic', 50, canvas.height - 50);
        setEnhancedImage(canvas.toDataURL('image/png'));
      };
    };
  };

  const closeModal = () => {
    setIsCameraOpen(false);
    setShowPreview(false);
    setCapturedImage(null);
    setEnhancedImage(null);
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
  };

  if (isCameraOpen || showPreview) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-full overflow-y-auto p-8">
          <button onClick={closeModal} className="absolute top-6 right-6 text-3xl text-gray-500 hover:text-gray-700">×</button>
          {!showPreview ? (
            <>
              <h2 className="text-3xl font-bold text-center mb-6 fade-in">Position for Perfect Shot</h2>
              <div className="relative mx-auto max-w-lg mb-8">
                <video ref={videoRef} className="w-full rounded-3xl shadow-xl" playsInline muted />
                <canvas ref={canvasRef} className="absolute inset-0 -z-10" />
              </div>
              <div className="text-center">
                <p className="text-lg text-gray-600 mb-4 fade-in"> {faceDetected ? 'Ready!' : 'Center face in oval'}</p>
                <button onClick={capturePhoto} disabled={loading || !faceDetected} className="btn-primary w-full max-w-md mx-auto">
                  {loading ? 'Enhancing...' : 'Snap & Polish'}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-center mb-6 fade-in">Your Executive Headshot</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="fade-in">
                  <p className="text-center font-medium mb-3">Original</p>
                  <img src={capturedImage} className="rounded-3xl shadow-xl w-full" />
                </div>
                <div className="fade-in">
                  <p className="text-center font-medium mb-3">Polished</p>
                  <img src={enhancedImage} className="rounded-3xl shadow-xl w-full" />
                </div>
              </div>
              <div className="mb-8 fade-in">
                <label className="block text-center font-medium mb-3">Executive Polish Level: {subtlety}%</label>
                <input type="range" min="0" max="100" value={subtlety} onChange={(e) => { setSubtlety(e.target.value); applyEnhancements(capturedImage); }} className="w-full h-2 rounded-lg slider" />
              </div>
              <div className="mb-8 fade-in">
                <p className="text-center font-medium mb-4">Select Corporate Backdrop</p>
                <div className="grid grid-cols-5 gap-3">
                  {backdrops.map((b, i) => (
                    <button key={i} onClick={() => { setSelectedBackdrop(i); applyBackdrop(b.url); }} className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition">
                      <img src={b.url} alt={b.name} className="w-full h-20 object-cover" />
                      <p className="text-xs text-center py-1 bg-indigo-600 text-white">{b.name}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-center fade-in">
                <button className="btn-primary w-full max-w-md mx-auto mb-4">Download HD ($4)</button>
                <p className="text-sm text-gray-500">Watermark removed on purchase. Share-ready for LinkedIn.</p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg fixed w-full z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-black text-indigo-700">PolishPic</h1>
          <nav className="hidden md:flex space-x-8">
            <a href="#how" className="text-gray-700 hover:text-indigo-700 font-medium">How It Works</a>
            <a href="#examples" className="text-gray-700 hover:text-indigo-700 font-medium">Examples</a>
            <a href="#pricing" className="text-gray-700 hover:text-indigo-700 font-medium">Pricing</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-24 pb-32 max-w-7xl mx-auto px-6 text-center fade-in">
        <h1 className="mb-6">Elevate Your Professional Image</h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">AI-powered headshots for LinkedIn, resumes, and executive profiles. Natural enhancements, corporate backdrops—done in seconds.</p>
        <button onClick={openCamera} className="btn-primary text-lg">Get Business-Ready Headshot</button>
      </section>

      {/* How It Works */}
      <section id="how" className="section max-w-7xl mx-auto px-6">
        <h2 className="text-center mb-16 fade-in">Simple 3-Step Process</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center fade-in">
            <div className="text-6xl mb-6">1</div>
            <h3 className="text-2xl font-bold mb-4">Snap Your Selfie</h3>
            <p>Open camera, center face in frame—AI guides you.</p>
          </div>
          <div className="card text-center fade-in delay-200">
            <div className="text-6xl mb-6">2</div>
            <h3 className="text-2xl font-bold mb-4">AI Polish</h3>
            <p>Adjust lighting, skin, eyes with our executive slider.</p>
          </div>
          <div className="card text-center fade-in delay-400">
            <div className="text-6xl mb-6">3</div>
            <h3 className="text-2xl font-bold mb-4">Add Backdrop</h3>
            <p>Choose office/studio style, download HD watermark-free.</p>
          </div>
        </div>
      </section>

      {/* Examples */}
      <section id="examples" className="section bg-gradient-to-r from-indigo-50 to-slate-50 max-w-7xl mx-auto px-6">
        <h2 className="text-center mb-16 fade-in">See the Transformation</h2>
        <Carousel showThumbs={false} autoPlay infiniteLoop interval={3000} className="max-w-4xl mx-auto">
          {examples.map((ex, i) => (
            <div key={i} className="flex space-x-8 p-8">
              <img src={ex.before} alt="Before" className="example-img w-1/2" />
              <div className="my-auto text-4xl">→</div>
              <img src={ex.after} alt="After" className="example-img w-1/2" />
            </div>
          ))}
        </Carousel>
      </section>

      {/* Pricing Teaser */}
      <section id="pricing" className="section max-w-7xl mx-auto px-6">
        <h2 className="text-center mb-16 fade-in">Simple Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center fade-in">
            <h3 className="text-2xl font-bold mb-4">Basic</h3>
            <p className="text-3xl font-black text-indigo-600 mb-4">$4</p>
            <p>Single HD Headshot + 1 Backdrop</p>
          </div>
          <div className="card text-center fade-in delay-200">
            <h3 className="text-2xl font-bold mb-4">Pro</h3>
            <p className="text-3xl font-black text-indigo-600 mb-4">$12</p>
            <p>5 Headshots + Unlimited Backdrops</p>
          </div>
          <div className="card text-center fade-in delay-400">
            <h3 className="text-2xl font-bold mb-4">Executive</h3>
            <p className="text-3xl font-black text-indigo-600 mb-4">$29</p>
            <p>Unlimited + Custom Edits</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-900 text-white py-12 px-8 text-center">
        <p className="mb-4">© 2025 PolishPic. Trusted by 50k+ professionals. Privacy-focused—data deleted after use.</p>
        <div className="space-x-4">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Support</a>
        </div>
      </footer>
    </main>
  );
}
