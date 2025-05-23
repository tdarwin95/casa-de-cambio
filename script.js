// Cálculo de tasas y actualización del flyer
function calcularTasaVEBR() {
    const bolivares = parseFloat(document.getElementById('ve-bolivares').value);
    const reales = parseFloat(document.getElementById('ve-reales').value);
    const btnCopiar = document.getElementById('btn-copiar-ve-br');
    if (isNaN(bolivares) || isNaN(reales) || reales === 0) {
        document.getElementById('tasa-ve-br').textContent = 'Valores inválidos';
        btnCopiar.style.display = 'none';
        return;
    }
    const tasa = (bolivares / (reales - (reales * 0.1))).toFixed(2);
    document.getElementById('tasa-ve-br').textContent = tasa;
    btnCopiar.style.display = 'inline-block';
    actualizarFlyer(tasa, 'Brasil a Venezuela');
}

// Variable global para guardar la última tasa
let ultimaTasaBRVE = localStorage.getItem('ultimaTasaBRVE') || null;

function calcularTasaBRVE() {
    const bolivares = parseFloat(document.getElementById('br-bolivares').value);
    const reales = parseFloat(document.getElementById('br-reales').value);
    const btnCopiar = document.getElementById('btn-copiar-br-ve');
    const iconUp = document.querySelector('.icon-up');
    const iconDown = document.querySelector('.icon-down');
    
    if (isNaN(bolivares) || isNaN(reales) || reales === 0) {
        document.getElementById('tasa-br-ve').textContent = 'Valores inválidos';
        btnCopiar.style.display = 'none';
        return;
    }
    
    const tasa = ((bolivares - (bolivares * 0.1)) / reales).toFixed(2);
    document.getElementById('tasa-br-ve').textContent = tasa;
    btnCopiar.style.display = 'inline-block';
    
    // Comparar con la última tasa y mostrar la flecha correspondiente
    if (ultimaTasaBRVE !== null) {
        if (parseFloat(tasa) > parseFloat(ultimaTasaBRVE)) {
            iconUp.style.display = 'block';
            iconDown.style.display = 'none';
        } else if (parseFloat(tasa) < parseFloat(ultimaTasaBRVE)) {
            iconUp.style.display = 'none';
            iconDown.style.display = 'block';
        } else {
            iconUp.style.display = 'none';
            iconDown.style.display = 'none';
        }
    }
    
    // Guardar la nueva tasa en localStorage
    ultimaTasaBRVE = tasa;
    localStorage.setItem('ultimaTasaBRVE', tasa);
    
    // Guardar también en un archivo de historial
    const fecha = new Date().toLocaleString();
    const historial = localStorage.getItem('historialTasas') || '';
    const nuevaEntrada = `${fecha}: ${tasa}\n`;
    localStorage.setItem('historialTasas', historial + nuevaEntrada);
    
    actualizarFlyer(tasa, 'Venezuela a Brasil');
}

function actualizarFlyer(tasa, tipo) {
    // Solo actualiza la tasa en el flyer si es Venezuela a Brasil
    if (tipo === 'Venezuela a Brasil') {
        document.getElementById('flyer-tasa').textContent = tasa;
    }
    // Actualiza la fecha
    const hoy = new Date();
    const fecha = hoy.toLocaleDateString('es-ES');
    document.getElementById('flyer-date').textContent = fecha;
}

// Función para obtener la URL base de GitHub Pages
function getBaseUrl() {
    // Si estamos en GitHub Pages, usa la URL del repositorio
    if (window.location.hostname.includes('github.io')) {
        return window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');
    }
    // Si estamos en local, usa la ruta relativa
    return '';
}

// Al cargar la página, actualiza la fecha del flyer
document.addEventListener('DOMContentLoaded', function() {
    const hoy = new Date();
    const fecha = hoy.toLocaleDateString('es-ES');
    document.getElementById('flyer-date').textContent = fecha;
});

// Función para copiar la tasa al portapapeles
function copiarTasa(idSpan) {
    const valor = document.getElementById(idSpan).textContent;
    if (valor && valor !== 'Valores inválidos') {
        navigator.clipboard.writeText(valor).then(function() {
            alert('¡Tasa copiada al portapapeles!');
        }, function() {
            alert('No se pudo copiar.');
        });
    } else {
        alert('No hay tasa válida para copiar.');
    }
}

// Función para descargar el historial de tasas
function descargarHistorial() {
    const historial = localStorage.getItem('historialTasas') || 'No hay historial disponible';
    const blob = new Blob([historial], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'historial_tasas.txt';
    a.click();
    window.URL.revokeObjectURL(url);
}

// Función para limpiar el historial
function limpiarHistorial() {
    if (confirm('¿Estás seguro de que quieres limpiar todo el historial de tasas?')) {
        localStorage.removeItem('historialTasas');
        localStorage.removeItem('ultimaTasaBRVE');
        ultimaTasaBRVE = null;
        alert('Historial limpiado correctamente');
    }
}

// Agregar botones para historial
document.addEventListener('DOMContentLoaded', function() {
    const contenedorBotones = document.createElement('div');
    contenedorBotones.className = 'historial-buttons';
    
    const btnDescargarHistorial = document.createElement('button');
    btnDescargarHistorial.textContent = 'Descargar Historial de Tasas';
    btnDescargarHistorial.className = 'btn-historial';
    btnDescargarHistorial.onclick = descargarHistorial;
    
    const btnLimpiarHistorial = document.createElement('button');
    btnLimpiarHistorial.textContent = 'Limpiar Historial';
    btnLimpiarHistorial.className = 'btn-historial btn-limpiar';
    btnLimpiarHistorial.onclick = limpiarHistorial;
    
    contenedorBotones.appendChild(btnDescargarHistorial);
    contenedorBotones.appendChild(btnLimpiarHistorial);
    
    document.querySelector('.inputs-container').appendChild(contenedorBotones);
});

// Función para descargar el flyer como PNG
function descargarFlyer() {
    const flyer = document.getElementById('flyer');
    const fecha = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    
    domtoimage.toPng(flyer)
        .then(function (dataUrl) {
            const link = document.createElement('a');
            link.download = `flyer-${fecha}.png`;
            link.href = dataUrl;
            link.click();
        })
        .catch(function (error) {
            console.error('Error al generar el flyer:', error);
            alert('Hubo un error al generar el flyer. Por favor, intente nuevamente.');
        });
}

// Agregar el evento click al botón de descargar flyer
document.addEventListener('DOMContentLoaded', function() {
    const btnDescargarFlyer = document.getElementById('descargar-flyer');
    if (btnDescargarFlyer) {
        btnDescargarFlyer.addEventListener('click', descargarFlyer);
    }
}); 