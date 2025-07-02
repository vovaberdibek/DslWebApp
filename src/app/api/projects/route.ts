// src/app/api/projects/route.ts
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const all = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(all)
}

export async function POST(req: Request) {
  const { name, apiUrl, simUrl } = await req.json()
  const project = await prisma.project.create({
    data: { name, apiUrl, simUrl }
  })
  return NextResponse.json(project, { status: 201 })
}
