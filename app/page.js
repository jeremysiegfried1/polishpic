'use client';

import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [subtlety, setSubtlety] = useState(50);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  // Backdrops and examples (Canva-style diverse faces)
  const exampleFaces = [
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300', // Woman in office
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', // Man in suit
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300', // Diverse professional
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300', // Executive
  ];

  const styles = ['Vibrant', 'Dreamy', 'Concept', 'Film', 'More']; // Canva chip styles

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  // Camera functions (integrated as before)
  const openCamera = async () => {
    setIsCameraOpen(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
    detectFace();
  };

  const detectFace = async () => {
    if (!modelsLoaded || !videoRef.current) return;
    const detection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    setFaceDetected(!!detection);
    if (detection) {
      // Draw Canva-style simple oval (white dashed)
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const box = detection.detection.box;
        ctx.beginPath();
        ctx.ellipse(box.x + box.width / 2, box.y + box.height / 2, box.width / 1.5, box.height, 0, 0, 2 * Math.PI);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
      }
    }
    requestAnimationFrame(detectFace);
  };

  const capturePhoto = () => {
    if (!faceDetected) return alert('Center your face in the guide');
    setLoading(true);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedImage(dataUrl);
    setTimeout(() => applyEnhancements(dataUrl), 800); // Canva-like loading
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
      ctx.filter = `brightness(${1 + level * 0.1}) contrast(${1 + level * 0.05}) saturate(${1 + level * 0.2})`;
      ctx.drawImage(img, 0, 0);
      const result = canvas.toDataURL('image/png');
      setEnhancedImage(result);
      setLoading(false);
      setShowPreview(true);
    };
  };

  const closeModal = () => {
    setIsCameraOpen(false);
    setShowPreview(false);
    setCapturedImage(null);
    setEnhancedImage(null);
    if (videoRef.current?.srcObject) videoRef.current.srcObject.getTracks().forEach(t => t.stop());
  };

  // Canva 1:1 Layout
  return (
    <main className="min-h-screen">
      {/* Header - Canva Purple Nav */}
      <header className="bg-white shadow-sm py-4 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-purple-600">PolishPic</h1>
        </div>
        <nav className="flex space-x-6">
          <a href="#" className="text-gray-600 hover:text-purple-600">Designs</a>
          <a href="#" className="text-gray-600 hover:text-purple-600">Products</a>
          <a href="#" className="text-gray-600 hover:text-purple-600">Plans</a>
          <a href="#" className="text-gray-600 hover:text-purple-600">Business</a>
          <a href="#" className="text-gray-600 hover:text-purple-600">Education</a>
          <a href="#" className="text-gray-600 hover:text-purple-600">Help</a>
        </nav>
        <div className="flex space-x-4">
          <button className="btn-purple">Sign up</button>
          <button className="text-purple-600 font-semibold">Log in</button>
        </div>
      </header>

      {/* Hero - Canva AI Face Generator Section */}
      <section className="section bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900">Free Online AI Headshot Generator</h1>
            <p className="text-sm text-gray-500">Home > AI Headshot Generator</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Create professional headshots from your selfie with AI</h2>
              <p className="text-lg text-gray-700">Generate stunningly realistic headshots for your business profile. Type a description and generate photorealistic faces for any design project.</p>
              <div className="space-y-4">
                <div className="relative">
                  <input type="text" placeholder="E.g., 'Professional man in suit, smiling, office background'" className="input-prompt" />
                  <button className="absolute right-3 top-3 btn-purple text-sm">✨</button>
                </div>
                <button onClick={openCamera} className="btn-purple w-full md:w-auto">Create a headshot with AI</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {exampleFaces.map((src, i) => (
                <div key={i} className="example-card">
                  <img src={src} alt="Generated headshot" className="w-full h-48 object-cover" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center space-x-4 mt-8 mb-16">
            {styles.map((style) => (
              <button key={style} className="style-chip">{style}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Intro Section - Canva Magic Media */}
      <section className="section bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Introducing PolishPic's AI Headshot Generator</h2>
              <p className="text-lg text-gray-700 mb-8">No more digging around for the perfect stock photo. Generate a lifelike headshot with AI in seconds.</p>
              <p className="text-sm text-gray-600">Magic Media and other face generator apps on Canva. Simply describe any character you have in mind.</p>
              <button className="btn-purple mt-6">Create a headshot with AI</button>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              {/* Embedded "Editor" Preview - Canva-style toolbar */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-purple-100 p-2 rounded">Magic Media</div>
                <div className="flex space-x-2">
                  <button className="text-gray-500">📁</button>
                  <button className="text-gray-500">🎨</button>
                  <button className="text-gray-500">📹</button>
                  <button className="text-gray-500">✂️</button>
                  <button className="text-gray-500">🎭</button>
                  <button className="text-gray-500">📐</button>
                </div>
              </div>
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600" alt="Editor preview" className="w-full rounded" />
              <div className="flex justify-between text-sm text-gray-500 mt-4">
                <span>Generated with AI</span>
                <span>Edit in PolishPic</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Camera Modal (Integrated, Canva-like Simple) */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Snap Your Selfie</h3>
            <video ref={videoRef} className="w-full rounded-lg mb-4" playsInline muted />
            <canvas ref={canvasRef} className="absolute w-full h-64 -mt-64" />
            <button onClick={capturePhoto} className="btn-purple w-full mb-4">Generate Headshot</button>
            <button onClick={() => setIsCameraOpen(false)} className="text-gray-500">Cancel</button>
          </div>
        </div>
      )}

      {showPreview && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Your Generated Headshot</h3>
            <img src={enhancedImage} alt="Generated" className="w-full rounded-lg mb-4" />
            <input type="range" min="0" max="100" value={subtlety} onChange={(e) => setSubtlety(e.target.value)} className="w-full mb-4" />
            <button className="btn-purple w-full">Download ($4)</button>
            <button onClick={() => setShowPreview(false)} className="text-gray-500 mt-4 w-full">Regenerate</button>
          </div>
        </div>
      )}

      {/* Footer - Canva Simple */}
      <footer className="bg-gray-900 text-white py-8 text-center">
        <p>&copy; 2025 PolishPic. Inspired by Canva's magic.</p>
      </footer>
    </main>
  );
}
