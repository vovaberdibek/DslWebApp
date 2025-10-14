import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // forward to your FastAPI bridge
  const response = await fetch('http://localhost:8000/prompt_response', {
    method: 'POST',
    body: JSON.stringify(req.body),
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  res.status(response.status).json(data);
}
