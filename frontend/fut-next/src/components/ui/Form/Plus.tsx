import clsx from 'clsx';
import React from 'react';

type PropsElementCommon = {
  className: string;
  onClik: () => void;
  children: React.ReactNode;
};
const SwitchComponent = ({ className,onClik,children }: PropsElementCommon) => {
  return (
    <div
      onClick={onClik}
      className={clsx(
        "relative inline-block transform-style-preserve-3d perspective-500 animate-toggleAnimation",
        className
      )}
    >
      <div className=" h-full w-full ">
        {children}
      </div>
    </div>
  );
};

export default SwitchComponent;