-- ════════════════════════════════════════════════════════════════════════
-- YUSUF SCORE — initial schema
-- Security model:
--   • Browser (anon key) may only READ active products/categories + public settings.
--   • All writes go through the Next.js server using the service-role key,
--     AFTER the server has verified an admin session (see src/lib/auth.ts).
--   • Admins are rows in public.admins linked to auth.users.
--   • Orders/coupons are never readable by anon.
-- ════════════════════════════════════════════════════════════════════════

-- gen_random_uuid() is built into PostgreSQL 13+ (Supabase runs 15+).

-- ── Admins ──────────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner','staff')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ── Catalogue ───────────────────────────────────────────────────────────
create table if not exists public.categories (
  id text primary key default ('cat-' || substr(gen_random_uuid()::text, 1, 8)),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,80}$'),
  name jsonb not null,               -- {"ar": "...", "tr": "...", "en": "..."}
  image text,
  sort_order int not null default 0
);

create table if not exists public.products (
  id text primary key default ('prd-' || substr(gen_random_uuid()::text, 1, 8)),
  slug text not null unique check (slug ~ '^[a-z0-9-]{1,120}$'),
  sku text not null unique,
  name jsonb not null,
  description jsonb not null default '{}'::jsonb,
  material jsonb,
  category_id text references public.categories(id) on delete set null,
  price_minor int not null check (price_minor >= 0),
  compare_at_minor int check (compare_at_minor is null or compare_at_minor >= 0),
  images text[] not null default '{}',
  colors jsonb not null default '[]'::jsonb,   -- [{code,hex,name:{ar,tr}}]
  sizes text[] not null default '{}',
  tags text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_created_idx on public.products(active, created_at desc);

create table if not exists public.product_variants (
  product_id text not null references public.products(id) on delete cascade,
  size text not null,
  color text not null,
  stock int not null default 0 check (stock >= 0),
  primary key (product_id, size, color)
);

-- ── Coupons ─────────────────────────────────────────────────────────────
create table if not exists public.coupons (
  id text primary key default ('cpn-' || substr(gen_random_uuid()::text, 1, 8)),
  code text not null unique check (code = upper(code)),
  type text not null check (type in ('percent','fixed')),
  value int not null check (value > 0),
  min_subtotal_minor int not null default 0,
  max_uses int,
  used_count int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true
);

-- ── Orders ──────────────────────────────────────────────────────────────
create sequence if not exists public.order_seq start 10001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique default ('YS-' || lpad(nextval('public.order_seq')::text, 5, '0')),
  locale text not null default 'ar',
  channel text not null check (channel in ('whatsapp','online')),
  status text not null default 'pending'
    check (status in ('pending','confirmed','preparing','shipped','delivered','cancelled','returned')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid','paid','refunded')),
  customer jsonb not null,
  address jsonb not null,
  subtotal_minor int not null,
  discount_minor int not null default 0,
  shipping_minor int not null default 0,
  total_minor int not null,
  coupon_code text,
  carrier text,
  tracking_number text,
  utm jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders(created_at desc);
create index if not exists orders_status_idx on public.orders(status);

create table if not exists public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  sku text not null,
  name text not null,
  size text not null,
  color text not null,
  color_code text not null,
  qty int not null check (qty > 0 and qty <= 20),
  unit_minor int not null check (unit_minor >= 0)
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ── Settings (single row) ───────────────────────────────────────────────
create table if not exists public.settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- ── updated_at triggers ─────────────────────────────────────────────────
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

-- ── Atomic order placement (server/service-role only) ───────────────────
-- Prices are computed by the trusted server; this function guarantees that
-- stock never goes negative under concurrent checkouts.
create or replace function public.place_order(p_order jsonb, p_items jsonb, p_coupon text)
returns public.orders language plpgsql security definer set search_path = public as $$
declare
  it jsonb;
  o public.orders;
  updated int;
begin
  for it in select * from jsonb_array_elements(p_items) loop
    update public.product_variants
       set stock = stock - (it->>'qty')::int
     where product_id = it->>'productId' and size = it->>'size' and color = it->>'colorCode'
       and stock >= (it->>'qty')::int;
    get diagnostics updated = row_count;
    if updated = 0 then
      raise exception 'out_of_stock:%', it->>'sku' using errcode = 'P0001';
    end if;
  end loop;

  if p_coupon is not null then
    update public.coupons set used_count = used_count + 1
     where code = p_coupon and active and (max_uses is null or used_count < max_uses);
    get diagnostics updated = row_count;
    if updated = 0 then raise exception 'invalid_coupon' using errcode = 'P0001'; end if;
  end if;

  insert into public.orders (locale, channel, customer, address, subtotal_minor, discount_minor,
                             shipping_minor, total_minor, coupon_code, utm)
  values (p_order->>'locale', p_order->>'channel', p_order->'customer', p_order->'address',
          (p_order->>'subtotalMinor')::int, (p_order->>'discountMinor')::int,
          (p_order->>'shippingMinor')::int, (p_order->>'totalMinor')::int, p_coupon, p_order->'utm')
  returning * into o;

  insert into public.order_items (order_id, product_id, sku, name, size, color, color_code, qty, unit_minor)
  select o.id, x->>'productId', x->>'sku', x->>'name', x->>'size', x->>'color', x->>'colorCode',
         (x->>'qty')::int, (x->>'unitMinor')::int
    from jsonb_array_elements(p_items) x;

  return o;
end $$;

-- Restock when an order is cancelled/returned
create or replace function public.restock_order(p_order uuid) returns void
language sql security definer set search_path = public as $$
  update public.product_variants v set stock = v.stock + i.qty
    from public.order_items i
   where i.order_id = p_order and v.product_id = i.product_id and v.size = i.size and v.color = i.color_code;
$$;

revoke all on function public.place_order(jsonb, jsonb, text) from public, anon, authenticated;
revoke all on function public.restock_order(uuid) from public, anon, authenticated;
grant execute on function public.place_order(jsonb, jsonb, text) to service_role;
grant execute on function public.restock_order(uuid) to service_role;

-- ── Row Level Security ──────────────────────────────────────────────────
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.settings enable row level security;

-- Public catalogue reads
drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories for select using (true);
drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products for select using (active or public.is_admin());
drop policy if exists "public read variants" on public.product_variants;
create policy "public read variants" on public.product_variants for select
  using (exists (select 1 from public.products p where p.id = product_id and (p.active or public.is_admin())));
drop policy if exists "public read settings" on public.settings;
create policy "public read settings" on public.settings for select using (true);

-- Admin-only (when using an authenticated admin JWT directly, e.g. a future native admin app)
drop policy if exists "admin all products" on public.products;
create policy "admin all products" on public.products for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all variants" on public.product_variants;
create policy "admin all variants" on public.product_variants for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all categories" on public.categories;
create policy "admin all categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin all coupons" on public.coupons;
create policy "admin all coupons" on public.coupons for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin read orders" on public.orders;
create policy "admin read orders" on public.orders for select using (public.is_admin());
drop policy if exists "admin update orders" on public.orders;
create policy "admin update orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin read order items" on public.order_items;
create policy "admin read order items" on public.order_items for select using (public.is_admin());
drop policy if exists "admin settings" on public.settings;
create policy "admin settings" on public.settings for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin self" on public.admins;
create policy "admin self" on public.admins for select using (user_id = auth.uid());
-- No insert policy on orders: anon cannot create orders directly; only place_order via the server.

-- ── Storage bucket for product images ───────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects for select using (bucket_id = 'product-images');
drop policy if exists "admin write product images" on storage.objects;
create policy "admin write product images" on storage.objects for all
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());
