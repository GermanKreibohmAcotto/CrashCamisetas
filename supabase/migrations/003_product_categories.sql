-- ============================================================
-- CrashCamisetas — migración 003: categorías múltiples por producto
--
-- Para un proyecto que YA corrió supabase/schema.sql y las
-- migraciones 001 y 002 (no las vuelvas a correr enteras). Pegar
-- esto en el SQL Editor de Supabase y darle Run. Es seguro
-- correrlo más de una vez.
--
-- OJO — esta migración NO TOCA NINGUNA FILA DE products. Crea una
-- tabla puente nueva (product_categories) y la llena con un INSERT
-- que copia la categoría actual de cada producto — nunca un UPDATE
-- ni un DELETE sobre datos existentes. products.category_id queda
-- intacta, con todos sus valores, aunque el código deje de leerla:
-- es la red de seguridad si algo de esta migración hubiera que
-- revertir.
--
-- Después de esta migración, supabase/schema.sql queda al día con
-- el mismo estado final — sirve como referencia para instalaciones
-- nuevas desde cero.
-- ============================================================

-- ------------------------------------------------------------
-- product_categories — tabla puente N a N entre products y
-- categories. El primary key TIENE que ser el compuesto de las
-- dos foreign keys: desde PostgREST v10, una tabla puente solo se
-- detecta como join table (y por lo tanto es embebible desde el
-- cliente) si su PK incluye ambas columnas FK.
-- ------------------------------------------------------------

create table if not exists product_categories (
  product_id  uuid not null references products (id) on delete cascade,
  category_id uuid not null references categories (id) on delete cascade,
  primary key (product_id, category_id)
);

-- El PK ya cubre las búsquedas "categorías de este producto" (columna
-- líder product_id). Este índice cubre el sentido inverso, que es el
-- que usa el filtro de categoría del catálogo.
create index if not exists product_categories_category_id_idx
  on product_categories (category_id);

-- Backfill: copia la categoría actual de cada producto a la tabla
-- nueva. Sin este paso, los productos ya cargados en producción
-- quedarían sin categoría en el modelo nuevo. Es un INSERT en una
-- tabla que se acaba de crear vacía — no modifica products.
insert into product_categories (product_id, category_id)
select id, category_id from products where category_id is not null
on conflict do nothing;

-- ------------------------------------------------------------
-- Row Level Security — mismo criterio que el resto del esquema:
-- lectura pública total, escritura solo autenticado.
-- ------------------------------------------------------------

alter table product_categories enable row level security;

drop policy if exists "product_categories_select_public" on product_categories;
create policy "product_categories_select_public" on product_categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "product_categories_insert_auth" on product_categories;
create policy "product_categories_insert_auth" on product_categories
  for insert
  to authenticated
  with check (true);

drop policy if exists "product_categories_update_auth" on product_categories;
create policy "product_categories_update_auth" on product_categories
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "product_categories_delete_auth" on product_categories;
create policy "product_categories_delete_auth" on product_categories
  for delete
  to authenticated
  using (true);
