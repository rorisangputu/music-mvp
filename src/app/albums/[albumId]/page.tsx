// app/album/[albumId]/page.tsx
import AlbumPageClient from "@/components/AlbumPage/AlbumPageClient";
import { auth } from "@/lib/auth";

export default async function AlbumPage() {
  // Server-side authentication check
  const session = await auth();
  const isAdmin = session && (session.user as any)?.type === "admin";

  return <AlbumPageClient isAdmin={isAdmin} />;
}
