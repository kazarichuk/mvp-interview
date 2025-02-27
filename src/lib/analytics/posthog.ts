// src/lib/analytics/posthog.ts
import posthog from 'posthog-js'

export function initPostHog() {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      capture_pageview: true,
      disable_session_recording: process.env.NODE_ENV !== 'production'
    })
  }
}

export function captureEvent(eventName: string, properties?: any) {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties)
  }
}

export function identifyUser(userId: string, userProperties?: any) {
  if (typeof window !== 'undefined') {
    posthog.identify(userId, userProperties)
  }
}

export function captureException(error: Error, context?: any) {
  if (typeof window !== 'undefined') {
    posthog.capture('exception', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...context
    })
  }
}