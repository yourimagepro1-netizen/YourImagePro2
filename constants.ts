import { StyleOption } from './types';

export const STYLE_OPTIONS: StyleOption[] = [
  // --- Professional Headshots ---
  { id: 'corporate_ceo', name: 'Corporate CEO', thumbnail: '...', color: 'bg-slate-800', category: 'professional_headshots', requiredPlan: 'free' },
  { id: 'tech_founder', name: 'Tech Founder', thumbnail: '...', color: 'bg-sky-800', category: 'professional_headshots', requiredPlan: 'free' },
  { id: 'actors_headshot_dramatic', name: 'Actor\'s Headshot (Dramatic)', thumbnail: '...', color: 'bg-neutral-900', category: 'professional_headshots', requiredPlan: 'free' },
  { id: 'actors_headshot_commercial', name: 'Actor\'s Headshot (Commercial)', thumbnail: '...', color: 'bg-blue-700', category: 'professional_headshots', requiredPlan: 'free' },
  { id: 'real_estate_agent', name: 'Real Estate Agent', thumbnail: '...', color: 'bg-stone-700', category: 'professional_headshots', requiredPlan: 'free' },
  { id: 'healthcare_professional', name: 'Healthcare Professional', thumbnail: '...', color: 'bg-teal-800', category: 'professional_headshots', requiredPlan: 'free' },
  { id: 'creative_director', name: 'Creative Director', thumbnail: '...', color: 'bg-gray-700', category: 'professional_headshots', requiredPlan: 'free' },
  { id: 'author_portrait', name: 'Author Portrait', thumbnail: '...', color: 'bg-stone-800', category: 'professional_headshots', requiredPlan: 'free' },
  { id: 'environmental_portrait_wide', name: 'Environmental Portrait (Wide)', thumbnail: '...', color: 'bg-emerald-800', category: 'professional_headshots', requiredPlan: 'free' },
  { id: 'team_leader_shot', name: 'Team Leader', thumbnail: '...', color: 'bg-indigo-800', category: 'professional_headshots', requiredPlan: 'free' },

  // --- Branding & Marketing ---
  { id: 'social_media_influencer', name: 'Social Media Influencer', thumbnail: '...', color: 'bg-rose-700', category: 'branding_marketing', requiredPlan: 'free' },
  { id: 'product_campaign', name: 'Product Campaign', thumbnail: '...', color: 'bg-emerald-800', category: 'branding_marketing', requiredPlan: 'free' },
  { id: 'website_banner', name: 'Website Banner', thumbnail: '...', color: 'bg-indigo-800', category: 'branding_marketing', requiredPlan: 'free' },
  { id: 'marketing_poster', name: 'Marketing Poster', thumbnail: '...', color: 'bg-amber-700', category: 'branding_marketing', requiredPlan: 'free' },
  { id: 'podcast_cover_art', name: 'Podcast Cover Art', thumbnail: '...', color: 'bg-purple-800', category: 'branding_marketing', requiredPlan: 'free' },
  { id: 'conference_speaker', name: 'Conference Speaker', thumbnail: '...', color: 'bg-red-800', category: 'branding_marketing', requiredPlan: 'free' },
  { id: 'product_lifestyle_shoot_wide', name: 'Product Lifestyle (Wide)', thumbnail: '...', color: 'bg-cyan-700', category: 'branding_marketing', requiredPlan: 'free' },
  { id: 'behind_the_scenes', name: 'Behind The Scenes', thumbnail: '...', color: 'bg-orange-800', category: 'branding_marketing', requiredPlan: 'free' },
  { id: 'customer_testimonial', name: 'Customer Testimonial', thumbnail: '...', color: 'bg-teal-700', category: 'branding_marketing', requiredPlan: 'free' },
  { id: 'brand_narrative_cinematic', name: 'Brand Narrative (Cinematic)', thumbnail: '...', color: 'bg-slate-700', category: 'branding_marketing', requiredPlan: 'free' },


  // --- Lifestyle & Editorial ---
  { id: 'magazine_cover_shoot', name: 'Magazine Cover', thumbnail: '...', color: 'bg-stone-600', category: 'lifestyle_editorial', requiredPlan: 'free' },
  { id: 'urban_street_style', name: 'Urban Street Style', thumbnail: '...', color: 'bg-slate-700', category: 'lifestyle_editorial', requiredPlan: 'free' },
  { id: 'golden_hour_portrait', name: 'Golden Hour Portrait', thumbnail: '...', color: 'bg-orange-600', category: 'lifestyle_editorial', requiredPlan: 'free' },
  { id: 'luxury_lifestyle', name: 'Luxury Lifestyle', thumbnail: '...', color: 'bg-yellow-800', category: 'lifestyle_editorial', requiredPlan: 'free' },
  { id: 'candid_cafe', name: 'Candid Cafe', thumbnail: '...', color: 'bg-orange-900', category: 'lifestyle_editorial', requiredPlan: 'free' },
  { id: 'fitness_influencer', name: 'Fitness Influencer', thumbnail: '...', color: 'bg-lime-700', category: 'lifestyle_editorial', requiredPlan: 'free' },
  { id: 'travel_blogger_wide', name: 'Travel Blogger (Wide)', thumbnail: '...', color: 'bg-sky-700', category: 'lifestyle_editorial', requiredPlan: 'free' },
  { id: 'gourmet_foodie', name: 'Gourmet Foodie', thumbnail: '...', color: 'bg-red-700', category: 'lifestyle_editorial', requiredPlan: 'free' },
  { id: 'weekend_getaway_wide', name: 'Weekend Getaway (Wide)', thumbnail: '...', color: 'bg-green-700', category: 'lifestyle_editorial', requiredPlan: 'free' },
  { id: 'urban_explorer', name: 'Urban Explorer', thumbnail: '...', color: 'bg-neutral-700', category: 'lifestyle_editorial', requiredPlan: 'free' },


  // --- Creative Portraits ---
  { id: 'film_noir', name: 'Film Noir', thumbnail: '...', color: 'bg-black', category: 'creative_portraits', requiredPlan: 'free' },
  { id: 'old_hollywood_glamour', name: 'Old Hollywood', thumbnail: '...', color: 'bg-gray-600', category: 'creative_portraits', requiredPlan: 'free' },
  { id: 'paparazzi_street_style', name: 'Paparazzi Street Style', thumbnail: '...', color: 'bg-fuchsia-800', category: 'creative_portraits', requiredPlan: 'free' },
  { id: 'musician_album_cover', name: 'Musician Album Cover', thumbnail: '...', color: 'bg-cyan-700', category: 'creative_portraits', requiredPlan: 'free' },
  { id: 'cinematic_portrait', name: 'Cinematic Portrait', thumbnail: '...', color: 'bg-blue-900', category: 'creative_portraits', requiredPlan: 'free' },
  { id: 'minimalist_portrait', name: 'Minimalist Portrait', thumbnail: '...', color: 'bg-zinc-700', category: 'creative_portraits', requiredPlan: 'free' },
  { id: 'surrealist_dreamscape_wide', name: 'Surrealist Dreamscape (Wide)', thumbnail: '...', color: 'bg-purple-900', category: 'creative_portraits', requiredPlan: 'free' },
  { id: 'cyberpunk_cityscape_wide', name: 'Cyberpunk Cityscape (Wide)', thumbnail: '...', color: 'bg-pink-900', category: 'creative_portraits', requiredPlan: 'free' },
  { id: 'baroque_painting', name: 'Baroque Painting', thumbnail: '...', color: 'bg-yellow-900', category: 'creative_portraits', requiredPlan: 'free' },
  { id: 'double_exposure', name: 'Double Exposure', thumbnail: '...', color: 'bg-teal-900', category: 'creative_portraits', requiredPlan: 'free' },
  { id: 'underwater_portrait', name: 'Underwater Portrait', thumbnail: '...', color: 'bg-sky-900', category: 'creative_portraits', requiredPlan: 'free' },


  // --- Model Photoshoots ---
  { id: 'swimsuit_beachwear', name: 'Swimsuit & Beachwear', thumbnail: '...', color: 'bg-cyan-600', category: 'model_photoshoots', requiredPlan: 'free' },
  { id: 'dramatic_studio_portrait', name: 'Dramatic Studio Portrait', thumbnail: '...', color: 'bg-stone-900', category: 'model_photoshoots', requiredPlan: 'free' },
  { id: 'high_fashion_street_style_full', name: 'High-Fashion Street', thumbnail: '...', color: 'bg-rose-900', category: 'model_photoshoots', requiredPlan: 'free' },
  { id: 'fitness_athleisure_full', name: 'Fitness & Athleisure', thumbnail: '...', color: 'bg-lime-800', category: 'model_photoshoots', requiredPlan: 'free' },
  { id: 'ecommerce_catalog', name: 'E-commerce Catalog', thumbnail: '...', color: 'bg-gray-500', category: 'model_photoshoots', requiredPlan: 'free' },
  { id: 'vogue_editorial_spread_wide', name: 'Vogue Editorial (Wide)', thumbnail: '...', color: 'bg-neutral-800', category: 'model_photoshoots', requiredPlan: 'free' },
  { id: 'beach_glamour_full', name: 'Beach Glamour', thumbnail: '...', color: 'bg-amber-600', category: 'model_photoshoots', requiredPlan: 'free' },
  { id: 'after_hours_glamour', name: 'After Hours Glamour', thumbnail: '...', color: 'bg-red-900', category: 'model_photoshoots', requiredPlan: 'free' },
  { id: 'midnight_rider_fashion', name: 'Midnight Rider Fashion', thumbnail: '...', color: 'bg-black', category: 'model_photoshoots', requiredPlan: 'free' },

  // --- Urban & Hip ---
  { id: 'hip_hop_fashion', name: 'Hip-Hop Fashion', thumbnail: '...', color: 'bg-orange-700', category: 'urban_hip', requiredPlan: 'free' },
  { id: 'grown_sexy_night_out', name: 'Grown & Sexy', thumbnail: '...', color: 'bg-red-900', category: 'urban_hip', requiredPlan: 'free' },
  { id: 'nightclub_vip', name: 'Club / VIP', thumbnail: '...', color: 'bg-purple-800', category: 'urban_hip', requiredPlan: 'free' },
  { id: 'urban_glamour_shot', name: 'Urban Glamour', thumbnail: '...', color: 'bg-fuchsia-800', category: 'urban_hip', requiredPlan: 'free' },
  
  // --- Holiday & Events ---
  { id: 'birthday_celebration', name: 'Birthday Celebration', thumbnail: '...', color: 'bg-pink-600', category: 'holiday_events', requiredPlan: 'free' },
  { id: 'christmas_family_portrait', name: 'Christmas Portrait', thumbnail: '...', color: 'bg-emerald-700', category: 'holiday_events', requiredPlan: 'free' },
  { id: 'new_years_eve_party', name: 'New Year\'s Eve', thumbnail: '...', color: 'bg-yellow-700', category: 'holiday_events', requiredPlan: 'free' },

  // --- Group Portraits (Family, Friends, Teams) ---
  { id: 'family_beach_portrait', name: 'Family Beach Portrait', thumbnail: '...', color: 'bg-sky-600', category: 'couples_family_portraits', requiredPlan: 'free' },
  { id: 'romantic_couple_paris', name: 'Romantic in Paris', thumbnail: '...', color: 'bg-rose-500', category: 'couples_family_portraits', requiredPlan: 'free' },
  { id: 'cozy_family_at_home', name: 'Cozy Family at Home', thumbnail: '...', color: 'bg-amber-700', category: 'couples_family_portraits', requiredPlan: 'free' },
  { id: 'formal_family_studio', name: 'Formal Studio Portrait', thumbnail: '...', color: 'bg-slate-700', category: 'couples_family_portraits', requiredPlan: 'free' },
  { id: 'adventurous_couple_hiking', name: 'Adventurous Couple Hiking', thumbnail: '...', color: 'bg-emerald-700', category: 'couples_family_portraits', requiredPlan: 'free' },
  { id: 'urban_couple_street_style', name: 'Urban Couple Street Style', thumbnail: '...', color: 'bg-neutral-800', category: 'couples_family_portraits', requiredPlan: 'free' },
  { id: 'corporate_team_photo', name: 'Corporate Team Photo', thumbnail: '...', color: 'bg-blue-800', category: 'couples_family_portraits', requiredPlan: 'free' },
  { id: 'startup_team_casual', name: 'Startup Team (Casual)', thumbnail: '...', color: 'bg-indigo-700', category: 'couples_family_portraits', requiredPlan: 'free' },
  { id: 'friends_night_out', name: 'Friends\' Night Out', thumbnail: '...', color: 'bg-purple-700', category: 'couples_family_portraits', requiredPlan: 'free' },
  { id: 'sports_team_portrait', name: 'Sports Team Portrait', thumbnail: '...', color: 'bg-red-800', category: 'couples_family_portraits', requiredPlan: 'free' },


];

