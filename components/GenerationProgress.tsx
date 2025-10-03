import React, { useEffect, useState } from 'react';
import * as gemini from '../services/geminiService';
import { GenerationRequest, UserState } from '../types';
import { Button } from './common/Button';

interface GenerationProgressProps {
    request: NonNullable<GenerationRequest>;
    onGenerationComplete: (result: (string | Blob)[], fallbackMsg?: string) => void;
    onRetry: () => void;
    user: UserState;
}

const imageLoadingMessages = [
    "Warming up the AI... 🚀",
    "Analyzing your photo's pixels... 📸",
    "Consulting with the digital da Vincis... 👨‍🎨",
    "Mixing the perfect palette... 🎨",
    "Applying the style with precision... ✨",
    "Rendering the final masterpiece... 🖼️",
    "Just a few more moments... ⏳",
];

const groupLoadingMessages = [
    "Warming up the AI for a group shot... 🚀",
    "Analyzing all reference photos... 📸",
    "Making sure everyone looks their best... ✨",
    "Composing the perfect group photo... 👨‍👩‍👧‍👦",
    "Rendering the final masterpiece... 🖼️",
    "Just a few more moments... ⏳",
];

const designLoadingMessages = [
    "Opening the digital design studio... 🎨",
    "Reviewing your creative brief... 📝",
    "Sketching out initial concepts... ✍️",
    "Generating a custom background image... 🖼️",
    "Selecting the perfect typography... 🔤",
    "Compositing text and logo elements... ✨",
    "Finalizing your professional flyer... 📄",
];

const videoLoadingMessages = [
    "Warming up the animation engine... 🎬",
    "Analyzing your image for animation... 🤔",
    "Choreographing pixel movements... 💃",
    "Rendering video frames... 🖼️",
    "This is a complex process and can take several minutes...",
    "Syncing audio and video... 🔊",
    "Finalizing your animation... ✨",
];


