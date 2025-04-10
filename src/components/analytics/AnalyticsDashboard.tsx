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

interface AnalyticsData {
  id: string;
  video_id: string;
  platform: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watch_time: number;
  date: string;
  video: {
    id: string;
    title: string;
    thumbnail_url: string;
  };
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalStats, setTotalStats] = useState({
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    watch_time: 0
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('analytics')
          .select(`
            *,
            video:video_id (
              id,
              title,
              thumbnail_url
            )
          `)
          .order('date', { ascending: false });
        
        if (error) throw error;
        
        setAnalytics(data || []);
        
        // Calculate total stats
        if (data && data.length > 0) {
          const totals = data.reduce((acc, item) => {
            return {
              views: acc.views + (item.views || 0),
              likes: acc.likes + (item.likes || 0),
              comments: acc.comments + (item.comments || 0),
              shares: acc.shares + (item.shares || 0),
              watch_time: acc.watch_time + (item.watch_time || 0)
            };
          }, {
            views: 0,
            likes: 0,
            comments: 0,
            shares: 0,
            watch_time: 0
          });
          
          setTotalStats(totals);
        }
      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalytics();
  }, [user]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    } else {
      return num.toString();
    }
  };

  const formatWatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
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
          <h3 className="text-xl font-medium mb-2">Error Loading Analytics</h3>
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

  if (analytics.length === 0) {
    return (
      <EmptyState
        title="No Analytics Data Yet"
        description="Analytics data will appear here once your videos are published and start receiving engagement."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
        }
        action={
          <Button 
            variant="primary" 
            onClick={() => router.push('/dashboard/videos')}
          >
            Go to Videos
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Analytics Dashboard</h2>
        <Button 
          variant="secondary" 
          onClick={() => router.push('/dashboard/videos')}
        >
          View Videos
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <h3 className="text-gray-400 text-sm mb-1">Total Views</h3>
            <p className="text-3xl font-bold text-white">{formatNumber(totalStats.views)}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <h3 className="text-gray-400 text-sm mb-1">Total Likes</h3>
            <p className="text-3xl font-bold text-white">{formatNumber(totalStats.likes)}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <h3 className="text-gray-400 text-sm mb-1">Total Comments</h3>
            <p className="text-3xl font-bold text-white">{formatNumber(totalStats.comments)}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <h3 className="text-gray-400 text-sm mb-1">Total Shares</h3>
            <p className="text-3xl font-bold text-white">{formatNumber(totalStats.shares)}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <h3 className="text-gray-400 text-sm mb-1">Watch Time</h3>
            <p className="text-3xl font-bold text-white">{formatWatchTime(totalStats.watch_time)}</p>
          </div>
        </Card>
      </div>
      
      <Card>
        <h3 className="text-xl font-semibold text-white mb-4 px-6 pt-6">Performance by Video</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Video
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Platform
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Views
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Likes
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Comments
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Shares
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Watch Time
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {analytics.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-800 rounded overflow-hidden">
                        {item.video?.thumbnail_url ? (
                          <img 
                            src={item.video.thumbnail_url} 
                            alt={item.video.title} 
                            className="h-10 w-10 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">
                          {item.video?.title || 'Unknown Video'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={item.platform === 'youtube' ? 'danger' : 'info'}>
                      {item.platform === 'youtube' ? 'YouTube' : 'TikTok'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatNumber(item.views)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatNumber(item.likes)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatNumber(item.comments)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatNumber(item.shares)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {formatWatchTime(item.watch_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-300">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
