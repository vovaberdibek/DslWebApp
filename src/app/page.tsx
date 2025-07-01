'use client'
import { useState, useRef } from 'react'
import { MonacoEditor } from './components/MonacoEditor'


type Error = { line: number; column: number; message: string }

export default function HomePage() {
  const [dsl, setDsl] = useState('')
  const [errors, setErrors] = useState<Error[]>([])
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState('')
  const [confirmDesc, setConfirmDesc] = useState<string | null>(null)
  const [jsonData, setJsonData] = useState<any>(null)
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
      for (let line of lines) {
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

          <input type="file" accept="application/json" ref={jsonInputRef} onChange={handleJsonFileChange} className="hidden" />
          <button onClick={handleJsonUpload} className="mb-2 px-3 py-1 bg-blue-200 hover:bg-blue-300 rounded">Upload JSON File</button>
          {jsonData && <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto max-h-40 font-mono">{JSON.stringify(jsonData, null, 2)}</pre>}

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

        <div className="flex flex-col">
          <h2 className="text-xl font-bold mb-2">Simulation View</h2>
          <div className="border rounded overflow-hidden">
            <img src="http://localhost:8080/stream?topic=/gui_camera/image_raw" alt="Gazebo" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  )
}


// 'use client'

// import { useState, useRef } from 'react'
// import Editor, { loader, OnMount } from '@monaco-editor/react'
// import { registerDSLLanguage } from './monaco/dslLanguage'    

// type Error = { line: number, column: number, message: string }

// export default function HomePage() {
//   const [dsl, setDsl] = useState('')
//   const [errors, setErrors] = useState<Error[]>([])
//   const [running, setRunning] = useState(false)
//   const [log, setLog] = useState('')
//   const [confirmDesc, setConfirmDesc] = useState<string | null>(null)
//   const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(null)
//   const decoder = new TextDecoder()
//   const logRef = useRef<HTMLPreElement>(null)
//   const editorRef = useRef<any>(null)


//   // point Monaco’s vs/ folder to the CDN
//   loader.config({
//     paths: {
//       vs: 'https://unpkg.com/monaco-editor@0.40.0/min/vs'
//     }
//   })

//   export default function HomePage() {
//     // onMount will fire after the CDN loader is ready
//     const onMount = (editor: any, monaco: typeof import('monaco-editor')) => {
//       registerDSLLanguage(monaco)
//     }
//     // Called once Monaco is ready
//   const onEditorMount: OnMount = (editor, monaco) => {
//     editorRef.current = editor
//     // 1) register your DSL syntax & autocompletion
//     registerDSLLanguage()

//     // 2) (optional) if you want to tweak further, e.g. snippet placeholders, you can
//     //    monaco.languages.registerCompletionItemProvider('mydsl', { … })
//   }

//   const insertSnippet = (snippet: string) => {
//     if (!editorRef.current) return
//     // this simulates typing so that undo/redo still works
//     editorRef.current.trigger('keyboard', 'type', { text: snippet })
//     editorRef.current.focus()
//   }
//   // This resumes the stream after the user clicks Yes/No
//   const answer = async (ok: boolean) => {
//     // hide modal
//     setConfirmDesc(null)
//     // tell the bridge
//     await fetch('http://localhost:8000/confirm_response', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ ok })
//     })
//     // resume reading
//     runWorkflowStream()
//   }

//   // initial “Run” kicks off reading
//   const runWorkflow = async () => {
//     setRunning(true)
//     setLog('')
//     const res = await fetch('http://localhost:8000/run_workflow', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ dsl })
//     })
//     if (!res.body) {
//       setLog('No stream returned')
//       setRunning(false)
//       return
//     }
//     readerRef.current = res.body.getReader()
//     runWorkflowStream()
//   }

//   // shared reader loop, pauses when NEED_CONFIRM appears
//   const runWorkflowStream = async () => {
//     const reader = readerRef.current!
//     let buf = ''
//     while (true) {
//       const { done, value } = await reader.read()
//       if (done) { setRunning(false); break }
//       buf += decoder.decode(value)
//       const lines = buf.split('\n')
//       buf = lines.pop()!  // leftover

//       for (let line of lines) {
//         // 1) pause on confirm request
//         if (line.startsWith('▶️ NEED_CONFIRM ')) {
//           setConfirmDesc(line.replace('▶️ NEED_CONFIRM ', ''))
//           return
//         }
//         // 2) otherwise log
//         setLog(l => l + line + '\n')
//         if (logRef.current) {
//           logRef.current.scrollTop = logRef.current.scrollHeight
//         }
//       }
//     }
//   }
// return (
//       <div className="relative">
//         {confirmDesc && (
//           <div className="sticky top-0 z-50 bg-blue-900 text-white flex items-center justify-between px-6 py-2 shadow-md">
//             <span className="font-medium">Confirm: {confirmDesc}</span>
//             <div className="space-x-2">
//               <button onClick={() => answer(true)} className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded">Yes</button>
//               <button onClick={() => answer(false)} className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded">No</button>
//             </div>
//           </div>
//         )}

//         <div className="p-6 grid md:grid-cols-3 gap-6">
//           <div className="flex flex-col">
//             <h2 className="text-xl font-bold mb-2">DSL Editor</h2>

//             {/* Monaco Editor */}
//             <div className="border rounded overflow-hidden">
//               <Editor
//                 height="300px"
//                 defaultLanguage="mydsl"      // match the id you registered
//                 value={dsl}
//                 onMount={onEditorMount}
//                 onChange={(v) => setDsl(v ?? '')}
//                 options={{
//                   fontFamily: 'monospace',
//                   fontSize: 14,
//                   minimap: { enabled: false },
//                   automaticLayout: true,
//                   wordWrap: 'on',
//                 }}
//               />
//             </div>

//             {/* Quick-insert snippet buttons */}
//             <div className="mt-2 flex flex-wrap gap-2">
//               <button
//                 onClick={() => insertSnippet('Agents:\n  - agent1\n')}
//                 className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
//               >
//                 add Agents
//               </button>
//               <button
//                 onClick={() => insertSnippet('Locations:\n  - locA\n')}
//                 className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
//               >
//                 add Locations
//               </button>
//               <button
//                 onClick={() => insertSnippet('Trays:\n  - trayX\n')}
//                 className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
//               >
//                 add Trays
//               </button>
//               {/* …and so on for your most-used blocks */}
//             </div>

//             <button
//               onClick={runWorkflow}
//               disabled={running || errors.length > 0}
//               className="mt-4 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
//             >
//               {running ? 'Running…' : 'Run Workflow'}
//             </button>
//           </div>

//           {/* Live Logs and Simulation View stay the same */}
//           …  
//         </div>
//       </div>
//     )
//   }


  
//   return (
//     <div className="relative">
//       {/* ─────────── Sticky Confirmation Bar ─────────── */}
//       {confirmDesc && (
//         <div className="sticky top-0 z-50 bg-blue-900 text-white flex items-center justify-between px-6 py-2 shadow-md">
//           <span className="font-medium">Confirm: {confirmDesc}</span>
//           <div className="space-x-2">
//             <button
//               onClick={() => answer(true)}
//               className="px-3 py-1 bg-green-500 hover:bg-green-600 rounded"
//             >
//               Yes
//             </button>
//             <button
//               onClick={() => answer(false)}
//               className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded"
//             >
//               No
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="p-6 grid md:grid-cols-3 gap-6">
//         <div className="flex flex-col">
//           <h2 className="text-xl font-bold mb-2">DSL Editor</h2>
//           <textarea
//             className="border p-2 h-64 font-mono"
//             value={dsl}
//             onChange={e => setDsl(e.target.value)}
//           />
//           <button
//             onClick={runWorkflow}
//             disabled={running || errors.length > 0}
//             className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
//           >
//             {running ? 'Running…' : 'Run Workflow'}
//           </button>
//         </div>

//         <div className="flex flex-col">
//           <h2 className="text-xl font-bold mb-2">Live Logs</h2>
//           <pre
//             ref={logRef}
//             className="bg-gray-900 text-green-200 p-4 flex-1 overflow-auto rounded font-mono"
//           >
//             {log}
//           </pre>
//         </div>
//         {/* ── Column 3: Simulation Stream ── */}
//         <div className="flex flex-col">
//           <h2 className="text-xl font-bold mb-2">Simulation View</h2>
//           <div className="flex-1 border rounded overflow-hidden">
//             <img 
//               src="http://localhost:8080/stream?topic=/gui_camera/image_raw" 
//               className="w-full h-full object-cover" 
//               alt="Gazebo stream" 
//             />
//           </div>
//         </div>

//       </div>
//     </div>
//   )
// }
  



//------------------------------------------------------------------------------------------------------------

// 'use client'
// import { useState, useEffect, useRef } from 'react'

// export default function HomePage() {
//   const [dsl, setDsl] = useState('')
//   const [errors, setErrors] = useState<{line:number,column:number,message:string}[]>([])
//   const [checking, setChecking] = useState(false)
//   const [running, setRunning] = useState(false)
//   const [log, setLog] = useState('')
//   const logRef = useRef<HTMLPreElement>(null)

//   // syntax check
//   const checkSyntax = async (code: string) => {
//     setChecking(true)
//     const res = await fetch('http://localhost:8000/parse_dsl', {
//       method:'POST', headers:{'Content-Type':'application/json'},
//       body: JSON.stringify({ dsl: code })
//     })
//     const json = await res.json()
//     setErrors(json.errors)
//     setChecking(false)
//   }

//   // run the full workflow & stream logs
//   const runWorkflow = async () => {
//     setRunning(true)
//     setLog('')
//     const res = await fetch('http://localhost:8000/run_workflow', {
//       method:'POST', headers:{'Content-Type':'application/json'},
//       body: JSON.stringify({ dsl })
//     })
//     if (!res.body) {
//       setLog('No stream returned')
//       setRunning(false)
//       return
//     }
//     const reader = res.body.getReader()
//     const decoder = new TextDecoder()
//     while (true) {
//       const { done, value } = await reader.read()
//       if (done) break
//       setLog((l) => l + decoder.decode(value))
//       // auto-scroll
//       if (logRef.current) {
//         logRef.current.scrollTop = logRef.current.scrollHeight
//       }
//     }
//     setRunning(false)
//   }

//   return (
//     <div className="p-6 grid md:grid-cols-2 gap-6">
//       <div className="flex flex-col">
//         <h2 className="text-xl font-bold mb-2">DSL Editor</h2>
//         <textarea
//           className="border p-2 h-64 font-mono"
//           value={dsl}
//           onChange={e => setDsl(e.target.value)}
//         />
//         <div className="mt-2 space-x-2">
//           <button
//             onClick={() => checkSyntax(dsl)}
//             disabled={checking}
//             className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
//           >
//             {checking ? 'Checking…' : 'Check Syntax'}
//           </button>
//           <button
//             onClick={runWorkflow}
//             disabled={running || checking || errors.length > 0}
//             className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
//           >
//             {running ? 'Running…' : 'Run Workflow'}
//           </button>
//         </div>
//         {errors.length > 0 && (
//           <div className="mt-2 text-red-600">
//             {errors.map((e,i) =>
//               <div key={i}>Line {e.line},Col {e.column}: {e.message}</div>
//             )}
//           </div>
//         )}
//       </div>

//       <div className="flex flex-col">
//         <h2 className="text-xl font-bold mb-2">Live Logs</h2>
//         <pre
//           ref={logRef}
//           className="bg-gray-900 text-green-200 p-4 flex-1 overflow-auto rounded font-mono"
//         >
//           {log}
//         </pre>
//       </div>
//     </div>
//   )
// }
