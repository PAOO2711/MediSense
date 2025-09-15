# MediSense Project

Este proyecto está organizado en dos partes principales: frontend y backend.

## 📁 Estructura del Proyecto

```
medisense/
├── frontend/          # Aplicación Next.js
│   ├── app/          # App Router de Next.js
│   ├── components/   # Componentes React
│   ├── hooks/        # Custom hooks
│   ├── lib/          # Utilidades
│   ├── public/       # Archivos estáticos
│   └── ...          # Archivos de configuración
├── backend/          # API Python con FastAPI
│   ├── app/
│   │   ├── api/      # Endpoints de la API
│   │   ├── core/     # Configuración
│   │   ├── models/   # Modelos de datos
│   │   └── services/ # Lógica de negocio
│   ├── tests/        # Tests del backend
│   └── requirements.txt
└── README.md
```

## 🚀 Desarrollo

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
- Aplicación disponible en: http://localhost:3000

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
- API disponible en: http://localhost:8000
- Documentación automática: http://localhost:8000/docs

## 🔧 Configuración

### Frontend
- Framework: Next.js 15 con TypeScript
- UI: shadcn/ui + Tailwind CSS
- Tema: Modo oscuro/claro con next-themes

### Backend
- Framework: FastAPI
- Base de datos: SQLAlchemy (configurable)
- Autenticación: JWT
- CORS configurado para desarrollo

## 📊 Funcionalidades

- Dashboard médico interactivo
- Modo oscuro/claro
- API REST para datos médicos
- Sistema de autenticación (preparado)
- Componentes UI reutilizables

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
