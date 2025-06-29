# Viewport-Based Business Data Loading Strategy

## Overview

This approach combines build-time data fetching for the default map viewport with lazy loading of adjacent areas as users explore. This provides optimal performance while supporting unlimited business growth.

## Core Strategy

### Build-Time Loading (Default Viewport)
- Fetch only businesses visible in initial Chicago map bounds
- Reduces build payload from 200KB+ to 20-50KB
- Maintains SEO benefits and instant loading for core area
- Fast builds (5-10 seconds vs 60+ seconds)

### Runtime Lazy Loading (Adjacent Areas)
- Load businesses as user pans/zooms map
- Cache loaded areas to prevent duplicate requests
- Progressive enhancement of map data
- No loading spinners for core experience

## Implementation Details

### 1. Default Viewport Configuration

```javascript
// Define initial Chicago map bounds for build-time fetch
const DEFAULT_VIEWPORT = {
  center: { lat: 41.8781, lng: -87.6298 }, // Chicago Loop
  bounds: {
    north: 41.95,
    south: 41.75,
    east: -87.55,
    west: -87.75
  },
  radius: 5 // miles from center
};
```

### 2. Build-Time Data Fetching

```astro
---
// src/services/businessData.js - Build-time service
export async function fetchDefaultViewportBusinesses() {
  const apiUrl = import.meta.env.PUBLIC_API_BASE_URL;
  const { center, radius } = DEFAULT_VIEWPORT;
  
  try {
    const response = await fetch(
      `${apiUrl}/api/businesses?lat=${center.lat}&lng=${center.lng}&radius=${radius}`
    );
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch default viewport businesses:', error);
    return [];
  }
}

// In page component
const initialBusinesses = await fetchDefaultViewportBusinesses();
---

<Map 
  client:load
  initialBusinesses={initialBusinesses}
  defaultViewport={DEFAULT_VIEWPORT}
/>
```

### 3. Client-Side Lazy Loading

