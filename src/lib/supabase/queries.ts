"use server";
import { supabase } from "./supabase-client";
import { validate } from "uuid";
import { File, Folder, User, Workspace } from "./supabase.types";
import { eventFormSchema } from "../schema/events";
import { z } from "zod";

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
      .eq("folder_id", folderId)
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

export const createWorkspace = async (workspace: Workspace) => {
  try {
    const { data, error } = await supabase
      .from("workspaces") // Replace with your table name
      .insert(workspace);

    console.log(data);

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

export const getFolderDetails = async (folderId: string) => {
  const isValid = validate(folderId);
  if (!isValid) {
    return { data: [], error: "Invalid folder ID" };
  }

  try {
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("id", folderId)
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching folder details:", error);
      return { data: [], error: "Error fetching folder details" };
    }

    return { data: [data], error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { data: [], error: "Unexpected error occurred" };
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

  const { data: workspaces, error: workspacesError } = await supabase
    .from("workspaces")
    .select(
      "id, created_at, workspace_owner, title, icon_id, data, in_trash, logo, banner_url"
    )
    .eq("workspace_owner", userId);

  if (workspacesError) {
    console.error("Error fetching workspaces:", workspacesError);
    return [];
  }

  const { data: collaborators, error: collaboratorsError } = await supabase
    .from("collaborators")
    .select("workspace_id");

  if (collaboratorsError) {
    console.error("Error fetching collaborators:", collaboratorsError);
    return [];
  }

  const collaboratorWorkspaceIds = new Set(
    collaborators.map((collaborator) => collaborator.workspace_id)
  );

  const privateWorkspaces =
    workspaces?.filter(
      (workspace) => !collaboratorWorkspaceIds.has(workspace.id)
    ) || [];

  return privateWorkspaces;
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
    .eq("user_id", userId);

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

export const getCollaborators = async (workspaceId: string) => {
  try {
    const { data: collaborators, error: collaboratorsError } = await supabase
      .from("collaborators")
      .select("user_id")
      .eq("workspace_id", workspaceId);

    if (collaboratorsError) {
      console.error("🔴 Error fetching collaborators:", collaboratorsError);
      return [];
    }

    if (!collaborators || !collaborators.length) {
      return [];
    }

    // Fetch user information for each collaborator
    const userIds = collaborators.map((collaborator) => collaborator.user_id);
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .in("id", userIds);

    if (usersError) {
      console.error("🔴 Error fetching user information:", usersError);
      return [];
    }

    // Filter out any undefined or null results
    return users || [];
  } catch (error) {
    console.error("🔴 Unexpected error:", error);
    return [];
  }
};

export const removeCollaborators = async (
  users: User[],
  workspaceId: string
) => {
  for (const user of users) {
    try {
      // Check if the user exists as a collaborator
      const { data: userExists, error: findError } = await supabase
        .from("collaborators")
        .select("*")
        .eq("user_id", user.id)
        .eq("workspace_id", workspaceId)
        .single();

      if (findError) {
        console.error(`Error finding collaborator: ${findError.message}`);
        continue;
      }

      if (userExists) {
        // Remove the user as a collaborator
        const { error: deleteError } = await supabase
          .from("collaborators")
          .delete()
          .eq("user_id", user.id)
          .eq("workspace_id", workspaceId);

        if (deleteError) {
          console.error(`Error deleting collaborator: ${deleteError.message}`);
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error);
    }
  }
};

export const getUsersFromSearch = async (email: string) => {
  if (!email) return [];

  const { data: accounts, error } = await supabase
    .from("users")
    .select("*")
    .like("email", `${email}%`);

  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }

  return accounts;
};

export const createFolder = async (folder: Folder) => {
  const { data, error } = await supabase.from("folders").insert(folder);

  if (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }

  return { data, error: null };
};

export const createFile = async (file: File) => {
  const { data, error } = await supabase.from("files").insert(file);

  if (error) {
    console.log(error);
    return { data: null, error: "Error" };
  }

  return { data, error: null };
};

export const updateFolder = async (
  folder: Partial<Folder>,
  folderId: string
) => {
  try {
    const { data, error } = await supabase
      .from("folders")
      .update(folder)
      .eq("id", folderId);

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

export const deleteFolder = async (folderId: string) => {
  if (!folderId) return;
  const { error } = await supabase.from("folders").delete().eq("id", folderId);

  if (error) {
    console.error("Error deleting folder:", error);
    throw error;
  }
};

export const deleteFile = async (fileId: string) => {
  if (!fileId) return;
  const { error } = await supabase.from("files").delete().eq("id", fileId);

  if (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

export const updateFile = async (file: Partial<Folder>, fileId: string) => {
  try {
    const { data, error } = await supabase
      .from("files")
      .update(file)
      .eq("id", fileId);

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

export const getFileDetails = async (fileId: string) => {
  const isValid = validate(fileId);

  if (!isValid) {
    return { data: [], error: "Invalid file ID" };
  }

  try {
    const { data, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", fileId)
      .limit(1)
      .single();

    if (error) {
      console.error("🔴 Error fetching file details:", error);
      return { data: [], error: "Error fetching file details" };
    }

    return { data: [data], error: null };
  } catch (error) {
    console.error("🔴 Unexpected error:", error);
    return { data: [], error: "Unexpected error occurred" };
  }
};

export const updateWorkspace = async (
  workspace: Partial<Workspace>,
  workspaceId: string
) => {
  if (!workspaceId) return { data: null, error: "Workspace ID is required" };

  try {
    const { data, error } = await supabase
      .from("workspaces")
      .update(workspace)
      .eq("id", workspaceId);

    if (error) {
      console.log(error);
      return { data: null, error: "Error updating workspace" };
    }

    return { data, error: null };
  } catch (error) {
    console.log(error);
    return { data: null, error: "Unexpected error occurred" };
  }
};

export const deleteWorkspace = async (workspaceId: string) => {
  if (!workspaceId) return { data: null, error: "Workspace ID is required" };

  try {
    const { error } = await supabase
      .from("workspaces")
      .delete()
      .eq("id", workspaceId);

    if (error) {
      console.error(`Error deleting workspace: ${error.message}`);
      return { data: null, error: "Error deleting workspace" };
    }

    return { data: "Workspace deleted successfully", error: null };
  } catch (error) {
    console.error("Unexpected error:", error);
    return { data: null, error: "Unexpected error occurred" };
  }
};

export const getWorkspaceDetails = async (workspaceId: string) => {
  const isValid = validate(workspaceId);
  if (!isValid) {
    return {
      data: [],
      error: "Invalid workspace ID",
    };
  }

  try {
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .eq("id", workspaceId)
      .limit(1)
      .single();

    if (error) {
      console.error(error);
      return {
        data: [],
        error: error.message || "Error fetching workspace details",
      };
    }

    return { data: data ? [data] : [], error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: "Unexpected error occurred" };
  }
};

export const findUser = async (userId: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }

  return data;
};

export async function getEvents(userId: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Error fetching user: ${error.message}`);
  }

  return data;
}

export async function insertEvent(
  data: z.infer<typeof eventFormSchema>,
  userId: string
) {
  const { error } = await supabase.from("events").insert({
    ...data,
    user_id: userId,
    duration_in_minutes: data.duration_in_minutes,
    is_active: data.is_active,
  });

  if (error) {
    throw new Error(`Error inserting event: ${error.message}`);
  }

  return { message: "Event inserted successfully" };
}

export async function getEventById(userId: string, eventId: string) {
  console.log(userId, eventId, "sisi");

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("user_id", userId)
    .eq("id", eventId)
    .single();

  if (error) {
    throw new Error(`Error fetching event: ${error.message}`);
  }

  return data;
}

export async function updateEventDetails(
  id: string,
  userId: string,
  data: Record<string, unknown>
) {
  const {
    error,
    data: updatedRows,
    count,
  } = await supabase
    .from("events")
    .update({ ...data })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*");

  if (count === 0) return { error: true };

  if (error) {
    throw new Error(`Error updating event: ${error.message}`);
  }

  return { updatedRows, affectedRows: count };
}

export async function deleteEventQuery(eventId: string, userId: string) {
  const { error, data } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Error deleting event: ${error.message}`);
  }

  return { message: "Event deleted successfully", data };
}
