# Chicago Bike-Friendly Business Map

A mobile-first web application for finding bicycle-friendly businesses in Chicago. Built with Astro's islands architecture for optimal performance and SEO.

## 🚴‍♀️ Features

- **Interactive Map**: Browse bike-friendly businesses on an interactive Chicago map
- **Business Directory**: Searchable list with filtering by category
- **Mobile Optimized**: Touch-friendly interface with responsive design
- **Fast Loading**: Static-first architecture with selective hydration
- **SEO Friendly**: Server-side rendered content for search engines
- **PWA Ready**: Progressive web app capabilities for mobile users

## 🛠️ Tech Stack

- **Frontend**: [Astro](https://astro.build/) with Islands Architecture
- **Map Library**: [Leaflet.js](https://leafletjs.com/) for interactive maps
- **Styling**: Custom CSS with mobile-first responsive design
- **Testing**: Jest for unit tests, Puppeteer for integration testing
- **Deployment**: Static hosting optimized (Render.com, Netlify, Vercel)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- A running backend API (see [Backend Setup](#backend-api))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/bikefriendly.git
   cd bikefriendly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.development
   ```
   
   Edit `.env.development` to match your backend API URL:
   ```env
   PUBLIC_API_BASE_URL=http://localhost:3000
   PUBLIC_APP_TITLE=Chicago Bike-Friendly Businesses
   SITE_URL=http://localhost:3001
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Visit [http://localhost:3001](http://localhost:3001)

## 📱 Mobile-First Design

This application is built with mobile users in mind:

- **Touch-friendly interface** with 44px minimum touch targets
- **Responsive layouts** that adapt from mobile to desktop
- **Progressive enhancement** - works without JavaScript
- **Fast loading** with minimal JavaScript bundles
- **PWA features** for app-like experience on mobile devices

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Run linting
npm run lint

# Format code
npm run format
```

## 🏗️ Building for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## 📂 Project Structure

```
src/
├── pages/                 # Astro pages (routes)
│   ├── index.astro       # Home page with map + business list
│   ├── contact.astro     # Contact page
│   ├── faq.astro        # FAQ page
│   └── sponsorship.astro # Sponsorship information
├── components/           # Reusable components
│   ├── Layout.astro     # Base layout with meta tags
│   ├── Map.astro        # Interactive map island
│   ├── BusinessList.astro # Filterable business list island
│   └── ...
├── services/            # Data fetching services
│   └── businessData.js  # API integration
├── styles/              # CSS files
│   ├── global.css       # Global styles and variables
│   ├── mobile.css       # Mobile-specific styles
│   └── components.css   # Component-specific styles
└── utils/               # Utility functions
    ├── deviceDetection.js # Responsive utilities
    └── helpers.js       # General helpers
```

## 🔧 Backend API

This frontend requires a backend API with the following endpoints:

- `GET /api/businesses` - Returns list of all businesses
- `GET /api/businesses/:id` - Returns specific business details

### Expected Business Data Format

```json
{
  "id": "unique-id",
  "name": "Business Name",
  "address": "123 Main St, Chicago, IL",
  "category": "restaurant",
  "latitude": 41.8781,
  "longitude": -87.6298,
  "amenities": ["bike_parking", "bike_repair"],
  "description": "Brief description",
  "website": "https://example.com",
  "phone": "(555) 123-4567"
}
```

For a compatible backend implementation, see: [bikefriendly-backend](https://github.com/yourusername/bikefriendly-backend)

## 🌐 Deployment

### Static Hosting (Recommended)

This app builds to static files and can be deployed to any static hosting service:

**Render.com**
```bash
# Build command
npm run build

# Publish directory
dist
```

**Netlify/Vercel**
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18+

### Environment Variables for Production

Set these environment variables in your hosting platform:

```env
PUBLIC_API_BASE_URL=https://your-backend-api.com
PUBLIC_APP_TITLE=Chicago Bike-Friendly Businesses
SITE_URL=https://your-frontend-domain.com
```

## 🎨 Customization

### Adding New Business Categories

1. Update the category filter in `src/components/BusinessList.astro`
2. Add corresponding styles in `src/styles/components.css`
3. Update map markers in `src/components/Map.astro`

### Changing the Map Center/Zoom

Edit the map initialization in `src/components/Map.astro`:

```javascript
const map = L.map('map').setView([41.8781, -87.6298], 12); // Chicago coordinates
```

### Customizing Colors and Fonts

Update CSS custom properties in `src/styles/global.css`:

```css
:root {
  --primary-color: #2563eb;
  --font-family: system-ui, sans-serif;
  /* ... */
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and add tests
4. Run tests: `npm test`
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenStreetMap](https://www.openstreetmap.org/) for map data
- [Leaflet.js](https://leafletjs.com/) for the mapping library
- [Astro](https://astro.build/) for the amazing static site framework
- Chicago cycling community for inspiration

## 📞 Support

- 📧 Email: support@bikefriendlychicago.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/bikefriendly/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/bikefriendly/discussions)

---

**Made with ❤️ for the Chicago cycling community**