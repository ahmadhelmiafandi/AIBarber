"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectOption } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Pencil } from "lucide-react"

const initialHairstyles = [
  { id: 1, name: "French Crop", category: "Pendek", length: "Pendek", maintenance: "Rendah", difficulty: "Mudah", faceShapes: "Round, Oval", image: "🧑" },
  { id: 2, name: "Pompadour", category: "Klasik", length: "Sedang", maintenance: "Tinggi", difficulty: "Sulit", faceShapes: "Oval, Persegi", image: "💇" },
  { id: 3, name: "Undercut", category: "Modern", length: "Pendek-Sedang", maintenance: "Sedang", difficulty: "Sedang", faceShapes: "Oval, Heart", image: "✂️" },
  { id: 4, name: "Buzz Cut", category: "Pendek", length: "Sangat Pendek", maintenance: "Rendah", difficulty: "Mudah", faceShapes: "Oval, Persegi", image: "👨" },
  { id: 5, name: "Textured Crop", category: "Modern", length: "Pendek", maintenance: "Sedang", difficulty: "Sedang", faceShapes: "Round, Oval, Heart", image: "💈" },
  { id: 6, name: "Mullet", category: "Retro", length: "Panjang", maintenance: "Sedang", difficulty: "Sulit", faceShapes: "Oval, Oblong", image: "🎸" },
]

export default function HairstylesPage() {
  const [hairstyles] = useState(initialHairstyles)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hairstyles</h1>
          <p className="text-sm text-muted-foreground">Kelola katalog gaya rambut</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Tambah Hairstyle
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gambar</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Panjang</TableHead>
                <TableHead>Maintenance</TableHead>
                <TableHead>Kesulitan</TableHead>
                <TableHead>Bentuk Wajah</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hairstyles.map((h) => (
                <TableRow key={h.id}>
                  <TableCell>
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-muted text-lg">
                      {h.image}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{h.name}</TableCell>
                  <TableCell><Badge variant="outline">{h.category}</Badge></TableCell>
                  <TableCell>{h.length}</TableCell>
                  <TableCell>{h.maintenance}</TableCell>
                  <TableCell>{h.difficulty}</TableCell>
                  <TableCell className="max-w-[150px] text-xs text-muted-foreground">{h.faceShapes}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
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
            <DialogTitle>Tambah Hairstyle</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama</Label>
              <Input placeholder="Nama gaya rambut" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Kategori</Label>
                <Select>
                  <SelectOption value="">Pilih kategori</SelectOption>
                  <SelectOption value="pendek">Pendek</SelectOption>
                  <SelectOption value="klasik">Klasik</SelectOption>
                  <SelectOption value="modern">Modern</SelectOption>
                  <SelectOption value="retro">Retro</SelectOption>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Panjang</Label>
                <Select>
                  <SelectOption value="">Pilih panjang</SelectOption>
                  <SelectOption value="sangat-pendek">Sangat Pendek</SelectOption>
                  <SelectOption value="pendek">Pendek</SelectOption>
                  <SelectOption value="sedang">Sedang</SelectOption>
                  <SelectOption value="panjang">Panjang</SelectOption>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Maintenance</Label>
                <Select>
                  <SelectOption value="">Pilih level</SelectOption>
                  <SelectOption value="rendah">Rendah</SelectOption>
                  <SelectOption value="sedang">Sedang</SelectOption>
                  <SelectOption value="tinggi">Tinggi</SelectOption>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Kesulitan</Label>
                <Select>
                  <SelectOption value="">Pilih level</SelectOption>
                  <SelectOption value="mudah">Mudah</SelectOption>
                  <SelectOption value="sedang">Sedang</SelectOption>
                  <SelectOption value="sulit">Sulit</SelectOption>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Bentuk Wajah yang Cocok</Label>
              <Input placeholder="Round, Oval, Heart, dll" />
            </div>
            <div className="grid gap-2">
              <Label>Bentuk Wajah yang Tidak Cocok</Label>
              <Input placeholder="Square, Oblong, dll" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={() => setDialogOpen(false)}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
