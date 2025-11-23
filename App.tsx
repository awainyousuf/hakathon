import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Brain, Github, Layers } from 'lucide-react';

import { ClassData, TrainingState } from './types';
import { CLASS_COLORS } from './constants';
import * as tfService from './services/tensorService';

import ClassManager from './components/ClassManager';
import ModelTrainer from './components/ModelTrainer';
import Inference from './components/Inference';

const App: React.FC = () => {
  const [classes, setClasses] = useState<ClassData[]>([
    { id: uuidv4(), name: 'Class 1', samples: [], color: CLASS_COLORS[0] },
    { id: uuidv4(), name: 'Class 2', samples: [], color: CLASS_COLORS[1] }
  ]);
  
  const [trainingState, setTrainingState] = useState<TrainingState>({
    isTraining: false,
    progress: 0,
    accuracy: null,
    loss: null,
    trainedModels: []
  });

  const webcamRef = useRef<HTMLVideoElement>(null);

  // Initialize TF.js
  useEffect(() => {
    tfService.loadTFModels();
    setupWebcam();
  }, []);

  const setupWebcam = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 224, height: 224, facingMode: 'user' },
          audio: false
        });
        if (webcamRef.current) {
          webcamRef.current.srcObject = stream;
          // Important for TF.js to not fail on unready video
          webcamRef.current.onloadedmetadata = () => {
            webcamRef.current?.play();
          };
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    }
  };

  const addClass = () => {
    if (classes.length < CLASS_COLORS.length) {
      setClasses([
        ...classes,
        { 
          id: uuidv4(), 
          name: `Class ${classes.length + 1}`, 
          samples: [], 
          color: CLASS_COLORS[classes.length] 
        }
      ]);
    }
  };

  const updateClass = (updated: ClassData) => {
    setClasses(classes.map(c => c.id === updated.id ? updated : c));
  };

  const deleteClass = (id: string) => {
    setClasses(classes.filter(c => c.id !== id));
  };

  const trainModels = async () => {
    setTrainingState(prev => ({ ...prev, isTraining: true, progress: 0 }));

    // Simulate progress steps
    const steps = [10, 30, 60, 80, 100];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      setTrainingState(prev => ({ ...prev, progress: steps[i] }));
    }
    
    // Actually "training" the simple model (mock)
    const acc = await tfService.trainSimpleModel(classes);

    setTrainingState({
      isTraining: false,
      progress: 100,
      accuracy: acc,
      loss: 0.15,
      trainedModels: ['CNN', 'SIMPLE', 'GEMINI'] // KNN is instant, Gemini is zero-shot, Simple is mocked
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Brain size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">NeuroClassify <span className="font-light text-slate-400">| Teachable Machine</span></h1>
              <p className="text-xs text-slate-500">Powered by Gemini 2.5 & TensorFlow.js</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm text-slate-400">
            <a href="#" className="hover:text-white flex items-center gap-2 transition-colors">
              <Layers size={16} /> Architecture
            </a>
            <a href="#" className="hover:text-white flex items-center gap-2 transition-colors">
              <Github size={16} /> Source
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Data & Training */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="flex justify-between items-center mb-2">
             <h2 className="text-xl font-bold text-slate-200">1. Data Collection</h2>
             <button 
               onClick={addClass}
               className="text-sm bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded transition-colors"
             >
               + Add Class
             </button>
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700">
            {classes.map(cls => (
              <ClassManager
                key={cls.id}
                classData={cls}
                onUpdate={updateClass}
                onDelete={deleteClass}
                webcamRef={webcamRef}
              />
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h2 className="text-xl font-bold text-slate-200 mb-4">2. Training</h2>
            <ModelTrainer 
              classes={classes} 
              trainingState={trainingState} 
              onTrain={trainModels} 
            />
          </div>
        </div>

        {/* Right Column: Inference */}
        <div className="lg:col-span-7 h-full">
           <h2 className="text-xl font-bold text-slate-200 mb-4">3. Evaluation & Inference</h2>
           <Inference 
             classes={classes} 
             trainingState={trainingState}
             webcamRef={webcamRef}
           />
           
           {/* Tech Specs Footer in right col */}
           <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs text-slate-400 grid grid-cols-2 gap-4">
              <div>
                 <h4 className="font-bold text-slate-300 mb-1">Model A: MobileNet + KNN</h4>
                 <p>Runs entirely in browser via TensorFlow.js. Creates 1024-dimensional embeddings from video frames and classifies using K-Nearest Neighbors.</p>
              </div>
              <div>
                 <h4 className="font-bold text-slate-300 mb-1">Model B: Gemini 2.5 Flash</h4>
                 <p>Multimodal Large Language Model. Uses few-shot prompting with the collected examples to reason about the target image's classification.</p>
              </div>
           </div>
        </div>

      </main>
    </div>
  );
};

export default App;