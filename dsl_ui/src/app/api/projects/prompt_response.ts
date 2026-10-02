import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const response = await fetch('http://localhost:8000/run_workflow', {
      method: 'POST',
      body: JSON.stringify(req.body),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // surface the bridge error message
      const message = data.detail || `HTTP ${response.status}`;
      return res.status(response.status).json({ detail: message });
    }

    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ detail: err?.message || 'Proxy error' });
  }
}

