# Chicago Bike-Friendly Business Map - Frontend

## Project Overview

Static-first frontend for displaying bicycle-friendly businesses in Chicago using Astro's islands architecture. Connects to existing backend API for business data with server-side rendering and selective client-side hydration.

## Architecture

- **Type**: Multi-page static site with hydration islands
- **Framework**: Astro with selective JavaScript hydration
- **Map Library**: Leaflet.js (free, open source)
- **CSS Framework**: Minimal custom CSS with CSS Grid/Flexbox
- **Testing**: Jest for unit tests, Puppeteer for integration/visual tests
- **Build Tool**: Astro for static site generation + Vite under the hood
- **Hosting**: Render.com free static hosting tier

## Core Features

### Map View (Interactive Island)
- Interactive map centered on Chicago
- Color-coded pins by business category
- Clickable pins showing business details
- Responsive design for mobile/desktop
- Hydrates on page load (`client:load`)

### Business List (Interactive Island)
- Sortable business list (name, category, distance)
- Filter by category
- Search by business name
- Hydrates when visible (`client:visible`)

### Static Pages
- Contact page (fully static)
- FAQ page (fully static)
- Sponsorship information page (fully static)
- Navigation between pages (static routing)

## Technical Stack

```
Frontend: Astro + Leaflet.js islands
Static Generation: Server-side rendering at build time
Hydration: Selective client-side interactivity
Testing: Jest + Puppeteer (via MCP)
API: Fetch API connecting to bikefriendly-backend
CSS: Custom CSS with modern features
```

## Development Approach

### Islands Architecture Benefits
- **SEO-friendly**: Full HTML content indexed by search engines
- **Performance**: Instant page loads, progressive interactivity
- **Resilience**: Works without JavaScript for core content
- **Mobile-optimized**: Minimal JavaScript bundle

### Dev Procedure
- Before running end to end integration tests:
    - Ensure that the local database and API backend project are running

### Test-Driven Development
1. Write failing tests first
2. Implement minimal code to pass tests
3. Refactor when tests pass
4. Atomic commits per feature

### Project Structure
```
src/
├── pages/
│   ├── index.astro          # Home page with map + list islands
│   ├── contact.astro        # Static contact page
│   ├── faq.astro           # Static FAQ page
│   └── sponsorship.astro    # Static sponsorship page
├── components/
│   ├── Layout.astro         # Base layout component
│   ├── Map.astro           # Interactive map island
│   ├── BusinessList.astro   # Interactive list island
│   ├── BusinessCard.astro   # Business display component
│   ├── Navigation.astro     # Static navigation
│   └── MobileMenu.astro     # Mobile hamburger menu
├── scripts/
│   └── api.js              # Client-side API functions
├── services/
│   └── businessData.js     # Server-side data fetching
├── styles/
│   ├── global.css          # Global styles
│   ├── mobile.css          # Mobile-specific styles
│   └── components.css      # Component-specific styles
└── utils/
    ├── helpers.js          # Utility functions
    └── deviceDetection.js  # Device/viewport utilities
```

## API Integration

### Build-Time Data Fetching (Static)
- Fetch businesses during Astro build process
- Pre-render HTML with business data
- No loading states for initial content

### Client-Side API (Islands)
- `GET /api/businesses` - For filtering/searching
- `GET /api/businesses/:id` - For detailed business views
- Error handling and loading states for dynamic content

### Hybrid Approach
```astro
---
// Server-side: Runs at BUILD TIME
const initialBusinesses = await fetch(`${API_BASE}/businesses`).then(r => r.json());
---

<!-- Static HTML with initial data -->
<BusinessList 
  client:visible 
  initialBusinesses={initialBusinesses} 
  apiBaseUrl={API_BASE}
/>
```

## Key Development Milestones

1. **Environment Setup** - Astro project + responsive layouts
2. **Static Pages** - Contact, FAQ, Sponsorship with mobile navigation
3. **Data Layer** - Build-time business data fetching
4. **Responsive Layout** - Mobile-first CSS Grid/Flexbox system
5. **Map Island** - Interactive Leaflet map with touch support
6. **Business List Island** - Filtering and search with mobile UX
7. **Mobile Optimizations** - Touch gestures, PWA features
8. **Performance** - Optimize island loading and bundle size per device

