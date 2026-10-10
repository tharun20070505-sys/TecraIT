import { siteSettings } from "@/data/site";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Building,
  ExternalLink,
} from "lucide-react";

export function HeadquartersSection() {
  const { departmentOffice } = siteSettings;

  return (
    <div className="relative bg-white p-8 sm:p-10 rounded-[3px] border border-sand shadow-xs space-y-8 overflow-hidden">
      {/* 4px Top Bar in Midnight */}
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-midnight" />

      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono uppercase font-bold tracking-wider text-gold-text bg-mist px-2 py-0.5 rounded-[2px] border border-sand">
            CAMPUS HEADQUARTERS
          </span>
        </div>
        <h3 className="font-heading font-bold text-2xl text-text">
          Department Office and Location
        </h3>
        <p className="text-sm text-text-muted mt-1 leading-relaxed">
          Official contact registry and academic administrative office for the Department of Information Technology.
        </p>
      </div>

      {/* Office Details List */}
      <div className="space-y-4 text-sm">
        <div className="flex items-start gap-3.5 p-3.5 rounded-[3px] bg-ivory border border-sand">
          <Building className="w-5 h-5 text-royal-blue shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="text-xs font-mono uppercase text-text-muted font-semibold block">
              Department Chamber and Block
            </span>
            <span className="font-bold text-text">
              {departmentOffice.room}, {departmentOffice.block}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-3.5 rounded-[3px] bg-ivory border border-sand">
          <MapPin className="w-5 h-5 text-royal-blue shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="text-xs font-mono uppercase text-text-muted font-semibold block">
              Postal Address
            </span>
            <span className="font-medium text-text leading-relaxed">
              {siteSettings.institutionName} (SRIET)
              <br />
              {departmentOffice.address}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-3.5 rounded-[3px] bg-ivory border border-sand">
          <Mail className="w-5 h-5 text-royal-blue shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="text-xs font-mono uppercase text-text-muted font-semibold block">
              Electronic Mail
            </span>
            <a
              href={`mailto:${departmentOffice.email}`}
              className="font-bold text-blue-text hover:underline font-mono"
            >
              {departmentOffice.email}
            </a>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-3.5 rounded-[3px] bg-ivory border border-sand">
          <Phone className="w-5 h-5 text-royal-blue shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="text-xs font-mono uppercase text-text-muted font-semibold block">
              Telephone Helpline
            </span>
            <span className="font-mono text-text">
              {departmentOffice.phone}
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3.5 p-3.5 rounded-[3px] bg-ivory border border-sand">
          <Clock className="w-5 h-5 text-royal-blue shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <span className="text-xs font-mono uppercase text-text-muted font-semibold block">
              Official Desk Hours
            </span>
            <span className="font-medium text-text">
              {departmentOffice.officeHours}
            </span>
          </div>
        </div>
      </div>

      {/* Google Map Embed */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-text uppercase tracking-wider text-xs">
            Campus Coordinates
          </span>
          <a
            href="https://maps.google.com/?q=Sri+Ranganathar+Institute+of+Engineering+and+Technology+Coimbatore"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-text hover:text-gold flex items-center gap-1 font-semibold transition-colors"
          >
            <span>Open in Maps</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </a>
        </div>

        <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-[3px] overflow-hidden border border-sand shadow-inner bg-mist">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3914.887854655495!2d76.9936859748231!3d11.12165898904924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba8f62f8373b985%3A0xa64b3ef6f4b63ffb!2sSri%20Ranganathar%20Institute%20of%20Engineering%20and%20Technology!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Sri Ranganathar Institute of Engineering and Technology Location Map"
          />
        </div>
      </div>
    </div>
  );
}
