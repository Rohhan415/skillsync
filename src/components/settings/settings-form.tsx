"use client";

import { useToast } from "@/hooks/use-toast";
import { useAppState } from "@/lib/providers/state-provider";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { User, Workspace } from "@/lib/supabase/supabase.types";
import { Separator } from "@radix-ui/react-select";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import LogoutButton from "../global/logout-button";
import {
  Briefcase,
  Lock,
  LogOut,
  Plus,
  Share,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  addCollaborators,
  deleteWorkspace,
  getCollaborators,
  removeCollaborators,
  updateWorkspace,
} from "@/lib/supabase/queries";
import { v4 } from "uuid";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import CollaboratorSearch from "../global/collaborator-search";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "../ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";
import ProfileIcon from "../icons/Profile-Icon";

const SettingsForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useSupabaseUser();
  const supabase = createClientComponentClient();
  const { state, workspaceId, dispatch } = useAppState();
  const [permissions, setPermissions] = useState("private");
  const [collaborators, setCollaborators] = useState<User[] | []>([]);
  const [openAlertMessage, setOpenAlertMessage] = useState(false);
  const [workspaceDetails, setWorkspaceDetails] = useState<Workspace>();
  const titleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // add collaborators
  const addCollaborator = async (profile: User) => {
    if (!workspaceId) return;
    await addCollaborators([profile], workspaceId);

    setCollaborators([...collaborators, profile]);
  };

  //remove collaborators
  const removeCollaborator = async (user: User) => {
    if (!workspaceId) return;
    if (collaborators.length === 1) {
      setPermissions("private");
    }
    await removeCollaborators([user], workspaceId);
    setCollaborators(
      collaborators.filter((collaborator) => collaborator.id !== user.id)
    );
    router.refresh();
  };

  //on change
  const workspaceNameChangeHandler = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!workspaceId || !e.target.value) return;

    dispatch({
      type: "UPDATE_WORKSPACE",
      payload: { workspace: { title: e.target.value }, workspaceId },
    });

    if (titleTimerRef.current) {
      console.log(
        "workspaceNameChangeHandler -> e.target.value",
        e.target.value
      );
      clearTimeout(titleTimerRef.current);
    }

    titleTimerRef.current = setTimeout(async () => {
      await updateWorkspace({ title: e.target.value }, workspaceId);
    }, 500);
  };

  const AlertConfirmHandler = async () => {
    if (!workspaceId) return;
    if (collaborators.length > 0) {
      await removeCollaborators(collaborators, workspaceId);
    }
    setPermissions("private");
    setOpenAlertMessage(false);
  };

  const onPermissionsChangeHandler = (val: string) => {
    (() =>
      val === "private" ? setOpenAlertMessage(true) : setPermissions(val))();
  };

  const onChangeWorkspaceLogoHandler = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!workspaceId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const uuid = v4();
    setUploadingLogo(true);
    const { error } = await supabase.storage
      .from("workspace-logos")
      .upload(`workspaceLogo.${uuid}`, file, {
        cacheControl: "3600",
        upsert: true,
      });
    if (!error) {
      dispatch({
        type: "UPDATE_WORKSPACE",
        payload: { workspace: { title: e.target.value }, workspaceId },
      });
      await updateWorkspace({ title: e.target.value }, workspaceId);
      setUploadingLogo(true);
    }
  };

  //onchange workspace name
  // fetching avatars
  // get workspace details
  //get all collaborators

  useEffect(() => {
    if (!workspaceId) return;
    const fetchCollaborators = async () => {
      const response = await getCollaborators(workspaceId);
      if (response.length) {
        setPermissions("shared");
        setCollaborators(response);
      }
    };
    fetchCollaborators();
  }, [workspaceId]);

  useEffect(() => {
    const showingWorkspace = state.workspaces.find(
      (workspace) => workspace.id === workspaceId
    );
    if (showingWorkspace) {
      setWorkspaceDetails(showingWorkspace);
    }
  }, [state.workspaces, workspaceId]);

  return (
    <div className="flex gap-4 flex-col">
      <p className=" flex items-center gap-2 mt-6">
        <Briefcase size={24} />
        Workspace
      </p>
      <Separator className="h-[1px] bg-border" />
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="workspaceName"
          className="text-sm text-muted-foreground"
        >
          Workspace Name
        </Label>
        <Input
          name="workspaceName"
          value={workspaceDetails ? workspaceDetails.title : ""}
          placeholder="Workspace Name"
          onChange={workspaceNameChangeHandler}
        />
        <Label
          htmlFor="workspaceLogo"
          className="text-sm text-muted-foreground"
        >
          Workspace Logo
        </Label>
        <Input
          name="workspaceLogo"
          type="file"
          accept="image/*"
          placeholder="Workspace Logo"
          onChange={onChangeWorkspaceLogoHandler}
          disabled={uploadingLogo}
        />
      </div>
      <>
        <Label htmlFor="permissions">Permissions</Label>
        <Select onValueChange={onPermissionsChangeHandler} value={permissions}>
          <SelectTrigger className="w-full h-26 -mt-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="private">
                <div className="p-2 flex gap-4 justify-center items-center ">
                  <Lock />
                  <article className="text-left flex flex-col">
                    <span>Private</span>
                    <p>
                      Your workspace is private to you. You can choose to change
                      it later.
                    </p>
                  </article>
                </div>
              </SelectItem>
              <SelectItem value="shared">
                <div className="p-2 flex gap-4 justify-center items-center ">
                  <Share />
                  <article className="text-left flex flex-col">
                    <span>Shared</span>
                    <p>You can invite others to collaborate with you.</p>
                  </article>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {permissions === "shared" && (
          <div className="flex flex-col justify-center items-center">
            <CollaboratorSearch
              existingCollaborators={collaborators}
              getCollaborators={(user) => {
                addCollaborator(user);
              }}
              trigger={
                <Button type="button" className="text-sm mt-2">
                  <Plus />
                  Add Collaborators
                </Button>
              }
            />
            <div className="mt-4 w-full">
              <span className="text-sm text-muted-foreground">
                Collaborators {collaborators.length || ""}
              </span>
              <ScrollArea className="h-[120px] overflow-y-auto rounded-md border border-muted-foreground/20">
                {collaborators.length ? (
                  collaborators.map((collaborators) => (
                    <div
                      className="p-4 flex justify-between items-center"
                      key={collaborators.id}
                    >
                      <div className="flex gap-4 items-center">
                        <Avatar>
                          <AvatarImage /> <AvatarFallback>PJ</AvatarFallback>
                        </Avatar>
                        <div className="text-sm gap-2 text-muted-foreground overflow-hidden overflow-ellipsis sm:w-[300px] w-[140px]">
                          {collaborators.email}
                        </div>
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => removeCollaborator(collaborators)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="absolute right-0 left-0 top-0 bottom-0 flex justify-center items-center ">
                    <span className="text-muted-foreground text-sm">
                      You have no collaborators
                    </span>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
        <Alert variant={"destructive"}>
          <AlertDescription>
            Warning! You are about to delete this workspace. This action is
            irreversible.
          </AlertDescription>
          <Button
            type="submit"
            size={"sm"}
            variant={"destructive"}
            className="text-sm bg-destructive border-2 border-destructive mt-4"
            onClick={async () => {
              if (workspaceId) {
                await deleteWorkspace(workspaceId);
                toast({
                  title: "Success",
                  description: "Workspace deleted successfully",
                });
                dispatch({ type: "DELETE_WORKSPACE", payload: workspaceId });
                router.replace("/dashboard");
              }
            }}
          >
            Delete Workspace
          </Button>
        </Alert>
        <p className="flex items-center gap-2 mt-6">
          <UserIcon size={24} /> Profile
        </p>
        <Separator />
        <div className="flex items-center">
          <Avatar>
            {/* WIP ADD USER PROFILE PIC */}
            {/* <AvatarImage src={user.} /> */}
            <AvatarFallback>
              <ProfileIcon />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col ml-6">
            <small className="text-muted-foreground cursor-not-allowed">
              {user ? user.email : ""}
            </small>
            <Label
              htmlFor="profilePicture"
              className="text-sm text-muted-foreground"
            >
              Profile Picture
            </Label>
            <Input
              name="profilePicture"
              type="file"
              accept="image/*"
              placeholder="Profile Picture"
              // onChange={onChangeProfilePicture}
              disabled={uploadingProfilePicture}
            />
          </div>
        </div>
        <LogoutButton>
          <div className="flex items-center">
            {" "}
            <LogOut />
          </div>
        </LogoutButton>
        <p></p>
      </>
      <AlertDialog open={openAlertMessage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDescription>
              Changing the workspace from Shared to Private will permanently
              remove all collaborators.
            </AlertDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenAlertMessage(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={AlertConfirmHandler}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsForm;
