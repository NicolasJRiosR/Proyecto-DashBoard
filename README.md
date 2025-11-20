# Acceso a Datos · Starter Project

Este repositorio contiene una **plantilla mínima** para empezar a trabajar con datos usando **Node.js (backend)** y **Svelte (frontend)**.

👉 El objetivo es que construyas tus propios endpoints y componentes paso a paso.

---

## 1. Requisitos
- Node.js 18+
- npm (incluido con Node)

---

## 2. Clonar el proyecto

```bash
git clone https://github.com/Amagozz/AccesoADatos.git
cd AccesoADatos
git checkout starter
```

---

## 3. Arrancar el backend (API con Node.js)

```bash
cd server
npm install
npm run dev
```

API en: [http://localhost:5174/api/health](http://localhost:5174/api/health)

---

## 4. Arrancar el frontend (Svelte)

```bash
cd ../client
npm install
npm run dev
```

Dashboard en: [http://localhost:5173](http://localhost:5173)

---

## 5. Qué hacer a continuación
- En el **backend** (`server/index.js`), añade nuevos endpoints, por ejemplo `/api/datos`.
- En el **frontend** (`client/src/App.svelte`), conecta a tus endpoints y muestra la información.
- Poco a poco construirás tu propio **dashboard de datos** con tablas y gráficos.

🚀 ¡Ya está todo listo para empezar!
