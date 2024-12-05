"use client";

import { useAppState, appFoldersType } from "@/lib/providers/state-provider";
import { File } from "@/lib/supabase/supabase.types";
import { FileIcon, FolderIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TrashRestoreProps {
  children: React.ReactNode;
}

const TrashRestore: React.FC<TrashRestoreProps> = () => {
  const { state, workspaceId, folderId } = useAppState();
  const [folders, setFolders] = useState<appFoldersType[] | []>([]);
  const [files, setFiles] = useState<File[] | []>();

  useEffect(() => {
    const stateFolders =
      state.workspaces
        .find((w) => w.id === workspaceId)
        ?.folders.filter((f) => f.in_trash) || [];
    setFolders(stateFolders);
    const stateFiles: File[] = [];
    state.workspaces
      .find((w) => w.id === workspaceId)
      ?.folders.forEach((f) => {
        f.files.forEach((file) => {
          if (file.in_trash) {
            stateFiles.push(file);
          }
        });
      });
    setFiles(stateFiles);
  }, [state.workspaces, workspaceId]);

  return (
    <section>
      {!!folders.length && (
        <>
          <h3>Folders</h3>
          {folders.map((folder) => (
            <Link
              className="hover:bg-muted rounded-md p-2 flex items-center justify-between"
              href={`/dashboard/${folder.workspace_id}/${folder.id}`}
              key={folder.id}
            >
              <article>
                <aside className="flex items-center gap-2">
                  <FolderIcon />
                  {folder.title}
                </aside>
              </article>{" "}
            </Link>
          ))}
        </>
      )}

      {!!files?.length && (
        <>
          <h3>Files</h3>
          {files.map((file) => (
            <Link
              className="hover:bg-muted rounded-md p-2 flex items-center justify-between"
              href={`/dashboard/${file.workspace_id}/${file.folder_id}/${file.id}`}
              key={file.id}
            >
              <article>
                <aside className="flex items-center gap-2">
                  <FileIcon />
                  {file.title}
                </aside>
              </article>{" "}
            </Link>
          ))}
        </>
      )}
      {!folders.length && !files?.length && (
        <div className="text-muted-foreground absolute top-[50%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 ">
          No items in trash
        </div>
      )}
    </section>
  );
};

export default TrashRestore;
