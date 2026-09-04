'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { useState } from 'react';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton'; // Assuming Skeleton component is from your UI library
import { SparklesIcon } from 'lucide-react';
import Link from 'next/link';

// Zod validation schema for form
const FormSchema = z.object({
  generatedText: z.string(),
  imagePrompt: z
    .string()
    .min(3, { message: 'Please specify the image prompt.' }),
});

const DEFAULT_PRESET_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
];

export default function ImageGen({
  text,
  textGemma,
  setResImage,
  setText,
}: {
  text: string;
  textGemma: string;
  setResImage: (resImage: string) => void;
  setText?: (text: string) => void;
}) {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      generatedText: text || textGemma || '',
      imagePrompt: 'Peaceful Nature Sunset',
    },
  });

  const [imageOptions, setImageOptions] = useState<string[]>(DEFAULT_PRESET_IMAGES);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedText, setSelectedText] = useState<string>(text || textGemma || '');
  const [selectedModel, setSelectedModel] = useState<string>('gemini');

  // Keep selectedText in sync if text arrives later
  React.useEffect(() => {
    if (text && !selectedText) {
      setSelectedText(text);
      form.setValue('generatedText', text);
    }
  }, [text]);

  const promptSuggestions = [
    'Good Morning',
    'Sunset Coast',
    'Mountain Peak',
    'Serene Forest',
    'Skyline',
  ];

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    try {
      const res = await axios.post('/api/generate-image', {
        ...data,
        generatedText: selectedText || data.generatedText,
      });
      if (res.data.images && res.data.images.length > 0) {
        setImageOptions(res.data.images);
      }
    } catch (error) {
      console.error('Error generating images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    form.setValue('imagePrompt', suggestion);
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setResImage(imageUrl);
    const finalTxt = selectedText || text || textGemma || '';
    if (setText && finalTxt) {
      setText(finalTxt);
    }
  };

  const handleTextOptionClick = (textOption: string) => {
    setSelectedText(textOption);
    if (setText) {
      setText(textOption);
    }
    if (textOption === textGemma) {
      setSelectedModel('gemma');
    } else {
      setSelectedModel('gemini');
    }
    form.setValue('generatedText', textOption);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto space-y-7 w-full"
      >
        <FormField
          control={form.control}
          name="generatedText"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between mb-2">
                <FormLabel className="text-base font-semibold">
                  Distress Report Narrative
                </FormLabel>
                <div className="flex items-center gap-2 font-medium text-slate-600 dark:text-slate-400 text-xs">
                  <SparklesIcon size={14} className="text-blue-500" />
                  <span>AI Steganography Ready</span>
                </div>
              </div>

              {/* Model Choice Pills */}
              {text && textGemma && text !== textGemma && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div
                    onClick={() => handleTextOptionClick(text)}
                    className={`cursor-pointer p-3 rounded-xl border transition-all text-xs ${
                      selectedModel === 'gemini'
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 shadow-sm ring-1 ring-blue-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-blue-600 dark:text-blue-400">Gemini Detailed</span>
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">Standard</span>
                    </div>
                    <p className="line-clamp-3 text-slate-600 dark:text-slate-300">{text}</p>
                  </div>

                  <div
                    onClick={() => handleTextOptionClick(textGemma)}
                    className={`cursor-pointer p-3 rounded-xl border transition-all text-xs ${
                      selectedModel === 'gemma'
                        ? 'border-orange-500 bg-orange-50/60 dark:bg-orange-950/40 shadow-sm ring-1 ring-orange-500'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-orange-600 dark:text-orange-400">Gemma Concise</span>
                      <span className="text-[10px] bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-full">Short</span>
                    </div>
                    <p className="line-clamp-3 text-slate-600 dark:text-slate-300">{textGemma}</p>
                  </div>
                </div>
              )}

              <FormControl>
                <Textarea
                  {...field}
                  value={selectedText}
                  onChange={(e) => {
                    setSelectedText(e.target.value);
                    field.onChange(e);
                    if (setText) setText(e.target.value);
                  }}
                  rows={6}
                  placeholder="Review or customize the distress text report before embedding into photo..."
                  className="font-mono text-sm leading-relaxed"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imagePrompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image Prompt</FormLabel>
              <FormControl>
                <Input
                  className=""
                  placeholder="Enter Image Prompt (e.g., Good Morning, Sunset)"
                  {...field}
                />
              </FormControl>
              <div className="flex gap-2 mt-2">
                {promptSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="bg-slate-200 text-slate-700 text-sm px-3 py-1 rounded-xl hover:bg-slate-300 transition duration-150"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Generate Images
        </Button>
      </form>

      {isLoading ? (
        // Skeleton loader shown while the images are being generated
        <div className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Generating Images...</h2>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-[192px] w-full bg-gray-300" />
            ))}
          </div>
        </div>
      ) : imageOptions && imageOptions.length > 0 ? (
        <div className="mt-6 space-y-4 mb-6">
          <h2 className="text-xl font-semibold">Select an Image</h2>
          <div className="grid grid-cols-3 gap-4">
            {imageOptions.map((imageUrl, index) => (
              <div
                key={index}
                className="cursor-pointer shadow hover:shadow-lg hover:scale-105 duration-200"
                onClick={() => handleImageSelect(imageUrl)}
              >
                <div className="relative w-full h-48 overflow-hidden rounded-md">
                  <Image
                    src={imageUrl}
                    alt={`Generated Image ${index + 1}`}
                    layout="fill"
                    objectFit="cover" // Ensures image fills the space without distortion
                    className="rounded-md"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Form>
  );
}
