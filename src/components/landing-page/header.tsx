import React from "react";
import Logo from "../global/Logo";
import Navigation from "../global/Navigation";

function Header() {
  return (
    <header className="border-b border-primary-900 pl-8 py-5">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Logo />
        <Navigation />
      </div>
    </header>
  );
}

export default Header;
