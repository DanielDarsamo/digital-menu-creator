export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  category: string;
  subcategory?: string;
  image?: string;
  isVegetarian?: boolean;
  isSeafood?: boolean;
  isKidsFriendly?: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
}

export const menuCategories: MenuCategory[] = [
  {
    id: "entradas",
    name: "Entradas",
    icon: "🥗",
    items: [
      { id: "e1", name: "Bruscheta Mista", description: "Tomate, pesto de manjericão e alho", price: 490, category: "entradas", image: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&h=400&fit=crop" },
      { id: "e2", name: "Carpaccio de Carne", description: "Com rúcula, alcaparras e parmesão", price: 750, category: "entradas", image: "https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=600&h=400&fit=crop" },
      { id: "e3", name: "Salada Caesar", description: "Alface romana, croutons, parmesão e molho caesar", price: 520, category: "entradas", image: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&h=400&fit=crop" },
      { id: "e4", name: "Sopa do Dia", description: "Consulte o nosso staff", price: 380, category: "entradas", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop" },
      { id: "e5", name: "Camarão ao Alho", description: "Camarões salteados com alho e azeite", price: 890, category: "entradas", isSeafood: true, image: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=600&h=400&fit=crop" },
    ]
  },
  {
    id: "hamburgueres",
    name: "Hambúrgueres",
    icon: "🍔",
    items: [
      { id: "h1", name: "Classic Burger", description: "Carne 180g, queijo cheddar, alface, tomate, cebola e molho especial", price: 650, category: "hamburgueres", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop" },
      { id: "h2", name: "Bacon Lover", description: "Carne 180g, bacon crocante, queijo cheddar, cebola caramelizada", price: 750, category: "hamburgueres", image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&h=400&fit=crop" },
      { id: "h3", name: "Fortaleza Burger", description: "Dupla carne 360g, duplo queijo, bacon, ovo, cogumelos", price: 950, category: "hamburgueres", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&h=400&fit=crop" },
      { id: "h4", name: "Chicken Burger", description: "Peito de frango grelhado, queijo suíço, abacate e maionese de ervas", price: 620, category: "hamburgueres", image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&h=400&fit=crop" },
      { id: "h5", name: "Veggie Burger", description: "Hambúrguer de legumes, queijo halloumi, rúcula e hummus", price: 580, category: "hamburgueres", isVegetarian: true, image: "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&h=400&fit=crop" },
    ]
  },
  {
    id: "petiscos",
    name: "Petiscos",
    icon: "🍟",
    items: [
      { id: "p1", name: "Batatas Fritas", description: "Porção generosa com sal e ervas", price: 280, category: "petiscos", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&h=400&fit=crop" },
      { id: "p2", name: "Onion Rings", description: "Anéis de cebola empanados e crocantes", price: 320, category: "petiscos", image: "https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&h=400&fit=crop" },
      { id: "p3", name: "Chicken Wings", description: "Asinhas de frango com molho à escolha", price: 490, category: "petiscos", image: "https://images.unsplash.com/photo-1608039829572-25e8182a7554?w=600&h=400&fit=crop" },
      { id: "p4", name: "Nachos Completos", description: "Com guacamole, sour cream, jalapeños e queijo derretido", price: 520, category: "petiscos", image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&h=400&fit=crop" },
      { id: "p5", name: "Calamares Fritos", description: "Lulas empanadas com molho tártaro", price: 580, category: "petiscos", isSeafood: true, image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop" },
      { id: "p6", name: "Tábua de Queijos", description: "Seleção de queijos artesanais com mel e nozes", price: 720, category: "petiscos", image: "https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600&h=400&fit=crop" },
    ]
  },
  {
    id: "sopas",
    name: "Sopas",
    icon: "🍲",
    items: [
      { id: "s1", name: "Sopa de Tomate", description: "Com croutons e manjericão fresco", price: 350, category: "sopas", isVegetarian: true, image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&h=400&fit=crop" },
      { id: "s2", name: "Caldo Verde", description: "Tradicional portuguesa com chouriço", price: 380, category: "sopas", image: "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=600&h=400&fit=crop" },
      { id: "s3", name: "Sopa de Marisco", description: "Rica sopa com camarão, mexilhões e peixe", price: 650, category: "sopas", isSeafood: true, image: "https://images.unsplash.com/photo-1594756202469-9ff9799b2e4e?w=600&h=400&fit=crop" },
      { id: "s4", name: "Creme de Legumes", description: "Mistura de legumes da época", price: 320, category: "sopas", isVegetarian: true, image: "https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?w=600&h=400&fit=crop" },
    ]
  },
  {
    id: "pratos-principais",
    name: "Pratos Principais",
    icon: "🍽️",
    items: [
      { id: "pp1", name: "Picanha Grelhada", description: "400g com arroz, feijão tropeiro e farofa", price: 1450, category: "pratos-principais", image: "https://images.unsplash.com/photo-1558030006-450675393462?w=600&h=400&fit=crop" },
      { id: "pp2", name: "Frango à Cafreal", description: "Meio frango marinado com especiarias moçambicanas", price: 890, category: "pratos-principais", image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&h=400&fit=crop" },
      { id: "pp3", name: "Camarão à Moçambicana", description: "Camarões gigantes com molho de coco e piri-piri", price: 1650, category: "pratos-principais", isSeafood: true, image: "https://images.unsplash.com/photo-1625943553852-781c6dd46faa?w=600&h=400&fit=crop" },
      { id: "pp4", name: "Costelas de Porco BBQ", description: "Costelas lentas com molho barbecue caseiro", price: 980, category: "pratos-principais", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop" },
      { id: "pp5", name: "Peixe do Dia Grelhado", description: "Com legumes salteados e arroz de ervas", price: 1250, category: "pratos-principais", isSeafood: true, image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&h=400&fit=crop" },
      { id: "pp6", name: "Bife à Portuguesa", description: "Bife com ovo, presunto e batatas fritas", price: 1180, category: "pratos-principais", image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=600&h=400&fit=crop" },
      { id: "pp7", name: "Espetada Mista", description: "Carne, frango e camarão grelhados", price: 1350, category: "pratos-principais", isSeafood: true, image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop" },
    ]
  },
  {
    id: "tabuas",
    name: "Tábuas",
    icon: "🥩",
    items: [
      { id: "t1", name: "Tábua de Carnes (2 pessoas)", description: "Picanha, frango, linguiça, costela e acompanhamentos", price: 2400, category: "tabuas", image: "https://images.unsplash.com/photo-1558030137-a56c1b004bba?w=600&h=400&fit=crop" },
      { id: "t2", name: "Tábua de Carnes (4 pessoas)", description: "Variedade completa de carnes grelhadas", price: 4200, category: "tabuas", image: "https://images.unsplash.com/photo-1529694157872-4e0c0f3b238b?w=600&h=400&fit=crop" },
      { id: "t3", name: "Tábua de Carnes (6 pessoas)", description: "Experiência completa para grupos", price: 5800, category: "tabuas", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop" },
      { id: "t4", name: "Tábua de Mariscos (2 pessoas)", description: "Camarão, lagosta, caranguejo e mexilhões", price: 3200, category: "tabuas", isSeafood: true, image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&h=400&fit=crop" },
      { id: "t5", name: "Tábua de Mariscos (4 pessoas)", description: "Festim de frutos do mar", price: 5800, category: "tabuas", isSeafood: true, image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=600&h=400&fit=crop" },
      { id: "t6", name: "Tábua de Mariscos (6 pessoas)", description: "A experiência definitiva de mariscos", price: 8200, category: "tabuas", isSeafood: true, image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=600&h=400&fit=crop" },
    ]
  },
  {
    id: "pizzas",
    name: "Pizzas",
    icon: "🍕",
    items: [
      { id: "pz1", name: "Margherita", description: "Molho de tomate, mozzarella e manjericão fresco", price: 580, category: "pizzas", isVegetarian: true, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop" },
      { id: "pz2", name: "Pepperoni", description: "Molho de tomate, mozzarella e pepperoni", price: 680, category: "pizzas", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop" },
      { id: "pz3", name: "Quatro Queijos", description: "Mozzarella, gorgonzola, parmesão e provolone", price: 720, category: "pizzas", isVegetarian: true, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop" },
      { id: "pz4", name: "Frango com Catupiry", description: "Frango desfiado, catupiry e milho", price: 690, category: "pizzas", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop" },
      { id: "pz5", name: "Portuguesa", description: "Presunto, ovo, cebola, azeitonas e pimentos", price: 720, category: "pizzas", image: "https://images.unsplash.com/photo-1600028068383-ea11a7a101f3?w=600&h=400&fit=crop" },
      { id: "pz6", name: "Camarão", description: "Camarões, alho, mozzarella e rúcula", price: 890, category: "pizzas", isSeafood: true, image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&h=400&fit=crop" },
      { id: "pz7", name: "Vegetariana", description: "Legumes grelhados, azeitonas e queijo feta", price: 620, category: "pizzas", isVegetarian: true, image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&h=400&fit=crop" },
    ]
  },
  {
    id: "massas",
    name: "Massas",
    icon: "🍝",
    items: [
      { id: "m1", name: "Spaghetti Carbonara", description: "Com bacon, ovo, parmesão e pimenta preta", price: 620, category: "massas", image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop" },
      { id: "m2", name: "Fettuccine Alfredo", description: "Massa fresca com molho cremoso de queijo", price: 580, category: "massas", isVegetarian: true, image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600&h=400&fit=crop" },
      { id: "m3", name: "Lasanha Bolonhesa", description: "Camadas de massa, carne e molho béchamel", price: 680, category: "massas", image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=600&h=400&fit=crop" },
      { id: "m4", name: "Penne ao Pesto", description: "Com pesto de manjericão caseiro e parmesão", price: 550, category: "massas", isVegetarian: true, image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop" },
      { id: "m5", name: "Spaghetti com Frutos do Mar", description: "Camarão, mexilhões, lulas em molho de tomate", price: 890, category: "massas", isSeafood: true, image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=400&fit=crop" },
      { id: "m6", name: "Ravioli de Espinafre", description: "Recheado com ricota, molho de tomate fresco", price: 620, category: "massas", isVegetarian: true, image: "https://images.unsplash.com/photo-1587740908075-9e245070dfaa?w=600&h=400&fit=crop" },
    ]
  },
  {
    id: "wraps",
    name: "Wraps",
    icon: "🌯",
    items: [
      { id: "w1", name: "Wrap de Frango Grelhado", description: "Frango, alface, tomate, queijo e maionese", price: 480, category: "wraps", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop" },
      { id: "w2", name: "Wrap Vegetariano", description: "Legumes grelhados, hummus e queijo feta", price: 420, category: "wraps", isVegetarian: true, image: "https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=600&h=400&fit=crop" },
      { id: "w3", name: "Wrap de Carne", description: "Tiras de carne, cebola caramelizada e molho chimichurri", price: 520, category: "wraps", image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=600&h=400&fit=crop" },
      { id: "w4", name: "Wrap Caesar", description: "Frango crocante, alface romana e molho caesar", price: 490, category: "wraps", image: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f?w=600&h=400&fit=crop" },
    ]
  },
  {
    id: "sobremesas",
    name: "Sobremesas",
    icon: "🍰",
    items: [
      { id: "sb1", name: "Cheesecake", description: "Com calda de frutas vermelhas", price: 380, category: "sobremesas", image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&h=400&fit=crop" },
      { id: "sb2", name: "Brownie com Gelado", description: "Brownie quente com gelado de baunilha", price: 420, category: "sobremesas", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&h=400&fit=crop" },
      { id: "sb3", name: "Pudim de Leite", description: "Tradicional português com caramelo", price: 320, category: "sobremesas", image: "https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=600&h=400&fit=crop" },
      { id: "sb4", name: "Mousse de Chocolate", description: "Intenso chocolate belga", price: 350, category: "sobremesas", image: "https://images.unsplash.com/photo-1541783245831-57d6fb0926d3?w=600&h=400&fit=crop" },
      { id: "sb5", name: "Tiramisu", description: "Clássico italiano com café e mascarpone", price: 420, category: "sobremesas", image: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop" },
      { id: "sb6", name: "Gelado (3 bolas)", description: "Sabores à escolha", price: 280, category: "sobremesas", image: "https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?w=600&h=400&fit=crop" },
    ]
  },
  {
    id: "menu-infantil",
    name: "Menu Infantil",
    icon: "👶",
    items: [
      { id: "mi1", name: "Mini Hambúrguer", description: "Com batatas fritas e sumo", price: 380, category: "menu-infantil", isKidsFriendly: true, image: "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=600&h=400&fit=crop" },
      { id: "mi2", name: "Nuggets de Frango", description: "6 unidades com batatas e molho", price: 350, category: "menu-infantil", isKidsFriendly: true, image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop" },
      { id: "mi3", name: "Mini Pizza Margherita", description: "Tamanho perfeito para os pequenos", price: 320, category: "menu-infantil", isKidsFriendly: true, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop" },
      { id: "mi4", name: "Spaghetti com Molho", description: "Molho de tomate ou bolonhesa", price: 340, category: "menu-infantil", isKidsFriendly: true, image: "https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?w=600&h=400&fit=crop" },
      { id: "mi5", name: "Frango Grelhado com Arroz", description: "Opção saudável para crianças", price: 360, category: "menu-infantil", isKidsFriendly: true, image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&h=400&fit=crop" },
    ]
  },
  {
    id: "bebidas",
    name: "Bebidas",
    icon: "🥤",
    items: [
      { id: "b1", name: "Água Mineral", description: "500ml", price: 80, category: "bebidas", subcategory: "Águas", image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&h=400&fit=crop" },
      { id: "b2", name: "Água com Gás", description: "500ml", price: 90, category: "bebidas", subcategory: "Águas", image: "https://images.unsplash.com/photo-1606168094336-48f205276929?w=600&h=400&fit=crop" },
      { id: "b3", name: "Refrigerante", description: "Coca-Cola, Fanta, Sprite", price: 120, category: "bebidas", subcategory: "Refrigerantes", image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&h=400&fit=crop" },
      { id: "b4", name: "Sumo Natural", description: "Laranja, Maracujá, Manga", price: 180, category: "bebidas", subcategory: "Sumos", image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=400&fit=crop" },
      { id: "b5", name: "Limonada Fresca", description: "Com hortelã", price: 150, category: "bebidas", subcategory: "Sumos", image: "https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=600&h=400&fit=crop" },
      { id: "b6", name: "Café Expresso", description: "Intenso e aromático", price: 80, category: "bebidas", subcategory: "Bebidas Quentes", image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600&h=400&fit=crop" },
      { id: "b7", name: "Cappuccino", description: "Com espuma de leite", price: 150, category: "bebidas", subcategory: "Bebidas Quentes", image: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&h=400&fit=crop" },
      { id: "b8", name: "Chá", description: "Variedades disponíveis", price: 100, category: "bebidas", subcategory: "Bebidas Quentes", image: "https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?w=600&h=400&fit=crop" },
      { id: "b9", name: "Cerveja Nacional", description: "2M, Laurentina, Manica", price: 120, category: "bebidas", subcategory: "Cervejas", image: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=600&h=400&fit=crop" },
      { id: "b10", name: "Cerveja Importada", description: "Heineken, Corona, Stella", price: 180, category: "bebidas", subcategory: "Cervejas", image: "https://images.unsplash.com/photo-1618885472179-5e474019f2a9?w=600&h=400&fit=crop" },
    ]
  },
  {
    id: "vinhos-cocktails",
    name: "Vinhos & Cocktails",
    icon: "🍷",
    items: [
      { id: "vc1", name: "Vinho da Casa Tinto", description: "Copo / Garrafa", price: "180 / 850", category: "vinhos-cocktails", subcategory: "Vinhos", image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop" },
      { id: "vc2", name: "Vinho da Casa Branco", description: "Copo / Garrafa", price: "180 / 850", category: "vinhos-cocktails", subcategory: "Vinhos", image: "https://images.unsplash.com/photo-1566754436053-5e92626b1b52?w=600&h=400&fit=crop" },
      { id: "vc3", name: "Vinho da Casa Rosé", description: "Copo / Garrafa", price: "180 / 850", category: "vinhos-cocktails", subcategory: "Vinhos", image: "https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=600&h=400&fit=crop" },
      { id: "vc4", name: "Caipirinha", description: "Limão, açúcar e cachaça", price: 320, category: "vinhos-cocktails", subcategory: "Cocktails", image: "https://images.unsplash.com/photo-1541546006121-5c3bc5e8c7b9?w=600&h=400&fit=crop" },
      { id: "vc5", name: "Mojito", description: "Rum, hortelã, lima e soda", price: 350, category: "vinhos-cocktails", subcategory: "Cocktails", image: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&h=400&fit=crop" },
      { id: "vc6", name: "Piña Colada", description: "Rum, coco e ananás", price: 380, category: "vinhos-cocktails", subcategory: "Cocktails", image: "https://images.unsplash.com/photo-1586500036706-41963de24d8b?w=600&h=400&fit=crop" },
      { id: "vc7", name: "Margarita", description: "Tequila, triple sec e lima", price: 350, category: "vinhos-cocktails", subcategory: "Cocktails", image: "https://images.unsplash.com/photo-1556855810-ac404aa91e85?w=600&h=400&fit=crop" },
      { id: "vc8", name: "Gin Tónico", description: "Gin premium com tónica e botanicals", price: 320, category: "vinhos-cocktails", subcategory: "Cocktails", image: "https://images.unsplash.com/photo-1560508180-03f285f67ded?w=600&h=400&fit=crop" },
      { id: "vc9", name: "Whisky", description: "Johnnie Walker, Jack Daniel's", price: 280, category: "vinhos-cocktails", subcategory: "Spirits", image: "https://images.unsplash.com/photo-1527281400683-1aae777175f8?w=600&h=400&fit=crop" },
      { id: "vc10", name: "Vodka", description: "Absolut, Smirnoff", price: 220, category: "vinhos-cocktails", subcategory: "Spirits", image: "https://images.unsplash.com/photo-1607622750671-6cd9a99eabd1?w=600&h=400&fit=crop" },
    ]
  },
];

export const restaurantInfo = {
  name: "Fortaleza de Sabores",
  tagline: "Descubra como a verdadeira qualidade tem gosto",
  story: "Bem-vindo à Fortaleza de Sabores, onde cada prato conta uma história de paixão e tradição. Nascidos do amor pela gastronomia moçambicana e influências portuguesas, criamos experiências culinárias únicas que celebram os sabores autênticos da nossa terra. O nosso compromisso é oferecer-lhe momentos memoráveis, combinando ingredientes frescos, receitas tradicionais e um serviço de excelência.",
  phone: "87 183 8947",
  whatsapp: "258871838947",
  address: "Casa da Cultura, Av. Ho Chi Min, esquina com a Av. Albert Lithuli, Cidade de Maputo",
  hours: "Segunda a Domingo: 11:00 - 23:00",
};
