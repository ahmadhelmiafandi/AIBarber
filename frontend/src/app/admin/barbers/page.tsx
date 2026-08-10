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
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Pencil, Star, Loader2 } from "lucide-react"
import { useAdminBarbers } from "@/hooks/use-admin"

export default function BarbersPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: res, isLoading } = useAdminBarbers({
    page,
    perPage: pageSize,
    search,
  })

  const barbersList = res?.data || []
  const meta = res?.meta || { current_page: 1, last_page: 1, total: 0, per_page: 10 }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Barbers</h1>
          <p className="text-sm text-muted-foreground">Kelola data barber dan spesialisasi</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
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
              <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
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
                            <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Barber</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama Barber</Label>
              <Input placeholder="Nama barber" />
            </div>
            <div className="grid gap-2">
              <Label>Cabang</Label>
              <Select>
                <SelectOption value="">Pilih cabang</SelectOption>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Spesialisasi</Label>
              <Input placeholder="Fade, Pompadour, dll" />
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
