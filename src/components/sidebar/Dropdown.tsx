"use client";

import { useAppState } from "@/lib/providers/state-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useMemo, useState } from "react";
import { AccordionItem, AccordionTrigger } from "../ui/accordion";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import EmojiPicker from "../global/emoji-picker";

interface DropdownProps {
  title: string;
  id: string;
  listType: "folder" | "file";
  iconId: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  title,
  id,
  listType,
  iconId,
  children,
  disabled,
  ...props
}) => {
  const supabase = createClientComponentClient();
  const { state, dispatch, workspaceId, folderId } = useAppState();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  // If there will be more than 2 types of lists, consider using a switch statement
  const navigatePage = (accordionId: string, type: string) => {
    const path =
      type === "file"
        ? `/dashboard/${workspaceId}/${folderId}/${accordionId}`
        : `/dashboard/${workspaceId}/${accordionId}`;
    router.push(path);
  };

  const onChangeEmoji = async (emoji: string) => {
    if(listType === "folder") {
        
  }

  const isFolder = listType === "folder";
  const groupIdentifies = useMemo(
    () =>
      clsx(
        "dark:text-white whitespace-nowrap flex justify-between items-center w-full relative",
        {
          "group/folder": isFolder,
          "group/file": !isFolder,
        }
      ),
    [isFolder]
  );

  const listStyles = useMemo(
    () =>
      clsx("relative", {
        "border-none text-md": isFolder,
        " border-none ml-6 text-[16px] py-1": !isFolder,
      }),
    [isFolder]
  );

  console.log(supabase);

  return (
    <AccordionItem
      value={id}
      className={listStyles}
      onClick={(e) => {
        e.stopPropagation();
        navigatePage(id, listType);
      }}
    >
      <AccordionTrigger
        id={listType}
        className="hover:no-underline p-2 dark:text-muted-foreground text-sm"
        disabled={listType === "file"}
      >
        <div className={groupIdentifies}>
          <div className="flex gap-4 justify-center items-center overflow-hidden">
            <div className="relative">
              <EmojiPicker getValue={onChangeEmoji}>{iconId}</EmojiPicker>
            </div>
          </div>
        </div>
      </AccordionTrigger>
    </AccordionItem>
  );
};

export default Dropdown;
