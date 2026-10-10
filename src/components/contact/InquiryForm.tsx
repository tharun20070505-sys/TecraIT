"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

const inquirySchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please provide a valid institutional or personal email"),
  phone: z
    .string()
    .regex(/^$|^[0-9+\s-]{7,15}$/, "Please enter a valid phone number")
    .optional(),
  category: z.enum([
    "General",
    "Admissions",
    "Academics",
    "Placements",
    "Alumni",
    "Collaboration",
  ]),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Please provide a detailed inquiry message (at least 10 characters)"),
  website_hp: z.string().max(0, "").optional().or(z.literal("")),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

export function InquiryForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      category: "General",
      subject: "",
      message: "",
      website_hp: "",
    },
  });

  const onSubmit = async (data: InquiryFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to transmit message");
      }

      setIsSuccess(true);
      reset();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to deliver your inquiry. Please try again or email the office directly.";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-white p-8 sm:p-10 rounded-[3px] border border-sand shadow-xs space-y-6 overflow-hidden">
      {/* 4px Top Bar in Royal Blue */}
      <div className="absolute top-0 left-0 right-0 h-[4px] bg-royal-blue" />

      <div>
        <h3 className="font-heading font-bold text-2xl text-text">
          Send a Message to the Department
        </h3>
        <p className="text-sm text-text-muted mt-1 leading-relaxed">
          Submit admission inquiries, industry collaboration proposals, or academic requests directly to the Department of Information Technology desk.
        </p>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div
          role="status"
          aria-live="polite"
            className="p-5 rounded-xl bg-emerald/10 border border-emerald/30 text-emerald-text space-y-2 flex items-start gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-emerald-text">
              Inquiry Dispatched Successfully
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">
              Thank you for reaching out to TECRA IT. A department coordinator will review your inquiry and reply via email within 2 business days.
            </p>
            <button
              type="button"
              onClick={() => setIsSuccess(false)}
              className="text-xs font-semibold text-emerald-text underline pt-1"
            >
              Send another message
            </button>
          </div>
        </div>
      )}

      {/* Submission Error Banner */}
      {submitError && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-xl bg-burgundy/10 border border-burgundy/30 text-burgundy-text flex items-center gap-3 text-xs"
        >
          <AlertCircle className="w-4 h-4 text-burgundy shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Anti-spam honeypot (hidden from human visitors) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="inquiry-website-hp">Leave this field blank</label>
          <input
            id="inquiry-website-hp"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register("website_hp")}
          />
        </div>

        {/* Name and Email Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label
              htmlFor="inquiry-name"
              className="text-xs font-semibold uppercase tracking-wider text-text flex items-center justify-between"
            >
              <span>Full Name</span>
            </label>
            <input
              id="inquiry-name"
              type="text"
              {...register("name")}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
              placeholder="Dr. K. Raman or R. Priya"
              className={`w-full px-4 py-2.5 rounded-[3px] border text-sm bg-mist/30 text-text placeholder-text-muted focus-visible:outline-2 focus-visible:outline-royal-blue transition-colors ${
                errors.name ? "border-burgundy bg-burgundy/5" : "border-sand"
              }`}
            />
            {errors.name && (
              <p
                id="name-error"
                role="alert"
                aria-live="polite"
                className="text-xs text-burgundy-text font-medium flex items-center gap-1 mt-1"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="inquiry-email"
              className="text-xs font-semibold uppercase tracking-wider text-text flex items-center justify-between"
            >
              <span>Email Address</span>
            </label>
            <input
              id="inquiry-email"
              type="email"
              {...register("email")}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              placeholder="name@organization.com"
              className={`w-full px-4 py-2.5 rounded-[3px] border text-sm bg-mist/30 text-text placeholder-text-muted focus-visible:outline-2 focus-visible:outline-royal-blue transition-colors ${
                errors.email ? "border-burgundy bg-burgundy/5" : "border-sand"
              }`}
            />
            {errors.email && (
              <p
                id="email-error"
                role="alert"
                aria-live="polite"
                className="text-xs text-burgundy-text font-medium flex items-center gap-1 mt-1"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        {/* Category and Phone Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label
              htmlFor="inquiry-category"
              className="text-xs font-semibold uppercase tracking-wider text-text flex items-center justify-between"
            >
              <span>Inquiry Category</span>
            </label>
            <select
              id="inquiry-category"
              {...register("category")}
              className="w-full px-4 py-2.5 rounded-[3px] border border-sand text-sm bg-mist/30 text-text focus-visible:outline-2 focus-visible:outline-royal-blue transition-colors"
            >
              <option value="General">General Department Query</option>
              <option value="Admissions">Admissions and Eligibility</option>
              <option value="Academics">Academic Curriculum and Syllabus</option>
              <option value="Placements">Industry Placement and Hiring</option>
              <option value="Alumni">Alumni Relations</option>
              <option value="Collaboration">Research and Industry Collaboration</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="inquiry-phone"
              className="text-xs font-semibold uppercase tracking-wider text-text flex items-center justify-between"
            >
              <span>Phone Number (Optional)</span>
            </label>
            <input
              id="inquiry-phone"
              type="tel"
              {...register("phone")}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
              placeholder="+91 98765 43210"
              className={`w-full px-4 py-2.5 rounded-[3px] border text-sm bg-mist/30 text-text placeholder-text-muted focus-visible:outline-2 focus-visible:outline-royal-blue transition-colors ${
                errors.phone ? "border-burgundy bg-burgundy/5" : "border-sand"
              }`}
            />
            {errors.phone && (
              <p
                id="phone-error"
                role="alert"
                aria-live="polite"
                className="text-xs text-burgundy-text font-medium flex items-center gap-1 mt-1"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label
            htmlFor="inquiry-subject"
            className="text-xs font-semibold uppercase tracking-wider text-text flex items-center justify-between"
          >
            <span>Subject</span>
          </label>
          <input
            id="inquiry-subject"
            type="text"
            {...register("subject")}
            aria-invalid={!!errors.subject}
            aria-describedby={errors.subject ? "subject-error" : undefined}
            placeholder="Admission Inquiry for Academic Year 2026 to 2027"
            className={`w-full px-4 py-2.5 rounded-[3px] border text-sm bg-mist/30 text-text placeholder-text-muted focus-visible:outline-2 focus-visible:outline-royal-blue transition-colors ${
              errors.subject ? "border-burgundy bg-burgundy/5" : "border-sand"
            }`}
          />
          {errors.subject && (
            <p
              id="subject-error"
              role="alert"
              aria-live="polite"
              className="text-xs text-burgundy-text font-medium flex items-center gap-1 mt-1"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.subject.message}
            </p>
          )}
        </div>

        {/* Message Area */}
        <div className="space-y-1.5">
          <label
            htmlFor="inquiry-message"
            className="text-xs font-semibold uppercase tracking-wider text-text flex items-center justify-between"
          >
            <span>Inquiry Message</span>
          </label>
          <textarea
            id="inquiry-message"
            rows={5}
            {...register("message")}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
            placeholder="Please detail your inquiry, academic query, or collaboration request..."
            className={`w-full px-4 py-3 rounded-[3px] border text-sm bg-mist/30 text-text placeholder-text-muted focus-visible:outline-2 focus-visible:outline-royal-blue transition-colors resize-y ${
              errors.message ? "border-burgundy bg-burgundy/5" : "border-sand"
            }`}
          />
          {errors.message && (
            <p
              id="message-error"
              role="alert"
              aria-live="polite"
              className="text-xs text-burgundy-text font-medium flex items-center gap-1 mt-1"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.message.message}
            </p>
          )}
        </div>

        {/* Cloudflare Turnstile Notice */}
        <div className="p-3 rounded-[3px] bg-mist border border-sand flex items-center justify-between text-xs text-text-muted">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald" />
            Protected by Cloudflare Turnstile Bot Defense
          </span>
          <span className="font-mono text-text-muted">Secured Form</span>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center px-7 py-3.5 rounded-[3px] bg-royal-blue text-white text-sm font-semibold hover:bg-royal-blue/90 shadow-sm transition-colors duration-200 disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-royal-blue cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4" />
                <span>Transmitting Inquiry...</span>
              </span>
            ) : (
              <span>Submit Inquiry</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
