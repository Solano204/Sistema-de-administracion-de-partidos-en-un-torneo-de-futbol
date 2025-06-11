"use client";
import { toastCustom } from "@/components/Toast/SonnerToast";
// Enhanced ImageUpload component with forwarded ref
import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import Image from "next/image";

interface ImageUploadWithRefProps {
  id?: string;
  imageUrl?: string;
  className?: string;
  onFileSelect?: (file: File | null) => void;
  // onImageUpdate?: (url: string) => void;
  folder: string;
  disabled?: boolean;
}

export const ImageUploadWithRef = forwardRef<{ selectedFile: File | null }, ImageUploadWithRefProps>(
  function ImageUploadWithRef({  imageUrl, className, onFileSelect, disabled = false }, ref) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    useImperativeHandle(ref, () => ({
      selectedFile
    }));

    const handleFileSelect = (file: File | null) => {
      if (disabled) return; // Don't allow file selection when disabled
      setSelectedFile(file);
      if (onFileSelect) {
        onFileSelect(file);
      }
    };

    const CustomImageUpload = () => {
      const [preview, setPreview] = useState<string | null>(null);
      const fileInputRef = useRef<HTMLInputElement>(null);

      React.useEffect(() => {
        if (imageUrl) {
          setPreview(imageUrl);
        }
      }, [imageUrl]);

      const handleFileSelectInternal = (file: File) => {
        if (disabled) return; // Don't allow file selection when disabled
        
        if (!file) return;

        if (!file.type.match('image.*')) {
          toastCustom(
            {
              title: "Error",
              description: "Please select an image file (JPEG, PNG, GIF)",
              button: { label: "OK", onClick: () => {} },
            },
            "error",
            5000
          );
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          toastCustom(
            {
              title: "Error",
              description: "Image size should be less than 5MB",
              button: { label: "OK", onClick: () => {} },
            },
            "error",
            5000
          );
          return;
        }

        // setLocalSelectedFile(file);
        handleFileSelect(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target?.result as string;
          setPreview(imageData);
        };
        reader.readAsDataURL(file);
      }

      const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return; // Don't allow changes when disabled
        const file = e.target.files?.[0];
        if (file) {
          handleFileSelectInternal(file);
        }
      };

      const triggerFileInput = () => {
        if (disabled) return; // Don't trigger file input when disabled
        fileInputRef.current?.click();
      };

      const removeImage = () => {
        if (disabled) return; // Don't allow removal when disabled
        setPreview(imageUrl || null);
        handleFileSelect(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };

      const imageSrc = preview || imageUrl || "/default-avatar.png";

      return (
        <div className={`relative flex flex-col items-center justify-center w-full h-full ${className} ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleChange}
            accept="image/*"
            className="hidden"
            aria-label="Upload image"
            disabled={disabled}
          />
          
          <div className="relative w-full h-full rounded-full  overflow-hidden">
            {imageSrc ? (
              <>
                <Image
                  fill
                  src={imageSrc}
                  alt="Category image"
                  className="w-full h-full object-cover"
                />
                {!disabled && (
                  <div className="absolute inset-0 flex items-end justify-center p-2 bg-gradient-to-t from-black/50 to-transparent">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="p-2 bg-white/80 rounded-full text-gray-800 hover:bg-white transition-colors group-hover:translate-x-8 group-hover:shadow-2xl group-hover:-translate-y-8 transition-all duration-500"
                        aria-label="Change image"
                        disabled={disabled}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                onClick={!disabled ? triggerFileInput : undefined}
                className={`relative w-full group flex flex-col items-center justify-center w-full h-full border-2 border-dashed rounded-md transition-all ${
                  disabled
                     ? "border-gray-200 bg-gray-100 cursor-not-allowed"
                     : "border-gray-300 hover:border-sky-400 hover:bg-gray-50 cursor-pointer"
                }`}
              >
                <div className="relative z-40 cursor-pointer group-hover:translate-x-8 group-hover:shadow-2xl group-hover:-translate-y-8 transition-all duration-500 bg-main-light dark:bg-main-dark flex items-center justify-center size-20 mx-auto rounded-full">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="24" 
                    height="24" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="h-6 w-6 text-neutral-800 dark:text-white/60"
                  >
                    <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2"></path>
                    <path d="M7 9l5 -5l5 5"></path>
                    <path d="M12 4l0 12"></path>
                  </svg>
                </div>
                <div className="absolute border opacity-0 group-hover:opacity-80 transition-all duration-300 border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center size-20 mx-auto rounded-full"></div>
                <p className={`text-sm font-medium mt-2 ${
                  disabled ? "text-gray-400" : "text-gray-600"
                }`}>
                  Click to upload a photo
                </p>
                <p className={`text-xs mt-1 ${
                  disabled ? "text-gray-300" : "text-gray-500"
                }`}>
                  JPG, PNG, GIF (Max 5MB)
                </p>
              </div>
            )}
          </div>
        </div>
      );
    };

    return <CustomImageUpload />;
  }
);