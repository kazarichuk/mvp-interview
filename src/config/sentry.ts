import * as Sentry from '@sentry/nextjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Replay } from '@sentry/replay';

const SENTRY_DSN = 'https://0da1ed78da0576712c238d3b3194b94b@o4508889165922304.ingest.us.sentry.io/4509055271501824';

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
  environment: process.env.NODE_ENV,
  integrations: [
    nodeProfilingIntegration(),
    new Replay({
      maskAllText: true,
      blockAllMedia: true,
      maskAllInputs: true,
    }),
  ],
  beforeSend(event) {
    if (process.env.NODE_ENV === 'development') {
      console.log('Sentry event:', event);
    }
    return event;
  },
}); 