## Testing Strategy

### Unit Tests (Jest)
- Business data processing functions
- Utility functions and helpers
- Client-side API service functions

### Integration Tests (Puppeteer via MCP)
- Map island hydration and interaction on mobile/desktop
- Touch vs mouse interaction testing
- Business filtering functionality across devices
- Navigation between static pages on different screen sizes
- Mobile responsive behavior and breakpoint testing
- Keyboard accessibility on desktop
- SEO metadata validation

### Static Generation Tests
- Build process completes successfully
- All pages generate proper HTML
- Business data properly embedded

## Mobile/Desktop Compatibility

### Responsive Design Strategy
- **Mobile-first CSS**: Base styles target mobile, progressive enhancement for desktop
- **Flexible layouts**: CSS Grid/Flexbox for adaptive layouts across screen sizes
- **Touch-friendly interfaces**: 44px minimum touch targets, adequate spacing
- **Viewport-aware islands**: Different hydration strategies per device type

### Device-Specific Features
```astro
<!-- Conditional hydration based on device -->
<Map 
  client:media="(min-width: 768px)" 
  mobileVersion={true}
  class="map-container"
/>

<BusinessList 
  client:visible 
  class="business-list-mobile md:business-list-desktop"
/>
```

### Mobile Optimizations
- **Reduced JavaScript**: Lighter bundles for mobile connections
- **Touch gestures**: Swipe navigation, pull-to-refresh
- **Offline support**: Service worker for cached business data
- **App-like experience**: PWA capabilities with app manifest

### Desktop Enhancements
- **Keyboard navigation**: Full accessibility support
- **Multi-column layouts**: Side-by-side map and business list
- **Hover states**: Rich interactions for mouse users
- **Advanced filtering**: More complex UI elements

## Performance Considerations

### Static Generation Benefits
- Zero JavaScript for static content
- Pre-rendered HTML loads instantly
- CDN-friendly static assets

### Island Optimization
- Lazy load map tiles only when map visible
- Debounce search input in business list
- Bundle splitting per island
- Device-specific code splitting
- Service worker for offline functionality (future)

### Mobile Performance
- **Smaller bundles**: Conditional loading based on device capabilities
- **Image optimization**: Responsive images with multiple sizes
- **Network awareness**: Adapt functionality based on connection speed
- **Battery considerations**: Reduce GPS usage, optimize animations

## SEO Advantages

- **Full HTML content** - Search engines index all business listings
- **Static routing** - Clean URLs for all pages
- **Meta tags** - Proper OpenGraph and Twitter cards
- **Structured data** - JSON-LD for local business schema
- **Fast loading** - Core Web Vitals optimization

## Deployment Pipeline

1. **Build Process**: Astro generates static HTML + minimal JS bundles
2. **Asset Optimization**: CSS/JS minification and compression
3. **Render.com**: Serves static files with global CDN
4. **Environment Variables**: API URL configuration per environment
5. **Automatic Deploys**: Git-based deployment workflow

## Code Quality Standards

- Modern JavaScript (ES2022+) in islands
- Semantic HTML5 markup with proper accessibility
- Progressive enhancement principles
- Clean component interfaces
- Comprehensive error handling
- Mobile-first responsive design

## Browser Support

- **Modern browsers**: Full experience with all islands (Chrome, Firefox, Safari, Edge)
- **Mobile browsers**: Optimized experience (iOS Safari, Chrome Mobile, Samsung Internet)
- **Legacy browsers**: Graceful degradation to static content
- **No JavaScript**: Core functionality still works
- **Slow connections**: Progressive loading of interactive features
- **Touch devices**: Full gesture support and touch-optimized UI
- **Desktop**: Enhanced interactions with keyboard and mouse support

## Security Considerations

- Content Security Policy for static hosting
- HTTPS only in production
- Sanitized data rendering
- Rate limiting handled by backend API
- No sensitive data in client bundles