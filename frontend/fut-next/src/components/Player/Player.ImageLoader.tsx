"use client";
import Image from "next/image";
import { ChangeEvent } from "react";
import { LuTrash2 } from "react-icons/lu";

interface ImageUploadFieldProps {
  imageUrl: string;
  onImageChange: (file: File | null, previewUrl: string) => void;
}

export function ImageUploadField({ imageUrl, onImageChange }: ImageUploadFieldProps) {
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const previewUrl = reader.result as string;
        onImageChange(file, previewUrl);
      };
      reader.readAsDataURL(file);
    } else {
      onImageChange(null, "");
    }
  };

  return (
    <div className="absolute rounded-full overflow-hidden image-upload-container border-2 border-green-500 size-30 transform -translate-x-1/2 left-1/2 top-[-100px]  cursor-pointer z-[200]">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        id="player-image-upload"
        style={{ display: "none" }}
      />
      <label htmlFor="player-image-upload" className="upload-label h-full w-full flex items-center relative justify-center">
        {imageUrl ? (
          <Image
            fill
            src={imageUrl}
            alt="Player preview"
            className="preview-image h-full w-full object-cover"
          />
        ) : (
          <div className="upload-placeholder">
            <span>+ Upload Photo</span>
          </div>
        )}
      </label>
      {imageUrl && (
        <LuTrash2 
          type="button"
          onClick={() => onImageChange(null, "")}
          className="remove-image-btn absolute top-2 right-[50px] text-red-600 p-1 rounded z-[201] size-[30px] "
        >
          Remove
        </LuTrash2>
      )}
    </div>
  );
};