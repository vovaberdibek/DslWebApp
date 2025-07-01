// src/app/api/projects/route.ts
import { NextResponse } from 'next/server'
import prisma from '../../../lib/prisma'

export async function GET() {
  const all = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(all)
}

export async function POST(req: Request) {
  const { name, apiUrl, simUrl, dslConfig } = await req.json()
  const p = await prisma.project.create({ data: { name, apiUrl, simUrl, dslConfig } })
  return NextResponse.json(p, { status: 201 })
}
