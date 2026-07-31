"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectOption } from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Plus } from "lucide-react"

const initialPortfolio = [
  { id: 1, barber: "Rafi Adriansyah", hairstyle: "Pompadour", description: "Transformasi dari rambut panjang berantakan ke pompadour klasik.", before: "Sebelum", after: "Sesudah" },
  { id: 2, barber: "Gilang Pratama", hairstyle: "Undercut", description: "Clean undercut dengan side part yang rapi.", before: "Sebelum", after: "Sesudah" },
  { id: 3, barber: "Hendra Kurniawan", hairstyle: "French Crop", description: "French crop textured untuk wajah bulat.", before: "Sebelum", after: "Sesudah" },
  { id: 4, barber: "Rafi Adriansyah", hairstyle: "Buzz Cut", description: "Fresh buzz cut #2 all around.", before: "Sebelum", after: "Sesudah" },
]

export default function PortfolioPage() {
  const [portfolio] = useState(initialPortfolio)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-sm text-muted-foreground">Kelola hasil karya barber</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Tambah Portfolio
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {portfolio.map((p) => (
          <Card key={p.id}>
            <CardContent className="p-5">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex h-32 items-center justify-center rounded-[14px] bg-muted text-sm text-muted-foreground">
                  📷 {p.before}
                </div>
                <div className="flex h-32 items-center justify-center rounded-[14px] bg-muted text-sm text-muted-foreground">
                  📷 {p.after}
                </div>
              </div>
              <p className="font-medium">{p.hairstyle}</p>
              <p className="text-xs text-muted-foreground">oleh {p.barber}</p>
              <p className="mt-2 text-sm text-muted-foreground">{p.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Portfolio</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Barber</Label>
              <Select>
                <SelectOption value="">Pilih barber</SelectOption>
                <SelectOption value="rafi">Rafi Adriansyah</SelectOption>
                <SelectOption value="gilang">Gilang Pratama</SelectOption>
                <SelectOption value="hendra">Hendra Kurniawan</SelectOption>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Hairstyle</Label>
              <Input placeholder="Nama gaya rambut" />
            </div>
            <div className="grid gap-2">
              <Label>Foto Sebelum (URL)</Label>
              <Input placeholder="https://..." />
            </div>
            <div className="grid gap-2">
              <Label>Foto Sesudah (URL)</Label>
              <Input placeholder="https://..." />
            </div>
            <div className="grid gap-2">
              <Label>Deskripsi</Label>
              <Textarea placeholder="Deskripsi transformasi" />
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
