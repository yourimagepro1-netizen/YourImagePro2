import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone-esm';
import { Button } from './common/Button';
import { UserState } from '../types';
import { UploadIcon, VideoIcon } from './common/Icons';

interface AnimateImageFlowProps {
  user: UserState;
  onGenerateVideo: (file: File, prompt: string) => void;
  onNavigateToPricing: () => void;
  initialFile?: File;
  generationCost: number;
}

const AnimateImageFlow: React.FC<AnimateImageFlowProps> = ({ user, onGenerateVideo, onNavigateToPricing, initialFile, generationCost }) => {
  const [file, setFile] = useState<File | null>(initialFile || null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    if (initialFile) {
        setFile(initialFile);
    }
  }, [initialFile]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);
  
  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    maxFiles: 1,
  });

  const handleGenerateClick = () => {
    if (file && prompt.trim()) {
      onGenerateVideo(file, prompt.trim());
    }
  };

  const hasFile = file !== null;
  const canGenerate = hasFile && prompt.trim().length > 0;

  return (
    <div>
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
            <span className="text-cyan-400">Step 1:</span> Upload Photo
          </h2>
          <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-colors ${isDragActive ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 hover:border-cyan-400'}`}>
            <input {...getInputProps()} />
            <UploadIcon className="h-12 w-12 text-gray-500 mx-auto" />
            <p className="mt-2 text-gray-400">{isDragActive ? 'Drop it to animate!' : 'Drag & drop a photo, or click'}</p>
          </div>
          {preview && (
            <div className="mt-4 text-center">
              <div className="inline-block p-2 bg-gray-900/50 rounded-xl border border-gray-800">
                <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
              </div>
            </div>
          )}
        </div>
        <div className={!hasFile ? 'opacity-50 pointer-events-none' : ''}>
           <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
            <span className="text-cyan-400">Step 2:</span> Add a Script
          </h2>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter what the person should say..."
            className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
            aria-label="Script for video generation"
            disabled={!hasFile}
          />
           <p className="text-xs text-gray-500 mt-2">Example: "Welcome to the future of content creation."</p>
        </div>
      </div>
       {hasFile && (
            <div className="sticky bottom-4 z-20 mt-8">
                <div className="max-w-2xl mx-auto bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-2xl shadow-black/50 text-center">
                    <Button onClick={handleGenerateClick} disabled={!canGenerate} variant="custom" className="w-full md:w-auto text-lg py-3 bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-500">
                        <VideoIcon className="h-5 w-5 mr-2" /> Animate Image ({generationCost} Credits)
                    </Button>
                     <p className="text-gray-400 text-sm mt-2">Cost: {generationCost} credits. You have {user.credits}.</p>
                     {user.credits < generationCost && (
                         <div className="mt-3 border-t border-gray-700 pt-3">
                             <Button onClick={onNavigateToPricing} variant="primary">
                                Buy More Credits
                             </Button>
                         </div>
                     )}
                </div>
            </div>
        )}
    </div>
  );
};

export default AnimateImageFlow;
