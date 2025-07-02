// src/app/projects/[id]/ProjectIDE.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { MonacoEditor } from '../../components/MonacoEditor'

interface Project {
  id: string
  name: string
  apiUrl: string
  simUrl: string
  dslConfig?: Record<string, any>
  createdAt: string
}

export default function ProjectIDE() {
  const router = useRouter()
  const id = usePathname().split('/').pop()!
  const [project, setProject] = useState<Project | null>(null)

  // Editor + run state
  const [dslText, setDslText] = useState('')
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState('')
  const [confirmDesc, setConfirmDesc] = useState<string | null>(null)

  // streaming refs
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  const decoder = new TextDecoder()
  const logRef = useRef<HTMLPreElement>(null)

  // File upload ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load project on mount
  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then(r => r.json())
      .then((p: Project) => {
        setProject(p)
        // initialize editor with stored config, if any
        setDslText(p.dslConfig ? JSON.stringify(p.dslConfig, null, 2) : '')
      })
      .catch(() => router.push('/projects'))
  }, [id, router])

  // Handle file‐upload into editor
  const onUploadClick = () => fileInputRef.current?.click()
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setDslText(reader.result as string)
    reader.readAsText(file)
  }

  // Confirm dialog handler
  const answer = async (ok: boolean) => {
    setConfirmDesc(null)
    await fetch(`${project?.apiUrl}/confirm_response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok }),
    })
    streamLogs()
  }

  // Kick off the workflow
  const runWorkflow = async () => {
    if (!project) return
    setRunning(true)
    setLog('')
    const res = await fetch(`${project.apiUrl}/run_workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dsl: dslText }),
    })
    if (!res.body) {
      setLog('❌ No stream returned')
      setRunning(false)
      return
    }
    readerRef.current = res.body.getReader()
    streamLogs()
  }

  // Read chunks and append to log, pause on confirm
  const streamLogs = async () => {
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
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
      }
    }
  }

  if (!project) return <div>Loading…</div>

  return (
    <div className="h-full flex flex-col p-4 space-y-4">
      {confirmDesc && (
        <div className="sticky top-0 bg-yellow-900 text-white flex justify-between p-3 rounded">
          <span>Confirm action: {confirmDesc}</span>
          <div className="space-x-2">
            <button onClick={() => answer(true)} className="bg-green-500 px-3 py-1 rounded">
              Yes
            </button>
            <button onClick={() => answer(false)} className="bg-red-500 px-3 py-1 rounded">
              No
            </button>
          </div>
        </div>
      )}

      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{project.name} IDE</h1>
        <div className="space-x-2">
          <button
            onClick={onUploadClick}
            className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Upload DSL
          </button>
          <button
            onClick={runWorkflow}
            disabled={running}
            className={`px-4 py-1 rounded ${
              running ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {running ? 'Running…' : 'Run'}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".dsl,.txt,.json"
          className="hidden"
          onChange={onFileChange}
        />
      </header>

      <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
        {/* Editor */}
        <div className="border rounded overflow-hidden flex flex-col">
          <MonacoEditor
            value={dslText}
            onChange={v => setDslText(v ?? '')}
            className="flex-1"
          />
        </div>

        {/* Logs */}
        <div className="border rounded p-2 bg-black text-green-200 font-mono overflow-auto">
          <pre ref={logRef} className="whitespace-pre-wrap">{log}</pre>
        </div>
      </div>
    </div>
  )
}
