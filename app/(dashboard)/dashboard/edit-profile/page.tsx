'use client';

import React, { useState, ChangeEvent } from 'react';
import { ArrowLeft, Camera, Save, User, Mail, Phone, MapPin, Check, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { Step1Personal } from '@/components/sections/create-profile/Step1Personal';
import { Step2Education } from '@/components/sections/create-profile/Step2Education';
import { Step3Skills } from '@/components/sections/create-profile/Step3Skills';
import { Step4Experience } from '@/components/sections/create-profile/Step4Experience';
import { Step5Additional } from '@/components/sections/create-profile/Step5Additional';

const steps = [
  { label: 'Personal Info', component: Step1Personal, icon: User, color: 'from-blue-900 to-blue-800' },
  { label: 'Education', component: Step2Education, icon: Camera, color: 'from-blue-900 to-blue-800' },
  { label: 'Skills', component: Step3Skills, icon: Check, color: 'from-blue-900 to-blue-800' },
  { label: 'Experience', component: Step4Experience, icon: Save, color: 'from-orange-500 to-orange-600' },
  { label: 'Additional', component: Step5Additional, icon: Check, color: 'from-orange-500 to-orange-600' },
];

export default function EditProfilePage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const methods = useForm({ mode: 'onBlur' });
  
  const CurrentStep = steps[activeStep].component;

  const handleStepChange = (newStep: number) => {
    if (newStep === activeStep) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      setActiveStep(newStep);
      setIsAnimating(false);
    }, 150);
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      if (!completedSteps.includes(activeStep)) {
        setCompletedSteps([...completedSteps, activeStep]);
      }
      handleStepChange(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) handleStepChange(activeStep - 1);
  };

  const onSubmit = (data: any) => {
    setCompletedSteps([...completedSteps, activeStep]);
    setShowSuccessAnimation(true);
    setTimeout(() => {
      setShowSuccessAnimation(false);
      // TODO: Implement save/update logic (API call)
      alert('Profile updated!' + JSON.stringify(data, null, 2));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50 relative overflow-hidden">
      {/* Animated background elements - ONLY blue and orange */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-900/10 to-blue-800/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      {/* Success animation overlay - ONLY orange */}
      {showSuccessAnimation && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 shadow-2xl transform animate-bounce">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800">Success!</h3>
            <p className="text-gray-600 text-center mt-2">Profile saved successfully</p>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-4xl mx-auto p-6 py-10">
        {/* Header */}
        <div className="flex items-center mb-8 transform hover:scale-105 transition-transform duration-300">
          <button 
            onClick={() => router.back()}
            className="group p-3 hover:bg-white/80 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-gray-100"
          >
            <ArrowLeft size={24} className="text-slate-600 group-hover:text-blue-900 transition-colors" />
          </button>
          <div className="ml-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Edit Profile
            </h1>
            <p className="text-gray-500 mt-1">Make your profile shine ✨</p>
          </div>
        </div>

        {/* Step Navigation - ONLY blue and orange */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg overflow-x-auto">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === idx;
              const isCompleted = completedSteps.includes(idx);
              
              return (
                <div key={step.label} className="flex items-center flex-shrink-0">
                  <button
                    className={`group relative flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
                      isActive 
                        ? 'bg-gradient-to-r ' + step.color + ' text-white shadow-lg transform scale-105' 
                        : isCompleted
                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                    onClick={() => handleStepChange(idx)}
                  >
                    <div className={`p-1 rounded-lg ${isActive ? 'bg-white/20' : ''}`}>
                      {isCompleted && !isActive ? (
                        <Check size={18} />
                      ) : (
                        <Icon size={18} />
                      )}
                    </div>
                    <span className="hidden sm:inline text-sm">{step.label}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    )}
                  </button>
                  
                  {idx < steps.length - 1 && (
                    <ChevronRight size={16} className="text-gray-300 mx-1 flex-shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/50 overflow-hidden">
          <div className={`p-8 transition-all duration-300 ${isAnimating ? 'opacity-50 transform scale-95' : 'opacity-100 transform scale-100'}`}>
            <div className="mb-6">
              <div className={`w-full h-1 bg-gray-200 rounded-full overflow-hidden`}>
                <div 
                  className={`h-full bg-gradient-to-r ${steps[activeStep].color} transition-all duration-500 ease-out`}
                  style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Step {activeStep + 1} of {steps.length}</span>
                <span>{Math.round(((activeStep + 1) / steps.length) * 100)}% Complete</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-gradient-to-r ${steps[activeStep].color}`}>
                {React.createElement(steps[activeStep].icon, { size: 24, className: "text-white" })}
              </div>
              {steps[activeStep].label}
            </h2>

            {/* Form Provider and Current Step */}
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)}>
                <div className="mb-8">
                  <CurrentStep />
                </div>
                
                {/* Navigation Buttons - ONLY blue and orange */}
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    className="group px-8 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl font-semibold text-gray-700 transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-gray-100 disabled:opacity-50 disabled:cursor-not-allowed hover:transform hover:scale-105"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                      Back
                    </div>
                  </button>

                  {activeStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="group px-8 py-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-blue-200 hover:transform hover:scale-105"
                    >
                      <div className="flex items-center gap-2">
                        Next
                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-orange-200 hover:transform hover:scale-105"
                    >
                      <div className="flex items-center gap-2">
                        <Save size={18} className="group-hover:rotate-12 transition-transform" />
                        Save Changes
                      </div>
                    </button>
                  )}
                </div>
              </form>
            </FormProvider>
          </div>
        </div>

        {/* Step indicators at bottom - ONLY blue and orange */}
        <div className="flex justify-center mt-8 gap-2">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                idx === activeStep 
                  ? 'bg-blue-900 w-8' 
                  : completedSteps.includes(idx)
                  ? 'bg-orange-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}