"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HowItWorksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HowItWorksModal({ open, onOpenChange }: HowItWorksModalProps) {
  const [currentStep, setCurrentStep] = React.useState(0);

  const steps = [
    {
      title: "Step 1: Input Your Data",
      description: "Share your health metrics, lifestyle habits, and medical history through our secure platform.",
      icon: "📝"
    },
    {
      title: "Step 2: AI Analysis",
      description: "Our advanced algorithms process your data to identify risk factors and patterns.",
      icon: "🤖"
    },
    {
      title: "Step 3: Get Your Results",
      description: "Receive a comprehensive risk assessment with actionable recommendations for prevention.",
      icon: "📊"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCurrentStep(0);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>How It Works</DialogTitle>
          <DialogDescription>
            Our 3-step process to help you assess and manage your diabetes risk
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-4">
                <div className="text-5xl">{steps[currentStep].icon}</div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    {steps[currentStep].title}
                  </h3>
                  <p className="text-gray-600 mt-2 text-lg leading-relaxed">
                    {steps[currentStep].description}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mt-8">
            {steps.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-gradient-to-r from-blue-600 to-green-600 w-8"
                    : "bg-gray-300 w-2"
                }`}
                layoutId="indicator"
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-600 disabled:text-gray-300 hover:bg-gray-100 rounded-md transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <span className="text-sm text-gray-600">
            {currentStep + 1} of {steps.length}
          </span>

          <div className="flex gap-2">
            <button
              onClick={handleNext}
              disabled={currentStep === steps.length - 1}
              className="px-4 py-2 text-gray-600 disabled:text-gray-300 hover:bg-gray-100 rounded-md transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <DialogClose>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-md hover:shadow-lg transition-all">
                Close
              </button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default HowItWorksModal;
