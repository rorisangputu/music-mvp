// app/admin/dashboard/page.tsx
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LibraryOverview from "../_components/LibraryOverview";
import AlbumsList from "../_components/AlbumsList";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session || (session.user as any)?.type !== "admin") {
    redirect("/admin/signin");
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/admin/signin" });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {session.user?.name}
              </span>
              {/* <form action={handleSignOut}>
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                >
                  Sign Out
                </button>
              </form> */}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Quick Actions Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Add Album Card */}
              <Link href="/admin/albums/create">
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-blue-300 hover:border-blue-500">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                    <svg
                      className="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Add Album
                  </h3>
                  <p className="text-sm text-gray-500">
                    Upload a new album with multiple tracks
                  </p>
                </div>
              </Link>

              {/* Add Single Track Card */}
              <Link href="/admin/tracks/create">
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-green-300 hover:border-green-500">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Add Single Track
                  </h3>
                  <p className="text-sm text-gray-500">
                    Upload individual track
                  </p>
                </div>
              </Link>

              {/* Manage Library Card */}
              <Link href="/admin/library">
                <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed border-purple-300 hover:border-purple-500">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                    <svg
                      className="w-6 h-6 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Manage Library
                  </h3>
                  <p className="text-sm text-gray-500">
                    View and edit existing albums & tracks
                  </p>
                </div>
              </Link>
            </div>
          </div>

          {/* Library Overview Stats */}
          <div className="mb-8">
            <LibraryOverview />
          </div>

          {/* Albums List Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Recent Albums
              </h2>
              <Link
                href="/admin/library"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <AlbumsList />
          </div>
        </div>
      </main>
    </div>
  );
}
