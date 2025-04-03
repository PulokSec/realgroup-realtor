"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Upload, FileUp, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function GeoJsonUploader() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<any | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const selectedFile = e.target.files?.[0]

    if (!selectedFile) {
      return
    }

    if (selectedFile.type !== "application/json" && !selectedFile.name.endsWith(".geojson")) {
      setError("Please select a valid GeoJSON or JSON file")
      return
    }

    setFile(selectedFile)

    // Read file for preview
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)

        // Basic validation for GeoJSON format
        if (!json.type || !json.features || !Array.isArray(json.features)) {
          setError('Invalid GeoJSON format. File must contain "type" and "features" array.')
          return
        }

        setPreview({
          type: json.type,
          featureCount: json.features.length,
          sample: json.features.slice(0, 2),
        })
      } catch (err) {
        setError("Error parsing JSON file")
      }
    }
    reader.readAsText(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/properties/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to upload file")
      }

      const result = await response.json()

      toast({
        title: "Upload successful",
        description: `${result.imported} properties imported successfully.`,
      })

      // Reset form
      setFile(null)
      setPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during upload")
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "An error occurred during upload",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload GeoJSON Data</CardTitle>
        <CardDescription>Upload property data in GeoJSON format to add to your database</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-center w-full">
          <label
            htmlFor="geojson-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-4 text-gray-500" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">GeoJSON or JSON file (MAX. 10MB)</p>
            </div>
            <input
              id="geojson-upload"
              ref={fileInputRef}
              type="file"
              accept=".json,.geojson"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {preview && (
          <div className="mt-4">
            <h3 className="text-sm font-medium">File Preview:</h3>
            <p className="text-sm text-muted-foreground">Type: {preview.type}</p>
            <p className="text-sm text-muted-foreground">Features: {preview.featureCount}</p>
            <div className="mt-2 p-2 bg-muted rounded-md text-xs overflow-auto max-h-40">
              <pre>{JSON.stringify(preview.sample, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleUpload} disabled={!file || isUploading} className="w-full">
          {isUploading ? (
            <>Uploading...</>
          ) : (
            <>
              <FileUp className="mr-2 h-4 w-4" />
              Upload GeoJSON
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

