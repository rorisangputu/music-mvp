// app/profile/page.tsx
import UserProfileComponent from "@/components/Profile/UserProfileComponent";
import { auth } from "@/lib/auth"; // server-side function
import { getUserByEmail } from "@/lib/user";
// your extracted component
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/signin");
  }

  const user = await getUserByEmail(session.user.email);

  if (!user) {
    redirect("/signin");
  }

  return <UserProfileComponent user={user} />;
}
