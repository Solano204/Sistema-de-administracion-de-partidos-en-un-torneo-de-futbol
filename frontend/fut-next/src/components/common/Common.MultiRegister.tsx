"use client";
import React, { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { FormContainer } from "../ui/Form";
import { actionFunctionAsync, actionFunctionSync } from "@/app/utils/Types/TypesAction";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/Redux/store";
import { submitButtonStyles } from "./Common.FormStyles";

// Step Interface with validation
export interface Step {
  title: string;
  subtitle?: string;
  validate?: () => Record<string, string>;
  content:
    | React.ReactNode
    | React.ComponentType<{
        formData: Record<string, any>;
        onChange: (name: string, value: any) => void;
        errors?: Record<string, string>;
      }>;
}
interface MultiStepFormProps {
  steps: Step[];
  initialStep?: number;
  currentStepValid: boolean;
  handleSubmit: actionFunctionAsync | actionFunctionSync;
  deleteItem?: (key: string) => void;

  onStepChange?: (currentStep: number) => Promise<boolean>;
  className?: string;
}

export const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  initialStep = 0,
  onStepChange,
  deleteItem,
  handleSubmit,
  className = "",
}) => {

  const currentPlayerKey = useSelector((state: RootState) => state.cards.currentModalKey);
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  // const [isStepValid, setIsStepValid] = useState(false);
  // const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = useCallback(async () => {
    if (onStepChange) {
      const isValid: boolean = await onStepChange(currentStep);
      if (!isValid) return;
    }
    setDirection(1);
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, [currentStep, steps, onStepChange]);

  const prevStep = useCallback(() => {
    if (currentStep <= 0) return;
    setDirection(-1);
    setCurrentStep((prev) => prev - 1);
  }, [currentStep]);


 

  // Animations
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: "easeInOut" },
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      scale: 0.95,
      transition: { duration: 0.5, ease: "easeInOut" },
    }),
  };

  // Clear all saved data
 

  // Render current step content
  const renderStepContent = (step: Step) => {
    if (React.isValidElement(step.content)) {
      return step.content;
    } else if (typeof step.content === "function") {
      const StepComponent = step.content as React.ComponentType<{
        formData: Record<string, any>;
        onChange: (name: string, value: any) => void;
        errors?: Record<string, string>;
      }>;

      return (
        <StepComponent
          formData={formData}
          onChange={(name: string, value: any) => {
            setFormData((prev) => ({ ...prev, [name]: value }));

            // Clear the error for this field if it exists
            if (errors[name]) {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
              });
            }
          }}
          errors={errors}
        />
      );
    }
    return null;
  };
// Styled Multi-Step Form Component
return (
  <div
    className={`mt-20 font-sans flex items-center justify-center w-full max-w-3xl mx-auto  ${className}`}
  >
    {/* Background gradient and effects */}
    <div className="w-full relative overflow-hidden bg-white/90 dark:bg-gray-900 rounded-xl shadow-xl">
      {/* Background blobs/gradient effects */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-company-yellow/40 dark:bg-company-yellow/20 rounded-full opacity-70 filter blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-company-green/40 dark:bg-company-green/20 rounded-full opacity-70 filter blur-3xl animate-pulse animation-delay-2000"></div>
      <div className="absolute top-40 left-20 w-32 h-32 bg-company-orange/20 dark:bg-company-orange/10 rounded-full opacity-70 filter blur-2xl animate-pulse animation-delay-1000"></div>
      
      {/* Steps indicator */}
      <div className="relative z-10 pt-6 px-4 sm:px-6">
        <div className="flex justify-between relative pb-8">
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center z-10">
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 text-xs sm:text-sm ${
                  index <= currentStep
                    ? "bg-gradient-to-r from-company-green to-company-yellow dark:from-company-yellow dark:to-company-green text-black dark:text-white shadow-lg"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-xs mt-2 font-medium transition-all duration-300 ${
                  index <= currentStep
                    ? "text-gray-800 dark:text-white"
                    : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {step.title}
              </span>
              {step.subtitle && (
                <span className="text-[10px] text-gray-500 dark:text-gray-400 hidden sm:block">
                  {step.subtitle}
                </span>
              )}
            </div>
          ))}
          
          {/* Progress bar */}
          <div className="absolute top-4 h-1 w-full bg-gray-200 dark:bg-gray-700 -z-10">
            <div
              className="h-full bg-gradient-to-r from-company-green to-company-yellow dark:from-company-yellow dark:to-company-orange transition-all duration-500"
              style={{
                width: `${(currentStep / (steps.length - 1)) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Content section with form */}
      <div className="relative mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-gray-800">
        <div className="min-h-[300px] sm:min-h-[800px] w-full">
          {/* Form content with animations */}
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 backdrop-blur-md rounded-2xl shadow-xl"
            >
              <FormContainer
                action={handleSubmit}
                className="w-full h-full flex flex-col p-4 sm:p-6"
              >
                {/* Current step content */}
                <div className="flex-1 h-[70%] w-full overflow-auto">
                  {renderStepContent(steps[currentStep])}
                </div>

               

                {/* Navigation buttons */}
                <div className="mt-auto flex justify-between absolute bottom-10 sm:bottom-20 left-4 right-4 sm:left-6 sm:right-6">
                  {currentStep > 0 && (
                    <button 
                      type="button" 
                      onClick={prevStep} 
                      className={submitButtonStyles}
                    >
                      Previous
                    </button>
                  )}
                  
                  {deleteItem && currentStep === 0 && (
                    <button 
                      type="button" 
                      onClick={() => {
                        deleteItem(currentPlayerKey || "");
                      }}
                      className={` ${submitButtonStyles} text-red-600 dark:text-red-400`}
                    >
                      Delete
                    </button>
                  )}

                  {currentStep < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      // disabled={isSubmitting}
                      className={submitButtonStyles}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      // disabled={isSubmitting}
                      className={`px-3 sm:px-6 py-2 bg-gradient-to-r from-company-green to-company-yellow dark:from-company-yellow dark:to-company-orange  rounded-lg font-medium hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 text-sm sm:text-base  ${submitButtonStyles}`}
                    >
                      {/* {isSubmitting ? "Submitting..." : "Submit"} */}
                    </button>
                  )}
                </div>
              </FormContainer>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Mobile progress indicator */}
      <div className="sm:hidden flex justify-center py-4">
        <div className="flex space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                index <= currentStep
                  ? "bg-gradient-to-r from-company-green to-company-yellow dark:from-company-yellow dark:to-company-orange"
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  </div>
  )
}