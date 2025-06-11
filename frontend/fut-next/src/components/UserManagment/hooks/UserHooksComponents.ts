"use client"
import { useState, useEffect, useRef } from "react";
import { SelectOption } from "@/components/common/Common.Select";
import { toastCustom } from "@/components/Toast/SonnerToast";
import { uploadImage } from "@/app/utils/Actions/SupaBase/ActionsImages";

import {
  useUsersByRole,
  useUpdateUserDetails,
  useUpdateUserPhoto,
  useChangeUserPassword,
  useChangeUserName,
  useDeleteUser,
  validateUserRegisterField,
  validateUserRegistration,
  useRegisterUser,
  UserRole,
  UserStatus,
  UserDetailsRecordFull,
  UserUpdateBasicInformation,
  UserRegisterRecord,
  validateUserUpdateBasicInfoField,
  validateUserChangePasswordField,
  validateUserChangeUsernameField,
  calculateAge,
} from "../";
import { SupabaseFolder } from "@/components/CategoryManagment/services/action";

export const useUserManagement = () => {
  // Role filtering state
  const [selectedRole, setSelectedRole] = useState<SelectOption<UserRole> | null>(null);



  // Modal states
  const [activeModal, setActiveModal] = useState<"create" | "edit" | "photo" | "password" | "username" | null>(null);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Selected user state
  const [selectedUser, setSelectedUser] = useState<UserDetailsRecordFull | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<Partial<UserUpdateBasicInformation>>({});
  const [registerFormData, setRegisterFormData] = useState<Partial<UserRegisterRecord>>({});
  const [photoData, setPhotoData] = useState<{ id: string, profilePhoto: string | null }>({ id: "", profilePhoto: null });
  const [passwordData, setPasswordData] = useState({  newPassword: "", confirmPassword: "" });
  const [usernameData, setUsernameData] = useState({ currentPassword: "", currentUsername: "", newUsername: "" });
  const [tempImageFile, setTempImageFile] = useState<File | null>(null);
      const imageUploadRef = useRef<{ selectedFile: File | null }>({ selectedFile: null });
      useEffect(() => { 
          console.log("informartion register", registerFormData)
      })
     
  // Validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string[] | undefined>>({});
  const [errorsRegister, setErrorsRegister] = useState<Record<string, string[] | undefined>>({});
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string[] | undefined>>({});
  const [usernameErrors, setUsernameErrors] = useState<Record<string, string[] | undefined>>({});
  const [errorsUpdateBasicInfo, setErrorsUpdateBasicInfo] = useState<Record<string, string[] | undefined>>({});
  
  // Form validation states
  const [isValidPassword, setIsValidPassword] = useState(true);
  const [isValidUsername, setIsValidUsername] = useState(true);
  const [isValidCreate, setIsValidCreate] = useState(false);
  const [isValidUpdate, setIsValidUpdate] = useState(false);
  
  // API hooks
  const {
    data: users = [],
    isLoading,
    error,
    refetch
  } = useUsersByRole(selectedRole?.value || null);
  
  const updateDetailsMutation = useUpdateUserDetails();
  const updatePhotoMutation = useUpdateUserPhoto();
  const changePasswordMutation = useChangeUserPassword();
  const changeUserNameMutation = useChangeUserName();
  const deleteUserMutation = useDeleteUser();
  const registerMutation = useRegisterUser();
  
  // Initialize form with selected user data when a user is selected
  useEffect(() => {
    if (selectedUser && modalMode === "edit") {
      setFormData({
        id: selectedUser.id,
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        email: selectedUser.email,
        birthDate: selectedUser.birthDate,
        age: selectedUser.age,
        role: selectedUser.role
      });
    } else if (selectedUser && activeModal === "photo") {
      setPhotoData({
        id: selectedUser.id,
        profilePhoto: selectedUser.urlPhoto,
      });
    } else if (selectedUser && activeModal === "username") {
      setUsernameData(prev => ({
        ...prev,
        currentUsername: selectedUser.user,
      }));
    }
  }, [selectedUser, activeModal, modalMode]);
  
  // Form handling functions
  const handleRoleFilterChange = (option: SelectOption<UserRole> | null) => {
    setSelectedRole(option);
  };

  const handleRoleChange = (option: SelectOption<UserRole> | null) => {
    if (modalMode === "create") {
      setRegisterFormData(prev => ({
        ...prev,
        role: option?.value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        role: option?.value
      }));
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    const error = validateUserUpdateBasicInfoField(
      name as keyof UserUpdateBasicInformation,
      value,
      formData
    );

    if (name === "birthDate") {
      // Calculate age when birthdate changes
      const age = calculateAge(value);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        age,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }

    setErrorsUpdateBasicInfo(prev => {
      const newErrors = {
        ...prev,
        [name]: error ? [error] : undefined,
      };
      
      // Check if all fields are valid
      const isValid = !Object.values(newErrors).some(
        err => err !== undefined && err.length > 0
      );
      setIsValidUpdate(isValid);
      
      return newErrors;
    });
  };
  
  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    // Real-time validation
    const error = validateUserRegisterField(
      name as keyof UserRegisterRecord,
      value,
      registerFormData
    );
    
    if (name === "birthDate") {
      // Calculate age when birthdate changes
      const age = calculateAge(value);
      setRegisterFormData(prev => ({
        ...prev,
        [name]: value,
        age,
      }));
    } else {
      setRegisterFormData(prev => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value,
      }));
    }

    // Update errors
    setErrorsRegister(prev => {
      const newErrors = {
        ...prev,
        [name]: error ? [error] : undefined,
      };

      // Check if all fields are valid (no errors)
      const isValid = !Object.values(newErrors).some(
        error => error !== undefined && error.length > 0
      );

      // Update valid state based on error presence
      setIsValidCreate(isValid);
      return newErrors;
    });
  };
  
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const error = validateUserChangePasswordField(
      name as any,
      value,
      passwordData
    );
    
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Update errors and check validity
    setPasswordErrors(prev => {
      const newErrors = {
        ...prev,
        [name]: error ? [error] : undefined,
      };

      // Special handling for confirm password match
      if (name === "newPassword" || name === "confirmPassword") {
        const newPassword =
          name === "newPassword" ? value : passwordData.newPassword;
        const confirmPassword =
          name === "confirmPassword" ? value : passwordData.confirmPassword;

        if (newPassword && confirmPassword) {
          newErrors.confirmPassword =
            newPassword !== confirmPassword
              ? ["Passwords don't match"]
              : undefined;
        }
      }

      // Check if form is completely valid
      const isValid = Object.values(newErrors).every(
        error => !error || error.length === 0
      );

      setIsValidPassword(isValid);
      return newErrors;
    });
  };
  
  const handleUsernameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const error = validateUserChangeUsernameField(
      name as any,
      value,
      usernameData
    );

    setUsernameData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Update errors and check validity
    setUsernameErrors(prev => {
      const newErrors = {
        ...prev,
        [name]: error ? [error] : undefined,
      };

      // Check if form is completely valid
      const isValid = Object.values(newErrors).every(
        error => !error || error.length === 0
      );

      setIsValidUsername(isValid);
      return newErrors;
    });
  };

  // Replace the existing handleImageChangeCreate function with this:

