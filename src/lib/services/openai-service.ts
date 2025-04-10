'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface OpenAIService {
  generateScript: (prompt: string, topic: string, platform: string) => Promise<{ success: boolean; content?: string; error?: string }>;
}

export default function useOpenAIService(): OpenAIService {
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
      const encryptedKey = data?.keys?.openai;
      if (!encryptedKey) throw new Error('OpenAI API key not found');
      
      // Simple decryption (for demo purposes)
      return atob(encryptedKey);
    } catch (error) {
      console.error('Error fetching OpenAI API key:', error);
      throw new Error('Failed to retrieve OpenAI API key');
    }
  };

  // Function to generate a script using OpenAI
  const generateScript = async (prompt: string, topic: string, platform: string): Promise<{ success: boolean; content?: string; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Get the API key
      const apiKey = await getApiKey();
      
      // Construct the prompt for OpenAI
      const fullPrompt = `
        Create a script for a vertical short video about ${topic} for ${platform}.
        
        Additional instructions:
        ${prompt}
        
        The script should be engaging, concise, and optimized for ${platform === 'youtube' ? 'YouTube Shorts' : 'TikTok'}.
        Include timestamps and visual directions in [brackets].
        
        Format:
        TITLE: [Video Title]
        
        [00:00] [Visual description]
        Narration text
        
        [00:05] [Visual description]
        Narration text
        
        ...and so on.
      `;
      
      // Make the API call to OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a professional video script writer specializing in vertical short-form content.'
            },
            {
              role: 'user',
              content: fullPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate script');
      }
      
      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      return {
        success: true,
        content: generatedContent
      };
    } catch (error: any) {
      console.error('Error generating script:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate script'
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    generateScript
  };
}
