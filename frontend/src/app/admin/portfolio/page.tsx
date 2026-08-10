"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectOption } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2 } from "lucide-react"

interface PortfolioItem {
  id: number
  barber: string
  hairstyle: string
  description: string
  before: string
  after: string
}

const initialPortfolio: PortfolioItem[] = [
  { id: 1, barber: "Rafi Adriansyah", hairstyle: "Pompadour", description: "Transformasi dari rambut panjang berantakan ke pompadour klasik.", before: "Sebelum", after: "Sesudah" },
  { id: 2, barber: "Gilang Pratama", hairstyle: "Undercut", description: "Clean undercut dengan side part yang rapi.", before: "Sebelum", after: "Sesudah" },
  { id: 3, barber: "Hendra Kurniawan", hairstyle: "French Crop", description: "French crop textured untuk wajah bulat.", before: "Sebelum", after: "Sesudah" },
  { id: 4, barber: "Rafi Adriansyah", hairstyle: "Buzz Cut", description: "Fresh buzz cut #2 all around.", before: "Sebelum", after: "Sesudah" },
]

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(initialPortfolio)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)

  // Form State
  const [barber, setBarber] = useState("")
  const [hairstyle, setHairstyle] = useState("")
  const [description, setDescription] = useState("")
  const [before, setBefore] = useState("Sebelum")
  const [after, setAfter] = useState("Sesudah")

  const openCreateModal = () => {
    setBarber("Rafi Adriansyah")
    setHairstyle("")
    setDescription("")
    setBefore("Sebelum")
    setAfter("Sesudah")
    setCreateDialogOpen(true)
  }

  const openEditModal = (item: PortfolioItem) => {
    setSelectedItem(item)
    setBarber(item.barber)
    setHairstyle(item.hairstyle)
    setDescription(item.description)
    setBefore(item.before)
    setAfter(item.after)
    setEditDialogOpen(true)
  }

  const openDeleteModal = (item: PortfolioItem) => {
    setSelectedItem(item)
    setDeleteDialogOpen(true)
  }

  const handleCreate = () => {
    if (!hairstyle || !description) return
    const newItem: PortfolioItem = {
      id: Date.now(),
      barber: barber || "Barber",
      hairstyle,
      description,
      before,
      after,
    }
    setPortfolio((prev) => [newItem, ...prev])
    setCreateDialogOpen(false)
  }

  const handleUpdate = () => {
    if (!selectedItem || !hairstyle) return
    setPortfolio((prev) =>
      prev.map((p) =>
        p.id === selectedItem.id
          ? { ...p, barber, hairstyle, description, before, after }
          : p
      )
    )
    setEditDialogOpen(false)
    setSelectedItem(null)
  }

  const handleDelete = () => {
    if (!selectedItem) return
    setPortfolio((prev) => prev.filter((p) => p.id !== selectedItem.id))
    setDeleteDialogOpen(false)
    setSelectedItem(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-sm text-muted-foreground">Kelola hasil karya barber</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />Tambah Portfolio
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {portfolio.map((p) => (
          <Card key={p.id} className="relative group overflow-hidden">
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex h-32 items-center justify-center rounded-[14px] bg-muted text-sm text-muted-foreground">
                  📷 {p.before}
                </div>
                <div className="flex h-32 items-center justify-center rounded-[14px] bg-muted text-sm text-muted-foreground">
                  📷 {p.after}
                </div>
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-foreground">{p.hairstyle}</p>
                  <p className="text-xs text-muted-foreground">oleh {p.barber}</p>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    title="Edit Portfolio"
                    onClick={() => openEditModal(p)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    title="Hapus Portfolio"
                    onClick={() => openDeleteModal(p)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{p.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Portfolio Baru</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Barber</Label>
              <Select value={barber} onChange={(e) => setBarber(e.target.value)}>
                <SelectOption value="Rafi Adriansyah">Rafi Adriansyah</SelectOption>
                <SelectOption value="Gilang Pratama">Gilang Pratama</SelectOption>
                <SelectOption value="Hendra Kurniawan">Hendra Kurniawan</SelectOption>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Gaya Rambut (Hairstyle)</Label>
              <Input value={hairstyle} onChange={(e) => setHairstyle(e.target.value)} placeholder="Contoh: Textured Crop Fade" />
            </div>
            <div className="grid gap-2">
              <Label>Foto Sebelum (URL / Keterangan)</Label>
              <Input value={before} onChange={(e) => setBefore(e.target.value)} placeholder="Sebelum (URL / Keterangan)" />
            </div>
            <div className="grid gap-2">
              <Label>Foto Sesudah (URL / Keterangan)</Label>
              <Input value={after} onChange={(e) => setAfter(e.target.value)} placeholder="Sesudah (URL / Keterangan)" />
            </div>
            <div className="grid gap-2">
              <Label>Deskripsi Transformasi</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi transformasi rambut" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Batal</Button>
            <Button onClick={handleCreate}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Portfolio</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Barber</Label>
              <Select value={barber} onChange={(e) => setBarber(e.target.value)}>
                <SelectOption value="Rafi Adriansyah">Rafi Adriansyah</SelectOption>
                <SelectOption value="Gilang Pratama">Gilang Pratama</SelectOption>
                <SelectOption value="Hendra Kurniawan">Hendra Kurniawan</SelectOption>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Gaya Rambut (Hairstyle)</Label>
              <Input value={hairstyle} onChange={(e) => setHairstyle(e.target.value)} placeholder="Contoh: Pompadour" />
            </div>
            <div className="grid gap-2">
              <Label>Foto Sebelum</Label>
              <Input value={before} onChange={(e) => setBefore(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Foto Sesudah</Label>
              <Input value={after} onChange={(e) => setAfter(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Deskripsi Transformasi</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleUpdate}>Perbarui</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Hapus Portfolio
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus karya portfolio <strong>{selectedItem?.hairstyle}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
