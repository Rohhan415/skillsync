import { useMemo } from "react";
import { File, Folder, Workspace } from "@/lib/supabase/supabase.types";
import { useAppState } from "../providers/state-provider";

interface QuillEditorProps {
  dirDetails: File | Folder | Workspace;
  fileId: string;
  dirType: "file" | "folder" | "workspace";
}

export function Details({ dirType, fileId, dirDetails }: QuillEditorProps) {
  const { state, workspaceId, folderId } = useAppState();

  const details = useMemo(() => {
    let selectedDirectory;
    if (dirType === "file") {
      selectedDirectory = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === folderId)
        ?.files.find((file) => file.id === fileId);
    }
    if (dirType === "folder") {
      selectedDirectory = state.workspaces
        .find((workspace) => workspace.id === workspaceId)
        ?.folders.find((folder) => folder.id === folderId);
    }
    if (dirType === "workspace") {
      selectedDirectory = state.workspaces.find(
        (workspace) => workspace.id === workspaceId
      );
    }
    if (selectedDirectory) return selectedDirectory;

    return {
      title: dirDetails.title,
      icon_id: dirDetails.icon_id,
      created_at: dirDetails.created_at,
      data: dirDetails.data,
      in_trash: dirDetails.in_trash,
      banner_url: dirDetails.banner_url,
    } as File | Folder | Workspace;
  }, [
    dirDetails.banner_url,
    dirDetails.created_at,
    dirDetails.data,
    dirDetails.icon_id,
    dirDetails.in_trash,
    dirDetails.title,
    dirType,
    fileId,
    folderId,
    state.workspaces,
    workspaceId,
  ]);

  return details;
}
