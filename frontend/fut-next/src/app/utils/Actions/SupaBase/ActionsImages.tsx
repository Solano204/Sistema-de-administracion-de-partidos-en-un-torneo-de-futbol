"use client";

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dxfjdqqppxfoobevbubc.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ZmpkcXFwcHhmb29iZXZidWJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MDMxNTUsImV4cCI6MjA2MjM3OTE1NX0.DrC5DylE2H1AlAK8iYv7XRPg3aeWzpWdYywPhceaaRY';

export enum SupabaseFolder {
  CATEGORIES = 'CategoriesImages',
  TEAM = 'TeamImages',
  PLAYER = 'PlayerImages',
  USERS = 'ImagesProfilesUsers',
  REFEREEES = 'RefereesImages'
}

export const SUPABASE_BUCKET_NAME = 'fut-next-images';

const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadImage = async (
  file: File, 
  folderType: SupabaseFolder,
  id: string,
  options?: {
    bucketName?: string;
    customFileName?: string;
  }
) => {
  try {
    const bucketName = options?.bucketName || SUPABASE_BUCKET_NAME;
    const fileExt = file.name.split('.').pop();
    const fileName = options?.customFileName || `${id}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${folderType}/${fileName}`;

    // Upload the file directly
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        contentType: file.type,
        cacheControl: '3600',
        // upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error('Failed to generate public URL');
    }

    // Return both path and URL for flexibility
    return {
      path: filePath,
      url: publicUrl
    };
  } catch (error) {
    console.error('Upload failed:', error);
    throw new Error(`Image upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Add this function to check if image exists and is accessible
export const checkImageAccess = async (filePath: string, bucketName = SUPABASE_BUCKET_NAME) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, 60); // 60 seconds expiry

    if (error || !data?.signedUrl) {
      return false;
    }
    
    const response = await fetch(data.signedUrl);
    return response.ok;
  } catch (error) {
    console.error('Error checking image access:', error); 
    return false;
  }
};