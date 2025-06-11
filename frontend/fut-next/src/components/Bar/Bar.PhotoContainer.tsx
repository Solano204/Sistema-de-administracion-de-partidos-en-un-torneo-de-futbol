// "use client";

// import React from "react";
// import { FormContainer, SubmitButton } from "../ui/Form";
// import { updateImagePlayer } from "@/app/utils/PlayerAction/Actions";
// import { inputStyles } from "@/app/utils/Styles/Form";
// import clsx from "clsx";

// type props = {
//     idImage: string;
// }
// export const PhotoContainer = ({ idImage, info }: { info: any; idImage: string}) => {
//   return (
//     <div className=" w-[80%] h-[100px] mt-6">
//       <FormContainer
//         action={updateImagePlayer}
//         className="relative flex justify-between h-full w-full flex-col "
//       >
//         <div className="w-full h-full flex items-center justify-center ">
//           <input
//             id={idImage}
//             name={"image"}
//             type="file"
//             className=" w-full text-[20px] text-center"
//             accept="image/*"
//           />
//         </div>

//         {/* Hidden inputs to send additional data */}
//         <input type="hidden" name="id" value={info.id} />
//         <input type="hidden" name="url" value={info.urlPhoto} />

//         <SubmitButton
//           text="Subir foto"
//           className={clsx("text-2xl", inputStyles)}
//         />
//       </FormContainer>
//     </div>
//   );
// };
