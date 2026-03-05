import L from 'leaflet'
import { createClient } from '@supabase/supabase-js'

// -- Supabase client ----------------------------------------------------------
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// -- Map setup ----------------------------------------------------------------
const SILVER_LAKE = [34.087, -118.26]
const NEIGHBORHOOD_ZOOM = 15 // ~1 square mile

const map = L.map('map').setView(SILVER_LAKE, NEIGHBORHOOD_ZOOM)

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxZoom: 19,
}).addTo(map)

// -- State --------------------------------------------------------------------
let latestSwft = null   // { lat, lng } of most recently known SWFT
let autoFollow = false  // pan to each new SWFT as it arrives
const markers = []      // all live CircleMarker instances

// -- Helpers ------------------------------------------------------------------
const MARKER_RADIUS = Math.round(window.innerHeight / 10)

function addMarker(lat, lng) {
  const m = L.circleMarker([lat, lng], {
    radius: MARKER_RADIUS,
    fillColor: '#fff',
    fillOpacity: 0.88,
    weight: 1,
    color: 'rgba(0,0,0,0.12)',
  }).addTo(map)
  markers.push(m)
}

// -- Load existing clicks -----------------------------------------------------
async function loadExistingClicks() {
  const { data, error } = await supabase
    .from('clicks')
    .select('lat, lng, created_at')
    .order('created_at', { ascending: false })

  if (error) { console.error('Error loading clicks:', error); return }

  if (data.length > 0) latestSwft = { lat: data[0].lat, lng: data[0].lng }
  data.forEach(({ lat, lng }) => addMarker(lat, lng))
}

// -- Realtime subscription ----------------------------------------------------
supabase
  .channel('clicks')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'clicks' },
    ({ new: row }) => {
      latestSwft = { lat: row.lat, lng: row.lng }
      addMarker(row.lat, row.lng)
      if (autoFollow) map.panTo([row.lat, row.lng])
    }
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

// -- Geolocation --------------------------------------------------------------
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      map.setView([coords.latitude, coords.longitude], NEIGHBORHOOD_ZOOM)
    },
    () => {
      // Permission denied or unavailable — stay on Silver Lake default
    }
  )
}

// -- Controls -----------------------------------------------------------------
const controls = document.getElementById('swft-controls')

const btnFollow = document.createElement('button')
btnFollow.className = 'swft-btn'
btnFollow.title = 'Auto-follow new SWFTs'
btnFollow.textContent = '↻'
btnFollow.addEventListener('click', () => {
  autoFollow = !autoFollow
  btnFollow.classList.toggle('active', autoFollow)
})
controls.appendChild(btnFollow)

const btnLatest = document.createElement('button')
btnLatest.className = 'swft-btn'
btnLatest.title = 'Go to most recent SWFT'
btnLatest.textContent = '⊙'
btnLatest.addEventListener('click', () => {
  if (latestSwft) map.panTo([latestSwft.lat, latestSwft.lng])
})
controls.appendChild(btnLatest)

const btnLocate = document.createElement('button')
btnLocate.className = 'swft-btn'
btnLocate.title = 'Go to my location'
btnLocate.textContent = '⊕'
btnLocate.addEventListener('click', () => {
  if (!('geolocation' in navigator)) return
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => map.panTo([coords.latitude, coords.longitude]),
    () => {}  // permission denied or unavailable — fail silently
  )
})
controls.appendChild(btnLocate)

const btnClear = document.createElement('button')
btnClear.className = 'swft-btn'
btnClear.title = 'Clear all SWFTs'
btnClear.textContent = '✕'
btnClear.addEventListener('click', () => {
  markers.forEach(m => m.remove())
  markers.length = 0
})
controls.appendChild(btnClear)

// -- Init ---------------------------------------------------------------------
loadExistingClicks()
