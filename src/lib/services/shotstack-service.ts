'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ShotstackService {
  createVideo: (
    script: string, 
    voiceoverUrl: string, 
    mediaAssets: string[]
  ) => Promise<{ success: boolean; videoUrl?: string; error?: string }>;
  getVideoStatus: (renderId: string) => Promise<{ success: boolean; status?: string; url?: string; error?: string }>;
}

export default function useShotstackService(): ShotstackService {
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch the API key from Supabase
  const getApiKey = async (): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('keys')
        .single();
      
      if (error) throw error;
      
      // Decrypt the key (in a real app, this would be more secure)
      const encryptedKey = data?.keys?.shotstack;
      if (!encryptedKey) throw new Error('Shotstack API key not found');
      
      // Simple decryption (for demo purposes)
      return atob(encryptedKey);
    } catch (error) {
      console.error('Error fetching Shotstack API key:', error);
      throw new Error('Failed to retrieve Shotstack API key');
    }
  };

  // Function to create a video using Shotstack
  const createVideo = async (
    script: string, 
    voiceoverUrl: string, 
    mediaAssets: string[]
  ): Promise<{ success: boolean; videoUrl?: string; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Get the API key
      const apiKey = await getApiKey();
      
      // Parse the script to extract timestamps and visuals
      const scenes = parseScript(script, mediaAssets);
      
      // Create the Shotstack timeline
      const timeline = {
        soundtrack: {
          src: voiceoverUrl,
          effect: "fadeIn"
        },
        background: "#000000",
        tracks: [
          {
            clips: scenes
          }
        ]
      };
      
      // Create the Shotstack edit
      const edit = {
        timeline: timeline,
        output: {
          format: "mp4",
          resolution: "1080p",
          aspectRatio: "9:16" // Vertical video for TikTok/YouTube Shorts
        }
      };
      
      // Make the API call to Shotstack
      const response = await fetch('https://api.shotstack.io/v1/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify(edit)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create video');
      }
      
      const data = await response.json();
      
      // Return the render ID which can be used to check status
      return {
        success: true,
        videoUrl: data.response.id // This is actually the render ID, not the URL
      };
    } catch (error: any) {
      console.error('Error creating video:', error);
      return {
        success: false,
        error: error.message || 'Failed to create video'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check the status of a video render
  const getVideoStatus = async (renderId: string): Promise<{ success: boolean; status?: string; url?: string; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Get the API key
      const apiKey = await getApiKey();
      
      // Make the API call to Shotstack
      const response = await fetch(`https://api.shotstack.io/v1/render/${renderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get video status');
      }
      
      const data = await response.json();
      
      return {
        success: true,
        status: data.response.status,
        url: data.response.url
      };
    } catch (error: any) {
      console.error('Error getting video status:', error);
      return {
        success: false,
        error: error.message || 'Failed to get video status'
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to parse the script and create scenes
  const parseScript = (script: string, mediaAssets: string[]) => {
    // This is a simplified implementation
    // In a real app, you would parse the script more thoroughly
    
    const lines = script.split('\n').filter(line => line.trim() !== '');
    const scenes = [];
    let currentAssetIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line contains a timestamp
      if (line.includes('[') && line.includes(']')) {
        // Extract the timestamp
        const timestampMatch = line.match(/\[(\d+):(\d+)\]/);
        if (timestampMatch) {
          const minutes = parseInt(timestampMatch[1]);
          const seconds = parseInt(timestampMatch[2]);
          const startTime = minutes * 60 + seconds;
          
          // Get the next line as narration text
          const narrationText = i + 1 < lines.length ? lines[i + 1] : '';
          
          // Create a scene with an asset from the provided list
          const assetUrl = mediaAssets[currentAssetIndex % mediaAssets.length];
          currentAssetIndex++;
          
          scenes.push({
            asset: {
              type: "image",
              src: assetUrl
            },
            start: startTime,
            length: 5, // Default length of 5 seconds per scene
            transition: {
              in: "fade",
              out: "fade"
            },
            effect: "zoomIn",
            fit: "cover"
          });
          
          // Add text overlay for the narration
          if (narrationText) {
            scenes.push({
              asset: {
                type: "title",
                text: narrationText,
                style: "minimal",
                size: "medium",
                position: "bottom"
              },
              start: startTime,
              length: 5
            });
          }
        }
      }
    }
    
    return scenes;
  };
  
  return {
    createVideo,
    getVideoStatus
  };
}
