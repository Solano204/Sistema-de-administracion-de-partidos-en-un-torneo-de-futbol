import Image from 'next/image';
import { LuUser } from 'react-icons/lu';

type Props = {
  className: string;
  imageUrl?: string; // URL of the user's image
};

export function UserIcon({ className, imageUrl }: Props) {

 

  return (
    <div className={`w-6 h-6 rounded-full relative  ${className}`}>
      {imageUrl? (
        <Image
        fill
          src={imageUrl}
          alt="User Avatar"
          className="w-full h-full rounded-full object-cover"
        />
      ) : (
        <LuUser className="w-full h-full text-gray-500" />
      )}
    </div>
  );
}
