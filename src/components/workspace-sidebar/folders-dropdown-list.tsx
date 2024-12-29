"use client";

import { useAppState } from "@/lib/providers/state-provider";
import { Folder } from "@/lib/supabase/supabase.types";
import { useEffect, useState, useMemo } from "react";
import TooltipComponent from "../global/tooltip-component";
import { PlusIcon } from "lucide-react";
import { v4 } from "uuid";
import { createFolder } from "@/lib/supabase/queries";
import { useToast } from "@/hooks/use-toast";
import { Accordion } from "../ui/accordion";
import Dropdown from "./Dropdown";
import useSupabaseRealtime from "@/hooks/useSupabaseRealtime";

interface FoldersDropdownListProps {
  workspaceFolders: Folder[];
  workspaceId: string;
}

const FoldersDropdownList: React.FC<FoldersDropdownListProps> = ({
  workspaceFolders,
  workspaceId,
}) => {
  useSupabaseRealtime();
  const { toast } = useToast();
  const { state, dispatch, folderId } = useAppState();
  const [folders, setFolders] = useState<Folder[]>([]); // Define folders state
  const [hasInitialized, setHasInitialized] = useState(false);

  // Memoize the folders data to prevent unnecessary re-renders

  const foldersData = useMemo(
    () =>
      workspaceFolders.map((folder) => ({
        ...folder,
        files:
          state.workspaces
            .find((workspace) => workspace.id === workspaceId)
            ?.folders.find((f) => f.id === folder.id)?.files || [],
      })),

    [workspaceFolders, workspaceId, state.workspaces]
  );

  // First useEffect: Dispatch only when workspaceFolders changes and hasn't been initialized
  useEffect(() => {
    if (workspaceFolders.length > 0 && !hasInitialized) {
      dispatch({
        type: "SET_FOLDERS",
        payload: {
          workspaceId,
          folders: foldersData,
        },
      });
      setHasInitialized(true); // Set initialized to true after first dispatch
    }
  }, [
    foldersData,
    workspaceFolders.length,
    workspaceId,
    dispatch,
    hasInitialized,
  ]);

  // Second useEffect: Keep folders in sync with state
  useEffect(() => {
    const newFolders =
      state.workspaces.find((workspace) => workspace.id === workspaceId)
        ?.folders || [];

    setFolders((prevFolders) => {
      // Only update state if the folders have changed
      if (JSON.stringify(prevFolders) !== JSON.stringify(newFolders)) {
        return newFolders;
      }
      return prevFolders;
    });
  }, [state.workspaces, workspaceId]);

  const addFolderHandler = async () => {
    const newFolder: Folder = {
      id: v4(),
      created_at: new Date().toISOString(),
      title: "Untitled",
      icon_id: "📄",
      in_trash: null,
      workspace_id: workspaceId,
      banner_url: "",
      data: null,
    };
    dispatch({
      type: "ADD_FOLDER",
      payload: { workspaceId, folder: { ...newFolder, files: [] } },
    });
    const { error } = await createFolder(newFolder);
    toast({
      title: error ? "Error" : "Success",
      description: error ? "Cannot create the folder" : "Created folder.",
      variant: error ? "destructive" : undefined,
    });
  };

  return (
    <>
      <div className="flex sticky z-20  w-full h-10 justify-between items-center pr-4 ">
        <span className="font-bold text-xs uppercase ">Folders</span>
        <TooltipComponent message="Create Folder">
          <PlusIcon
            onClick={addFolderHandler}
            size={16}
            className="group/hover/title:inline-block cursor-pointer hover:dark:text-white"
          />
        </TooltipComponent>
      </div>
      <Accordion
        type="multiple"
        defaultValue={[folderId || ""]}
        className="pb-20"
      >
        {folders
          .filter((folder) => !folder.in_trash)
          .map((folder) => {
            return (
              <Dropdown
                key={folder.id}
                title={folder.title}
                id={folder.id}
                listType={"folder"}
                iconId={folder.icon_id}
              />
            );
          })}
      </Accordion>
    </>
  );
};

export default FoldersDropdownList;
