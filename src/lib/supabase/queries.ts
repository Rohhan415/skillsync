"use server";
import { supabase } from "./supabase-client";
import { validate } from "uuid";
import { User, workspace } from "./supabase.types";

export const getUserSubscriptionStatus = async (userId: string) => {
  try {
    const { data } = await supabase
      .from("subscriptions")
      .select("*, prices(*)")
      .eq("user_id", userId)
      .single();

    if (data) return { data, error: null };
    else return { data: null, error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { data: null, error: `Error` };
  }
};
export const getFiles = async (folderId: string) => {
  const isValid = validate(folderId);
  if (!isValid) return { data: null, error: "Error" };

  try {
    const { data, error } = await supabase
      .from("files") // Replace with your table name
      .select("*")
      .eq("folderId", folderId)
      .order("createdAt", { ascending: true });

    if (error) {
      console.log(error);
      return { data: null, error: "Error" };
    }

    return { data, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }
};

export const createWorkspace = async (workspace: workspace) => {
  try {
    const { data, error } = await supabase
      .from("workspaces") // Replace with your table name
      .insert(workspace);

    if (error) {
      console.log(error);
      return { data: null, error: "Error" };
    }

    return { data, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }
};

export const getFolders = async (workspaceId: string) => {
  const isValid = validate(workspaceId);
  if (!isValid) {
    return {
      data: null,
      error: "Error",
    };
  }

  try {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: true });

    if (error) {
      console.log(error);
      return { data: null, error: "Error" };
    }

    return { data, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }
};

export const getPrivateWorkspaces = async (userId: string) => {
  if (!userId) return [];

  try {
    // First, get the list of workspace IDs that the user is a collaborator of
    const { data: collaboratorData, error: collaboratorError } = await supabase
      .from("collaborators")
      .select("workspace_id")
      .eq("user_id", userId);

    if (collaboratorError) {
      console.log(collaboratorError, "sisi");
      return [];
    }

    // Extract the IDs from the collaborator data
    const collaboratorWorkspaceIds =
      collaboratorData?.map((item) => item.workspace_id) || [];

    // Next, get workspaces that the user owns and exclude those they are a collaborator of
    const { data, error } = await supabase
      .from("workspaces")
      .select(
        `
        id,
        created_at,
        workspace_owner,
        title,
        icon_id,
        data,
        in_trash,
        logo,
        banner_url
      `
      )
      .eq("workspace_owner", userId)
      .not("id", "in", `(${collaboratorWorkspaceIds.join(",")})`);
    //need to parse it with commas to make it work properly

    if (error) {
      console.log(error, "ss");
      return [];
    }

    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getCollaboratingWorkspaces = async (userId: string) => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("collaborators")
    .select(
      `
      workspaces (
        id,
        created_at,
        workspace_owner,
        title,
        icon_id,
        data,
        in_trash,
        logo,
        banner_url
      )
    `
    )
    .eq("user_id", userId)
    .eq("workspaces.workspace_owner", userId); // Only include workspaces owned by the specified user

  if (error) {
    console.error("Error fetching collaborating workspaces:", error);
    return [];
  }

  const collaboratingWorkspaces = data
    .map((item) => item.workspaces)
    .filter((workspace) => workspace !== null);

  return collaboratingWorkspaces;
};

export const getSharedWorkspaces = async (userId: string) => {
  if (!userId) return [];

  const { data: sharedWorkspaces, error } = await supabase
    .from("workspaces")
    .select(
      `
      id,
      created_at,
      workspace_owner,
      title,
      icon_id,
      data,
      in_trash,
      logo,
      banner_url,
      collaborators (
        workspace_id
      )
    `
    )
    .eq("workspace_owner", userId)
    .order("created_at", { ascending: true });

  console.log(sharedWorkspaces, "sharedWorkspaces");

  if (error) {
    console.error("Error fetching shared workspaces:", error);
    return [];
  }

  // Filter to ensure only workspaces with collaborators are included
  const filteredWorkspaces =
    sharedWorkspaces?.filter(
      (workspace) =>
        workspace.collaborators && workspace.collaborators.length > 0
    ) || [];

  return filteredWorkspaces;
};

export const addCollaborators = async (users: User[], workspaceId: string) => {
  for (const user of users) {
    const { data: userExists, error } = await supabase
      .from("collaborators")
      .select("id")
      .eq("user_id", user.id)
      .eq("workspace_id", workspaceId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error checking collaborator existence:", error.message);
      continue;
    }

    if (!userExists) {
      const { error: insertError } = await supabase
        .from("collaborators")
        .insert({ workspace_id: workspaceId, user_id: user.id });

      if (insertError) {
        console.error("Error adding collaborator:", insertError.message);
      }
    }
  }
};
