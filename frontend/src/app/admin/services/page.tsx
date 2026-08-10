"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SearchInput } from "@/components/ui/search-input"
import { Pagination } from "@/components/ui/pagination"
import {
  useAdminServices,
  useCreateServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} from "@/hooks/use-admin"
import { Service } from "@/types/api"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { Plus, Pencil, Clock, Loader2, Trash2 } from "lucide-react"

const formatRp = (n: number) => `Rp ${(n || 0).toLocaleString("id-ID")}`

export default function ServicesPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedService, setSelectedService] = useState<Service | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [price, setPrice] = useState<number | "">(85000)
  const [duration, setDuration] = useState<number | "">(30)
  const [description, setDescription] = useState("")

  const { data: res, isLoading } = useAdminServices({
    page,
    perPage: pageSize,
    search,
  })

  const createMutation = useCreateServiceMutation()
  const updateMutation = useUpdateServiceMutation()
  const deleteMutation = useDeleteServiceMutation()

  const services = res?.data || []
  const meta = res?.meta || { current_page: 1, last_page: 1, total: 0, per_page: 10 }

  const openCreateModal = () => {
    setName("")
    setPrice(85000)
    setDuration(30)
    setDescription("")
    setCreateDialogOpen(true)
  }

  const openEditModal = (s: Service) => {
    setSelectedService(s)
    setName(s.name || "")
    setPrice(s.price || 0)
    setDuration(s.estimated_duration_minutes || 30)
    setDescription(s.description || "")
    setEditDialogOpen(true)
  }

  const openDeleteModal = (s: Service) => {
    setSelectedService(s)
    setDeleteDialogOpen(true)
  }

  const handleCreate = async () => {
    if (!name || !price || !duration) return
    await createMutation.mutateAsync({
      name,
      price: Number(price),
      estimated_duration_minutes: Number(duration),
      description,
    })
    setCreateDialogOpen(false)
  }

  const handleUpdate = async () => {
    if (!selectedService || !name || !price || !duration) return
    await updateMutation.mutateAsync({
      id: selectedService.id,
      payload: {
        name,
        price: Number(price),
        estimated_duration_minutes: Number(duration),
        description,
      },
    })
    setEditDialogOpen(false)
    setSelectedService(null)
  }

  const handleDelete = async () => {
    if (!selectedService) return
    await deleteMutation.mutateAsync(selectedService.id)
    setDeleteDialogOpen(false)
    setSelectedService(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-sm text-muted-foreground">Kelola layanan barbershop dan estimasi durasi</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />Tambah Layanan
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          placeholder="Cari nama atau deskripsi layanan..."
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Layanan</TableHead>
                    <TableHead>Harga</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Estimasi Durasi
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Tidak ada data layanan yang ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    services.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell>{formatRp(s.price)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {s.estimated_duration_minutes || 30} menit
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.is_active ?? true ? "success" : "destructive"}>
                            {s.is_active ?? true ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              title="Edit Layanan"
                              onClick={() => openEditModal(s)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              title="Hapus Layanan"
                              onClick={() => openDeleteModal(s)}
                            >
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

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Layanan Baru</DialogTitle>
            <DialogDescription>Estimasi durasi digunakan oleh Queue Engine untuk perhitungan antrian</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama Layanan</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama layanan" />
            </div>
            <div className="grid gap-2">
              <Label>Harga (Rp)</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")} placeholder="85000" />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                Estimasi Durasi (menit)
              </Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : "")} placeholder="30" className="border-primary/50 text-lg font-mono" />
            </div>
            <div className="grid gap-2">
              <Label>Deskripsi (opsional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi ringkas layanan" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Batal</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Layanan</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama Layanan</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama layanan" />
            </div>
            <div className="grid gap-2">
              <Label>Harga (Rp)</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : "")} placeholder="85000" />
            </div>
            <div className="grid gap-2">
              <Label className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                Estimasi Durasi (menit)
              </Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value ? Number(e.target.value) : "")} placeholder="30" className="border-primary/50 text-lg font-mono" />
            </div>
            <div className="grid gap-2">
              <Label>Deskripsi (opsional)</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi ringkas layanan" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Perbarui
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Hapus Layanan
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus layanan <strong>{selectedService?.name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Hapus Layanan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
