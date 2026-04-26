"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTheme } from "@/components/theme/theme-provider";
import { Camera, Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionUser } from "@/types/next-auth";
import { CustomTheme } from "@/types/database";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { FileUploadDialog } from "@/components/ui/image-upload-dialog";
import { fileUpload } from "@/lib/Object-Storage/objectStorageActions";
import { UploadType } from "@/types/objectStorage";
import { FadeIn } from "@/components/ui/fade-in";
import { Switch } from "@/components/ui/switch";

interface SettingsClientProps {
  user: SessionUser;
}

export function SettingsClient({ user }: SettingsClientProps) {
  const {
    themes: originalThemes,
    currentAccent,
    setCurrentAccent,
    addCustomTheme,
    mode,
    setMode,
    canUseLightMode,
    themeUserCustomizationEnabled,
  } = useTheme();
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(user.name || "");
  const [pendingAccent, setPendingAccent] =
    useState<CustomTheme>(currentAccent);
  const [componentThemes, setComponentThemes] =
    useState<CustomTheme[]>(originalThemes);
  const [pendingMode, setPendingMode] = useState<"dark" | "light">(
    mode === "light" ? "light" : "dark"
  );

  const [isAddingTheme, setIsAddingTheme] = useState(false);
  const [newThemeName, setNewThemeName] = useState("");
  const [newThemeColor, setNewThemeColor] = useState("#DFC069");
  const [isProfilePictureUploadOpen, setIsProfilePictureUploadOpen] =
    useState(false);

  useEffect(() => {
    setPendingAccent(currentAccent);
    setComponentThemes(originalThemes);
    setDisplayName(user.name || "");
    setPendingMode(mode === "light" ? "light" : "dark");
  }, [currentAccent, originalThemes, user, mode]);

  const hasChanges = useMemo(
    () =>
      displayName !== (session?.user.name ?? user.name ?? "") ||
      (themeUserCustomizationEnabled &&
        pendingAccent.name !== currentAccent.name) ||
      (themeUserCustomizationEnabled &&
        canUseLightMode &&
        pendingMode !== (mode === "light" ? "light" : "dark")),
    [
      displayName,
      session?.user.name,
      user.name,
      themeUserCustomizationEnabled,
      pendingAccent.name,
      currentAccent.name,
      pendingMode,
      canUseLightMode,
      mode,
    ]
  );

  const handleImageUpload = async (
    formData: FormData,
    uploadType: UploadType
  ) => {
    await fileUpload({ formData, uploadType, router, updateSession });
  };

  const handleAccentChange = (theme: CustomTheme) => {
    setPendingAccent(theme);
  };

  const handleAddTheme = () => {
    const r = parseInt(newThemeColor.slice(1, 3), 16);
    const g = parseInt(newThemeColor.slice(3, 5), 16);
    const b = parseInt(newThemeColor.slice(5, 7), 16);
    const darkerR = Math.floor(r * 0.8);
    const darkerG = Math.floor(g * 0.8);
    const darkerB = Math.floor(b * 0.8);

    const newTheme: CustomTheme = {
      name: newThemeName,
      accent: `${r}, ${g}, ${b}`,
      accentDarker: `${darkerR}, ${darkerG}, ${darkerB}`,
    };

    setComponentThemes((prev) => [...prev, newTheme]);
    setPendingAccent(newTheme);
    setIsAddingTheme(false);
    setNewThemeName("");
    setNewThemeColor("#DFC069");
  };

  const handleSave = async () => {
    const updatedFields = [];

    if (themeUserCustomizationEnabled) {
      if (
        canUseLightMode &&
        pendingMode !== (mode === "light" ? "light" : "dark")
      ) {
        await setMode(pendingMode);
        updatedFields.push("Appearance");
      }
      setCurrentAccent(pendingAccent);
      const isNewCustomTheme = !originalThemes.some(
        (t) => t.name === pendingAccent.name
      );
      if (isNewCustomTheme) {
        addCustomTheme(pendingAccent);
        updatedFields.push("Theme");
      }
    }

    if (displayName !== session?.user.name) {
      try {
        await updateSession({ name: displayName });
        updatedFields.push("Name");
      } catch (e) {
        toast.error("Failed to update name");
      }
    }

    if (updatedFields.length === 1) {
      toast.success(`Successfully updated ${updatedFields[0]}`);
    } else if (updatedFields.length > 1) {
      toast.success("All settings updated successfully");
    }
    router.refresh();
  };

  const handleCancel = () => {
    setDisplayName(user.name || "");
    setPendingAccent(currentAccent);
    setComponentThemes(originalThemes);
    setPendingMode(mode === "light" ? "light" : "dark");
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <section className="relative overflow-hidden rounded-md border border-zinc-700/60 bg-zinc-950/80 backdrop-blur-md shadow-[0_0_35px_rgba(var(--accent-color),0.08)] [clip-path:polygon(0_0,calc(100%-16px)_0,100%_16px,100%_100%,16px_100%,0_calc(100%-16px))]">
          <div className="border-b border-zinc-700/60 bg-zinc-900/80 px-5 py-3">
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
              Profile
            </p>
          </div>
          <div className="space-y-6 p-5 md:p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="relative w-fit">
                <Avatar className="h-32 w-32 border-2 border-accent">
                  <AvatarImage
                    src={session?.user.image || "/placeholder.svg"}
                    alt={displayName}
                  />
                  <AvatarFallback className="text-2xl font-mono uppercase tracking-widest">
                    {(displayName || "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => setIsProfilePictureUploadOpen(true)}
                  className="absolute -bottom-1 -right-1 rounded-full bg-accent p-2 text-black transition-colors hover:bg-accent-darker"
                  aria-label="Upload profile picture"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="font-mono text-xs uppercase tracking-widest text-zinc-400"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={user.email || ""}
                    disabled
                    className="border-zinc-700/60 bg-zinc-900/70 text-zinc-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="displayName"
                    className="font-mono text-xs uppercase tracking-widest text-zinc-400"
                  >
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="border-zinc-700/60 bg-zinc-900/70 text-zinc-100"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={80}>
        <section className="relative overflow-hidden rounded-md border border-zinc-700/60 bg-zinc-950/80 backdrop-blur-md shadow-[0_0_35px_rgba(var(--accent-color),0.08)] [clip-path:polygon(0_0,calc(100%-16px)_0,100%_16px,100%_100%,16px_100%,0_calc(100%-16px))]">
          <div className="border-b border-zinc-700/60 bg-zinc-900/80 px-5 py-3">
            <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">
              Appearance
            </p>
          </div>
          <div className="space-y-4 p-5 md:p-6">
            <div className="flex items-center justify-between rounded-md border border-zinc-700/60 bg-zinc-900/60 px-4 py-3">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-zinc-300">
                  Light Mode
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Dark mode is the default.
                </p>
              </div>
              <Switch
                checked={pendingMode === "light"}
                onCheckedChange={(checked) =>
                  setPendingMode(checked ? "light" : "dark")
                }
                disabled={!themeUserCustomizationEnabled || !canUseLightMode}
                aria-label="Toggle light mode"
              />
            </div>

            {themeUserCustomizationEnabled ? (
              <>
                <Label className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                  Theme Accent
                </Label>
                <div className="flex flex-wrap gap-3">
                  {componentThemes.map((theme) => (
                    <button
                      key={theme.name}
                      onClick={() => handleAccentChange(theme)}
                      className={cn(
                        "relative h-12 w-12 rounded-full border-2 transition-transform hover:scale-105",
                        pendingAccent.name === theme.name
                          ? "border-zinc-100 shadow-[0_0_20px_rgba(var(--accent-color),0.5)]"
                          : "border-zinc-700/80"
                      )}
                      style={{ backgroundColor: `rgb(${theme.accent})` }}
                      title={theme.name}
                    >
                      {pendingAccent.name === theme.name && (
                        <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
                      )}
                    </button>
                  ))}
                  <Dialog open={isAddingTheme} onOpenChange={setIsAddingTheme}>
                    <DialogTrigger asChild>
                      <button className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-zinc-700/80 transition-colors hover:border-accent">
                        <Plus className="h-5 w-5 text-zinc-400" />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create Custom Theme</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <Label htmlFor="theme-name">Theme Name</Label>
                          <Input
                            id="theme-name"
                            value={newThemeName}
                            onChange={(e) => setNewThemeName(e.target.value)}
                            placeholder="My Custom Theme"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="theme-color">Theme Color</Label>
                          <Input
                            id="theme-color"
                            type="color"
                            value={newThemeColor}
                            onChange={(e) => setNewThemeColor(e.target.value)}
                          />
                        </div>
                        <Button
                          onClick={handleAddTheme}
                          disabled={!newThemeName.trim() || !newThemeColor}
                          className="w-full"
                        >
                          Add Theme
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </>
            ) : (
              <div className="rounded-md border border-zinc-700/60 bg-zinc-900/60 px-4 py-3">
                <p className="text-sm text-zinc-300">
                  Accent color and mode are unit-controlled for your account.
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  Current accent:{" "}
                  <span className="text-accent">{currentAccent.name}</span>
                </p>
              </div>
            )}
          </div>
        </section>
      </FadeIn>

      {hasChanges && (
        <div className="sticky bottom-0 z-20 flex items-center justify-end gap-3 rounded-md border border-zinc-700/60 bg-zinc-950/85 p-4 backdrop-blur-md">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-accent text-black hover:bg-accent-darker"
          >
            Save Changes
          </Button>
        </div>
      )}

      {isProfilePictureUploadOpen && (
        <FileUploadDialog
          open={isProfilePictureUploadOpen}
          onOpenChange={() => setIsProfilePictureUploadOpen(false)}
          uploadType="profile"
          title="Upload Profile Picture"
          description="Choose a new profile picture"
          handleUpload={handleImageUpload}
          onUploadSuccess={() => {
            toast.success("Profile picture updated");
            router.refresh();
          }}
          onUploadError={(error: string) => {
            toast.error(`Upload failed: ${error}`);
          }}
        />
      )}
    </div>
  );
}
