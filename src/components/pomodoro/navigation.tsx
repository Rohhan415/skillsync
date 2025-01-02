import { Settings } from "lucide-react";
import React from "react";

interface NavigationProps {
  setOpenSetting: React.Dispatch<React.SetStateAction<boolean>>;
}

function Navigation({ setOpenSetting }: NavigationProps) {
  return (
    <nav className="text-white mx-auto">
      <div className="flex items-center gap-1 cursor-pointer"></div>
      <Settings
        className="text-2xl cursor-pointer "
        onClick={() => setOpenSetting((value: boolean) => !value)}
      />
    </nav>
  );
}
export default React.memo(Navigation);
