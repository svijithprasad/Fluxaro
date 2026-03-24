import { User } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

import { ModeToggle } from "@/components/global/mode-toggle";
import { DoorOpen } from "lucide-react";


type Props = {
  user?: null | User;
};
const Navigation = ({ user }: Props) => {



  return (
    <div
      className={
        "top-0 right-0 left-0 z-10 p-4 flex items-center justify-between relative"
      }
    >
      <aside>
        <Link href={"/"} className="flex items-center gap-2">
          <Image
            src={"./assets/plura-logo.svg"}
            alt={"Site LOGO"}
            width={40}
            height={40}
          />
          <span className={"text-xl font-bold"}>Fluxaro.</span>
        </Link>
      </aside>
      <nav
        className={
          "hidden md:block absolute left-[50%] transform translate-x-[-50%] translate-y-[50%]"
        }
      >
        <ul className={"flex items-center justify-center gap-8 text-muted-foreground"}>
          <Link href={"#features"} className="hover:text-primary transition-colors">Features</Link>
          <Link href={"#pricing"} className="hover:text-primary transition-colors">Pricing</Link>
          <Link href={"#"} className="hover:text-primary transition-colors">About</Link>
          <Link href={"#"} className="hover:text-primary transition-colors">Documentation</Link>
        </ul>
      </nav>
      <aside className={"flex gap-2 items-center"}>
        
        {user ? (
          <Link className={
              "flex items-center gap-2 bg-primary text-white p-2 px-4 rounded-md hover:bg-primary/80" +
              " transition-colors duration-300"
            } href={"/agency"}>
            <DoorOpen size={20} /> Dashboard
          </Link>
        ) : (
          <Link
            href={"/sign-in"}
            className={
              "bg-primary text-white p-2 px-4 rounded-md hover:bg-primary/80" +
              " transition-colors duration-300"
            }
          >
            Login
          </Link>
        )}
        <UserButton />
        <ModeToggle />
      </aside>
    </div>
  );
};

export default Navigation;
