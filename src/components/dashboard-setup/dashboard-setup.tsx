/* eslint-disable @typescript-eslint/no-empty-object-type */
"use client";
import { CreateWorkspaceFormSchema } from "@/lib/types";
import { SubmitHandler, useForm } from "react-hook-form";
import { AuthUser } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { z } from "zod";
import { Workspace } from "@/lib/supabase/supabase.types";
import { createWorkspace } from "@/lib/supabase/queries";
import { v4 } from "uuid";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAppState } from "../../lib/providers/state-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "../ui/button";
import Loader from "../global/Loader";

interface DashboardSetupProps {
  user: AuthUser;
}
const DashboardSetup: React.FC<DashboardSetupProps> = ({ user }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { dispatch } = useAppState();
  const supabase = createClientComponentClient();
  const [fileName, setFileName] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting: isLoading, errors },
  } = useForm<z.infer<typeof CreateWorkspaceFormSchema>>({
    mode: "onChange",
    defaultValues: {
      logo: "",
      workspaceName: "",
    },
  });

  const onSubmit: SubmitHandler<
    z.infer<typeof CreateWorkspaceFormSchema>
  > = async (value) => {
    const file = value.logo?.[0];
    let filePath = null;
    const workspaceUUID = v4();

    if (file) {
      try {
        const { data, error } = await supabase.storage
          .from("workspace-logos")
          .upload(`workspaceLogo.${workspaceUUID}`, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (error) throw new Error("");
        filePath = data.path;
      } catch (error) {
        console.log("Error", error);
        toast({
          variant: "destructive",
          title: "Error! Could not upload your workspace logo",
        });
      }
    }
    try {
      const newWorkspace: Workspace = {
        data: null,
        created_at: new Date().toISOString(),
        icon_id: "",
        id: workspaceUUID,
        in_trash: "",
        title: value.workspaceName,
        workspace_owner: user.id,
        logo: filePath || null,
        banner_url: "",
      };
      const { error: createError } = await createWorkspace(newWorkspace);
      if (createError) {
        throw new Error();
      }
      dispatch({
        type: "ADD_WORKSPACE",
        payload: { ...newWorkspace, folders: [] },
      });

      toast({
        title: "Workspace Created",
        description: `${newWorkspace.title} has been created successfully.`,
      });

      router.replace(`/dashboard/${newWorkspace.id}`);
    } catch (error) {
      console.log(error, "Error");
      toast({
        variant: "destructive",
        title: "Could not create your workspace",
        description:
          "Oops! Something went wrong, and we couldn't create your workspace. Try again or come back later.",
      });
    } finally {
      reset();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName(null);
    }
  };

  return (
    <Card className="w-[40rem] h-screen sm:h-auto">
      <CardHeader>
        <CardTitle className="text-3xl">
          Is this your first time logging into Skillsync?
        </CardTitle>
        <CardDescription className="text-base">
          Let&apos;s create a private workspace to get you started. You can add
          collaborators later from the workspace settings tab.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="flex  items-center">
                    <Input
                      id="logo"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      placeholder="Workspace Name"
                      disabled={isLoading}
                      {...register("logo", {
                        required: false,
                      })}
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="logo"
                      className="cursor-pointer border border-primary text-primary rounded-md px-4 py-2 text-base"
                    >
                      {fileName ? fileName : "Choose File"}
                    </label>
                  </span>
                  <span className="text-lg ml-6 text-muted-foreground">
                    Change your workspace Logo!
                  </span>
                </div>
              </div>
              <div className="w-full flex flex-col gap-2">
                <Label
                  htmlFor="workspaceName"
                  className="text-lg  text-muted-foreground"
                >
                  Name
                </Label>
                <Input
                  id="workspaceName"
                  type="text"
                  className="border border-gray-300 rounded-md w-full text-base"
                  placeholder="Workspace Name"
                  disabled={isLoading}
                  {...register("workspaceName", {
                    required: "Workspace name is required",
                  })}
                />
                <small className="text-red-600">
                  {errors?.workspaceName?.message?.toString()}
                </small>
              </div>
              <div className="w-full">
                <small className="text-red-600">
                  {errors?.logo?.message?.toString()}
                </small>
              </div>
            </div>
            <div className="self-center">
              <Button disabled={isLoading} type="submit" variant="start">
                {!isLoading ? "Create Workspace" : <Loader />}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DashboardSetup;
