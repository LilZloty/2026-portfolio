import { NextRequest, NextResponse } from 'next/server';
import { validateAdminAuth } from '@/lib/admin-auth';
import * as fs from 'fs';
import * as path from 'path';
import slugify from 'slugify';

/**
 * Generate hero images for blog posts using Fal AI
 * 
 * Requires FAL_KEY environment variable
 * Uses @fal-ai/client already in package.json
 */

interface ImageRequest {
  title: string;
  description?: string;
  style?: 'modern' | 'minimal' | 'abstract' | 'tech';
}

export async function POST(request: NextRequest) {
  try {
    const auth = validateAdminAuth(request);
    if (!auth.valid) {
      return auth.error;
    }

    const falKey = process.env.FAL_KEY;
    if (!falKey) {
      return NextResponse.json(
        { error: 'FAL_KEY not configured. Set up Fal AI at https://fal.ai' },
        { status: 500 }
      );
    }

    const body: ImageRequest = await request.json();
    const { title, description, style = 'modern' } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Build image prompt based on style
    const stylePrompts = {
      modern: 'Clean, professional, gradient background, subtle geometric shapes',
      minimal: 'Minimalist, white space, simple shapes, elegant typography',
      abstract: 'Abstract art, flowing shapes, vibrant colors, creative composition',
      tech: 'Technology themed, digital elements, code snippets, futuristic',
    };

    const imagePrompt = `Blog hero image for article titled "${title}". 
${description ? `Article description: ${description}.` : ''}
Style: ${stylePrompts[style]}.
Requirements: No text overlays, professional quality, 16:9 aspect ratio, suitable for web header.
Do NOT include any text or words in the image.`;

    // Call Fal AI API
    const response = await fetch('https://queue.fal.run/fal-ai/flux/schnell', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${falKey}`,
      },
      body: JSON.stringify({
        prompt: imagePrompt,
        image_size: 'landscape_16_9',
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fal AI error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate image: ' + errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Handle async queue response
    if (data.request_id) {
      // Poll for result
      let result = null;
      let attempts = 0;
      const maxAttempts = 30;
      
      while (!result && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const statusRes = await fetch(`https://queue.fal.run/fal-ai/flux/schnell/requests/${data.request_id}/status`, {
          headers: { 'Authorization': `Key ${falKey}` },
        });
        
        const status = await statusRes.json();
        
        if (status.status === 'COMPLETED') {
          const resultRes = await fetch(`https://queue.fal.run/fal-ai/flux/schnell/requests/${data.request_id}`, {
            headers: { 'Authorization': `Key ${falKey}` },
          });
          result = await resultRes.json();
        } else if (status.status === 'FAILED') {
          return NextResponse.json(
            { error: 'Image generation failed' },
            { status: 500 }
          );
        }
        
        attempts++;
      }
      
      if (!result) {
        return NextResponse.json(
          { error: 'Image generation timed out' },
          { status: 504 }
        );
      }
      
      data.images = result.images;
    }

    // Get the image URL
    const imageUrl = data.images?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image generated' },
        { status: 500 }
      );
    }

    // Download and save the image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    
    const slug = slugify(title, { lower: true, strict: true });
    const filename = `${slug}-${Date.now()}.webp`;
    const imagePath = path.join(process.cwd(), 'public', 'images', 'blog', filename);
    
    // Ensure directory exists
    const imageDir = path.dirname(imagePath);
    if (!fs.existsSync(imageDir)) {
      fs.mkdirSync(imageDir, { recursive: true });
    }
    
    fs.writeFileSync(imagePath, imageBuffer);
    
    const publicPath = `/images/blog/${filename}`;

    return NextResponse.json({
      success: true,
      imagePath: publicPath,
      imageUrl,
      prompt: imagePrompt,
    });
  } catch (error) {
    console.error('Generate image error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}
