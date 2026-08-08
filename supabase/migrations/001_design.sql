-- ============================================================
-- CrashCamisetas — migración 001: badges y galería de imágenes
--
-- Para un proyecto que YA corrió supabase/schema.sql (no lo
-- vuelvas a correr entero). Pegar esto en el SQL Editor de
-- Supabase y darle Run. Es seguro correrlo más de una vez.
--
-- Después de esta migración, supabase/schema.sql queda al día
-- con el mismo estado final — sirve como referencia para
-- instalaciones nuevas desde cero.
-- ============================================================

-- ------------------------------------------------------------
-- products.badge — etiqueta visual opcional de la tarjeta
-- ------------------------------------------------------------

alter table products
  add column if not exists badge text;

alter table products
  drop constraint if exists products_badge_check;
alter table products
  add constraint products_badge_check
  check (badge is null or badge in ('nuevo', 'retro', 'limitado', 'mas_vendido'));

-- ------------------------------------------------------------
-- product_images — galería adicional. image_url en products
-- sigue siendo la portada (tarjeta y carrito); esto es lo extra
-- que se ve en el detalle.
-- ------------------------------------------------------------

create table if not exists product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url        text not null,
  sort_order int not null default 0
);

create index if not exists product_images_product_id_idx on product_images (product_id);

alter table product_images enable row level security;

-- Nombradas "_row_" para no confundirse con las políticas del bucket
-- de storage.objects (tabla distinta, mismo prefijo "product_images").
drop policy if exists "product_images_row_select_public" on product_images;
create policy "product_images_row_select_public" on product_images
  for select
  to anon, authenticated
  using (true);

drop policy if exists "product_images_row_insert_auth" on product_images;
create policy "product_images_row_insert_auth" on product_images
  for insert
  to authenticated
  with check (true);

drop policy if exists "product_images_row_update_auth" on product_images;
create policy "product_images_row_update_auth" on product_images
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "product_images_row_delete_auth" on product_images;
create policy "product_images_row_delete_auth" on product_images
  for delete
  to authenticated
  using (true);

-- ------------------------------------------------------------
-- Badge de ejemplo en el seed, para ver el feature andando sin
-- cargar nada a mano.
-- ------------------------------------------------------------

update products set badge = 'nuevo'
where slug = 'boca-juniors-titular-2026' and badge is null;
