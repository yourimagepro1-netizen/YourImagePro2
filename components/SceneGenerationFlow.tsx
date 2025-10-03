import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone-esm';
import { Button } from './common/Button';
import { UserState } from '../types';
import { UploadIcon, SparklesIcon } from './common/Icons';

interface SceneGenerationFlowProps {
  user: UserState;
  onGenerateVideo: (prompt: string, file?: File) => void;
  onNavigateToPricing: () => void;
  generationCost: number;
}

const sceneSuggestions = [
  "A majestic dragon flying over a mountain range, cinematic, 8k.",
  "A futuristic cityscape at night, with flying cars and neon lights.",
  "An astronaut walking on the surface of Mars, realistic.",
  "A time-lapse video of a flower blooming, beautiful, high detail.",
  "A cute robot exploring a lush, alien jungle."
];

const SceneGenerationFlow: React.FC<SceneGenerationFlowProps> = ({ user, onGenerateVideo, onNavigateToPricing, generationCost }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');

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
    noClick: !!file,
  });

  const handleGenerateClick = () => {
    if (prompt.trim()) {
      onGenerateVideo(prompt.trim(), file || undefined);
    }
  };
  
  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  }

  const canGenerate = prompt.trim().length > 0;

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
          <span className="text-cyan-400">Step 1:</span> Describe the Video Scene
        </h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A majestic dragon flying over a mountain range..."
          className="w-full h-32 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
          aria-label="Scene description for video generation"
        />
        <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Need inspiration? Try one of these:</h4>
            <div className="flex flex-wrap gap-2">
                {sceneSuggestions.map(p => (
                    <button key={p} onClick={() => setPrompt(p)} className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded-md transition-colors">
                        {p}
                    </button>
                ))}
            </div>
        </div>
      </div>
      
      <div>
         <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 text-center">
            <span className="text-cyan-400">Step 2:</span> Add a Reference Image (Optional)
        </h2>
         <div {...getRootProps()} className={`p-6 border-2 border-dashed rounded-2xl text-center transition-colors ${isDragActive ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700'} ${file ? '' : 'cursor-pointer hover:border-cyan-400'}`}>
            <input {...getInputProps()} />
             {!file ? (
                <>
                    <UploadIcon className="h-12 w-12 text-gray-500 mx-auto" />
                    <p className="mt-2 text-gray-400">{isDragActive ? 'Drop image here!' : 'Drag & drop an image, or click'}</p>
                    <p className="text-xs text-gray-500 mt-1">This can help guide the style and content of your video.</p>
                </>
            ) : (
                <div className="text-center">
                    <div className="inline-block relative p-2 bg-gray-900/50 rounded-xl border border-gray-800">
                        <img src={preview!} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                        <button onClick={handleRemoveFile} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 leading-none">&times;</button>
                    </div>
                </div>
            )}
          </div>
      </div>
      
       <div className="sticky bottom-4 z-20 mt-8">
            <div className="max-w-2xl mx-auto bg-gray-900 p-4 rounded-2xl border border-gray-800 shadow-2xl shadow-black/50 text-center">
                <Button onClick={handleGenerateClick} disabled={!canGenerate} variant="custom" className="w-full md:w-auto text-lg py-3 bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-500">
                    <SparklesIcon className="h-5 w-5 mr-2" /> Generate Video ({generationCost} Credits)
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
    </div>
  );
};

export default SceneGenerationFlow;
