"use client";
import Image from "next/image";
import { type actionFunctionAsync } from "@/app/utils/Types/TypesAction";
import { FormContainer } from "./Form.Container";
import { SubmitButton } from "./Form.SubmitButton";

type ImageInputContainerProps = {
  image: string;
  name: string;
  action: actionFunctionAsync;
  text: string;
  children?: React.ReactNode;
  
};


function ImageInputContainer(props: ImageInputContainerProps) {
  const { image, name, action} = props;
  return (
      <div className="mb-8">
          {/* I show the image */}
      <Image
        src={image}
        width={200}
        height={200}
        className="rounded-md object-cover mb-4 w-[200px] h-[200px]"
        alt={name}
      />
        <div className="max-w-md mt-4">
          <FormContainer action={action}>
            {props.children}
            {/* <ImageInput /> */}
            <SubmitButton size="sm" />
          </FormContainer>
        </div>
    </div>
  );
}
export default ImageInputContainer;