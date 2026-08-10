"use client"

import { useState, type ChangeEvent } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectOption } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Upload, ImageIcon } from "lucide-react"

interface PortfolioItem {
  id: number
  barber: string
  hairstyle: string
  description: string
  beforeImg?: string
  afterImg?: string
}

const initialPortfolio: PortfolioItem[] = [
  { id: 1, barber: "Rafi Adriansyah", hairstyle: "Pompadour", description: "Transformasi dari rambut panjang berantakan ke pompadour klasik.", beforeImg: "/images/hairstyles/classic_side_part.png", afterImg: "/images/hairstyles/taper_fade_pompadour.png" },
  { id: 2, barber: "Gilang Pratama", hairstyle: "Undercut", description: "Clean undercut dengan side part yang rapi.", beforeImg: "/images/hairstyles/textured_crop_fade.png", afterImg: "/images/hairstyles/modern_undercut.png" },
  { id: 3, barber: "Hendra Kurniawan", hairstyle: "French Crop", description: "French crop textured untuk wajah bulat.", beforeImg: "/images/hairstyles/buzz_cut.png", afterImg: "/images/hairstyles/textured_crop_fade.png" },
  { id: 4, barber: "Rafi Adriansyah", hairstyle: "Buzz Cut", description: "Fresh buzz cut #2 all around.", beforeImg: "/images/hairstyles/modern_undercut.png", afterImg: "/images/hairstyles/buzz_cut.png" },
]

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>(initialPortfolio)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)

  // Form State
  const [barber, setBarber] = useState("Rafi Adriansyah")
  const [hairstyle, setHairstyle] = useState("")
  const [description, setDescription] = useState("")
  const [beforePreview, setBeforePreview] = useState<string>("")
  const [afterPreview, setAfterPreview] = useState<string>("")

  const handleBeforeFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setBeforePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleAfterFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setAfterPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const openCreateModal = () => {
    setBarber("Rafi Adriansyah")
    setHairstyle("")
    setDescription("")
    setBeforePreview("")
    setAfterPreview("")
    setCreateDialogOpen(true)
  }

  const openEditModal = (item: PortfolioItem) => {
    setSelectedItem(item)
    setBarber(item.barber)
    setHairstyle(item.hairstyle)
    setDescription(item.description)
    setBeforePreview(item.beforeImg || "")
    setAfterPreview(item.afterImg || "")
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
      barber,
      hairstyle,
      description,
      beforeImg: beforePreview || "/images/hairstyles/classic_side_part.png",
      afterImg: afterPreview || "/images/hairstyles/taper_fade_pompadour.png",
    }
    setPortfolio((prev) => [newItem, ...prev])
    setCreateDialogOpen(false)
  }

  const handleUpdate = () => {
    if (!selectedItem || !hairstyle) return
    setPortfolio((prev) =>
      prev.map((p) =>
        p.id === selectedItem.id
          ? {
              ...p,
              barber,
              hairstyle,
              description,
              beforeImg: beforePreview || p.beforeImg,
              afterImg: afterPreview || p.afterImg,
            }
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
          <p className="text-sm text-muted-foreground">Kelola portofolio dan hasil karya barber</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />Tambah Portfolio
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {portfolio.map((p) => (
          <Card key={p.id} className="relative group overflow-hidden border-border/80 hover:border-primary/40 transition-all">
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="relative h-36 rounded-[14px] overflow-hidden bg-slate-900 border border-border flex items-center justify-center">
                  {p.beforeImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.beforeImg} alt="Sebelum" className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" /> Sebelum
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-black/70 text-white px-2 py-0.5 rounded-full backdrop-blur-md">
                    Sebelum
                  </span>
                </div>

                <div className="relative h-36 rounded-[14px] overflow-hidden bg-slate-900 border border-border flex items-center justify-center">
                  {p.afterImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.afterImg} alt="Sesudah" className="w-full h-full object-cover object-top" />
                  ) : (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" /> Sesudah
                    </div>
                  )}
                  <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full shadow-sm">
                    Sesudah
                  </span>
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Tambah Karya Portfolio Baru</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Dropzone Sebelum */}
              <div className="grid gap-2">
                <Label>Upload Foto Sebelum</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-3 text-center bg-muted/20 hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBeforeFileChange}
                    className="hidden"
                    id="before-upload-create"
                  />
                  <label htmlFor="before-upload-create" className="cursor-pointer flex flex-col items-center justify-center gap-1.5 min-h-[110px]">
                    {beforePreview ? (
                      <div className="relative h-24 w-full rounded-lg overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={beforePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-xs font-medium text-primary">Pilih Foto Sebelum</span>
                        <span className="text-[10px] text-muted-foreground">PNG, JPG, WEBP</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Dropzone Sesudah */}
              <div className="grid gap-2">
                <Label>Upload Foto Sesudah</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-3 text-center bg-muted/20 hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAfterFileChange}
                    className="hidden"
                    id="after-upload-create"
                  />
                  <label htmlFor="after-upload-create" className="cursor-pointer flex flex-col items-center justify-center gap-1.5 min-h-[110px]">
                    {afterPreview ? (
                      <div className="relative h-24 w-full rounded-lg overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={afterPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-xs font-medium text-primary">Pilih Foto Sesudah</span>
                        <span className="text-[10px] text-muted-foreground">PNG, JPG, WEBP</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Barber Pemotong</Label>
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
              <Label>Deskripsi Transformasi</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Penjelasan transformasi rambut" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Batal</Button>
            <Button onClick={handleCreate}>Simpan Portfolio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Portfolio</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Dropzone Sebelum */}
              <div className="grid gap-2">
                <Label>Foto Sebelum</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-3 text-center bg-muted/20 hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleBeforeFileChange}
                    className="hidden"
                    id="before-upload-edit"
                  />
                  <label htmlFor="before-upload-edit" className="cursor-pointer flex flex-col items-center justify-center gap-1.5 min-h-[110px]">
                    {beforePreview ? (
                      <div className="relative h-24 w-full rounded-lg overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={beforePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-xs font-medium text-primary">Ganti Foto Sebelum</span>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Dropzone Sesudah */}
              <div className="grid gap-2">
                <Label>Foto Sesudah</Label>
                <div className="border-2 border-dashed border-border rounded-xl p-3 text-center bg-muted/20 hover:border-primary transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAfterFileChange}
                    className="hidden"
                    id="after-upload-edit"
                  />
                  <label htmlFor="after-upload-edit" className="cursor-pointer flex flex-col items-center justify-center gap-1.5 min-h-[110px]">
                    {afterPreview ? (
                      <div className="relative h-24 w-full rounded-lg overflow-hidden border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={afterPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                        <span className="text-xs font-medium text-primary">Ganti Foto Sesudah</span>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Barber Pemotong</Label>
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
