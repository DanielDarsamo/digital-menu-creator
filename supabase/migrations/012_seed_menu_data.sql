-- 012_seed_menu_data.sql
-- Seeds the initial menu data. 
-- IMPORTANT: Run 011_create_menu_tables.sql FIRST.

DO $$
DECLARE
    -- Categories IDs
    cat_entradas UUID := gen_random_uuid();
    cat_hamburgueres UUID := gen_random_uuid();
    cat_petiscos UUID := gen_random_uuid();
    cat_sopas UUID := gen_random_uuid();
    cat_pratos_principais UUID := gen_random_uuid();
    cat_tabuas UUID := gen_random_uuid();
    cat_pizzas UUID := gen_random_uuid();
    cat_massas UUID := gen_random_uuid();
    cat_wraps UUID := gen_random_uuid();
    cat_sobremesas UUID := gen_random_uuid();
    cat_menu_infantil UUID := gen_random_uuid();
    cat_bebidas UUID := gen_random_uuid();
    cat_vinhos_cocktails UUID := gen_random_uuid();
BEGIN
    -- 1. Insert Categories
    INSERT INTO public.menu_categories (id, name, icon, sort_order) VALUES
    (cat_entradas, 'Entradas', '🥗', 1),
    (cat_hamburgueres, 'Hambúrgueres', '🍔', 2),
    (cat_petiscos, 'Petiscos', '🍟', 3),
    (cat_sopas, 'Sopas', '🍲', 4),
    (cat_pratos_principais, 'Pratos Principais', '🍽️', 5),
    (cat_tabuas, 'Tábuas', '🥩', 6),
    (cat_pizzas, 'Pizzas', '🍕', 7),
    (cat_massas, 'Massas', '🍝', 8),
    (cat_wraps, 'Wraps', '🌯', 9),
    (cat_sobremesas, 'Sobremesas', '🍰', 10),
    (cat_menu_infantil, 'Menu Infantil', '👶', 11),
    (cat_bebidas, 'Bebidas', '🥤', 12),
    (cat_vinhos_cocktails, 'Vinhos & Cocktails', '🍷', 13)
    ON CONFLICT DO NOTHING; -- No conflict clause on ID strictly needed if random, but good practice

    -- 2. Insert Items (Entradas)
    INSERT INTO public.menu_items (category_id, name, description, price, is_vegetarian, is_seafood, image_url) VALUES
    (cat_entradas, 'Bruscheta Mista', 'Tomate, pesto de manjericão e alho', 490, true, false, 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f'),
    (cat_entradas, 'Carpaccio de Carne', 'Com rúcula, alcaparras e parmesão', 750, false, false, 'https://images.unsplash.com/photo-1608897013039-887f21d8c804'),
    (cat_entradas, 'Salada Caesar', 'Alface romana, croutons, parmesão e molho caesar', 520, false, false, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9'),
    (cat_entradas, 'Sopa do Dia', 'Consulte o nosso staff', 380, false, false, 'https://images.unsplash.com/photo-1547592166-23ac45744acd'),
    (cat_entradas, 'Camarão ao Alho', 'Camarões salteados com alho e azeite', 890, false, true, 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6');

    -- Hambúrgueres
    INSERT INTO public.menu_items (category_id, name, description, price, is_vegetarian, image_url) VALUES
    (cat_hamburgueres, 'Classic Burger', 'Carne 180g, queijo cheddar, alface, tomate, cebola e molho especial', 650, false, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'),
    (cat_hamburgueres, 'Bacon Lover', 'Carne 180g, bacon crocante, queijo cheddar, cebola caramelizada', 750, false, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b'),
    (cat_hamburgueres, 'Fortaleza Burger', 'Dupla carne 360g, duplo queijo, bacon, ovo, cogumelos', 950, false, 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5'),
    (cat_hamburgueres, 'Chicken Burger', 'Peito de frango grelhado, queijo suíço, abacate e maionese de ervas', 620, false, 'https://images.unsplash.com/photo-1606755962773-d324e0a13086'),
    (cat_hamburgueres, 'Veggie Burger', 'Hambúrguer de legumes, queijo halloumi, rúcula e hummus', 580, true, 'https://images.unsplash.com/photo-1520072959219-c595dc870360');

    -- Petiscos
    INSERT INTO public.menu_items (category_id, name, description, price, is_vegetarian, is_seafood, is_kids_friendly, image_url) VALUES
    (cat_petiscos, 'Batatas Fritas', 'Porção generosa com sal e ervas', 280, true, false, true, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877'),
    (cat_petiscos, 'Onion Rings', 'Anéis de cebola empanados e crocantes', 320, true, false, false, 'https://images.unsplash.com/photo-1639024471283-03518883512d'),
    (cat_petiscos, 'Chicken Wings', 'Asinhas de frango com molho à escolha', 490, false, false, false, 'https://images.unsplash.com/photo-1608039829572-25e8182a7554'),
    (cat_petiscos, 'Nachos Completos', 'Com guacamole, sour cream, jalapeños e queijo derretido', 520, true, false, false, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d'),
    (cat_petiscos, 'Calamares Fritos', 'Lulas empanadas com molho tártaro', 580, false, true, false, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0'),
    (cat_petiscos, 'Tábua de Queijos', 'Seleção de queijos artesanais com mel e nozes', 720, true, false, false, 'https://images.unsplash.com/photo-1452195100486-9cc805987862');
    
    -- Sopas
    INSERT INTO public.menu_items (category_id, name, description, price, is_vegetarian, is_seafood, image_url) VALUES
    (cat_sopas, 'Sopa de Tomate', 'Com croutons e manjericão fresco', 350, true, false, 'https://images.unsplash.com/photo-1547592166-23ac45744acd'),
    (cat_sopas, 'Caldo Verde', 'Tradicional portuguesa com chouriço', 380, false, false, 'https://images.unsplash.com/photo-1604152135912-04a022e23696'),
    (cat_sopas, 'Sopa de Marisco', 'Rica sopa com camarão, mexilhões e peixe', 650, false, true, 'https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e'),
    (cat_sopas, 'Creme de Legumes', 'Mistura de legumes da época', 320, true, false, 'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a');

    -- Pratos Principais
    INSERT INTO public.menu_items (category_id, name, description, price, is_seafood, image_url) VALUES
    (cat_pratos_principais, 'Picanha Grelhada', '400g com arroz, feijão tropeiro e farofa', 1450, false, 'https://images.unsplash.com/photo-1558030006-450675393462'),
    (cat_pratos_principais, 'Frango à Cafreal', 'Meio frango marinado com especiarias moçambicanas', 890, false, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6'),
    (cat_pratos_principais, 'Camarão à Moçambicana', 'Camarões gigantes com molho de coco e piri-piri', 1650, true, 'https://images.unsplash.com/photo-1625943553852-781c6dd46faa'),
    (cat_pratos_principais, 'Costelas de Porco BBQ', 'Costelas lentas com molho barbecue caseiro', 980, false, 'https://images.unsplash.com/photo-1544025162-d76694265947'),
    (cat_pratos_principais, 'Peixe do Dia Grelhado', 'Com legumes salteados e arroz de ervas', 1250, true, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2'),
    (cat_pratos_principais, 'Bife à Portuguesa', 'Bife com ovo, presunto e batatas fritas', 1180, false, 'https://images.unsplash.com/photo-1600891964092-4316c288032e'),
    (cat_pratos_principais, 'Espetada Mista', 'Carne, frango e camarão grelhados', 1350, true, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1');

    -- Tábuas
    INSERT INTO public.menu_items (category_id, name, description, price, is_seafood, image_url) VALUES
    (cat_tabuas, 'Tábua de Carnes (2 pessoas)', 'Picanha, frango, linguiça, costela e acompanhamentos', 2400, false, 'https://images.unsplash.com/photo-1558030137-a56c1b004bba'),
    (cat_tabuas, 'Tábua de Carnes (4 pessoas)', 'Variedade completa de carnes grelhadas', 4200, false, 'https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b'),
    (cat_tabuas, 'Tábua de Carnes (6 pessoas)', 'Experiência completa para grupos', 5800, false, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836'),
    (cat_tabuas, 'Tábua de Mariscos (2 pessoas)', 'Camarão, lagosta, caranguejo e mexilhões', 3200, true, 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62'),
    (cat_tabuas, 'Tábua de Mariscos (4 pessoas)', 'Festim de frutos do mar', 5800, true, 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b'),
    (cat_tabuas, 'Tábua de Mariscos (6 pessoas)', 'A experiência definitiva de mariscos', 8200, true, 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47');

    -- Pizzas
    INSERT INTO public.menu_items (category_id, name, description, price, is_vegetarian, is_seafood, image_url) VALUES
    (cat_pizzas, 'Margherita', 'Molho de tomate, mozzarella e manjericão fresco', 580, true, false, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002'),
    (cat_pizzas, 'Pepperoni', 'Molho de tomate, mozzarella e pepperoni', 680, false, false, 'https://images.unsplash.com/photo-1628840042765-356cda07504e'),
    (cat_pizzas, 'Quatro Queijos', 'Mozzarella, gorgonzola, parmesão e provolone', 720, true, false, 'https://images.unsplash.com/photo-1513104890138-7c749659a591'),
    (cat_pizzas, 'Frango com Catupiry', 'Frango desfiado, catupiry e milho', 690, false, false, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38'),
    (cat_pizzas, 'Portuguesa', 'Presunto, ovo, cebola, azeitonas e pimentos', 720, false, false, 'https://images.unsplash.com/photo-1600028068383-ea11a7a101f3'),
    (cat_pizzas, 'Camarão', 'Camarões, alho, mozzarella e rúcula', 890, false, true, 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e'),
    (cat_pizzas, 'Vegetariana', 'Legumes grelhados, azeitonas e queijo feta', 620, true, false, 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47');

    -- Massas
    INSERT INTO public.menu_items (category_id, name, description, price, is_vegetarian, is_seafood, image_url) VALUES
    (cat_massas, 'Spaghetti Carbonara', 'Com bacon, ovo, parmesão e pimenta preta', 620, false, false, 'https://images.unsplash.com/photo-1612874742237-6526221588e3'),
    (cat_massas, 'Fettuccine Alfredo', 'Massa fresca com molho cremoso de queijo', 580, true, false, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a'),
    (cat_massas, 'Lasanha Bolonhesa', 'Camadas de massa, carne e molho béchamel', 680, false, false, 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3'),
    (cat_massas, 'Penne ao Pesto', 'Com pesto de manjericão caseiro e parmesão', 550, true, false, 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9'),
    (cat_massas, 'Spaghetti com Frutos do Mar', 'Camarão, mexilhões, lulas em molho de tomate', 890, false, true, 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8'),
    (cat_massas, 'Ravioli de Espinafre', 'Recheado com ricota, molho de tomate fresco', 620, true, false, 'https://images.unsplash.com/photo-1587740908075-9e245070dfaa');

    -- Wraps
    INSERT INTO public.menu_items (category_id, name, description, price, is_vegetarian, image_url) VALUES
    (cat_wraps, 'Wrap de Frango Grelhado', 'Frango, alface, tomate, queijo e maionese', 480, false, 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f'),
    (cat_wraps, 'Wrap Vegetariano', 'Legumes grelhados, hummus e queijo feta', 420, true, 'https://images.unsplash.com/photo-1600335895229-6e75511892c8'),
    (cat_wraps, 'Wrap de Carne', 'Tiras de carne, cebola caramelizada e molho chimichurri', 520, false, 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f'),
    (cat_wraps, 'Wrap Caesar', 'Frango crocante, alface romana e molho caesar', 490, false, 'https://images.unsplash.com/photo-1627308595229-7830a5c91f9f');

    -- Sobremesas
    INSERT INTO public.menu_items (category_id, name, description, price, is_vegetarian, is_kids_friendly, image_url) VALUES
    (cat_sobremesas, 'Cheesecake', 'Com calda de frutas vermelhas', 380, true, false, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad'),
    (cat_sobremesas, 'Brownie com Gelado', 'Brownie quente com gelado de baunilha', 420, true, false, 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c'),
    (cat_sobremesas, 'Pudim de Leite', 'Tradicional português com caramelo', 320, true, false, 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c'),
    (cat_sobremesas, 'Mousse de Chocolate', 'Intenso chocolate belga', 350, true, false, 'https://images.unsplash.com/photo-1541783245831-57d6fb0926d3'),
    (cat_sobremesas, 'Tiramisu', 'Clássico italiano com café e mascarpone', 420, true, false, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9'),
    (cat_sobremesas, 'Gelado (3 bolas)', 'Sabores à escolha', 280, true, true, 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57');

    -- Menu Infantil
    INSERT INTO public.menu_items (category_id, name, description, price, is_kids_friendly, image_url) VALUES
    (cat_menu_infantil, 'Mini Hambúrguer', 'Com batatas fritas e sumo', 380, true, 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9'),
    (cat_menu_infantil, 'Nuggets de Frango', '6 unidades com batatas e molho', 350, true, 'https://images.unsplash.com/photo-1562967914-608f82629710'),
    (cat_menu_infantil, 'Mini Pizza Margherita', 'Tamanho perfeito para os pequenos', 320, true, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38'),
    (cat_menu_infantil, 'Spaghetti com Molho', 'Molho de tomate ou bolonhesa', 340, true, 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0'),
    (cat_menu_infantil, 'Frango Grelhado com Arroz', 'Opção saudável para crianças', 360, true, 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b');

    -- Bebidas
    INSERT INTO public.menu_items (category_id, name, description, price, is_vegetarian, is_kids_friendly, image_url) VALUES
    (cat_bebidas, 'Água Mineral', '500ml', 80, true, true, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d'),
    (cat_bebidas, 'Água com Gás', '500ml', 90, true, true, 'https://images.unsplash.com/photo-1606168094336-48f205276929'),
    (cat_bebidas, 'Refrigerante', 'Coca-Cola, Fanta, Sprite', 120, true, true, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97'),
    (cat_bebidas, 'Sumo Natural', 'Laranja, Maracujá, Manga', 180, true, true, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba'),
    (cat_bebidas, 'Limonada Fresca', 'Com hortelã', 150, true, true, 'https://images.unsplash.com/photo-1621263764928-df1444c5e859'),
    (cat_bebidas, 'Café Expresso', 'Intenso e aromático', 80, true, false, 'https://images.unsplash.com/photo-1510707577719-ae7c14805e3a'),
    (cat_bebidas, 'Cappuccino', 'Com espuma de leite', 150, true, false, 'https://images.unsplash.com/photo-1572442388796-11668a67e53d'),
    (cat_bebidas, 'Chá', 'Variedades disponíveis', 100, true, false, 'https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2'),
    (cat_bebidas, 'Cerveja Nacional', '2M, Laurentina, Manica', 120, true, false, 'https://images.unsplash.com/photo-1608270586620-248524c67de9'),
    (cat_bebidas, 'Cerveja Importada', 'Heineken, Corona, Stella', 180, true, false, 'https://images.unsplash.com/photo-1618885472179-5e474019f2a9');

    -- Vinhos & Cocktails
    -- Handle string prices by taking base price for simplicity in SQL seed, assuming app logic allows updates later
    INSERT INTO public.menu_items (category_id, name, description, price, image_url) VALUES
    (cat_vinhos_cocktails, 'Vinho da Casa Tinto', 'Copo (180)', 180, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3'), -- Simplified
    (cat_vinhos_cocktails, 'Vinho da Casa Branco', 'Copo (180)', 180, 'https://images.unsplash.com/photo-1566754436053-5e92626b1b52'),
    (cat_vinhos_cocktails, 'Vinho da Casa Rosé', 'Copo (180)', 180, 'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0'),
    (cat_vinhos_cocktails, 'Caipirinha', 'Limão, açúcar e cachaça', 320, 'https://images.unsplash.com/photo-1541546006121-5c3bc5e8c7b9'),
    (cat_vinhos_cocktails, 'Mojito', 'Rum, hortelã, lima e soda', 350, 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a'),
    (cat_vinhos_cocktails, 'Piña Colada', 'Rum, coco e ananás', 380, 'https://images.unsplash.com/photo-1586500036706-41963de24d8b'),
    (cat_vinhos_cocktails, 'Margarita', 'Tequila, triple sec e lima', 350, 'https://images.unsplash.com/photo-1556855810-ac404aa91e85'),
    (cat_vinhos_cocktails, 'Gin Tónico', 'Gin premium com tónica e botanicals', 320, 'https://images.unsplash.com/photo-1560508180-03f285f67ded'),
    (cat_vinhos_cocktails, 'Whisky', 'Johnnie Walker, Jack Daniel''s', 280, 'https://images.unsplash.com/photo-1527281400683-1aae777175f8'),
    (cat_vinhos_cocktails, 'Vodka', 'Absolut, Smirnoff', 220, 'https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1');
    
    RAISE NOTICE 'Menu seeded successfully';
END $$;
