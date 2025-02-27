import { CalendarRange } from "lucide-react";
import { ReactNode } from "react";
import { NavLink } from "../ui/navLink";

const Calendar = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <header className="flex py-2 border-b bg-card w-full ">
        <nav className="font-medium flex items-center text-sm gap-6 container">
          <div className="flex items-center gap-3 font-semibold mr-auto">
            <CalendarRange className="size-6" />
            <span className="sr-only md:not-sr-only">SkillSync</span>
          </div>
          <NavLink href="/dashboard/events">Events</NavLink>
          <NavLink href="/dashboard/schedule">Schedule</NavLink>
          <div className="ml-auto size-10"></div>
        </nav>
      </header>
      <main className="container my-6">{children}</main>
    </>
  );
};

export default Calendar;
