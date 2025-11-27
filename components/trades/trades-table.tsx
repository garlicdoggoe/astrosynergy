"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { formatCurrency, formatDate, formatTime } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Edit2, Trash2, Upload } from "lucide-react"
import { EditTradeDialog } from "@/components/trades/edit-trade-dialog"
import { Id } from "@/convex/_generated/dataModel"

const IMAGE_SIZE_MAP = {
  small: 48,
  medium: 72,
  large: 96,
  xlarge: 128,
} as const

// Component to handle image cell rendering with URL fetching
function ImageCell({
  fileId,
  columnName,
  onUpload,
  onPreparePaste,
  size,
  children,
}: {
  fileId: Id<"_storage"> | undefined
  columnName: string
  onUpload: () => void
  onPreparePaste?: () => void
  size: "small" | "medium" | "large" | "xlarge"
  children: React.ReactNode
}) {
  const imageUrl = useQuery(
    api.files.getImageUrl,
    fileId ? { fileId } : "skip"
  )
  const dimension = IMAGE_SIZE_MAP[size]
  const iconClass =
    size === "small"
      ? "h-4 w-4"
      : size === "medium"
        ? "h-5 w-5"
        : size === "large"
          ? "h-6 w-6"
          : "h-7 w-7"

  return (
    <TableCell
      className="cursor-pointer text-center align-middle"
      onClick={() => {
        onPreparePaste?.()
        onUpload()
      }}
      onMouseEnter={() => {
        onPreparePaste?.()
      }}
    >
      <div className="flex justify-center">
        {fileId && imageUrl ? (
          <img
            src={imageUrl}
            alt={columnName}
            className="rounded border object-cover"
            style={{ width: dimension, height: dimension }}
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = "none"
            }}
          />
        ) : (
          <div
            className="border-2 border-dashed rounded flex items-center justify-center text-muted-foreground"
            style={{ width: dimension, height: dimension }}
          >
            <Upload className={iconClass} />
          </div>
        )}
      </div>
      {children}
    </TableCell>
  )
}

type DateRangeValue = {
  start: Date
  end: Date
}

interface TradesTableProps {
  dateRange: DateRangeValue
  filterMode: "range" | "all"
  pageSize: 10 | 30 | 50
  winLossFilter: "all" | "winners" | "losers"
  customColumns?: Array<{
    _id: Id<"customColumns">
    columnId: string
    name: string
    type: "string" | "number" | "image"
    order: number
  }>
  imageSize: "small" | "medium" | "large" | "xlarge"
}

