// Server-side data fetching for build time
export async function fetchAllBusinesses() {
  const apiUrl = import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${apiUrl}/api/businesses`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch businesses:', error);
    return [];
  }
}