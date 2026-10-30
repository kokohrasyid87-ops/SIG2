// Semua library L, turf, dan Leaflet.Draw sudah di-load dari CDN di index.html.
// Tidak perlu import lagi di sini.

// 1. Definisikan Tile Layers
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 22,
  maxNativeZoom: 19,
  attribution: '© OpenStreetMap'
});

const esriSatLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  maxZoom: 22,
  maxNativeZoom: 18,
  attribution: 'Tiles © Esri'
});

// 2. Inisialisasi Peta
const map = L.map('map', {
  maxZoom: 22,
  zoomControl: false,
  layers: [osmLayer] 
}).setView([-7.250445, 112.768845], 13);

L.control.zoom({ position: 'bottomleft' }).addTo(map);

L.control.layers({
  "Peta Standar (OSM)": osmLayer,
  "Satelit (Esri)": esriSatLayer
}).addTo(map);


// 3. Kontrol Toggle Sidebar
const sidebar = document.getElementById('sidebar');
const btnToggle = document.getElementById('btn-toggle-sidebar');
const btnOpenFloating = document.getElementById('btn-open-floating');

function isMobile() {
  return window.matchMedia('(max-width: 767px)').matches;
}

function setSidebar(open) {
  if (!sidebar) return;

  sidebar.classList.toggle('collapsed', !open && isMobile());

  if (btnToggle) {
    btnToggle.textContent = open ? '▶ Tutup' : '◀ Buka Form';
  }

  if (btnOpenFloating) {
    btnOpenFloating.style.display =
      !open && isMobile() ? 'flex' : 'none';
  }

  requestAnimationFrame(() => {
    map.invalidateSize();
  });
}

if (btnToggle) {
  btnToggle.addEventListener('click', () => {
    setSidebar(sidebar.classList.contains('collapsed'));
  });
}

if (btnOpenFloating) {
  btnOpenFloating.addEventListener('click', () => {
    setSidebar(true);
  });
}

setSidebar(!isMobile());

window.addEventListener('resize', () => {
  setSidebar(!isMobile());
});


// 4. Leaflet Draw & Turf.js
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  position: 'topleft',
  draw: {
    polygon: { allowIntersection: false, showArea: true },
    marker: false, circle: false, circlemarker: false, rectangle: false, polyline: false
  },
  edit: { featureGroup: drawnItems }
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, function (e) {
  const layer = e.layer;
  drawnItems.clearLayers();
  drawnItems.addLayer(layer);

  const geojson = layer.toGeoJSON();
  
  // turf sudah tersedia global dari CDN
  const areaM2 = turf.area(geojson);
  const areaHa = (areaM2 / 10000).toFixed(4);

  const luasInput = document.getElementById('luas-display');
  if (luasInput) luasInput.value = `${areaHa} Ha (${areaM2.toFixed(1)} m²)`;

  const btnSimpan = document.getElementById('btn-simpan');
  if (btnSimpan) btnSimpan.removeAttribute('disabled');
});

// Paksa refresh ukuran peta saat window selesai dimuat
window.addEventListener('load', () => {
  setTimeout(() => {
    map.invalidateSize(true);
  }, 300);
});
