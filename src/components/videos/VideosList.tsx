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

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  status: string;
  platform: string;
  created_at: string;
  series: {
    title: string;
  };
}

export default function VideosList() {
  const { user } = useAuth();
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('videos')
          .select(`
            *,
            series:series_id (
              title
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setVideos(data || []);
      } catch (err: any) {
        console.error('Error fetching videos:', err);
        setError(err.message || 'Failed to load videos');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVideos();
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
      case 'ready':
      case 'published':
        return 'success';
      case 'processing':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
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
          <h3 className="text-xl font-medium mb-2">Error Loading Videos</h3>
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

  if (videos.length === 0) {
    return (
      <EmptyState
        title="No Videos Found"
        description="Create your first video to get started with FacelessFlow."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
        }
        action={
          <Button 
            variant="primary" 
            onClick={() => router.push('/dashboard/series')}
          >
            Go to Series
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Your Videos</h2>
        <Button 
          variant="primary" 
          onClick={() => router.push('/dashboard/series')}
        >
          Create New Video
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full flex flex-col">
              <div className="relative aspect-[9/16] bg-gray-800 rounded-t-md overflow-hidden mb-4">
                {video.thumbnail_url ? (
                  <img 
                    src={video.thumbnail_url} 
                    alt={video.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2 flex space-x-2">
                  <Badge variant={getPlatformBadgeVariant(video.platform)}>
                    {getPlatformLabel(video.platform)}
                  </Badge>
                  <Badge variant={getStatusBadgeVariant(video.status)}>
                    {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">{video.title}</h3>
                <p className="text-gray-400 text-sm mb-2">
                  Series: {video.series?.title || 'Unknown Series'}
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  {video.description || 'No description provided'}
                </p>
                <div className="text-sm text-gray-500 mb-4">
                  Created on {new Date(video.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="primary" 
                  onClick={() => router.push(`/dashboard/videos/${video.id}`)}
                  fullWidth
                >
                  View Details
                </Button>
                {video.status === 'ready' || video.status === 'published' ? (
                  <Button 
                    variant="secondary" 
                    onClick={() => window.open(video.video_url, '_blank')}
                    fullWidth
                  >
                    Watch Video
                  </Button>
                ) : (
                  <Button 
                    variant="secondary" 
                    disabled={true}
                    fullWidth
                  >
                    {video.status === 'processing' ? 'Processing...' : 'Not Ready'}
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
