"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Plus, Pencil } from "lucide-react"

const initialBranches = [
  { id: 1, name: "Cabang Kemang", address: "Jl. Kemang Raya No. 12, Jakarta Selatan", phone: "021-71234567", hours: "09:00 - 21:00", status: "Buka" },
  { id: 2, name: "Cabang Menteng", address: "Jl. Menteng Raya No. 45, Jakarta Pusat", phone: "021-31234567", hours: "10:00 - 22:00", status: "Buka" },
  { id: 3, name: "Cabang BSD", address: "Ruko BSD Junction Blok A No. 8, Tangerang", phone: "021-51234567", hours: "09:00 - 20:00", status: "Tutup" },
]

export default function BranchesPage() {
  const [branches] = useState(initialBranches)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Branches</h1>
          <p className="text-sm text-muted-foreground">Kelola cabang barbershop</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Tambah Cabang
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Alamat</TableHead>
                <TableHead>Telepon</TableHead>
                <TableHead>Jam Operasional</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.name}</TableCell>
                  <TableCell className="max-w-[250px] text-muted-foreground">{b.address}</TableCell>
                  <TableCell>{b.phone}</TableCell>
                  <TableCell>{b.hours}</TableCell>
                  <TableCell>
                    <Badge variant={b.status === "Buka" ? "success" : "destructive"}>{b.status}</Badge>
                  </TableCell>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Cabang</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama Cabang</Label>
              <Input placeholder="Nama cabang" />
            </div>
            <div className="grid gap-2">
              <Label>Alamat</Label>
              <Input placeholder="Alamat lengkap" />
            </div>
            <div className="grid gap-2">
              <Label>Telepon</Label>
              <Input placeholder="021-xxxxxxx" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Jam Buka</Label>
                <Input placeholder="09:00" />
              </div>
              <div className="grid gap-2">
                <Label>Jam Tutup</Label>
                <Input placeholder="21:00" />
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
