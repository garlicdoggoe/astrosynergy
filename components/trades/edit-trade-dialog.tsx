"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Id } from "@/convex/_generated/dataModel"
import { Upload, X } from "lucide-react"

interface EditTradeDialogProps {
  trade: any | null
  onClose: () => void
  customColumns?: Array<{
    _id: Id<"customColumns">
    columnId: string
    name: string
    type: "string" | "number" | "image"
    order: number
  }>
  imageSize: "small" | "medium" | "large" | "xlarge"
}

const IMAGE_SIZE_MAP = {
  small: 48,
  medium: 72,
  large: 96,
  xlarge: 128,
} as const

export function EditTradeDialog({ trade, onClose, customColumns = [], imageSize }: EditTradeDialogProps) {
  const updateTrade = useMutation(api.trades.updateTrade)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  
  const [formData, setFormData] = useState({
    ticker: "",
    date: "",
    time: "",
    profitLoss: "",
    note: "",
  })
  const [customData, setCustomData] = useState<Record<string, any>>({})
  const [activeImageColumn, setActiveImageColumn] = useState<string | null>(null)

  // Sort custom columns by order
  const sortedColumns = [...customColumns].sort((a, b) => a.order - b.order)

  useEffect(() => {
    if (trade) {
      setFormData({
        ticker: trade.ticker,
        date: trade.date,
        time: trade.time,
        profitLoss: trade.profitLoss.toString(),
        note: trade.note || "",
      })
      // Initialize custom data from trade
      setCustomData((trade.customData as Record<string, any>) || {})
    }
  }, [trade])

  const handleSave = async () => {
    if (trade) {
      await updateTrade({
        id: trade._id,
        ticker: formData.ticker,
        date: formData.date,
        time: formData.time,
        profitLoss: Number.parseFloat(formData.profitLoss),
        note: formData.note,
        customData: Object.keys(customData).length > 0 ? customData : undefined,
      })
    }
    onClose()
  }

  const handleCustomDataChange = (columnId: string, value: any) => {
    setCustomData((prev) => {
      const updated = { ...prev }
      if (value === "" || value === null || value === undefined) {
        delete updated[columnId]
      } else {
        updated[columnId] = value
      }
      return updated
    })
  }

  const handleImageUpload = async (columnId: string, file: File) => {
    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl()
      
      // Upload the file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })
      const { storageId } = await result.json()

      // Update custom data with the new image file ID
      handleCustomDataChange(columnId, storageId)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image. Please try again.")
    }
  }

  const handleRemoveImage = (columnId: string) => {
    handleCustomDataChange(columnId, null)
  }

  // Allow clipboard paste directly into the image field that was most recently triggered
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!activeImageColumn) return
      const clipboardItems = event.clipboardData?.items
      if (!clipboardItems) return
      const imageItem = Array.from(clipboardItems).find((item) => item.type.startsWith("image/"))
      const file = imageItem?.getAsFile()
      if (!file) return

      event.preventDefault()
      handleImageUpload(activeImageColumn, file)
      setActiveImageColumn(null)
    }

    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [activeImageColumn, handleImageUpload])

  return (
    <Dialog open={!!trade} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Trade</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-ticker">Ticker</Label>
              <Input
                id="edit-ticker"
                value={formData.ticker}
                onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-time">Time</Label>
              <Input
                id="edit-time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-profitLoss">P&L ($)</Label>
              <Input
                id="edit-profitLoss"
                type="number"
                step="0.01"
                value={formData.profitLoss}
                onChange={(e) => setFormData({ ...formData, profitLoss: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-note">Note</Label>
            <Textarea
              id="edit-note"
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              rows={3}
            />
          </div>

          {/* Custom Columns */}
          {sortedColumns.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-sm">Custom Columns</h3>
              {sortedColumns.map((column) => (
                <div key={column.columnId} className="space-y-2">
                  <Label htmlFor={`custom-${column.columnId}`}>{column.name}</Label>
                  {column.type === "image" ? (
                    <ImageField
                      columnId={column.columnId}
                      fileId={customData[column.columnId] as Id<"_storage"> | undefined}
                      onUpload={(file) => handleImageUpload(column.columnId, file)}
                      onRemove={() => handleRemoveImage(column.columnId)}
                      inputRef={(el) => {
                        fileInputRefs.current[column.columnId] = el
                      }}
                      onPreparePaste={() => setActiveImageColumn(column.columnId)}
                      imageSize={imageSize}
                    />
                  ) : column.type === "number" ? (
                    <Input
                      id={`custom-${column.columnId}`}
                      type="number"
                      step="0.01"
                      value={customData[column.columnId]?.toString() || ""}
                      onChange={(e) =>
                        handleCustomDataChange(
                          column.columnId,
                          e.target.value ? Number.parseFloat(e.target.value) : ""
                        )
                      }
                      placeholder="Enter a number"
                    />
                  ) : (
                    <Input
                      id={`custom-${column.columnId}`}
                      type="text"
                      value={customData[column.columnId]?.toString() || ""}
                      onChange={(e) => handleCustomDataChange(column.columnId, e.target.value)}
                      placeholder="Enter text"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Component for image field with preview and upload
function ImageField({
  columnId,
  fileId,
  onUpload,
  onRemove,
  inputRef,
  onPreparePaste,
  imageSize,
}: {
  columnId: string
  fileId: Id<"_storage"> | undefined
  onUpload: (file: File) => void
  onRemove: () => void
  inputRef: (el: HTMLInputElement | null) => void
  onPreparePaste: () => void
  imageSize: "small" | "medium" | "large" | "xlarge"
}) {
  const imageUrl = useQuery(api.files.getImageUrl, fileId ? { fileId } : "skip")
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const dimension = IMAGE_SIZE_MAP[imageSize]
  const iconClass =
    imageSize === "small"
      ? "h-4 w-4 mr-2"
      : imageSize === "medium"
        ? "h-5 w-5 mr-2"
        : imageSize === "large"
          ? "h-6 w-6 mr-2"
          : "h-7 w-7 mr-2"

  return (
    <div className="space-y-2">
      <input
        ref={(el) => {
          fileInputRef.current = el
          inputRef(el)
        }}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            onUpload(file)
          }
        }}
      />
      {fileId && imageUrl ? (
        <div
          className="relative inline-block"
          onClick={() => {
            onPreparePaste()
            fileInputRef.current?.click()
          }}
        >
          <img
            src={imageUrl}
            alt="Preview"
            className="object-cover rounded border"
            style={{ width: dimension, height: dimension }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onPreparePaste()
            if (fileInputRef.current) {
              fileInputRef.current.click()
            }
          }}
          style={{ width: dimension }}
        >
          <Upload className={iconClass} />
          Upload Image
        </Button>
      )}
    </div>
  )
}
