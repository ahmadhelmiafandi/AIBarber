"use client"

import { useState, type ChangeEvent } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Upload, Tag } from "lucide-react"

interface PromoItem {
  id: number
  name: string
  discount: string
  expiry: string
  status: string
  bannerImg?: string
}

const initialPromos: PromoItem[] = [
  { id: 1, name: "Grand Opening Diskon 30%", discount: "30%", expiry: "2026-08-31", status: "Aktif", bannerImg: "" },
  { id: 2, name: "Member Gold Free Hair Wash", discount: "100% Hair Wash", expiry: "2026-12-31", status: "Aktif", bannerImg: "" },
  { id: 3, name: "Promo Weekday 20%", discount: "20%", expiry: "2026-09-30", status: "Nonaktif", bannerImg: "" },
]

export default function PromotionsPage() {
  const [promos, setPromos] = useState<PromoItem[]>(initialPromos)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPromo, setSelectedPromo] = useState<PromoItem | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [discount, setDiscount] = useState("")
  const [expiry, setExpiry] = useState("")
  const [status, setStatus] = useState("Aktif")
  const [bannerPreview, setBannerPreview] = useState<string>("")

  const handleBannerUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setBannerPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const openCreateModal = () => {
    setName("")
    setDiscount("")
    setExpiry("2026-08-31")
    setStatus("Aktif")
    setBannerPreview("")
    setCreateDialogOpen(true)
  }

  const openEditModal = (p: PromoItem) => {
    setSelectedPromo(p)
    setName(p.name)
    setDiscount(p.discount)
    setExpiry(p.expiry)
    setStatus(p.status)
    setBannerPreview(p.bannerImg || "")
    setEditDialogOpen(true)
  }

  const openDeleteModal = (p: PromoItem) => {
    setSelectedPromo(p)
    setDeleteDialogOpen(true)
  }

  const handleCreate = () => {
    if (!name || !discount) return
    const newP: PromoItem = {
      id: Date.now(),
      name,
      discount,
      expiry,
      status,
      bannerImg: bannerPreview,
    }
    setPromos((prev) => [newP, ...prev])
    setCreateDialogOpen(false)
  }

  const handleUpdate = () => {
    if (!selectedPromo || !name) return
    setPromos((prev) =>
      prev.map((item) =>
        item.id === selectedPromo.id
          ? { ...item, name, discount, expiry, status, bannerImg: bannerPreview }
          : item
      )
    )
    setEditDialogOpen(false)
    setSelectedPromo(null)
  }

  const handleDelete = () => {
    if (!selectedPromo) return
    setPromos((prev) => prev.filter((item) => item.id !== selectedPromo.id))
    setDeleteDialogOpen(false)
    setSelectedPromo(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Promotions</h1>
          <p className="text-sm text-muted-foreground">Kelola promo, banner, dan diskon barbershop</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />Tambah Promo
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Banner</TableHead>
                <TableHead>Nama Promo</TableHead>
                <TableHead>Diskon</TableHead>
                <TableHead>Berlaku Sampai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promos.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="relative h-10 w-16 overflow-hidden rounded-[10px] bg-slate-900 border border-border flex items-center justify-center">
                      {p.bannerImg ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.bannerImg} alt="Banner" className="w-full h-full object-cover" />
                      ) : (
                        <Tag className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell><Badge variant="outline">{p.discount}</Badge></TableCell>
                  <TableCell>{p.expiry}</TableCell>
                  <TableCell>
                    <Badge variant={p.status === "Aktif" ? "success" : "secondary"}>{p.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Edit Promo"
                        onClick={() => openEditModal(p)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        title="Hapus Promo"
                        onClick={() => openDeleteModal(p)}
                      >
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

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Promo Baru</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* File Upload Dropzone */}
            <div className="grid gap-2">
              <Label>Upload Banner Promo</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-4 text-center bg-muted/20 hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                  id="promo-banner-create"
                />
                <label htmlFor="promo-banner-create" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                  {bannerPreview ? (
                    <div className="relative h-28 w-full rounded-lg overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bannerPreview} alt="Preview Banner" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-primary" />
                      <span className="text-xs font-semibold text-primary">Klik di sini untuk upload banner</span>
                      <span className="text-[10px] text-muted-foreground">Format: PNG, JPG, WEBP</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Nama Promo</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Grand Opening Diskon 30%" />
            </div>

            <div className="grid gap-2">
              <Label>Diskon</Label>
              <Input value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="30% atau Free Hair Wash" />
            </div>

            <div className="grid gap-2">
              <Label>Berlaku Sampai</Label>
              <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Batal</Button>
            <Button onClick={handleCreate}>Simpan Promo</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Promo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Upload Banner Promo</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-4 text-center bg-muted/20 hover:border-primary transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                  id="promo-banner-edit"
                />
                <label htmlFor="promo-banner-edit" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                  {bannerPreview ? (
                    <div className="relative h-28 w-full rounded-lg overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bannerPreview} alt="Preview Banner" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <>
                      <Upload className="h-6 w-6 text-primary" />
                      <span className="text-xs font-semibold text-primary">Ganti banner promo</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Nama Promo</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>Diskon</Label>
              <Input value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>

            <div className="grid gap-2">
              <Label>Berlaku Sampai</Label>
              <Input type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
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
              Hapus Promo
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus promo <strong>{selectedPromo?.name}</strong>?
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