export const SUBSCRIPTION_PLANS = [
  {
    key: 'free' as const,
    name: 'Free',
    description: 'Perfect for getting started',
    price: '$0',
    priceTerm: '',
    features: ['20 free credits on signup', 'Standard generation queue'],
    cta: 'Sign Up For Free',
    buttonVariant: 'secondary' as const,
    isSubscription: false,
  },
  {
    key: 'creator' as const,
    name: 'Creator',
    description: 'For hobbyists & solopreneurs',
    price: '$9.99',
    priceTerm: '/ month',
    features: ['200 credits per month', 'Standard generation queue', 'Access to all styles'],
    cta: 'Subscribe to Creator',
    buttonVariant: 'custom' as const,
    customButtonClass: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500',
    isSubscription: true,
    priceId: 'price_1SDA4K3ZHa8jpsiX3Y2QMXsl',
  },
  {
    key: 'professional' as const,
    name: 'Professional',
    description: 'For freelancers & small businesses',
    price: '$39.99',
    priceTerm: '/ month',
    features: ['1000 credits per month', 'Priority generation queue', 'Early access to new styles'],
    cta: 'Subscribe to Pro',
    buttonVariant: 'primary' as const,
    isSubscription: true,
    badge: 'Most Popular',
    priceId: 'price_1SDAAP3ZHa8jpsiXB40NgA4x',
  },
  {
    key: 'agency' as const,
    name: 'Agency',
    description: 'For agencies & power users',
    price: '$99.99',
    priceTerm: '/ month',
    features: ['3000 credits per month', 'Highest priority queue', 'Early access to all new features'],
    cta: 'Subscribe to Agency',
    buttonVariant: 'custom' as const,
    customButtonClass: 'bg-cyan-500 hover:bg-cyan-600 focus:ring-cyan-500',
    isSubscription: true,
    priceId: 'price_1SDADR3ZHa8jpsiXnOUGumRF',
  },
];

export const CREDIT_PACKS = [
  {
    key: 'starter_pack' as const,
    name: 'Starter Pack',
    credits: 100,
    price: '$4.99',
    images: '~50 images',
    cta: 'Buy 100 Credits',
    buttonVariant: 'secondary' as const,
    priceId: 'price_1SDAHA3ZHa8jpsiXcLLZmPh9',
  },
  {
    key: 'pro_pack' as const,
    name: 'Pro Pack',
    credits: 500,
    price: '$19.99',
    images: '~250 images',
    cta: 'Buy 500 Credits',
    buttonVariant: 'primary' as const,
    badge: 'Best Value',
    priceId: 'price_1SDAJ33ZHa8jpsiXJ5rcVMFR',
  },
  {
    key: 'enterprise_pack' as const,
    name: 'Enterprise Pack',
    credits: 1500,
    price: '$49.99',
    images: '~750 images',
    cta: 'Buy 1500 Credits',
    buttonVariant: 'secondary' as const,
    priceId: 'price_1SDAMO3ZHa8jpsiXPQzEA99c',
  },
];