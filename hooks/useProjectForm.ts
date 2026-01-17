import { FormErrors, ProjectFormData, TouchedFields } from "@/app/types/project.types";
import { projectFormSchema } from "@/lib/validation/project.validation";
import { useState, useCallback } from "react";
import { z } from "zod";

export const useProjectForm = () => {
  const [formData, setFormData] = useState<Partial<ProjectFormData>>({
    title: "",
    tagline: "",
    problemStatement: "",
    solutionDescription: "",
    category: "",
    coverImages: [],
    videoFile: null,
    pitchDeck: null,
    targetCompanyId: undefined,
    fundingGoal: "",
    repoLink: "",
    techStack: [],
    roadmap: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);

  const validateField = useCallback((name: keyof ProjectFormData, value: any) => {
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
        const fieldError = (error as z.ZodError).issues.find((err: z.ZodIssue) =>
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
  }, [formData]);

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

  const handleImagesChange = (files: FileList | File[]) => {
    const newFiles = Array.from(files);
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    // Filter valid files
    const validFiles = newFiles.filter(file => {
      if (file.size > 5000000) return false;
      if (!validTypes.includes(file.type)) return false;
      return true;
    });

    if (validFiles.length !== newFiles.length) {
      setErrors(prev => ({ ...prev, coverImages: "Some images were invalid (too large or wrong format)" }));
    }

    const updatedImages = [...(formData.coverImages || []), ...validFiles].slice(0, 6);
    setFormData(prev => ({ ...prev, coverImages: updatedImages }));

    // Update previews
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls].slice(0, 6));

    if (touched.coverImages) {
      validateField("coverImages", updatedImages);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = (formData.coverImages || []).filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, coverImages: updatedImages }));

    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    setPreviewUrls(updatedPreviews);

    validateField("coverImages", updatedImages);
  };

  const handleVideoChange = (file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, videoFile: null }));
      setVideoPreviewUrl(null);
      return;
    }

    if (file.size > 50000000) {
      setErrors(prev => ({ ...prev, videoFile: "Video must be less than 50MB" }));
      return;
    }

    setFormData(prev => ({ ...prev, videoFile: file }));

    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
    }

    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
    validateField("videoFile", file);
  };

  const handlePitchDeckChange = (file: File | null) => {
    if (!file) {
      setFormData(prev => ({ ...prev, pitchDeck: null }));
      return;
    }

    if (file.size > 10000000) {
      setErrors(prev => ({ ...prev, pitchDeck: "PDF must be less than 10MB" }));
      return;
    }

    setFormData(prev => ({ ...prev, pitchDeck: file }));
    validateField("pitchDeck", file);
  };

  const validateForm = (): { isValid: boolean; errors?: FormErrors } => {
    try {
      projectFormSchema.parse(formData);
      setErrors({});
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: FormErrors = {};
        error.issues.forEach((issue: z.ZodIssue) => {
          const path = issue.path[0];
          if (typeof path === 'string') {
            fieldErrors[path as keyof ProjectFormData] = issue.message;
          }
        });

        setErrors(fieldErrors);

        // Touch all fields that have errors
        const newTouched = { ...touched };
        Object.keys(fieldErrors).forEach(key => {
          newTouched[key as keyof ProjectFormData] = true;
        });
        setTouched(newTouched);

        return { isValid: false, errors: fieldErrors };
      }
      return { isValid: false };
    }
  };

  const validateStep = useCallback((fields: (keyof ProjectFormData)[]): boolean => {
    // 1. Create a partial schema for only the requested fields
    const stepSchema = projectFormSchema.pick(
      fields.reduce((acc, field) => ({ ...acc, [field]: true }), {})
    );

    // 2. Validate the data
    const result = stepSchema.safeParse(formData);

    // 3. Update errors and touched state
    const newErrors = { ...errors };
    const newTouched = { ...touched };

    // Mark all target fields as touched
    fields.forEach(field => {
      newTouched[field] = true;
    });

    if (!result.success) {
      // Map Zod issues back to our errors object
      result.error.issues.forEach(issue => {
        const fieldPath = issue.path[0] as keyof ProjectFormData;
        if (fields.includes(fieldPath)) {
          newErrors[fieldPath] = issue.message;
        }
      });

      setErrors(newErrors);
      setTouched(newTouched);
      return false;
    }

    // Clean up errors for successfully validated fields
    fields.forEach(field => {
      delete newErrors[field];
    });

    setErrors(newErrors);
    setTouched(newTouched);
    return true;
  }, [formData, errors, touched]);

  const resetForm = () => {
    setFormData({
      title: "",
      tagline: "",
      problemStatement: "",
      solutionDescription: "",
      category: "",
      coverImages: [],
      videoFile: null,
      pitchDeck: null,
      targetCompanyId: undefined,
      fundingGoal: "",
      repoLink: "",
      techStack: [],
      roadmap: ""
    });
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setPreviewUrls([]);
    setVideoPreviewUrl(null);
    setErrors({});
    setTouched({});
  };

  const getFormData = (): FormData => {
    const formDataObj = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value === null || value === undefined) return;

      if (key === 'coverImages' && Array.isArray(value)) {
        value.forEach((file) => formDataObj.append('coverImages', file));
      } else if (key === 'techStack' && Array.isArray(value)) {
        value.forEach((tech) => formDataObj.append('techStack', tech));
      } else if (value instanceof File) {
        formDataObj.append(key, value);
      } else {
        formDataObj.append(key, String(value));
      }
    });

    return formDataObj;
  };

  return {
    formData,
    errors,
    touched,
    previewUrls,
    videoPreviewUrl,
    handleInputChange,
    handleBlur,
    handleImagesChange,
    handleVideoChange,
    handlePitchDeckChange,
    removeImage,
    validateForm,
    validateStep,
    resetForm,
    getFormData,
  };
};