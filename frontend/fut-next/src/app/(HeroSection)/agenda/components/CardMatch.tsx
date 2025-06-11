"use client";
import clsx from "clsx";
import { Modal } from "@/components/TeamManagment/Components/Team.PopUp";

// In CardMatch.tsx
interface CardMatchProps {
  className?: string;
  children: React.ReactNode;
  isModalOpen: boolean;
  onModalClose: () => void;
}

export const CardMatch: React.FC<CardMatchProps> = ({
  className,
  children,
  isModalOpen,
  onModalClose
}) => {

  console.log(isModalOpen);

  return (
    <div
    className={clsx(
      "flex justify-center items-center ", 
      className
    )}
  >
      {/* <Button onClick={() => handleModalOpen(true)} title="Pagar Arbitro" /> */}
     
      <div className="text-sm duration-300 place-content-center h-full w-full">
        <Modal
          isOpen={isModalOpen}
          onClose={onModalClose}
          title="Match Details"
          description="View and update match details"
          width="90vw"
          height="90vh"
          // minWidth="400px"
          // maxHeight="100vh"
          closeButtonPosition="top-right"
          closeButtonClassName="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md"
          contentClassName="border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md"
        >
          {children}
        </Modal>
      </div>
    </div>
  );
};
