"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Pencil } from "lucide-react"

const tiers = [
  { id: 1, name: "Bronze", benefits: "Poin reward, akses booking online", discount: "5%", price: "Gratis" },
  { id: 2, name: "Silver", benefits: "Bronze + prioritas antrian, birthday reward", discount: "10%", price: "Rp 50.000/bln" },
  { id: 3, name: "Gold", benefits: "Silver + free hair wash, eksklusif promo, personal barber", discount: "15%", price: "Rp 100.000/bln" },
]

const tierColor = (name: string) => {
  if (name === "Gold") return "warning"
  if (name === "Silver") return "secondary"
  return "default" as const
}

export default function MembershipPage() {
  const [membership] = useState(tiers)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Membership</h1>
          <p className="text-sm text-muted-foreground">Kelola tier membership</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tier</TableHead>
                <TableHead>Benefits</TableHead>
                <TableHead>Diskon</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {membership.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <Badge variant={tierColor(m.name)}>{m.name}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[300px] text-sm text-muted-foreground">{m.benefits}</TableCell>
                  <TableCell className="font-medium">{m.discount}</TableCell>
                  <TableCell>{m.price}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDialogOpen(true)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
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
            <DialogTitle>Edit Membership Tier</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama Tier</Label>
              <Input placeholder="Gold" />
            </div>
            <div className="grid gap-2">
              <Label>Benefits</Label>
              <Textarea placeholder="Deskripsi benefit" />
            </div>
            <div className="grid gap-2">
              <Label>Diskon (%)</Label>
              <Input placeholder="15" />
            </div>
            <div className="grid gap-2">
              <Label>Harga</Label>
              <Input placeholder="Rp 100.000/bln" />
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
