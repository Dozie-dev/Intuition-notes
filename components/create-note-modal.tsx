"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CreateNoteModalProps {
  isOpen: boolean
  onClose: () => void
  walletAddress: string
}

export function CreateNoteModal({ isOpen, onClose, walletAddress }: CreateNoteModalProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both a title and content for your note",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)

    try {
      // Create new note
      const newNote = {
        id: crypto.randomUUID(),
        title: title.trim(),
        content: content.trim(),
        author: walletAddress,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: tags.filter((tag) => tag.trim().length > 0),
      }

      // TODO: Replace with Supabase database save
      // For now, save to localStorage
      const existingNotes = JSON.parse(localStorage.getItem(`notes_${walletAddress}`) || "[]")
      const updatedNotes = [newNote, ...existingNotes]
      localStorage.setItem(`notes_${walletAddress}`, JSON.stringify(updatedNotes))

      toast({
        title: "Note Created",
        description: "Your note has been created successfully",
      })

      // Reset form and close modal
      setTitle("")
      setContent("")
      setTags([])
      setNewTag("")
      onClose()

      // Refresh the page to show the new note
      window.location.reload()
    } catch (error) {
      console.error("Failed to create note:", error)
      toast({
        title: "Error Creating Note",
        description: "Failed to create your note. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const addTag = () => {
    const trimmedTag = newTag.trim()
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const handleClose = () => {
    if (!isCreating) {
      setTitle("")
      setContent("")
      setTags([])
      setNewTag("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Note</DialogTitle>
          <DialogDescription>
            Add a new note to your collection. Your note will be associated with your wallet address.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isCreating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your note content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isCreating}
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleTagKeyPress}
                disabled={isCreating || tags.length >= 5}
              />
              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                disabled={!newTag.trim() || tags.includes(newTag.trim()) || tags.length >= 5}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                      disabled={isCreating}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">{tags.length}/5 tags used</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isCreating}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Note"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
