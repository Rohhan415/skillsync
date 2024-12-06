/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAppState } from "@/lib/providers/state-provider";
import { File, Folder, Workspace } from "@/lib/supabase/supabase.types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "quill/dist/quill.snow.css";
import { Details } from "@/lib/helpers/details";
import { Button } from "../ui/button";
import {
  deleteFile,
  deleteFolder,
  findUser,
  getFileDetails,
  getFolderDetails,
  getWorkspaceDetails,
  updateFile,
  updateFolder,
  updateWorkspace,
} from "@/lib/supabase/queries";
import { usePathname, useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import useSocket from "@/lib/providers/socket-provider";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface QuillEditorProps {
  dirDetails: File | Folder | Workspace;
  fileId: string;
  dirType: "file" | "folder" | "workspace";
}

const toolbarOptions = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ["clean"], // remove formatting button
];

//TODO CLEANUP OF THE FILE.
// 1. MAKING CUSTOM HOOKS FOR THE SOCKET AND QUILL
// 2. MAKING USE STATE INTO ONE OBJECT

const QuillEditor: React.FC<QuillEditorProps> = ({
  dirDetails,
  fileId,
  dirType,
}) => {
  const supabase = createClientComponentClient();
  const pathname = usePathname();
  const router = useRouter();
  const { state, workspaceId, folderId, dispatch } = useAppState();
  const { user } = useSupabaseUser();
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const { socket, isConnected } = useSocket();
  const [quill, setQuill] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [localCursors, setLocalCursors] = useState<any>([]);
  const [collaborators, setCollaborators] = useState<
    {
      id: string;
      email: string;
      avatarURL: string;
    }[]
  >([{ id: "shh223eesh", email: "assss@gmail.com", avatarURL: "shheesh" }]);

  const details = Details({
    dirType,
    fileId,
    dirDetails,
  });

  const restoreFileHandler = async () => {
    if (dirType === "file") {
      if (!folderId || !workspaceId) return;
      dispatch({
        type: "UPDATE_FILE",
        payload: { file: { in_trash: "" }, fileId, folderId, workspaceId },
      });
      await updateFile({ in_trash: "" }, fileId);
    }
    if (dirType === "folder") {
      if (!workspaceId) return;
      dispatch({
        type: "UPDATE_FOLDER",
        payload: { folder: { in_trash: "" }, folderId: fileId, workspaceId },
      });
      await updateFolder({ in_trash: "" }, fileId);
    }
  };

  const deleteFileHandler = async () => {
    if (dirType === "file") {
      if (!folderId || !workspaceId) return;
      dispatch({
        type: "DELETE_FILE",
        payload: { fileId, folderId, workspaceId },
      });
      await deleteFile(fileId);
      router.replace(`/dashboard/${workspaceId}`);
    }
    if (dirType === "folder") {
      if (!workspaceId) return;
      dispatch({
        type: "DELETE_FOLDER",
        payload: { folderId: fileId, workspaceId },
      });
      await deleteFolder(fileId);
      router.replace(`/dashboard/${workspaceId}`);
    }
  };

  const wrapperRef = useCallback((wrapper: any) => {
    if (typeof window !== "undefined") {
      if (wrapper === null) return;
      wrapper.innerHTML = "";
      const editor = document.createElement("div");
      wrapper.append(editor);
      import("quill").then((QuillModule) => {
        import("quill-cursors").then((QuillCursorsModule) => {
          const Quill = QuillModule.default;
          const QuillCursors = QuillCursorsModule.default;
          Quill.register("modules/cursors", QuillCursors);
          const quill = new Quill(editor, {
            theme: "snow",
            modules: {
              toolbar: toolbarOptions,
              cursors: {
                transformOnTextChange: true,
              },
            },
          });
          setQuill(quill);
        });
      });
    }
  }, []);

  const breadcrumbNavBar = useMemo(() => {
    if (!pathname || !state.workspaces || !workspaceId) return;
    const segments = pathname
      .split("/")
      .filter((segment) => segment !== "dashboard " && segment);
    const workspaceDetails = state.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );
    const workspaceBreadcrumb = workspaceDetails
      ? ` ${workspaceDetails.title}`
      : "";
    if (segments.length === 1) return workspaceBreadcrumb;
    const folderSegment = segments[2];
    const folderDetails = workspaceDetails?.folders.find(
      (folder) => folder.id === folderSegment
    );

    const folderBreadcrumb = folderDetails ? ` / ${folderDetails.title}` : "";
    if (segments.length === 2)
      return `${workspaceBreadcrumb} ${folderBreadcrumb}`;
    const fileSegment = segments[3];
    const fileDetails = folderDetails?.files.find(
      (file) => file.id === fileSegment
    );
    const fileBreadcrumb = fileDetails ? ` / ${fileDetails.title}` : "";

    return `${workspaceBreadcrumb} ${folderBreadcrumb} ${fileBreadcrumb}`;
  }, [pathname, workspaceId, state.workspaces]);

  useEffect(() => {
    if (!fileId) return;
    const fetchData = async () => {
      if (dirType === "file") {
        const { data: selectedDirectory, error } = await getFileDetails(fileId);
        if (error || !selectedDirectory) router.replace("/dashboard");

        if (!selectedDirectory[0]) {
          if (!workspaceId) return;
          router.replace(`/dashboard/${workspaceId}`);
        }
        if (!workspaceId || quill === null) return;
        if (!selectedDirectory[0].data) return;
        quill.setContents(JSON.parse(selectedDirectory[0].data || ""));
        dispatch({
          type: "UPDATE_FILE",
          payload: {
            file: { data: selectedDirectory[0].data },
            fileId,
            folderId: selectedDirectory[0].folder_id,
            workspaceId,
          },
        });
      }
      if (dirType === "folder") {
        const { data: selectedDirectory, error } = await getFolderDetails(
          fileId
        );
        if (error || !selectedDirectory) router.replace("/dashboard");

        if (!selectedDirectory[0]) {
          if (!workspaceId) return;
          router.replace(`/dashboard/${workspaceId}`);
        }
        if (!workspaceId || quill === null) return;
        if (!selectedDirectory[0].data) return;
        quill.setContents(JSON.parse(selectedDirectory[0].data || ""));
        dispatch({
          type: "UPDATE_FOLDER",
          payload: {
            folder: { data: selectedDirectory[0].data },
            folderId: fileId,
            workspaceId: selectedDirectory[0].workspace_id,
          },
        });
      }
      if (dirType === "workspace") {
        const { data: selectedDirectory, error } = await getWorkspaceDetails(
          fileId
        );
        if (error || !selectedDirectory) router.replace("/dashboard");

        if (!workspaceId || quill === null) return;
        if (!selectedDirectory[0].data) return;
        quill.setContents(JSON.parse(selectedDirectory[0].data || ""));
        dispatch({
          type: "UPDATE_WORKSPACE",
          payload: {
            workspace: selectedDirectory[0],
            workspaceId: fileId,
          },
        });
      }
    };
    fetchData();
  }, [dirType, dispatch, fileId, quill, router, workspaceId]);

  useEffect(() => {
    if (quill === null || socket === null || !fileId || !localCursors.length)
      return;

    const socketHandler = (range: any, roomID: string, cursorID: string) => {
      if (roomID === fileId) {
        const userCursor = localCursors.find(
          (cursor: any) => cursor.cursors()?.[0].id === cursorID
        );
        if (userCursor) {
          userCursor.moveCursor(cursorID, range);
        }
      }
    };
    socket.on("receive-cursor-move", socketHandler);

    return () => {
      socket.off("receive-cursor-move", socketHandler);
    };
  }, [fileId, localCursors, quill, socket]);

  useEffect(() => {
    if (socket === null || quill === null || !fileId) return;
    socket.emit("create-room", fileId);
  }, [fileId, quill, socket]);

  useEffect(() => {
    if (socket === null || quill === null || !fileId || !user) return;

    const selectionChangeHandler = (cursorID: string) => {
      return (range: any, oldRange: any, source: any) => {
        if (source === "user" && cursorID) {
          socket.emit("send-cursor-move", range, fileId, cursorID);
        }
      };
    };

    const quillHandler = (delta: any, oldDelta: any, source: any) => {
      if (source !== "user") return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaving(true);
      const contents = quill.getContents();
      const quillLength = quill.getLength();
      saveTimerRef.current = setTimeout(async () => {
        const updateState = async () => {
          if (contents && quillLength !== 1 && fileId) {
            if (dirType === "workspace") {
              if (!workspaceId) return;
              await updateWorkspace({ data: JSON.stringify(contents) }, fileId);
              dispatch({
                type: "UPDATE_WORKSPACE",
                payload: {
                  workspace: { data: JSON.stringify(contents) },
                  workspaceId: fileId,
                },
              });
            }
            if (dirType === "folder") {
              if (!workspaceId) return;
              await updateFolder({ data: JSON.stringify(contents) }, fileId);
              dispatch({
                type: "UPDATE_FOLDER",
                payload: {
                  folder: { data: JSON.stringify(contents) },
                  folderId: fileId,
                  workspaceId,
                },
              });
            }
            if (dirType === "file") {
              if (!workspaceId || !folderId) return;
              await updateFile({ data: JSON.stringify(contents) }, fileId);
              dispatch({
                type: "UPDATE_FILE",
                payload: {
                  file: { data: JSON.stringify(contents) },
                  fileId,
                  folderId,
                  workspaceId,
                },
              });
            }
          }
        };
        await updateState();
        setSaving(false);
      }, 800);
      socket.emit("send-changes", delta, fileId);
    };
    quill.on("text-change", quillHandler);
    quill.on("selection-change", selectionChangeHandler(user.id));

    return () => {
      quill.off("text-change", quillHandler);
      quill.off("selection-change", selectionChangeHandler(user.id));
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [dirType, dispatch, fileId, folderId, quill, socket, user, workspaceId]);

  useEffect(() => {
    if (quill === null || socket === null) return;

    const socketHandler = (delta: any, id: string) => {
      if (id === fileId) quill.updateContents(delta);
    };
    socket.on("receive-changes", socketHandler);

    return () => {
      socket.off("receive-changes", socketHandler);
    };
  }, [fileId, quill, socket]);

  useEffect(() => {
    if (!fileId || quill === null) return;

    const room = supabase.channel(fileId);

    room
      .on("presence", { event: "sync" }, () => {
        const newState = room.presenceState();
        const newCollaborators = Object.values(newState).flat() as any;
        setCollaborators(newCollaborators);
        if (user) {
          const allCursors: any = [];
          newCollaborators.forEach(
            (collaborator: { id: string; email: string; avatar: string }) => {
              if (collaborator.id !== user.id) {
                const userCursor = quill.getModule("cursors");
                userCursor.createCursor(
                  collaborator.id,
                  collaborator.email.split("@")[0],
                  `#${Math.random().toString(16).slice(2, 8)}`
                );
                allCursors.push(userCursor);
              }
            }
          );
          setLocalCursors(allCursors);
        }
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED" || !user) return;

        const response = await findUser(user.id);
        if (!response) return;

        room.track({
          id: user.id,
          email: user.email?.split("@")[0],
          avatarUrl: response.avatar_url
            ? supabase.storage
                .from("Avatars")
                .getPublicUrl(response.avatar_url ?? "").data.publicUrl
            : "",
        });
      });
    return () => {
      supabase.removeChannel(room);
    };
  }, [fileId, quill, setLocalCursors, supabase, user]);

  return (
    <>
      <div className=" ">
        {details.in_trash && (
          <article className=" py-2 z-40 bg-[#EB5757] md:flex-row flex-col justify-center items-center gap-4 flex-wrap">
            <div className="flex flex-col md:flex-row gap-2 justify-center items-center">
              <span className="text-white">
                This {dirType} is in the trash.
              </span>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent border-white text-white  hover:bg-white hover:text-[#EB5757]"
                onClick={restoreFileHandler}
              >
                Restore
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-transparent border-white text-white  hover:bg-white hover:text-[#EB5757]"
                onClick={deleteFileHandler}
              >
                Delete
              </Button>
              <span className="text-sm text-white">{details.in_trash}</span>
            </div>
          </article>
        )}
      </div>
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between justify-center sm:items-center sm:p-2 p-8">
        <div>{breadcrumbNavBar}</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center h-10">
            {" "}
            {collaborators?.map((collaborator) => (
              <TooltipProvider key={collaborator.id}>
                <Tooltip>
                  <TooltipTrigger>
                    <Avatar className="-ml-3 bg-background border-2 flex items-center justify-center border-white h-8 w-8 rounded-full">
                      <AvatarImage
                        src={
                          collaborator.avatarURL ? collaborator.avatarURL : ""
                        }
                        className="rounded-full"
                      />
                      <AvatarFallback>
                        {collaborator.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>{collaborator.email}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          {saving ? (
            <Badge
              variant="secondary"
              className="bg-orange-600 top-4 text-white right-4 z-50"
            >
              Saving
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="bg-emerald-600 top-4 text-white right-4 z-50"
            >
              Saved
            </Badge>
          )}
        </div>
      </div>
      <div className="flex flex-col ">
        <span className="text-muted-foreground text-3xl font-bold h-9">
          {details.title}
        </span>
        <span className="text-muted-foreground text-sm">
          {dirType.toUpperCase()}
        </span>
      </div>

      <div className=" flex-grow flex  justify-start items-center flex-col mt-2 relative">
        <div
          id="container"
          className="max-w-[800px] h-full pb-8  flex flex-col items-center"
          ref={wrapperRef}
        ></div>
      </div>
    </>
  );
};

export default QuillEditor;
