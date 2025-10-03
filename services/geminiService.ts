
import { GoogleGenAI, Modality } from "@google/genai";
import { StyleOption } from '../types';
import { STYLE_OPTIONS } from '../constants';
import { addMedia } from './dbService';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

const handleApiError = (err: any): Error => {
    const message = (err.message || '').toLowerCase();
    if (err.status === 429 || message.includes('quota') || message.includes('resource_exhausted') || message.includes('resource exhausted')) {
        const fallbackError = new Error('Our systems are experiencing high demand right now. Your credits have not been used. Please try again in a few minutes.');
        (fallbackError as any).isQuotaError = true;
        return fallbackError;
    }
    return err;
};

export const enhanceImage = async (
  base64ImageData: string,
  mimeType: string,
  enhancementPrompt: string,
  userEmail: string,
): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    
    try {
        const imagePart = {
          inlineData: {
            data: base64ImageData,
            mimeType: mimeType,
          },
        };

        const textPart = {
          text: `Task: Perform a professional photo touch-up on the provided image.
    Enhancement Instructions: ${enhancementPrompt}
    VERY HIGH PRIORITY: The subject's core facial features and identity MUST be preserved with 100% accuracy.
    ALLOWED CHANGES: You MAY adjust lighting, color balance, contrast, and apply professional skin retouching as requested.
    Negative Constraints: Do not change the person's identity. Do not alter the background scenery. Do not add or remove objects. Do not change the subject's clothing or pose.
    Output requirements: The output must be ONLY the enhanced image, maintaining the original aspect ratio.`,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                    await addMedia(userEmail, 'image', imageUrl); // Save enhanced image to history
                    return imageUrl;
                }
            }
        }
        
        throw new Error("AI enhancement failed. The model did not return an image.");

    } catch (err) {
        throw handleApiError(err);
    }
};

