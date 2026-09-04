'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { InputForm } from '@/components/InputForm';
import Share from '@/components/Share';
import { useClerk } from '@clerk/nextjs';
import HorizontalLinearStepper from '@/components/MultiStep';
import ImageGen from '@/components/ImageGen';
import { Button } from '@/components/ui/button';
import { ShieldCheck, UserCheck } from 'lucide-react';

function Page() {
  const [resImage, setResImage] = useState<string | null>(null);
  const [resText, setText] = useState<string | null>(null);
  const [resTextGemma, setTextGemma] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);
  const [allowGuest, setAllowGuest] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { user } = useClerk();
  const [activeStep, setActiveStep] = useState(0);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    fetch('/api/admin/status')
      .then((r) => r.json())
      .then((d) => {
        if (d?.isAdmin) setIsAdmin(true);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Move to Step 2 when text is generated
    if (resText) {
      setActiveStep(1);
    }
  }, [resText]);

  useEffect(() => {
    // Move to Step 3 when image is selected
    if (resImage) {
      setActiveStep(2);
    }
  }, [resImage]);

  useEffect(() => {
    if (shared) {
      setActiveStep(4);
    }
  }, [shared]);

  const stepContent = [
    <InputForm
      key="step1"
      setText={setText}
      setTextGemma={setTextGemma}
      setFormData={setFormData}
    />,
    <ImageGen
      key="step2"
      text={resText || ''}
      setText={setText}
      setResImage={setResImage}
      textGemma={resTextGemma || ''}
    />,
    <Share
      key="step3"
      imageURL={resImage || ''}
      setShared={setShared}
      resText={resText || ''}
      formData={formData}
    />,
  ];

  const isAuthenticated = Boolean(user || isAdmin || allowGuest);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-4">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-md w-full">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-gray-100">
            Submit Distress Report
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
            Please sign in to track your case status, or continue anonymously for immediate confidential reporting.
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/sign-in"
                className="w-1/2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow transition duration-200 text-sm"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="w-1/2 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold rounded-xl transition duration-200 text-sm"
              >
                Register
              </Link>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAllowGuest(true)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline gap-1 mt-1 font-medium"
            >
              <UserCheck className="w-3.5 h-3.5" /> Continue Anonymously (Quick Report)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <HorizontalLinearStepper
        activeStep={activeStep}
        stepContent={stepContent}
      />
    </div>
  );
}

export default Page;
