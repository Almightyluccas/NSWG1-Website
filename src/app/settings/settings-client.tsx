"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useTheme } from "@/components/theme/theme-provider"
import { Camera, Check, Plus, User, Palette, Settings } from 'lucide-react'
import Image from "next/image"
import { cn } from "@/lib/utils"
import { SessionUser } from "@/types/next-auth"
import {CustomHeroImages, CustomTheme} from "@/types/database"
import {useSession} from "next-auth/react";
import {toast} from "sonner";
import { useRouter } from "next/navigation"
import {FileUploadDialog} from "@/components/ui/image-upload-dialog";
import {imageUpload} from "@/lib/Object-Storage/imageActions";
import {UploadType} from "@/types/objectStorage";

interface SettingsClientProps {
  user: SessionUser,
  customHeroImages: CustomHeroImages[]
}

const predefinedBackgrounds = [
  { id: 1, url: "/images/heroBackgrounds/default.png" },
  { id: 2, url: "/images/heroBackgrounds/tacdevron-1.png" },
  { id: 3, url: "/images/heroBackgrounds/160th-1.png" },
  { id: 4, url: "/images/heroBackgrounds/160th-2.png" },
  { id: 5, url: "/images/heroBackgrounds/group-1.png" },
  { id: 6, url: "/images/heroBackgrounds/chill-1.png" }
]

const menuItems = [
  { id: "profile", name: "Profile Settings", icon: User, description: "Manage your personal information" },
  { id: "appearance", name: "Website Appearance", icon: Palette, description: "Customize theme and backgrounds" },
  { id: "preferences", name: "Preferences", icon: Settings, description: "General application settings" }
]

