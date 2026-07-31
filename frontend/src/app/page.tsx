import Link from "next/link";
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
  Menu,
} from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Testimonials", href: "#testimonials" },
];

const timelineSteps = [
  { icon: Camera, label: "Upload Foto", desc: "Ambil atau upload foto wajahmu" },
  { icon: ScanFace, label: "Analisis AI", desc: "AI menganalisis bentuk wajah" },
  { icon: Sparkles, label: "Rekomendasi", desc: "Dapatkan gaya rambut terbaik" },
  { icon: Eye, label: "Preview", desc: "Lihat preview sebelum potong" },
  { icon: Calendar, label: "Booking", desc: "Pesan jadwal potong rambut" },
];

const features = [
  {
    icon: MessageSquare,
    title: "AI Consultation",
    desc: "Konsultasi dengan AI untuk menemukan gaya rambut yang sesuai dengan bentuk wajah, tekstur rambut, dan preferensimu.",
  },
  {
    icon: Monitor,
    title: "Virtual Preview",
    desc: "Lihat bagaimana gaya rambut baru akan terlihat di wajahmu sebelum memotong, menggunakan teknologi augmented reality.",
  },
  {
    icon: CalendarCheck,
    title: "Smart Booking",
    desc: "Pesan jadwal potong rambut secara online dengan sistem booking cerdas yang menyesuaikan ketersediaan barber.",
  },
  {
    icon: Clock,
    title: "Realtime Queue",
    desc: "Pantau antrian secara realtime dari mana saja. Tidak perlu menunggu lama di barbershop.",
  },
  {
    icon: History,
    title: "Hair History",
    desc: "Simpan riwayat gaya rambut dan preferensimu. Barber bisa melihat histori untuk hasil yang konsisten.",
  },
  {
    icon: Image,
    title: "Portfolio Barber",
    desc: "Jelajahi portfolio setiap barber. Lihat hasil kerja mereka dan pilih barber yang paling sesuai dengan selera.",
  },
];

const stats = [
  { value: "1,000+", label: "Hair Analysis" },
  { value: "500+", label: "Happy Customers" },
  { value: "95%", label: "Recommendation Accuracy" },
  { value: "20+", label: "Professional Barbers" },
];