const getStyleInstruction = (style: StyleOption): string => {
      // New Professional-focused prompts
      switch (style.id) {
        // --- Professional Headshots ---
        case 'corporate_ceo':
          return "A powerful, professional headshot of a corporate CEO or executive. Subject wears a sharp, modern business suit. The background is a clean, softly blurred, high-end office or a neutral studio backdrop. Lighting is key: use flattering, professional studio lighting that conveys confidence and authority. The final image should be ultra-realistic and suitable for a company website or major publication like Forbes.";
        case 'tech_founder':
          return "A confident and approachable portrait of a tech innovator or startup founder. Attire is smart-casual (e.g., a sharp blazer over a quality t-shirt, or a stylish button-down shirt). The background is a bright, modern, and minimalist tech office with soft focus, or against a clean architectural element. Lighting is clean and professional, conveying innovation and forward-thinking.";
        case 'actors_headshot_dramatic':
          return "A dramatic actor's headshot with a moody, cinematic feel. Use high-contrast lighting (like Rembrandt or split lighting) to create shadows and highlight facial features. The expression should be intense and captivating. Background should be dark and non-distracting. The focus is entirely on the face and emotion.";
        case 'actors_headshot_commercial':
          return "A bright, friendly, and approachable commercial actor's headshot. The lighting should be even, bright, and flattering, making the subject look warm and trustworthy. The expression is a genuine, confident smile. The background is a simple, clean, and brightly lit studio setting, possibly with a pop of color.";
        case 'real_estate_agent':
          return "A professional and trustworthy portrait of a real estate agent. Subject wears professional business attire. The background should be a modern, upscale home interior or exterior, softly blurred to keep focus on the agent. Lighting is bright and inviting. The expression should be confident and friendly.";
        case 'healthcare_professional':
          return "An empathetic and professional portrait of a healthcare worker (doctor, nurse). Subject is wearing clean, professional attire like scrubs or a lab coat. The background is a modern, clean, and softly-lit medical office or hospital setting, kept out of focus. The expression should be reassuring and competent.";
        case 'creative_director':
          return "An artistic and stylish portrait of a creative director. Setting is a minimalist design studio or against a clean architectural background. Subject exudes confidence and creativity, dressed in modern, chic clothing. The lighting is soft and artistic, like a photoshoot for a design magazine.";
         case 'author_portrait':
          return "A thoughtful and professional portrait of an author. The subject is in a cozy, intellectual setting like a library, study, or cafe, with books or a laptop visible but softly blurred. The lighting is soft and natural, creating a contemplative mood. The expression is engaging and intelligent.";
        case 'environmental_portrait_wide':
          return "A professional, true-to-life environmental portrait of a subject in their natural workspace (e.g., an architect on a construction site, a chef in a kitchen, a scientist in a lab). The image should tell a story about their profession. Use a wide-angle lens effect to capture both the person and their surroundings.";
        case 'team_leader_shot':
          return "A confident and approachable portrait of a team leader or manager. The setting is a modern, collaborative office space, with team members subtly visible but blurred in the background. The subject is looking directly at the camera with a welcoming expression. Lighting is bright and professional.";
        
        // --- Branding & Marketing ---
        case 'social_media_influencer':
          return "A trendy, high-quality portrait suitable for a social media influencer's profile. The image should look authentic yet polished. The setting could be a stylish cafe, a colorful city wall, or a beautiful natural landscape. The lighting is bright and flattering. The overall vibe is aspirational and engaging.";
        case 'product_campaign':
          return "A commercial-style photo for a product campaign. The subject is interacting naturally with a generic, sleek, placeholder product (like a modern bottle or a small electronic device). The lighting is clean, commercial, and high-quality. The background is simple and doesn't distract from the person and product. The mood should align with a luxury, tech, or lifestyle brand.";
        case 'marketing_poster':
          return "Create a compelling marketing poster featuring the subject. The image should be dynamic and eye-catching. Integrate a clean, modern aesthetic with ample negative space where text could be added later by a graphic designer. The lighting is cinematic and the subject's pose is powerful and engaging. The background is abstract or a simple gradient that complements the subject.";
        case 'product_lifestyle_shoot_wide':
          return "A realistic, full-body lifestyle photo showing a person naturally using a generic product in a relatable setting (e.g., using a laptop in a cafe, listening to headphones on a walk). The focus is on authenticity and storytelling.";
        case 'behind_the_scenes':
          return "A candid, 'behind-the-scenes' style photograph of a creator, artist, or professional at work. The setting is their workspace (studio, workshop, office). The image should feel authentic and unstaged, capturing a moment of focus or creativity. Lighting should appear natural, like light coming from a window.";
        case 'customer_testimonial':
          return "A warm, genuine, and trustworthy portrait of a person as if they are giving a happy customer testimonial. They should be looking directly at the camera with a sincere smile. The background is a clean, simple home or office setting. Lighting is soft and flattering.";
        case 'brand_narrative_cinematic':
          return "A cinematic, true-to-life image that tells a story about the person's brand or journey. This could be a craftsperson in their workshop, an athlete training at dawn, or an entrepreneur looking over a city skyline. The color grading should be moody and evocative.";
          
        // --- Lifestyle & Editorial ---
        case 'magazine_cover_shoot':
          return "A high-fashion, editorial-style portrait worthy of a magazine cover like Vogue or GQ. The pose, clothing, and expression should be confident and powerful. The lighting is dramatic and professionally executed. The background is a clean studio or a highly aesthetic location. There should be negative space at the top for a magazine title.";
        case 'urban_street_style':
          return "A candid-style, full-body street style photograph. The subject is walking through a fashionable city street (like SoHo, NYC or Shoreditch, London), captured in motion. The outfit is stylish and contemporary. The lighting should feel natural but enhanced, as if captured by a professional street style photographer. The background shows the city environment with a shallow depth of field.";
        case 'golden_hour_portrait':
          return "A warm, beautiful outdoor portrait taken during the golden hour just before sunset. The lighting is soft, warm, and creates a beautiful glowing effect on the subject. The setting is a natural landscape like a field, beach, or park. The mood is serene, warm, and authentic.";
        case 'fitness_influencer':
          return "A dynamic and powerful portrait of a fitness influencer. The subject is wearing modern, athletic apparel. The setting is a stylish, modern gym or an outdoor training location (like a running track or scenic trail). The lighting highlights muscle definition and conveys energy and strength. The pose is active or a confident post-workout stance.";
        case 'travel_blogger_wide':
          return "A stunning, true-to-life photograph of a person in a breathtaking travel destination (e.g., overlooking a mountain range, standing on an ancient street). The person should be a small but significant part of the grander scene.";
        case 'gourmet_foodie':
          return "A vibrant, top-down or wide-angle shot of a person enjoying a beautifully plated meal at a rustic or high-end restaurant. The focus is on the colors and textures of the food and the person's genuine enjoyment. Natural, bright lighting.";
        case 'weekend_getaway_wide':
          return "A relaxed, candid, and true-to-life photo of a person enjoying a casual weekend activity. This could be reading in a hammock, walking a dog in a park, or sitting by a campfire. The mood is peaceful and authentic.";
        case 'urban_explorer':
          return "A dynamic, full-body action shot of a person exploring a vibrant and gritty urban environment. They could be crossing a busy street, leaning against a graffiti wall, or standing on a rooftop. The style is edgy and authentic.";
          
        // --- Creative Portraits ---
        case 'film_noir':
          return "A classic, black and white Film Noir style portrait. Use dramatic, low-key lighting with deep shadows (chiaroscuro). The subject should have a mysterious or contemplative expression. The setting could suggest a 1940s detective story, with elements like venetian blinds shadows or atmospheric smoke. The final image MUST be in black and white.";
        case 'cinematic_portrait':
          return "A hyper-realistic portrait with a strong cinematic feel. The image should look like a still from a movie. Use dramatic lighting, a shallow depth of field, and a widescreen aspect ratio crop (letterboxed). The color grading should be stylized (e.g., cool blue tones for a thriller, or warm orange and teal for a blockbuster). The expression and setting should tell a story.";
        case 'paparazzi_street_style':
          return "A candid, high-energy photograph of a celebrity being spotted by paparazzi on a city street at night. The subject is wearing stylish, chic street-wear and sunglasses. The lighting should be dominated by the harsh, direct flash of multiple cameras, creating strong highlights and deep shadows. The background should be a slightly blurred city scene to convey motion. The mood is glamorous and spontaneous.";
        case 'surrealist_dreamscape_wide':
          return "A fantastical, true-to-life portrait of the person within a surreal and dreamlike landscape, inspired by artists like Salvador Dalí or René Magritte. Think floating objects, impossible architecture, and symbolic elements. The lighting should be ethereal and otherworldly.";
        case 'cyberpunk_cityscape_wide':
          return "A vibrant, high-detail portrait of the person as a character in a futuristic, neon-drenched cyberpunk city. They are wearing futuristic fashion. The background is filled with towering holographic ads, flying vehicles, and rain-slicked streets.";
        case 'baroque_painting':
          return "Transform the person into the subject of a hyper-realistic Baroque painting. The style should emulate the dramatic lighting (chiaroscuro), rich color palette, and opulent textures of artists like Caravaggio or Rembrandt. The subject wears period-appropriate attire.";
        case 'double_exposure':
          return "An artistic, double-exposure portrait. The primary image is a silhouette or profile of the person, intricately blended with a second image of a natural landscape (e.g., a a forest, mountains, or a coastline). The effect should be seamless and poetic.";
        case 'underwater_portrait':
          return "An ethereal and serene, full-body portrait of the person floating gracefully in crystal-clear water. They are wearing flowing fabric that billows around them. Sunbeams pierce the water's surface, creating a magical, dreamlike effect.";

        // --- Model Photoshoots ---
        case 'swimsuit_beachwear':
          return "A professional, catalog-style swimsuit or beachwear photoshoot. The setting is a beautiful, sunny beach with clear blue water or a high-end resort pool. The lighting is bright and flattering, typical of a fashion magazine. The pose should be confident and model-like. The image should be high-resolution and polished.";
        case 'dramatic_studio_portrait':
          return "A moody and artistic professional studio portrait. The mood is powerful, sophisticated, and contemplative. The subject wears elegant, classic, or high-fashion attire. Emphasize the interplay of light and shadow (chiaroscuro) to create a dramatic, sculptural effect. The background is a minimalist dark studio setting. The final image should have the quality of a gallery photograph or a high-end magazine feature.";
        case 'high_fashion_street_style_full':
          return "A full-body, high-fashion street style photograph. The subject is dressed in avant-garde or designer clothing, posing dynamically in a gritty, urban environment. The lighting should be dramatic, as if from a professional photoshoot. The attitude is confident and powerful, suitable for an editorial in a fashion magazine.";
        case 'fitness_athleisure_full':
          return "A powerful, full-body shot for a fitness or athleisure brand campaign. The subject wears modern, high-quality athletic apparel. The setting is a minimalist gym with dramatic lighting, or an inspiring outdoor location. The pose is athletic, showcasing strength and flexibility. The image should be sharp, high-contrast, and energetic.";
        case 'ecommerce_catalog':
          return "A clean, professional e-commerce catalog photo. The subject is modeling clothing in a full-body shot against a seamless, neutral background (light gray or off-white). The lighting is even and shadowless, ensuring the product is clearly visible. The pose is a standard, neutral model pose.";
        case 'vogue_editorial_spread_wide':
          return "A high-fashion editorial photo suitable for a magazine like Vogue. The subject wears avant-garde clothing in a stark, minimalist, or architecturally interesting location. Poses are powerful, unconventional, and artistic. The lighting is dramatic and professionally executed.";
        case 'beach_glamour_full':
          return "A sensual and glamorous full-body photoshoot on a secluded beach at golden hour. The subject wears elegant, flowing beachwear or a sophisticated swimsuit. The mood is alluring and luxurious. The warm, soft light of the setting sun enhances the scene. The final image is a high-end, magazine-quality shot.";
        case 'after_hours_glamour':
          return "A sophisticated and sensual photoshoot for a luxury brand. The setting is a beautifully decorated, high-end hotel suite or private boudoir at dusk. The subject wears elegant and glamorous nightwear, like a silk robe, a satin slip dress, or a chic pajama set. The mood is intimate, confident, and alluring, but always tasteful and elegant. Lighting is soft and warm, perhaps from table lamps or moonlight through a window, creating a romantic and exclusive atmosphere.";
        case 'midnight_rider_fashion':
          return "A powerful, high-fashion editorial shot featuring the subject in a bold, form-fitting outfit made of shiny black material like latex, vinyl, or leather. The setting is a gritty, rain-slicked urban street at night, illuminated by neon signs and streetlights. The mood is confident, edgy, and mysterious. The final image should be sharp, high-contrast, and look like a page from a cutting-edge fashion magazine.";
          
        // --- Urban & Hip ---
        case 'hip_hop_fashion':
          return "A high-energy, full-body fashion photograph in a 90s or early 2000s hip-hop music video style. The subject wears stylish streetwear like baggy jeans, oversized jackets, bold logos, and sneakers. The setting is a gritty, vibrant urban environment, like a graffiti-covered wall, a basketball court, or under a city bridge. The lighting is dynamic and slightly dramatic. The attitude is confident and cool.";
        case 'grown_sexy_night_out':
          return "A sophisticated and alluring 'grown and sexy' style photograph. The subject is dressed in elegant, stylish evening wear. The setting is an upscale, dimly lit location like a high-end lounge, a chic restaurant, or a hotel bar with city views. The mood is intimate, confident, and romantic. Lighting is soft and moody, creating a sense of luxury and allure.";
        case 'nightclub_vip':
          return "An energetic and glamorous photograph taken in a high-end nightclub. The subject is in a VIP section, looking confident and stylish. The lighting is dynamic and colorful, with neon glows, light trails, and lens flares typical of a club environment. The mood is exciting, exclusive, and full of energy.";
        case 'urban_glamour_shot':
          return "A high-fashion glamour shot with an urban twist. The subject wears a glamorous, chic outfit, juxtaposed against a raw, urban city background (e.g., fire escape, rooftop, industrial area). The lighting is professional and dramatic, like an editorial photoshoot for a magazine. The final image is a polished, striking blend of high-fashion elegance and street-style edge.";

        // --- Holiday & Events ---
        case 'birthday_celebration':
          return "A joyful and vibrant birthday celebration photo. The subject is the center of attention, smiling and happy. The scene is festive, filled with balloons, confetti, and perhaps a birthday cake with candles. The lighting is bright and celebratory. The mood is pure happiness and fun.";
        case 'christmas_family_portrait':
          return "A warm and cozy Christmas family portrait. The subjects are wearing festive attire, like ugly Christmas sweaters or coordinated outfits. They are gathered in a festively decorated living room with a decorated Christmas tree and warm, glowing lights in the background. The mood is joyful, loving, and full of holiday spirit.";
        case 'new_years_eve_party':
          return "A glamorous and celebratory photo from a New Year's Eve party. The subjects are dressed in formal or festive party attire. The scene is full of energy, with confetti falling, champagne glasses, and a backdrop suggesting a countdown to midnight (like a clock or city skyline). The mood is exciting, hopeful, and full of celebration.";
          
        // --- Group Portraits (Family, Friends, Teams) ---
        case 'family_beach_portrait':
          return "A beautiful, candid family portrait on a sunny beach during the golden hour. The family is interacting happily, perhaps walking along the shore or laughing together. The lighting is warm and glowing. The final image should feel natural, joyful, and full of emotion.";
        case 'romantic_couple_paris':
          return "A romantic and elegant photograph of a couple in Paris. They are dressed stylishly. The Eiffel Tower or a charming Parisian street is visible but softly blurred in the background. The mood is intimate and timeless, like a scene from a classic romance film.";
        case 'cozy_family_at_home':
          return "A heartwarming and cozy photo of a family relaxing together in their beautifully lit, comfortable living room. They could be reading a book, playing a game, or simply enjoying each other's company. The lighting is soft and natural, coming from a window. The overall feeling is one of warmth, love, and togetherness.";
        case 'formal_family_studio':
          return "A classic, formal studio portrait of a well-dressed family. The subjects are posed elegantly against a neutral, seamless backdrop (e.g., dark gray, olive green). The lighting is professional studio lighting, creating a timeless and sophisticated image suitable for a prominent display in a home.";
        case 'adventurous_couple_hiking':
          return "A dynamic, wide-angle shot of an adventurous couple hiking in a stunning mountain landscape. They are wearing appropriate hiking gear and are captured in motion, conveying a sense of adventure and shared experience. The scenery is majestic and an integral part of the photo.";
        case 'urban_couple_street_style':
          return "A stylish, candid-style street photograph of a fashion-forward couple in a vibrant city environment. They are walking, talking, or laughing together. The background is a bustling city street with interesting architecture or graffiti. The image has a modern, editorial feel, as if shot for a fashion blog.";
        case 'corporate_team_photo':
            return "A professional, polished corporate team photo. The group is dressed in modern business attire. The setting is a bright, clean, high-end office board room or lobby. Lighting is professional and even. Poses are confident and approachable. The final image should be suitable for a company's 'About Us' page.";
        case 'startup_team_casual':
            return "A casual and approachable group portrait of a startup team. The team wears smart-casual attire (e.g., branded t-shirts, jeans, blazers). The setting is a modern, creative workspace or co-working office. The mood is collaborative, innovative, and energetic. Poses are natural and interactive.";
        case 'friends_night_out':
            return "A fun, dynamic, and candid-style group photo of friends enjoying a night out. The setting could be a stylish bar, a bustling city street at night with neon lights, or a lively concert. The mood is energetic, happy, and full of genuine connection. The lighting should reflect the environment, feeling vibrant and spontaneous.";
        case 'sports_team_portrait':
            return "A powerful and dynamic group portrait of a sports team. The team wears their official uniforms. The setting is their home field, court, or a studio with dramatic lighting. Poses are strong, confident, and unified, conveying teamwork and determination. The lighting is high-contrast and cinematic.";

        default:
          return `Apply a professional, realistic, and high-quality '${style.name}' style to the image. Ensure the composition and lighting are executed to a studio-quality standard.`;
      }
};

