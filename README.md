# TaskArena - MVC Architecture

TaskArena is a platform for conquering challenges and learning paths. This repository has been re-architected to a comprehensive MVC structure separating the React frontend (Vite) from the Node.js/Express backend (MongoDB).

## Architecture
- **Client (Frontend):** React.js initialized with Vite. Styled with Tailwind CSS. Uses `.jsx` extensions.
- **Server (Backend):** Node.js, Express, and MongoDB (via Mongoose). Incorporates JWT authentication.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (local or Atlas)

### Setup the Backend (server)
1. Navigate to the `server` directory: \`cd server\`
2. Install dependencies: \`npm install\`
3. Create a \`.env\` file in the `server` directory (one is provided by default):
   \`\`\`env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/taskarena
   JWT_SECRET=supersecretjwtkey123456789
   \`\`\`
4. Run the development server: \`npm run dev\` (Uses nodemon, running at http://localhost:5000)

### Setup the Frontend (client)
1. Open a new terminal and navigate to the `client` directory: \`cd client\`
2. Install dependencies: \`npm install\`
3. Create a \`.env\` file in the `client` directory:
   \`\`\`env
   VITE_API_URL=http://localhost:5000/api
   \`\`\`
4. Run the development server: \`npm run dev\` (Runs at http://localhost:5173 by default)

## Deployment

**Backend:** Deploy the `server` folder to services like Heroku, Render, or fly.io. Set the `MONGO_URI` safely in the environment variables.
**Frontend:** Deploy the `client` folder to services like Vercel, Netlify, or Surge. Ensure the build command is `npm run build` and output directory is `dist`. Set the `VITE_API_URL` to the production URL of your backend.

## Legacy Code
Any previous Next.js code has been safely archived in the `_legacy` folder for your reference if you need to migrate any specific Next.js page logic.
