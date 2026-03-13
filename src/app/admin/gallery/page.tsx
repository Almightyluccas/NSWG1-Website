import { GalleryManagementClient } from "./gallery-management-client";

export default function GalleryManagementPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gallery Management</h1>
          <p className="text-gray-500 dark:text-zinc-400">
            Manage gallery images and videos.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 shadow-sm">
        <GalleryManagementClient />
      </div>
    </div>
  );
}
