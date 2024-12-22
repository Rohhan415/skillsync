"use client";

import { useAppState } from "@/lib/providers/state-provider";
import { useMemo, useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger } from "../ui/accordion";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import EmojiPicker from "../global/emoji-picker";
import { createFile, updateFile, updateFolder } from "@/lib/supabase/queries";
import { useToast } from "@/hooks/use-toast";
import { File } from "@/lib/supabase/supabase.types";
import TooltipComponent from "../global/tooltip-component";
import { PlusIcon, Trash } from "lucide-react";
import { v4 } from "uuid";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { AccordionContent } from "@radix-ui/react-accordion";

interface DropdownProps {
  title: string;
  id: string;
  listType: "folder" | "file";
  iconId: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ title, id, listType, iconId }) => {
  const { toast } = useToast();
  const { user } = useSupabaseUser();
  const { state, dispatch, workspaceId } = useAppState();
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const folderTitle: string | undefined = useMemo(() => {
    if (listType === "folder") {
      const stateTitle = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === id)?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [state, listType, workspaceId, id, title]);

  const fileTitle: string | undefined = useMemo(() => {
    if (listType === "file") {
      const fileAndFolderId = id.split("folder");
      const stateTitle = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === fileAndFolderId[0])
        ?.files.find((file) => file.id === fileAndFolderId[1])?.title;
      if (title === stateTitle || !stateTitle) return title;
      return stateTitle;
    }
  }, [state, listType, workspaceId, id, title]);
  // If there will be more than 2 types of lists, consider using a switch statement
  const navigatePage = (accordionId: string, type: string) => {
    if (type === "folder") {
      router.push(`/dashboard/${workspaceId}/${accordionId}`);
    }
    if (type === "file") {
      router.push(
        `/dashboard/${workspaceId}/${accordionId.split("folder")[0]}/${
          accordionId.split("folder")[1]
        }`
      );
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };
  const handleBlur = async () => {
    setIsEditing(false);
    const folderId = id.split("folder");
    if (folderId?.length === 1) {
      if (!folderTitle) return;
      await updateFolder({ title: folderTitle }, folderId[0]);
    }
    if (folderId?.length === 2 && folderId[1]) {
      if (!fileTitle) return;
      const { error } = await updateFile({ title: fileTitle }, folderId[1]);
      toast({
        title: error ? "Error" : "Success",
        variant: error ? "destructive" : undefined,
        description: error
          ? "Could not update the file title"
          : "File title updated successfully",
      });
    }
  };

  const onChangeEmoji = async (emoji: string) => {
    if (!workspaceId) return;

    if (listType === "folder") {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: { folderId: id, workspaceId, folder: { icon_id: emoji } },
      });
      const { error } = await updateFolder({ icon_id: emoji }, id);
      toast({
        title: error ? "Error" : "Success",
        variant: error ? "destructive" : undefined,
        description: error
          ? "Error updating folder icon"
          : "Folder icon updated successfully",
      });
    }
  };

  const folderTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const folderId = id.split("folder");
    if (!workspaceId || folderId?.length !== 1) return;
    const [currentFolderId] = folderId;
    {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          folderId: currentFolderId,
          workspaceId: workspaceId,
          folder: { title: e.target.value },
        },
      });
    }
  };

  const fileTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const folderId = id.split("folder");
    if (!workspaceId || (folderId?.length !== 2 && folderId[1])) return;
    const [currentFolderId, currentFileId] = folderId;
    {
      dispatch({
        type: "UPDATE_FILE",
        payload: {
          folderId: currentFolderId,
          fileId: currentFileId,
          workspaceId,
          file: { title: e.target.value },
        },
      });
    }
  };

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

  const hoverStyles = useMemo(
    () =>
      clsx(
        "h-full  hidden space-x-2 rounded-sm absolute right-0 items-center justify-center",
        {
          "group-hover/file:flex": listType === "file",
          "group-hover/folder:flex": listType === "folder",
        }
      ),
    [listType]
  );

  const addNewFile = async () => {
    if (!workspaceId) return;
    const newFile: File = {
      folder_id: id,
      data: null,
      created_at: new Date().toISOString(),
      in_trash: null,
      title: "Untitled",
      icon_id: "📄",
      id: v4(),
      workspace_id: workspaceId,
      banner_url: "",
    };
    const { error } = await createFile(newFile);
    dispatch({
      type: "ADD_FILE",
      payload: { file: newFile, folderId: id, workspaceId },
    });
    if (error) {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Could not create a file",
      });
    } else {
      console.log("File created");

      toast({
        title: "Success",
        description: "File created.",
      });
    }
  };

  const moveToTrash = async () => {
    if (!user?.email || !workspaceId) return;
    const pathId = id.split("folder");
    if (listType === "folder") {
      dispatch({
        type: "UPDATE_FOLDER",
        payload: {
          folder: { in_trash: `Deleted by ${user?.email}` },
          folderId: pathId[0],
          workspaceId,
        },
      });
      const { error } = await updateFolder(
        { in_trash: `Deleted by ${user?.email}` },
        pathId[0]
      );
      toast({
        title: error ? "Error" : "Success",
        variant: error ? "destructive" : undefined,
        description: error
          ? "Could not move the folder to trash"
          : "Moved folder to trash",
      });
    }

    if (listType === "file") {
      const { error } = await updateFile(
        { in_trash: `Deleted by ${user?.email}` },
        pathId[1]
      );
      dispatch({
        type: "UPDATE_FILE",
        payload: {
          file: { in_trash: `Deleted by ${user?.email}` },
          folderId: pathId[0],
          workspaceId,
          fileId: pathId[1],
        },
      });

      toast({
        title: error ? "Error" : "Success",
        variant: error ? "destructive" : undefined,
        description: error
          ? "Could not move the file to trash"
          : "Moved file to trash",
      });
    }
  };

  return (
    <Accordion type="single" collapsible>
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
              <input
                type="text"
                value={listType === "folder" ? folderTitle : fileTitle}
                className={clsx(
                  "outline-none overflow-hidden w-[140px] text-Neutrals/neutrals-7",
                  {
                    "bg-muted cursor-text": isEditing,
                    "bg-transparent cursor-pointer": !isEditing,
                  }
                )}
                readOnly={!isEditing}
                onDoubleClick={handleDoubleClick}
                onBlur={handleBlur}
                onChange={
                  listType === "folder" ? folderTitleChange : fileTitleChange
                }
              />
            </div>
            <div className={hoverStyles}>
              <TooltipComponent message="Delete Folder">
                <Trash
                  onClick={moveToTrash}
                  size={15}
                  className="hover:dark:text-white dark:dark:text-neutral-700 transition-colors"
                />
              </TooltipComponent>
              {listType === "folder" && !isEditing && (
                <TooltipComponent message="Add File">
                  <PlusIcon
                    onClick={addNewFile}
                    size={15}
                    className="hover:dark:text-white dark:text-neutral-700 transition-colors"
                  />
                </TooltipComponent>
              )}
            </div>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          {state.workspaces
            .find((workspace) => workspace.id === workspaceId)
            ?.folders.find((folder) => folder.id === id)
            ?.files.filter((file) => !file.in_trash)
            .map((file) => {
              const customField = `${id}folder${file.id}`;

              return (
                <Dropdown
                  key={file.id}
                  title={file.title}
                  id={customField}
                  listType="file"
                  iconId={file.icon_id}
                />
              );
            })}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default Dropdown;
