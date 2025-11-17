const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL

if (!WEBHOOK_URL) {
  console.warn('N8N_WEBHOOK_URL is not configured')
}

export interface WebhookPayload {
  session_id: string
  message: string
  timestamp: string
}

export async function sendToWebhook(sessionId: string, message: string): Promise<void> {
  if (!WEBHOOK_URL) {
    throw new Error('Webhook URL is not configured')
  }

  const payload: WebhookPayload = {
    session_id: sessionId,
    message,
    timestamp: new Date().toISOString(),
  }

  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Webhook request failed: ${response.statusText}`)
  }
}
