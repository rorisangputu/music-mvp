// app/admin/dashboard/page.tsx
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LibraryOverview from "../_components/LibraryOverview";
import AlbumsList from "../_components/AlbumsList";
import QuickActionCards from "../_components/QuickActionCards";
import BulkIsrcUpdater from "../_components/BulkIsrcUpdate";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session || (session.user as any)?.type !== "admin") {
    redirect("/admin/signin");
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
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div>
            <h1 className="font-bold text-3xl py-5">Admin Dashboard</h1>
          </div>
          {/* Library Overview Stats */}
          <div className="mb-8">
            <LibraryOverview />
          </div>
          {/* Quick Actions Section */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Add Album Card */}
              <QuickActionCards
                link="/admin/albums/create"
                title="Add Album"
                description="Upload a new album with multiple tracks"
                theme="blue"
                icon="plus"
              />

              <QuickActionCards
                link="/admin/tracks/create"
                title="Add Single Track"
                description="Upload individual track"
                theme="green"
                icon="music"
              />

              <QuickActionCards
                link="/admin/dashboard/manage-library"
                title="Manage Library"
                description="View and edit existing albums & tracks"
                theme="purple"
                icon="library"
              />

              {/* Additional cards you might want */}
              <QuickActionCards
                link="/admin/dashboard/settings"
                title="Settings"
                description="Configure application settings"
                theme="indigo"
                icon="settings"
              />

              <QuickActionCards
                link="/admin/dashboard/analytics"
                title="Analytics"
                description="View usage statistics and reports"
                theme="yellow"
                icon="folder"
              />

              <QuickActionCards
                link="/admin/dashboard/users"
                title="User Management"
                description="Manage user accounts and permissions"
                theme="red"
                icon="edit"
              />
            </div>
          </div>


          
        </div>
      </main>
    </div>
  );
}
