-- Minimal demo seed for Supabase (categories). Add products from the admin panel.

insert into public.categories (id, slug, name, image, sort_order) values
 ('cat-outerwear','outerwear','{"ar":"معاطف وجاكيتات","tr":"Dış Giyim","en":"Outerwear"}','/demo/cat-outerwear.svg',1),
 ('cat-tailoring','tailoring','{"ar":"بليزرات وبدلات","tr":"Blazer & Takım","en":"Tailoring"}','/demo/cat-tailoring.svg',2),
 ('cat-shirts','shirts','{"ar":"قمصان","tr":"Gömlekler","en":"Shirts"}','/demo/cat-shirts.svg',3),
 ('cat-knitwear','knitwear','{"ar":"تريكو وكنزات","tr":"Triko","en":"Knitwear"}','/demo/cat-knitwear.svg',4),
 ('cat-trousers','trousers','{"ar":"بناطيل","tr":"Pantolonlar","en":"Trousers"}','/demo/cat-trousers.svg',5)
on conflict (id) do nothing;

-- Make yourself admin AFTER creating your user in Supabase Auth:
-- insert into public.admins (user_id, role) select id, 'owner' from auth.users where email = 'OWNER_EMAIL';
