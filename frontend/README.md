# Ayush FHIR Microservice - React Frontend

A modern, engaging React frontend for the Ayush FHIR Microservice that provides traditional Indian medicine terminology mapping and FHIR interoperability.

## 🚀 Features

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Themes**: Beautiful color schemes with smooth transitions
- **Animations**: Framer Motion for smooth, engaging animations
- **Accessibility**: WCAG compliant with keyboard navigation

### 🔍 Advanced Search
- **Real-time Search**: Debounced search with instant results
- **Fuzzy Matching**: Intelligent search with scoring algorithm
- **Category Filtering**: Filter results by medical system
- **Sort Options**: Sort by relevance or alphabetical order

### 🌐 Translation Interface
- **Bidirectional Translation**: NAMASTE ↔ ICD-11 TM2
- **Code Validation**: Input validation with helpful error messages
- **External Links**: Direct links to ICD-11 browser
- **Copy to Clipboard**: One-click copying of codes

### 📋 FHIR Operations
- **CodeSystem Generation**: Complete NAMASTE terminology resource
- **ConceptMap Creation**: NAMASTE to ICD-11 mappings
- **JSON Preview**: Syntax-highlighted code display
- **Download Resources**: Export FHIR resources as JSON files

### ⚙️ Admin Panel
- **CSV Upload**: Drag-and-drop file upload with validation
- **Data Management**: Clear data, load samples, view statistics
- **System Monitoring**: Real-time health checks and metrics
- **Audit Trail**: Track all data operations

### 🔐 Authentication
- **Mock ABHA Integration**: Simulate ABHA OAuth flow
- **JWT Tokens**: Secure token-based authentication
- **User Consent**: Demonstrate consent-based data access
- **Token Management**: View and manage access tokens

### 📊 Analytics Dashboard
- **Interactive Charts**: Recharts for beautiful data visualizations
- **System Metrics**: Performance monitoring and usage statistics
- **Search Trends**: Track search patterns and popular terms
- **Health Monitoring**: Real-time system status

## 🛠️ Tech Stack

- **React 18**: Latest React with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Production-ready motion library
- **React Query**: Data fetching and caching
- **React Router**: Client-side routing
- **Axios**: HTTP client with interceptors
- **Recharts**: Composable charting library
- **React Hot Toast**: Beautiful notifications
- **Lucide React**: Beautiful icons

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn
- Backend server running on port 3000

### Installation

1. **Clone and navigate to frontend directory:**
```bash
cd ayush-fhir-microservice/frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm start
```

4. **Open your browser:**
```
http://localhost:3001
```

### Environment Variables

Create a `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENVIRONMENT=development
```

## 📁 Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Common/
│   │   │   └── LoadingSpinner.tsx
│   │   ├── Dashboard/
│   │   │   ├── QuickStats.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── RecentActivity.tsx
│   │   └── Layout/
│   │       ├── Layout.tsx
│   │       ├── Header.tsx
│   │       └── Sidebar.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── SearchPage.tsx
│   │   ├── TranslationPage.tsx
│   │   ├── FHIRPage.tsx
│   │   ├── AdminPage.tsx
│   │   ├── AuthPage.tsx
│   │   └── AnalyticsPage.tsx
│   ├── services/
│   │   └── api.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue shades for main actions
- **Secondary**: Orange/amber for accents
- **Accent**: Purple for special features
- **Success**: Green for positive actions
- **Warning**: Yellow for cautions
- **Error**: Red for errors

### Typography
- **Font Family**: Inter (primary), JetBrains Mono (code)
- **Font Weights**: 300, 400, 500, 600, 700
- **Responsive**: Fluid typography with clamp()

### Components
- **Buttons**: Primary, secondary, outline variants
- **Cards**: Consistent shadow and border radius
- **Forms**: Accessible inputs with validation states
- **Modals**: Overlay with backdrop blur
- **Charts**: Responsive with consistent styling

## 🔧 Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject (not recommended)
npm run eject
```

## 🌐 API Integration

The frontend integrates with the backend through:

- **Health Checks**: System status monitoring
- **Search API**: Fuzzy search with filters
- **Translation API**: Bidirectional code translation
- **FHIR API**: Resource generation
- **Admin API**: Data management
- **Auth API**: Mock ABHA authentication

## 📱 Responsive Design

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+
- **Breakpoints**: sm, md, lg, xl, 2xl

## 🚀 Performance Optimizations

- **Lazy Loading**: Route-based code splitting
- **Memoization**: React.memo for expensive components
- **Virtual Scrolling**: For large datasets
- **Image Optimization**: WebP with fallbacks
- **Bundle Splitting**: Vendor and app chunks
- **Caching**: React Query with smart invalidation

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📦 Build & Deployment

```bash
# Create production build
npm run build

# Serve locally
npx serve -s build

# Deploy to Vercel
vercel --prod

# Deploy to Netlify
netlify deploy --prod --dir=build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **FHIR Community**: For healthcare interoperability standards
- **Ayush Ministry**: For traditional medicine terminology
- **WHO**: For ICD-11 classification system
- **React Team**: For the amazing framework
- **Tailwind CSS**: For the utility-first approach
