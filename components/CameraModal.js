'use client';

import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

export default function CameraModal({ onClose, prompt }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showPreview, setShowPreview] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [subtlety, setSubtlety] = useState(50);
  const [loading, setLoading] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  useEffect(() => {
    const stream = navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
    stream.then(s => {
      videoRef.current.srcObject = s;
      videoRef.current.play();
      if (modelsLoaded) detectFace();
    });
    return () => stream.then(s => s.getTracks().forEach(t => t.stop()));
  }, [modelsLoaded]);

  const detectFace = async () => {
    if (!videoRef.current) return;
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
    if (!faceDetected) return alert('Center your face');
    setLoading(true);
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedImage(dataUrl);
    setTimeout(() => applyEnhancements(dataUrl), 800);
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

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 text-2xl">×</button>
        {!showPreview ? (
          <>
            <h3 className="text-xl font-bold mb-4">Snap Your Selfie</h3>
            <video ref={videoRef} className="w-full rounded-lg mb-4" playsInline muted />
            <canvas ref={canvasRef} className="absolute w-full h-48 -mt-48" />
            <button onClick={capturePhoto} disabled={loading || !faceDetected} className="btn-purple w-full mb-4">
              {loading ? 'Generating...' : 'Generate Headshot'}
            </button>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold mb-4">Your Headshot</h3>
            <img src={enhancedImage} alt="Generated" className="w-full rounded-lg mb-4" />
            <input type="range" min="0" max="100" value={subtlety} onChange={(e) => setSubtlety(e.target.value)} className="w-full mb-4" />
            <button className="btn-purple w-full">Download ($4)</button>
            <button onClick={() => setShowPreview(false)} className="text-gray-500 w-full mt-2">Regenerate</button>
          </>
        )}
      </div>
    </div>
  );
}
