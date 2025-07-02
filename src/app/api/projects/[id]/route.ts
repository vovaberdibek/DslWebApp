import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = await context
  const project = await prisma.project.findUnique({
    where: { id: (await params).id }
  })
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(project)
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = await context
  await prisma.project.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
