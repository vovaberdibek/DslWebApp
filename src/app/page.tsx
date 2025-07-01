'use client'
import { useState, useRef } from 'react'
import { MonacoEditor } from './components/MonacoEditor'


type Error = { line: number; column: number; message: string }

export default function HomePage() {
  const [dsl, setDsl] = useState('')
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState('')
  const [confirmDesc, setConfirmDesc] = useState<string | null>(null)
  // const [jsonData, setJsonData] = useState<any>(null)
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
  const decoder = new TextDecoder()
  const logRef = useRef<HTMLPreElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const jsonInputRef = useRef<HTMLInputElement>(null)


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      setDsl(text)
    }
    reader.readAsText(file)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  // JSON file handlers
  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        setJsonData(JSON.parse(reader.result as string))
      } catch (err) {
        console.error('Invalid JSON file', err)
      }
    }
    reader.readAsText(file)
  }
  const handleJsonUpload = () => jsonInputRef.current?.click()


  const answer = async (ok: boolean) => {
    setConfirmDesc(null)
    await fetch('http://localhost:8000/confirm_response', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok })
    })
    runWorkflowStream()
  }

  const runWorkflow = async () => {
    setRunning(true); setLog('')
    const res = await fetch('http://localhost:8000/run_workflow', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dsl,          
    screwHoles: jsonData })
    })
    if (!res.body) { setLog('No stream returned'); setRunning(false); return }
    readerRef.current = res.body.getReader()
    runWorkflowStream()
  }

  const runWorkflowStream = async () => {
    const reader = readerRef.current!; let buf = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) { setRunning(false); break }
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

  const insertSnippet = (snippet: string) => {
    // forward refs not needed since MonacoEditor handles own editor instance
  }

  return (
    <div className="relative">
      {confirmDesc && (
        <div className="sticky top-0 bg-blue-900 text-white flex justify-between p-4">
          <span>Confirm: {confirmDesc}</span>
          <div className="space-x-2">
            <button onClick={() => answer(true)} className="bg-green-500 px-3 py-1 rounded">Yes</button>
            <button onClick={() => answer(false)} className="bg-red-500 px-3 py-1 rounded">No</button>
          </div>
        </div>
      )}

      <div className="p-6 grid md:grid-cols-3 gap-6">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold mb-2">DSL Editor</h2>
{/* 
          <input type="file" accept="application/json" ref={jsonInputRef} onChange={handleJsonFileChange} className="hidden" />
          <button onClick={handleJsonUpload} className="mb-2 px-3 py-1 bg-blue-200 hover:bg-blue-300 rounded">Upload JSON File</button>
          {jsonData && <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40 font-mono">{JSON.stringify(jsonData, null, 2)}</pre>} */}

          {/* File upload input (hidden) */}
          <input
            type="file"
            accept=".dsl,.txt"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          {/* Upload button */}
          <button
            onClick={handleFileUpload}
            className="mb-2 px-3 py-1 bg-blue-200 hover:bg-blue-300 rounded"
          >
            Upload DSL File
          </button>

          {/* Monaco editor */}
          <MonacoEditor value={dsl} onChange={v => setDsl(v ?? '')} />
          <button onClick={runWorkflow} disabled={running} className="mt-4 bg-green-600 px-4 py-2 text-white rounded">
            {running ? 'Running…' : 'Run Workflow'}
          </button>
        </div>

        <div className="flex flex-col">
          <h2 className="text-xl font-bold mb-2">Live Logs</h2>
          <pre ref={logRef} className="bg-gray-900 text-green-200 p-4 overflow-auto rounded font-mono">{log}</pre>
        </div>
{/* 
        <div className="flex flex-col">
          <h2 className="text-xl font-bold mb-2">Simulation View</h2>
          <div className="border rounded overflow-hidden">
            <img src="http://localhost:8080/stream?topic=/gui_camera/image_raw" alt="Gazebo" className="w-full h-full object-cover" />
          </div>
        </div> */}
      </div>
    </div>
  )
}
