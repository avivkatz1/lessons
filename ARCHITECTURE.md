# Frontend Architecture

## Overview

This is the **main frontend repository** for the math education platform. The backend is maintained separately.

## Repository Structure

```
/frontends/lessons/              ← This frontend (Vercel) - MAIN DEVELOPMENT
/backend/aqueous-eyrie-54478/    ← Backend (Heroku)
```

## Deployment

- **Frontend**: Deployed to Vercel from this repository
- **Backend**: Deployed to Heroku at https://aqueous-eyrie-54478.herokuapp.com
- **Architecture**: Decoupled frontend/backend with separate hosting

## Important Notes

### ✅ This is the CORRECT frontend to work on

**Always develop frontend features in this repository.**

The backend repository previously had a `/client/` folder that has been archived. That was legacy code. This `/frontends/lessons/` is the active, deployed frontend.

## Development Workflow

### Frontend Development (This Repo)

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm start

# Run tests
npm test

# Build for production
npm run build
```

The frontend automatically connects to:
- **Development**: `http://localhost:5001` (local backend)
- **Production**: `https://aqueous-eyrie-54478.herokuapp.com` (Heroku backend)

See `src/api/client.js` for API configuration.

### Full Stack Development

You need TWO terminal windows:

**Terminal 1 - Backend:**
```bash
cd ../../backend/aqueous-eyrie-54478
npm start
```

**Terminal 2 - Frontend (This Repo):**
```bash
npm start
```

Then open http://localhost:3000

## Tech Stack

- **React** 19.2.4 - UI library
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Styled Components** - Styling
- **Konva** - Canvas graphics for geometry lessons
- **KaTeX** - Math rendering
- **Axios** - API client

## Key Features

### Phase 2 Refactoring (January 2026)

The frontend was significantly refactored with:
- Custom hooks (`useLessonState`, `useAnswerValidation`)
- Lazy loading for lesson components
- Error boundaries for graceful failures
- 30+ Redux selectors for centralized state access

See `REFACTORING.md` for full details.

### Dark Mode

The app supports light/dark theme toggling:
- Theme state managed in Redux (`themeSlice`)
- `useTheme` hook for components
- Theme persists in localStorage
- Toggle button in `Header` and `LessonHeader` components

### Lesson System

44+ interactive math lessons covering:
- Geometry (triangles, angles, pythagorean theorem, trigonometry)
- Algebra (equations, graphing, slope)
- Fractions and operations
- And more...

Each lesson uses an 11-step backend middleware pipeline to generate unique problems.

## Project Structure

```
src/
├── api/                    # API client and context
├── app/                    # Redux store configuration
├── features/
│   └── lessons/           # Lesson components and pages
│       ├── components/    # Shared lesson components
│       ├── lessonTypes/   # Individual lesson implementations
│       └── pages/         # Main pages (SelectingSection, LessonGeneral)
├── shared/
│   ├── components/        # Reusable UI components
│   ├── helpers/           # Math helper functions
│   └── hooks/             # Custom React hooks
├── store/                 # Redux slices
├── theme/                 # Theme configuration
└── utils/                 # Utility functions
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- LessonGeneral.test.js

# Run E2E screenshot tests
node e2e/comprehensive-lesson-load.test.js
```

## Environment Variables

No environment variables required for local development. The API baseURL is configured in `src/api/client.js` based on `NODE_ENV`.

## Deployment

Vercel automatically deploys:
- **Production**: Commits to `main` branch
- **Preview**: Pull requests

## Questions?

- Backend issues? Check `/backend/aqueous-eyrie-54478/`
- Frontend issues? You're in the right place
- Deployment issues? Verify Vercel (frontend) and Heroku (backend) configs

## Related Documentation

- `REFACTORING.md` - Phase 2 refactoring details
- `QUICK_REFERENCE.md` - Quick development reference
- `VISUAL_DESIGN_RULES.md` - Design guidelines
- `README.md` - General project information
