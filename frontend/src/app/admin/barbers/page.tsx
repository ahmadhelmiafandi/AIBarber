"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectOption } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SearchInput } from "@/components/ui/search-input"
import { Pagination } from "@/components/ui/pagination"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { Plus, Pencil, Star, Loader2, Trash2 } from "lucide-react"
import { useAdminBarbers, useCreateBarberMutation, useAdminBranches } from "@/hooks/use-admin"
import { Barber } from "@/types/api"

export default function BarbersPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)

  // Form State
  const [specialization, setSpecialization] = useState("")
  const [branchId, setBranchId] = useState("")
  const [isActive, setIsActive] = useState(true)

  const { data: res, isLoading } = useAdminBarbers({
    page,
    perPage: pageSize,
    search,
  })

  const { data: branches = [] } = useAdminBranches()
  const createMutation = useCreateBarberMutation()

  const barbersList = res?.data || []
  const meta = res?.meta || { current_page: 1, last_page: 1, total: 0, per_page: 10 }

  const openCreateModal = () => {
    setSpecialization("")
    if (branches.length > 0) setBranchId(branches[0].id)
    setIsActive(true)
    setCreateDialogOpen(true)
  }

  const openEditModal = (b: Barber) => {
    setSelectedBarber(b)
    setSpecialization(b.specialization || "")
    setBranchId(b.branch_id || "")
    setIsActive(b.is_active ?? true)
    setEditDialogOpen(true)
  }

  const openDeleteModal = (b: Barber) => {
    setSelectedBarber(b)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Barbers</h1>
          <p className="text-sm text-muted-foreground">Kelola data barber dan spesialisasi</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />Tambah Barber
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          placeholder="Cari nama barber atau keahlian..."
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
                    <TableHead>Foto</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Cabang</TableHead>
                    <TableHead>Spesialisasi</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {barbersList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Tidak ada data barber yang ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    barbersList.map((b) => {
                      const name = b.user?.name || "Barber"
                      const initials = name.substring(0, 2).toUpperCase()
                      return (
                        <TableRow key={b.id}>
                          <TableCell>
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{name}</TableCell>
                          <TableCell>{b.branch?.name || "Cabang Utama"}</TableCell>
                          <TableCell className="text-muted-foreground">{b.specialization || "General Haircut"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                              {b.rating || 4.8}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={b.is_active ? "success" : "warning"}>
                              {b.is_active ? "Aktif" : "Nonaktif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                title="Edit Barber"
                                onClick={() => openEditModal(b)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                title="Hapus Barber"
                                onClick={() => openDeleteModal(b)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
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
            <DialogTitle>Tambah Barber Baru</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Spesialisasi</Label>
              <Input value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Contoh: Fade, Pompadour, Beard Trim" />
            </div>
            <div className="grid gap-2">
              <Label>Cabang</Label>
              <Select value={branchId} onChange={(e) => setBranchId(e.target.value)}>
                {branches.map((br) => (
                  <SelectOption key={br.id} value={br.id}>{br.name}</SelectOption>
                ))}
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Batal</Button>
            <Button onClick={() => setCreateDialogOpen(false)}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Barber</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Spesialisasi</Label>
              <Input value={specialization} onChange={(e) => setSpecialization(e.target.value)} placeholder="Fade, Pompadour" />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={isActive ? "active" : "inactive"} onChange={(e) => setIsActive(e.target.value === "active")}>
                <SelectOption value="active">Aktif</SelectOption>
                <SelectOption value="inactive">Nonaktif</SelectOption>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Batal</Button>
            <Button onClick={() => setEditDialogOpen(false)}>Perbarui</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Hapus Barber
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data barber <strong>{selectedBarber?.user?.name || "ini"}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={() => setDeleteDialogOpen(false)}>Hapus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
