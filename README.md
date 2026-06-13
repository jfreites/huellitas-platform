# Huellitas

Huellitas es una plataforma comunitaria para publicar, buscar y compartir reportes de mascotas perdidas o encontradas. La app permite crear reportes con foto, ubicación, rasgos físicos y teléfono de contacto; después genera una vista tipo póster lista para imprimir o compartir por WhatsApp.

## Funcionalidades principales

- Landing con reportes recientes desde Supabase.
- Catálogo de reportes con filtros por especie, tipo, estado, ubicación y búsqueda libre.
- Creación de reportes de mascotas perdidas o encontradas.
- Subida de imagen principal a Supabase Storage.
- Autocompletado de direcciones con Google Places y guardado de coordenadas.
- Páginas públicas por reporte con metadata Open Graph para compartir.
- Póster imprimible desde la pantalla de detalle.
- Acciones del propietario para marcar como reunido o eliminar el reporte.
- Solicitudes públicas de contacto/reclamo con registro, notificación y antispam invisible.
- Login con Google OAuth y código OTP por correo. La acción de auth también contempla SMS si Supabase/Twilio está configurado.

## Stack

- Next.js 16 con App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth, Database y Storage
- Google Maps Places API mediante `@vis.gl/react-google-maps`
- Zod para validación
- Lucide React para iconografía
- pnpm como gestor de paquetes

## Rutas relevantes

| Ruta | Descripción |
| --- | --- |
| `/` | Inicio con CTA y reportes recientes. |
| `/landing` | Landing alternativa/estática de producto. |
| `/login` | Inicio de sesión con Google o correo OTP. |
| `/reportes` | Catálogo público de mascotas perdidas/encontradas. |
| `/reportes/nuevo` | Formulario protegido para crear un reporte. |
| `/reportes/[id]` | Detalle público, póster, contacto y acciones del propietario. |
| `/api/auth/callback` | Callback OAuth/OTP de Supabase Auth. |

## Requisitos

- Node.js compatible con Next.js 16.
- pnpm.
- Proyecto de Supabase configurado.
- Bucket público de Storage llamado `pet-images`.
- Google Maps API key con Places API habilitada para autocompletado de direcciones.

La guía detallada de Supabase está en [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md).

## Configuración local

Instala dependencias:

```bash
pnpm install
```

Crea `.env.local` en la raíz del proyecto:

```ini
NEXT_PUBLIC_SUPABASE_URL="https://tu-proyecto.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."
CONTACT_REQUEST_IP_SALT="cambia-esto-en-produccion"

# Opcional: habilita emails transaccionales reales. Sin esto, se registran en logs.
RESEND_API_KEY="..."
SENDER_EMAIL="Huellitas <noreply@tu-dominio.com>"
```

Levanta el servidor de desarrollo:

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
pnpm dev      # servidor local
pnpm build    # build de producción
pnpm start    # servir build de producción
pnpm lint     # ESLint
```

## Supabase

La app espera estas tablas y relaciones principales:

- `profiles`: perfil asociado al usuario de Supabase Auth.
- `reports`: reportes de mascotas.
- `report_images`: imágenes asociadas a reportes.
- `contact_requests`: solicitudes de contacto/reclamo enviadas desde reportes públicos.
- Storage bucket `pet-images`: lectura pública y escritura restringida al usuario propietario.

Los reportes soportan:

- Tipo: `LOST` o `FOUND`.
- Especie: `DOG` o `CAT`.
- Estados como `LOST_ACTIVE`, `IN_SHELTER`, `WANDERING`, `FOUND_DEAD` y `REUNITED`.
- Rasgos: collar, manchas, chip, cicatrices, color, raza y texto distintivo.
- Ubicación textual y coordenadas.

Consulta [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) para el checklist completo de SQL, RLS, Storage, Auth, Twilio, OAuth y solicitudes de contacto.

## Flujo de desarrollo recomendado

1. Configura Supabase con el esquema, políticas RLS, bucket `pet-images` y tabla `contact_requests`.
2. Configura `.env.local`.
3. Ejecuta `pnpm dev`.
4. Prueba `/login` con Google o correo OTP.
5. Crea un reporte en `/reportes/nuevo`.
6. Verifica que la imagen se guarde en Supabase Storage.
7. Revisa `/reportes` y `/reportes/[id]`.
8. Envía una solicitud de contacto desde el detalle de un reporte.
9. Ejecuta `pnpm lint` y `pnpm build` antes de desplegar.

## Notas de implementación

- `/reportes/nuevo` está protegido por `src/middleware.ts`; usuarios anónimos son redirigidos a `/login?callback=...`.
- Las consultas y mutaciones principales viven en `src/actions/reports.ts`.
- La sesión de Supabase se centraliza en `src/lib/supabase/session.ts`.
- El formulario de reporte sube la imagen desde el navegador a Storage y luego crea el registro mediante server action.
- `src/lib/email.ts` no participa en el OTP actual; Supabase Auth maneja generación, expiración y entrega de códigos.
- El formulario de reclamo/contacto guarda en `contact_requests`, notifica al dueño por email si existe, registra un mock de teléfono y notifica a `jonathanfreites@gmail.com`.

## Despliegue

El proyecto puede desplegarse en Vercel u otro host compatible con Next.js. En producción recuerda configurar:

- Variables de entorno.
- URL pública en `NEXT_PUBLIC_APP_URL`.
- Redirect URLs de Supabase Auth para el dominio final.
- Restricciones de dominio en Google Maps API.
- Políticas RLS y Storage verificadas en Supabase.
- `CONTACT_REQUEST_IP_SALT` con un valor privado y estable.
