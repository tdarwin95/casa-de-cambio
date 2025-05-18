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

// Función para cargar una imagen
function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Error al cargar la imagen: ${src}`));
        
        // Asegurarse de que la URL sea correcta para GitHub Pages
        const baseUrl = getBaseUrl();
        if (!src.startsWith('http') && !src.startsWith('data:')) {
            src = baseUrl + '/' + src;
        }
        img.src = src;
    });
}

// Función para convertir una imagen a base64
async function getBase64Image(img) {
    try {
        const loadedImg = await loadImage(img.src);
        const canvas = document.createElement('canvas');
        canvas.width = loadedImg.width;
        canvas.height = loadedImg.height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(loadedImg, 0, 0);
        
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Error al convertir imagen a base64:', error);
        throw error;
    }
}

// Función para esperar a que las fuentes se carguen
function waitForFonts() {
    return new Promise((resolve) => {
        if (document.fonts.status === 'loaded') {
            resolve();
        } else {
            document.fonts.ready.then(resolve);
        }
    });
}

// Función para descargar el flyer
document.getElementById('descargar-flyer').addEventListener('click', async function() {
    const flyer = document.getElementById('flyer');
    
    // Mostrar un mensaje de carga
    const btnDescargar = document.getElementById('descargar-flyer');
    const textoOriginal = btnDescargar.textContent;
    btnDescargar.textContent = 'Generando imagen...';
    btnDescargar.disabled = true;

    try {
        // Esperar a que las fuentes se carguen
        await waitForFonts();

        // Clonar el elemento para evitar problemas con las fuentes
        const clone = flyer.cloneNode(true);
        document.body.appendChild(clone);
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.top = '-9999px';

        // Configuración para dom-to-image
        const options = {
            width: 1080,
            height: 1920,
            style: {
                transform: 'scale(1)',
                transformOrigin: 'top left'
            },
            quality: 1.0,
            bgcolor: '#ffffff',
            filter: (node) => {
                return (node.tagName !== 'SCRIPT');
            }
        };

        // Generar la imagen
        const dataUrl = await domtoimage.toPng(clone, options);
        
        // Eliminar el clon
        document.body.removeChild(clone);
        
        // Crear el enlace de descarga
        const link = document.createElement('a');
        link.download = 'flyer-casa-de-cambio.png';
        link.href = dataUrl;
        link.click();
        
    } catch (error) {
        console.error('Error al generar la imagen:', error);
        alert('Error al generar la imagen. Por favor, intenta de nuevo.');
    } finally {
        // Restaurar el botón
        btnDescargar.textContent = textoOriginal;
        btnDescargar.disabled = false;
    }
});

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