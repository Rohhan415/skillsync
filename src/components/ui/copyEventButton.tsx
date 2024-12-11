"use client";

import { useState } from "react";
import { Button, ButtonProps } from "./button";
import { Copy, CopyCheck, CopyX } from "lucide-react";

type CopyState = "idle" | "error" | "copied";

function getCopyIcon(copyState: CopyState) {
  switch (copyState) {
    case "idle":
      return Copy;
    case "error":
      return CopyCheck;
    case "copied":
      return CopyX;
  }
}

function getChildren(copyState: CopyState) {
  switch (copyState) {
    case "idle":
      return "Copy Event";
    case "error":
      return "Error";
    case "copied":
      return "Copied!";
  }
}

const CopyEventButton = ({
  eventId,
  userId,
  ...buttonProps
}: Omit<ButtonProps, "children | onClick"> & {
  eventId: string;
  userId: string;
}) => {
  const [copyState, setCopyState] = useState<CopyState>("idle");

  const CopyIcon = getCopyIcon(copyState);

  return (
    <Button
      {...buttonProps}
      onClick={() => {
        navigator.clipboard
          .writeText(`${location.origin}/dashboard/book/${userId}/${eventId}`)
          .then(() => {
            setCopyState("copied");
            setTimeout(() => {
              setCopyState("idle");
            }, 2000);
          })
          .catch(() => {
            setCopyState("error");
            setTimeout(() => {
              setCopyState("idle");
            }, 2000);
          });
      }}
    >
      <CopyIcon className="mr-2 size-4" />
      {getChildren(copyState)}
    </Button>
  );
};

export default CopyEventButton;
