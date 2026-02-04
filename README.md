# Math Lessons - Interactive Education Platform

Interactive math lessons covering geometry, algebra, trigonometry, and more. Features adaptive question batching, progress tracking, and comprehensive educational content.

## 🚀 Live Demo

**Production:** https://lessons-gamma.vercel.app

## 📚 Features

### Lesson Categories

**Geometry (17 lessons)**
- Triangle properties (sum, inequality, Pythagorean theorem)
- Transformations (translation, reflection, rotation, dilation)
- Symmetry (reflection, rotational)
- Composite shapes and proportions
- Slope and tangent calculations

**Angles (7 lessons)**
- Naming angles (levels 1-2)
- Angle relationships
- Parallel and perpendicular lines
- Angle diagrams

**Algebra (12 lessons)**
- Equations and evaluating expressions
- Word problems and patterns
- Basic probability
- Venn diagrams

**Graphing & Image Lessons (6 lessons)**
- Plotting points
- Graphing lines
- Measuring with protractor
- Interactive canvas-based lessons

### Advanced Features

**Phase 2.5 - Batch System**
- Question caching for faster problem loading
- 10-question batches with progress tracking
- Accuracy metrics and completion modal
- "Load More Practice" for continuous learning

**Phase 2 - Modern Architecture**
- Custom hooks (`useLessonState`, `useAnswerValidation`, `useLessonProgress`)
- Redux Toolkit state management
- Error boundaries for graceful failures
- Lazy-loaded components for performance

**Interactive Components**
- Real-time answer validation
- Dynamic hints system
- Interactive geometry tools
- Canvas-based drawing (Konva)
- Math rendering (KaTeX)

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Redux Toolkit** - State management
- **React Router v6** - Client-side routing
- **Styled Components** - CSS-in-JS styling
- **Axios** - HTTP client
- **React Konva** - Canvas graphics
- **KaTeX** - Math rendering
- **Sentry** - Error monitoring

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/avivkatz1/lessons.git
cd lessons

# Install dependencies
npm install

# Start development server
npm start
```

## 🌐 Environment Configuration

### Development (.env.development)
```
REACT_APP_API_URL=http://localhost:5001
REACT_APP_ENV=development
```

### Production (.env.production)
```
REACT_APP_API_URL=https://aqueous-eyrie-54478.herokuapp.com
REACT_APP_ENV=production
DISABLE_ESLINT_PLUGIN=true
CI=false
```

## 📂 Project Structure

```
src/
├── features/lessons/           # Lesson components
│   ├── lessonTypes/
│   │   ├── geometry/          # 17 geometry lessons
│   │   ├── angles/            # 7 angle lessons
│   │   ├── algebra/           # 12 algebra lessons
│   │   ├── graphing/          # Plotting points
│   │   └── imageLessons/      # Canvas-based lessons
│   ├── components/            # Lesson-specific components
│   ├── pages/                 # Lesson pages (SelectingSection, LessonGeneral)
│   ├── Data.js                # Chapter/lesson structure
│   └── DataLesson.js          # Lesson mappings
├── shared/
│   ├── components/            # Reusable UI components
│   ├── helpers/               # 50+ math utility functions
│   └── images/                # 103 lesson images
├── store/                     # Redux store and selectors
├── hooks/                     # Custom React hooks
├── api/                       # API client and context
└── services/                  # Monitoring and validation
```

## 🎯 Key Components

### Redux State (`lessonSlice`)
- **Chapter & Lesson Selection** - Navigation state
- **Question-Answer Array** - Cached batch questions (Phase 2.5)
- **Batch Accuracy** - Track correct/total answers
- **User Answer & Feedback** - Input validation state
- **Error & Loading** - Error handling states
- **Lesson Props** - Current lesson configuration

### Custom Hooks
- **useLessonState** - Centralized lesson state access
- **useAnswerValidation** - Answer input and validation logic
- **useLessonProgress** - Progress tracking and batch management

### Main Routes
- `/` - Home/lesson selection page
- `/lessons/:lesson` - Individual lesson display
- `/lessons/chapter/:chapter` - Chapter-specific view

## 🚢 Deployment

### Automatic Deployment
- **Push to GitHub** → Automatically deploys to Vercel
- **Branch:** `main`
- **Build Command:** `npm run build`
- **Output Directory:** `build`

### Manual Deployment
```bash
# Build production bundle
npm run build

# Deploy to Vercel
vercel --prod
```

## 📊 Bundle Size

**Optimized production build:**
- Main bundle: **206.86 KB** (gzipped)
- Code splitting with lazy loading
- On-demand image loading
- Efficient math libraries

## 🔗 Backend API

All lessons connect to the unified Heroku backend:
- **Production:** https://aqueous-eyrie-54478.herokuapp.com
- **Endpoints:** `/lessons/content/:lessonName&:problemNumber&:levelNum`
- **Features:** 11-step middleware pipeline for question generation

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## 📝 Available Scripts

- `npm start` - Start development server (port 3000)
- `npm run build` - Build production bundle
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

## 🎨 Theming

- **Primary Color:** #1976D2 (Blue)
- **Theme:** Educational, clean, accessible
- **Favicon:** Custom math logo

## 📄 License

Part of the Math Helper educational platform.

## 🤝 Contributing

This is an educational platform. For questions or contributions, please contact the repository owner.

---

**Total Lessons:** 46
**Helper Functions:** 50+
**Images:** 103
**Supported Chapters:** 9

Built with ❤️ for math education
