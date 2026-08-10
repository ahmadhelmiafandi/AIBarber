"use client"

import { useState, type ChangeEvent } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectOption } from "@/components/ui/select"
import { SearchInput } from "@/components/ui/search-input"
import { Pagination } from "@/components/ui/pagination"
import { useAdminHairstyles } from "@/hooks/use-admin"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Pencil, Trash2, Upload, Scissors, Loader2 } from "lucide-react"

export default function HairstylesPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>("")

  const { data: res, isLoading } = useAdminHairstyles({
    page,
    perPage: pageSize,
    search,
  })

  const hairstylesList = res?.data || []
  const meta = res?.meta || { current_page: 1, last_page: 1, total: 0, per_page: 10 }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Katalog Gaya Rambut (Portofolio)</h1>
          <p className="text-sm text-muted-foreground">Kelola portofolio, gambar foto, dan pencarian gaya rambut</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Tambah Hairstyle
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          placeholder="Cari gaya rambut, kategori, atau deskripsi..."
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Foto Portofolio</TableHead>
                    <TableHead>Nama Gaya</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Maintenance</TableHead>
                    <TableHead>Kesulitan</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hairstylesList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Tidak ada gaya rambut yang ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    hairstylesList.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell>
                          <div className="relative h-12 w-12 overflow-hidden rounded-xl border border-border bg-slate-900 flex items-center justify-center">
                            <Scissors className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-foreground">{h.name}</TableCell>
                        <TableCell><Badge variant="outline">{h.category || "General"}</Badge></TableCell>
                        <TableCell>{h.maintenance_level || "Sedang"}</TableCell>
                        <TableCell>{h.difficulty || "Sedang"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination Footer */}
              <div className="border-t px-4 py-2">
                <Pagination
                  currentPage={meta.current_page}
                  totalPages={meta.last_page}
                  totalItems={meta.total}
                  pageSize={meta.per_page}
                  onPageChange={(p) => setPage(p)}
                  onPageSizeChange={(sz) => {
                    setPageSize(sz)
                    setPage(1)
                  }}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Tambah Gaya Rambut Baru</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Upload Foto Gaya Rambut</Label>
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
                  <span className="text-xs font-semibold text-primary">Klik di sini untuk upload foto</span>
                  <span className="text-[11px] text-muted-foreground">Format: PNG, JPG, WEBP</span>
                </label>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Nama Gaya Rambut</Label>
              <Input placeholder="Contoh: Textured Crop Fade" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Kategori</Label>
                <Select>
                  <SelectOption value="Textured & Fade">Textured & Fade</SelectOption>
                  <SelectOption value="Classic Side Part">Classic Side Part</SelectOption>
                  <SelectOption value="Modern Crop">Modern Crop</SelectOption>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Kesulitan</Label>
                <Select>
                  <SelectOption value="Mudah">Mudah</SelectOption>
                  <SelectOption value="Sedang">Sedang</SelectOption>
                  <SelectOption value="Sulit">Sulit</SelectOption>
                </Select>
              </div>
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
