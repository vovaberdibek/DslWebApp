'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Project {
  id: string
  name: string
  apiUrl: string
  simUrl: string
  dslConfig?: Record<string, any>
  createdAt: string
}

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([])
  const [name, setName] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [simUrl, setSimUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Load projects
  useEffect(() => {
    setLoading(true)
    fetch('/api/projects')
      .then(res => res.json())
      .then((data: Project[]) => {
        setProjects(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load projects')
        setLoading(false)
      })
  }, [])

  // Add new project
  const handleAdd = async () => {
    setError(null)
    if (!name || !apiUrl || !simUrl) {
      setError('Name, API URL & Sim URL are required')
      return
    }
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, apiUrl, simUrl })
    })
    if (!res.ok) {
      setError('Failed to create project')
      return
    }
    const p: Project = await res.json()
    setProjects([p, ...projects])
    setName('')
    setApiUrl('')
    setSimUrl('')
  }

  // Delete a project
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return
    await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    setProjects(projects.filter(p => p.id !== id))
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Projects</h1>

      {error && <div className="text-red-500">{error}</div>}

      <section className="border p-4 rounded space-y-4">
        <h2 className="text-xl font-semibold">New Project</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="API URL"
            value={apiUrl}
            onChange={e => setApiUrl(e.target.value)}
          />
          <input
            className="border p-2 rounded"
            placeholder="Simulation URL"
            value={simUrl}
            onChange={e => setSimUrl(e.target.value)}
          />
        </div>
        <button
          onClick={handleAdd}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Project
        </button>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Existing Projects</h2>
        {loading ? (
          <p>Loading…</p>
        ) : (
          <ul className="space-y-4 mt-4">
            {projects.map(proj => (
              <li
                key={proj.id}
                className="border p-4 rounded flex flex-col md:flex-row justify-between items-start md:items-center"
              >
                <div className="flex-1 space-y-1">
                  <div className="text-lg font-medium">{proj.name}</div>
                  <div className="text-sm text-gray-600">
                    API: <code>{proj.apiUrl}</code>
                  </div>
                  <div className="text-sm text-gray-600">
                    Sim: <code>{proj.simUrl}</code>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {new Date(proj.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="mt-2 md:mt-0 space-x-2">
                  <Link
                    href={`/projects/${proj.id}`}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Open IDE
                  </Link>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
