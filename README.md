# ManFei SPA Frontend

React-based frontend for the ManFei Spa Business Web Application with role-based routing, LINE Login authentication, and CMS integration.

## Tech Stack

- **Framework:** React 18 + Vite
- **Routing:** React Router v6
- **Styling:** Tailwind CSS
- **State Management:** React Context + TanStack Query (React Query)
- **Authentication:** JWT (from backend LINE Login)
- **Rich Text Editor:** React-Quill
- **Image Upload:** Cloudinary Upload Widget
- **Icons:** Lucide React

## Project Structure

```
frontend-new/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable components
│   │   └── ProtectedRoute.jsx
│   ├── contexts/        # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/           # Page components
│   │   ├── Home.jsx
│   │   ├── Auth.jsx
│   │   ├── AuthCallback.jsx
│   │   ├── Staff.jsx
│   │   ├── Admin.jsx
│   │   └── NotFound.jsx
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
└── package.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend-new
npm install
```

### 2. Configure Environment Variables

Create a `.env` file (optional, defaults work for local development):

```env
VITE_API_URL=http://localhost:8000
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

Built files will be in the `dist/` directory.

## Routing Structure

### Public Routes
- `/` - Home page (public content display)
- `/auth` - LINE Login page
- `/auth/callback` - OAuth callback handler

### Protected Routes
- `/staff` - Staff portal (requires staff or admin role)
  - Daily work log form
  - Today's work hours summary
- `/admin/*` - Admin CMS dashboard (requires admin role)
  - `/admin` - Dashboard overview
  - `/admin/news` - News management
  - `/admin/services` - Services management
  - `/admin/products` - Products management
  - `/admin/testimonials` - Testimonials management
  - `/admin/portfolio` - Portfolio management
  - `/admin/staff-logs` - Staff work logs viewer

## Authentication Flow

1. User clicks "LINE Login" button on `/auth` page
2. Redirected to backend `/api/auth/line`
3. Backend redirects to LINE OAuth
4. User authorizes on LINE
5. LINE redirects back to backend `/api/auth/callback`
6. Backend generates JWT tokens and redirects to `/auth/callback?access_token=...&refresh_token=...&role=...`
7. Frontend saves tokens to localStorage and redirects based on role:
   - `admin` → `/admin`
   - `staff` → `/staff`
   - `customer` → `/` (with success message)

## Role-Based Access Control

Implemented via `ProtectedRoute` component that checks:
1. User is authenticated (has valid JWT)
2. User role matches required role(s)

### Roles

- **Customer:** Can only access public pages
- **Staff:** Can access `/staff` for work logging
- **Admin:** Full access to `/staff` and `/admin` CMS

## Components Overview

### `AuthContext`
- Manages authentication state
- Provides login/logout functions
- Auto-refreshes expired tokens
- Stores JWT in localStorage

### `ProtectedRoute`
- Wrapper component for protected pages
- Checks authentication and role
- Shows loading state during auth check
- Redirects unauthorized users

### Staff Portal (`/staff`)
**Features:**
- Service selection dropdown (from active services)
- Custom task name input (for non-service work)
- Hours input with 0.5 step
- Date locked to today (server validation)
- Today's logs table with total hours
- Mobile-first responsive design

**API Endpoints Used:**
- `GET /api/staff/menu` - Get active services
- `POST /api/staff/logs` - Create work log
- `GET /api/staff/logs/my` - Get today's logs

### Admin Dashboard (`/admin`)
**Architecture:**
- Sidebar navigation
- Nested routing for different sections
- Reusable CRUD components (to be implemented)

**Sections:**
- Dashboard - Overview stats
- News - CRUD + rich text editor
- Services - CRUD + category grouping
- Products - CRUD + stock management
- Testimonials - CRUD + rating system
- Portfolio - CRUD + category grouping
- Staff Logs - Read-only view with filters

## Development Status

### ✅ Completed
- [x] Vite + React + Tailwind setup
- [x] React Router structure
- [x] Authentication context and flow
- [x] LINE Login integration
- [x] Protected routes with role checking
- [x] Staff portal (full functionality)
- [x] Admin dashboard (routing structure)

### 🚧 In Progress / TODO
- [ ] Migrate Home page from existing vanilla JS design
- [ ] Implement Admin CMS CRUD interfaces
- [ ] Integrate React-Quill for rich text
- [ ] Integrate Cloudinary upload widget
- [ ] Implement drag-to-reorder for sort_order
- [ ] Build reusable DataTable component
- [ ] Build FormModal component
- [ ] Add loading states and error boundaries
- [ ] Implement pagination for large datasets
- [ ] Add search/filter functionality

## Cloudinary Integration

When implemented, the upload widget must enforce:

### Aspect Ratio Requirements
- **News & Services:** 16:9 landscape (`cropping_aspect_ratio: 1.77`)
- **Products, Testimonials, Portfolio:** 1:1 square (`cropping_aspect_ratio: 1.0`)

### Configuration
```javascript
{
  cloudName: 'your_cloud_name',
  uploadPreset: 'your_preset',
  sources: ['local'],
  cropping: 'server',
  showSkipCropButton: false,  // Force cropping
  clientAllowedFormats: ['png', 'jpg', 'webp'],
  croppingAspectRatio: 1.0, // or 1.77
  maxFileSize: 5000000, // 5MB
}
```

### Display with Tailwind
```jsx
{/* Square images */}
<img src={url} className="aspect-square object-cover w-full rounded-lg" />

