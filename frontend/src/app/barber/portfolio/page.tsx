"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectOption } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Plus,
  Upload,
  Calendar,
  Image as ImageIcon,
} from "lucide-react"

interface PortfolioItem {
  id: number
  hairstyle: string
  description: string
  date: string
  customer: string
}

const initialPortfolio: PortfolioItem[] = [
  {
    id: 1,
    hairstyle: "Textured Crop",
    description: "Textured crop dengan skin fade samping dan fringe pendek natural.",
    date: "25 Jul 2026",
    customer: "Pelanggan #A12",
  },
  {
    id: 2,
    hairstyle: "Modern Pompadour",
    description: "Modern pompadour volume tinggi dengan taper fade dan clean line up.",
    date: "20 Jul 2026",
    customer: "Pelanggan #B07",
  },
  {
    id: 3,
    hairstyle: "Buzz Cut Fade",
    description: "Buzz cut rapi dengan high fade dan sharp edge up.",
    date: "18 Jul 2026",
    customer: "Pelanggan #C03",
  },
  {
    id: 4,
    hairstyle: "Disconnected Undercut",
    description: "Disconnected undercut slicked back dengan samping #0 dan atas 5 inch.",
    date: "15 Jul 2026",
    customer: "Pelanggan #D15",
  },
]

const hairstyleOptions = [
  "Textured Crop",
  "Modern Pompadour",
  "Buzz Cut Fade",
  "Disconnected Undercut",
  "French Crop",
  "Crew Cut",
  "Side Part",
  "Quiff",
  "Slicked Back",
  "Man Bun",
]

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState(initialPortfolio)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState({
    hairstyle: "",
    description: "",
  })

  function handleSubmit() {
    if (!form.hairstyle) return
    setPortfolio((prev) => [
      {
        id: prev.length + 1,
        hairstyle: form.hairstyle,
        description: form.description,
        date: "29 Jul 2026",
        customer: `Pelanggan #${String.fromCharCode(65 + prev.length)}${String(prev.length + 1).padStart(2, "0")}`,
      },
      ...prev,
    ])
    setForm({ hairstyle: "", description: "" })
    setDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Portfolio</h2>
          <p className="mt-1 text-muted-foreground">{portfolio.length} hasil karya</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Portfolio
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {portfolio.map((item) => (
          <Card key={item.id}>
            <div className="grid grid-cols-2 gap-0.5">
              <div className="aspect-[4/3] rounded-tl-[20px] bg-muted flex flex-col items-center justify-center gap-1">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Sebelum</span>
              </div>
              <div className="aspect-[4/3] rounded-tr-[20px] bg-muted flex flex-col items-center justify-center gap-1">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Sesudah</span>
              </div>
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">{item.hairstyle}</p>
                <Badge variant="secondary">{item.customer}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {item.date}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[4/3] rounded-[14px] border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Foto Sebelum</span>
              </div>
              <div className="aspect-[4/3] rounded-[14px] border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Foto Sesudah</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gaya Rambut</label>
              <Select
                value={form.hairstyle}
                onChange={(e) => setForm((f) => ({ ...f, hairstyle: e.target.value }))}
              >
                <SelectOption value="">Pilih gaya rambut</SelectOption>
                {hairstyleOptions.map((opt) => (
                  <SelectOption key={opt} value={opt}>{opt}</SelectOption>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi</label>
              <Textarea
                placeholder="Deskripsi teknik dan detail potongan..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
