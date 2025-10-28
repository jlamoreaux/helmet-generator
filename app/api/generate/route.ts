import { NextRequest, NextResponse } from "next/server";
import Replicate from "replicate";
import { checkDevAssets, saveUploadedImageForDev } from "../../lib/devBypassServer";

type UrlStream = {
  href: string;
  pathname: string;
}

type HelmetResponse = Array<ImageResponse>;

type ImageResponse = {url: () => UrlStream}

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: NextRequest) {
  try {
    const { imageData, description } = await request.json();

    if (!imageData || !description) {
      return NextResponse.json(
        { error: "Image data and description are required" },
        { status: 400 }
      );
    }

    // Check if we should bypass AI generation with dev assets
    const devAssets = await checkDevAssets();
    
    if (devAssets.shouldBypass) {
      
      // Save uploaded image for dev consistency if needed
      const savedFaceImage = await saveUploadedImageForDev(imageData);
      
      return NextResponse.json({
        helmetUrl: devAssets.availableAssets.helmetImage,
        faceImageUrl: savedFaceImage || devAssets.availableAssets.faceImage,
        faceDepthMapUrl: devAssets.availableAssets.faceDepthMap || null,
        helmetDepthMapUrl: devAssets.availableAssets.helmetDepthMap || null,
        devBypass: true,
        devReason: devAssets.reason
      });
    }


    // Get model configurations
    const backgroundRemovalModel = process.env.REPLICATE_BACKGROUND_REMOVAL_MODEL;
    const helmetModel = process.env.REPLICATE_HELMET_MODEL as `${string}/${string}` | `${string}/${string}:${string}`;
    const depthModel = process.env.REPLICATE_DEPTH_MODEL;

    if (!backgroundRemovalModel) {
      throw new Error("Background removal model not configured. Please check your environment variables.");
    }
    if (!helmetModel) {
      throw new Error("Helmet generation model not configured. Please check your environment variables.");
    }

    // STEP 1 & 2: Run face background removal and helmet generation in parallel
    
    const helmetPrompt = `A ${description}, front view, head-on perspective, centered, professional product photography, high quality, detailed, realistic, studio lighting, transparent background, isolated on transparent background, facing forward directly, clean visor with no reflections, clear visor surface`;
    
    const [faceRemovalResult, helmetGenerationResult] = await Promise.allSettled([
      // Face background removal
      replicate.run(
        backgroundRemovalModel as `${string}/${string}` | `${string}/${string}:${string}`,
        {
          input: {
            image: imageData,
          },
        }
      ),
      // Helmet generation
      replicate.run(
        helmetModel,
        {
          input: {
            prompt: helmetPrompt,
            negative_prompt: "side view, profile, angled, tilted, blurry, low quality, distorted, cartoon, anime, back view, visor reflections, reflection in visor, mirrored visor, reflective surface, background elements, people in reflection, objects in reflection, text in reflection",
            width: 1024,
            height: 1024,
          },
        }
      )
    ]);

    // Process face background removal result
    let processedFaceImageData: string;
    if (faceRemovalResult.status === 'fulfilled') {
      try {
        const faceRemovalOutput = faceRemovalResult.value as ImageResponse;
        processedFaceImageData = faceRemovalOutput.url().href;
      } catch (error: any) {
        console.error("Face background removal processing failed:", error);
        throw new Error(`Failed to process background removal result: ${error.message || 'Unknown error'}`);
      }
    } else {
      console.error("Face background removal failed:", faceRemovalResult.reason);
      throw new Error(`Failed to remove background from your photo: ${faceRemovalResult.reason?.message || 'Unknown error'}. Please try with a different image.`);
    }

    // Process helmet generation result
    let processedHelmetImageUrl: string;
    if (helmetGenerationResult.status === 'fulfilled') {
      try {
        const helmetOutput = helmetGenerationResult.value as HelmetResponse;
        processedHelmetImageUrl = helmetOutput[0].url().href;
      } catch (error: any) {
        console.error("Helmet generation processing failed:", error);
        throw new Error(`Failed to process helmet generation result: ${error.message || 'Unknown error'}`);
      }
    } else {
      console.error("Helmet generation failed:", helmetGenerationResult.reason);
      throw new Error(`Failed to generate helmet: ${helmetGenerationResult.reason?.message || 'Unknown error'}. Please try a different description or try again later.`);
    }

    // STEP 2: Remove background from helmet image
    let processedHelmetImageData: string;
    try {
      const helmetRemovalOutput = await replicate.run(
        backgroundRemovalModel as `${string}/${string}` | `${string}/${string}:${string}`,
        {
          input: {
            image: processedHelmetImageUrl,
          },
        }
      ) as ImageResponse;
      
      processedHelmetImageData = helmetRemovalOutput.url().href;
    } catch (error: any) {
      console.error("Helmet background removal failed:", error);
      throw new Error(`Failed to remove background from helmet: ${error.message || 'Unknown error'}. Please try again.`);
    }

    // STEP 3: Generate depth maps in parallel (now that we have both clean images)
    
    let faceDepthOutput = null;
    let helmetDepthOutput = null;
    
    if (depthModel) {
      
      const [faceDepthResult, helmetDepthResult] = await Promise.allSettled([
        // Face depth map
        replicate.run(
          depthModel as `${string}/${string}` | `${string}/${string}:${string}`,
          {
            input: {
              image: processedFaceImageData,
            },
          }
        ) as Promise<ImageResponse>,
        // Helmet depth map
        replicate.run(
          depthModel as `${string}/${string}` | `${string}/${string}:${string}`,
          {
            input: {
              image: processedHelmetImageData,
            },
          }
        ) as Promise<ImageResponse>
      ]);

      // Process face depth map result
      if (faceDepthResult.status === 'fulfilled') {
        try {
          const faceDepthData = faceDepthResult.value;

          faceDepthOutput = faceDepthData.url().href;

          
          
          
          // if (typeof faceDepthData === 'string') {
          //   faceDepthOutput = faceDepthData;
          // } else if (Array.isArray(faceDepthData) && faceDepthData.length > 0) {
          //   faceDepthOutput = faceDepthData[0];
          // } else if (faceDepthData) {
          //   const results = [];
          //   for await (const chunk of faceDepthData as any) {
          //     results.push(chunk);
          //   }
          //   if (results.length > 0 && results[0] instanceof Uint8Array) {
          //     const uint8Array = results[0] as Uint8Array;
          //     const base64 = Buffer.from(uint8Array).toString('base64');
          //     faceDepthOutput = `data:image/png;base64,${base64}`;
          //   }
          // }
        } catch (error: any) {
          console.warn("❌ Face depth map processing failed:", error);
        }
      } else {
        console.warn("❌ Face depth map generation failed:", faceDepthResult.reason);
      }

      // Process helmet depth map result
      if (helmetDepthResult.status === 'fulfilled') {
        try {
          const helmetDepthData = helmetDepthResult.value;

          helmetDepthOutput = helmetDepthData.url().href;

          
          
          // if (typeof helmetDepthData === 'string') {
          //   helmetDepthOutput = helmetDepthData;
          // } else if (Array.isArray(helmetDepthData) && helmetDepthData.length > 0) {
          //   helmetDepthOutput = helmetDepthData[0];
          // } else if (helmetDepthData && typeof helmetDepthData === 'object') {
          //   const results = [];
          //   for await (const chunk of helmetDepthData as any) {
          //     results.push(chunk);
          //   }
          //   if (results.length > 0 && results[0] instanceof Uint8Array) {
          //     const uint8Array = results[0] as Uint8Array;
          //     const base64 = Buffer.from(uint8Array).toString('base64');
          //     helmetDepthOutput = `data:image/png;base64,${base64}`;
          //   }
          // }
        } catch (error: any) {
          console.warn("❌ Helmet depth map processing failed:", error);
        }
      } else {
        console.warn("❌ Helmet depth map generation failed:", helmetDepthResult.reason);
      }
    } else {
    }



    // Debug: Log the response data before sending
    const responseData = {
      helmetUrl: processedHelmetImageData,
      faceImageUrl: processedFaceImageData,
      faceDepthMapUrl: faceDepthOutput,
      helmetDepthMapUrl: helmetDepthOutput,
    };

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error generating helmet:", error);
    
    // Return the specific error message if it's already user-friendly
    let errorMessage = error.message || "Failed to generate helmet";
    
    // Handle specific Replicate API errors
    if (error.message?.includes("version") || error.message?.includes("permission")) {
      errorMessage = "Model not available. Please check your Replicate configuration or try again later.";
    } else if (error.message?.includes("timeout")) {
      errorMessage = "Generation timed out. The AI model may be starting up - please try again in a moment.";
    } else if (error.message?.includes("rate limit")) {
      errorMessage = "Too many requests. Please wait a moment and try again.";
    } else if (error.message?.includes("credit") || error.message?.includes("quota")) {
      errorMessage = "Insufficient API credits. Please check your Replicate account.";
    } else if (error.message?.includes("404") || error.message?.includes("not found")) {
      errorMessage = "AI model not found. Please check the model configuration.";
    } else if (!error.message?.includes("Failed to")) {
      // If it's not already a user-friendly message, make it generic
      errorMessage = `Generation failed: ${errorMessage}. Please try again or contact support if the problem persists.`;
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        type: "generation_error",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}