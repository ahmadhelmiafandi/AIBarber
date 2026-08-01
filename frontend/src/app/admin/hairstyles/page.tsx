"use client"

import { useState, type ChangeEvent } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectOption } from "@/components/ui/select"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Upload, Scissors } from "lucide-react"

interface HairstyleItem {
  id: number
  name: string
  category: string
  length: string
  maintenance: string
  difficulty: string
  faceShapes: string
  image: string
}

const initialHairstyles: HairstyleItem[] = [
  { id: 1, name: "Textured Crop Fade", category: "Textured & Fade", length: "Pendek", maintenance: "Sedang", difficulty: "Sedang", faceShapes: "Oval, Square, Diamond", image: "/images/hairstyles/textured_crop_fade.png" },
  { id: 2, name: "Classic Side Part Undercut", category: "Classic Side Part", length: "Sedang", maintenance: "Rendah", difficulty: "Mudah", faceShapes: "Round, Oval, Heart", image: "/images/hairstyles/classic_side_part.png" },
  { id: 3, name: "Taper Fade Pompadour", category: "Textured & Fade", length: "Sedang", maintenance: "Tinggi", difficulty: "Sulit", faceShapes: "Square, Oval", image: "/images/hairstyles/taper_fade_pompadour.png" },
  { id: 4, name: "French Crop with Line-Up", category: "Modern Crop", length: "Pendek", maintenance: "Rendah", difficulty: "Mudah", faceShapes: "Oval, Diamond, Square", image: "/images/hairstyles/french_crop_lineup.png" },
  { id: 5, name: "Buzz Cut Taper", category: "Buzz & Taper", length: "Sangat Pendek", maintenance: "Rendah", difficulty: "Mudah", faceShapes: "Oval, Square", image: "/images/hairstyles/buzz_cut_taper.png" },
  { id: 6, name: "Slicked Back Low Fade", category: "Classic Side Part", length: "Panjang", maintenance: "Sedang", difficulty: "Sedang", faceShapes: "Oval, Heart, Square", image: "/images/hairstyles/slicked_back_low_fade.png" },
]

