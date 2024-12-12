import { getOAuthClient } from "@/lib/google-calendar/queries";

function HomePage() {
  getOAuthClient();
  return <div></div>;
}

export default HomePage;
