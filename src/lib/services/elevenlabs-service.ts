'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ElevenLabsService {
  generateVoiceover: (text: string, voiceId?: string) => Promise<{ success: boolean; audioUrl?: string; error?: string }>;
  getVoices: () => Promise<{ success: boolean; voices?: any[]; error?: string }>;
}

export default function useElevenLabsService(): ElevenLabsService {
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
      const encryptedKey = data?.keys?.elevenlabs;
      if (!encryptedKey) throw new Error('ElevenLabs API key not found');
      
      // Simple decryption (for demo purposes)
      return atob(encryptedKey);
    } catch (error) {
      console.error('Error fetching ElevenLabs API key:', error);
      throw new Error('Failed to retrieve ElevenLabs API key');
    }
  };

  // Function to get available voices
  const getVoices = async (): Promise<{ success: boolean; voices?: any[]; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Get the API key
      const apiKey = await getApiKey();
      
      // Make the API call to ElevenLabs
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'xi-api-key': apiKey
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch voices');
      }
      
      const data = await response.json();
      
      return {
        success: true,
        voices: data.voices
      };
    } catch (error: any) {
      console.error('Error fetching voices:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch voices'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate voiceover using ElevenLabs
  const generateVoiceover = async (text: string, voiceId: string = '21m00Tcm4TlvDq8ikWAM'): Promise<{ success: boolean; audioUrl?: string; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Get the API key
      const apiKey = await getApiKey();
      
      // Make the API call to ElevenLabs
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate voiceover');
      }
      
      // Convert the audio blob to a URL
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      return {
        success: true,
        audioUrl
      };
    } catch (error: any) {
      console.error('Error generating voiceover:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate voiceover'
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    generateVoiceover,
    getVoices
  };
}
