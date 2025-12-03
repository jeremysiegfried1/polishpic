'use client';

import { useState, useRef } from 'react';

export default function Home() {
  const videoRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      alert("Camera access denied or not available");
    }
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6 p-6">
      <div className="text-center max-w-lg">
        <h1 className="text-5xl font-black text-gray-900 mb-4">PolishPic</h1>
        <p className="text-xl text-gray-700 mb-10">
          Instant natural enhancement · Look 20 % better in seconds · No fake AI
        </p>

        {!isCameraOpen ? (
          <button
            onClick={openCamera}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 px-12 rounded-2xl text-xl shadow-lg transform hover:scale-105 transition"
          >
            Open Camera & See Magic
          </button>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              className="w-96 h-96 object-cover rounded-3xl shadow-2xl border-8 border-white"
              playsInline
              muted
            />
            <button
              onClick={closeCamera}
              className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold"
            >
              ×
            </button>
            <p className="text-center mt-8 text-lg text-gray-800 font-medium">
              Smile — then tap anywhere on the video to capture!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
