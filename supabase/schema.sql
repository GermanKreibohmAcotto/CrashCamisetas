-- ============================================================
-- CrashCamisetas — schema inicial
--
-- Cómo usarlo: Supabase Dashboard > SQL Editor > New query,
-- pegar este archivo completo y darle Run.
--
-- Es seguro correrlo más de una vez (tablas, índices, políticas
-- y seed usan guards idempotentes) — útil si algo falla a mitad
-- de camino y hay que reintentar.
--
-- OJO: acá no hay ninguna columna de precio. A propósito: los
-- precios se acuerdan por WhatsApp, no se publican en la tienda.
-- ============================================================

create extension if not exists pgcrypto;

-- ------------------------------------------------------------
-- Tablas
-- ------------------------------------------------------------

create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid references categories (id) on delete set null,
  name        text not null,
  slug        text not null unique,
  description text,
  image_url   text,
  -- etiqueta visual opcional para las tarjetas de producto
  badge       text check (badge is null or badge in ('nuevo', 'retro', 'limitado', 'mas_vendido')),
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists products_category_id_idx on products (category_id);
create index if not exists products_is_active_idx on products (is_active);

create table if not exists product_variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  size       text not null,
  stock      int not null default 0,
  sort_order int not null default 0,
  unique (product_id, size)
);

create index if not exists product_variants_product_id_idx on product_variants (product_id);

-- Fotos adicionales de la galería. image_url en products sigue siendo
-- la portada (la que usan la tarjeta y el carrito); esto es lo extra
-- que se ve en el detalle.
create table if not exists product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  url        text not null,
  sort_order int not null default 0
);

create index if not exists product_images_product_id_idx on product_images (product_id);

-- ------------------------------------------------------------
-- updated_at automático en products
-- ------------------------------------------------------------

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row
  execute function set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
--
-- Regla general: cualquiera puede LEER el catálogo (necesario
-- para que la tienda pública funcione sin login). Solo un usuario
-- autenticado (el admin, creado a mano en Authentication > Users)
-- puede escribir. Esta es la barrera real: aunque alguien llame
-- a la API de Supabase directo con la publishable key, no puede
-- insertar/editar/borrar sin sesión.
-- ------------------------------------------------------------

alter table categories enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;

-- categories: lectura pública total, escritura solo logueados
drop policy if exists "categories_select_public" on categories;
create policy "categories_select_public" on categories
  for select
  to anon, authenticated
  using (true);

drop policy if exists "categories_insert_auth" on categories;
create policy "categories_insert_auth" on categories
  for insert
  to authenticated
  with check (true);

drop policy if exists "categories_update_auth" on categories;
create policy "categories_update_auth" on categories
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "categories_delete_auth" on categories;
create policy "categories_delete_auth" on categories
  for delete
  to authenticated
  using (true);

-- products: el público solo ve los activos, el admin logueado ve todo
-- (incluidos los desactivados, para poder reactivarlos)
drop policy if exists "products_select_public_active" on products;
create policy "products_select_public_active" on products
  for select
  to anon
  using (is_active = true);

drop policy if exists "products_select_all_auth" on products;
create policy "products_select_all_auth" on products
  for select
  to authenticated
  using (true);

drop policy if exists "products_insert_auth" on products;
create policy "products_insert_auth" on products
  for insert
  to authenticated
  with check (true);

drop policy if exists "products_update_auth" on products;
create policy "products_update_auth" on products
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "products_delete_auth" on products;
create policy "products_delete_auth" on products
  for delete
  to authenticated
  using (true);

-- product_variants: lectura pública total (hace falta para mostrar
-- talles y si hay stock), escritura solo logueados
drop policy if exists "variants_select_public" on product_variants;
create policy "variants_select_public" on product_variants
  for select
  to anon, authenticated
  using (true);

drop policy if exists "variants_insert_auth" on product_variants;
create policy "variants_insert_auth" on product_variants
  for insert
  to authenticated
  with check (true);

drop policy if exists "variants_update_auth" on product_variants;
create policy "variants_update_auth" on product_variants
  for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "variants_delete_auth" on product_variants;
create policy "variants_delete_auth" on product_variants
  for delete
  to authenticated
  using (true);

-- product_images: misma regla que las demás — lectura pública,
-- escritura solo logueados. Nombradas "_row_" para no confundirse con
-- las políticas de storage.objects de más abajo (son tablas distintas,
-- pero comparten el prefijo "product_images").
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
-- Storage: bucket público de imágenes de producto
-- (RLS ya viene habilitada por Supabase en storage.objects)
-- ------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product_images_select_public" on storage.objects;
create policy "product_images_select_public" on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "product_images_insert_auth" on storage.objects;
create policy "product_images_insert_auth" on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'product-images');

drop policy if exists "product_images_update_auth" on storage.objects;
create policy "product_images_update_auth" on storage.objects
  for update
  to authenticated
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

drop policy if exists "product_images_delete_auth" on storage.objects;
create policy "product_images_delete_auth" on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'product-images');

-- ------------------------------------------------------------
-- Seed: 2 productos de ejemplo con talles, para probar la app
-- antes de cargar el catálogo real desde el admin.
-- ------------------------------------------------------------

insert into categories (name, slug, sort_order)
values ('Camisetas', 'camisetas', 0)
on conflict (slug) do nothing;

insert into products (category_id, name, slug, description, image_url, is_active)
select id, 'Boca Juniors Titular 2026', 'boca-juniors-titular-2026',
       'Camiseta titular de Boca Juniors, temporada 2026.',
       null, true
from categories where slug = 'camisetas'
on conflict (slug) do nothing;

insert into products (category_id, name, slug, description, image_url, is_active)
select id, 'River Plate Suplente 2026', 'river-plate-suplente-2026',
       'Camiseta suplente de River Plate, temporada 2026.',
       null, true
from categories where slug = 'camisetas'
on conflict (slug) do nothing;

insert into product_variants (product_id, size, stock, sort_order)
select p.id, v.size, v.stock, v.sort_order
from products p
cross join (
  values ('S', 5, 1), ('M', 8, 2), ('L', 8, 3), ('XL', 0, 4)
) as v(size, stock, sort_order)
where p.slug in ('boca-juniors-titular-2026', 'river-plate-suplente-2026')
on conflict (product_id, size) do nothing;

update products set badge = 'nuevo'
where slug = 'boca-juniors-titular-2026' and badge is null;
