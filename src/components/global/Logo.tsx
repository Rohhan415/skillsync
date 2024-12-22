import Link from "next/link";
import Image from "next/image";
import LogoImage from "../../../public/logo.png";

function Logo() {
  return (
    <Link href={"/"} className="z-10 flex items-center gap-4 text-xl">
      <Image src={LogoImage} alt="SkillSync Logo" width={40} height={40} />
      <span>SkillSync.</span>
    </Link>
  );
}

export default Logo;
