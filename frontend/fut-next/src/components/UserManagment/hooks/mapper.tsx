import { UserRegisterRecord } from "../types/types-user";

// Map TypeScript interface to Java record structure
export const mapToBackendFormat = (userData: Partial<UserRegisterRecord>): any => {
    return {
      id: userData.id || null,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      birthDate: userData.birthDate, // Ensure this is in ISO format (YYYY-MM-DD)
      age: userData.age,
      user: userData.user,
      password: userData.password,
      role: userData.role,
      urlPhoto: userData.profilePhoto // Mapping profilePhoto to urlPhoto
    };
  };