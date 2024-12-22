import { getOAuthClient } from "@/lib/google-calendar/queries";
import Image from "next/image";
import background from "../../../public/homepage-background.webp";

function HomePage() {
  getOAuthClient();
  return (
    <main className="mt-24">
      <Image
        src={background}
        fill
        placeholder="blur"
        quality={80}
        className="object-cover object-top bg-black opacity-50 "
        alt="Two green pencils on a grey background"
      />

      <div className="relative z-10 text-left">
        <h1 className="mb-10 font-normal tracking-tight text-8xl text-white">
          Welcome to Skillsync.
        </h1>
        <div className="py-3 text-xl font-medium">
          <span className="text-white">Your Hub for </span>
          <span className="text-primary">Better Learning and Time Mastery</span>
        </div>
      </div>
    </main>
  );
}

export default HomePage;
