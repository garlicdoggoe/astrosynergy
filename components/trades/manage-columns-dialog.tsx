"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Trash2, ChevronUp, ChevronDown, Plus } from "lucide-react"

interface ManageColumnsDialogProps {
  open: boolean
  onClose: () => void
}

export function ManageColumnsDialog({ open, onClose }: ManageColumnsDialogProps) {
  const columns = useQuery(api.trades.getCustomColumns) ?? []
  const addColumn = useMutation(api.trades.addCustomColumn)
  const updateColumn = useMutation(api.trades.updateCustomColumn)
  const deleteColumn = useMutation(api.trades.deleteCustomColumn)
  const reorderColumns = useMutation(api.trades.reorderCustomColumns)

  const [newColumnName, setNewColumnName] = useState("")
  const [newColumnType, setNewColumnType] = useState<"string" | "number" | "image">("string")
  const [editingColumnId, setEditingColumnId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setNewColumnName("")
      setNewColumnType("string")
      setEditingColumnId(null)
      setEditingName("")
    }
  }, [open])

  const handleAddColumn = async () => {
    if (!newColumnName.trim()) return

    try {
      await addColumn({
        name: newColumnName.trim(),
        type: newColumnType,
      })
      setNewColumnName("")
      setNewColumnType("string")
    } catch (error) {
      console.error("Error adding column:", error)
    }
  }

  const handleUpdateColumn = async (columnId: string) => {
    if (!editingName.trim()) {
      setEditingColumnId(null)
      return
    }

    try {
      await updateColumn({
        columnId,
        name: editingName.trim(),
      })
      setEditingColumnId(null)
      setEditingName("")
    } catch (error) {
      console.error("Error updating column:", error)
    }
  }

  const handleDeleteColumn = async (columnId: string) => {
    if (!confirm("Are you sure you want to delete this column? All data in this column will be lost.")) {
      return
    }

    try {
      await deleteColumn({ columnId })
    } catch (error) {
      console.error("Error deleting column:", error)
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return

    const newOrder = [...columns]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index - 1]
    newOrder[index - 1] = temp

    await reorderColumns({
      columnIds: newOrder.map((col) => col.columnId),
    })
  }

  const handleMoveDown = async (index: number) => {
    if (index === columns.length - 1) return

    const newOrder = [...columns]
    const temp = newOrder[index]
    newOrder[index] = newOrder[index + 1]
    newOrder[index + 1] = temp

    await reorderColumns({
      columnIds: newOrder.map((col) => col.columnId),
    })
  }

  const startEditing = (column: typeof columns[0]) => {
    setEditingColumnId(column.columnId)
    setEditingName(column.name)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Custom Columns</DialogTitle>
          <DialogDescription>
            Add, edit, or remove custom columns for your trades table. You can create columns for strings, numbers, or images.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add New Column Form */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold text-sm">Add New Column</h3>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label htmlFor="new-column-name">Column Name</Label>
                <Input
                  id="new-column-name"
                  placeholder="e.g., Strategy, Entry Price, Screenshot"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddColumn()
                    }
                  }}
                />
              </div>
              <div className="w-[180px] space-y-2">
                <Label htmlFor="new-column-type">Type</Label>
                <Select value={newColumnType} onValueChange={(v) => setNewColumnType(v as "string" | "number" | "image")}>
                  <SelectTrigger id="new-column-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddColumn} disabled={!newColumnName.trim()}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Existing Columns List */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Existing Columns</h3>
            {columns.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No custom columns yet. Add one above to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {columns.map((column, index) => (
                  <div
                    key={column.columnId}
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="h-6 w-6"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === columns.length - 1}
                        className="h-6 w-6"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>

                    {/* Column Name (editable) */}
                    <div className="flex-1">
                      {editingColumnId === column.columnId ? (
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={() => handleUpdateColumn(column.columnId)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleUpdateColumn(column.columnId)
                            } else if (e.key === "Escape") {
                              setEditingColumnId(null)
                              setEditingName("")
                            }
                          }}
                          autoFocus
                          className="h-8"
                        />
                      ) : (
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => startEditing(column)}
                        >
                          <span className="font-medium">{column.name}</span>
                          <span className="text-xs text-muted-foreground">({column.type})</span>
                        </div>
                      )}
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeleteColumn(column.columnId)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


