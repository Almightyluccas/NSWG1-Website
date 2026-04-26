"use client";

type UserOption = {
  id: string;
  name: string;
  primaryRole?: string;
};

export function AllowedPersonnelPicker({
  roleOptions,
  userOptions,
  selectedRoles,
  selectedUserIds,
  onToggleRole,
  onToggleUser,
}: {
  roleOptions: string[];
  userOptions: UserOption[];
  selectedRoles: string[];
  selectedUserIds: string[];
  onToggleRole: (role: string) => void;
  onToggleUser: (userId: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold">
          Allowed Roles
        </p>
        <div className="flex flex-wrap gap-2">
          {roleOptions.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => onToggleRole(role)}
              className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded border ${
                selectedRoles.includes(role)
                  ? "border-accent bg-accent/20 text-zinc-100"
                  : "border-zinc-700 text-zinc-400"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold">
          Allowed Users
        </p>
        <div className="max-h-48 overflow-y-auto border border-zinc-800 rounded-sm p-2 space-y-1">
          {userOptions.map((user) => (
            <label
              key={user.id}
              className="flex items-center gap-2 text-xs text-zinc-300"
            >
              <input
                type="checkbox"
                checked={selectedUserIds.includes(user.id)}
                onChange={() => onToggleUser(user.id)}
              />
              <span>{user.name}</span>
              {user.primaryRole && (
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  ({user.primaryRole})
                </span>
              )}
            </label>
          ))}
          {userOptions.length === 0 && (
            <p className="text-[11px] text-zinc-500">No users available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
