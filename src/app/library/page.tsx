import { auth } from "@/lib/auth";
import { Suspense } from "react";
import AlbumsPage from "./_components/AlbumPage";
import TracksPage from "./_components/TracksPage";

export default async function Page() {
  // Server-side authentication check
  const session = await auth();
  const isAdmin = session && (session.user as any)?.type === "admin";
  const isUser = session && (session.user as any)?.type === "user";
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TracksPage isAdmin={isAdmin} isUser={isUser} />
      {/* <AlbumsPage isAdmin={isAdmin} isUser={isUser} /> */}
    </Suspense>
  );
}
