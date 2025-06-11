import { UserRole,UserChangeUserName,UserDetailsRecordFull,UserDetailsRecordFullWithPassword,UserLoginRecord,UserRegisterRecord,UserStatus,UserUpdateBasicInformation,UserUpdatePassword,UserUpdateProfilePhoto,UserValidationErrors} from "./types/types-user";
import { calculateAge,   validateUserPhotoUpdate, validateUserRegistration, validateUserStatus, validateUserUpdate, validateUserUpdateBasicInfoField,validatePasswordChange,validateUserChangePasswordField,validateUserChangeUsernameField,validateUserRegisterField,validateUsernameChange,UserChangePasswordErrors, UserChangeUserNameErrors,UserRegisterErrors,UserUpdateBasicInfoErrors,UserUpdatePasswordErrors,UserUpdateUserNameErrors} from "./utils/user-validations"

import { useUserById, useUpdateUserDetails, useUpdateUserPhoto, useChangeUserPassword, useChangeUserName,useDeleteUser,useRegisterUser,useUpdateUserStatus,useUsersByRole } from "./hooks/user-hooks";
    import { changeUserName, fetchUserById, fetchUsersByRole, loginUser, registerUser, updateUserDetails, updateUserProfilePhoto, updateUserStatus,deleteUser} from "./api/api-users";

    // import { UserList} from "./components/userManagment";
    import { UserBaseSchema,UserChangeUsernameSchema,UserPasswordUpdateSchema,UserPhotoSchema,UserRegisterSchema,UserStatusSchema,UserUpdateSchema,UserRoleSchema,UserStatusUpdateSchema,extractValidationErrors} from "./schemas/user-schemas";

    import {  getStatusClass,roleOptions,statusOptions,useUserManagement} from "./hooks/UserHooksComponents";
    import {  CreateEditForm,PasswordForm,PhotoForm,UsernameForm} from "./components/UseForm";

export {
    UserRole, UserStatus
};
export type {
    UserRegisterRecord,
    UserLoginRecord,
    UserDetailsRecordFull,
    UserDetailsRecordFullWithPassword, UserUpdateBasicInformation,
    UserUpdateProfilePhoto,
    UserUpdatePassword,
    UserChangeUserName,
    UserRegisterErrors,
    UserUpdateBasicInfoErrors,
    UserUpdatePasswordErrors,
    UserUpdateUserNameErrors,
    UserChangePasswordErrors,
    UserChangeUserNameErrors,
    
    UserValidationErrors
};

export {
    getStatusClass,roleOptions,statusOptions,useUserManagement,
    CreateEditForm,PasswordForm,PhotoForm,UsernameForm,
    calculateAge,
    validateUserPhotoUpdate,
    validateUserRegistration,
    validateUserStatus,
    validateUserUpdate,
    validateUserUpdateBasicInfoField,
    validatePasswordChange,
    validateUserChangePasswordField,
    validateUserChangeUsernameField,
    validateUserRegisterField,
    validateUsernameChange,
    useUserById,
    useUpdateUserDetails,
    useUpdateUserPhoto,
    useChangeUserPassword,
    useChangeUserName,
    changeUserName,
    // changeUserPassword, 
    fetchUserById,
    fetchUsersByRole,
    loginUser,
    registerUser,
    updateUserDetails,
    updateUserProfilePhoto,
    updateUserStatus,
    // UserList,
    useDeleteUser,
    useRegisterUser,
    useUpdateUserStatus,
    useUsersByRole,
    deleteUser,
   UserBaseSchema,
    UserChangeUsernameSchema,

    UserPasswordUpdateSchema,
    UserPhotoSchema,
    UserRegisterSchema,
    UserStatusSchema,
    UserUpdateSchema,
    UserRoleSchema,
    extractValidationErrors,
    UserStatusUpdateSchema  
};