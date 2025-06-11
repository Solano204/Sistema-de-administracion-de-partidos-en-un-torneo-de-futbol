"use server"
import { FormsAuthentication } from "@/components/Authentication";
import React from "react";
import { Toaster } from "sonner";
import { checkAdminExists, getUserDetails } from "@/app/utils/Domain/AuthenticationActions/AuthImpSpring";
import { FormType, UserDetailsRecordFull } from "@/app/utils/Domain/AuthenticationActions/TypesAuth";
const AuthPage = async ({ params }: {  params:Promise<{ action: string }> }) => {
  const action = await ((await params).action.toUpperCase() as 'LOGIN'
   | 'SIGNUP' | 'CHANGEPASSWORD' | 'CHANGEUSERNAME' | 'CHANGEINFORMATION');



  
  let userDetails: UserDetailsRecordFull | null = null;
  if (action === 'CHANGEINFORMATION') {
    
    const response = await getUserDetails();
    if (response.success) {
      userDetails = response.data as UserDetailsRecordFull;
    }
  }

  const getFormTypeFromUrl = () => {
    switch(action) {
      case 'LOGIN': return FormType.LOGIN;
      case 'SIGNUP': return FormType.SIGNUP;
      case 'CHANGEPASSWORD': return FormType.CHANGE_PASSWORD;
      case 'CHANGEUSERNAME': return FormType.CHANGE_USERNAME;
      case 'CHANGEINFORMATION': return FormType.CHANGE_INFORMATION;
      default: return FormType.LOGIN;
    }
  };

  const formType = getFormTypeFromUrl();

  const existAd = await checkAdminExists();

  return (
    <div className="w-screen h-screen z-[23]">
      <Toaster position="top-center" />
      <div className="w-full h-full p-2 flex items-center justify-center">
        <div className="sm:w-[600px] h-[900px] w-[300px] flex items-center justify-center md:text-3xl z-[23]">
          <FormsAuthentication
          existAD={existAd}
            type={formType}
            infoUser={userDetails || undefined}
            className="w-full h-full flex items-center justify-center md:text-3xl animate-toggleAnimationTable z-[23]"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;  