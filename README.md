# MVP Interview Frontend

Frontend application for the MVP Interview system built with Next.js.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/kazarichuk/mvp-interview.git
cd mvp-interview
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Copy the environment variables:
```bash
cp .env.example .env.local
```

4. Update the environment variables in `.env.local` with your values.

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Production Build

Build the application:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm run start
# or
yarn start
```

## Deployment

This project is configured for deployment on Vercel. To deploy:

1. Push your changes to the main branch
2. Vercel will automatically deploy your changes

## Environment Variables

See `.env.example` for all required environment variables.

## Tech Stack

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- NextAuth.js
- Firebase

# hr: Platform to Hiring Designers

Platform to hiring designers.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev