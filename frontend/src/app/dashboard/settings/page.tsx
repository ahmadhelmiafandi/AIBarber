"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: "Ahmad Rizky",
    email: "ahmad@email.com",
    phone: "081234567890",
  })

  const [notifications, setNotifications] = useState({
    booking: true,
    promo: false,
    queue: true,
    recommendation: true,
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, name: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, phone: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) =>
                setProfile((p) => ({ ...p, email: e.target.value }))
              }
            />
          </div>
          <Button>Simpan Profil</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ubah Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Password Saat Ini</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-password">Password Baru</Label>
              <Input id="new-password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Konfirmasi Password</Label>
              <Input id="confirm-password" type="password" />
            </div>
          </div>
          <Button>Ubah Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notifikasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">Pengingat Booking</p>
              <p className="text-xs text-muted-foreground">
                Notifikasi sebelum jadwal booking
              </p>
            </div>
            <Switch
              checked={notifications.booking}
              onCheckedChange={(v) =>
                setNotifications((n) => ({ ...n, booking: v }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">Update Antrian</p>
              <p className="text-xs text-muted-foreground">
                Notifikasi perubahan posisi antrian
              </p>
            </div>
            <Switch
              checked={notifications.queue}
              onCheckedChange={(v) =>
                setNotifications((n) => ({ ...n, queue: v }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">Rekomendasi AI</p>
              <p className="text-xs text-muted-foreground">
                Notifikasi gaya rambut baru yang cocok
              </p>
            </div>
            <Switch
              checked={notifications.recommendation}
              onCheckedChange={(v) =>
                setNotifications((n) => ({ ...n, recommendation: v }))
              }
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">Promo & Penawaran</p>
              <p className="text-xs text-muted-foreground">
                Info diskon dan penawaran spesial
              </p>
            </div>
            <Switch
              checked={notifications.promo}
              onCheckedChange={(v) =>
                setNotifications((n) => ({ ...n, promo: v }))
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
