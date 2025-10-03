import React, { useState, useCallback, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Benefits } from './components/Benefits';
import { HowItWorks } from './components/HowItWorks';
import { Pricing } from './components/Pricing';
import { Footer } from './components/Footer';
// FIX: Imported StyleOption to fix 'Cannot find name' error.
import { UserState, GenerationRequest, MediaItem, StyleOption } from './types';
import { createCheckoutSession, verifyCheckoutSession, createPortalSession } from './services/stripeService';
import { getMediaPaginated } from './services/dbService';
import { STYLE_OPTIONS } from './constants';

const CreationContainer = lazy(() => import('./components/CreationContainer'));
const GenerationProgress = lazy(() => import('./components/GenerationProgress'));
const ResultsView = lazy(() => import('./components/ResultsView'));
const Auth = lazy(() => import('./components/Auth'));
const SuccessPage = lazy(() => import('./components/SuccessPage'));
const CancelPage = lazy(() => import('./components/CancelPage'));
const CustomPromptFlow = lazy(() => import('./components/CustomPromptFlow'));
const HistoryView = lazy(() => import('./components/HistoryView'));
const InsufficientCreditsModal = lazy(() => import('./components/InsufficientCreditsModal'));
const MaintenancePage = lazy(() => import('./components/MaintenancePage'));
const DesignStudioFlow = lazy(() => import('./components/DesignStudioFlow'));


export type AppState = 'auth' | 'landing' | 'uploading' | 'generating' | 'results' | 'success' | 'cancel' | 'verifying_payment' | 'custom_prompt' | 'history' | 'maintenance' | 'design_studio';

// --- MAINTENANCE MODE TOGGLE ---
// Set this to true to display the maintenance page, then deploy.
// Set back to false when maintenance is complete, then deploy again.
const MAINTENANCE_MODE = false;
const GROUP_PHOTO_COST = 4;
const GROUP_CUSTOM_PHOTO_COST = 6;


const GUEST_USER: UserState = {
    email: 'guest',
    credits: 0,
    plan: 'free',
    hasMadePurchase: false,
    adsWatchedToday: 0,
    lastAdWatchDate: new Date().toISOString().split('T')[0],
};

const getGenerationCost = (request: GenerationRequest): number => {
    if (!request) return 0;
    if (request.type === 'video') return 25; // Kept for type safety, though UI is hidden
    if (request.type === 'group') return request.prompt ? GROUP_CUSTOM_PHOTO_COST : GROUP_PHOTO_COST;
    if (request.type === 'design') return 8; // Cost for a design creative
    if (request.prompt) { // This covers custom prompts
        return 5;
    }
    return 2; // This covers pre-made styles and random styles
};