const GenerationProgress: React.FC<GenerationProgressProps> = ({ request, onGenerationComplete, onRetry, user }) => {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("Initializing...");
    const [error, setError] = useState<string | null>(null);

    const isVideoRequest = request.type === 'video';
    const isGroupRequest = request.type === 'group';
    const isDesignRequest = request.type === 'design';
    const loadingMessages = isVideoRequest ? videoLoadingMessages : isGroupRequest ? groupLoadingMessages : isDesignRequest ? designLoadingMessages : imageLoadingMessages;

    const styleInfo = (() => {
        if (request.type === 'video') return null;
        if (request.type === 'design') return `Creating your ${request.projectType.replace('_', ' ')}`;
        if (request.style) {
            return <>Applying Style: <span className="font-semibold text-white">{request.style.name}</span></>;
        } else if ((request.type === 'image' || request.type === 'group') && request.prompt) {
            return "Applying Your Custom Style";
        }
        return null;
    })();
    
    useEffect(() => {
        let isMounted = true;
        let progressInterval: ReturnType<typeof setInterval> | undefined;
        let messageInterval: ReturnType<typeof setInterval> | undefined;

        setError(null);
        setProgress(0);
        setMessage(loadingMessages[0]);

        const startGenerationProcess = async () => {
            try {
                if (!user || user.email === 'guest') {
                    throw new Error("User not authenticated for generation.");
                }
                
                const progressIncrementInterval = 400;
                let messageIndex = 0;

                const startProgressSimulation = () => {
                    progressInterval = setInterval(() => {
                        if (!isMounted) return;
                        setProgress(old => Math.min(old + 2, 95));
                    }, progressIncrementInterval);
    
                    messageInterval = setInterval(() => {
                        if (!isMounted) return;
                        messageIndex = (messageIndex + 1) % loadingMessages.length;
                        setMessage(loadingMessages[messageIndex]);
                    }, 3500);
                };
                
                const completeProgressSimulation = () => {
                    if (isMounted) {
                        clearInterval(progressInterval);
                        clearInterval(messageInterval);
                        setProgress(100);
                        setMessage("Generation complete!");
                    }
                };
                
                let result: (string|Blob)[] = [];

                if (request.type === 'video') {
                     if (request.videoType === 'animate' && (!request.files || request.files.length === 0)) {
                        throw new Error("Invalid animation request: no file provided.");
                    }
                    result = [await gemini.generateVideo({ videoType: request.videoType, files: request.files, prompt: request.prompt }, user.email, (progressMessage) => {
                        if (isMounted) {
                            setMessage(progressMessage);
                        }
                    })];
                     if (isMounted) {
                        setMessage("Generation complete!");
                    }
                } else if (request.type === 'group') {
                    startProgressSimulation();
                    result = await gemini.generateGroupPhoto(request.files, { style: request.style, customPrompt: request.prompt, aspectRatio: request.aspectRatio }, request.keepLikeness, user.email);
                    completeProgressSimulation();
                } else if (request.type === 'image') {
                    if (!request.files) {
                        throw new Error("Invalid image generation request.");
                    }
                    startProgressSimulation();
                    result = await gemini.generateProfilePic(request.files, { style: request.style, customPrompt: request.prompt, aspectRatio: request.aspectRatio, negativePrompt: request.negativePrompt }, request.keepLikeness ?? true, user.email);
                    completeProgressSimulation();
                } else if (request.type === 'design') {
                    startProgressSimulation();
                    result = await gemini.generateAdCreative(request, user.email);
                    completeProgressSimulation();
                } else {
                    throw new Error("Invalid generation request type.");
                }
                
                if (isMounted) {
                    setTimeout(() => onGenerationComplete(result), 1000);
                }

            } catch (err: any) {
                if (isMounted) {
                    if (err.isQuotaError) {
                        setError(err.message);
                        setMessage("System is Busy");
                        return;
                    }
                    
                    const errorMessage = (err as Error).message || "An unknown error occurred during generation.";
                    console.error("Failed to generate:", err);
                    
                    if (errorMessage.includes("API key not valid")) {
                        setError("There appears to be a configuration issue with the application. Please contact support and mention 'Invalid API Key'.");
                    } else if (errorMessage.includes("refused the request")) {
                        setError("The AI was unable to process this request, which can sometimes happen due to content safety filters. Please try a different photo, style, or a more descriptive custom prompt.");
                    }
                    else {
                        setError(errorMessage);
                    }
            
                    setMessage("Oops! Something went wrong.");
                }
            } finally {
                if (progressInterval) clearInterval(progressInterval);
                if (messageInterval) clearInterval(messageInterval);
            }
        };

        startGenerationProcess();

        return () => {
            isMounted = false;
            if (progressInterval) clearInterval(progressInterval);
            if (messageInterval) clearInterval(messageInterval);
        };
    }, [request, onGenerationComplete, onRetry, user]);

    return (
        <div className="container mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[60vh]">
            <div className="max-w-xl w-full text-center">
                 {error ? (
                    <>
                        <h2 className="text-3xl font-bold mb-4 text-red-400">Generation Failed</h2>
                        <p className="text-gray-400 bg-gray-800 p-4 rounded-lg mb-8">{error}</p>
                        <Button onClick={onRetry}>Try Again</Button>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl font-bold mb-4">{message}</h2>
                        {styleInfo && (
                            <p className="text-lg text-fuchsia-400 mb-6 animate-fade-in">
                                {styleInfo}
                            </p>
                        )}
                        <p className="text-gray-400 mb-8">This can take up to a minute{isVideoRequest ? ' or several minutes for video' : ''}. Feel free to keep this page open.</p>
                        
                        {!isVideoRequest ? (
                            <div className="w-full bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-cyan-400 to-fuchsia-500 h-4 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        ) : (
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                        )}
                    </>
                )}
                <p className="text-xs text-gray-500 mt-12">
                    Important: Your creations are automatically saved to the "My Creations" gallery.
                </p>
            </div>
        </div>
    );
};

export default GenerationProgress;