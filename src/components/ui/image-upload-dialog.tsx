"use client"

import { useState, useRef, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, File, ImageIcon, FileText, Check, X, Loader2 } from 'lucide-react'
import Image from "next/image"


export type UploadType = 'profile' | 'background' | 'document'
type UploadState = 'initial' | 'preview' | 'loading' | 'success' | 'error'

interface FileUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  uploadType: UploadType
  title?: string
  description?: string
  onUploadSuccess?: (result: any) => void
  onUploadError?: (error: string) => void
  handleUpload: (formData: FormData, uploadType: UploadType) => Promise<void>
}

const getAcceptedFileTypes = (uploadType: UploadType): string => {
  switch (uploadType) {
    case 'profile':
      return 'image/jpeg,image/png,image/webp,image/gif'
    case 'background':
      return 'image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff'
    case 'document':
      return 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    default:
      return '*/*'
  }
}

const getMaxFileSize = (uploadType: UploadType): number => {
  switch (uploadType) {
    case 'profile':
      return 5 * 1024 * 1024 // 5MB
    case 'background':
      return 10 * 1024 * 1024 // 10MB
    case 'document':
      return 25 * 1024 * 1024 // 25MB
    default:
      return 10 * 1024 * 1024
  }
}

const getUploadTypeLabel = (uploadType: UploadType): string => {
  switch (uploadType) {
    case 'profile':
      return 'Profile Image'
    case 'background':
      return 'Photo'
    case 'document':
      return 'Document'
    default:
      return 'File'
  }
}

const getFileIcon = (file: File, uploadType: UploadType) => {
  if (uploadType === 'profile' || uploadType === 'background') {
    return <ImageIcon className="h-8 w-8 text-accent" />
  }

  if (file.type.includes('pdf')) {
    return <FileText className="h-8 w-8 text-red-500" />
  }

  if (file.type.includes('word') || file.type.includes('document')) {
    return <FileText className="h-8 w-8 text-blue-500" />
  }

  if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
    return <FileText className="h-8 w-8 text-green-500" />
  }

  return <File className="h-8 w-8 text-gray-500 dark:text-zinc-400" />
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function FileUploadDialog({
  open,
  onOpenChange,
  uploadType,
  title,
  description,
  onUploadSuccess,
  onUploadError,
  handleUpload
}: FileUploadDialogProps) {
  const [uploadState, setUploadState] = useState<UploadState>('initial')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  const acceptedTypes = getAcceptedFileTypes(uploadType)
  const maxFileSize = getMaxFileSize(uploadType)
  const typeLabel = getUploadTypeLabel(uploadType)

  const resetState = useCallback(() => {
    setUploadState('initial')
    setSelectedFile(null)
    setPreviewUrl(null)
    setUploadProgress(0)
    setErrorMessage('')
    setSuccessMessage('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  const handleFileSelect = useCallback((file: File) => {
    if (file.size > maxFileSize) {
      setErrorMessage(`File size must be less than ${formatFileSize(maxFileSize)}`)
      setUploadState('error')
      return
    }

    const acceptedTypesArray = acceptedTypes.split(',')
    const isValidType = acceptedTypesArray.some(type =>
      type.trim() === '*/*' || file.type.match(type.trim().replace('*', '.*'))
    )

    if (!isValidType) {
      setErrorMessage(`Invalid file type. Please select a valid ${typeLabel.toLowerCase()}.`)
      setUploadState('error')
      return
    }

    setSelectedFile(file)
    setErrorMessage('')

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
        setUploadState('preview')
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
      setUploadState('preview')
    }
  }, [acceptedTypes, maxFileSize, typeLabel])

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

  const handleUploadClick = async () => {
    if (!selectedFile) return

    setUploadState('loading')
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
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
        setUploadState('success')
        setSuccessMessage(`${typeLabel} uploaded successfully!`)
        onUploadSuccess?.(result)
      }, 500)

    } catch (error) {
      setUploadState('error')
      const errorMsg = error instanceof Error ? error.message : 'Upload failed. Please try again.'
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Upload {typeLabel}
        </h3>
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
          Supported formats: {
          uploadType === 'profile' || uploadType === 'background'
            ? 'JPEG, PNG, WebP, GIF'
            : uploadType === 'document'
              ? 'PDF, DOC, DOCX, TXT, XLS, XLSX'
              : 'Various formats'
        }
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
              <Image
                src={previewUrl || "/placeholder.svg"}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
              {getFileIcon(selectedFile!, uploadType)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {selectedFile?.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              {selectedFile && formatFileSize(selectedFile.size)}
            </p>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={resetState}
            className="flex-shrink-0"
          >
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Uploading {typeLabel}...
        </h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">
          Please wait while we upload your file
        </p>
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
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {selectedFile.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              {formatFileSize(selectedFile.size)}
            </p>
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Upload Successful!
        </h3>
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          {successMessage}
        </p>
      </div>
    </div>
  )

  const renderErrorState = () => (
    <div className="space-y-4">
      <Alert className="border-red-200 dark:border-red-800">
        <X className="h-4 w-4 text-red-600 dark:text-red-400" />
        <AlertDescription className="text-red-800 dark:text-red-200">
          {errorMessage}
        </AlertDescription>
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
      case 'initial':
        return renderInitialState()
      case 'preview':
        return renderPreviewState()
      case 'loading':
        return renderLoadingState()
      case 'success':
        return renderSuccessState()
      case 'error':
        return renderErrorState()
      default:
        return renderInitialState()
    }
  }

  const getDialogTitle = () => {
    if (title) return title

    switch (uploadState) {
      case 'loading':
        return `Uploading ${typeLabel}...`
      case 'success':
        return 'Upload Complete'
      case 'error':
        return 'Upload Failed'
      default:
        return `Upload ${typeLabel}`
    }
  }

  const getDialogDescription = () => {
    if (description) return description

    switch (uploadState) {
      case 'loading':
        return 'Please wait while your file is being uploaded.'
      case 'success':
        return 'Your file has been uploaded successfully.'
      case 'error':
        return 'There was an error uploading your file.'
      default:
        return `Select a ${typeLabel.toLowerCase()} to upload.`
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          {uploadState !== 'loading' && (
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              {getDialogDescription()}
            </p>
          )}
        </DialogHeader>

        <div className="py-4">
          {renderContent()}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          {uploadState === 'preview' && (
            <>
              <Button variant="outline" onClick={resetState}>
                Change File
              </Button>
              <Button
                onClick={handleUploadClick}
                className="bg-accent hover:bg-accent-darker text-black"
              >
                Upload {typeLabel}
              </Button>
            </>
          )}

          {uploadState === 'success' && (
            <Button
              onClick={() => handleDialogClose(false)}
              className="bg-accent hover:bg-accent-darker text-black ml-auto"
            >
              Done
            </Button>
          )}

          {(uploadState === 'initial' || uploadState === 'error') && (
            <Button
              variant="outline"
              onClick={() => handleDialogClose(false)}
              className="ml-auto"
            >
              Cancel
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
