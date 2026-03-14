import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, type, data } = body;

    if (!title || !type || !data) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const iteration = await prisma.iteration.create({
      data: {
        title,
        type,
        data: JSON.stringify(data),
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true, iteration });
  } catch (error) {
    console.error("Error saving iteration:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
