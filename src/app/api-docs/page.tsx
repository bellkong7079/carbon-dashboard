'use client'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const SwaggerUI = require('swagger-ui-react').default
import 'swagger-ui-react/swagger-ui.css'
import { useEffect, useState } from 'react'

export default function ApiDocsPage() {
  const [spec, setSpec] = useState<object | null>(null)
  useEffect(() => {
    fetch('/api/swagger').then((r) => r.json()).then(setSpec)
  }, [])
  if (!spec) return <div className="p-8 text-white">Loading API docs...</div>
  return <SwaggerUI spec={spec} />
}
