import { Team } from "@/components/Player";

const Page = async ({ params }: { params: Promise<{ idTeam: string }> }) => {
  const id = decodeURIComponent((await params).idTeam);
  const isNew = id.toLowerCase() === "create-new-team".toLowerCase();

  console.log("isNew", isNew, "id", id);
  return (
    <>
      <div className="flex h-auto w-full flex-col items-center justify-center  " >
        <Team newTeam={isNew} />;
      </div>
    </>
  );
};
export default Page;
