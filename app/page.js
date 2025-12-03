'use client';

import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

export default function Home() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  // ... (keep all previous state and functions: videoRef, capturedImage, enhancedImage, subtlety, loading, faceDetected, backdrops, examples, openCamera, detectFace, capturePhoto, applyEnhancements, applyBackdrop, closeModal)

  // Load models (same as before)
  useEffect(() => {
    const loadModels = async () => {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      setModelsLoaded(true);
    };
    loadModels();
  }, []);

  if (isCameraOpen || showPreview) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-95 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-full overflow-y-auto p-8">
          <button onClick={closeModal} className="absolute top-6 right-6 text-3xl text-gray-500 hover:text-gray-700 font-bold">×</button>
          {!showPreview ? (
            <div className="text-center">
              <h2 className="text-3xl font-black mb-6 fade-in">Position for Executive Shot</h2>
              <div className="relative mx-auto max-w-lg mb-8 fade-in">
                <video ref={videoRef} className="w-full rounded-3xl shadow-2xl" playsInline muted />
                <canvas ref={canvasRef} className="absolute inset-0 -z-10" />
              </div>
              <p className="text-lg text-gray-600 mb-4 fade-in">{faceDetected ? 'Perfect—ready to capture!' : 'Center your face in the oval guide'}</p>
              <button onClick={capturePhoto} disabled={loading || !faceDetected} className="btn-primary w-full max-w-md mx-auto">
                {loading ? 'AI Polishing...' : 'Capture & Enhance'}
              </button>
            </div>
          ) : (
            <div className="text-center space-y-8">
              <h2 className="text-3xl font-black mb-6 fade-in">Your Polished Headshot</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 fade-in">
                <div>
                  <p className="font-medium mb-3">Original</p>
                  <img src={capturedImage} className="rounded-3xl shadow-xl w-full" />
                </div>
                <div>
                  <p className="font-medium mb-3">Executive Polish</p>
                  <img src={enhancedImage} className="rounded-3xl shadow-xl w-full" />
                </div>
              </div>
              <div className="fade-in">
                <label className="block font-medium mb-3">Polish Level: {subtlety}%</label>
                <input type="range" min="0" max="100" value={subtlety} onChange={(e) => { setSubtlety(e.target.value); applyEnhancements(capturedImage); }} className="w-full h-2 rounded-lg slider bg-gray-200" />
              </div>
              <div className="fade-in">
                <p className="font-medium mb-4">Corporate Backdrop</p>
                <div className="grid grid-cols-5 gap-3">
                  {backdrops.map((b, i) => (
                    <button key={i} onClick={() => applyBackdrop(b.url)} className="rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all">
                      <img src={b.url} alt={b.name} className="w-full h-20 object-cover" />
                      <p className="text-xs py-1 bg-indigo-600 text-white text-center">{b.name}</p>
                    </button>
                  ))}
                </div>
              </div>
              <button className="btn-primary w-full max-w-md mx-auto text-lg">Download HD - $4</button>
              <p className="text-sm text-gray-500 mt-4">Watermark removed. LinkedIn-ready.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <main>
      {/* Fixed Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-lg z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-black text-indigo-700">PolishPic</h1>
          <nav className="hidden md:flex space-x-8">
            <a href="#how" className="text-gray-700 hover:text-indigo-700 font-medium transition">How It Works</a>
            <a href="#examples" className="text-gray-700 hover:text-indigo-700 font-medium transition">Examples</a>
            <a href="#pricing" className="text-gray-700 hover:text-indigo-700 font-medium transition">Pricing</a>
          </nav>
        </div>
      </header>

      {/* Hero - Full Modern Bleed */}
      <section className="pt-24 pb-32 max-w-7xl mx-auto px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-blue-50/50"></div>
        <h1 className="relative z-10 fade-in">The #1 AI Headshot Generator for Professionals</h1>
        <p className="relative z-10 text-xl text-gray-600 mb-10 max-w-3xl mx-auto fade-in delay-200">Studio-quality business headshots in minutes. Natural AI enhancements, corporate backdrops—no photoshoot needed. Trusted by 50k+ executives.</p>
        <div className="relative z-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 mb-12 fade-in delay-400">
          <button onClick={openCamera} className="btn-primary text-lg">Start Free Enhancement</button>
          <button className="border-2 border-indigo-600 text-indigo-600 font-bold py-4 px-8 rounded-full hover:bg-indigo-50 transition">View Examples</button>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-8 max-w-4xl mx-auto mt-16 fade-in delay-600">
          <div>
            <div className="metric">50k+</div>
            <p className="text-sm text-gray-500">Pros Using</p>
          </div>
          <div>
            <div className="metric">1M+</div>
            <p className="text-sm text-gray-500">Headshots Created</p>
          </div>
          <div>
            <div className="metric">4.9/5</div>
            <p className="text-sm text-gray-500">Rating</p>
          </div>
        </div>
      </section>

      {/* How It Works - Numbered Cards */}
      <section id="how" className="section max-w-7xl mx-auto px-6">
        <h2 className="text-center mb-16 fade-in">3 Simple Steps to Executive Polish</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center fade-in">
            <div className="text-6xl mb-6">1</div>
            <h3 className="text-2xl font-bold mb-4">Snap Selfie</h3>
            <p>Open camera, AI guides face positioning for perfect alignment.</p>
          </div>
          <div className="card text-center fade-in delay-200">
            <div className="text-6xl mb-6">2</div>
            <h3 className="text-2xl font-bold mb-4">AI Enhance</h3>
            <p>Adjust lighting, skin, eyes with our Executive Polish slider—natural results.</p>
          </div>
          <div className="card text-center fade-in delay-400">
            <div className="text-6xl mb-6">3</div>
            <h3 className="text-2xl font-bold mb-4">Backdrop & Download</h3>
            <p>Pick corporate style, get HD watermark-free for LinkedIn/CV.</p>
          </div>
        </div>
      </section>

      {/* Examples Carousel */}
      <section id="examples" className="section bg-gradient-to-r from-indigo-50 to-slate-100 max-w-7xl mx-auto px-6">
        <h2 className="text-center mb-16 fade-in">Real Transformations</h2>
        <Carousel showThumbs={false} autoPlay infiniteLoop interval={3000} className="max-w-5xl mx-auto example-carousel">
          {examples.map((ex, i) => (
            <div key={i} className="flex space-x-8 p-8">
              <img src={ex.before} alt="Before" className="example-img w-1/2" />
              <div className="my-auto text-4xl font-bold text-indigo-600">→</div>
              <img src={ex.after} alt="After" className="example-img w-1/2" />
            </div>
          ))}
        </Carousel>
        <p className="text-center text-sm text-gray-500 mt-8 fade-in">All AI-generated—100% realistic for business use.</p>
      </section>

      {/* Pricing Tiers */}
      <section id="pricing" className="section max-w-7xl mx-auto px-6">
        <h2 className="text-center mb-16 fade-in">Simple, One-Time Pricing</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center fade-in border-2 border-indigo-200">
            <h3 className="text-2xl font-bold mb-4">Basic</h3>
            <p className="text-4xl font-black text-indigo-600 mb-4">$29</p>
            <ul className="text-left mb-6 space-y-2">
              <li>• 40 Headshots</li>
              <li>• 4 Styles</li>
              <li>• 4-Hour Delivery</li>
            </ul>
            <button className="btn-primary w-full">Get Basic</button>
          </div>
          <div className="card text-center fade-in border-2 border-indigo-600 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold">Best Value</div>
            <h3 className="text-2xl font-bold mb-4">Pro</h3>
            <p className="text-4xl font-black text-indigo-600 mb-4">$49</p>
            <ul className="text-left mb-6 space-y-2">
              <li>• 80 Headshots</li>
              <li>• 8 Styles</li>
              <li>• 2-Hour Delivery</li>
            </ul>
            <button className="btn-primary w-full">Get Pro</button>
          </div>
          <div className="card text-center fade-in border-2 border-indigo-200">
            <h3 className="text-2xl font-bold mb-4">Executive</h3>
            <p className="text-4xl font-black text-indigo-600 mb-4">$79</p>
            <ul className="text-left mb-6 space-y-2">
              <li>• 120 Headshots</li>
              <li>• Unlimited Styles</li>
              <li>• 1-Hour Delivery</li>
            </ul>
            <button className="btn-primary w-full">Get Executive</button>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-8 fade-in">100% Money-Back Guarantee • Commercial Rights Included</p>
      </section>

      {/* Testimonials */}
      <section className="section bg-gradient-to-r from-slate-100 to-indigo-100 max-w-7xl mx-auto px-6">
        <h2 className="text-center mb-16 fade-in">What Professionals Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card fade-in">
            <p className="italic mb-4">"Transformed my LinkedIn in minutes—looks like a $500 shoot!"</p>
            <p className="font-bold text-indigo-600">- Sarah L., CEO</p>
          </div>
          <div className="card fade-in delay-200">
            <p className="italic mb-4">"Perfect for executive profiles—natural and fast."</p>
            <p className="font-bold text-indigo-600">- Mike R., Manager</p>
          </div>
          <div className="card fade-in delay-400">
            <p className="italic mb-4">"Best AI tool for business—highly recommend."</p>
            <p className="font-bold text-indigo-600">- Emma T., Consultant</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-900 text-white py-12 px-8 text-center">
        <p className="mb-4">© 2025 PolishPic. Built for business pros. Secure & private.</p>
        <div className="space-x-6">
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Support</a>
        </div>
      </footer>
    </main>
  );
}
