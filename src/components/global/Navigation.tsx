import Link from "next/link";

import { Button } from "../ui/button";

export default async function Navigation() {
  //   const session = await auth();

  return (
    <aside className="flex w-full gap-10 z-10 justify-end">
      <Link href={"/login"}>
        <Button variant="homepage">Login</Button>
      </Link>
      <Link href={"/signup"}>
        <Button variant="homepage">Sign up</Button>
      </Link>
    </aside>
  );
}