export default function HairstylesPage() {
  const [hairstyles, setHairstyles] = useState<HairstyleItem[]>(initialHairstyles)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<HairstyleItem | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "Textured & Fade",
    length: "Pendek",
    maintenance: "Sedang",
    difficulty: "Sedang",
    faceShapes: "Oval, Square",
    image: "/images/hairstyles/textured_crop_fade.png",
  })
  const [previewImage, setPreviewImage] = useState<string>("")

  function handleOpenCreate() {
    setEditingItem(null)
    setFormData({
      name: "",
      category: "Textured & Fade",
      length: "Pendek",
      maintenance: "Sedang",
      difficulty: "Sedang",
      faceShapes: "Oval, Square",
      image: "/images/hairstyles/textured_crop_fade.png",
    })
    setPreviewImage("/images/hairstyles/textured_crop_fade.png")
    setDialogOpen(true)
  }

  function handleOpenEdit(item: HairstyleItem) {
    setEditingItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      length: item.length,
      maintenance: item.maintenance,
      difficulty: item.difficulty,
      faceShapes: item.faceShapes,
      image: item.image,
    })
    setPreviewImage(item.image)
    setDialogOpen(true)
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setPreviewImage(result)
        setFormData((prev) => ({ ...prev, image: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  function handleSave() {
    if (!formData.name.trim()) return

    if (editingItem) {
      setHairstyles((prev) =>
        prev.map((item) =>
          item.id === editingItem.id ? { ...item, ...formData } : item
        )
      )
    } else {
      const newItem: HairstyleItem = {
        id: Date.now(),
        ...formData,
      }
      setHairstyles((prev) => [newItem, ...prev])
    }

    setDialogOpen(false)
  }

  function handleDelete(id: number) {
    if (confirm("Apakah Anda yakin ingin menghapus model gaya rambut ini?")) {
      setHairstyles((prev) => prev.filter((item) => item.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Katalog Gaya Rambut (Portofolio)</h1>
          <p className="text-sm text-muted-foreground">Kelola portofolio, gambar foto, dan kategori gaya rambut</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />Tambah Hairstyle
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto Portofolio</TableHead>
                <TableHead>Nama Gaya</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Panjang</TableHead>
                <TableHead>Maintenance</TableHead>
                <TableHead>Bentuk Wajah</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hairstyles.map((h) => (
                <TableRow key={h.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-border bg-slate-900 flex items-center justify-center">
                      {h.image.startsWith("/") || h.image.startsWith("data:") ? (
                        <Image
                          src={h.image}
                          alt={h.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Scissors className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold text-foreground">{h.name}</TableCell>
                  <TableCell><Badge variant="outline">{h.category}</Badge></TableCell>
                  <TableCell>{h.length}</TableCell>
                  <TableCell>{h.maintenance}</TableCell>
                  <TableCell className="max-w-[180px] text-xs text-muted-foreground">{h.faceShapes}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(h)}>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600" onClick={() => handleDelete(h.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Gaya Rambut" : "Tambah Gaya Rambut Baru"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* File Upload Dropzone */}
            <div className="grid gap-2">
              <Label>Upload Foto Gaya Rambut (Bukan URL)</Label>
              <div className="border-2 border-dashed border-border rounded-2xl p-4 text-center bg-muted/30 hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  id="hairstyle-file-upload"
                />
                <label htmlFor="hairstyle-file-upload" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                  {previewImage ? (
                    <div className="relative h-32 w-32 rounded-xl overflow-hidden border border-border shadow-md">
                      <Image
                        src={previewImage}
                        alt="Preview Foto"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Upload className="h-6 w-6" />
                    </div>
                  )}
                  <span className="text-xs font-semibold text-primary">Klik di sini untuk upload foto dari laptop/HP</span>
                  <span className="text-[11px] text-muted-foreground">Format: PNG, JPG, WEBP</span>
                </label>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Nama Gaya Rambut</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Contoh: Textured Crop Fade"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Kategori</Label>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                >
                  <SelectOption value="Textured & Fade">Textured & Fade</SelectOption>
                  <SelectOption value="Classic Side Part">Classic Side Part</SelectOption>
                  <SelectOption value="Modern Crop">Modern Crop</SelectOption>
                  <SelectOption value="Buzz & Taper">Buzz & Taper</SelectOption>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Panjang</Label>
                <Select
                  value={formData.length}
                  onChange={(e) => setFormData((p) => ({ ...p, length: e.target.value }))}
                >
                  <SelectOption value="Sangat Pendek">Sangat Pendek</SelectOption>
                  <SelectOption value="Pendek">Pendek</SelectOption>
                  <SelectOption value="Sedang">Sedang</SelectOption>
                  <SelectOption value="Panjang">Panjang</SelectOption>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Maintenance</Label>
                <Select
                  value={formData.maintenance}
                  onChange={(e) => setFormData((p) => ({ ...p, maintenance: e.target.value }))}
                >
                  <SelectOption value="Rendah">Rendah</SelectOption>
                  <SelectOption value="Sedang">Sedang</SelectOption>
                  <SelectOption value="Tinggi">Tinggi</SelectOption>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Kesulitan</Label>
                <Select
                  value={formData.difficulty}
                  onChange={(e) => setFormData((p) => ({ ...p, difficulty: e.target.value }))}
                >
                  <SelectOption value="Mudah">Mudah</SelectOption>
                  <SelectOption value="Sedang">Sedang</SelectOption>
                  <SelectOption value="Sulit">Sulit</SelectOption>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Bentuk Wajah yang Cocok</Label>
              <Input
                value={formData.faceShapes}
                onChange={(e) => setFormData((p) => ({ ...p, faceShapes: e.target.value }))}
                placeholder="Oval, Square, Diamond"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan Portofolio</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