```javascript
// src/scripts/mapDataLoader.js
class MapDataLoader {
  constructor(map, apiBaseUrl) {
    this.map = map;
    this.apiBaseUrl = apiBaseUrl;
    this.loadedAreas = new Set();
    this.businesses = new Map(); // Cache all loaded businesses
  }

  async loadBusinessesInBounds(bounds) {
    const boundsKey = this.getBoundsKey(bounds);
    
    // Skip if already loaded
    if (this.loadedAreas.has(boundsKey)) {
      return [];
    }

    try {
      const response = await fetch(
        `${this.apiBaseUrl}/api/businesses?bounds=${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`
      );
      
      const newBusinesses = await response.json();
      
      // Cache the area and businesses
      this.loadedAreas.add(boundsKey);
      newBusinesses.forEach(business => {
        this.businesses.set(business.id, business);
      });
      
      return newBusinesses;
    } catch (error) {
      console.error('Failed to load businesses for bounds:', error);
      return [];
    }
  }

  getBoundsKey(bounds) {
    // Create unique key for bounds (rounded to prevent excessive granularity)
    const precision = 3;
    return `${bounds.getSouth().toFixed(precision)},${bounds.getWest().toFixed(precision)},${bounds.getNorth().toFixed(precision)},${bounds.getEast().toFixed(precision)}`;
  }

  setupLazyLoading() {
    let loadTimeout;
    
    this.map.on('moveend', () => {
      clearTimeout(loadTimeout);
      
      // Debounce to prevent excessive API calls
      loadTimeout = setTimeout(async () => {
        const currentBounds = this.map.getBounds();
        const newBusinesses = await this.loadBusinessesInBounds(currentBounds);
        
        if (newBusinesses.length > 0) {
          this.addBusinessesToMap(newBusinesses);
        }
      }, 300);
    });
  }

  addBusinessesToMap(businesses) {
    businesses.forEach(business => {
      const marker = L.marker([business.latitude, business.longitude])
        .bindPopup(`
          <h3>${business.name}</h3>
          <p>${business.category}</p>
          ${business.phone ? `<p>📞 ${business.phone}</p>` : ''}
          ${business.url ? `<p><a href="${business.url}" target="_blank">Visit Website</a></p>` : ''}
        `)
        .addTo(this.map);
      
      // Store marker reference for future management
      marker.businessId = business.id;
    });
  }
}
```

### 4. Map Component Integration

```astro
<!-- src/components/Map.astro -->
---
export interface Props {
  initialBusinesses: Business[];
  defaultViewport: Viewport;
}

const { initialBusinesses, defaultViewport } = Astro.props;
---

<div id="map" class="map-container" data-testid="business-map"></div>

<script define:vars={{ initialBusinesses, defaultViewport }}>
  import { MapDataLoader } from '../scripts/mapDataLoader.js';
  
  // Initialize map
  const map = L.map('map').setView(
    [defaultViewport.center.lat, defaultViewport.center.lng], 
    13
  );

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  // Add initial businesses from build-time data
  initialBusinesses.forEach(business => {
    L.marker([business.latitude, business.longitude])
      .bindPopup(`
        <h3>${business.name}</h3>
        <p>${business.category}</p>
        ${business.phone ? `<p>📞 ${business.phone}</p>` : ''}
        ${business.url ? `<p><a href="${business.url}" target="_blank">Visit Website</a></p>` : ''}
      `)
      .addTo(map);
  });

  // Setup lazy loading for adjacent areas
  const apiBaseUrl = import.meta.env.PUBLIC_API_BASE_URL;
  const dataLoader = new MapDataLoader(map, apiBaseUrl);
  dataLoader.setupLazyLoading();
</script>
```

## Backend API Requirements

### Bounds Query Support

```javascript
// Backend: GET /api/businesses?bounds=south,west,north,east
app.get('/api/businesses', async (req, res) => {
  const { bounds, lat, lng, radius } = req.query;
  
  let query = 'SELECT * FROM businesses WHERE is_active = true';
  let params = [];
  
  if (bounds) {
    const [south, west, north, east] = bounds.split(',').map(parseFloat);
    query += ' AND latitude BETWEEN $1 AND $2 AND longitude BETWEEN $3 AND $4';
    params = [south, north, west, east];
  } else if (lat && lng && radius) {
    // Haversine distance formula for radius queries
    query += ` AND (
      6371 * acos(
        cos(radians($1)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians($2)) +
        sin(radians($1)) * sin(radians(latitude))
      )
    ) <= $3`;
    params = [parseFloat(lat), parseFloat(lng), parseFloat(radius)];
  }
  
  const result = await db.query(query, params);
  res.json(result.rows);
});
```

## Performance Benefits

### Build Performance
- **Before**: 60+ second builds with 2,000+ businesses
- **After**: 5-10 second builds with ~100-200 businesses
- **Scalability**: Build time stays constant regardless of total business count

### Runtime Performance
- **Initial Load**: 20-50KB HTML vs 200KB+
- **Progressive Loading**: Only fetch what user views
- **Caching**: Prevent duplicate API calls for same areas
- **Mobile Friendly**: Smaller initial payload, data loads as needed

### User Experience
- **Instant Map**: No loading spinner for core Chicago area
- **Seamless Exploration**: Businesses appear as user pans
- **Offline Resilience**: Core area works without network
- **SEO Maintained**: Search engines index default viewport businesses

## Scalability Considerations

### Geographic Expansion
- Adding Milwaukee/Madison doesn't affect Chicago build times
- Each city can have its own default viewport
- Regional APIs can be implemented independently

### Business Growth
- 10,000+ total businesses supported
- Build time remains constant
- API response times scale with database indexing

### Cache Strategy
- Client-side caching prevents duplicate requests
- Server-side caching can optimize bounds queries
- CDN caching for static initial viewport data

## Testing Strategy

### Unit Tests
- MapDataLoader bounds calculation
- Cache hit/miss behavior
- API error handling

### Integration Tests (Puppeteer)
```javascript
// Test lazy loading behavior
test('loads businesses when panning map', async () => {
  await page.goto('http://localhost:3001');
  
  // Verify initial businesses loaded
  const initialMarkers = await page.$$('.leaflet-marker-icon');
  expect(initialMarkers.length).toBeGreaterThan(0);
  
  // Pan map to new area
  await page.evaluate(() => {
    window.map.panTo([41.95, -87.55]); // North side Chicago
  });
  
  // Wait for new businesses to load
  await page.waitForTimeout(500);
  
  // Verify additional businesses loaded
  const newMarkers = await page.$$('.leaflet-marker-icon');
  expect(newMarkers.length).toBeGreaterThan(initialMarkers.length);
});
```

## Implementation Timeline

1. **Phase 1**: Update backend API to support bounds queries
2. **Phase 2**: Implement MapDataLoader client-side class
3. **Phase 3**: Update Map.astro component with lazy loading
4. **Phase 4**: Add caching and error handling
5. **Phase 5**: Performance testing and optimization

This approach provides the scalability needed for business growth while maintaining the performance benefits of static generation for the core user experience.