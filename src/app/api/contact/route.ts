import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { ContactMessage } from "@/models";
import { Resend } from "resend";

// Simple in-memory rate limiting by IP (max 5 requests per 10 minutes)
interface RateLimitEntry {
  count: number;
  firstRequestTime: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

// Validation Schema
const contactSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid institutional or personal email"),
  phone: z
    .string()
    .regex(/^$|^[0-9+\s-]{7,15}$/, "Please enter a valid phone number")
    .optional()
    .default(""),
  category: z
    .enum(["General", "Admissions", "Academics", "Placements", "Alumni", "Collaboration"])
    .default("General"),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(150),
  message: z.string().min(10, "Please provide a detailed inquiry message (at least 10 characters)").max(3000),
  // Anti-spam honeypot (should be empty if sent by human)
  website_hp: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export async function POST(req: NextRequest) {
  try {
    // 1. IP extraction and Rate Limiting
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const now = Date.now();

    const rateData = rateLimitMap.get(ip);
    if (rateData) {
      if (now - rateData.firstRequestTime < RATE_LIMIT_WINDOW_MS) {
        if (rateData.count >= MAX_REQUESTS_PER_WINDOW) {
          return NextResponse.json(
            {
              error:
                "Too many inquiries sent from this connection. Please try again after 10 minutes or email the office directly.",
            },
            { status: 429 }
          );
        }
        rateData.count += 1;
      } else {
        // Reset window
        rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
      }
    } else {
      rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
    }

    // 2. Parse and Validate Body
    const body = await req.json();
    const parseResult = contactSchema.safeParse(body);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.issues[0]?.message || "Invalid submission parameters";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, email, phone, category, subject, message, website_hp } =
      parseResult.data;

    // Reject honeypot traps silently
    if (website_hp && website_hp.length > 0) {
      return NextResponse.json({ success: true, message: "Inquiry received" });
    }

    const userAgent = req.headers.get("user-agent") || "unknown";

    // 3. Save to MongoDB
    let savedToDb = false;
    try {
      const { isConnected } = await connectToDatabase();
      if (isConnected) {
        await ContactMessage.create({
          name,
          email,
          phone,
          category,
          subject,
          message,
          ip,
          userAgent,
          isRead: false,
          isArchived: false,
        });
        savedToDb = true;
      }
    } catch (dbErr) {
      console.warn("[Contact API] MongoDB save failed or skipped:", dbErr);
    }

    // 4. Send Email Notification via Resend (if key provided)
    const emailApiKey = process.env.EMAIL_API_KEY;
    let emailDispatched = false;

    if (emailApiKey && emailApiKey.startsWith("re_")) {
      try {
        const resend = new Resend(emailApiKey);
        const fromAddress = process.env.EMAIL_FROM || "inquiries@tecra.sriet.ac.in";
        await resend.emails.send({
          from: fromAddress,
          to: ["itdepartment@sriet.ac.in"],
          replyTo: email,
          subject: `[TECRA Inquiry - ${category}] ${subject}`,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\nCategory: ${category}\n\nMessage:\n${message}`,
        });
        emailDispatched = true;
      } catch (emailErr) {
        console.warn("[Contact API] Resend email dispatch failed:", emailErr);
      }
    } else {
      console.log(
        `[Contact API Simulated Delivery] To: itdepartment@sriet.ac.in | From: ${name} <${email}> | Category: ${category} | Subject: ${subject}`
      );
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Thank you for contacting the Department of Information Technology. A coordinator will respond within 2 business days.",
        meta: {
          savedToDb,
          emailDispatched,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("[Contact API] Unexpected error:", err);
    return NextResponse.json(
      {
        error:
          "An unexpected error occurred while processing your message. Please reach out to itdepartment@sriet.ac.in directly.",
      },
      { status: 500 }
    );
  }
}