export function SettingsClient({ user, customHeroImages }: SettingsClientProps) {
  const { themes: originalThemes, currentAccent, setCurrentAccent, addCustomTheme } = useTheme()
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()

  const allBackgrounds = [...predefinedBackgrounds, ...customHeroImages];

  const [activeSection, setActiveSection] = useState("profile")
  const [displayName, setDisplayName] = useState(user.name || "")
  const [profileImage, setProfileImage] = useState(user.image || "")
  const [selectedBackground, setSelectedBackground] = useState(session?.user.preferences.homepageImageUrl || "Default")
  const [customBackground, setCustomBackground] = useState<string | null>(null)
  const [pendingAccent, setPendingAccent] = useState<CustomTheme>(currentAccent)
  const [componentThemes, setComponentThemes] = useState<CustomTheme[]>(originalThemes)
  const [hasChanges, setHasChanges] = useState(false)

  const [isAddingTheme, setIsAddingTheme] = useState(false)
  const [newThemeName, setNewThemeName] = useState("")
  const [newThemeColor, setNewThemeColor] = useState("#DFC069")
  const [isProfilePictureUploadOpen, setIsProfilePictureUploadOpen] = useState(false);
  const [isBackgroundPictureUploadOpen, setIsBackgroundPictureUploadOpen] = useState(false);

  useEffect(() => {
    setPendingAccent(currentAccent)
    setComponentThemes(originalThemes)
    setDisplayName(user.name || "")
    setProfileImage(user.image || "")
  }, [currentAccent, originalThemes, user])

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value)
    setHasChanges(true)
  }

  const handleImageUpload  = async (formData: FormData, uploadType: UploadType) => {
    await imageUpload({formData, uploadType, router, updateSession})
  }

  const handleAccentChange = (theme: CustomTheme) => {
    setPendingAccent(theme)
    setHasChanges(true)
  }

  const handleBackgroundSelect =  (homepageImageUrl: string) => {
    setSelectedBackground(homepageImageUrl)
    if (homepageImageUrl !== "custom") {
      setCustomBackground(null)
    }
    setHasChanges(true)
  }

  const handleAddTheme = () => {
    const r = parseInt(newThemeColor.slice(1, 3), 16)
    const g = parseInt(newThemeColor.slice(3, 5), 16)
    const b = parseInt(newThemeColor.slice(5, 7), 16)
    const darkerR = Math.floor(r * 0.8)
    const darkerG = Math.floor(g * 0.8)
    const darkerB = Math.floor(b * 0.8)

    const newTheme: CustomTheme = {
      name: newThemeName,
      accent: `${r}, ${g}, ${b}`,
      accentDarker: `${darkerR}, ${darkerG}, ${darkerB}`,
    }

    setComponentThemes(prev => [...prev, newTheme])
    setPendingAccent(newTheme)
    setIsAddingTheme(false)
    setNewThemeName("")
    setNewThemeColor("#DFC069")
    setHasChanges(true)
  }

  const handleSave = async () => {
    const updatedFields = [];

    setCurrentAccent(pendingAccent);
    const isNewCustomTheme = !originalThemes.some(t => t.name === pendingAccent.name);
    if (isNewCustomTheme) {
      addCustomTheme(pendingAccent);
      updatedFields.push("Theme");
    }

    if (selectedBackground !== session?.user.preferences.homepageImageUrl) {
      try {
        await updateSession({ preferences: { homepageImageUrl: selectedBackground } });
        updatedFields.push("Homepage Background");
      } catch (e) {
        toast.error("Failed to update homepage background");
      }
    }

    if (displayName !== session?.user.name) {
      //TODO: UPDATE PERSCOM
      try {
        await updateSession({ name: displayName });
        updatedFields.push("Name");
      } catch (e) {
        toast.error("Failed to update name");
      }
    }

    if (profileImage !== session?.user.image) {
      try {
        await updateSession({ image: profileImage });
        updatedFields.push("Profile Image");
      } catch (e) {
        toast.error("Failed to update profile image");
      }
    }

    if (updatedFields.length === 1) {
      toast.success(`Successfully updated ${updatedFields[0]}`);
    } else if (updatedFields.length > 1) {
      toast.success("All settings updated successfully");
    }
    setHasChanges(false);
    router.refresh();
  };

  const handleCancel = () => {
    setDisplayName(user.name || "")
    setProfileImage(user.image || "")
    setSelectedBackground(session?.user.preferences.homepageImageUrl || "Default")
    setCustomBackground(null)
    setPendingAccent(currentAccent)
    setComponentThemes(originalThemes)
    setHasChanges(false)
  }

  const renderProfileSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>
          Manage your personal information and profile picture
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={session?.user.image || "/placeholder.svg"} alt={displayName} />
              <AvatarFallback className="text-lg">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => setIsProfilePictureUploadOpen(true)}
              className="absolute -bottom-1 -right-1 bg-accent hover:bg-accent-darker text-black rounded-full p-2 shadow-lg transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Profile Picture</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Click the camera icon to change your profile picture
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={user.email || ""}
            disabled
            className="bg-gray-50 dark:bg-zinc-800"
          />
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Email address cannot be changed
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => handleDisplayNameChange(e.target.value)}
            placeholder="Enter your display name"
          />
        </div>
      </CardContent>
    </Card>
  )

  const renderAppearanceSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Website Appearance</CardTitle>
        <CardDescription>
          Customize the look and feel of your website experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Theme Accent Color</Label>
          <div className="flex flex-wrap gap-3">
            {componentThemes.map((theme) => (
              <button
                key={theme.name}
                onClick={() => handleAccentChange(theme)}
                className={`relative w-12 h-12 rounded-full border-2 transition-all hover:scale-110 ${
                  pendingAccent.name === theme.name
                    ? "border-gray-900 dark:border-white shadow-lg"
                    : "border-gray-300 dark:border-zinc-600"
                }`}
                style={{ backgroundColor: `rgb(${theme.accent})` }}
                title={theme.name}
              >
                {pendingAccent.name === theme.name && (
                  <Check className="absolute inset-0 m-auto h-6 w-6 text-white drop-shadow-lg" />
                )}
              </button>
            ))}

            <Dialog open={isAddingTheme} onOpenChange={setIsAddingTheme}>
              <DialogTrigger asChild>
                <button className="w-12 h-12 rounded-full border-2 border-dashed border-gray-300 dark:border-zinc-600 hover:border-accent transition-all hover:scale-110 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Custom Theme</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
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
                    <div className="flex items-center gap-2">
                      <div
                        className="w-10 h-10 rounded-full border border-gray-300 dark:border-zinc-600"
                        style={{ backgroundColor: newThemeColor }}
                      ></div>
                      <Input
                        id="theme-color"
                        type="color"
                        value={newThemeColor}
                        onChange={(e) => setNewThemeColor(e.target.value)}
                      />
                    </div>
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
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Select your preferred accent color for the website or create a custom one
          </p>
        </div>

        <div className="space-y-3">
          <Label>Homepage Background Image</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allBackgrounds.map((bg) => (
              <button
                key={bg.id}
                onClick={() => handleBackgroundSelect(bg.url)}
                className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                  selectedBackground === bg.url
                    ? "border-accent shadow-lg"
                    : "border-gray-300 dark:border-zinc-600"
                }`}
              >
                <Image
                  src={bg.url || "/placeholder.svg"}
                  alt={'background image'}
                  fill
                  className="object-cover"
                />
                {selectedBackground === bg.url && (
                  <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                    <Check className="h-8 w-8 text-white drop-shadow-lg" />
                  </div>
                )}

              </button>
            ))}

            <button
              onClick={() => setIsBackgroundPictureUploadOpen(true)}
              className={`relative aspect-video rounded-lg border-2 border-dashed transition-all hover:scale-105 flex flex-col items-center justify-center ${
                selectedBackground === "custom"
                  ? "border-accent bg-accent/10"
                  : "border-gray-300 dark:border-zinc-600 hover:border-accent"
              }`}
            >
              {customBackground ? (
                <>
                  <Image
                    src={customBackground || "/placeholder.svg"}
                    alt="Custom background"
                    fill
                    className="object-cover rounded-lg"
                  />
                  {selectedBackground === "custom" && (
                    <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                      <Check className="h-8 w-8 text-white drop-shadow-lg" />
                    </div>
                  )}
                </>
              ) : (
                <>
                  <Plus className="h-8 w-8 text-gray-400 dark:text-zinc-500 mb-2" />
                  <span className="text-xs text-gray-500 dark:text-zinc-400 text-center px-2">
                    Upload Custom
                  </span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-zinc-400">
            Choose a background image for your homepage
          </p>
        </div>
      </CardContent>
    </Card>
  )

  const renderPreferencesSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          General application settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8 text-gray-500 dark:text-zinc-400">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Additional preference settings will be available here.</p>
        </div>
      </CardContent>
    </Card>
  )

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSettings()
      case "appearance":
        return renderAppearanceSettings()
      case "preferences":
        return renderPreferencesSettings()
      default:
        return renderProfileSettings()
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 p-4 md:p-6 lg:p-8">
      <div className="w-full md:w-64 flex-shrink-0">
        <Card className="sticky top-6">
          <CardContent className="p-2 md:p-4">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors",
                      activeSection === item.id
                        ? "bg-accent text-black"
                        : "text-gray-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-700"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-grow">
                      <div className="font-medium text-sm">{item.name}</div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 space-y-6">
        {renderContent()}

        {hasChanges && (
          <div className="sticky bottom-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-gray-200 dark:border-zinc-800 flex justify-end items-center gap-4">
            <p className="text-sm text-gray-700 dark:text-zinc-300">
              You have unsaved changes.
            </p>
            <div>
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="ml-4 bg-accent hover:bg-accent-darker text-black"
              >
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </div>

      {isProfilePictureUploadOpen && (
        <FileUploadDialog
          open={isProfilePictureUploadOpen}
          onOpenChange={() => setIsProfilePictureUploadOpen(false)}
          uploadType="profile"
          title="Upload Profile Picture"
          description="Choose a new profile picture"
          handleUpload={handleImageUpload}
          onUploadSuccess={(result) => {
            toast.success("Upload successful:", result)
          }}
          onUploadError={(error: string) => {
            toast.error(`Upload failed: ${error}`)
          }}
        />
      )}
      {isBackgroundPictureUploadOpen && (
        <FileUploadDialog
          open={isBackgroundPictureUploadOpen}
          onOpenChange={() => setIsBackgroundPictureUploadOpen(false)}
          uploadType="background"
          title="Upload Background Image"
          description="Choose a new background image"
          handleUpload={handleImageUpload}
          onUploadSuccess={(result) => {
            toast.success("Upload successful:", result)
          }}
          onUploadError={(error: string) => {
            toast.error(`Upload failed: ${error}`)
          }}
        />
      )}
    </div>
  )
}
