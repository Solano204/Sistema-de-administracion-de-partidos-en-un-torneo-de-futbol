// "use server";
// import clsx from "clsx";
// import { CardMatch, Pop } from "../Metrics/Result";

// import React from "react";
// import { Button } from "../ui/button";
// import { ProfileContainer } from "./Bar.ProfileContainer";
// import { cookies } from "next/headers";
// import { getInfo, userInfo } from "@/app/utils/Domain/AuthenticationActions/UseInfo";

// type prop = {
//   className: string;
  
  
// };

// export  const Profile = async ({ className }: prop) => {
 
//   const info:userInfo = await getInfo();
//   console.log("info", info);
//   return (
//     <div className={clsx("w-full h-full ", className)}>
//         <Pop className="" buttonExternal={true} >
//           <ProfileContainer className="" info={info}/>
//         </Pop>
//     </div>
//   );
// };