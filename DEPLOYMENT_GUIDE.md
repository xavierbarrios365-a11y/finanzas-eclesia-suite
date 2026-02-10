# Guía de Despliegue: Eclesia Suite a la Web 🚀

Esta guía te explica cómo subir tu aplicación a **GitHub** y luego desplegarla gratis en **Vercel** para que puedas acceder a ella desde cualquier lugar (PC o Móvil).

## Paso 1: Subir a GitHub 📂

1. Abre tu terminal en la carpeta del proyecto.
2. Inicializa git (si no lo has hecho): `git init`
3. Agrega todos los archivos: `git add .`
4. Crea tu primer commit: `git commit -m "v9.3 Suite Elite Update"`
5. Crea un repositorio en tu cuenta de GitHub (ej: `finanzas-iglesia`).
6. Conecta tu repositorio local con el de GitHub (reemplaza con tu URL):
   `git remote add origin https://github.com/TU_USUARIO/TU_REPO.git`
7. Sube el código: `git push -u origin main`

## Paso 2: Desplegar en Vercel 🌐

1. Ve a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New"** > **"Project"**.
3. Importa tu repositorio de GitHub recién creado.
4. En la configuración de **"Build & Development Settings"**, Vercel detectará automáticamente que es un proyecto **Vite/React**. No necesitas cambiar nada.
5. Haz clic en **"Deploy"**.
6. ¡Listo! Vercel te dará una URL (ej: `finanzas-iglesia.vercel.app`) para acceder desde tu móvil.

## Consejos v9.4 🥂

- **Navegación Móvil**: Una vez desplegado, en tu iPhone/Android puedes usar la opción "Agregar a la pantalla de inicio" para que se comporte como una App nativa.
- **Seguridad**: Recuerda que la URL de Vercel es pública si no configuras contraseñas. Sin embargo, dado que es solo lectura y auditoría vía tu script de Google, es segura para el manejo interno.

---
**Eclesia Management Suite • 2026**
