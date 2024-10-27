"use client";

import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { User } from "@/lib/supabase/supabase.types";
import { useEffect, useRef, useState } from "react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

interface User {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

interface CollaboratorSearchProps {
  existingCollaborators: User[] | [];
  getCollaborators: (collaborator: User) => void;
  trigger: React.ReactNode;
}

const CollaboratorSearch: React.FC<CollaboratorSearchProps> = ({
  existingCollaborators,
  getCollaborators,
  trigger,
}) => {
  const { user } = useSupabaseUser();
  const [searchResults, setSearchResults] = useState<Partial<User>[]>([
    { email: "something@gmail.com", id: "23233" },
  ]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const onChangeHandler = () => {};

  const addCollaborator = () => {};

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Search Collaborator</SheetTitle>
        </SheetHeader>
        <Input placeholder="Search..." onChange={onChangeHandler} />
        <ScrollArea className="mt-6 overflow-y-scroll w-full rounded-md">
          {searchResults
            .filter(
              (result) =>
                !existingCollaborators.some(
                  (existing) => existing.id === result.id
                )
            )
            .filter((result) => result.id !== user?.id)
            .map((user) => (
              <div
                key={user.id}
                className=" p-4 flex justify-between items-center"
              >
                <div className="flex gap-4 items-center">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src="/avatars/7.png" />
                    <AvatarFallback>CP</AvatarFallback>
                  </Avatar>
                  <div
                    className="text-sm 
                    gap-2 
                    overflow-hidden 
                    overflow-ellipsis 
                    w-[180px] 
                    text-muted-foreground
                    "
                  >
                    {user.email}
                  </div>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => addCollaborator(user)}
                >
                  Add
                </Button>
              </div>
            ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default CollaboratorSearch;
