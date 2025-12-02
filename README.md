# Crear el entorno de desarrollo

Asegúrate de tener instalado `npm` y `node` en tu sistema. Luego, ejecuta el siguiente comando para instalar las dependencias del proyecto:

```bash
npm install
```

A continuación, puedes iniciar el servidor de desarrollo con:

```bash
npm run dev
```

Finalmente, abre tu navegador y visita `http://localhost:5173` para ver la aplicación en funcionamiento.

# Despliegue

Para desplegar la aplicación, puedes utilizar el comando:

```bash
npm run build
```

Esto generará una carpeta `dist` con los archivos estáticos. Como el proyecto utiliza `react-router`, asegúrate de configurar tu servidor para servir el archivo `index.html` como *fallback* para todas las rutas que no existan en el servidor. En `./example_server/server.py` se incluye un ejemplo de cómo hacerlo con un servidor Python simple.
# CD_RISK