export function TradesTable({
  dateRange,
  filterMode,
  pageSize,
  winLossFilter,
  customColumns = [],
  imageSize,
}: TradesTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [editingTrade, setEditingTrade] = useState<any>(null)
  const [editingCell, setEditingCell] = useState<{ tradeId: string; columnId: string } | null>(null)
  const [editingValue, setEditingValue] = useState("")
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const [activeImageCell, setActiveImageCell] = useState<{ tradeId: string; columnId: string } | null>(null)
  
  // Get all trades from Convex
  const trades = useQuery(api.trades.getAllTrades) ?? []
  const deleteTrade = useMutation(api.trades.deleteTrade)
  const updateTrade = useMutation(api.trades.updateTrade)
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)

  // Filter trades based on selected date range and win/loss filter
  const filteredTrades = useMemo(() => {
    let filtered = trades
    if (filterMode === "range") {
      const startDate = dateRange.start
      const endDate = dateRange.end
      filtered = trades.filter((trade) => {
        const tradeDate = new Date(trade.date)
        return tradeDate >= startDate && tradeDate <= endDate
      })
    }

    // Apply win/loss filter
    switch (winLossFilter) {
      case "winners":
        filtered = filtered.filter((trade) => trade.profitLoss > 0)
        break
      case "losers":
        filtered = filtered.filter((trade) => trade.profitLoss < 0)
        break
      case "all":
        // No additional filtering needed
        break
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [dateRange, filterMode, winLossFilter, trades])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [dateRange, filterMode, winLossFilter, pageSize])

  // Pagination
  const totalPages = Math.ceil(filteredTrades.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentTrades = filteredTrades.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  const totalPnL = filteredTrades.reduce((sum, trade) => sum + trade.profitLoss, 0)
  const winningTrades = filteredTrades.filter((t) => t.profitLoss > 0).length
  const losingTrades = filteredTrades.filter((t) => t.profitLoss < 0).length

  const handleDeleteTrade = async (tradeId: string) => {
    if (confirm("Are you sure you want to delete this trade?")) {
      await deleteTrade({ id: tradeId as any })
    }
  }

  // Sort custom columns by order
  const sortedColumns = useMemo(() => {
    return [...customColumns].sort((a, b) => a.order - b.order)
  }, [customColumns])

  // Handle inline editing for string/number columns
  const handleCellClick = (tradeId: string, columnId: string, currentValue: any, columnType: string) => {
    if (columnType === "image") {
      setActiveImageCell({ tradeId, columnId })
      const input = fileInputRefs.current[`${tradeId}_${columnId}`]
      input?.click()
    } else {
      // For string/number, start inline editing
      setEditingCell({ tradeId, columnId })
      setEditingValue(currentValue?.toString() || "")
      setActiveImageCell(null)
    }
  }

  const handleCellSave = async () => {
    if (!editingCell) return

    const column = sortedColumns.find((c) => c.columnId === editingCell.columnId)
    if (!column) return

    const trade = trades.find((t) => t._id === editingCell.tradeId)
    if (!trade) return

    const customData = { ...(trade.customData as Record<string, any> || {}) }
    
    if (column.type === "number") {
      const numValue = Number.parseFloat(editingValue)
      if (!Number.isNaN(numValue)) {
        customData[editingCell.columnId] = numValue
      } else {
        delete customData[editingCell.columnId]
      }
    } else {
      if (editingValue.trim()) {
        customData[editingCell.columnId] = editingValue.trim()
      } else {
        delete customData[editingCell.columnId]
      }
    }

    await updateTrade({
      id: trade._id,
      customData: Object.keys(customData).length > 0 ? customData : undefined,
    })

    setEditingCell(null)
    setEditingValue("")
  }

  const handleImageUpload = async (tradeId: string, columnId: string, file: File) => {
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

      // Update the trade with the new image file ID
      const trade = trades.find((t) => t._id === tradeId)
      if (!trade) return

      const customData = { ...(trade.customData as Record<string, any> || {}) }
      const oldFileId = customData[columnId]

      customData[columnId] = storageId

      await updateTrade({
        id: trade._id,
        customData,
      })

      // Note: Old file cleanup is handled by the updateTrade mutation in the backend
      setActiveImageCell(null)
    } catch (error) {
      console.error("Error uploading image:", error)
      alert("Failed to upload image. Please try again.")
    }
  }

  // Allow clipboard paste for image cells when a target is active
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (!activeImageCell) return
      const clipboardItems = event.clipboardData?.items
      if (!clipboardItems) return

      const imageItem = Array.from(clipboardItems).find((item) => item.type.startsWith("image/"))
      const file = imageItem?.getAsFile()
      if (!file) return

      event.preventDefault()
      handleImageUpload(activeImageCell.tradeId, activeImageCell.columnId, file)
    }

    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [activeImageCell, handleImageUpload])

  const renderCustomCell = (trade: any, column: typeof sortedColumns[0]) => {
    const customData = (trade.customData as Record<string, any>) || {}
    const value = customData[column.columnId]
    const isEditing = editingCell?.tradeId === trade._id && editingCell?.columnId === column.columnId

    if (column.type === "image") {
      // Image column - show thumbnail or upload button
      return (
        <ImageCell
          key={column.columnId}
          fileId={value as Id<"_storage"> | undefined}
          columnName={column.name}
          onUpload={() => {
            const input = fileInputRefs.current[`${trade._id}_${column.columnId}`]
            if (input) {
              input.click()
            }
          }}
          onPreparePaste={() => setActiveImageCell({ tradeId: trade._id, columnId: column.columnId })}
          size={imageSize}
        >
          <input
            ref={(el) => {
              fileInputRefs.current[`${trade._id}_${column.columnId}`] = el
            }}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                handleImageUpload(trade._id, column.columnId, file)
              }
            }}
          />
        </ImageCell>
      )
    } else if (isEditing) {
      // Inline editing mode
      return (
        <TableCell key={column.columnId} className="text-center align-middle">
          <Input
            type={column.type === "number" ? "number" : "text"}
            value={editingValue}
            onChange={(e) => setEditingValue(e.target.value)}
            onBlur={handleCellSave}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCellSave()
              } else if (e.key === "Escape") {
                setEditingCell(null)
                setEditingValue("")
              }
            }}
            autoFocus
            className="h-8 text-center"
            step={column.type === "number" ? "0.01" : undefined}
          />
        </TableCell>
      )
    } else {
      // Display mode
      return (
        <TableCell
          key={column.columnId}
          className="cursor-pointer hover:bg-accent/50 text-center align-middle"
          onClick={() => handleCellClick(trade._id, column.columnId, value, column.type)}
        >
          {column.type === "number" && value !== undefined
            ? formatCurrency(value as number)
            : value || "-"}
        </TableCell>
      )
    }
  }

  return (
    <>
      <Card className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 pb-6 border-b">
          <div>
            <p className="text-sm text-muted-foreground">Total Trades</p>
            <p className="text-2xl font-bold text-foreground">{filteredTrades.length}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total P&L</p>
            <p
              className={`text-2xl font-bold ${
                totalPnL > 0
                  ? "text-green-600 dark:text-green-400"
                  : totalPnL < 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-foreground"
              }`}
            >
              {formatCurrency(totalPnL)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Winning Trades</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{winningTrades}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Losing Trades</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{losingTrades}</p>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Date</TableHead>
                <TableHead className="text-center">Time</TableHead>
                <TableHead className="text-center">Type</TableHead>
                <TableHead className="text-center">Ticker</TableHead>
                <TableHead className="text-center">P&L</TableHead>
                {/* Render custom column headers */}
                {sortedColumns.map((column) => (
                  <TableHead key={column.columnId} className="text-center">
                    {column.name}
                  </TableHead>
                ))}
                <TableHead className="text-center">Note</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTrades.length === 0 ? (
                <TableRow>
                   <TableCell colSpan={7 + sortedColumns.length} className="text-center text-muted-foreground py-8">
                    No trades found for this period
                  </TableCell>
                </TableRow>
              ) : (
                currentTrades.map((trade) => (
                  <TableRow key={trade._id}>
                    <TableCell className="text-center font-medium">{formatDate(trade.date)}</TableCell>
                    <TableCell className="text-center">{formatTime(trade.time)}</TableCell>
                    <TableCell className="text-center">
                      <span className="uppercase text-xs font-semibold rounded-full px-2 py-0.5 bg-muted text-muted-foreground">
                        {trade.type ? trade.type.toUpperCase() : "-"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-semibold">{trade.ticker}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`font-bold ${
                          trade.profitLoss > 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {formatCurrency(trade.profitLoss)}
                      </span>
                    </TableCell>
                    {/* Render custom column cells */}
                    {sortedColumns.map((column) => renderCustomCell(trade, column))}
                    <TableCell className="max-w-[300px] truncate text-center">{trade.note || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setEditingTrade(trade)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteTrade(trade._id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredTrades.length)} of {filteredTrades.length} trades
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousPage} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage === totalPages}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <EditTradeDialog
        trade={editingTrade}
        onClose={() => setEditingTrade(null)}
        customColumns={sortedColumns}
        imageSize={imageSize}
      />
    </>
  )
}
