"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import Logo from "../../../../public/logo.png";
import Loader from "@/components/global/Loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MailCheck } from "lucide-react";
import { FormSchema } from "@/lib/types";
import { actionSignUpUser } from "@/lib/serverActions/auth-actions";
import background from "../../../../public/homepage-background.webp";

const SignUpFormSchema = z
  .object({
    email: z.string().describe("Email").email({ message: "Invalid email" }),
    password: z
      .string()
      .min(8, "Password must be minimum 8 characters")
      .max(100, "Password can't be more than 100 characters")
      .describe("Password"),
    confirmPassword: z
      .string()
      .min(8, "Password must be minimum 8 characters")
      .max(100, "Password can't be more than 100 characters")
      .describe("Confirm Password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function Signup() {
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState("");
  const [confirmation, setConfirmation] = useState(false);

  const ExchangeError = useMemo(() => {
    if (!searchParams) return "";
    return searchParams.get("error_description");
  }, [searchParams]);

  const confirmationAndErrorStyles = useMemo(
    () =>
      clsx("bg-primary", {
        "bg-red-500/10": ExchangeError,
        "border-red-500/50": ExchangeError,
        "text-red-700": ExchangeError,
      }),
    [ExchangeError]
  );

  const form = useForm<z.infer<typeof SignUpFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  const isLoading = form.formState.isSubmitting;
  const onSubmit = async ({ email, password }: z.infer<typeof FormSchema>) => {
    const result = await actionSignUpUser({ email, password });
    if (result && "error" in result) {
      setSubmitError(result.error.message);
      form.reset();
      return;
    }
    setConfirmation(true);
  };

  return (
    <>
      <div className="relative w-full h-full">
        <Image
          src={background}
          fill
          placeholder="blur"
          quality={80}
          className="object-cover object-top bg-black opacity-50 "
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
              <Link
                href="/"
                className="w-full flex justify-center items-center "
              >
                <Image src={Logo} alt="logo" width={50} height={50} priority />
                <span className="font-semibold dark:text-white text-4xl first-letter:ml-2 ">
                  SkillSync.
                </span>
              </Link>
              <FormDescription className=" flex justify-center text-foreground/60">
                All-in-One Collaboration and Productivity
              </FormDescription>
              {!confirmation && !ExchangeError && (
                <>
                  <FormField
                    disabled={isLoading}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    disabled={isLoading}
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    disabled={isLoading}
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Confirm Password"
                            className="border border-gray-300 rounded-md"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full p-6"
                    disabled={isLoading}
                  >
                    {!isLoading ? "Create Account" : <Loader />}
                  </Button>
                </>
              )}

              {submitError && <FormMessage>{submitError}</FormMessage>}
              <span className=" self-center">
                Already have an account?{" "}
                <Link href="/login" className="text-primary">
                  Login
                </Link>
              </span>
              {(confirmation || ExchangeError) && (
                <>
                  <Alert className={confirmationAndErrorStyles}>
                    {!ExchangeError && <MailCheck className="h-4 w-4" />}
                    <AlertTitle>
                      {ExchangeError
                        ? "Invalid Link"
                        : "Registered Successfully!"}
                    </AlertTitle>
                    <AlertDescription>
                      {ExchangeError || "Please go to the login page to enter."}
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </form>
          </Form>
        </div>
      </div>
    </>
  );
}

export default Signup;
