-- ============================================================
-- CrashCamisetas — migración 002: precio de producto
--
-- Para un proyecto que YA corrió supabase/schema.sql y la
-- migración 001 (no los vuelvas a correr enteros). Pegar esto
-- en el SQL Editor de Supabase y darle Run. Es seguro correrlo
-- más de una vez.
--
-- OJO — esta migración NO TOCA NINGUNA FILA EXISTENTE, y eso es
-- a propósito. La columna se agrega nullable y sin default, que
-- en Postgres es un cambio de metadata: instantáneo, sin
-- reescribir la tabla. Los productos que ya están cargados
-- quedan con price = null y se siguen viendo exactamente igual
-- que antes ("Consultar" en la tarjeta, sin importes en el
-- carrito ni en WhatsApp) hasta que les cargues el precio a
-- mano desde el admin. Por eso acá no hay ningún update ni
-- backfill: los precios se cargan de a uno, cuando quieras.
--
-- price = null no es un estado roto — significa "a convenir", y
-- la tienda lo soporta de forma permanente.
--
-- Después de esta migración, supabase/schema.sql queda al día
-- con el mismo estado final — sirve como referencia para
-- instalaciones nuevas desde cero.
-- ============================================================

-- ------------------------------------------------------------
-- products.price — importe en pesos, nullable = "a convenir"
--
-- numeric(12,2) y no float: los float binarios no representan
-- importes decimales de forma exacta. El techo (10 dígitos
-- enteros) deja margen de sobra para la inflación.
-- ------------------------------------------------------------

alter table products
  add column if not exists price numeric(12,2);

-- Nombrado explícitamente para poder droppearlo por nombre y que
-- la migración siga siendo idempotente.
alter table products
  drop constraint if exists products_price_check;
alter table products
  add constraint products_price_check
  check (price is null or price >= 0);
