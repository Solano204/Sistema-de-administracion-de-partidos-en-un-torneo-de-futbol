// app/Categories/[category]/teams/page.tsx
import React from "react";
import { Contenedor } from "@/components/TeamManagment/Components/Team.Contenedor";



export default async function Teams ({ params }: { params:Promise<{ id: string }> }) {
  const {id}= await(params);
console.log("id",id)
  return (
    <>
      <Contenedor
        categoryId={id}
        className="w-full  h-full rounded-4xl "
      />
    </>
  );
}
