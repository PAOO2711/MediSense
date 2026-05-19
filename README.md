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
pnpm install
pnpm dev
```
- Aplicación disponible en: http://localhost:3000 (local)
- Consultar documentación de API http://localhost:3000/api-docs (local)
- Aplicación disponible en: https://medi-sense-mmid.vercel.app (cloud)

### Migración de base de datos con Drizzle
El frontend usa Drizzle ORM para definir el esquema y generar migraciones para PostgreSQL.

1. Configura la cadena de conexión en `frontend/.env`:
```bash
DATABASE_URL="postgresql://usuario:contraseña@host:5432/base_de_datos"
```

2. Genera la migración:
```bash
cd frontend
drizzle-kit generate
```

3. Aplica la migración en la base de datos:
```bash
cd frontend
drizzle-kit migrate
```

4. Si estás iterando localmente y quieres sincronizar el esquema sin crear archivos de migración, puedes usar:
```bash
cd frontend
drizzle-kit push
```

Los archivos generados por Drizzle quedan en `frontend/drizzle/`.

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python3 main.py
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
