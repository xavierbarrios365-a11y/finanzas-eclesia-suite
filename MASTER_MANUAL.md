# Manual Maestro: Creación de Iglesia JES Suite 🏛️💎

Este manual detalla paso a paso (A-Z) cómo construir esta aplicación de gestión financiera 100% funcional y automatizada.

## 📋 Fase A: El Cerebro (Google Sheets & Apps Script)

La aplicación utiliza Google Sheets como base de datos gratuita.

### 1. La Base de Datos (Manual)
- Crea una hoja de cálculo llamada `Finanzas Iglesia`.
- El formulario de Google (creado manualmente) debe enviar datos a esta hoja.
- Las columnas obligatorias son: `ID`, `Fecha`, `Mes`, `Tipo` (Ingreso/Egreso), `Categoría`, `Concepto`, `Método`, `Monto Orig`, `Moneda`, `Tasa`, `Total USD`, `Total VES`.

### 2. El Motor de Automatización (Apps Script)
El resto de la lógica se puede automatizar pegando nuestro script maestro.
- Ve a **Extensiones > Apps Script**.
- Pega el código de `BACKEND_MASTER_v8.0.js`.
- Este script hace 3 cosas automáticamente:
  - `getData`: Envía los datos al Dashboard.
  - `editRow`: Permite que el Dashboard corrija errores en la hoja.
  - `doPost`: Recibe las actualizaciones de seguridad.

---

## 💻 Fase B: El Corazón (React + Vite + Tailwind)

### 3. Inicialización del Proyecto
```bash
npm create vite@latest iglesia-jes -- --template react-ts
cd iglesia-jes
npm install lucide-react recharts
```

### 4. Estructura de Datos Inteligente
Para que la App funcione como esta, el código debe implementar:
- **Normalización de Meses**: Convertir cualquier formato de fecha de Excel a un ID estándar (ej: `01-ene`).
- **Lógica de Arrastre (Running Balance)**:
  - Los **Saldos** (Caja/Banco) deben ser la suma de `Mes Actual + Meses Anteriores`.
  - El **Rendimiento** (Gráficas) debe ser solo del `Mes Actual`.

### 5. UI de Alta Densidad (A-Z)
- **Dashboard**: 6 KPIs críticos (Divisa, Banco, Caja, Consolidado VES, Flujo Neto, Impacto Tasa).
- **Gráfica Híbrida**: Debe cambiar entre barras de meses (vista anual) y barras de días (vista mensual).
- **Modo Adaptativo**: Inyectar una clase `.dark` o `.light` al contenedor raíz basada en `window.matchMedia`.

---

## 🚀 Fase C: El Despliegue (GitHub & Vercel)

### 6. Repositorio (Automatizado vía Git)
1. `git init`
2. `git add .`
3. `git commit -m "v9.7 Final Release"`
4. Conectar a GitHub: `git remote add origin https://github.com/TU_USER/TU_REPO.git`
5. `git push -u origin main`

### 7. Hosting Pro (Vercel)
- Conecta Vercel con GitHub.
- Selecciona el proyecto.
- **Vercel automatiza el build**: Cada vez que hagas un cambio en tu PC y lo subas a GitHub, la App en el móvil se actualizará SOLA.

---

## 🛠️ Resumen de Componentes Clave
1. **Frontend**: React + Recharts (para los gráficos inteligentes).
2. **Backend**: Google Apps Script (Servidor sin costo).
3. **Database**: Google Sheets (Base de datos sin costo).
4. **Icons**: Lucide React (Estética Elite).

---
**Guía técnica creada por Antigravity para Iglesia JES (2026)**
