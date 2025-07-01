'use client'
import dynamic from 'next/dynamic'
import { loader, OnMount } from '@monaco-editor/react'
import { registerDSLLanguage } from '../monaco/dslLanguage'

// configure AMD loader to fetch workers from CDN
loader.config({
  paths: { vs: 'https://unpkg.com/monaco-editor@0.40.0/min/vs' }
})

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

export function MonacoEditor({ value, onChange }: { value: string; onChange: (v: string | undefined) => void }) {
  const handleMount: OnMount = (editor, monaco) => {
    registerDSLLanguage(monaco)
  }

  return (
    <Editor
      height="400px"
      defaultLanguage="mydsl"
      value={value}
      onMount={handleMount}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        automaticLayout: true,
        fontFamily: 'monospace',
        wordWrap: 'on'
      }}
    />
  )
}

