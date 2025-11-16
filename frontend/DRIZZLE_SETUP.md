# Configuración de Drizzle ORM con Supabase

## 📦 Instalación

Las dependencias ya están instaladas:
- `drizzle-orm`: ORM principal
- `drizzle-kit`: Herramientas CLI para migraciones
- `@supabase/supabase-js`: Cliente de Supabase
- `postgres`: Driver PostgreSQL

## 🔧 Configuración

### 1. Configurar variables de entorno

Copia `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Obtén las credenciales de Supabase:
1. Ve a tu proyecto en https://supabase.com/dashboard
2. Settings -> API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Settings -> Database -> Connection string (Direct connection):
   - `DATABASE_URL` (usa el modo Transaction pooling)

### 2. Generar migraciones

```bash
pnpm db:generate
```

### 3. Aplicar migraciones a Supabase

```bash
pnpm db:push
```

### 4. (Opcional) Abrir Drizzle Studio

Para explorar tu base de datos visualmente:

```bash
pnpm db:studio
```

Se abrirá en https://local.drizzle.studio

## 📁 Estructura de archivos

```
frontend/
├── lib/
│   └── db/
│       ├── index.ts        # Conexión a la base de datos
│       ├── schema.ts       # Definición de tablas
│       └── queries.ts      # Funciones de consulta
├── drizzle.config.ts       # Configuración de Drizzle Kit
├── drizzle/                # Migraciones generadas
└── .env                    # Variables de entorno
```

## 🗃️ Schema

El schema incluye:

### Tablas principales:
- **patients**: Información de pacientes
- **consultations**: Consultas médicas
- **transcriptions**: Transcripciones de audio
- **ai_diagnoses**: Diagnósticos generados por IA

### Relaciones:
- Un paciente puede tener múltiples consultas
- Una consulta puede tener múltiples transcripciones
- Una consulta puede tener múltiples diagnósticos IA
- Un diagnóstico IA está vinculado a una transcripción

## 🚀 Uso

### Ejemplo básico:

```typescript
import { db } from '@/lib/db';
import { patients } from '@/lib/db/schema';

// Crear un paciente
const newPatient = await db.insert(patients).values({
  name: 'Juan Pérez',
  email: 'juan@example.com',
}).returning();

// Obtener todos los pacientes
const allPatients = await db.select().from(patients);
```

### Usando funciones helper:

```typescript
import { createPatient, getPatients } from '@/lib/db/queries';

// Crear paciente
const patient = await createPatient({
  name: 'Juan Pérez',
  email: 'juan@example.com',
});

// Obtener pacientes
const patients = await getPatients();
```

### Consultas con relaciones:

```typescript
import { db } from '@/lib/db';
import { consultations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const consultation = await db.query.consultations.findFirst({
  where: eq(consultations.id, 1),
  with: {
    patient: true,
    transcriptions: true,
    aiDiagnoses: true,
  },
});
```

## 📝 Scripts disponibles

- `pnpm db:generate` - Genera archivos de migración
- `pnpm db:push` - Aplica cambios directamente a la DB (desarrollo)
- `pnpm db:migrate` - Aplica migraciones (producción)
- `pnpm db:studio` - Abre Drizzle Studio

## 🔗 Recursos

- [Documentación de Drizzle](https://orm.drizzle.team)
- [Drizzle con Supabase](https://orm.drizzle.team/docs/get-started/supabase-new)
- [Documentación de Supabase](https://supabase.com/docs)
