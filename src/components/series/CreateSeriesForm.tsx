'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';

interface FormData {
  title: string;
  description: string;
  platform: string;
  topic: string;
  contentPrompt: string;
}

export default function CreateSeriesForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    platform: 'youtube',
    topic: '',
    contentPrompt: '',
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when field is edited
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!formData.topic.trim()) {
      newErrors.topic = 'Topic is required';
      isValid = false;
    }

    if (!formData.contentPrompt.trim()) {
      newErrors.contentPrompt = 'Content prompt is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      if (!user) throw new Error('User not authenticated');

      // Insert the new series into Supabase
      const { data, error } = await supabase
        .from('series')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          platform: formData.platform,
          topic: formData.topic,
          content_prompt: formData.contentPrompt,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      setSubmitStatus({
        success: true,
        message: 'Series created successfully!',
      });

      // Redirect to the series page after a short delay
      setTimeout(() => {
        router.push('/dashboard/series');
      }, 2000);
    } catch (error: any) {
      console.error('Error creating series:', error);
      setSubmitStatus({
        success: false,
        message: error.message || 'Failed to create series',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Series Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="Enter a title for your video series"
          />

          <Textarea
            label="Description (Optional)"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            placeholder="Describe what this series is about"
            rows={3}
          />

          <Select
            label="Platform"
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            options={[
              { value: 'youtube', label: 'YouTube Shorts' },
              { value: 'tiktok', label: 'TikTok' },
              { value: 'both', label: 'Both Platforms' },
            ]}
          />

          <Input
            label="Topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            error={errors.topic}
            placeholder="E.g., Technology tips, Cooking hacks, Fitness advice"
          />

          <Textarea
            label="Content Prompt"
            name="contentPrompt"
            value={formData.contentPrompt}
            onChange={handleChange}
            error={errors.contentPrompt}
            placeholder="Provide specific instructions for the AI to generate your video scripts"
            rows={5}
          />
        </div>

        {submitStatus && (
          <Alert
            variant={submitStatus.success ? 'success' : 'error'}
            title={submitStatus.success ? 'Success!' : 'Error'}
          >
            {submitStatus.message}
          </Alert>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/dashboard/series')}
            className="mr-3"
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Create Series
          </Button>
        </div>
      </form>
    </Card>
  );
}
