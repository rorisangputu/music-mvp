import { auth, signOut } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import MobileMenu from "../components/Nav/MobileMenu";
import logo from '../../public/cmmg-logo.png'

type NavUser = {
  name: String;
  email: String;
  id: String;
  type: String;
}

export default async function Nav() {
  const session = await auth();
  const user = session?.user as NavUser | undefined;
  console.log(user);

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="w-[90%] xl:w-[80%] mx-auto mt-7 text-white">
      <div className="flex items-center justify-between">
        <div>
          <Image
            src={logo}
            alt="cmmg-logo"
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
                <Link href="/library">Library</Link>
              </li>
              <li>
                <Link href="/licensing">Licensing</Link>
              </li>
            </ul>

            <div className=" md:flex items-center space-x-2">
              {!user ? (
                <div className="space-x-5">
                  <Link href="/signup" className="cursor-pointer hover:underline">
                    Sign Up
                  </Link>
                  <Link
                    href="/signin"
                    className="bg-orange-600 hover:bg-orange-500 text-md text-black px-3 py-2 font-semibold"
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
                    <Link href="/profile">Profile</Link>
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

          {/* Replace the existing mobile menu button with the MobileMenu component */}
          <MobileMenu 
            user={user} 
            onSignOut={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }} 
          />
        </div>
      </div>
    </div>
  );
}