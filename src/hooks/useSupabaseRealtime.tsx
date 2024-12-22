"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppState } from "@/lib/providers/state-provider";
import { File, Folder, Workspace } from "@/lib/supabase/supabase.types";

const useSupabaseRealtime = () => {
  const supabase = createClientComponentClient();
  const { dispatch, state, workspaceId: selectedWorkspace } = useAppState();
  const router = useRouter();

  useEffect(() => {
    const fileChannel = supabase.channel("realtime-files");

    fileChannel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "files" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            console.log("🟢 RECEIVED REAL TIME EVENT");
            const {
              folder_id: folderId,
              workspace_id: workspaceId,
              id: fileId,
            } = payload.new;
            if (
              !state.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders.find((folder) => folder.id === folderId)
                ?.files.find((file) => file.id === fileId)
            ) {
              const newFile: File = {
                id: payload.new.id,
                workspace_id: payload.new.workspace_id,
                folder_id: payload.new.folder_id,
                created_at: payload.new.created_at,
                title: payload.new.title,
                icon_id: payload.new.icon_id,
                data: payload.new.data,
                in_trash: payload.new.in_trash,
                banner_url: payload.new.banner_url,
              };
              dispatch({
                type: "ADD_FILE",
                payload: { file: newFile, folderId, workspaceId },
              });
            }
          } else if (payload.eventType === "DELETE") {
            let workspaceId = "";
            let folderId = "";
            const fileExists = state.workspaces.some((workspace) =>
              workspace.folders.some((folder) =>
                folder.files.some((file) => {
                  if (file.id === payload.old.id) {
                    workspaceId = workspace.id;
                    folderId = folder.id;
                    return true;
                  }
                })
              )
            );
            if (fileExists && workspaceId && folderId) {
              router.replace(`/dashboard/${workspaceId}`);
              dispatch({
                type: "DELETE_FILE",
                payload: { fileId: payload.old.id, folderId, workspaceId },
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const { folder_id: folderId, workspace_id: workspaceId } =
              payload.new;
            state.workspaces.some((workspace) =>
              workspace.folders.some((folder) =>
                folder.files.some((file) => {
                  if (file.id === payload.new.id) {
                    dispatch({
                      type: "UPDATE_FILE",
                      payload: {
                        workspaceId,
                        folderId,
                        fileId: payload.new.id,
                        file: {
                          title: payload.new.title,
                          icon_id: payload.new.icon_id,
                          in_trash: payload.new.in_trash,
                        },
                      },
                    });
                    return true;
                  }
                })
              )
            );
          }
        }
      )
      .subscribe();

    const folderChannel = supabase.channel("realtime-folders");

    folderChannel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "folders" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            console.log(payload);

            const { id: folderId, workspace_id: workspaceId } = payload.new;

            if (
              !state.workspaces
                .find((workspace) => workspace.id === workspaceId)
                ?.folders.find((folder) => folder.id === folderId)
            ) {
              const newFolder: Folder = {
                id: payload.new.id,
                data: payload.new.data,
                created_at: payload.new.created_at,
                title: payload.new.title,
                icon_id: payload.new.icon_id,
                in_trash: payload.new.in_trash,
                banner_url: payload.new.banner_url,
                workspace_id: payload.new.workspace_id,
              };
              dispatch({
                type: "ADD_FOLDER",
                payload: { workspaceId, folder: { ...newFolder, files: [] } },
              });
            }
          } else if (payload.eventType === "DELETE") {
            let workspaceId = "";
            let folderId = "";
            const folderExists = state.workspaces.some((workspace) =>
              workspace.folders.some((folder) => {
                if (folder.id === payload.old.id) {
                  workspaceId = workspace.id;
                  folderId = folder.id;
                  return true;
                }
              })
            );
            if (folderExists && workspaceId && folderId) {
              router.replace(`/dashboard/${workspaceId}`);
              dispatch({
                type: "DELETE_FOLDER",
                payload: { folderId: payload.old.id, workspaceId },
              });
            }
          } else if (payload.eventType === "UPDATE") {
            const { workspace_id: workspaceId } = payload.new;
            console.log(payload.new);

            state.workspaces.some((workspace) =>
              workspace.folders.some((folder) => {
                if (folder.id === payload.new.id) {
                  dispatch({
                    type: "UPDATE_FOLDER",
                    payload: {
                      workspaceId,
                      folderId: payload.new.id,
                      folder: {
                        title: payload.new.title,
                        icon_id: payload.new.icon_id,
                        in_trash: payload.new.in_trash,
                      },
                    },
                  });
                  return true;
                }
              })
            );
          }
        }
      )
      .subscribe();

    const workspaceChannel = supabase.channel("realtime-workspaces");

    workspaceChannel
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workspaces" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            console.log("🟢 RECEIVED REAL TIME WORKSPACE EVENT");
            const newWorkspace: Workspace = {
              id: payload.new.id,
              created_at: payload.new.created_at,
              title: payload.new.title,
              icon_id: payload.new.icon_id,
              in_trash: payload.new.in_trash,
              workspace_owner: payload.new.workspace_owner,
              logo: payload.new.logo,
              banner_url: payload.new.banner_url,
              data: payload.new.data,
            };
            dispatch({
              type: "ADD_WORKSPACE",
              payload: { ...newWorkspace, folders: [] },
            });
          } else if (payload.eventType === "DELETE") {
            dispatch({
              type: "DELETE_WORKSPACE",
              payload: payload.old.id,
            });
          } else if (payload.eventType === "UPDATE") {
            dispatch({
              type: "UPDATE_WORKSPACE",
              payload: {
                workspaceId: payload.new.id,
                workspace: {
                  title: payload.new.title,
                  icon_id: payload.new.icon_id,
                  in_trash: payload.new.in_trash,
                  workspace_owner: payload.new.workspace_owner,
                  logo: payload.new.logo,
                  banner_url: payload.new.banner_url,
                  data: payload.new.data,
                },
              },
            });
          }
        }
      )
      .subscribe();

    return () => {
      fileChannel.unsubscribe();
      folderChannel.unsubscribe();
      workspaceChannel.unsubscribe();
    };
  }, [supabase, state, dispatch, router, selectedWorkspace]);

  return null;
};

export default useSupabaseRealtime;
