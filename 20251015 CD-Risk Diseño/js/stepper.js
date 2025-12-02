document.addEventListener('DOMContentLoaded', () => {
    const wizardContent = document.getElementById('wizard-content');
    const stepperItems = document.querySelectorAll('.stepper-item');
    let currentStep = 0; // Índice del paso actual (0-indexed)

    // Array con las rutas de los archivos HTML para cada paso
    const stepFiles = [
        'pages/project_data.html',
        'pages/dimensions.html',
        'pages/losses.html',
    //    'pages/supply.html',
        'pages/calculation_results.html',
    //   'pages/installation_type.html',        // Archivo para elegir tipo de instalación
        'pages/protection_scheme_map.html',    // Archivo para el mapa y detalles del pararrayos
        'pages/external_protection_materials.html', // Archivo para materiales de protección externa
        'pages/internal_protection_materials.html', // Archivo para materiales de protección interna
        'pages/request_quote.html'             // Archivo para solicitar presupuesto
    ];

    /**
     * Carga el contenido HTML de un paso específico y asegura la ejecución de sus scripts.
     * **CORRECCIÓN CLAVE:** Espera que el elemento #mapImage cargue antes de ejecutar scripts.
     * @param {string} fileUrl - La URL del archivo HTML a cargar.
     */
async function loadStepContent(fileUrl) {
    try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const scripts = Array.from(tempDiv.querySelectorAll('script'));
        scripts.forEach(script => script.remove());
        
        // 1. Inyectar HTML (sin scripts)
        wizardContent.innerHTML = tempDiv.innerHTML; // La imagen y el canvas se cargan aquí

        // 2. Definir la función de ejecución de scripts
        const mapImage = document.getElementById('mapImage');
        const scriptsToRun = scripts;

        const executeScripts = () => {
            scriptsToRun.forEach(oldScript => {
                const newScript = document.createElement('script');
                if (oldScript.src) {
                    newScript.src = oldScript.src;
                } else {
                    // Si el script es inline, su contenido se inyecta
                    newScript.textContent = oldScript.textContent;
                }
                // Copiar atributos
                for (let i = 0; i < oldScript.attributes.length; i++) {
                    const attr = oldScript.attributes[i];
                    if (attr.name !== 'src') {
                        newScript.setAttribute(attr.name, attr.value);
                    }
                }
                wizardContent.appendChild(newScript);
            });
        };

        // 3. Ejecutar scripts, esperando a la imagen si es necesario
        if (mapImage) {
            // Revisa si la imagen ya está completamente cargada (puede ocurrir si está en caché)
            if (mapImage.complete && mapImage.naturalHeight !== 0) { 
                executeScripts();
            } else {
                // Esperamos el evento 'load' de la imagen
                mapImage.onload = executeScripts;
                mapImage.onerror = executeScripts; // Ejecutar scripts incluso si la carga falla
            }
        } else {
            // No es el paso del mapa, ejecutar scripts inmediatamente
            executeScripts();
        }

        // SCROLL AL INICIO DE LA PÁGINA
        requestAnimationFrame(() => {
            window.scrollTo(0, 0);
        });

    } catch (error) {
        console.error('Error cargando contenido del paso:', error);
        wizardContent.innerHTML = '<p class="text-danger">Error cargando contenido.</p>';
        
        requestAnimationFrame(() => {
            window.scrollTo(0, 0);
        });
    }
}


    /**
     * Actualiza la interfaz de usuario del stepper (clases active/completed).
     */
    function updateStepperUI() {
        stepperItems.forEach((item, index) => {
            // Eliminar todas las clases de estado antes de aplicar las correctas
            item.classList.remove('active', 'completed');

            // Aplicar la clase 'active' al paso actual
            if (index === currentStep) {
                item.classList.add('active');
            }
            // Aplicar la clase 'completed' a los pasos anteriores
            else if (index < currentStep) {
                item.classList.add('completed');
            }
        });
        updateBreadcrumb();
    }


    // Lógica para el Breadcrumb
    const breadcrumbContainer = document.querySelector('.breadcrumb');
    function updateBreadcrumb() {
        if (!breadcrumbContainer) return;
        breadcrumbContainer.innerHTML = ''; 

        // Añadir "Home" como primer elemento
        const homeItem = document.createElement('li');
        homeItem.className = 'breadcrumb-item';
        homeItem.innerHTML = '<a href="#" onclick="goToStep(0)">Home</a>';
        breadcrumbContainer.appendChild(homeItem);

        // Añadir elementos para los pasos completados y el actual
        for (let i = 0; i <= currentStep; i++) {
            const newBreadcrumbItem = document.createElement('li');
            newBreadcrumbItem.className = 'breadcrumb-item';
            const stepTitle = stepperItems[i].querySelector('.stepper-title').textContent;

            if (i === currentStep) {
                newBreadcrumbItem.classList.add('active');
                newBreadcrumbItem.setAttribute('aria-current', 'page');
                newBreadcrumbItem.textContent = stepTitle;
            } else {
                newBreadcrumbItem.innerHTML = `<a href="#" onclick="goToStep(${i})">${stepTitle}</a>`;
            }
            breadcrumbContainer.appendChild(newBreadcrumbItem);
        }
    }


    /**
     * Navega a un paso específico por su índice.
     * @param {number} stepIndex - El índice del paso al que navegar (0-indexed).
     */
    function goToStep(stepIndex) {
        if (stepIndex >= 0 && stepIndex < stepFiles.length) {
            currentStep = stepIndex;
            loadStepContent(stepFiles[currentStep]);
            updateStepperUI();
        }
    }

    /**
     * Navega al siguiente paso.
     */
    window.nextStep = function() {
        if (currentStep < stepFiles.length - 1) {
            currentStep++;
            loadStepContent(stepFiles[currentStep]);
            updateStepperUI();
        }
    };

    /**
     * Navega al paso anterior.
     */
    window.previousStep = function() {
        if (currentStep > 0) {
            currentStep--;
            loadStepContent(stepFiles[currentStep]);
            updateStepperUI();
        }
    };

    // Añadir event listeners para los clics en los elementos del stepper
    stepperItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            goToStep(index);
        });
    });

    // Cargar el primer paso al iniciar
    loadStepContent(stepFiles[currentStep]);
    updateStepperUI();
});