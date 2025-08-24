"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { FileText, Edit, Trash2, Calendar, Search, Filter, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { EditNoteModal } from "@/components/edit-note-modal"

interface Note {
  id: string
  title: string
  content: string
  author: string
  createdAt: Date
  updatedAt: Date
  tags?: string[]
}

interface NotesManagerProps {
  walletAddress: string
}

type SortOption = "newest" | "oldest" | "title-asc" | "title-desc" | "updated"

export function NotesManager({ walletAddress }: NotesManagerProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  // Load notes from localStorage (TODO: Replace with Supabase)
  useEffect(() => {
    const loadNotes = () => {
      try {
        const savedNotes = localStorage.getItem(`notes_${walletAddress}`)
        if (savedNotes) {
          const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
            ...note,
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
            tags: note.tags || [],
          }))
          setNotes(parsedNotes)
        }
      } catch (error) {
        console.error("Failed to load notes:", error)
        toast({
          title: "Error Loading Notes",
          description: "Failed to load your notes from storage",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [walletAddress])

  useEffect(() => {
    let filtered = [...notes]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          (note.tags && note.tags.some((tag) => tag.toLowerCase().includes(query))),
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt.getTime() - a.createdAt.getTime()
        case "oldest":
          return a.createdAt.getTime() - b.createdAt.getTime()
        case "updated":
          return b.updatedAt.getTime() - a.updatedAt.getTime()
        case "title-asc":
          return a.title.localeCompare(b.title)
        case "title-desc":
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })

    setFilteredNotes(filtered)
  }, [notes, searchQuery, sortBy])

  // Save notes to localStorage (TODO: Replace with Supabase)
  const saveNotes = (updatedNotes: Note[]) => {
    try {
      localStorage.setItem(`notes_${walletAddress}`, JSON.stringify(updatedNotes))
      setNotes(updatedNotes)
    } catch (error) {
      console.error("Failed to save notes:", error)
      toast({
        title: "Error Saving Notes",
        description: "Failed to save your notes",
        variant: "destructive",
      })
    }
  }

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId)
    saveNotes(updatedNotes)
    toast({
      title: "Note Deleted",
      description: "Your note has been deleted successfully",
    })
  }

  const handleEditNote = (updatedNote: Note) => {
    const updatedNotes = notes.map((note) =>
      note.id === updatedNote.id ? { ...updatedNote, updatedAt: new Date() } : note,
    )
    saveNotes(updatedNotes)
    setEditingNote(null)
    toast({
      title: "Note Updated",
      description: "Your note has been updated successfully",
    })
  }

  const duplicateNote = (note: Note) => {
    const duplicatedNote: Note = {
      ...note,
      id: crypto.randomUUID(),
      title: `${note.title} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const updatedNotes = [duplicatedNote, ...notes]
    saveNotes(updatedNotes)
    toast({
      title: "Note Duplicated",
      description: "A copy of your note has been created",
    })
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getSortLabel = (option: SortOption) => {
    switch (option) {
      case "newest":
        return "Newest First"
      case "oldest":
        return "Oldest First"
      case "updated":
        return "Recently Updated"
      case "title-asc":
        return "Title A-Z"
      case "title-desc":
        return "Title Z-A"
      default:
        return "Newest First"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4 mb-6">
          <div className="flex-1 h-10 bg-muted rounded animate-pulse" />
          <div className="w-48 h-10 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded" />
                  <div className="h-3 bg-muted rounded w-5/6" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search notes by title, content, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="updated">Recently Updated</SelectItem>
            <SelectItem value="title-asc">Title A-Z</SelectItem>
            <SelectItem value="title-desc">Title Z-A</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {searchQuery && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>
            {filteredNotes.length} of {notes.length} notes
            {searchQuery && ` matching "${searchQuery}"`}
          </span>
        </div>
      )}

      {filteredNotes.length === 0 ? (
        <Card className="p-8 text-center">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">
              {searchQuery ? "No matching notes" : "No Notes Yet"}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? `No notes found matching "${searchQuery}". Try a different search term.`
                : "Create your first note to get started with TRUST Notes."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="hover:shadow-md transition-shadow group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2 pr-2">{note.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingNote(note)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => duplicateNote(note)}>
                        <FileText className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => deleteNote(note.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="flex items-center gap-2 text-xs">
                  <Calendar className="w-3 h-3" />
                  {note.updatedAt.getTime() !== note.createdAt.getTime()
                    ? `Updated ${formatDate(note.updatedAt)}`
                    : `Created ${formatDate(note.createdAt)}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{note.content}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {note.author.slice(0, 6)}...{note.author.slice(-4)}
                  </Badge>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex gap-1">
                      {note.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{note.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {editingNote && (
        <EditNoteModal
          note={editingNote}
          isOpen={!!editingNote}
          onClose={() => setEditingNote(null)}
          onSave={handleEditNote}
        />
      )}
    </div>
  )
}
