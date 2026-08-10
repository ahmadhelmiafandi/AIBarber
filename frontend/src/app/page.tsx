import Link from "next/link";
import MobileMenuButton from "@/components/mobile-menu-button";
import {
  Camera,
  ScanFace,
  Sparkles,
  Eye,
  Calendar,
  MessageSquare,
  Monitor,
  CalendarCheck,
  Clock,
  History,
  Image,
  Star,
  Scissors,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const navLinks = [
  { label: "Fitur AI", href: "#features" },
  { label: "Cara Kerja", href: "#how-it-works" },
  { label: "Portofolio", href: "#portfolio" },
  { label: "Statistik", href: "#stats" },
  { label: "Testimoni", href: "#testimonials" },
];

const timelineSteps = [
  { icon: Camera, label: "1. Upload Foto", desc: "Ambil atau unggah foto selfie wajahmu" },
  { icon: ScanFace, label: "2. Analisis AI", desc: "Sistem memetakan kontur & bentuk wajah" },
  { icon: Sparkles, label: "3. Rekomendasi", desc: "Dapatkan gaya rambut presisi tersesuaikan" },
  { icon: Eye, label: "4. Virtual Preview", desc: "Simulasikan tampilan rambut sebelum dipotong" },
  { icon: Calendar, label: "5. Smart Booking", desc: "Reservasi jadwal barber & amankan antrean" },
];

const portfolioItems = [
  {
    name: "Textured Crop Fade",
    category: "Textured & Fade",
    faceShapes: ["Oval", "Square", "Diamond"],
    barber: "Fadli Barber - Cabang Sudirman",
    rating: 4.9,
    tag: "Trending",
    bgGradient: "from-amber-500/20 via-primary/10 to-purple-500/20",
    image: "/images/hairstyles/textured_crop_fade.png",
    desc: "Potongan bertekstur pada bagian atas dengan gradasi mid fade yang memberikan kesan rapi dan maskulin.",
  },
  {
    name: "Classic Side Part Undercut",
    category: "Classic Side Part",
    faceShapes: ["Round", "Oval", "Heart"],
    barber: "Budi Barber - Cabang Kemang",
    rating: 5.0,
    tag: "Favorit Eksekutif",
    bgGradient: "from-blue-500/20 via-indigo-500/10 to-primary/20",
    image: "/images/hairstyles/classic_side_part.png",
    desc: "Belahan samping bergaris tegas dipadukan dengan undercut halus untuk tampilan profesional nan elegan.",
  },
  {
    name: "Taper Fade Pompadour",
    category: "Textured & Fade",
    faceShapes: ["Square", "Oval"],
    barber: "Andi Master - Cabang PIK",
    rating: 4.8,
    tag: "High Volume",
    bgGradient: "from-purple-500/20 via-pink-500/10 to-amber-500/20",
    image: "/images/hairstyles/taper_fade_pompadour.png",
    desc: "Gaya pompadour modern dengan puncak rambut bervolume tinggi dan taper fade bersih di bagian samping.",
  },
  {
    name: "French Crop with Line-Up",
    category: "Modern Crop",
    faceShapes: ["Oval", "Diamond", "Square"],
    barber: "Fadli Barber - Cabang Sudirman",
    rating: 4.9,
    tag: "Low Maintenance",
    bgGradient: "from-emerald-500/20 via-teal-500/10 to-primary/20",
    image: "/images/hairstyles/french_crop_lineup.png",
    desc: "Poni lurus tegas dengan tekstur pendek di bagian atas. Sangat praktis untuk aktivitas harian padat.",
  },
  {
    name: "Buzz Cut Taper",
    category: "Buzz & Taper",
    faceShapes: ["Oval", "Square"],
    barber: "Budi Barber - Cabang Kemang",
    rating: 4.9,
    tag: "Clean & Sharp",
    bgGradient: "from-orange-500/20 via-amber-500/10 to-rose-500/20",
    image: "/images/hairstyles/buzz_cut_taper.png",
    desc: "Potongan sangat pendek yang dipadu dengan garis tepi presisi pisau cukur untuk kesan tajam dan sporty.",
  },
  {
    name: "Slicked Back Low Fade",
    category: "Classic Side Part",
    faceShapes: ["Oval", "Heart", "Square"],
    barber: "Andi Master - Cabang PIK",
    rating: 5.0,
    tag: "Premium Look",
    bgGradient: "from-cyan-500/20 via-blue-500/10 to-primary/20",
    image: "/images/hairstyles/slicked_back_low_fade.png",
    desc: "Rambut disisir rapi ke belakang dengan pomade shine tinggi dan low drop fade melingkari telinga.",
  },
];

const features = [
  {
    icon: MessageSquare,
    badge: "Konsultasi AI",
    title: "AI Face & Style Consultant",
    desc: "Konsultasi cerdas menganalisis bentuk wajah, kontur rahang, dan jenis rambut untuk memberikan saran gaya terbaik.",
  },
  {
    icon: Monitor,
    badge: "Preview Visual",
    title: "Virtual Hair Preview",
    desc: "Visualisasikan simulasi potongan rambut langsung pada foto selfie-mu sebelum proses pemotongan dimulai.",
  },
  {
    icon: CalendarCheck,
    badge: "Booking Online",
    title: "Smart Booking System",
    desc: "Pilih jam & barber favorit secara transparan tanpa perlu mengantre manual di lokasi.",
  },
  {
    icon: Clock,
    badge: "Antrean Live",
    title: "Real-time Queue Monitor",
    desc: "Pantau pergerakan nomor antrean secara live dari smartphone dengan estimasi giliran yang akurat.",
  },
  {
    icon: History,
    badge: "Catatan Gaya",
    title: "Riwayat & Profil Rambut",
    desc: "Simpan riwayat gaya potong dan preference khusus agar barber bisa memberikan hasil konsisten.",
  },
  {
    icon: Image,
    badge: "Master Barber",
    title: "Galeri & Portofolio",
    desc: "Jelajahi portofolio karya terbaik dari para master barber di setiap cabang resmi kami.",
  },
];

const stats = [
  { value: "5,000+", label: "Pelanggan Terlayani" },
  { value: "98%", label: "Tingkat Kepuasan" },
  { value: "4.9/5", label: "Rating Layanan" },
  { value: "3 Cabang", label: "Jakarta & Sekitarnya" },
];

const testimonials = [
  {
    name: "Rizky Pratama",
    role: "Professional Executive",
    review:
      "Pertama kali coba fitur AI consultant-nya dan kaget banget hasilnya presisi! Rekomendasi gaya Textured Quiff ternyata cocok banget sama bentuk wajah saya.",
    rating: 5,
  },
  {
    name: "Dimas Aditya",
    role: "Software Engineer",
    review:
      "Fitur Realtime Queue benar-benar efisien. Saya tinggal jalan dari kantor pas antrean tersisa 1 orang lagi. Tanpa perlu buang waktu menunggu lama.",
    rating: 5,
  },
  {
    name: "Fajar Nugroho",
    role: "Creative Director",
    review:
      "Virtual preview-nya sangat membantu! Visualisasi gaya rambut sebelum dipotong bikin makin yakin pas datang ke lokasi. Barber-nya sangat profesional.",
    rating: 5,
  },
];

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/60">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Scissors className="w-4 h-4" />
          </div>
          <span>MyBarber</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-medium px-4 py-2 rounded-xl border border-border text-foreground hover:bg-muted transition-colors duration-200"
          >
            Masuk
          </Link>
          <Link
            href="/dashboard/booking"
            className="text-sm font-medium px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
          >
            Pesan Sekarang
          </Link>
        </div>
        <MobileMenuButton />
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-muted/50 text-foreground text-xs font-medium tracking-wide mb-6">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Smart Barbershop & AI Haircut Experience</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[64px] lg:leading-[1.1] font-extrabold tracking-tight text-foreground max-w-[880px] mx-auto">
          Gaya Rambut Presisi, Dipilihkan AI Khusus Untuk Wajahmu
        </h1>
        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-[620px] mx-auto leading-relaxed">
          Konsultasi berbasis AI untuk rekomendasi potongan rambut presisi, lengkap dengan booking antrean online dan preview gaya secara real-time.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/dashboard/ai-consultant"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3.5 rounded-xl bg-primary text-primary-foreground hover:opacity-95 transition-all shadow-md"
          >
            Mulai Analisis Gaya
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard/booking"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3.5 rounded-xl border border-border text-foreground hover:bg-muted transition-colors"
          >
            Pesan Antrean Sekarang
          </Link>
        </div>

        {/* Dashboard Preview Section */}
        <div className="mt-14 max-w-[960px] mx-auto rounded-2xl border border-border bg-card shadow-xl p-5 sm:p-6 text-left">
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-border/80 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-2">
              <ScanFace className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">Sistem Konsultasi & Antrean Digital</span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-emerald-500 font-medium">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Sistem Online</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Card 1: Character Analysis */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/60">
                  <span className="text-xs font-bold text-foreground">Analisis Profil Wajah</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                    Selesai
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Bentuk Wajah:</span>
                    <span className="font-semibold text-foreground">Oval / Diamond</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Tekstur Rambut:</span>
                    <span className="font-semibold text-foreground">Lurus Bergelombang</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <span className="text-muted-foreground">Panjang Rambut:</span>
                    <span className="font-semibold text-foreground">Medium (Sedang)</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-muted-foreground">Volume Samping:</span>
                    <span className="font-semibold text-foreground">Tebal</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center gap-2 text-[11px] text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Rekomendasi Potongan Tersedia</span>
              </div>
            </div>

            {/* Card 2: Hairstyle Preview */}
            <div className="group rounded-xl overflow-hidden border border-border bg-card flex flex-col justify-between shadow-sm">
              <div className="h-52 relative overflow-hidden bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/hairstyles/textured_crop_fade.png"
                  alt="Textured Crop Fade"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-semibold text-amber-300 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-500/30">
                    Rekomendasi Utama
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    Textured Crop Fade
                  </h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <span>Estimasi Pengerjaan:</span>
                    <span className="font-semibold text-foreground">35 Menit</span>
                  </div>
                </div>
                <Link
                  href="/dashboard/ai-consultant"
                  className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Coba Konsultasi Foto</span>
                </Link>
              </div>
            </div>

            {/* Card 3: Live Queue */}
            <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/60">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>Status Antrean Cabang</span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <div className="text-xs font-bold text-foreground mb-2">Cabang Sudirman</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-border/40 text-muted-foreground">
                    <span>Sedang Dilayani:</span>
                    <span className="font-bold text-foreground">Antrean #A-14</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/40 text-muted-foreground">
                    <span>Estimasi Tunggu:</span>
                    <span className="font-semibold text-foreground">&lt; 10 Menit</span>
                  </div>
                  <div className="flex justify-between py-1 text-muted-foreground">
                    <span>Master Barber:</span>
                    <span className="font-semibold text-foreground">4 Barber Ready</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">Pemesanan Online:</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  Buka & Tersedia
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Statistics() {
  return (
    <section id="stats" className="py-12 border-y border-border bg-muted/30">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-extrabold text-foreground">{s.value}</div>
              <div className="mt-1.5 text-xs sm:text-sm font-medium text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section id="how-it-works" className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Langkah Cerdas Penggunaan
          </h2>
          <p className="mt-3 text-muted-foreground max-w-[500px] mx-auto text-sm sm:text-base">
            Proses cepat dari konsultasi AI hingga mendapatkan potong rambut presisi
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {timelineSteps.map((step, i) => (
            <div
              key={i}
              className="p-5 rounded-xl border border-border bg-card flex flex-col items-center text-center shadow-sm hover:border-primary/40 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <step.icon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-foreground">{step.label}</h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Portfolio() {
  return (
    <section id="portfolio" className="py-20 md:py-28 bg-muted/20 border-t border-border">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <Scissors className="w-3.5 h-3.5" />
            <span>Karya & Inspirasi Gaya Rambut</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Portofolio Model Rambut Terpopuler
          </h2>
          <p className="mt-3 text-muted-foreground max-w-[560px] mx-auto text-sm sm:text-base">
            Koleksi potongan rambut terbaik hasil karya master barber kami yang terintegrasi dengan kecerdasan AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item, i) => (
            <div
              key={i}
              className="group rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-xl hover:border-primary/40 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="h-64 relative overflow-hidden bg-slate-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/30 flex flex-col justify-between p-4 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white border border-white/10">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-amber-400 text-xs font-bold border border-white/10">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-amber-300 tracking-wide uppercase px-2 py-0.5 rounded bg-amber-950/80 backdrop-blur-sm border border-amber-500/30 inline-block mb-1">
                      {item.tag}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-border/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Cocok Untuk Wajah:</span>
                    <div className="flex gap-1.5 flex-wrap justify-end">
                      {item.faceShapes.map((shape, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-muted text-foreground text-[10px] font-semibold border border-border">
                          {shape}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-muted-foreground font-medium">{item.barber}</span>
                    <Link
                      href="/dashboard/ai-consultant"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      Coba AI <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/dashboard/ai-consultant"
            className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Analisis Gaya Yang Paling Cocok Dengan Wajahmu</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-muted/20">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Fitur Unggulan MyBarber
          </h2>
          <p className="mt-3 text-muted-foreground max-w-[520px] mx-auto text-sm sm:text-base">
            Solusi teknologi terlengkap untuk kenyamanan dan presisi penampilanmu
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                    <f.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-28">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Pengalaman Pelanggan Kami
          </h2>
          <p className="mt-3 text-muted-foreground max-w-[480px] mx-auto text-sm sm:text-base">
            Ulasan dari pelanggan yang telah merasakan pengalaman potong rambut modern
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={`w-4 h-4 ${si < t.rating ? "text-amber-500 fill-amber-500" : "text-border"}`}
                    />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  &ldquo;{t.review}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-primary to-slate-950 text-white p-8 sm:p-14 text-center shadow-xl relative overflow-hidden border border-primary/20">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Siap Untuk Tampilan Rambut Terbaikmu?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-[540px] mx-auto leading-relaxed">
            Gunakan analisis kecerdasan buatan sekarang secara gratis dan pesan slot barbershop terfavoritmu dalam hitungan detik.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/dashboard/ai-consultant"
              className="inline-flex items-center gap-2 text-sm font-bold px-6 py-3.5 rounded-xl bg-white text-slate-950 hover:bg-slate-100 transition-colors shadow-md"
            >
              Mulai Konsultasi AI
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/booking"
              className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3.5 rounded-xl border border-white/30 text-white hover:bg-white/10 transition-colors"
            >
              Pesan Jadwal Antrean
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12 bg-card">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-lg font-bold text-foreground">
            <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground">
              <Scissors className="w-3.5 h-3.5" />
            </div>
            <span>MyBarber</span>
          </div>
          <p className="text-xs text-muted-foreground" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} MyBarber. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Navbar />
      <Hero />
      <Statistics />
      <Timeline />
      <Portfolio />
      <Features />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
}