export const generateProfilePic = async (
  imageFiles: File[],
  options: { style?: StyleOption; customPrompt?: string; aspectRatio?: '1:1' | '16:9', negativePrompt?: string },
  keepLikeness: boolean,
  userEmail: string
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  try {
    const aspectRatio = options.aspectRatio || '1:1';
    
    if (!imageFiles.length) {
      throw new Error("No image file provided.");
    }

    const imageParts = await Promise.all(
      imageFiles.map(async (file) => {
        const base64ImageData = await fileToBase64(file);
        return {
          inlineData: {
            data: base64ImageData,
            mimeType: file.type,
          },
        };
      })
    );

    const likenessInstruction = keepLikeness
      ? "EXTREMELY HIGH PRIORITY: The generated face MUST be a photorealistic, identical match to the person in the reference photo. Do not change the person's identity in any way. Every facial feature—including the exact shape of the eyes, nose, mouth, jawline, and unique facial markers—must be preserved with 100% accuracy. This is a likeness-critical task. The output must look exactly like the person provided."
      : "Maintain a strong and recognizable likeness to the person in the photo. While you can adapt the features to the artistic style, the final person must still be clearly identifiable as the individual from the reference image.";

    let styleInstruction = '';
    let compositionInstruction = "Generate a portrait. While front-facing portraits are preferred (aim for roughly 3 out of 5 generations to be front-facing), feel free to explore other angles like side profiles or three-quarter views to create a dynamic and interesting image. Variety in composition is encouraged.";

    if (aspectRatio === '16:9') {
        compositionInstruction = "Generate a wide, landscape-oriented image. This format is ideal for full-body shots or environmental portraits that show the subject within a larger scene. Capture the person from head to toe where appropriate for the style.";
    }

    if (options.customPrompt) {
        styleInstruction = options.customPrompt;
    } else if (options.style) {
        styleInstruction = getStyleInstruction(options.style);
        switch (options.style.id) {
            case 'corporate_ceo':
            case 'tech_founder':
            case 'actors_headshot_dramatic':
            case 'actors_headshot_commercial':
              compositionInstruction = "Create a professional headshot, focusing from the chest up.";
              break;
            case 'environmental_portrait_wide':
              compositionInstruction = "This is a 16:9 wide-angle shot. Capture the subject from head-to-toe or waist-up, interacting naturally with their environment. The background is an essential part of the story. Cinematic, natural lighting is key.";
              break;
             case 'brand_narrative_cinematic':
              compositionInstruction = "A 16:9 wide-angle, cinematic composition is mandatory. Use leading lines, rule of thirds, and a shallow depth of field to create a movie-still look. The subject should be captured head-to-toe within the scene.";
              break;
             case 'travel_blogger_wide':
               compositionInstruction = "A mandatory 16:9 wide-angle landscape shot. The person should be captured head-to-toe, often from a distance, to emphasize the scale and beauty of the location. The composition should follow principles of landscape photography.";
               break;
        }
    } else {
      throw new Error("A style or custom prompt is required for generation.");
    }
    
    let negativeConstraints = "The output MUST NOT contain any text, watermarks, logos, or extra UI elements. Do not duplicate limbs or faces. Avoid distorted or unnatural body parts.";
    if (options.negativePrompt) {
        negativeConstraints += ` Avoid the following: ${options.negativePrompt}.`;
    }

    const textPart = {
        text: `Task: Generate a single, professional, high-quality, hyper-realistic, 8k image with sharp focus and cinematic lighting.
  Reference: Use the provided image(s) as the primary reference for the person's face and likeness.
  Style: ${styleInstruction}
  Likeness: ${likenessInstruction}
  Composition: ${compositionInstruction}
  Negative Constraints: ${negativeConstraints}
  Output requirements: The output must be ONLY the image. The final image's aspect ratio MUST be exactly ${aspectRatio}.`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [...imageParts, textPart],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const generatedImages: string[] = [];
    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
            generatedImages.push(imageUrl);
            await addMedia(userEmail, 'image', imageUrl);
            break; 
          }
        }
    }

    if (generatedImages.length === 0) {
      let textResponse = '';
      if (response.candidates && response.candidates.length > 0) {
          textResponse = response.text
      }
      console.error("API did not return an image. Text response:", textResponse || "No text response.");
      
      throw new Error("API did not return an image. The model may have refused the request due to safety policies or prompt misunderstanding.");
    }
    
    return generatedImages;

  } catch (err) {
    throw handleApiError(err);
  }
};

