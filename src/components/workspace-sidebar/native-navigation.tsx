import Link from "next/link";
import { twMerge } from "tailwind-merge";
import HomeIcon from "../icons/HomeIcon";
import SettingsIcon from "../icons/SettingsIcon";
import TrashIcon from "../icons/TrashIcon";
import Settings from "../settings/settings";
import Trash from "../trash/Trash";
import { Calendar1Icon, CalendarIcon } from "lucide-react";

interface NativeNavigationProps {
  myWorkspaceId: string;
  className?: string;
}

const NativeNavigation: React.FC<NativeNavigationProps> = ({
  myWorkspaceId,
  className,
}) => {
  return (
    <nav className={twMerge("my-2", className)}>
      {" "}
      <ul className="flex flex-col gap-2">
        <li>
          <Link
            className="group/native flex text-neutral-50 transition-all  gap-2"
            href={`/dashboard/${myWorkspaceId}`}
          >
            <HomeIcon />
            <span>My Workspace</span>
          </Link>
        </li>
        <Settings>
          <li className="group/native flex text-neutral-50/neutrals-7 transition-all  gap-2 cursor-pointer">
            <SettingsIcon />
            <span>Settings</span>
          </li>
        </Settings>
        <Trash>
          <li className="group/native flex text-neutral-50/neutrals-7 transition-all  gap-2">
            <TrashIcon />
            <span>Trash</span>
          </li>
        </Trash>
        <Link href="/dashboard/events">
          <li className="group/native flex text-neutral-50/neutrals-7 transition-all  gap-2">
            <CalendarIcon />
            <span>Events</span>
          </li>
        </Link>
        <Link href="/">
          <li className="group/native flex text-neutral-50/neutrals-7 transition-all  gap-2">
            <Calendar1Icon />
            <span>Schedule</span>
          </li>
        </Link>
      </ul>
    </nav>
  );
};

export default NativeNavigation;
