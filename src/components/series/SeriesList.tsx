'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

interface Series {
  id: string;
  title: string;
  description: string;
  platform: string;
  topic: string;
  status: string;
  created_at: string;
}

export default function SeriesList() {
  const { user } = useAuth();
  const router = useRouter();
  const [series, setSeries] = useState<Series[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('series')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setSeries(data || []);
      } catch (err: any) {
        console.error('Error fetching series:', err);
        setError(err.message || 'Failed to load series');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSeries();
  }, [user]);

  const getPlatformLabel = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return 'YouTube Shorts';
      case 'tiktok':
        return 'TikTok';
      case 'both':
        return 'YouTube & TikTok';
      default:
        return platform;
    }
  };

  const getPlatformBadgeVariant = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return 'danger';
      case 'tiktok':
        return 'info';
      case 'both':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'paused':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          className="text-white text-xl"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          Loading...
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <Card variant="highlight" padding="lg">
        <div className="text-center text-red-400">
          <h3 className="text-xl font-medium mb-2">Error Loading Series</h3>
          <p>{error}</p>
          <Button 
            variant="primary" 
            className="mt-4" 
            onClick={() => router.refresh()}
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (series.length === 0) {
    return (
      <EmptyState
        title="No Series Found"
        description="Create your first video series to get started with FacelessFlow."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        }
        action={
          <Button 
            variant="primary" 
            onClick={() => router.push('/dashboard/series/create')}
          >
            Create Series
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Your Video Series</h2>
        <Button 
          variant="primary" 
          onClick={() => router.push('/dashboard/series/create')}
        >
          Create New Series
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full flex flex-col">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-3">
                  <Badge variant={getPlatformBadgeVariant(item.platform)}>
                    {getPlatformLabel(item.platform)}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(item.status)}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {item.description || `A series about ${item.topic}`}
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  Created on {new Date(item.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="primary" 
                  onClick={() => router.push(`/dashboard/series/${item.id}`)}
                  fullWidth
                >
                  Manage
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => router.push(`/dashboard/series/${item.id}/create-video`)}
                  fullWidth
                >
                  Create Video
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
