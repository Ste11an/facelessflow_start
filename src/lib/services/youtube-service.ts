'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface YouTubeService {
  uploadVideo: (
    title: string,
    description: string,
    tags: string[],
    videoFile: File,
    thumbnailFile?: File
  ) => Promise<{ success: boolean; videoId?: string; error?: string }>;
  getVideoStatus: (videoId: string) => Promise<{ success: boolean; status?: string; url?: string; error?: string }>;
}

export default function useYouTubeService(): YouTubeService {
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
      const encryptedKey = data?.keys?.youtube;
      if (!encryptedKey) throw new Error('YouTube API key not found');
      
      // Simple decryption (for demo purposes)
      return atob(encryptedKey);
    } catch (error) {
      console.error('Error fetching YouTube API key:', error);
      throw new Error('Failed to retrieve YouTube API key');
    }
  };

  // Function to upload a video to YouTube
  const uploadVideo = async (
    title: string,
    description: string,
    tags: string[],
    videoFile: File,
    thumbnailFile?: File
  ): Promise<{ success: boolean; videoId?: string; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Get the API key
      const apiKey = await getApiKey();
      
      // In a real implementation, this would use the YouTube Data API
      // This would require OAuth 2.0 authentication, not just an API key
      // For demonstration purposes, we'll simulate the API call
      
      console.log('Uploading video to YouTube:', {
        title,
        description,
        tags,
        videoFile,
        thumbnailFile,
        apiKey: `${apiKey.substring(0, 5)}...` // Log only part of the key for security
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate a successful response
      const videoId = 'YT_' + Math.random().toString(36).substring(2, 12);
      
      return {
        success: true,
        videoId
      };
    } catch (error: any) {
      console.error('Error uploading video to YouTube:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload video to YouTube'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check the status of a video upload
  const getVideoStatus = async (videoId: string): Promise<{ success: boolean; status?: string; url?: string; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Get the API key
      const apiKey = await getApiKey();
      
      // In a real implementation, this would use the YouTube Data API
      // For demonstration purposes, we'll simulate the API call
      
      console.log('Checking video status on YouTube:', {
        videoId,
        apiKey: `${apiKey.substring(0, 5)}...` // Log only part of the key for security
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate a successful response
      return {
        success: true,
        status: 'published',
        url: `https://youtube.com/shorts/${videoId}`
      };
    } catch (error: any) {
      console.error('Error checking video status on YouTube:', error);
      return {
        success: false,
        error: error.message || 'Failed to check video status on YouTube'
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    uploadVideo,
    getVideoStatus
  };
}
