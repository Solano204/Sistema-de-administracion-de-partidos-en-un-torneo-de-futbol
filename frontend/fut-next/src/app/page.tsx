import { redirect } from "next/navigation";
import React from "react";

const page = () => {
  redirect("/Soccer");
  return <div></div>;
};

export default page;
