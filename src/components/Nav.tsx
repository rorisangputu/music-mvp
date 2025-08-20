// app/_components/Nav.tsx
import { auth, signOut } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";

type NavUser = {
  name: String;
  email: String;
  id: String;
  type: String;
}

export default async function Nav() {
  const session = await auth();
  const user = session?.user as NavUser | undefined;
  //console.log(user);

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="w-[90%] xl:w-[80%] mx-auto mt-7 text-white">
      <div className="flex items-center justify-between">
        <div>
          <Image
            src="https://cmmg.co.za/wp-content/uploads/2025/03/music-content-1-300x169.png"
            alt="cmmg"
            width={120}
            height={120}
          />
        </div>

        <div className="flex w-[60%]">
          <div className="w-full flex items-center justify-between">
            <ul className="hidden md:flex space-x-4 text-md">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/albums">Library</Link>
              </li>
              <li>
                <Link href="/licensing">Licensing</Link>
              </li>

            </ul>

            <div className=" md:flex items-center space-x-2">
              {!user ? (
                <div className="space-x-5">
                  <Link href="/signup">
                    Sign Up
                  </Link>
                  <Link
                    href="/signin"
                    className="bg-[#ec7027] text-md text-black px-3 py-2 font-semibold"
                  >
                    Sign In
                  </Link>
                </div>
              ) : (
                <div className="flex flex-row items-center space-x-5 ">
                  {user?.type === "admin" && (
                    <Link href="/admin/dashboard">Dashboard</Link>
                  )}
                  {user?.type === "user" && (
                    <li>
                      <Link href="/profile">Profile</Link>
                    </li>
                  )}
                  <form action={handleSignOut}>
                    <Button
                      type="submit"
                      className="bg-red-600 text-white text-sm hover:bg-red-700"
                    >
                      Sign Out
                    </Button>
                  </form>
                </div>

              )}
            </div>
          </div>

          <div className="flex md:hidden">
            <Menu size={33} />
          </div>
        </div>
      </div>
    </div>
  );
}
