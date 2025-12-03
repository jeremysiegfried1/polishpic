'use client';

import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import dynamic from 'next/dynamic';

const CameraModal = dynamic(() => import('../components/CameraModal'), { ssr: false }); // Dynamic to avoid prerender error

export default function Home() {
  const [prompt, setPrompt] = useState('Professional man in suit, smiling, office background');
  const [showModal, setShowModal] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const exampleFaces = [
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300', // Woman
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', // Man
    'https://images.unsplash.com/photo-1552053831-71594a27632d?w=300', // Diverse
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300', // Executive
  ];

  const styles = ['Vibrant', 'Dreamy', 'Concept', 'Film', 'More'];

  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  return (
    <main className="min-h-screen">
      {/* Header - Canva Purple Nav */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-purple-600">PolishPic</h1>
        </div>
        <nav className="hidden md:flex space-x-6">
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

      {/* Hero - Exact Canva Layout */}
      <section className="section">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900">Free Online AI Headshot Generator</h1>
          <p className="text-sm text-gray-500">Home > AI Headshot Generator</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Create professional headshots from your selfie with AI</h2>
            <p className="text-lg text-gray-700">Generate stunningly realistic headshots for your business profile. Type a description and generate photorealistic faces for any design project.</p>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="E.g., Professional headshot, smiling, office background"
                  className="input-prompt"
                />
                <button className="absolute right-3 top-3 text-purple-600">✨</button>
              </div>
              <button onClick={() => setShowModal(true)} className="btn-purple w-full md:w-auto">Create a headshot with AI</button>
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
        <div className="flex flex-wrap justify-center space-x-4 mt-8 mb-16">
          {styles.map((style) => (
            <button key={style} className="style-chip">{style}</button>
          ))}
        </div>
      </section>

      {/* Intro - Canva Magic Media */}
      <section className="section bg-gray-50">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Introducing PolishPic's AI Headshot Generator</h2>
            <p className="text-lg text-gray-700">No more digging around for the perfect stock photo. Generate a lifelike headshot with AI in seconds.</p>
            <p className="text-sm text-gray-600">Magic Media and other face generator apps on PolishPic. Simply describe any character you have in mind.</p>
            <button onClick={() => setShowModal(true)} className="btn-purple">Create a headshot with AI</button>
          </div>
          <div className="editor-preview">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-purple-100 px-3 py-1 rounded text-purple-600 text-sm font-medium">Magic Media</div>
              <div className="flex space-x-2 ml-auto">
                <button className="text-gray-500 hover:text-gray-700">📁</button>
                <button className="text-gray-500 hover:text-gray-700">🎨</button>
                <button className="text-gray-500 hover:text-gray-700">📹</button>
                <button className="text-gray-500 hover:text-gray-700">✂️</button>
                <button className="text-gray-500 hover:text-gray-700">🎭</button>
                <button className="text-gray-500 hover:text-gray-700">📐</button>
              </div>
            </div>
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600" alt="Editor preview" className="w-full rounded" />
            <div className="flex justify-between text-sm text-gray-500 mt-4">
              <span>Generated with AI</span>
              <span>Edit in PolishPic</span>
            </div>
          </div>
        </div>
      </section>

      {/* Camera Modal - Integrated */}
      {showModal && (
        <CameraModal onClose={() => setShowModal(false)} prompt={prompt} />
      )}

      {/* Footer - Canva Simple */}
      <footer className="bg-gray-900 text-white py-8 text-center">
        <p>&copy; 2025 PolishPic. Free AI headshot generator.</p>
      </footer>
    </main>
  );
}