export const generateGroupPhoto = async (
  imageFiles: File[],
  options: { style?: StyleOption; customPrompt?: string; aspectRatio: '1:1' | '16:9' },
  keepLikeness: boolean,
  userEmail: string
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  try {
    const aspectRatio = options.aspectRatio || '1:1';
    const peopleCount = imageFiles.length;

    if (peopleCount < 2) {
      throw new Error("Group photo generation requires at least 2 images.");
    }

    const imageParts = await Promise.all(
      imageFiles.map(async (file) => {
        const base64ImageData = await fileToBase64(file);
        return {
          inlineData: {
            data: base64ImageData,
            mimeType: file.type,
          },
        };
      })
    );

    const likenessInstruction = keepLikeness
      ? `Your primary objective is perfect facial replication. Replicate the faces from the reference photos with MAXIMUM, 100% photorealistic accuracy. Each person in the generated photo MUST be an EXACT match to their reference image.
- **DO NOT CHANGE FACES:** Do not alter facial structures (jawline, nose, eyes, mouth). Every unique facial feature and marker must be preserved.
- **NO BLENDING:** Do not average, blend, or mix features between the different people provided. Each person is a distinct entity.
- **ABSOLUTE PRIORITY:** The success of this task is 100% dependent on the perfect, identical recreation of each person's face. This is not an artistic interpretation of the face; it is a technical replication.`
      : "Maintain a strong and recognizable likeness to the people in the photos. While you can adapt the features to the artistic style, the final people must still be clearly identifiable as the individuals from the reference images.";

    let styleInstruction = '';
    if (options.customPrompt) {
        styleInstruction = options.customPrompt;
    } else if (options.style) {
        const baseStyleInstruction = getStyleInstruction(options.style);
        const groupContext = `This is a group photo of ${peopleCount} people (e.g., a couple, family, or friends). Adapt the following style for a group shot where the subjects are interacting naturally with each other or with the camera. Style: `;
        styleInstruction = groupContext + baseStyleInstruction;
    } else {
        throw new Error("A style or custom prompt is required for group photo generation.");
    }

    let compositionInstruction = "Generate a photo of the group. Composition should be natural and engaging. For example, some people might be looking at the camera, while others interact with each other. Create a sense of connection between the subjects.";
    if (options.aspectRatio === '16:9') {
        compositionInstruction = "Generate a wide, landscape-oriented group photo. This format is ideal for full-body shots or environmental portraits that show the group within a larger scene.";
    }

    const negativeConstraints = "The output MUST NOT contain any text, watermarks, logos, or extra UI elements. Do not duplicate limbs or faces. Avoid distorted or unnatural body parts.";

    const textPart = {
        text: `
**Primary Goal:** Create a single, cohesive, hyper-realistic 8k group photograph featuring **exactly ${peopleCount} distinct individuals.**

**Step-by-Step Instructions:**

**1. Identify Individuals:** You have been provided with ${peopleCount} reference images. Each image represents **one unique person**. Let's label them Person 1, Person 2, ..., Person ${peopleCount}.

**2. Recreate Faces with 100% Accuracy:** This is the most critical step. For each individual in the final group photo, their face and identity **MUST be an EXACT, photorealistic match** to their corresponding reference image.
    - **Likeness Mandate:** ${likenessInstruction}
    - **Verification:** Before outputting, mentally check: "Does the face of Person 1 in my generated image look *exactly* like the person in the first reference photo? Does Person 2 match the second photo?" and so on for all ${peopleCount} people. Any deviation is a failure.

**3. Apply Scene and Style:** Place these perfectly recreated individuals into a scene that matches the following style.
    - **Style:** ${styleInstruction}
    - **Interaction:** The individuals should be positioned and posed naturally within the scene, interacting with each other or the camera as appropriate for the style.

**4. Composition:**
    - **Arrangement:** ${compositionInstruction}
    - **Aspect Ratio:** The final image's aspect ratio **MUST be exactly ${aspectRatio}**.

**5. Final Checks & Constraints:**
    - **Headcount:** The final image must contain **exactly ${peopleCount} people**. No more, no less.
    - **Negative Constraints:** ${negativeConstraints}
    - **Output:** The output must be **ONLY the generated image**. Do not include any text, descriptions, or commentary.
`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [...imageParts, textPart],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const generatedImages: string[] = [];
    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
            generatedImages.push(imageUrl);
            await addMedia(userEmail, 'image', imageUrl);
            break; // We only expect one image for now
          }
        }
    }

    if (generatedImages.length === 0) {
      let textResponse = '';
      if (response.candidates && response.candidates.length > 0) {
          textResponse = response.text
      }
      console.error("API did not return an image. Text response:", textResponse || "No text response.");
      
      throw new Error("API did not return an image. The model may have refused the request due to safety policies or prompt misunderstanding.");
    }
    
    return generatedImages;

  } catch (err) {
    throw handleApiError(err);
  }
};


