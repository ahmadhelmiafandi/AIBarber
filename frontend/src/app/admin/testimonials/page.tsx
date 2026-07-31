"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import { Star } from "lucide-react"

const initialTestimonials = [
  { id: 1, customer: "Ahmad Rizky", rating: 5, content: "Barber terbaik yang pernah saya coba. Hasilnya sangat rapi dan sesuai ekspektasi!", published: true },
  { id: 2, customer: "Budi Santoso", rating: 4, content: "Pelayanan cepat, antrian terkelola baik. AI recommendation juga bagus.", published: true },
  { id: 3, customer: "Chandra Wijaya", rating: 5, content: "Tempatnya nyaman, barber ramah, hasil potong memuaskan. Pasti balik lagi!", published: true },
  { id: 4, customer: "Dimas Pratama", rating: 3, content: "Cukup oke, tapi waktu tunggu agak lama karena ramai.", published: false },
]

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState(initialTestimonials)

  const toggle = (id: number) => {
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, published: !t.published } : t))
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Testimonials</h1>
        <p className="text-sm text-muted-foreground">Kelola testimoni pelanggan</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="max-w-[300px]">Konten</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Publish</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">{t.customer}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < t.rating ? "fill-warning text-warning" : "text-muted"}`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] text-sm text-muted-foreground">{t.content}</TableCell>
                  <TableCell>
                    <Badge variant={t.published ? "success" : "secondary"}>
                      {t.published ? "Published" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch checked={t.published} onCheckedChange={() => toggle(t.id)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
