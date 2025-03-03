"use client";

import dynamic from "next/dynamic";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface EmojiPickerProps {
  children: React.ReactNode;
  getValue?: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ children, getValue }) => {
  const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });
  const onClick = (emoji: { emoji: string }) => {
    if (getValue) getValue(emoji.emoji);
  };
  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger asChild>
          <span className="cursor-pointer">{children}</span>
        </PopoverTrigger>
        <PopoverContent className="p-0 border-none">
          <Picker onEmojiClick={onClick} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default EmojiPicker;
