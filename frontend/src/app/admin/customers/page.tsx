"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectOption } from "@/components/ui/select"
import { SearchInput } from "@/components/ui/search-input"
import { Pagination } from "@/components/ui/pagination"
import {
  useAdminCustomers,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} from "@/hooks/use-admin"
import { User } from "@/types/api"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import { Plus, Pencil, UserX, Loader2, Trash2 } from "lucide-react"

const membershipColor = (m?: string) => {
  if (!m) return "outline" as const
  const lower = m.toLowerCase()
  if (lower.includes("gold")) return "warning" as const
  if (lower.includes("silver")) return "secondary" as const
  if (lower.includes("bronze")) return "default" as const
  return "outline" as const
}

export default function CustomersPage() {
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Dialog States
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [custStatus, setCustStatus] = useState("active")

  const { data, isLoading } = useAdminCustomers({
    page,
    perPage: pageSize,
    search,
    status,
  })

  const createMutation = useCreateCustomerMutation()
  const updateMutation = useUpdateCustomerMutation()
  const deleteMutation = useDeleteCustomerMutation()

  const customers = data?.data || []
  const meta = data?.meta || { current_page: 1, last_page: 1, total: 0, per_page: 10 }

  const openCreateModal = () => {
    setName("")
    setEmail("")
    setPhone("")
    setCustStatus("active")
    setCreateDialogOpen(true)
  }

  const openEditModal = (c: User) => {
    setSelectedCustomer(c)
    setName(c.name || "")
    setEmail(c.email || "")
    setPhone(c.phone || "")
    setCustStatus(c.status || "active")
    setEditDialogOpen(true)
  }

  const openDeleteModal = (c: User) => {
    setSelectedCustomer(c)
    setDeleteDialogOpen(true)
  }

  const handleCreate = async () => {
    if (!name || !email) return
    await createMutation.mutateAsync({ name, email, phone, status: custStatus })
    setCreateDialogOpen(false)
  }

  const handleUpdate = async () => {
    if (!selectedCustomer || !name || !email) return
    await updateMutation.mutateAsync({
      id: selectedCustomer.id,
      payload: { name, email, phone, status: custStatus },
    })
    setEditDialogOpen(false)
    setSelectedCustomer(null)
  }

  const handleDelete = async () => {
    if (!selectedCustomer) return
    await deleteMutation.mutateAsync(selectedCustomer.id)
    setDeleteDialogOpen(false)
    setSelectedCustomer(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">Kelola data pelanggan dan keanggotaan</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />Tambah Customer
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={(val) => {
            setSearch(val)
            setPage(1)
          }}
          placeholder="Cari nama, email, atau telepon..."
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value)
              setPage(1)
            }}
            className="w-full sm:w-40 h-9 text-xs"
          >
            <SelectOption value="">Semua Status</SelectOption>
            <SelectOption value="active">Aktif</SelectOption>
            <SelectOption value="inactive">Nonaktif</SelectOption>
            <SelectOption value="suspended">Ditangguhkan</SelectOption>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Membership</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-primary" />
                    Memuat data customer...
                  </TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Tidak ada data customer yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>{c.phone || "-"}</TableCell>
                    <TableCell>{c.email}</TableCell>
                    <TableCell>
                      <Badge variant={membershipColor(c.membership?.tier)}>
                        {c.membership?.tier ? c.membership.tier.toUpperCase() : "REGULAR"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.status === "active" ? "success" : "destructive"}>
                        {c.status === "active" ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit Customer"
                          onClick={() => openEditModal(c)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title="Hapus / Nonaktifkan"
                          onClick={() => openDeleteModal(c)}
                        >
                          <UserX className="h-3.5 w-3.5" />
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
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Customer Baru</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" />
            </div>
            <div className="grid gap-2">
              <Label>Telepon</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={custStatus} onChange={(e) => setCustStatus(e.target.value)}>
                <SelectOption value="active">Aktif</SelectOption>
                <SelectOption value="inactive">Nonaktif</SelectOption>
                <SelectOption value="suspended">Ditangguhkan</SelectOption>
              </Select>
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
            <DialogTitle>Edit Data Customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap" />
            </div>
            <div className="grid gap-2">
              <Label>Telepon</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xxxxxxxxxx" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
            </div>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={custStatus} onChange={(e) => setCustStatus(e.target.value)}>
                <SelectOption value="active">Aktif</SelectOption>
                <SelectOption value="inactive">Nonaktif</SelectOption>
                <SelectOption value="suspended">Ditangguhkan</SelectOption>
              </Select>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Hapus Customer
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus data customer <strong>{selectedCustomer?.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Hapus Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
