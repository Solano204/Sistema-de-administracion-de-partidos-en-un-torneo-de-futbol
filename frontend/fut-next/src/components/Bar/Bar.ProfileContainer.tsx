// "use client";
// import clsx from "clsx";
// import React, { useState } from "react"; // Import useState
// import Image from "next/image";
// import { updateImagePlayer } from "@/app/utils/PlayerAction/Actions";
// import { FormContainer, SubmitButton } from "@/components/ui/Form/index";
// import {
//   updatingInfo,
//   userInfo,
// } from "@/app/utils/Domain/AuthenticationActions/UseInfo";
// import { Input } from "../ui/input";
// import { Button } from "@/components/Metrics/Result";
// import {
//   formContainerStyles,
//   formContainerStyles2,
//   inputStyles,
// } from "@/app/utils/Styles/Form";
// import { refereeData } from "../Admin/Arbitro/Arbitro.ColumnsData";
// import { PhotoContainer } from "./Bar.PhotoContainer";

// type Props = {
//   className: string;
//   info: userInfo | refereeData;
// };

// export const ProfileContainer = ({ className, info }: Props) => {
//   // State to manage the visibility of the photo update container
//   const [showPhotoUpdate, setShowPhotoUpdate] = useState(false);

//   // Function to toggle the visibility of the photo update container
//   const togglePhotoUpdate = () => {
//     setShowPhotoUpdate(!showPhotoUpdate);
//   };

//   const idImage = info.id.toString();
//   return (
//     <div
//       className={clsx(
//         "h-screen w-screen  flex items-center justify-center dark:text-white text-black backdrop-blur-xl",
//         className
//       )}
//     >
//       <div
//         className={clsx(
//           "w-[350px] sm:h-[800px] h-[800px] sm:w-[600px] flex-col items-center justify-center md:text-3xl  p-8  animate-toggleAnimationTable sm:mt-0  rounded-4xl mt-50",
//           formContainerStyles2
//         )}
//       >
//         <div
//           className={`flex flex-col items-center w-full ${
//             showPhotoUpdate ? "h-[400px]" : "h-[300px]"
//           }  `}
//         >
//           <div className=" mt-10 rounded-full relative h-[200px] w-[200px]">
//             {/* Display the user image */}
//             <Image
//               src={info.urlPhoto || "/Images/logo.png"}
//               fill
//               className="rounded-md object-cover mb-4 w-full h-[500px] absolute inset-0"
//               alt="Profile Image"
//             />
//           </div>

//           {/* Button to toggle the photo update container */}
//           <Button
//             className="w-auto h-auto text-[18px] bg-amber-200 text-black"
//             onClick={togglePhotoUpdate}
//             title="Cambiar foto"
//           />

//           {/* Conditionally render the photo update container */}
//           {showPhotoUpdate && <PhotoContainer idImage={idImage} info={info} />}
//         </div>

//         {/* Form for updating user info */}
//         <FormContainer
//           action={updatingInfo}
//           className=" w-full flex-col items-center justify-center h-[80%]"
//         >
//           <div className="flex-col w-[80%] h-[90%] text-start mx-auto ">
//             <input type="hidden" name="id" value={info.id} />
//             <div>
//               <label htmlFor="name" className="text-lg font-medium">
//                 Name
//               </label>
//               <Input
//                 type="text"
//                 name="name"
//                 id="name"
//                 defaultValue={info.name}
//                 className={clsx("", inputStyles)}
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="lastName" className="text-lg font-medium">
//                 LastName
//               </label>
//               <Input
//                 type="text"
//                 name="lastName"
//                 id="lastName"
//                 defaultValue={info.lastName}
//                 className={clsx("", inputStyles)}
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="age" className="text-lg font-medium">
//                 Age
//               </label>
//               <Input
//                 type="number"
//                 name="age"
//                 id="age"
//                 defaultValue={info.age}
//                 className={clsx("", inputStyles)}
//                 required
//               />
//             </div>
//             <div>
//               <label htmlFor="dateBirth" className="text-lg font-medium">
//                 Fecha Nacimiento
//               </label>
//               <Input
//                 type="date"
//                 name="date"
//                 id="date"
//                 defaultValue={info.dateBirth}
//                 className={clsx("", inputStyles)}
//                 required
//               />
//             </div>
//             <div className="mt-8">
//               <SubmitButton
//                 text="Guardar"
//                 className={clsx("text-2xl", inputStyles)}
//               />
//             </div>
//           </div>
//         </FormContainer>
//       </div>
//     </div>
//   );
// };