const LoadingSpinner: React.FC = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0f0f10]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500"></div>
    </div>
);

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(MAINTENANCE_MODE ? 'maintenance' : 'landing');
  const [user, setUser] = useState<UserState | null>(null);
  const [postLoginAction, setPostLoginAction] = useState<(() => void) | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Connecting securely...');

  const [latestGeneratedMedia, setLatestGeneratedMedia] = useState<string[]>([]);
  
  const [generationRequest, setGenerationRequest] = useState<GenerationRequest>(null);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  const [modalState, setModalState] = useState<{isOpen: boolean; required: number; current: number}>({isOpen: false, required: 0, current: 0});

  useEffect(() => {
    if (MAINTENANCE_MODE) return;
    const query = new URLSearchParams(window.location.search);
    const ref = query.get('ref');
    if (ref) {
      try {
        const decodedRef = decodeURIComponent(ref);
        sessionStorage.setItem('referralCode', decodedRef);
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Failed to decode referral code:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (MAINTENANCE_MODE) {
        setUser(GUEST_USER);
        return;
    };
    const lastUserEmail = localStorage.getItem('yourImageProLastUser');
    if (lastUserEmail) {
      const savedUserJSON = localStorage.getItem(`yourImageProUser_${lastUserEmail}`);
      if (savedUserJSON) {
        try {
            const savedUser = JSON.parse(savedUserJSON);
            setUser({
                email: savedUser.email,
                credits: savedUser.credits ?? 10,
                plan: savedUser.plan ?? 'free',
                hasMadePurchase: savedUser.hasMadePurchase ?? false,
                password: savedUser.password,
                stripeCustomerId: savedUser.stripeCustomerId,
                justReferred: savedUser.justReferred,
                adsWatchedToday: savedUser.adsWatchedToday ?? 0,
                lastAdWatchDate: savedUser.lastAdWatchDate ?? new Date().toISOString().split('T')[0],
            });
        } catch (e) {
            console.error("Failed to parse user data from localStorage:", e);
            localStorage.removeItem(`yourImageProUser_${lastUserEmail}`);
            localStorage.removeItem('yourImageProLastUser');
            setUser(GUEST_USER);
        }
      } else {
        setUser(GUEST_USER);
      }
    } else {
        setUser(GUEST_USER);
    }
  }, []);

  useEffect(() => {
    if (user && user.email !== 'guest') {
        try {
          localStorage.setItem(`yourImageProUser_${user.email}`, JSON.stringify(user));
        } catch (e) {
            console.error("Could not write user data to localStorage:", e);
        }
    }
  }, [user]);

  useEffect(() => {
    if (MAINTENANCE_MODE) return;
    const query = new URLSearchParams(window.location.search);
    const checkoutStatus = query.get('checkout');
    const sessionId = query.get('session_id');
    
    if (checkoutStatus && user) {
        window.history.replaceState({}, document.title, window.location.pathname);

        if (checkoutStatus === 'success' && sessionId) {
            setLoadingMessage('Verifying your payment...');
            setAppState('verifying_payment');
            verifyCheckoutSession(sessionId).then(result => {
                if (result.success && result.productId) {
                    let message = '';
                    setUser(prev => {
                        if (!prev) return null;
                        const newUser = { ...prev, hasMadePurchase: true };
                        if (result.stripeCustomerId) {
                           newUser.stripeCustomerId = result.stripeCustomerId;
                        }

                        switch(result.productId) {
                            case 'prod_T9TD33RLHNcb15': newUser.credits += 100; message = "Successfully purchased 100 credits!"; break;
                            case 'prod_T9TFRxXWhEntzu': newUser.credits += 500; message = "Successfully purchased 500 credits!"; break;
                            case 'prod_T9TIhN8PTQHK4w': newUser.credits += 1500; message = "Successfully purchased 1500 credits!"; break;
                            
                            case 'prod_T9T0AxuPBbXbCC': newUser.credits += 200; newUser.plan = 'creator'; message = "Welcome to the Creator plan! 200 credits have been added."; break;
                            case 'prod_T9T6Hb6xasuL4i': newUser.credits += 1000; newUser.plan = 'professional'; message = "Welcome to the Professional plan! 1000 credits have been added."; break;
                            case 'prod_T9T9VkAt19oEv5': newUser.credits += 3000; newUser.plan = 'agency'; message = "Welcome to the Agency plan! 3000 credits have been added."; break;
                        }
                        return newUser;
                    });
                    setSuccessMessage(message);
                    setAppState('success');
                } else {
                    setErrorMessage("We could not verify your payment. Please contact support.");
                    setAppState('cancel');
                }
            }).catch(err => {
                console.error("Payment verification failed:", err);
                setErrorMessage("We could not verify your payment. Please contact support.");
                setAppState('cancel');
            });
        } else if (checkoutStatus === 'cancel') {
            setErrorMessage("Your payment was canceled. You have not been charged.");
            setAppState('cancel');
        }
    }
  }, [user]);

  const handleLogin = useCallback((loggedInUser: UserState) => {
    let userToSet = { ...loggedInUser };
    
    if (userToSet.justReferred) {
        alert("Welcome! As a bonus for being referred by a friend, 2 extra credits have been added to your account.");
        delete userToSet.justReferred;
    }
    
    localStorage.setItem('yourImageProLastUser', userToSet.email);
    setUser(userToSet);
    setAppState('landing');
    
    if (postLoginAction) {
        postLoginAction();
        setPostLoginAction(null);
    }
  }, [postLoginAction]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('yourImageProLastUser');
    setUser(GUEST_USER);
    setLatestGeneratedMedia([]);
    setAppState('landing');
  }, []);
  
  const handleSignIn = useCallback(() => {
    setPostLoginAction(null);
    setAppState('auth');
  }, []);

  const handleStartGenerating = useCallback(() => {
    setGenerationRequest(null);
    setAppState('uploading');
  }, []);

  const handleGenerationComplete = useCallback(async (result: (string | Blob)[], fallbackMsg?: string) => {
    if (!user || user.email === 'guest' || result.length === 0) return;
    
    if (fallbackMsg) {
        setFallbackMessage(fallbackMsg);
    } else {
        const cost = getGenerationCost(generationRequest);
        setUser(prev => prev ? ({ ...prev, credits: prev.credits - cost }) : null);
    }

    const mediaForDisplay = await Promise.all(result.map(async item => {
        if (item instanceof Blob) {
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(item);
            });
        }
        return item;
    }));
    
    setLatestGeneratedMedia(mediaForDisplay);
    setAppState('results');
  }, [user, generationRequest]);

  const handleGenerateImage = useCallback((files: File[], style: StyleOption, keepLikeness: boolean, aspectRatio: '1:1' | '16:9') => {
    if (!user) return;
    const cost = getGenerationCost({ type: 'image', style });
    if (user.credits < cost) {
        setModalState({ isOpen: true, required: cost, current: user.credits });
        return;
    }
    setGenerationRequest({ type: 'image', files, style, keepLikeness, aspectRatio });
    setAppState('generating');
  }, [user]);
  
  const handleGenerateRandom = useCallback((files: File[], keepLikeness: boolean, aspectRatio: '1:1' | '16:9') => {
    if (!user) return;
    const cost = getGenerationCost({ type: 'image' });
    if (user.credits < cost) {
        setModalState({ isOpen: true, required: cost, current: user.credits });
        return;
    }
    const randomStyle = STYLE_OPTIONS[Math.floor(Math.random() * STYLE_OPTIONS.length)];
    setGenerationRequest({ type: 'image', files, keepLikeness, aspectRatio, style: randomStyle });
    setAppState('generating');
  }, [user]);

  const handleNavigateToCustomPrompt = useCallback((files: File[]) => {
    setGenerationRequest({ type: 'image', files, keepLikeness: true, aspectRatio: '1:1' });
    setAppState('custom_prompt');
  }, []);

  const handleCustomGenerate = useCallback((prompt: string, negativePrompt: string, keepLikeness: boolean, aspectRatio: '1:1' | '16:9') => {
      if (!user || generationRequest?.type !== 'image' || !generationRequest.files) return;
      const cost = getGenerationCost({ type: 'image', prompt });
      if (user.credits < cost) {
        setModalState({ isOpen: true, required: cost, current: user.credits });
        return;
    }
      setGenerationRequest(prev => ({ ...prev!, type: 'image', prompt, negativePrompt, keepLikeness, aspectRatio, style: undefined }));
      setAppState('generating');
  }, [user, generationRequest]);

  const handleGenerateGroupPhoto = useCallback((data: { files: File[], style?: StyleOption, prompt?: string, keepLikeness: boolean, aspectRatio: '1:1' | '16:9' }) => {
    if (!user) return;
    const request: GenerationRequest = { type: 'group', ...data };
    const cost = getGenerationCost(request);
    if (user.credits < cost) {
        setModalState({ isOpen: true, required: cost, current: user.credits });
        return;
    }
    setGenerationRequest(request);
    setAppState('generating');
  }, [user]);
  
  const handleGenerateDesign = useCallback((options: {
    projectType: 'event_flyer',
    textContent: { [key: string]: string },
    styleDescription: string,
    logoFile?: File
  }) => {
      if (!user) return;
      const request: GenerationRequest = {
          type: 'design',
          ...options,
          aspectRatio: '9:16'
      };
      const cost = getGenerationCost(request);
      if (user.credits < cost) {
          setModalState({ isOpen: true, required: cost, current: user.credits });
          return;
      }
      setGenerationRequest(request);
      setAppState('generating');
  }, [user]);

  const handleStartOver = useCallback(() => {
    setGenerationRequest(null);
    setLatestGeneratedMedia([]);
    setFallbackMessage(null);
    setAppState('landing');
    window.scrollTo(0, 0);
  }, []);
  
  const handleGenerateMore = useCallback(() => {
    setGenerationRequest(prev => {
        if (prev?.type === 'image' && prev.files) {
            return {
                type: 'image',
                files: prev.files,
                keepLikeness: prev.keepLikeness ?? true,
                aspectRatio: prev.aspectRatio ?? '1:1',
            };
        }
        if (prev?.type === 'group' && prev.files) {
            // Keep the same files for the next group generation
            return {
                type: 'group',
                files: prev.files,
                keepLikeness: prev.keepLikeness,
                aspectRatio: prev.aspectRatio,
            };
        }
        return null;
    });
    setLatestGeneratedMedia([]);
    setFallbackMessage(null);
    setAppState('uploading');
  }, []);

  const handleBackToUpload = useCallback(() => {
    setFallbackMessage(null);
    setAppState('uploading');
  }, []);
  
  const handleWatchAd = useCallback(() => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    let currentAdsWatched = user.lastAdWatchDate === today ? (user.adsWatchedToday ?? 0) : 0;
    
    if (currentAdsWatched >= 6) {
        alert("You have reached your daily limit of 6 ad credits. Please try again tomorrow.");
        return;
    }
    setUser(prev => prev ? {
        ...prev,
        credits: prev.credits + 1,
        adsWatchedToday: currentAdsWatched + 1,
        lastAdWatchDate: today,
    } : null);
  }, [user]);

  const withAuth = (action: (...args: any[]) => void): ((...args: any[]) => void) => {
    return (...args: any[]) => {
      if (user && user.email !== 'guest') {
        action(...args);
      } else {
        setPostLoginAction(() => () => action(...args));
        setAppState('auth');
      }
    };
  };

  const handleCheckout = async (priceId: string) => {
    if (!user || user.email === 'guest') {
        setPostLoginAction(() => () => handleCheckout(priceId));
        alert("Please sign in to make a purchase.");
        setAppState('auth');
        return;
    }
    try {
        setLoadingMessage('Connecting securely to Stripe...');
        setAppState('verifying_payment');
        const { url } = await createCheckoutSession(priceId, user.email);
        window.location.href = url;
    } catch (error) {
        console.error("Checkout error:", error);
        alert(`Could not initiate checkout: ${(error as Error).message}`);
        setAppState('landing');
    }
  };

  const handleManageSubscription = async () => {
    if (!user || user.plan === 'free' || !user.stripeCustomerId) {
        alert("Subscription management is only available for active subscribers.");
        return;
    }
    try {
        setLoadingMessage("Redirecting to your billing portal...");
        setAppState('verifying_payment');
        const { url } = await createPortalSession(user.stripeCustomerId);
        window.location.href = url;
    } catch (error) {
        console.error("Portal session error:", error);
        alert(`Could not connect to the customer portal: ${(error as Error).message}`);
        setAppState('landing');
    }
  };
  
  const handleRetry = useCallback(() => {
    setGenerationRequest(null);
    setFallbackMessage(null);
    setAppState('uploading');
  }, []);

  const handleContinueFromSuccess = useCallback(() => setAppState('landing'), []);
  const handleRetryPricing = useCallback(() => {
    setAppState('landing');
    setTimeout(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }), 100);
  }, []);

  const handleNavigateToPricing = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    setAppState('landing');
    requestAnimationFrame(() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }));
  }, []);
  
  const handleNavigateToHistory = useCallback(() => setAppState('history'), []);
  const handleNavigateToDesignStudio = useCallback(() => setAppState('design_studio'), []);
  
  const renderContent = () => {
    const key = `${appState}-${generationRequest?.type}-${(generationRequest?.type === 'image' && generationRequest.files?.[0]?.name) || (generationRequest?.type === 'video' && generationRequest.files?.[0]?.name) || ''}`;
    const pageContent = () => {
        if (!user) {
            return <LoadingSpinner />;
        }
        
        const imageRequest = (generationRequest?.type === 'image' || generationRequest?.type === 'group' || generationRequest?.type === 'design') ? generationRequest : null;

        switch (appState) {
            case 'maintenance': return <MaintenancePage />;
            case 'auth': return <Auth onLogin={handleLogin} />;
            case 'verifying_payment': return <div className="container mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-[60vh]"><div className="max-w-md w-full text-center"><h2 className="text-3xl font-bold mb-4">{loadingMessage}</h2><p className="text-gray-400 mb-8">Please wait while we process your request.</p><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-500 mx-auto"></div></div></div>;
            case 'success': return <SuccessPage message={successMessage} onContinue={handleContinueFromSuccess} />;
            case 'cancel': return <CancelPage onRetry={handleRetryPricing} message={errorMessage} />;
            case 'uploading': return <CreationContainer user={user} onGenerate={handleGenerateImage} onGenerateRandom={withAuth(handleGenerateRandom)} onNavigateToPricing={handleNavigateToPricing} generationCost={2} onWatchAd={handleWatchAd} onNavigateToCustomPrompt={withAuth(handleNavigateToCustomPrompt)} initialRequest={generationRequest} onGenerateGroupPhoto={withAuth(handleGenerateGroupPhoto)} groupPhotoCost={GROUP_PHOTO_COST} groupCustomPhotoCost={GROUP_CUSTOM_PHOTO_COST} onNavigateToDesignStudio={withAuth(handleNavigateToDesignStudio)} />;
            case 'custom_prompt': return imageRequest && imageRequest.type === 'image' && imageRequest.files ? <CustomPromptFlow user={user} onGenerate={handleCustomGenerate} initialFiles={imageRequest.files} onNavigateToPricing={handleNavigateToPricing} generationCost={5} onBack={handleBackToUpload} initialAspectRatio={imageRequest.aspectRatio} onWatchAd={handleWatchAd} /> : null;
            case 'generating': return <GenerationProgress request={generationRequest!} onGenerationComplete={handleGenerationComplete} onRetry={handleRetry} user={user} />;
            case 'results': return <ResultsView media={latestGeneratedMedia} onStartOver={handleStartOver} onGenerateMore={handleGenerateMore} aspectRatio={imageRequest?.aspectRatio} fallbackMessage={fallbackMessage} user={user} />;
            case 'history': return <HistoryView user={user} onStartOver={handleStartOver} />;
            case 'design_studio': return <DesignStudioFlow user={user} onNavigateToPricing={handleNavigateToPricing} onGenerate={handleGenerateDesign} />;
            case 'landing':
            default: return <><Hero onStart={withAuth(handleStartGenerating)} /><Benefits /><HowItWorks /><Pricing onStart={withAuth(handleStartGenerating)} onCheckout={handleCheckout} /></>;
        }
    };
    return <div key={key} className="animate-fade-in">{pageContent()}</div>;
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] overflow-x-hidden">
      {appState !== 'maintenance' && user && <Header user={user} onLogout={handleLogout} onSignIn={handleSignIn} onNavigateToHistory={withAuth(handleNavigateToHistory)} onManageSubscription={handleManageSubscription} />}
      <Suspense fallback={<></>}>
        {appState !== 'maintenance' && (
            <InsufficientCreditsModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, required: 0, current: 0 })}
                onGoToPricing={handleNavigateToPricing}
                required={modalState.required}
                current={modalState.current}
            />
        )}
      </Suspense>
      <main className={appState !== 'maintenance' ? "pt-20" : ""}>
        <Suspense fallback={<LoadingSpinner />}>
            {renderContent()}
        </Suspense>
      </main>
      {appState !== 'maintenance' && <Footer />}
    </div>
  );
};

export default App;