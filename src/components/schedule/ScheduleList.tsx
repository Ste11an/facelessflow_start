'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';

interface Schedule {
  id: string;
  scheduled_time: string;
  status: string;
  platforms: string[];
  video: {
    id: string;
    title: string;
    thumbnail_url: string;
  };
  series: {
    id: string;
    title: string;
  };
}

export default function ScheduleList() {
  const { user } = useAuth();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchSchedules = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('schedules')
          .select(`
            *,
            video:video_id (
              id,
              title,
              thumbnail_url
            ),
            series:series_id (
              id,
              title
            )
          `)
          .eq('user_id', user.id)
          .order('scheduled_time', { ascending: true });
        
        if (error) throw error;
        
        setSchedules(data || []);
      } catch (err: any) {
        console.error('Error fetching schedules:', err);
        setError(err.message || 'Failed to load schedules');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSchedules();
  }, [user]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'success';
      case 'scheduled':
        return 'primary';
      case 'failed':
        return 'danger';
      default:
        return 'default';
    }
  };

  const formatScheduleTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
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
          <h3 className="text-xl font-medium mb-2">Error Loading Schedules</h3>
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

  if (schedules.length === 0) {
    return (
      <EmptyState
        title="No Scheduled Publications"
        description="Schedule your videos to be published automatically to YouTube Shorts and TikTok."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
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
        <h2 className="text-2xl font-bold text-white">Publication Schedule</h2>
        <Button 
          variant="primary" 
          onClick={() => router.push('/dashboard/videos')}
        >
          Schedule New Publication
        </Button>
      </div>
      
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Video
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Series
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Scheduled Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Platforms
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-900 divide-y divide-gray-800">
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-800 rounded overflow-hidden">
                        {schedule.video?.thumbnail_url ? (
                          <img 
                            src={schedule.video.thumbnail_url} 
                            alt={schedule.video.title} 
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
                          {schedule.video?.title || 'Unknown Video'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {schedule.series?.title || 'Unknown Series'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {formatScheduleTime(schedule.scheduled_time)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      {schedule.platforms.includes('youtube') && (
                        <Badge variant="danger">YouTube</Badge>
                      )}
                      {schedule.platforms.includes('tiktok') && (
                        <Badge variant="info">TikTok</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusBadgeVariant(schedule.status)}>
                      {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      variant="secondary" 
                      onClick={() => router.push(`/dashboard/schedule/${schedule.id}`)}
                      size="sm"
                    >
                      Details
                    </Button>
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