const testimonials = [
  {
    name: "Rizky Pratama",
    review:
      "Pertama kali coba fitur AI consultation dan hasilnya luar biasa. Rekomendasi gaya rambutnya sangat cocok dengan bentuk wajah saya. Barbernya juga skillful.",
    rating: 5,
  },
  {
    name: "Dimas Aditya",
    review:
      "Booking online sangat praktis, tidak perlu antri lama. Fitur realtime queue bikin saya bisa datang tepat waktu tanpa buang waktu menunggu.",
    rating: 5,
  },
  {
    name: "Fajar Nugroho",
    review:
      "Virtual preview-nya keren banget. Saya bisa lihat dulu hasilnya sebelum potong. Jadi lebih percaya diri dan hasilnya sesuai ekspektasi.",
    rating: 4,
  },
];

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
          AI Barbershop
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-sm font-medium px-4 py-2 rounded-[14px] border border-border text-foreground hover:bg-muted transition-colors duration-200"
          >
            Login
          </Link>
          <Link
            href="/dashboard/booking"
            className="text-sm font-medium px-4 py-2 rounded-[14px] bg-primary text-primary-foreground hover:opacity-90 transition-opacity duration-200"
          >
            Book Now
          </Link>
        </div>
        <button className="md:hidden text-foreground" aria-label="Menu">
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="pt-24 pb-16 md:pt-32 md:pb-24">
      <div className="max-w-[1200px] mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-[64px] md:leading-[1.1] font-bold tracking-tight text-foreground max-w-[800px] mx-auto">
          Temukan Gaya Rambut Terbaikmu dengan AI
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-[560px] mx-auto leading-relaxed">
          Platform barbershop pintar yang menggunakan kecerdasan buatan untuk menganalisis wajahmu dan merekomendasikan gaya rambut yang paling cocok.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/dashboard/ai-consultant"
            className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-[14px] bg-primary text-primary-foreground hover:opacity-90 transition-opacity duration-200"
          >
            Mulai Analisis Gratis
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-[14px] border border-border text-foreground hover:bg-muted transition-colors duration-200"
          >
            Lihat Portfolio
          </Link>
        </div>
        <div className="mt-16 max-w-[720px] mx-auto aspect-video rounded-[20px] border border-border bg-card shadow-[0_8px_30px_rgba(0,0,0,.06)] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Scissors className="w-10 h-10" />
            <span className="text-sm font-medium">AI Barbershop Interface Preview</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Timeline() {
  return (
    <section id="how-it-works" className="py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Bagaimana Cara Kerjanya
          </h2>
          <p className="mt-4 text-muted-foreground max-w-[480px] mx-auto">
            Lima langkah mudah menuju gaya rambut terbaik
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-4 relative">
          <div className="hidden md:block absolute top-6 left-[10%] right-[10%] h-px bg-border" />
          {timelineSteps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center flex-1 relative z-10">
              <div className="w-12 h-12 rounded-[14px] bg-card border border-border flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,.06)]">
                <step.icon className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-foreground">{step.label}</h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-[140px]">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Fitur Unggulan
          </h2>
          <p className="mt-4 text-muted-foreground max-w-[480px] mx-auto">
            Teknologi terdepan untuk pengalaman barbershop terbaik
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="p-8 rounded-[20px] border border-border bg-card shadow-[0_8px_30px_rgba(0,0,0,.06)] transition-shadow duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,.1)]"
            >
              <div className="w-10 h-10 rounded-[12px] bg-muted flex items-center justify-center">
                <f.icon className="w-5 h-5 text-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Statistics() {
  return (
    <section className="py-16 md:py-24 border-y border-border bg-card">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-foreground">{s.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" className="py-16 md:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Apa Kata Pelanggan
          </h2>
          <p className="mt-4 text-muted-foreground max-w-[480px] mx-auto">
            Pengalaman nyata dari pelanggan yang sudah merasakan layanan kami
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="p-8 rounded-[20px] border border-border bg-card shadow-[0_8px_30px_rgba(0,0,0,.06)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-semibold text-foreground">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="flex gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star
                        key={si}
                        className={`w-3.5 h-3.5 ${si < t.rating ? "text-warning fill-warning" : "text-border"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{t.review}</p>
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
        <div className="rounded-[20px] bg-primary text-primary-foreground p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Temukan Gaya Rambut Barumu
          </h2>
          <p className="mt-4 text-sm opacity-70 max-w-[480px] mx-auto">
            Mulai analisis AI gratis sekarang dan dapatkan rekomendasi gaya rambut yang sempurna untuk wajahmu.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/dashboard/ai-consultant"
              className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-[14px] bg-primary-foreground text-primary hover:opacity-90 transition-opacity duration-200"
            >
              Mulai Analisis Gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/booking"
              className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3 rounded-[14px] border border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 transition-colors duration-200"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

const footerLinks = {
  Platform: [
    { label: "AI Consultation", href: "/dashboard/ai-consultant" },
    { label: "Booking", href: "/dashboard/booking" },
    { label: "Queue", href: "/dashboard/queue" },
    { label: "Portfolio", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
};

function Footer() {
  return (
    <footer className="border-t border-border py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-bold text-foreground">
              AI Barbershop
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-[240px]">
              Platform barbershop pintar dengan teknologi AI untuk pengalaman potong rambut terbaik.
            </p>
          </div>
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-foreground">{title}</h4>
              <ul className="mt-3 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AI Barbershop. All rights reserved.
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
      <Timeline />
      <Features />
      <Statistics />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
}
