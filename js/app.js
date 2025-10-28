// URL DEL BACKEND: reemplaza por tu endpoint cuando lo despliegues.
// Para pruebas locales con ngrok, usa la URL de ngrok, p.ej: https://abcd-1234.ngrok.io
const BACKEND_BASE = 'https://c3f1-2806-xxxx.ngrok-free.app'; // dejar vacío por defecto (no enviará si no se configura)

const btn = document.getElementById('btn-get');
const statusEl = document.getElementById('status');
const output = document.getElementById('output');
const serverUrlEl = document.getElementById('server-url');
const btnCopy = document.getElementById('btn-copy-url');

function setBackendUrl(url) {
  serverUrlEl.textContent = url ? url : 'NINGUNO';
}

setBackendUrl(BACKEND_BASE);

// copia URL de la página
btnCopy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(location.href);
    alert('URL copiada al portapapeles');
  } catch (e) {
    alert('No se pudo copiar: ' + e);
  }
});

btn.addEventListener('click', async () => {
  output.hidden = true;
  statusEl.textContent = 'Solicitando permiso de ubicación al navegador...';

  if (!('geolocation' in navigator)) {
    statusEl.textContent = 'Geolocalización no soportada por este navegador.';
    return;
  }

  // pide permiso y obtiene la posición
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const lat = pos.coords.latitude.toFixed(6);
    const lon = pos.coords.longitude.toFixed(6);
    const acc = pos.coords.accuracy;

    const payload = {
      name: null, // opcional: el usuario puede añadirlo manualmente si quieres
      latitude: pos.coords.latitude,
      longitude: pos.coords.longitude,
      accuracy: acc,
      clientTimestamp: new Date().toISOString()
    };

    statusEl.textContent = 'Ubicación obtenida (usuario aceptó).';

    output.hidden = false;
    output.textContent = `Latitud: ${lat}\nLongitud: ${lon}\nPrecisión (m): ${acc}\n\nGoogle Maps: https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

    // si BACKEND_BASE está configurado, intenta enviar el payload
    if (BACKEND_BASE && BACKEND_BASE.trim() !== '') {
      try {
        const resp = await fetch(BACKEND_BASE.replace(/\/+$/, '') + '/collect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (resp.ok) {
          statusEl.textContent += ' — Reporte enviado al servidor.';
        } else {
          statusEl.textContent += ' — Error al enviar al servidor (respuesta no OK).';
        }
      } catch (e) {
        statusEl.textContent += ' — Error de red al enviar al servidor: ' + e.message;
      }
    } else {
      statusEl.textContent += ' — (No se envió a ningún servidor: BACKEND no configurado)';
    }

  }, (err) => {
    statusEl.textContent = 'Error o permiso denegado: ' + (err.message || err.code);
  }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
});