const handleImageChangeCreate = (e: React.ChangeEvent<HTMLInputElement>) =>   {
  const file = e.target.files?.[0];
  if (file) {
    // Create a local URL for the selected file
    const imageUrl = URL.createObjectURL(file);
    
    setRegisterFormData(prev => ({
      ...prev,
      urlPhoto: imageUrl
    }));
    
    // Also store the file for upload later if needed
    if (imageUploadRef.current) {
      imageUploadRef.current.selectedFile = file;
    }
  }
};
  
  // Modal handlers
  const handleOpenModal = (modalType: "edit" | "photo" | "password" | "username", user: UserDetailsRecordFull) => {
    setSelectedUser(user);
    setActiveModal(modalType);
    
    if (modalType === "edit") {
      setModalMode("edit");
      setIsModalOpen(true);
    }
    
    // Reset form states
    if (modalType === "password") {
      setPasswordData({  newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
    } else if (modalType === "username") {
      setUsernameData({ currentPassword: "", currentUsername: user.user, newUsername: "" });
      setUsernameErrors({});
    }
  };
  
  const handleOpenCreateModal = () => {
    setModalMode("create");
    setActiveModal("create");
    setIsModalOpen(true);
    setRegisterFormData({
      firstName: "",
      lastName: "",
      email: "",
      birthDate: new Date().toISOString().split("T")[0],
      age: 0,
      user: "",
      password: "",
      role: UserRole.JUGADOR, // Default role
      status: UserStatus.ACTIVO, // Default status
      profilePhoto: ""
    });
    setErrorsRegister({});
  };
  
  const handleCloseModal = () => {
    setActiveModal(null);
    setModalMode("create");
    setIsModalOpen(false);
    setSelectedUser(null);
    setFormData({});
    setRegisterFormData({});
    setPhotoData({ id: "", profilePhoto: null });
    setPasswordData({  newPassword: "", confirmPassword: "" });
    setUsernameData({ currentPassword: "", currentUsername: "", newUsername: "" });
    setFormErrors({});
    setErrorsRegister({});
    setErrorsUpdateBasicInfo({});
    setPasswordErrors({});
    setUsernameErrors({});
    setTempImageFile(null);
  };
  
  // Form submission handlers
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    try {
      await updateDetailsMutation.mutateAsync({
        userId: selectedUser.id,
        details: formData
      });
      
      handleCloseModal();
      refetch();
    } catch (error) {
      // Error is handled in mutation
    }
  };
  
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentData = { ...registerFormData };
    
    let updatedPhotoUrl = photoData.profilePhoto; 
    try {


        console.log("TEMfILE",tempImageFile)
        console.log("console", imageUploadRef.current, "temFile",tempImageFile)
      // Upload the image if available
      if (registerFormData.profilePhoto ) {
        console.log("image", imageUploadRef.current?.selectedFile)
        const folder = SupabaseFolder.USERS;
        const uploadResult = await uploadImage(
          imageUploadRef.current?.selectedFile as File,
          folder,
          photoData.id
        );
        
        updatedPhotoUrl = uploadResult.url;
        console.log("after", updatedPhotoUrl)
        // Update the form data with the new photo URL
        
    }

    currentData.profilePhoto= updatedPhotoUrl as string;
      
      currentData.id = "201f45bb-e639-418d-a2ba-c81d8f26fd11"
      console.log("id",currentData.id)
      console.log("Data curent",currentData)
      const validatedData = validateUserRegistration(currentData);
      console.log("validateDate",validatedData)
      await registerMutation.mutateAsync(validatedData);
      handleCloseModal();
      refetch();
    } catch (error) {
      if (error instanceof Error) {
        try {
          const parsedErrors = JSON.parse(error.message);
          setErrorsRegister(parsedErrors);
        } catch {
          toastCustom(
            {
              title: "Error",
              description: `Form validation failed: ${error.message}`,
              button: { label: "Dismiss", onClick: () => {} },
            },
            "error",
            7000
          );
        }
      } else {
        toastCustom(
          {
            title: "Error",
            description: "An unknown error occurred",
            button: { label: "Dismiss", onClick: () => {} },
          },
          "error",
          7000
        );
      }
    }
  };
  
  const handleUpdatePhotoSubmit = async (e: React.FormEvent, selectedFile: File | null) => {
    e.preventDefault();
    
    if (!selectedUser || !photoData.profilePhoto) return;
    
    try {
      let newPhotoUrl: string;
  
      if (selectedFile) {
        const folder = SupabaseFolder.USERS;
        const newphoto = await uploadImage(
          selectedFile,
          folder,
          photoData.id
        );
        newPhotoUrl = newphoto.url;
      } else {
        newPhotoUrl = photoData.profilePhoto;
      }
      
      await updatePhotoMutation.mutateAsync({
        id: selectedUser.id,
        profilePhoto: newPhotoUrl,
      });
      
      handleCloseModal();
      refetch();
    } catch (error) {
      // Error is handled in mutation
      console.error("Error updating user photo:", error);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    try {
      await changePasswordMutation.mutateAsync({
        userId: selectedUser.id,
        username: selectedUser.user,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword
      });
      
      handleCloseModal();
    } catch (error) {
      // Error is handled in mutation
    }
  };
  
  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) return;
    
    try {
      await changeUserNameMutation.mutateAsync({
        userId: selectedUser.id,
        currentPassword: usernameData.currentPassword,
        currentUsername: usernameData.currentUsername,
        newUsername: usernameData.newUsername
      });
      
      handleCloseModal();
      refetch();
    } catch (error) {
      // Error is handled in mutation
      console.error("Error changing username:", error);
    }
  };
  


  useEffect(
    () =>{
        console.log("image",tempImageFile)
    }
  )
  
  const captureSelectedFile = (file: File | null) => {
    if (file) {
      // Create a local URL for the selected file
      const localUrl = URL.createObjectURL(file);
      
      setTempImageFile(file);
      setPhotoData(prev => ({
        ...prev,
        profilePhoto: localUrl || "",
      }));
    }
  };
  const captureSelectedFileCreate = (file: File | null) => {
    if (file) {
      // 1. Create a local URL for preview
      const localUrl = URL.createObjectURL(file);
      
      // 2. Update form data with preview URL
      setRegisterFormData(prev => ({
        ...prev,
        profilePhoto: localUrl,
        fileImage: file
      }));
      
      // 3. Store the actual File object in ref
      if (imageUploadRef.current) {
        imageUploadRef.current.selectedFile = file;
      }
      
      console.log("file",file)
      // 4. Store temporary reference (if needed elsewhere)
      setTempImageFile(prevFile => {
        console.log('Previous temp file:', prevFile);
        console.log('New temp file:', file);
        return file;
      });
      // 5. Update photo data state (if needed)
      setPhotoData(prev => ({
        ...prev,
        profilePhoto: localUrl,
      }));
      // Handle file removal case
      setRegisterFormData(prev => ({
        ...prev,
        profilePhoto: localUrl,
      }));
      
      if (imageUploadRef.current) {
        imageUploadRef.current.selectedFile = null;
      }
      
      setTempImageFile(null);
      setPhotoData(prev => ({
        ...prev,
        profilePhoto: localUrl,
      }));}
      console.log("csdxdfdff")
    
  };
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This cannot be undone.")) {
      try {
        await deleteUserMutation.mutateAsync(userId);
        refetch();
      } catch (error) {
        console.error("Error deleting user:", error);
        // Error is handled in mutation
      }
    }
  };

  return {
    // State
    users,
    isLoading,
    error,
    selectedRole,
    selectedUser,
    activeModal,
    modalMode,
    isModalOpen,
    formData,
    registerFormData,
    photoData,
    passwordData,
    usernameData,
    tempImageFile,
    formErrors,
    errorsRegister,
    errorsUpdateBasicInfo,
    passwordErrors,
    usernameErrors,
    isValidPassword,
    isValidUsername,
    isValidCreate,
    isValidUpdate,
    
    // Handlers
    handleRoleFilterChange,
    handleRoleChange,
    handleInputChange,
    handleRegisterInputChange,
    handlePasswordInputChange,
    handleUsernameInputChange,
    handleImageChangeCreate,
    handleOpenModal,
    handleOpenCreateModal,
    handleCloseModal,
    handleUpdateSubmit,
    handleRegisterSubmit,
    handleUpdatePhotoSubmit,
    imageUploadRef,
    handlePasswordSubmit,
    handleUsernameSubmit,
    captureSelectedFile,
    captureSelectedFileCreate,
    handleDeleteUser,
    
    // Utils
    refetch
  };
};

// Helper function for status class
export const getStatusClass = (status: UserStatus): string => {
  switch (status) {
    case UserStatus.ACTIVO:
      return "bg-green-100 text-green-800";
    case UserStatus.INACTIVO:
      return "bg-red-100 text-red-800";
    case UserStatus.SUSPENDIDO:
      return "bg-yellow-100 text-yellow-800";
    case UserStatus.PENDIENTE:
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const roleOptions: SelectOption<UserRole>[] = [
  { label: "Administrator", value: UserRole.ADMINISTRADOR },
  { label: "Referee", value: UserRole.ARBITRO },
  { label: "Player", value: UserRole.JUGADOR },
];

export const statusOptions: SelectOption<UserStatus>[] = [
  { label: "Active", value: UserStatus.ACTIVO },
  { label: "Inactive", value: UserStatus.INACTIVO },
  { label: "Suspended", value: UserStatus.SUSPENDIDO },
  { label: "Pending", value: UserStatus.PENDIENTE },
];