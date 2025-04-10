'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface PexelsService {
  searchMedia: (query: string, mediaType: 'photos' | 'videos', perPage?: number) => Promise<{ success: boolean; results?: any[]; error?: string }>;
}

export default function usePexelsService(): PexelsService {
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
      const encryptedKey = data?.keys?.pexels;
      if (!encryptedKey) throw new Error('Pexels API key not found');
      
      // Simple decryption (for demo purposes)
      return atob(encryptedKey);
    } catch (error) {
      console.error('Error fetching Pexels API key:', error);
      throw new Error('Failed to retrieve Pexels API key');
    }
  };

  // Function to search for media on Pexels
  const searchMedia = async (
    query: string, 
    mediaType: 'photos' | 'videos' = 'photos',
    perPage: number = 20
  ): Promise<{ success: boolean; results?: any[]; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Get the API key
      const apiKey = await getApiKey();
      
      // Determine the endpoint based on media type
      const endpoint = mediaType === 'photos' 
        ? `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait`
        : `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=portrait`;
      
      // Make the API call to Pexels
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to search ${mediaType}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract the results based on media type
      const results = mediaType === 'photos' ? data.photos : data.videos;
      
      return {
        success: true,
        results
      };
    } catch (error: any) {
      console.error(`Error searching ${mediaType}:`, error);
      return {
        success: false,
        error: error.message || `Failed to search ${mediaType}`
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    searchMedia
  };
}