{/* Landscape images */}
<img src={url} className="aspect-video object-cover w-full rounded-lg" />
```

## API Integration

All API calls go through Vite proxy (configured in `vite.config.js`):
- `/api/*` → `http://localhost:8000/api/*`

### Axios Configuration
```javascript
import axios from 'axios'

// Auth token is automatically added by AuthContext
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`

// Example API call
const response = await axios.get('/api/admin/news')
```

### TanStack Query (React Query)
```javascript
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error } = useQuery({
  queryKey: ['news'],
  queryFn: () => axios.get('/api/public/news').then(res => res.data),
})
```

## Styling Guidelines

### Tailwind Custom Classes
- `.section-padding` - Consistent section spacing
- `.container-custom` - Max-width container with padding
- `.fade-in` - Fade-in animation
- `.skeleton` - Loading skeleton

### Color Palette
Primary colors defined in `tailwind.config.js`:
```javascript
primary: {
  50: '#fdf8f6',
  100: '#f2e8e5',
  // ... up to 900
  900: '#43302b',
}
```

### Font
- Main font: Noto Serif TC (Google Fonts)
- Loaded in `index.css`

## Migration from Vanilla JS

The existing vanilla JavaScript frontend (`frontend/`) has:
- ✅ Beautiful UI/UX design
- ✅ Mobile-first responsive layout
- ✅ Lazy image loading
- ✅ Skeleton screens
- ✅ Service worker (PWA)
- ✅ Tailwind CSS styling

### Migration Strategy
1. **Components to convert:**
   - Header with mobile menu
   - Hero section
   - About section
   - News timeline cards
   - Service category cards
   - Product carousel
   - Testimonial slider
   - Before/After portfolio
   - Contact form
   - Footer

2. **Assets to copy:**
   - Images from `frontend/images/`
   - Design enhancements CSS
   - Favicon files

3. **Functionality to preserve:**
   - Smooth scroll
   - IntersectionObserver for animations
   - Debounced scroll handlers
   - Mobile menu toggle

## Deployment

### Docker (Production)

Create `Dockerfile` in `frontend-new/`:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables
Set production values in `.env.production`:
```env
VITE_API_URL=https://api.yourdomaincom
VITE_CLOUDINARY_CLOUD_NAME=prod_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=prod_preset
```

## Troubleshooting

**Issue:** "Failed to fetch" errors
- **Solution:** Ensure backend is running on port 8000

**Issue:** CORS errors
- **Solution:** Check backend CORS middleware allows `http://localhost:5173`

**Issue:** "Unauthorized" on protected routes
- **Solution:** Check JWT token in localStorage, try logging in again

**Issue:** Tailwind styles not working
- **Solution:** Ensure `index.css` is imported in `main.jsx`

**Issue:** React Router shows blank page
- **Solution:** Check browser console for import errors

## Development Tips

### Hot Reload
Vite provides instant hot module replacement. Save any file and see changes immediately.

### Dev Tools
- Install React Developer Tools browser extension
- Install TanStack Query Devtools (optional):
  ```jsx
  import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
  ```

### Code Organization
- Keep components small and focused
- Use custom hooks for reusable logic
- Prefer function components with hooks
- Use TypeScript for type safety (optional migration)

## License

Proprietary - ManFei SPA Business
