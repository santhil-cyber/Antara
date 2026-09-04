'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { InputForm } from '@/components/InputForm';
import Share from '@/components/Share';
import { useClerk } from '@clerk/nextjs';
import HorizontalLinearStepper from '@/components/MultiStep';
import ImageGen from '@/components/ImageGen';
function Page() {
  const [resImage, setResImage] = useState<string | null>(null);
  const [resText, setText] = useState<string | null>(null);
  const [resTextGemma, setTextGemma] = useState<string | null>(null);
  const { user } = useClerk();
  const [activeStep, setActiveStep] = useState(0);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    // Move to the next step when resImage is set
    if (resText && resTextGemma) {
      setActiveStep(1);
    }
  }, [resText, resTextGemma]);

  useEffect(() => {
    // Move to the next step when resImage is set
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
    <InputForm key="step1" setText={setText} setTextGemma={setTextGemma} />, // Step 1
    <ImageGen
      key="step2"
      text={resText || ''}
      setResImage={setResImage}
      textGemma={resTextGemma || ''}
    />, // Step 2
    <Share
      key="step3"
      imageURL={resImage || ''}
      setShared={setShared}
      resText={resText || ''}
    />, // Step 2
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-4">
        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-3 text-gray-800 dark:text-gray-100">Sign In Required</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
            Please sign in or create an account to submit a support ticket and report an issue.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/sign-in"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-2.5 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 font-semibold rounded-lg transition duration-200"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <HorizontalLinearStepper
        activeStep={activeStep}
        stepContent={stepContent}
      />
    </div>
  );
}

export default Page;
