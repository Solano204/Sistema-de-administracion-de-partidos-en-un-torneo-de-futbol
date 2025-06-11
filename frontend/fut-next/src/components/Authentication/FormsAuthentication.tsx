"use server";
import React from "react";
import { Input } from "../ui/input";
import { FormContainer, SubmitButton } from "../ui/Form";
import {
  logIn,
  signUp,
  changePassword,
  changeUsername,
  updateUserDetails,
} from "@/app/utils/Domain/AuthenticationActions/AuthImpSpring";

import clsx from "clsx";
import {
  FormType,
  LoginSignupFormProps,
} from "@/app/utils/Domain/AuthenticationActions/TypesAuth";
import ImageUpload from "./Form.ImageContainer";
import {
  formContainer,
  inputBaseStyles,
  submitButtonStyles,
} from "../common/Common.FormStyles";
import { cookies } from "next/headers";

export default async function LoginSignupForm({
  type = FormType.LOGIN,
  existAD,
  className,
  infoUser,
}: LoginSignupFormProps) {
  // Get the appropriate action based on form type
  const getFormAction = () => {
    switch (type) {
      case FormType.LOGIN:
        return logIn;
      case FormType.SIGNUP:
        return signUp;
      case FormType.CHANGE_PASSWORD:
        return changePassword;
      case FormType.CHANGE_USERNAME:
        return changeUsername;

      case FormType.CHANGE_INFORMATION:
        return updateUserDetails;
      // Add cases for other form types as needed
      default:
        return logIn;
    }
  };
  const userId: string = (await cookies()).get("sessionId")?.value || "";

  // Render different form fields based on type
  const renderFormFields = () => {
    switch (type) {
      case FormType.LOGIN:
        return (
          <>
            <div className="text-2xl font-bold mb-6 text-center dark:text-white text-gray-900">
              BIENVENIDO TO JAGUAR INICIA SESION
            </div>
            <Input
              name="user"
              placeholder="Username"
              className={inputBaseStyles}
              required
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              className={inputBaseStyles}
              required
            />
          </>
        );
      case FormType.SIGNUP:
        return (
          <>
            <div className="text-2xl font-bold mb-6 text-center dark:text-white text-gray-900">
              BIENVENIDO TO JAGUAR REGISTRATE
            </div>
            <Input
              name="firstName"
              placeholder="First Name"
              className={inputBaseStyles}
              required
            />
            <Input
              name="lastName"
              placeholder="Last Name"
              className={inputBaseStyles}
              required
            />
            <Input
              name="email"
              type="email"
              placeholder="Email"
              className={inputBaseStyles}
              required
            />
            <Input
              name="birthDate"
              type="date"
              placeholder="Birth Date"
              className={inputBaseStyles}
              required
            />
            <Input
              name="user"
              placeholder="Username"
              className={inputBaseStyles}
              required
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              className={inputBaseStyles}
              required
            />
            <select
              hidden={!existAD}
              name="role"
              id="role"
              className={clsx(
                inputBaseStyles,
                "block w-full py-2 px-3 border rounded-md shadow-sm",
                "text-gray-900 dark:text-gray-100",
                "border-gray-300 dark:border-gray-600",
                "focus:outline-none focus:ring-2",
                "focus:ring-indigo-500 dark:focus:ring-indigo-600",
                "focus:border-indigo-500 dark:focus:border-indigo-600",
                "transition-colors duration-200"
              )}
              defaultValue="USER"
              required
            >
              <option
                value="USER"
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                Regular User
              </option>
              {!existAD && (
                <option
                  value="ADMINISTRADOR"
                  className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                >
                  Administrator
                </option>
              )}
              <option
                value="JUGADOR"
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                Player
              </option>
              <option
                value="ARBITRO"
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                Referee
              </option>
            </select>
          </>
        );
      case FormType.CHANGE_INFORMATION:
        return (
          <>
            <div className="text-2xl font-bold mb-6 text-center dark:text-white text-gray-900">
              BIENVENIDO TO JAGUAR CAMBIA TU PERSONALIDAD 
            </div>
            <div className="mb-6 mx-auto w-52 h-52">
              <ImageUpload
                id={userId || ""}
                imageUrl={
                  infoUser?.urlPhoto ||
                  "https://dxfjdqqppxfoobevbubc.supabase.co/storage/v1/object/public/fut-next-images/ImagesProfilesUsers/logo.png"
                }
              />
              {/* <input type="hidden" name="profilePhoto" value={profilePhoto} /> */}
            </div>
            <Input
              name="firstName"
              placeholder="First Name"
              className={inputBaseStyles}
              defaultValue={infoUser?.firstName || ""}
              required
            />
            <Input
              name="lastName"
              placeholder="Last Name"
              className={inputBaseStyles}
              defaultValue={infoUser?.lastName || ""}
              required
            />
            <Input
              name="email"
              type="email"
              placeholder="Email"
              className={inputBaseStyles}
              defaultValue={infoUser?.email || ""}
              required
            />
            <Input
              name="birthDate"
              type="date"
              placeholder="Birth Date"
              className={inputBaseStyles}
              defaultValue={
                infoUser?.birthDate
                  ? new Date(infoUser.birthDate).toISOString().split("T")[0]
                  : ""
              }
              required
            />
            <select
              name="role"
              id="role"
              className={clsx(
                inputBaseStyles,
                "bg-transparent dark:bg-gray-800",
                "text-gray-900 dark:text-gray-100",
                "border-gray-300 dark:border-gray-600",
                "focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600",
                "rounded-md shadow-sm"
              )}
              defaultValue={infoUser?.role.toString() || "USER"}
              required
            >
              <option
                className=" bg-gradient-to-tr from-transparent via-[rgba(121,121,121,0.16)]  dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value="USER"
              >
                Regular User
              </option>
              <option
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value="ADMINISTRADOR"
              >
                Administrator
              </option>
              <option
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value="JUGADOR"
              >
                JUGADOR
              </option>
              <option
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value="ARBITRO"
              >
                ARBITRO
              </option>
            </select>
            <input type="hidden" name="id" value={infoUser?.id || ""} />
          </>
        );
      case FormType.CHANGE_PASSWORD:
        return (
          <>
            <div className="text-2xl font-bold mb-6 text-center dark:text-white text-gray-900">
              BIENVENIDO TO JAGUAR CAMBIA TU CONTRASEÑA
            </div>
            <Input
              name="username"
              placeholder="Username"
              className={inputBaseStyles}
              required
            />
            <Input
              name="currentPassword"
              type="password"
              placeholder="Current Password"
              className={inputBaseStyles}
              required
            />
            <Input
              name="newPassword"
              type="password"
              placeholder="New Password"
              className={inputBaseStyles}
              required
            />
          </>
        );
      case FormType.CHANGE_USERNAME:
        return (
          <>
            <div className="text-2xl font-bold mb-6 text-center dark:text-white text-gray-900">
              BIENVENIDO TO JAGUAR CAMBIA TU NOMBRE DE USUARIO
            </div>
            <Input
              name="currentUsername"
              placeholder="Current Username"
              className={inputBaseStyles}
              required
            />
            <Input
              name="newUsername"
              placeholder="New Username"
              className={inputBaseStyles}
              required
            />
            <Input
              name="currentPassword"
              type="password"
              placeholder="Password"
              className={inputBaseStyles}
              required
            />
          </>
        );
      default:
        return null;
    }
  };

  // Get appropriate button text
  const getButtonText = () => {
    switch (type) {
      case FormType.LOGIN:
        return "Log In";
      case FormType.SIGNUP:
        return "Sign Up";
      case FormType.CHANGE_PASSWORD:
        return "Change Password";
      case FormType.CHANGE_USERNAME:
        return "Change Username";

      case FormType.CHANGE_INFORMATION:
        return "Change Information";
      default:
        return "Submit";
    }
  };

  return (
    <FormContainer
      action={getFormAction()}
      className={clsx(formContainer, className)}
    >
      {renderFormFields()}
      <SubmitButton
        className={clsx(
          submitButtonStyles,
          "hover:bg-gradient-to-tr hover:from-green-500/20 hover:to-green-600/40 dark:hover:bg-gradient-to-tr dark:hover:from-green-700/30 "
        )}
        text={getButtonText()}
      ></SubmitButton>
    </FormContainer>
  );
}
