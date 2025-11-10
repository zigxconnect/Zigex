import { FormErrors, ProjectFormData, TouchedFields } from "@/app/types/project.types";
import { projectFormSchema } from "@/lib/validation/project.validation";
import { useState } from "react";
import { z } from "zod";


export const useProjectForm = () => {
  const [formData, setFormData] = useState<Partial<ProjectFormData>>({
    title: "",
    description: "",
    githubLink: "",
    youtubeLink: "",
    duration: "",
    coverImage: null,
    uploadedVideo: null
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  const validateField = (name: keyof ProjectFormData, value: any) => {
    try {
      const dataToValidate = { ...formData, [name]: value };
      projectFormSchema.parse(dataToValidate);
      
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors.find(err => 
          err.path.length > 0 && err.path[0] === name
        );
        
        if (fieldError) {
          setErrors(prev => ({ 
            ...prev, 
            [name]: fieldError.message 
          }));
        } else {
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }
      }
    }
  };

  const handleInputChange = (name: keyof ProjectFormData, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (name: keyof ProjectFormData) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const currentValue = formData[name];
    validateField(name, currentValue);
  };

  const handleImageChange = (file: File | null) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    
    if (file.size > 5000000) {
      setErrors(prev => ({ ...prev, coverImage: "Image must be less than 5MB" }));
      return;
    }

    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        coverImage: "Only .jpg, .jpeg, .png, .webp, and .gif formats are supported" 
      }));
      return;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.coverImage;
      return newErrors;
    });

    setFormData(prev => ({ ...prev, coverImage: file }));
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleVideoChange = (file: File | null) => {
    if (!file) return;

    const validTypes = ["video/mp4", "video/webm", "video/ogg"];
    
    if (file.size > 50000000) {
      setErrors(prev => ({ ...prev, uploadedVideo: "Video must be less than 50MB" }));
      return;
    }

    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({ 
        ...prev, 
        uploadedVideo: "Only .mp4, .webm, and .ogg formats are supported" 
      }));
      return;
    }

    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.uploadedVideo;
      return newErrors;
    });

    setFormData(prev => ({ ...prev, uploadedVideo: file }));
    
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
  };

  const removeImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setFormData(prev => ({ ...prev, coverImage: null }));
    setPreviewUrl(null);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.coverImage;
      return newErrors;
    });
  };

  const removeVideo = () => {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setFormData(prev => ({ ...prev, uploadedVideo: null }));
    setVideoPreviewUrl(null);
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.uploadedVideo;
      return newErrors;
    });
  };

  const validateForm = (): { isValid: boolean; errors?: FormErrors } => {
    try {
      // Parse with schema
      projectFormSchema.parse(formData);
      // Clear errors if validation passes
      setErrors({});
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Create a new errors object
        const fieldErrors: FormErrors = {};
        
        // Safely process each validation error
        error.issues.forEach((issue: z.ZodIssue) => {
          const path = issue.path[0];
          if (typeof path === 'string' && path in formData) {
            fieldErrors[path as keyof ProjectFormData] = issue.message;
          }
        });

        // Update the errors state
        setErrors(fieldErrors);
        
        // Update touched state for fields with errors
        const newTouched = { ...touched };
        Object.keys(fieldErrors).forEach(key => {
          if (key in formData) {
            newTouched[key as keyof ProjectFormData] = true;
          }
        });
        setTouched(newTouched);
        
        return { isValid: false, errors: fieldErrors };
      }
      // Handle unexpected errors
      console.error('Unexpected validation error:', error);
      setErrors({});
      return { isValid: false };
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      githubLink: "",
      youtubeLink: "",
      duration: "",
      coverImage: null,
      uploadedVideo: null
    });
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }
    setPreviewUrl(null);
    setVideoPreviewUrl(null);
    setErrors({});
    setTouched({});
  };

  const isFormValid = () => {
    try {
      projectFormSchema.parse(formData);
      return true;
    } catch {
      return false;
    }
  };

  const getFormData = (): FormData => {
    const formDataObj = new FormData();
    
    if (formData.title) formDataObj.append('title', formData.title);
    if (formData.description) formDataObj.append('description', formData.description);
    if (formData.githubLink) formDataObj.append('githubLink', formData.githubLink);
    if (formData.youtubeLink) formDataObj.append('youtubeLink', formData.youtubeLink);
    if (formData.duration) formDataObj.append('duration', formData.duration);
    if (formData.coverImage) formDataObj.append('coverImage', formData.coverImage);
    if (formData.uploadedVideo) formDataObj.append('uploadedVideo', formData.uploadedVideo);
    
    return formDataObj;
  };

  return {
    formData,
    errors,
    touched,
    previewUrl,
    videoPreviewUrl,
    handleInputChange,
    handleBlur,
    handleImageChange,
    handleVideoChange,
    removeImage,
    removeVideo,
    validateForm,
    resetForm,
    isFormValid,
    getFormData
  };
};