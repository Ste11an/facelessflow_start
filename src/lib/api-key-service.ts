'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';

export default function ApiKeyService() {
  const { user } = useAuth();
  
  // Function to encrypt API keys before storing them
  const encryptKey = (key: string) => {
    // In a real application, you would use a proper encryption method
    // This is a simple obfuscation for demonstration purposes
    return btoa(key);
  };
  
  // Function to decrypt API keys when retrieving them
  const decryptKey = (encryptedKey: string) => {
    // In a real application, you would use a proper decryption method
    // This is a simple de-obfuscation for demonstration purposes
    try {
      return atob(encryptedKey);
    } catch (e) {
      return '';
    }
  };
  
  // Save API keys to Supabase
  const saveApiKeys = async (keys: Record<string, string>) => {
    if (!user) return { success: false, message: 'User not authenticated' };
    
    try {
      // Encrypt all keys before storing
      const encryptedKeys: Record<string, string> = {};
      Object.entries(keys).forEach(([keyName, keyValue]) => {
        if (keyValue) {
          encryptedKeys[keyName] = encryptKey(keyValue);
        }
      });
      
      // Store in Supabase
      const { error } = await supabase
        .from('api_keys')
        .upsert({ 
          user_id: user.id,
          keys: encryptedKeys,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'user_id' 
        });
      
      if (error) throw error;
      
      return { success: true, message: 'API keys saved successfully!' };
    } catch (error: any) {
      console.error('Error saving API keys:', error);
      return { 
        success: false, 
        message: `Failed to save API keys: ${error.message}` 
      };
    }
  };
  
  // Fetch API keys from Supabase
  const fetchApiKeys = async () => {
    if (!user) return { success: false, keys: {} };
    
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('keys')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      // Decrypt keys
      const decryptedKeys: Record<string, string> = {};
      if (data && data.keys) {
        Object.entries(data.keys).forEach(([keyName, encryptedValue]) => {
          decryptedKeys[keyName] = decryptKey(encryptedValue as string);
        });
      }
      
      return { success: true, keys: decryptedKeys };
    } catch (error: any) {
      console.error('Error fetching API keys:', error);
      return { success: false, keys: {} };
    }
  };
  
  return {
    saveApiKeys,
    fetchApiKeys
  };
}
