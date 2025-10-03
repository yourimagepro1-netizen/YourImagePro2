import React, { useState, lazy, Suspense } from 'react';
import { UserState, GenerationRequest, StyleOption } from '../types';
import { CameraIcon, UsersIcon, PaintBrushIcon } from './common/Icons';

const UploadFlow = lazy(() => import('./UploadFlow'));
const GroupUploadFlow = lazy(() => import('./GroupUploadFlow'));


interface CreationContainerProps {
  user: UserState;
  onGenerate: (files: File[], style: StyleOption, keepLikeness: boolean, aspectRatio: '1:1' | '16:9') => void;
  onGenerateRandom: (files: File[], keepLikeness: boolean, aspectRatio: '1:1' | '16:9') => void;
  onNavigateToPricing: () => void;
  initialRequest?: GenerationRequest | null;
  generationCost: number;
  onWatchAd: () => void;
  onNavigateToCustomPrompt: (files: File[]) => void;
  onGenerateGroupPhoto: (data: { files: File[], style?: StyleOption, prompt?: string, keepLikeness: boolean, aspectRatio: '1:1' | '16:9' }) => void;
  groupPhotoCost: number;
  groupCustomPhotoCost: number;
  onNavigateToDesignStudio: () => void;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
    </div>
);

const CreationContainer: React.FC<CreationContainerProps> = (props) => {
  const isInitialRequestGroup = props.initialRequest?.type === 'group';
  
  const [mode, setMode] = useState<'image' | 'group'>(isInitialRequestGroup ? 'group' : 'image');
  
  const tabs = [
    { key: 'image', label: 'Single Photo', icon: CameraIcon },
    { key: 'group', label: 'Group Photos', icon: UsersIcon },
    { key: 'design', label: 'AI Designer', icon: PaintBrushIcon },
  ];

  const handleModeChange = (newMode: 'image' | 'group' | 'design') => {
      if (newMode === 'design') {
          props.onNavigateToDesignStudio();
      } else {
          setMode(newMode);
      }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-5xl mx-auto">
            <div className="mb-8">
                <div className="flex justify-center p-1 bg-gray-900/50 border border-gray-800 rounded-xl max-w-md mx-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => handleModeChange(tab.key as 'image' | 'group' | 'design')}
                            className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${mode === tab.key ? 'bg-fuchsia-500 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                        >
                            <tab.icon className="h-5 w-5" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <Suspense fallback={<LoadingSpinner />}>
                {mode === 'image' && (
                    <UploadFlow {...props} initialRequest={props.initialRequest?.type === 'image' ? props.initialRequest : null} />
                )}

                {mode === 'group' && (
                    <GroupUploadFlow
                        user={props.user}
                        onGenerate={props.onGenerateGroupPhoto}
                        onNavigateToPricing={props.onNavigateToPricing}
                        generationCost={props.groupPhotoCost}
                        customGenerationCost={props.groupCustomPhotoCost}
                        initialRequest={props.initialRequest?.type === 'group' ? props.initialRequest : null}
                    />
                )}
            </Suspense>
        </div>
    </div>
  );
};

export default CreationContainer;