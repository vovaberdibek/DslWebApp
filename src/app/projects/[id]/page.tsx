// src/app/projects/[id]/page.tsx
import prisma from '@/lib/prisma'
import ProjectIDE from './ProjectIDE'

export default async function ProjectPage({
  params
}: {
  params: { id: string }
}) {
  const project = await prisma.project.findUnique({ where: { id: params.id } })
  if (!project) {
    // you can throw or return notFound() here
    return <div>Project not found</div>
  }
  return <ProjectIDE project={project} />
}
