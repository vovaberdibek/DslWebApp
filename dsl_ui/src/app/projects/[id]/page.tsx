// src/app/projects/[id]/page.tsx
import ProjectIDE from './ProjectIDE'

export default async function ProjectPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  await params
  return <ProjectIDE />
}
