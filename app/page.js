'use client';

import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; // Carousel styles
import { Carousel } from 'react-responsive-carousel';

export default function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [enhancedImage, setEnhancedImage] = useState(null);
  const [selectedBackdrop, setSelectedBackdrop] = useState(null);
  const [subtlety, setSubtlety] = useState(50);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);

  const backdrops = [
    { name: 'Office Blur', url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&w=1600' },
    { name: 'Studio Gray', url: 'https://images.unsplash.com/photo-1510070112810-d4f60d7c2b6c?ixlib=rb-4.0.3&w=1600' },
    { name: 'Clean White', url: 'https://images.unsplash.com/photo-1558618666-194e9df0e39b?ixlib=rb-4.0.3&w=1600' },
    { name: 'Modern Blue', url: 'https://images.unsplash.com/photo-1557682257-2f9c37c9d3e8?ixlib=rb-4.0.3&w=1600' },
    { name: 'Corporate Dark', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&w=1600' },
  ];

  const examples = [
    { before: 'http://www.freephotoediting.com/samples/official-photos/images/010_linkedin-profile-photo-edit-retouch.jpg', after: 'https://cdn.prod.website-files.com/6489f4e62de445dcec86d4db/67fcbaa810e31dddbb7b604b_PhotoAI-professional-headshot-examples.webp' },
    { before: 'https://d26oc3sg82pgk3.cloudfront.net/files/media/edit/image/49521/article_aligned%402x.png', after: 'https://a.storyblok.com/f/191576/8976x5483/507ad53d72/upscale.webp' },
    { before: 'https://i.ytimg.com/vi/C_E7Sb4_v2U/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC6VUabWfP64idmk8s3a8aJlOqCnA', after: 'https://www.virginiafacialplasticsurgery.com/wp-content/uploads/2023/10/tear-trough-correction-before-after-2.jpg' },
  ]; // From search—before/after pairs

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    setModelsLoaded(true);
  };

  // Camera & enhancement logic (same as before, but integrated)

  // ... (Keep the openCamera, detectFace, capturePhoto, applyEnhancements, applyBackdrop, closeCamera functions from previous code)

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-indigo-600">PolishPic</h1>
        <nav className="space-x-6 hidden md:block">
          <a href="#how" className="text-gray-600 hover:text-indigo-600">How it Works</a>
          <a href="#examples" className="text-gray-600 hover:text-indigo-600">Examples</a>
          <a href="#pricing" className="text-gray-600 hover:text-indigo-600">Pricing</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col md:flex-row items-center justify-between px-8 py-20 bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-5xl font-bold text-gray-900 mb-6 fade-in-up">Professional AI Headshot Enhancer</h1>
          <p className="text-xl text-gray-600 mb-8 fade-in-up delay-200">Elevate your LinkedIn, CV, and business profile with natural, professional enhancements. No fake looks—just you, polished.</p>
          <button onClick={openCamera} className="btn-primary fade-in-up delay-400">Start Your Business Glow-Up</button>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&w=800" alt="Business Headshot Example" className="rounded-3xl shadow-2xl w-80 h-96 object-cover" />
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="section bg-white px-8">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center fade-in-up">
            <div className="text-6xl mb-4">📸</div>
            <h3 className="text-2xl font-semibold mb-2">Open Camera</h3>
            <p>Position your face in the guide frame for perfect alignment.</p>
          </div>
          <div className="card text-center fade-in-up delay-200">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-semibold mb-2">Enhance Naturally</h3>
            <p>Adjust lighting, skin, eyes & teeth with our AI slider.</p>
          </div>
          <div className="card text-center fade-in-up delay-400">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-2xl font-semibold mb-2">Add Business Backdrop</h3>
            <p>Choose professional offices or studios—download HD.</p>
          </div>
        </div>
      </section>

      {/* Examples Carousel */}
      <section id="examples" className="section bg-gray-50 px-8">
        <h2 className="text-4xl font-bold text-center mb-12">Before & After Examples</h2>
        <Carousel showThumbs={false} autoPlay infiniteLoop className="max-w-4xl mx-auto">
          {examples.map((ex, i) => (
            <div key={i} className="flex space-x-4 p-4">
              <img src={ex.before} alt="Before" className="example-img w-1/2" />
              <img src={ex.after} alt="After" className="example-img w-1/2" />
            </div>
          ))}
        </Carousel>
      </section>

      {/* Camera & Preview Modal (Full Screen on Open) */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative w-full max-w-md p-6 bg-white rounded-3xl">
            {/* Camera & logic from before */}
            {/* ... Insert openCamera, snap, preview code here ... */}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-indigo-600 text-white py-6 px-8 text-center">
        <p>&copy; 2025 PolishPic. All rights reserved. Made for business pros.</p>
      </footer>
    </main>
  );
}
