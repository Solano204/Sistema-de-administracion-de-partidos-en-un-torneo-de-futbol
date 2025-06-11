import React from "react";
import { Navbar } from "@/components/Navbar/index";

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="h-screen  w-full rounded-full font-burble" 
     >
        <section className="h-full w-full flex flex-col ">
          <div className="lg:col-span-2 lg:row-span-14 md:ml-4   h-[20%]    ">
            <Navbar className=" mt-10 flex items-center justify-center h-[20%]  " />
            {/* <div className="w-full h-full  relative">
              <div className="2xl:w-[400px] 2xl:h-[500px] top-[100px] left-[-22px] xl:w-[360px] xl:h-[450px]  lg:w-[280px] lg:h-[350px] lg:top-[150px]  absolute filter drop-shadow-[4px_3px_7px_rgba(25,191,0,0.7)] animate-toggleAnimation">
                <Image src={imagesTrail[2]} alt="" fill />
              </div>
            </div> */}
          </div>
          <div className="  h-full    ">
            <div className="hidden dark:block w-full h-full absolute inset-0">
              {/* <StarsCanvas /> */}
            </div>
            {children}
          </div>
        </section>
      </div>
    </>
  );
}
