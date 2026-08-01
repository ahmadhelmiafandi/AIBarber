"use client"

import { useState } from "react"
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
import { Plus, Pencil, UserX } from "lucide-react"

const initialCustomers = [
  { id: 1, name: "Ahmad Rizky", phone: "081234567890", email: "ahmad@email.com", membership: "Gold", status: "Aktif" },
  { id: 2, name: "Budi Santoso", phone: "081298765432", email: "budi@email.com", membership: "Silver", status: "Aktif" },
  { id: 3, name: "Chandra Wijaya", phone: "081355544433", email: "chandra@email.com", membership: "Bronze", status: "Aktif" },
  { id: 4, name: "Dimas Pratama", phone: "081377788899", email: "dimas@email.com", membership: "-", status: "Nonaktif" },
  { id: 5, name: "Eko Saputra", phone: "081399900011", email: "eko@email.com", membership: "Silver", status: "Aktif" },
]

const membershipColor = (m: string) => {
  if (m === "Gold") return "warning"
  if (m === "Silver") return "secondary"
  if (m === "Bronze") return "default"
  return "outline" as const
}

export default function CustomersPage() {
  const [customers] = useState(initialCustomers)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-muted-foreground">Kelola data pelanggan</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />Tambah Customer
        </Button>
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
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell><Badge variant={membershipColor(c.membership)}>{c.membership}</Badge></TableCell>
                  <TableCell>
                    <Badge variant={c.status === "Aktif" ? "success" : "destructive"}>{c.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8"><UserX className="h-3.5 w-3.5" /></Button>
                    </div>
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
            <DialogTitle>Tambah Customer</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama</Label>
              <Input placeholder="Nama lengkap" />
            </div>
            <div className="grid gap-2">
              <Label>Telepon</Label>
              <Input placeholder="08xxxxxxxxxx" />
            </div>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input type="email" placeholder="email@example.com" />
            </div>
            <div className="grid gap-2">
              <Label>Membership</Label>
              <Select>
                <SelectOption value="">Pilih tier</SelectOption>
                <SelectOption value="bronze">Bronze</SelectOption>
                <SelectOption value="silver">Silver</SelectOption>
                <SelectOption value="gold">Gold</SelectOption>
              </Select>
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
