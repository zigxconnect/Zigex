"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GitFork, Download, GitBranch, FileCode, UploadCloud, ChevronRight, ChevronLeft, Check, Copy, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ContributorManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoUrl: string; // e.g., "https://github.com/owner/repo"
}

export default function ContributorManualModal({ isOpen, onClose, repoUrl }: ContributorManualModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Fork the Repository",
      description: "Create your own copy of the project to work on.",
      icon: <GitFork className="w-6 h-6 text-purple-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">
            Click the "Fork" button in the top-right corner of the GitHub repository page. This creates a copy of the repository in your own GitHub account.
          </p>
          <Button
            variant="outline"
            className="w-full border-blue-200 hover:bg-blue-50 text-blue-700"
            onClick={() => window.open(repoUrl, "_blank")}
          >
            Go to Repository
          </Button>
        </div>
      ),
    },
    {
      title: "Clone the Project",
      description: "Download the code to your local machine.",
      icon: <Download className="w-6 h-6 text-blue-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">Open your terminal and run the following command:</p>
          <div className="bg-slate-900 rounded-lg p-4 relative group">
            <code className="text-green-400 font-mono text-sm break-all">
              git clone {repoUrl}.git
            </code>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 text-slate-400 hover:text-white"
              onClick={() => navigator.clipboard.writeText(`git clone ${repoUrl}.git`)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ),
    },
    {
      title: "Create a Branch",
      description: "Isolate your changes in a new branch.",
      icon: <GitBranch className="w-6 h-6 text-orange-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">Create a new branch for your feature or fix using a descriptive name:</p>
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 font-mono text-sm text-slate-800">
            git checkout -b feature/amazing-feature
          </div>
        </div>
      ),
    },
    {
      title: "Make Changes",
      description: "Write your code and commit your changes.",
      icon: <FileCode className="w-6 h-6 text-emerald-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">Edit the files and verify your changes. Then stage and commit them:</p>
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 font-mono text-sm text-slate-800 space-y-2">
            <div>git add .</div>
            <div>git commit -m "Add amazing feature"</div>
          </div>
        </div>
      ),
    },
    {
      title: "Push & Pull Request",
      description: "Upload your changes and propose them to the main project.",
      icon: <UploadCloud className="w-6 h-6 text-sky-600" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-600">Push your branch to your forked repository:</p>
          <div className="bg-slate-100 border border-slate-200 rounded-lg p-3 font-mono text-sm text-slate-800 mb-4">
            git push origin feature/amazing-feature
          </div>
          <p className="text-slate-600">
            Finally, go to the original repository on GitHub. You'll see a prompt to <strong>Compare & Pull Request</strong>. Click it!
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-none shadow-2xl rounded-2xl overflow-hidden p-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Rocket className="w-6 h-6" />
              </div>
              Contribution Guide
            </DialogTitle>
            <p className="text-blue-100 text-sm mt-1">
              Become a legend! Follow these steps to contribute.
            </p>
          </DialogHeader>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-slate-100">
          <div
            className="h-full bg-green-500 transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 shadow-sm">
                {steps[currentStep].icon}
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Step {currentStep + 1}: {steps[currentStep].title}
              </h3>
            </div>
            <p className="text-slate-500 text-sm mb-4">{steps[currentStep].description}</p>
            {steps[currentStep].content}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="text-slate-500 hover:text-slate-800"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>

            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${i === currentStep ? 'bg-blue-600' : 'bg-slate-200'}`}
                />
              ))}
            </div>

            {currentStep === steps.length - 1 ? (
              <Button onClick={onClose} className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200">
                Got it! <Check className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
