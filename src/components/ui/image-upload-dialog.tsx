"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Upload, File, ImageIcon, FileText, Check, X, Loader2 } from "lucide-react"
import Image from "next/image"
import {UploadType} from "@/types/objectStorage";

type UploadState = "initial" | "preview" | "loading" | "success" | "error"

interface GalleryFormData {
  title: string
  altText: string
  description: string
  category: string
  unit: string
}

interface CategoryOption {
  value: string
  label: string
}

interface UnitOption {
  value: string
  label: string
}

interface FileUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uploadType: UploadType
  title?: string
  description?: string
  categories?: CategoryOption[]
  units?: UnitOption[]
  onUploadSuccess?: (result: any) => void
  onUploadError?: (error: string) => void
  handleUpload: (formData: FormData, uploadType: UploadType) => Promise<any>
}

const defaultCategories: CategoryOption[] = [
  { value: "training", label: "Training" },
  { value: "maritime", label: "Maritime" },
  { value: "aerial", label: "Aerial" },
  { value: "night-ops", label: "Night Ops" },
  { value: "team", label: "Team" },
  { value: "insertion", label: "Insertion" },
  { value: "interdiction", label: "Interdiction" },
  { value: "diving", label: "Diving" },
  { value: "combat", label: "Combat" },
  { value: "equipment", label: "Equipment" },
  { value: "graduation", label: "Graduation" },
  { value: "ceremony", label: "Ceremony" },
]

// Default units - can be overridden via props
const defaultUnits: UnitOption[] = [
  { value: "task-force-160th", label: "Task Force 160th" },
  { value: "tacdevron2", label: "TACDEVRON2" },
]

const getAcceptedFileTypes = (uploadType: UploadType): string => {
  switch (uploadType) {
    case "profile":
      return "image/jpeg,image/png,image/webp,image/gif"
    case "background":
    case "gallery":
      return "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff"
    case "document":
      return "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    default:
      return "*/*"
  }
}

const getMaxFileSize = (uploadType: UploadType): number => {
  switch (uploadType) {
    case "profile":
      return 5 * 1024 * 1024 // 5MB
    case "background":
    case "gallery":
      return 10 * 1024 * 1024 // 10MB
    case "document":
      return 25 * 1024 * 1024 // 25MB
    default:
      return 10 * 1024 * 1024
  }
}

const getUploadTypeLabel = (uploadType: UploadType): string => {
  switch (uploadType) {
    case "profile":
      return "Profile Image"
    case "background":
      return "Photo"
    case "gallery":
      return "Gallery Image"
    case "document":
      return "Document"
    default:
      return "File"
  }
}

