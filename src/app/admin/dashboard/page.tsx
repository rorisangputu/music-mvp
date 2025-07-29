import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";

export default async function AdminDashboard() {
  const session = await auth();

  // Check if user is authenticated and is admin
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
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Admin Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Welcome to your admin dashboard. You are successfully signed in!
              </p>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Your Details
                </h3>
                <div className="space-y-2 text-left">
                  <p>
                    <strong>Name:</strong> {session.user?.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {session.user?.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {(session.user as any)?.role}
                  </p>
                  <p>
                    <strong>Type:</strong> {(session.user as any)?.type}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