export const generateVideo = async (
  request: { videoType: 'animate' | 'scene', files: File[], prompt: string },
  userEmail: string,
  onProgress: (message: string) => void
): Promise<Blob> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  try {
    onProgress("Preparing your request...");
    
    let fullPrompt: string;
    let imagePayload: { imageBytes: string, mimeType: string } | undefined = undefined;
    
    if (request.files.length > 0) {
        const imageFile = request.files[0];
        const base64ImageData = await fileToBase64(imageFile);
        imagePayload = {
            imageBytes: base64ImageData,
            mimeType: imageFile.type,
        };
    }

    if (request.videoType === 'animate') {
        if (!imagePayload) {
            throw new Error("An image is required for animation.");
        }
        fullPrompt = `Task: Animate the person in the provided photo to create a short, realistic video clip. The person should appear to be speaking the following line: "${request.prompt}". Focus on creating natural, subtle mouth movements that are synchronized with the words. The person's identity, facial features, and expression should be preserved as closely as possible. The background should remain static. The video should be a close-up shot, similar to a video call.`;
    } else { // 'scene'
        fullPrompt = request.prompt;
    }
    
    onProgress("Sending request to the video model...");
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: fullPrompt,
      image: imagePayload,
      config: {
        numberOfVideos: 1,
      }
    });

    onProgress("Video generation in progress... This may take several minutes.");
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
      onProgress("Checking video status...");
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    onProgress("Finalizing video...");
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation succeeded, but no download link was returned.");
    }
    
    onProgress("Downloading generated video...");
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to download video file. Status: ${response.status}`);
    }

    const videoBlob = await response.blob();
    
    await addMedia(userEmail, 'video', videoBlob);

    return videoBlob;
  } catch (err) {
    throw handleApiError(err);
  }
};


export const generateAdCreative = async (
  options: {
    projectType: 'event_flyer',
    textContent: { [key: string]: string },
    styleDescription: string,
    logoFile?: File,
    aspectRatio: '9:16',
  },
  userEmail: string
): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

  try {
    let imageParts = [];
    if (options.logoFile) {
        const base64LogoData = await fileToBase64(options.logoFile);
        imageParts.push({
          inlineData: {
            data: base64LogoData,
            mimeType: options.logoFile.type,
          },
        });
    }

    const textContentString = Object.entries(options.textContent)
        .map(([key, value]) => `- ${key.replace(/_/g, ' ')}: "${value}"`)
        .join('\n');
    
    const logoInstruction = options.logoFile
      ? "You have been provided with a company logo. You MUST place this logo cleanly and legibly on the flyer, typically at the bottom or top."
      : "No logo has been provided.";

    const textPart = {
        text: `
