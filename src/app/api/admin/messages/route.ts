import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { ContactMessage } from "@/models";

export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(sessionToken);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { isConnected } = await connectToDatabase();
    if (!isConnected) {
      // In offline mode, return sample inquiry records so admin can test UI
      return NextResponse.json({
        messages: [
          {
            _id: "sample-msg-1",
            name: "Dr. K. Raman",
            email: "raman.prof@example.ac.in",
            phone: "+91 94432 10987",
            category: "Academics",
            subject: "Guest Lecture on Distributed Systems Architecture",
            message:
              "Greetings, I would like to propose an interactive 2-day workshop on modern distributed systems and container orchestration for final year IT students.",
            isRead: false,
            isArchived: false,
            createdAt: new Date().toISOString(),
          },
          {
            _id: "sample-msg-2",
            name: "R. Priya",
            email: "priya.candidate@gmail.com",
            phone: "+91 98765 43210",
            category: "Admissions",
            subject: "Lateral Entry B.Tech IT Admissions Inquiry",
            message:
              "Respected Admissions Team, I have completed my 3-year Diploma in Computer Technology with 92% aggregate. Please provide information on lateral entry vacancies for the upcoming session.",
            isRead: true,
            isArchived: false,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        unreadCount: 1,
        isFallback: true,
      });
    }

    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .lean();
    const unreadCount = await ContactMessage.countDocuments({
      isRead: false,
      isArchived: false,
    });

    return NextResponse.json({ messages, unreadCount, isFallback: false });
  } catch (err: unknown) {
    console.error("[Messages List Error]", err);
    return NextResponse.json({ error: "Failed to fetch inquiries" }, { status: 500 });
  }
}
