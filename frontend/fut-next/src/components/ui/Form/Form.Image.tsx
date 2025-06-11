import clsx from "clsx";
type props = {
  className?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  id: number;
};
export function ImageInput({ className,onChange,id }: props) {
  const name = "image";
  const keys:string= id.toString();
  return (
    <div
      className={clsx("flex flex-col items-center justify-center rounded-full", className)}
    >
      <label
        htmlFor={keys}
        className="cursor-pointer h-full w-full "
      >
        
      </label>
      <input
        id={keys}
        name={name}
        type="file"
        className="hidden "
        accept="image/*"
        onChange={onChange}
      />
    </div>
  );
}
