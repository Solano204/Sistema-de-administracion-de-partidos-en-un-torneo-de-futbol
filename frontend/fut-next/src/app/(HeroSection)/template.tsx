import { Header } from "@/components/Bar";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Header />
      <div className=" hidden dark:block w-full h-full absolute inset-0 z-[-1] ">
        {/* <StarsCanvas /> */}
      </div>
      <div className="w-full h-full mt-10">{children}</div>
    </div>
  );
};

export default layout;
