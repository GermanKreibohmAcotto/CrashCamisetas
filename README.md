# Crash Camisetas

Catálogo de camisetas de fútbol (después buzos, pantalones, etc.) sin
pasarela de pago ni precios publicados. El visitante arma su pedido
eligiendo talle y lo envía por WhatsApp con un mensaje prearmado; precio y
disponibilidad se acuerdan en la conversación. Incluye un panel privado
(`/admin`) con CRUD de productos, categorías y stock por talle.

Diseño deliberadamente plano por ahora — se reemplaza más adelante.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Supabase** (Postgres + Auth + Storage), plan gratuito
- Sin backend aparte: los Server Components leen Supabase en el servidor
  y las Server Actions (`src/app/admin/actions.ts`) hacen de backend del
  CRUD del admin.

## Setup inicial (una sola vez)

### 1. Crear el proyecto en Supabase

En [supabase.com](https://supabase.com/dashboard) creá un proyecto nuevo
(plan gratuito alcanza).

### 2. Correr el schema

Dashboard → **SQL Editor** → **New query** → pegar todo el contenido de
[`supabase/schema.sql`](supabase/schema.sql) → **Run**.

Esto crea las tablas (`categories`, `products`, `product_variants`, sin
ninguna columna de precio), las políticas de RLS, el bucket de Storage
`product-images`, y carga 2 productos de ejemplo para probar.

### 3. Crear el usuario admin

Dashboard → **Authentication** → **Users** → **Add user** → cargar email
y contraseña, tildar **Auto Confirm User**. No hay registro público a
propósito: esta es la única cuenta con permiso de escritura.

### 4. Variables de entorno

```bash
cp .env.local.example .env.local
```

Completar en `.env.local`:

| Variable | De dónde sale |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Project Settings → API Keys → Publishable key (`sb_publishable_...`) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Número que recibe los pedidos. Formato internacional, solo dígitos, sin `+` (ej: `5491122334455`) |
| `NEXT_PUBLIC_STORE_NAME` | Nombre que aparece en el header y en el saludo del mensaje de WhatsApp |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Link del perfil de Instagram, se muestra en el footer. Vacío = no se muestra |

### 5. Instalar y correr

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev     # servidor de desarrollo
npm run build   # build de producción
npm run start   # correr el build de producción
npm run lint    # ESLint
```

## Estructura

```
supabase/schema.sql              tablas, RLS, bucket y seed — pegar en el SQL Editor
src/proxy.ts                     refresca la sesión de Supabase en cada request
src/lib/supabase/                clientes de Supabase (browser / server)
src/lib/cart-context.tsx         estado del carrito (localStorage)
src/lib/whatsapp.ts              arma el mensaje y el link de wa.me
src/app/                         tienda pública: catálogo, detalle, carrito
src/app/login/                   login del admin
src/app/admin/                   CRUD de productos y categorías (protegido)
```

## Notas

- **No hay precios en ningún lado** — ni en la base, ni en el carrito, ni
  en el mensaje de WhatsApp. Es a propósito.
- El stock se descuenta a mano desde el admin después de confirmar la
  venta por chat; no hay descuento automático al enviar el pedido.
- Eliminar una categoría no borra sus productos: quedan sin categoría.
