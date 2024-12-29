"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormSchema } from "@/lib/types";
import Link from "next/link";
import Logo from "../../../../public/logo.png";
import Image from "next/image";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loader from "@/components/global/Loader";
import { actionLoginUser } from "@/lib/serverActions/auth-actions";
import background from "../../../../public/homepage-background.webp";
import { getPrivateWorkspaces } from "@/lib/supabase/queries";

function LoginPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: { email: "", password: "" },
  });

  const isLoading = form.formState.isSubmitting;
  const onSubmit: SubmitHandler<z.infer<typeof FormSchema>> = async (data) => {
    const result = await actionLoginUser(data);

    console.log(result, "errssor");

    if (result) {
      const workspaces = result.response
        ? await getPrivateWorkspaces(result.response.data.user.id)
        : [];

      const isWorkspace: boolean = workspaces.length > 0;

      if (result.error) {
        form.reset();
        setSubmitError(result.error);
      }

      if (isWorkspace) {
        router.push(`/dashboard/${workspaces[0].id}`);
      } else {
        router.push("/dashboard/start");
      }
    }
  };
  return (
    <div className="relative w-full h-full">
      <Image
        src={background}
        fill
        placeholder="blur"
        quality={80}
        className="object-cover object-top bg-black opacity-50"
        alt="Two green pencils on a grey background"
      />
      <div className="absolute inset-0 flex justify-center items-center z-20">
        <Form {...form}>
          <form
            onChange={() => {
              if (submitError) setSubmitError("");
            }}
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full sm:justify-center sm:w-[400px] space-y-6 flex flex-col bg-black/50 p-6 rounded-lg shadow-lg"
          >
            <Link href="/" className="w-full flex justify-center items-center">
              <Image src={Logo} alt="logo" width={50} height={50} />
              <span className="font-semibold dark:text-white text-4xl first-letter:ml-2">
                SkillSync.
              </span>
            </Link>
            <FormDescription className=" justify-center  flex text-foreground/60 ">
              All-in-One Collaboration and Productivity
            </FormDescription>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email"
                      className="border border-gray-300 rounded-md"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password"
                      className="border border-gray-300 rounded-md"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {submitError && <FormMessage>{submitError}</FormMessage>}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full p-6"
              size="lg"
            >
              {!isLoading ? "Login" : <Loader />}
            </Button>
            <span className="self-center">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-primary">
                Sign Up
              </Link>
            </span>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default LoginPage;
