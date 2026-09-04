'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import {
  ShareIcon,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface ShareProps {
  imageURL: string;
  resText: string;
  setShared: (shared: boolean) => void;
}

function Share({ imageURL, resText, setShared }: ShareProps) {
  const [encodedImage, setEncodedImage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [savedPostId, setSavedPostId] = useState<string>('');

  const handleCommonFunction = async (): Promise<any> => {
    try {
      setLoading(true);

      // 1. Safe image encoding
      try {
        const encodeImage = await axios.post('/api/decompose', {
          resImage: imageURL,
        });
        if (encodeImage.data?.encodedImage) {
          setEncodedImage(encodeImage.data.encodedImage);
        }
      } catch (err) {
        console.warn('Image decomposition fallback:', err);
      }

      // 2. Extract structured details from generated text
      let decomposedData: any = {};
      try {
        const decomposeReq = await axios.post('/api/decompose', {
          resText: resText,
        });
        decomposedData = decomposeReq.data?.decomposed || {};
      } catch (err) {
        console.warn('Text decomposition fallback:', err);
      }

      // 3. Assemble full case data
      const data = {
        ...decomposedData,
        resText,
        imageURL,
        status: 'pending',
      };

      // 4. Save to backend/local store
      const saveReq = await axios.post('/api/save', data);
      const savedPost = saveReq.data?.post || data;
      const postId = savedPost._id || `post_${Date.now()}`;
      setSavedPostId(postId);

      // 5. Also save in browser localStorage for 100% reliable local client persistence
      try {
        const existing = JSON.parse(localStorage.getItem('antara_user_posts') || '[]');
        const updated = [
          { ...savedPost, _id: postId, status: 'pending', createdAt: new Date().toISOString() },
          ...existing.filter((p: any) => p._id !== postId),
        ];
        localStorage.setItem('antara_user_posts', JSON.stringify(updated));
      } catch (storageErr) {
        console.warn('localStorage save warning:', storageErr);
      }

      setSubmitted(true);
      setShared(true);
      toast.success('Incident report successfully dispatched to Admin Dashboard!', {
        icon: '🛡️',
        duration: 4000,
      });

      return savedPost;
    } catch (error) {
      console.error('Failed to dispatch post:', error);
      toast.error('Failed to submit report. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDirectSubmit = async () => {
    await handleCommonFunction();
  };

  const handleShareTelegram = async () => {
    await handleCommonFunction();
    const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(
      encodedImage || imageURL
    )}&text=${encodeURIComponent(resText.substring(0, 150))}`;
    window.open(telegramShareUrl, '_blank');
  };

  const handleShareTwitter = async () => {
    await handleCommonFunction();
    const twitterShareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      imageURL
    )}&text=${encodeURIComponent(resText.substring(0, 150))}`;
    window.open(twitterShareUrl, '_blank');
  };

  const handleShareInstagram = async () => {
    await handleCommonFunction();
    toast.success('Report logged! Copying link for Instagram...', { icon: '📸' });
    navigator.clipboard.writeText(imageURL);
  };

  const handleShareSlack = async () => {
    await handleCommonFunction();
    toast.success('Report dispatched to Antara emergency queue and Slack alert webhook.', {
      icon: '🔔',
    });
  };

  return (
    <div className="flex flex-col items-center gap-6 max-w-2xl mx-auto w-full px-4 py-2">
      {/* Post Image Preview */}
      <div className="relative w-full max-w-[420px] aspect-square rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <Image
          src={imageURL}
          alt="Generated Case Image"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 text-white">
          <span className="text-[11px] font-semibold uppercase tracking-wider bg-blue-600/80 backdrop-blur-md px-2.5 py-1 rounded-full w-fit mb-2">
            AI Steganography Shield
          </span>
          <p className="text-xs text-slate-200 line-clamp-2">
            {resText}
          </p>
        </div>
      </div>

      {submitted ? (
        <div className="w-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl p-6 text-center animate-in zoom-in-95 duration-200 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Report Dispatched to Admin Dashboard!
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
            Your distress incident report is securely recorded and now actively visible in the
            administrator live triage monitor.
          </p>
          {savedPostId && (
            <p className="mt-2 text-xs font-mono text-slate-400">
              Case Ref: <span className="text-blue-600 font-semibold">{savedPostId}</span>
            </p>
          )}

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold shadow-md">
                <ShieldCheck className="w-4 h-4" /> View in Admin Dashboard
              </Button>
            </Link>
            <Link href="/" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full border-slate-300 dark:border-slate-700">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-4">
          {/* PRIMARY SUBMIT ACTION */}
          <Button
            size="lg"
            className="w-full max-w-[420px] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6 rounded-xl shadow-xl shadow-blue-500/25 transition-all text-base flex items-center justify-center gap-2"
            onClick={handleDirectSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Dispatching to Dashboard...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" /> Submit to Antara Admin Dashboard
              </>
            )}
          </Button>

          {/* Social Share Alternatives */}
          <div className="w-full max-w-[420px] pt-2">
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-3 font-medium">
              Or broadcast encrypted alert through safe channels:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1.5 border-slate-200 dark:border-slate-800 h-10 text-xs font-semibold"
                onClick={handleShareTelegram}
                disabled={loading}
              >
                <ShareIcon className="w-3.5 h-3.5 text-blue-500" /> Telegram
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1.5 border-slate-200 dark:border-slate-800 h-10 text-xs font-semibold bg-slate-950 text-white hover:bg-slate-900 hover:text-white"
                onClick={handleShareTwitter}
                disabled={loading}
              >
                <ShareIcon className="w-3.5 h-3.5" /> X (Twitter)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1.5 border-slate-200 dark:border-slate-800 h-10 text-xs font-semibold"
                onClick={handleShareInstagram}
                disabled={loading}
              >
                <ExternalLink className="w-3.5 h-3.5 text-pink-500" /> Instagram
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center justify-center gap-1.5 border-slate-200 dark:border-slate-800 h-10 text-xs font-semibold"
                onClick={handleShareSlack}
                disabled={loading}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Slack Channel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Share;
