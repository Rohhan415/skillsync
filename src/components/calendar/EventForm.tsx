"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventFormSchema } from "@/lib/schema/events";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";

import {
  createEvent,
  deleteEvent,
  updateEvent,
} from "@/lib/serverActions/events";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

import { useState, useTransition } from "react";
import { DatePicker } from "./DatePicker";
import { User } from "@/lib/supabase/supabase.types";
import CollaboratorSearch from "../global/collaborator-search";
import { insertCollaboratorEvent } from "@/lib/supabase/queries";

const EventForm = ({
  event,
}: {
  event?: {
    id: string;
    name: string;
    description?: string;
    duration_in_minutes: number;
    is_active: boolean;
    event_hour: string;
    event_date: string;
  };
}) => {
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [collaborators, setCollaborators] = useState<User[]>([]);

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event ?? {
      name: "",
      is_active: true,
      duration_in_minutes: 30,
      event_hour: "12:00",
      event_date: new Date().toISOString(),
    },
  });

  const addCollaborator = (user: User) => {
    setCollaborators((prev) => [...prev, user]);
  };

  const removeCollaborator = (user: User) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== user.id));
  };

  const onSubmit = async (values: z.infer<typeof eventFormSchema>) => {
    const action = event ? updateEvent.bind(null, event.id) : createEvent;

    // Step 1: Create or update the main event (for the owner)
    const eventData = await action(values);

    if (eventData?.error) {
      form.setError("root", {
        message: "An error occurred while creating or updating your event.",
      });
      return;
    }

    // Step 2: Loop through collaborators and create unique events for each
    const collaboratorPromises = collaborators.map(async (collaborator) => {
      const collaboratorEvent = {
        ...values,
        user_id: collaborator.id,
        is_active: false,
      };

      // Directly call a helper to insert the event for the collaborator
      const result = await insertCollaboratorEvent(collaboratorEvent);

      if (result?.error) {
        console.error(
          `Error creating event for collaborator ${collaborator.email}`
        );
        return { error: true, collaborator };
      }

      return { error: false, collaborator };
    });

    // Wait for all collaborator events to be created
    const collaboratorResults = await Promise.all(collaboratorPromises);

    // Step 3: Handle errors from collaborator events (optional feedback)
    const failedCollaborators = collaboratorResults.filter((res) => res.error);

    if (failedCollaborators.length > 0) {
      form.setError("root", {
        message: `Failed to create events for ${failedCollaborators
          .map((c) => c.collaborator.email)
          .join(", ")}`,
      });
    }

    // Step 4: Redirect or reload upon successful creation
    if (failedCollaborators.length === 0) {
      window.location.reload();
    }
  };

  const deleteEventHandler = async (eventId: string) => {
    const data = await deleteEvent(eventId);

    if (data?.error) {
      form.setError("root", {
        message: "An error occurred deleting your event",
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="gap-6 flex flex-col"
      >
        {form.formState.errors.root && (
          <div className="text-destructive text-sm">
            {form.formState.errors.root.message}
          </div>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                The name users will see when making an event
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="event_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="mb-1">Event Date</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value ? new Date(field.value) : undefined}
                  onChange={(date) =>
                    field.onChange(date?.toISOString() || null)
                  }
                />
              </FormControl>
              <FormDescription>Select the date of the event</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="event_hour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Hour</FormLabel>
              <FormControl>
                <Input type="time" {...field} className="w-full" step="3600" />
              </FormControl>
              <FormDescription>Choose the hour for the event</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="duration_in_minutes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>In minutes</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea className="resize-none h-32" {...field} />
              </FormControl>
              <FormDescription>
                Optional description of the event
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {!event && (
          <div className="mt-4">
            <div className="flex justify-between items-center">
              <FormLabel>Collaborators</FormLabel>
              <CollaboratorSearch
                existingCollaborators={collaborators}
                getCollaborators={addCollaborator}
                trigger={
                  <Button type="button" className="text-sm">
                    Add Collaborators
                  </Button>
                }
              />
            </div>
            <div className="mt-4">
              {collaborators.length > 0 ? (
                collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex justify-between items-center"
                  >
                    <span>{collaborator.email}</span>
                    <Button
                      variant="secondary"
                      onClick={() => removeCollaborator(collaborator)}
                    >
                      Remove
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  No collaborators added yet.
                </p>
              )}
            </div>
          </div>
        )}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Active</FormLabel>
              </div>
              <FormDescription>
                Inactive events can be activated later
              </FormDescription>
            </FormItem>
          )}
        />
        <div className="flex gap-2 justify-end">
          {event && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructiveGhost"
                  disabled={isDeletePending || form.formState.isSubmitting}
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This wil permanently delete
                    this event!
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    disabled={isDeletePending || form.formState.isSubmitting}
                    onClick={() => {
                      startDeleteTransition(async () => {
                        deleteEventHandler(event.id);
                      });
                    }}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <Button
            disabled={isDeletePending || form.formState.isSubmitting}
            type="submit"
          >
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventForm;
