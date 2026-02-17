"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { Upload, File } from "lucide-react"

interface Course {
  id: string
  code: string
  name: string
}

interface MaterialsUploadProps {
  courses: Course[]
  selectedCourseId?: string
}

export function MaterialsUpload({ courses, selectedCourseId }: MaterialsUploadProps) {
  const router = useRouter()
  const [selectedCourse, setSelectedCourse] = useState(selectedCourseId || "")
  const [file, setFile] = useState<File | null>(null)
  const [materialTitle, setMaterialTitle] = useState("")
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId)
    router.push(`/lecturer/materials?courseId=${courseId}`)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadedUrl(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCourse || !file || !materialTitle) {
      setMessage({ type: "error", text: "Please fill in all fields and select a file" })
      return
    }

    startTransition(async () => {
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("courseId", selectedCourse)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          setMessage({ type: "success", text: "File uploaded successfully!" })
          setUploadedUrl(result.url)
          setFile(null)
          setMaterialTitle("")
          // Reset file input
          const fileInput = document.getElementById("file") as HTMLInputElement
          if (fileInput) fileInput.value = ""
        } else {
          setMessage({ type: "error", text: result.error || "Failed to upload file" })
        }
      } catch (error) {
        setMessage({ type: "error", text: "An error occurred while uploading" })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`rounded-md p-3 text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="course">Select Course</Label>
        <select
          id="course"
          value={selectedCourse}
          onChange={(e) => handleCourseChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="">Select a course...</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.code} - {course.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Material Title</Label>
        <Input
          id="title"
          value={materialTitle}
          onChange={(e) => setMaterialTitle(e.target.value)}
          placeholder="Enter material title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">Upload File</Label>
        <div className="flex items-center gap-2">
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            className="cursor-pointer"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
            required
          />
          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <File className="h-4 w-4" />
              <span>{file.name}</span>
              <span className="text-xs">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Supported formats: PDF, DOC, DOCX, PPT, PPTX, TXT, JPG, PNG (Max 10MB)
        </p>
      </div>

      {uploadedUrl && (
        <div className="rounded-lg border p-3 bg-green-50">
          <p className="text-sm font-medium text-green-800">File uploaded successfully!</p>
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-green-600 hover:underline"
          >
            View file
          </a>
        </div>
      )}

      <Button type="submit" disabled={isPending || !selectedCourse || !file || !materialTitle}>
        <Upload className="mr-2 h-4 w-4" />
        {isPending ? "Uploading..." : "Upload Material"}
      </Button>
    </form>
  )
}


