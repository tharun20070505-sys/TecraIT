import Link from "next/link";
import Image from "next/image";
import { siteSettings } from "@/data/site";
import { Home, Users, Calendar, Mail, Search, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-[85vh] flex items-center justify-center bg-midnight text-white px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
      {/* Faint Campus Image Background */}
      <div className="absolute inset-0 opacity-15 pointer-events-none select-none">
        <Image
          src={siteSettings.heroCampusImage}
          alt="Illustration of the Sri Ranganathar Institute of Engineering and Technology main building"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-midnight/80 to-ink/95" />
      </div>

      {/* Subtle Node & Circuit SVG Motif */}
      <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
        <svg
          viewBox="0 0 800 600"
          className="w-full h-full max-w-4xl"
          fill="none"
          stroke="#D9A441"
          strokeWidth="1.2"
        >
          <circle cx="200" cy="150" r="4" fill="#D9A441" />
          <circle cx="400" cy="120" r="5" fill="#D9A441" />
          <circle cx="600" cy="180" r="4" fill="#D9A441" />
          <circle cx="250" cy="350" r="5" fill="#D9A441" />
          <circle cx="550" cy="380" r="4" fill="#D9A441" />
          <circle cx="400" cy="480" r="6" fill="#D9A441" />
          <line x1="200" y1="150" x2="400" y2="120" strokeDasharray="4 4" />
          <line x1="400" y1="120" x2="600" y2="180" strokeDasharray="4 4" />
          <line x1="200" y1="150" x2="250" y2="350" />
          <line x1="600" y1="180" x2="550" y2="380" />
          <line x1="250" y1="350" x2="400" y2="480" />
          <line x1="550" y1="380" x2="400" y2="480" />
        </svg>
      </div>

      {/* Main Content Card */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-6">
        {/* Outlined 404 Headline */}
        <div className="relative inline-block select-none">
          <span
            className="font-heading font-black text-8xl sm:text-9xl tracking-widest text-transparent"
            style={{
              WebkitTextStroke: "2px #D9A441",
              textShadow: "0 0 30px rgba(217, 164, 65, 0.25)",
            }}
          >
            404
          </span>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-deep-navy text-gold text-xs uppercase tracking-widest font-mono rounded border border-gold/40">
            Node Not Found
          </div>
        </div>

        {/* Heading & Explanation */}
        <div className="space-y-2 pt-2">
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
            Page Routing Signal Lost
          </h1>
          <p className="text-sm sm:text-base text-sand/80 max-w-lg mx-auto leading-relaxed">
            The requested pathway does not exist within the Department of Information Technology network. It may have been relocated or archived.
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-md mx-auto pt-2">
          <form
            action="/events"
            method="GET"
            className="relative flex items-center shadow-lg"
          >
            <input
              type="text"
              name="q"
              placeholder="Search faculty, events, or student activities..."
              className="w-full pl-11 pr-4 py-3 rounded-lg bg-ink/90 border border-sand/30 text-white placeholder-sand/50 text-sm focus-dark focus:border-gold transition-colors"
            />
            <Search className="w-4 h-4 text-gold absolute left-4 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-2 px-3 py-1.5 rounded-md bg-royal-blue hover:bg-royal-blue/90 text-white text-xs font-semibold transition-colors flex items-center gap-1"
            >
              Search <ArrowRight className="w-3 h-3" />
            </button>
          </form>
        </div>

        {/* Quick Action Navigation Grid */}
        <div className="pt-4 border-t border-sand/15">
          <p className="text-xs uppercase tracking-wider text-sand/60 mb-3 font-semibold">
            Quick Return Pathways
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/"
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-ink/60 border border-sand/20 text-sand hover:text-white hover:border-gold transition-all duration-200 group"
            >
              <Home className="w-5 h-5 text-gold mb-1" />
              <span className="text-xs font-medium">Home</span>
            </Link>
            <Link
              href="/faculty"
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-ink/60 border border-sand/20 text-sand hover:text-white hover:border-gold transition-all duration-200 group"
            >
              <Users className="w-5 h-5 text-royal-blue mb-1" />
              <span className="text-xs font-medium">Faculty</span>
            </Link>
            <Link
              href="/events"
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-ink/60 border border-sand/20 text-sand hover:text-white hover:border-gold transition-all duration-200 group"
            >
              <Calendar className="w-5 h-5 text-burgundy mb-1" />
              <span className="text-xs font-medium">Events</span>
            </Link>
            <Link
              href="/contact"
              className="flex flex-col items-center justify-center p-3 rounded-lg bg-ink/60 border border-sand/20 text-sand hover:text-white hover:border-gold transition-all duration-200 group"
            >
              <Mail className="w-5 h-5 text-emerald mb-1" />
              <span className="text-xs font-medium">Contact</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
