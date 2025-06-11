"use client";

import React, { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Camera, Upload, X } from "lucide-react";
import { toastCustom } from "../Toast/SonnerToast";
import {
  uploadImage,
  SupabaseFolder,
} from "@/app/utils/Actions/SupaBase/ActionsImages";
import { FiSave } from "react-icons/fi";
import { updateUserProfilePhoto } from "../UserManagment";
import { TokenResponse } from "@/app/utils/Domain/AuthenticationActions/TypesAuth";
import { updateAuthCookies } from "@/app/utils/Domain/AuthenticationActions/AuthCookie";
import { redirectToSoccer } from "@/app/utils/Domain/AuthenticationActions/AuthImpSpring";

interface ImageUploadProps {
  imageUrl?: string;
  className?: string;
  id: string;
}

export default function ImageUpload({
  imageUrl,
  className,
  id,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (imageUrl) {
      setPreview(imageUrl);
    }
  }, [imageUrl]);

  const handleFileSelect = useCallback((file: File) => {
    if (!file) return;

    if (!file.type.match("image.*")) {
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

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setPreview(imageData);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDeleteImage = async () => {
    if (!imageUrl) return;

    setIsDeleting(true);

    try {
      // Delete from Supabase storage if it's not the default avatar
      if (!imageUrl.includes("default-avatar.png")) {
        // await deleteImag(imageUrl, "fut-next-images");
      }

      // Reset the preview
      setPreview(null);

      toastCustom(
        {
          title: "Success",
          description: "Profile photo has been removed",
          button: { label: "OK", onClick: () => {} },
        },
        "success",
        3000
      );
    } catch (error) {
      console.error("Delete error:", error);
      toastCustom(
        {
          title: "Error",
          description: `Failed to remove photo: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          button: { label: "Dismiss", onClick: () => {} },
        },
        "error",
        7000
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateUserPhoto = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const publicUrl = await uploadImage(
        selectedFile,
        SupabaseFolder.CATEGORIES,
        id
      );

      const idUser = id as string;

      setPreview(publicUrl.url);

      toastCustom(
        {
          title: "Success",
          description: "Your profile photo has been updated",
          button: { label: "Great!", onClick: () => {} },
        },
        "success",
        3000
      );

      const response = await updateUserProfilePhoto({
        id: id,
        profilePhoto: publicUrl.url,
      });

      const tokenResponse = response as TokenResponse;
      console.log("tokenResponse", tokenResponse);
      // Proceed with login logic (e.g., verify user credentials)
      const cookies = await updateAuthCookies(tokenResponse);
      console.log("cookies", cookies);
    } catch (error) {
      console.error("Upload error:", error);
      toastCustom(
        {
          title: "Error",
          description: `Failed to update photo: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          button: { label: "Dismiss", onClick: () => {} },
        },
        "error",
        7000
      );
    }
      // setIsUploading(false);
      // setSelectedFile(null);
      await redirectToSoccer();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // const removeImage = () => {
  //   setPreview(imageUrl || null);
  //   setSelectedFile(null);
  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = "";
  //   }
  // };

  const imageSrc = preview || imageUrl || "/default-avatar.png";

  return (
    <div
      className={`relative flex flex-col items-center justify-center w-full h-full rounded-full ${className}`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload image"
      />
      {id}

      <div className="relative w-full h-full rounded-full overflow-hidden">
        {imageSrc ? (
          <>
            <Image
              src={imageSrc}
              alt="Profile preview"
              fill
              className="object-cover"
              // unoptimized={imageSrc.startsWith('blob:') || imageSrc.startsWith('data:') || imageSrc.includes('default-avatar.png')}
            />
            <div className="absolute inset-0 flex items-end justify-center p-2 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="p-2 bg-transparent rounded-full text-white  transition-colors"
                  aria-label="Change image"
                >
                  <Camera size={18} />
                </button>
                {selectedFile ? (
                  <button
                    type="button"
                    onClick={handleUpdateUserPhoto}
                    disabled={isUploading}
                    className={`p-2 ${
                      isUploading ? "bg-transparent" : "bg-transparent"
                    } rounded-full text-white  transition-colors`}
                    aria-label="Save changes"
                  >
                    <FiSave size={18} className="" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    disabled={isDeleting}
                    className={`p-2 ${
                      isDeleting ? "bg-transparent" : "bg-transparent "
                    } rounded-full text-red-500 transition-colors`}
                    aria-label="Remove image"
                  >
                    {isDeleting ? "Deleting..." : <X size={18} />}
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <div
            onClick={triggerFileInput}
            className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-all"
          >
            <Upload size={36} className="text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-600">
              Click to upload a photo
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, GIF (Max 5MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
