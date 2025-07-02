// src/app/projects/[id]/ProjectIDE.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MonacoEditor } from '@/app/components/MonacoEditor'

type Project = {
  id: string
  name: string
  apiUrl: string
  simUrl: string
  dslConfig: any
  createdAt: string
}

export default function ProjectIDE() {
  const pathname = usePathname()
  const router = useRouter()
  const id = pathname?.split('/').pop() || ''

  const [project, setProject] = useState<Project | null>(null)
  const [dsl, setDsl] = useState('')
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState('')
  const [confirmDesc, setConfirmDesc] = useState<string | null>(null)
  const [jsonData, setJsonData] = useState<any>(null)

  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  const logRef = useRef<HTMLPreElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const jsonInputRef = useRef<HTMLInputElement>(null)
  const decoder = new TextDecoder()

  // Load the project on mount
  useEffect(() => {
    if (!id) return
    fetch(`/api/projects/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Project not found')
        return res.json()
      })
      .then((p: Project) => {
        setProject(p)
        // preload the DSL editor with the saved config
        if (p.dslConfig) {
          setDsl(JSON.stringify(p.dslConfig, null, 2))
        }
      })
      .catch(() => {
        // redirect back to list if bad ID
        router.push('/projects')
      })
  }, [id, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setDsl(reader.result as string)
    }
    reader.readAsText(file)
  }
  const handleFileUpload = () => fileInputRef.current?.click()

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        setJsonData(JSON.parse(reader.result as string))
      } catch {
        console.error('Invalid JSON file')
      }
    }
    reader.readAsText(file)
  }
  const handleJsonUpload = () => jsonInputRef.current?.click()

  const answer = async (ok: boolean) => {
    if (!project) return
    setConfirmDesc(null)
    await fetch(`${project.apiUrl}/confirm_response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok }),
    })
    runWorkflowStream()
  }

  const runWorkflow = async () => {
    if (!project) return
    setRunning(true)
    setLog('')
    const res = await fetch(`${project.apiUrl}/run_workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dsl, screwHoles: jsonData }),
    })
    if (!res.body) {
      setLog('No stream returned')
      setRunning(false)
      return
    }
    readerRef.current = res.body.getReader()
    runWorkflowStream()
  }

  const runWorkflowStream = async () => {
    const reader = readerRef.current!
    let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        setRunning(false)
        break
      }
      buf += decoder.decode(value)
      const lines = buf.split('\n')
      buf = lines.pop()!
      for (const line of lines) {
        if (line.startsWith('▶️ NEED_CONFIRM ')) {
          setConfirmDesc(line.replace('▶️ NEED_CONFIRM ', ''))
          return
        }
        setLog(l => l + line + '\n')
        if (logRef.current) {
          logRef.current.scrollTop = logRef.current.scrollHeight
        }
      }
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{project?.name} IDE</h1>
        <Link href="/projects" className="text-blue-600 hover:underline">
          ← Back to Projects
        </Link>
      </div>

      {confirmDesc && (
        <div className="sticky top-0 bg-yellow-200 p-4 rounded">
          <span>Confirm: {confirmDesc}</span>
          <div className="space-x-2 float-right">
            <button
              onClick={() => answer(true)}
              className="bg-green-500 px-3 py-1 rounded text-white"
            >
              Yes
            </button>
            <button
              onClick={() => answer(false)}
              className="bg-red-500 px-3 py-1 rounded text-white"
            >
              No
            </button>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* DSL Editor */}
        <div className="flex flex-col">
          <h2 className="font-semibold mb-2">DSL Editor</h2>

          <input
            type="file"
            accept=".dsl,.txt"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={handleFileUpload}
            className="mb-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Upload DSL File
          </button>

          <MonacoEditor value={dsl} onChange={v => setDsl(v ?? '')} />

          <input
            type="file"
            accept="application/json"
            ref={jsonInputRef}
            onChange={handleJsonFileChange}
            className="hidden"
          />
          <button
            onClick={handleJsonUpload}
            className="mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            Upload Screw Holes JSON
          </button>

          <button
            onClick={runWorkflow}
            disabled={running}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {running ? 'Running…' : 'Run Workflow'}
          </button>
        </div>

        {/* Live Logs */}
        <div className="flex flex-col">
          <h2 className="font-semibold mb-2">Live Logs</h2>
          <pre
            ref={logRef}
            className="bg-black text-green-200 p-4 rounded h-96 overflow-auto font-mono"
          >
            {log}
          </pre>
        </div>

        {/* Simulation View */}
        <div className="flex flex-col">
          <h2 className="font-semibold mb-2">Simulation View</h2>
          <div className="border rounded h-96 overflow-hidden">
            <img
              src={project?.simUrl + '/stream?topic=/gui_camera/image_raw'}
              alt="Sim View"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
