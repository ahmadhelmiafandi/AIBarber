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

interface MembershipTier {
  id: number
  name: string
  benefits: string
  discount: string
  price: string
}

const initialTiers: MembershipTier[] = [
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
  const [membership, setMembership] = useState<MembershipTier[]>(initialTiers)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null)

  // Form State
  const [name, setName] = useState("")
  const [benefits, setBenefits] = useState("")
  const [discount, setDiscount] = useState("")
  const [price, setPrice] = useState("")

  const openEditModal = (t: MembershipTier) => {
    setSelectedTier(t)
    setName(t.name)
    setBenefits(t.benefits)
    setDiscount(t.discount)
    setPrice(t.price)
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (!selectedTier) return
    setMembership((prev) =>
      prev.map((item) =>
        item.id === selectedTier.id
          ? { ...item, name, benefits, discount, price }
          : item
      )
    )
    setDialogOpen(false)
    setSelectedTier(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Membership</h1>
          <p className="text-sm text-muted-foreground">Kelola tier membership dan hak istimewa</p>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title="Edit Tier Membership"
                      onClick={() => openEditModal(m)}
                    >
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
            <DialogTitle>Edit Membership Tier ({selectedTier?.name})</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Nama Tier</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Gold" />
            </div>
            <div className="grid gap-2">
              <Label>Benefits</Label>
              <Textarea value={benefits} onChange={(e) => setBenefits(e.target.value)} placeholder="Deskripsi benefit" />
            </div>
            <div className="grid gap-2">
              <Label>Diskon (%)</Label>
              <Input value={discount} onChange={(e) => setDiscount(e.target.value)} placeholder="15%" />
            </div>
            <div className="grid gap-2">
              <Label>Harga</Label>
              <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Rp 100.000/bln" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
