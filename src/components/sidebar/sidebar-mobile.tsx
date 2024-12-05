"use client";

import { Menu } from "lucide-react";
import PageIcon from "../icons/Pages-Icon";
import { useState } from "react";
import clsx from "clsx";

interface MobileSidebarProps {
  children: React.ReactNode;
}

export const nativeNavigation = [
  { title: "Sidebar", id: "sidebar", custom_Icon: Menu },
  { title: "Pages", id: "pages", custom_Icon: PageIcon },
] as const;

const MobileSidebar: React.FC<MobileSidebarProps> = ({ children }) => {
  const [selectedNav, setSelectedNav] = useState("");
  return (
    <>
      {selectedNav === "sidebar" && <>{children}</>}
      <nav
        className="bg-black/10
        sm:hidden
    backdrop-blur-lg
    fixed 
    z-50 
    bottom-0 
    right-0 
    left-0
    "
      >
        <ul
          className="flex 
      justify-between 
      items-center 
      p-4"
        >
          {nativeNavigation.map((item) => (
            <li
              className="flex
            items-center
            flex-col
            justify-center
          "
              key={item.id}
              onClick={() => {
                setSelectedNav(item.id);
              }}
            >
              <item.custom_Icon></item.custom_Icon>
              <small
                className={clsx("", {
                  "text-muted-foreground": selectedNav !== item.id,
                })}
              >
                {item.title}
              </small>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default MobileSidebar;
