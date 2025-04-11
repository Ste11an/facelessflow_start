'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getSupabaseClient } from '@/lib/getSupabaseClient'
import { useAuth } from '@/lib/auth-context';
import useOpenAIService from '@/lib/services/openai-service';
import usePexelsService from '@/lib/services/pexels-service';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import Tabs from '@/components/ui/Tabs';

interface Series {
  id: string;
  title: string;
  description: string;
  platform: string;
  topic: string;
  content_prompt: string;
}

interface CreateVideoProps {
  seriesId: string;
}

export default function CreateVideoForm({ seriesId }: CreateVideoProps) {
  const { user } = useAuth();
  const router = useRouter();
  const openAIService = useOpenAIService();
  const pexelsService = usePexelsService();
  
  const [series, setSeries] = useState<Series | null>(null);
  const [activeTab, setActiveTab] = useState('script');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [scriptTitle, setScriptTitle] = useState('');
  const [scriptContent, setScriptContent] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [scriptSuccess, setScriptSuccess] = useState(false);
  
  const [mediaResults, setMediaResults] = useState<any[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchingMedia, setIsSearchingMedia] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSeries = async () => {
      if (!user || !seriesId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error } = await supabase.from('videos').insert(...)
          .eq('id', seriesId)
          .eq('user_id', user.id)
          .single();
        
        if (error) throw error;
        if (!data) throw new Error('Series not found');
        
        setSeries(data);
        // Set initial search query based on series topic
        setSearchQuery(data.topic);
      } catch (err: any) {
        console.error('Error fetching series:', err);
        setError(err.message || 'Failed to load series');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSeries();
  }, [user, seriesId]);

  const handleGenerateScript = async () => {
    if (!series) return;
    
    setIsGeneratingScript(true);
    setScriptError(null);
    setScriptSuccess(false);
    
    try {
      const result = await openAIService.generateScript(
        series.content_prompt,
        series.topic,
        series.platform
      );
      
      if (!result.success || !result.content) {
        throw new Error(result.error || 'Failed to generate script');
      }
      
      // Extract title from the generated content
      const titleMatch = result.content.match(/TITLE:\s*(.+?)(?:\n|$)/);
      const extractedTitle = titleMatch ? titleMatch[1].trim() : `${series.topic} Video`;
      
      setScriptTitle(extractedTitle);
      setScriptContent(result.content);
      setScriptSuccess(true);
      
      // Save the script to the database
      const { error } = await supabase
        .from('scripts')
        .insert({
          series_id: seriesId,
          title: extractedTitle,
          content: result.content,
          status: 'draft',
          ai_model: 'gpt-4',
          generation_prompt: series.content_prompt
        });
      
      if (error) throw error;
      
    } catch (err: any) {
      console.error('Error generating script:', err);
      setScriptError(err.message || 'Failed to generate script');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleSearchMedia = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearchingMedia(true);
    setMediaError(null);
    
    try {
      const result = await pexelsService.searchMedia(searchQuery, 'photos');
      
      if (!result.success || !result.results) {
        throw new Error(result.error || 'Failed to search media');
      }
      
      setMediaResults(result.results);
    } catch (err: any) {
      console.error('Error searching media:', err);
      setMediaError(err.message || 'Failed to search media');
    } finally {
      setIsSearchingMedia(false);
    }
  };

  const toggleMediaSelection = (url: string) => {
    setSelectedMedia(prev => {
      if (prev.includes(url)) {
        return prev.filter(item => item !== url);
      } else {
        return [...prev, url];
      }
    });
  };

  const handleSaveScript = async () => {
    if (!scriptTitle || !scriptContent || !seriesId) return;
    
    try {
      setIsLoading(true);
      
      // Update the script in the database
      const { error } = await supabase
        .from('scripts')
        .update({
          title: scriptTitle,
          content: scriptContent,
          status: 'approved'
        })
        .eq('series_id', seriesId)
        .eq('title', scriptTitle);
      
      if (error) throw error;
      
      // Move to the next tab
      setActiveTab('media');
    } catch (err: any) {
      console.error('Error saving script:', err);
      setScriptError(err.message || 'Failed to save script');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVideo = async () => {
    if (!scriptTitle || !scriptContent || !seriesId || selectedMedia.length === 0) return;
    
    try {
      setIsLoading(true);
      
      // In a real implementation, this would:
      // 1. Create a video entry in the database
      // 2. Start the video creation process using the Shotstack service
      // 3. Generate voiceover using the ElevenLabs service
      // 4. Combine everything and publish to the selected platforms
      
      // For this demo, we'll just create a video entry
      const { error } = await supabase
        .from('videos')
        .insert({
          series_id: seriesId,
          title: scriptTitle,
          description: `Video created from script: ${scriptTitle}`,
          status: 'pending',
          platform: series?.platform || 'youtube',
          media_assets: selectedMedia
        });
      
      if (error) throw error;
      
      // Redirect to the videos page
      router.push(`/dashboard/videos`);
    } catch (err: any) {
      console.error('Error creating video:', err);
      setError(err.message || 'Failed to create video');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !series) {
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
          <h3 className="text-xl font-medium mb-2">Error</h3>
          <p>{error}</p>
          <Button 
            variant="primary" 
            className="mt-4" 
            onClick={() => router.back()}
          >
            Go Back
          </Button>
        </div>
      </Card>
    );
  }

  if (!series) {
    return (
      <Card variant="highlight" padding="lg">
        <div className="text-center text-red-400">
          <h3 className="text-xl font-medium mb-2">Series Not Found</h3>
          <p>The requested series could not be found.</p>
          <Button 
            variant="primary" 
            className="mt-4" 
            onClick={() => router.push('/dashboard/series')}
          >
            Back to Series
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Create New Video</h2>
          <p className="text-gray-400">Series: {series.title}</p>
        </div>
        <Button 
          variant="secondary" 
          onClick={() => router.push(`/dashboard/series/${seriesId}`)}
        >
          Back to Series
        </Button>
      </div>
      
      <Card>
        <Tabs
          tabs={[
            {
              id: 'script',
              label: 'Generate Script',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              )
            },
            {
              id: 'media',
              label: 'Select Media',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              )
            },
            {
              id: 'review',
              label: 'Review & Create',
              icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )
            }
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
        
        <div className="mt-6">
          {activeTab === 'script' && (
            <div className="space-y-6">
              <div className="bg-gray-800 p-4 rounded-md">
                <h3 className="text-white font-medium mb-2">Series Information</h3>
                <p className="text-gray-300 text-sm mb-1"><strong>Topic:</strong> {series.topic}</p>
                <p className="text-gray-300 text-sm mb-1"><strong>Platform:</strong> {series.platform === 'youtube' ? 'YouTube Shorts' : series.platform === 'tiktok' ? 'TikTok' : 'Both Platforms'}</p>
                <p className="text-gray-300 text-sm"><strong>Content Prompt:</strong> {series.content_prompt}</p>
              </div>
              
              {!scriptContent ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">Generate a script for your video using AI</p>
                  <Button
                    variant="primary"
                    onClick={handleGenerateScript}
                    isLoading={isGeneratingScript}
                  >
                    Generate Script
                  </Button>
                  
                  {scriptError && (
                    <Alert
                      variant="error"
                      title="Error Generating Script"
                      className="mt-4"
                    >
                      {scriptError}
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Input
                    label="Script Title"
                    value={scriptTitle}
                    onChange={(e) => setScriptTitle(e.target.value)}
                    placeholder="Enter a title for your video"
                  />
                  
                  <Textarea
                    label="Script Content"
                    value={scriptContent}
                    onChange={(e) => setScriptContent(e.target.value)}
                    rows={12}
                    className="font-mono"
                  />
                  
                  {scriptSuccess && (
                    <Alert
                      variant="success"
                      title="Script Generated Successfully"
                    >
                      You can edit the script above before proceeding to the next step.
                    </Alert>
                  )}
                  
                  <div className="flex justify-end">
                    <Button
                      variant="primary"
                      onClick={handleSaveScript}
                      isLoading={isLoading}
                    >
                      Save & Continue
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'media' && (
            <div className="space-y-6">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search for images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-grow"
                />
                <Button
                  variant="primary"
                  onClick={handleSearchMedia}
                  isLoading={isSearchingMedia}
                >
                  Search
                </Button>
              </div>
              
              {mediaError && (
                <Alert
                  variant="error"
                  title="Error Searching Media"
                >
                  {mediaError}
                </Alert>
              )}
              
              {selectedMedia.length > 0 && (
                <div>
                  <h3 className="text-white font-medium mb-2">Selected Media ({selectedMedia.length})</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {selectedMedia.map((url) => (
                      <div 
                        key={url} 
                        className="relative aspect-[9/16] bg-gray-800 rounded-md overflow-hidden border-2 border-indigo-500"
                        onClick={() => toggleMediaSelection(url)}
                      >
                        <img 
                          src={url} 
                          alt="Selected media" 
                          className="w-full h-full object-cover"
                        />
                        <button className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {mediaResults.length > 0 && (
                <div>
                  <h3 className="text-white font-medium mb-2">Search Results</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {mediaResults.map((media) => (
                      <div 
                        key={media.id} 
                        className={`relative aspect-[9/16] bg-gray-800 rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${
                          selectedMedia.includes(media.src.portrait) ? 'ring-2 ring-indigo-500' : ''
                        }`}
                        onClick={() => toggleMediaSelection(media.src.portrait)}
                      >
                        <img 
                          src={media.src.portrait} 
                          alt={media.alt || 'Media'} 
                          className="w-full h-full object-cover"
                        />
                        {selectedMedia.includes(media.src.portrait) && (
                          <div className="absolute top-2 right-2 bg-indigo-500 text-white rounded-full p-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between">
                <Button
                  variant="secondary"
                  onClick={() => setActiveTab('script')}
                >
                  Back to Script
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setActiveTab('review')}
                  disabled={selectedMedia.length === 0}
                >
                  Continue to Review
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === 'review' && (
            <div className="space-y-6">
              <div className="bg-gray-800 p-4 rounded-md">
                <h3 className="text-white font-medium mb-2">Video Summary</h3>
                <p className="text-gray-300 text-sm mb-1"><strong>Title:</strong> {scriptTitle}</p>
                <p className="text-gray-300 text-sm mb-1"><strong>Series:</strong> {series.title}</p>
                <p className="text-gray-300 text-sm mb-1"><strong>Platform:</strong> {series.platform === 'youtube' ? 'YouTube Shorts' : series.platform === 'tiktok' ? 'TikTok' : 'Both Platforms'}</p>
                <p className="text-gray-300 text-sm mb-1"><strong>Selected Media:</strong> {selectedMedia.length} images</p>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-md">
                <h3 className="text-white font-medium mb-2">Script Preview</h3>
                <div className="bg-gray-900 p-3 rounded font-mono text-sm text-gray-300 max-h-60 overflow-y-auto">
                  {scriptContent}
                </div>
              </div>
              
              <div className="bg-gray-800 p-4 rounded-md">
                <h3 className="text-white font-medium mb-2">Selected Media Preview</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {selectedMedia.slice(0, 6).map((url, index) => (
                    <div 
                      key={index} 
                      className="aspect-[9/16] bg-gray-900 rounded-md overflow-hidden"
                    >
                      <img 
                        src={url} 
                        alt={`Selected media ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                  {selectedMedia.length > 6 && (
                    <div className="aspect-[9/16] bg-gray-900 rounded-md overflow-hidden flex items-center justify-center text-gray-400">
                      +{selectedMedia.length - 6} more
                    </div>
                  )}
                </div>
              </div>
              
              <Alert
                variant="info"
                title="Next Steps"
              >
                When you create this video, the system will:
                <ol className="list-decimal ml-5 mt-2 space-y-1">
                  <li>Generate a voiceover using ElevenLabs AI</li>
                  <li>Combine your script and selected media using Shotstack</li>
                  <li>Prepare the video for publishing to your selected platforms</li>
                </ol>
              </Alert>
              
              <div className="flex justify-between">
                <Button
                  variant="secondary"
                  onClick={() => setActiveTab('media')}
                >
                  Back to Media Selection
                </Button>
                <Button
                  variant="primary"
                  onClick={handleCreateVideo}
                  isLoading={isLoading}
                >
                  Create Video
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
