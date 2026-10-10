import type { Metadata } from "next";
import { PageBanner } from "@/components/common/PageBanner";
import { Reveal } from "@/components/common/Reveal";
import { RevealText } from "@/components/common/RevealText";
import { siteSettings } from "@/data/site";
import { ShieldCheck, Lock, Eye, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy - Department of Information Technology",
  description:
    "Data privacy and student information handling policies for the Department of Information Technology at SRIET.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="w-full bg-ivory text-text">
      <PageBanner
        title="Privacy Policy"
        eyebrow="TECRA INSTITUTIONAL GOVERNANCE"
        breadcrumbs={[{ label: "Privacy Policy" }]}
        description="Guidelines on data handling, student directory privacy, and communication standards."
      />

      <section className="py-20 lg:py-24 bg-white border-b border-sand">
        <div className="w-[min(calc(100%-2*clamp(20px,3.5vw,64px)),1840px)] mx-auto max-w-4xl">
          <div className="relative bg-white p-8 sm:p-12 rounded-[3px] border border-sand shadow-xs space-y-8 text-sm leading-relaxed text-text-muted overflow-hidden">
            {/* 4px Top Bar in Midnight */}
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-midnight" />

            <div className="space-y-2 border-b border-sand pb-6">
              <div className="flex items-center gap-2 text-gold-text font-mono uppercase text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald" aria-hidden="true" />
                <span>Department Data Protection Standard</span>
              </div>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl text-text">
                <RevealText mode="words">Information Privacy and Records Policy</RevealText>
              </h2>
              <p className="text-xs text-text-muted">
                Effective Date: Academic Session 2026 to 2027, SRIET Coimbatore
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-heading font-bold text-base text-text flex items-center gap-2">
                <Lock className="w-4 h-4 text-royal-blue" aria-hidden="true" />
                Section 1: Student and Alumni Privacy Protection
              </h3>
              <Reveal><p>
                In accordance with institutional privacy safeguards, personal contact information such as personal phone numbers and private addresses are never displayed publicly without explicit departmental verification. Email visibility for faculty and administrative staff is subject to configurable consent toggles managed by the department administration.
              </p></Reveal>
            </div>

            <div className="space-y-4">
              <h3 className="font-heading font-bold text-base text-text flex items-center gap-2">
                <Eye className="w-4 h-4 text-royal-blue" aria-hidden="true" />
                Section 2: Inquiry Portal Communications
              </h3>
              <Reveal><p>
                Messages transmitted via the department Inquiry Portal are stored securely and routed exclusively to designated department coordinators for official inquiry fulfillment. Contact details submitted will never be shared, sold, or distributed to third-party commercial entities.
              </p></Reveal>
            </div>

            <div className="space-y-4">
              <h3 className="font-heading font-bold text-base text-text flex items-center gap-2">
                <FileText className="w-4 h-4 text-gold" aria-hidden="true" />
                Section 3: Verifiable Academic Data
              </h3>
              <Reveal><p>
                The department strictly adheres to Anna University and AICTE governance norms. No unverified placement statistics, salary claims, or unconfirmed awards are published on this portal. Missing or pending data is explicitly designated as awaiting board approval.
              </p></Reveal>
            </div>

            <div className="pt-6 border-t border-sand flex items-center justify-between text-xs text-text-muted">
              <span>{siteSettings.institutionName} (SRIET)</span>
              <span className="font-mono">Document Ref: POL-IT-2026</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

