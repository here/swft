import L from 'leaflet'
import { createClient } from '@supabase/supabase-js'

// -- Supabase client ----------------------------------------------------------
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// -- Map setup ----------------------------------------------------------------
const map = L.map('map').setView([20, 0], 2)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
}).addTo(map)

// -- Helpers ------------------------------------------------------------------
function addMarker(lat, lng) {
  L.marker([lat, lng]).addTo(map)
}

// -- Load existing clicks -----------------------------------------------------
async function loadExistingClicks() {
  const { data, error } = await supabase
    .from('clicks')
    .select('lat, lng')

  if (error) { console.error('Error loading clicks:', error); return }

  data.forEach(({ lat, lng }) => addMarker(lat, lng))
}

// -- Realtime subscription ----------------------------------------------------
supabase
  .channel('clicks')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'clicks' },
    ({ new: row }) => addMarker(row.lat, row.lng)
  )
  .subscribe()

// -- Click handler ------------------------------------------------------------
map.on('click', async ({ latlng }) => {
  const { lat, lng } = latlng

  const { error } = await supabase.from('clicks').insert({
    location: `POINT(${lng} ${lat})`,
  })

  if (error) console.error('Error inserting click:', error)
  // Marker will appear via the realtime subscription, not inserted locally
})

// -- Init ---------------------------------------------------------------------
loadExistingClicks()
