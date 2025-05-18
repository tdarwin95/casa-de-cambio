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

// Descargar flyer como PNG usando html2canvas
// Debes agregar html2canvas en tu proyecto para que funcione
document.getElementById('descargar-flyer').addEventListener('click', function() {
    if (typeof html2canvas === 'undefined') {
        alert('html2canvas no está cargado. Agrega la librería en tu HTML.');
        return;
    }
    
    const flyer = document.getElementById('flyer');
    const images = flyer.getElementsByTagName('img');
    let loadedImages = 0;
    const totalImages = images.length;

    // Función para verificar si todas las imágenes están cargadas
    function checkAllImagesLoaded() {
        loadedImages++;
        if (loadedImages === totalImages) {
            generateCanvas();
        }
    }

    // Función para generar el canvas y descargar
    function generateCanvas() {
        html2canvas(flyer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            foreignObjectRendering: true,
            imageTimeout: 0,
            logging: true,
            onclone: function(clonedDoc) {
                const images = clonedDoc.getElementsByTagName('img');
                Array.from(images).forEach(img => {
                    // Asegurarse de que las imágenes usen rutas absolutas
                    if (img.src.startsWith('file://')) {
                        const relativePath = img.getAttribute('src');
                        img.src = window.location.origin + '/' + relativePath.replace('./', '');
                    }
                });
            }
        }).then(function(canvas) {
            try {
                const link = document.createElement('a');
                link.download = 'flyer-casa-de-cambio.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            } catch (error) {
                alert('Error al generar la imagen. Por favor, asegúrate de que todas las imágenes estén cargadas correctamente.');
                console.error('Error:', error);
            }
        }).catch(function(error) {
            alert('Error al generar el canvas. Por favor, intenta de nuevo.');
            console.error('Error:', error);
        });
    }

    // Verificar si hay imágenes
    if (totalImages === 0) {
        generateCanvas();
        return;
    }

    // Verificar el estado de carga de cada imagen
    Array.from(images).forEach(img => {
        if (img.complete) {
            checkAllImagesLoaded();
        } else {
            img.onload = checkAllImagesLoaded;
            img.onerror = function() {
                alert('Error al cargar una o más imágenes. Por favor, verifica que todas las imágenes estén disponibles.');
            };
        }
    });
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