**Task:** You are a professional graphic designer. Create a visually stunning, print-ready event flyer based on the following creative brief.

**Creative Brief:**
- **Project Type:** ${options.projectType.replace('_', ' ')}
- **Visual Style:** ${options.styleDescription}
- **Aspect Ratio:** ${options.aspectRatio} (Portrait orientation for a flyer)

**Text Content to Include:**
The following text elements MUST be clearly legible on the flyer. Use a professional font hierarchy (e.g., large headline, smaller details).
${textContentString}

**Logo Integration:**
${logoInstruction}

**Step-by-Step Generation Process:**
1.  **Generate Background:** First, create a beautiful, high-quality background image that perfectly matches the 'Visual Style' description. This background MUST NOT contain any text. It should have clean areas where text can be placed on top without compromising readability.
2.  **Overlay Text and Logo:** After creating the background, composite the text elements and the provided logo (if any) on top of it. Ensure the text is readable, well-placed, and follows graphic design principles (hierarchy, alignment, contrast).
3.  **Final Output:** The final output must be a single, complete flyer image with both the background and the overlaid elements, conforming to the ${options.aspectRatio} aspect ratio.

**Negative Constraints:** Do not add any text that wasn't provided in the 'Text Content' section. Do not distort the logo. Ensure all text is spelled correctly as provided. The output must be ONLY the final flyer image.
`,
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [...imageParts, textPart],
      },
      config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const generatedImages: string[] = [];
    if (response.candidates && response.candidates.length > 0) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
            generatedImages.push(imageUrl);
            await addMedia(userEmail, 'image', imageUrl);
            break; // We only expect one image for now
          }
        }
    }

    if (generatedImages.length === 0) {
      let textResponse = '';
      if (response.candidates && response.candidates.length > 0) {
          textResponse = response.text;
      }
      console.error("API did not return an image. Text response:", textResponse || "No text response.");
      throw new Error("API did not return an image. The model may have refused the request due to safety policies or prompt misunderstanding.");
    }

    return generatedImages;

  } catch (err) {
    throw handleApiError(err);
  }
};
