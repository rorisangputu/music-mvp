import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

import Link from "next/link";
import AlbumUpload from "../../_components/AlbumUploads";

export default async function CreateAlbum() {
  const session = await auth();

  if (!session || (session.user as any)?.type !== "admin") {
    redirect("/admin/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">
                Create New Album
              </h1>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                {session.user?.name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <AlbumUpload />
        </div>
      </main>
    </div>
  );
}