const getFileIcon = (file: File, uploadType: UploadType) => {
  if (uploadType === "profile" || uploadType === "background" || uploadType === "gallery") {
    return <ImageIcon className="h-8 w-8 text-accent" />
  }

  if (file.type.includes("pdf")) {
    return <FileText className="h-8 w-8 text-red-500" />
  }

  if (file.type.includes("word") || file.type.includes("document")) {
    return <FileText className="h-8 w-8 text-blue-500" />
  }

  if (file.type.includes("excel") || file.type.includes("spreadsheet")) {
    return <FileText className="h-8 w-8 text-green-500" />
  }

  return <File className="h-8 w-8 text-gray-500 dark:text-zinc-400" />
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function FileUploadDialog({
  open,
  onOpenChange,
  uploadType,
  title,
  description,
  categories = defaultCategories,
  units = defaultUnits,
  onUploadSuccess,
  onUploadError,
  handleUpload,
}: FileUploadDialogProps) {
  const [uploadState, setUploadState] = useState<UploadState>("initial")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")

  // Gallery form data
  const [galleryFormData, setGalleryFormData] = useState<GalleryFormData>({
    title: "",
    altText: "",
    description: "",
    category: "",
    unit: "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const acceptedTypes = getAcceptedFileTypes(uploadType)
  const maxFileSize = getMaxFileSize(uploadType)
  const typeLabel = getUploadTypeLabel(uploadType)

  const resetState = useCallback(() => {
    setUploadState("initial")
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadProgress(0)
    setErrorMessage("")
    setSuccessMessage("")
    setGalleryFormData({
      title: "",
      altText: "",
      description: "",
      category: "",
      unit: "",
    })
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const handleFileSelect = useCallback(
    (file: File) => {
      // Validate file size
      if (file.size > maxFileSize) {
        setErrorMessage(`File size must be less than ${formatFileSize(maxFileSize)}`)
        setUploadState("error")
        return
      }

      // Validate file type
      const acceptedTypesArray = acceptedTypes.split(",")
      const isValidType = acceptedTypesArray.some(
        (type) => type.trim() === "*/*" || file.type.match(type.trim().replace(/\*/g, ".*")),
      )

      if (!isValidType) {
        setErrorMessage(`Invalid file type. Please select a valid ${typeLabel.toLowerCase()}.`)
        setUploadState("error")
        return
      }

      setSelectedFile(file)
      setErrorMessage("")

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviewUrl(e.target?.result as string)
          setUploadState("preview")
        }
        reader.readAsDataURL(file)
      } else {
        setPreviewUrl(null)
        setUploadState("preview")
      }
    },
    [acceptedTypes, maxFileSize, typeLabel],
  )

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDragEnter = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    const files = event.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const isGalleryFormValid = () => {
    if (uploadType !== "gallery") return true
    return (
      selectedFile &&
      galleryFormData.title.trim() !== "" &&
      galleryFormData.altText.trim() !== "" &&
      galleryFormData.description.trim() !== "" &&
      galleryFormData.category !== "" &&
      galleryFormData.unit !== ""
    )
  }

  const handleUploadClick = async () => {
    if (!selectedFile) return
    if (uploadType === "gallery" && !isGalleryFormValid()) return

    setUploadState("loading")
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      // Add gallery form data if it's a gallery upload
      if (uploadType === "gallery") {
        formData.append("title", galleryFormData.title)
        formData.append("altText", galleryFormData.altText)
        formData.append("description", galleryFormData.description)
        formData.append("category", galleryFormData.category)
        formData.append("unit", galleryFormData.unit)
      }

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const result = await handleUpload(formData, uploadType)

      clearInterval(progressInterval)
      setUploadProgress(100)

      setTimeout(() => {
        setUploadState("success")
        setSuccessMessage(`${typeLabel} uploaded successfully!`)
        onUploadSuccess?.(result)
      }, 500)
    } catch (error) {
      setUploadState("error")
      const errorMsg = error instanceof Error ? error.message : "Upload failed. Please try again."
      setErrorMessage(errorMsg)
      onUploadError?.(errorMsg)
    }
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetState()
    }
    onOpenChange(open)
  }

  const renderFileUploadSection = () => (
    <div className="space-y-4">
      {uploadState === "initial" && (
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg p-8 text-center hover:border-accent transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-gray-400 dark:text-zinc-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload {typeLabel}</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
            Drag and drop your file here, or click to browse
          </p>
          <Button variant="outline" type="button">
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>
      )}

      {uploadState === "preview" && selectedFile && (
        <div className="space-y-4">
          {previewUrl ? (
            <div className="relative w-full h-64 rounded-lg overflow-hidden border border-gray-200 dark:border-zinc-700">
              <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              <Button
                variant="ghost"
                size="icon"
                onClick={resetState}
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  {getFileIcon(selectedFile, uploadType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500 dark:text-zinc-400">{formatFileSize(selectedFile.size)}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={resetState} className="flex-shrink-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {uploadState === "error" && (
        <Alert className="border-red-200 dark:border-red-800">
          <X className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-gray-500 dark:text-zinc-400 space-y-1">
        <p>Maximum file size: {formatFileSize(maxFileSize)}</p>
        <p>
          Supported formats:{" "}
          {uploadType === "profile" || uploadType === "background" || uploadType === "gallery"
            ? "JPEG, PNG, WebP, GIF"
            : uploadType === "document"
              ? "PDF, DOC, DOCX, TXT, XLS, XLSX"
              : "Various formats"}
        </p>
      </div>
    </div>
  )

  const renderGalleryForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={galleryFormData.title}
          onChange={(e) => setGalleryFormData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="Enter image title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="altText">Alt Text *</Label>
        <Input
          id="altText"
          value={galleryFormData.altText}
          onChange={(e) => setGalleryFormData((prev) => ({ ...prev, altText: e.target.value }))}
          placeholder="Describe the image for accessibility"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={galleryFormData.description}
          onChange={(e) => setGalleryFormData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Enter a detailed description"
          rows={4}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          value={galleryFormData.category}
          onValueChange={(value) => setGalleryFormData((prev) => ({ ...prev, category: value }))}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="unit">Unit *</Label>
        <Select
          value={galleryFormData.unit}
          onValueChange={(value) => setGalleryFormData((prev) => ({ ...prev, unit: value }))}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a unit" />
          </SelectTrigger>
          <SelectContent>
            {units.map((unit) => (
              <SelectItem key={unit.value} value={unit.value}>
                {unit.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderGalleryLayout = () => {
    // Show only loading state during upload
    if (uploadState === "loading") {
      return (
        <div className="py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 text-accent mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">Uploading {typeLabel}...</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Please wait while we upload your image</p>

            <div className="max-w-md mx-auto space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-zinc-400">Progress</span>
                <span className="text-gray-900 dark:text-white">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          </div>
        </div>
      )
    }

    // Show only success state after successful upload
    if (uploadState === "success") {
      return (
        <div className="py-12">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">Upload Successful!</h3>
            <p className="text-gray-500 dark:text-zinc-400">{successMessage}</p>
            <div className="pt-4">
              <Button onClick={() => handleDialogClose(false)} className="bg-accent hover:bg-accent-darker text-black">
                Done
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Show only error state after failed upload
    if (uploadState === "error") {
      return (
        <div className="py-12">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
              <X className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">Upload Failed</h3>
            <Alert className="border-red-200 dark:border-red-800 max-w-md mx-auto">
              <AlertDescription className="text-red-800 dark:text-red-200 text-center">{errorMessage}</AlertDescription>
            </Alert>
            <div className="flex justify-center gap-3 pt-4">
              <Button variant="outline" onClick={resetState}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )
    }

    // Show the normal two-column layout for initial and preview states
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - File Upload */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upload Image</h3>
              {renderFileUploadSection()}
            </div>

            {/* Right Column - Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Image Details</h3>
              {renderGalleryForm()}
            </div>
          </div>
        </CardContent>

        {uploadState === "preview" && (
          <CardFooter className="flex justify-between p-6 pt-0">
            <Button variant="outline" onClick={resetState}>
              Clear
            </Button>
            <Button
              onClick={handleUploadClick}
              disabled={!isGalleryFormValid()}
              className="bg-accent hover:bg-accent-darker text-black"
            >
              Upload Image
            </Button>
          </CardFooter>
        )}
      </Card>
    )
  }

  // Original dialog layout for non-gallery uploads
  const renderOriginalLayout = () => {
    const renderInitialState = () => (
      <div className="space-y-4">
        <div
          ref={dropZoneRef}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg p-8 text-center hover:border-accent transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 text-gray-400 dark:text-zinc-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload {typeLabel}</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
            Drag and drop your file here, or click to browse
          </p>
          <Button variant="outline" type="button">
            Choose File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        <div className="text-xs text-gray-500 dark:text-zinc-400 space-y-1">
          <p>Maximum file size: {formatFileSize(maxFileSize)}</p>
          <p>
            Supported formats:{" "}
            {uploadType === "profile" || uploadType === "background"
              ? "JPEG, PNG, WebP, GIF"
              : uploadType === "document"
                ? "PDF, DOC, DOCX, TXT, XLS, XLSX"
                : "Various formats"}
          </p>
        </div>
      </div>
    )

    const renderPreviewState = () => (
      <div className="space-y-4">
        <div className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            {previewUrl ? (
              <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={previewUrl || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              </div>
            ) : (
              <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                {getFileIcon(selectedFile!, uploadType)}
              </div>
            )}

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedFile?.name}</p>
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                {selectedFile && formatFileSize(selectedFile.size)}
              </p>
            </div>

            <Button variant="ghost" size="icon" onClick={resetState} className="flex-shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )

    const renderLoadingState = () => (
      <div className="space-y-4">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-accent mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Uploading {typeLabel}...</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">Please wait while we upload your file</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500 dark:text-zinc-400">Progress</span>
            <span className="text-gray-900 dark:text-white">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>

        {selectedFile && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
            {getFileIcon(selectedFile, uploadType)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{selectedFile.name}</p>
              <p className="text-sm text-gray-500 dark:text-zinc-400">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
        )}
      </div>
    )

    const renderSuccessState = () => (
      <div className="space-y-4">
        <div className="text-center">
          <div className="h-12 w-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Upload Successful!</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">{successMessage}</p>
        </div>
      </div>
    )

    const renderErrorState = () => (
      <div className="space-y-4">
        <Alert className="border-red-200 dark:border-red-800">
          <X className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">{errorMessage}</AlertDescription>
        </Alert>

        <div className="flex justify-center">
          <Button variant="outline" onClick={resetState}>
            Try Again
          </Button>
        </div>
      </div>
    )

    const renderContent = () => {
      switch (uploadState) {
        case "initial":
          return renderInitialState()
        case "preview":
          return renderPreviewState()
        case "loading":
          return renderLoadingState()
        case "success":
          return renderSuccessState()
        case "error":
          return renderErrorState()
        default:
          return renderInitialState()
      }
    }

    const getDialogTitle = () => {
      if (title) return title

      switch (uploadState) {
        case "loading":
          return `Uploading ${typeLabel}...`
        case "success":
          return "Upload Complete"
        case "error":
          return "Upload Failed"
        default:
          return `Upload ${typeLabel}`
      }
    }

    const getDialogDescription = () => {
      if (description) return description

      switch (uploadState) {
        case "loading":
          return "Please wait while your file is being uploaded."
        case "success":
          return "Your file has been uploaded successfully."
        case "error":
          return "There was an error uploading your file."
        default:
          return `Select a ${typeLabel.toLowerCase()} to upload.`
      }
    }

    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
            {uploadState !== "loading" && (
              <p className="text-sm text-gray-500 dark:text-zinc-400">{getDialogDescription()}</p>
            )}
          </DialogHeader>

          <div className="py-4">{renderContent()}</div>

          <DialogFooter className="flex justify-between sm:justify-between">
            {uploadState === "preview" && (
              <>
                <Button variant="outline" onClick={resetState}>
                  Change File
                </Button>
                <Button onClick={handleUploadClick} className="bg-accent hover:bg-accent-darker text-black">
                  Upload {typeLabel}
                </Button>
              </>
            )}

            {uploadState === "success" && (
              <Button
                onClick={() => handleDialogClose(false)}
                className="bg-accent hover:bg-accent-darker text-black ml-auto"
              >
                Done
              </Button>
            )}

            {(uploadState === "initial" || uploadState === "error") && (
              <Button variant="outline" onClick={() => handleDialogClose(false)} className="ml-auto">
                Cancel
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  // Return gallery layout for gallery uploads, original dialog for others
  if (uploadType === "gallery") {
    return (
      <Dialog open={open} onOpenChange={handleDialogClose}>
        <DialogContent className="w-[70vw] md:w-[40vw] !max-w-none overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title || "Add Gallery Image"}</DialogTitle>
            {(uploadState === "initial" || uploadState === "preview") && (
              <p className="text-sm text-gray-500 dark:text-zinc-400">
                {description || "Upload a new image to the gallery with details."}
              </p>
            )}
          </DialogHeader>
          {renderGalleryLayout()}
        </DialogContent>
      </Dialog>
    )
  }

  return renderOriginalLayout()
}
