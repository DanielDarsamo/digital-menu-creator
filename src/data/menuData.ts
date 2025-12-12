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
      { id: "e1", name: "Bruscheta Mista", description: "Tomate, pesto de manjericão e alho", price: 490, category: "entradas" },
      { id: "e2", name: "Carpaccio de Carne", description: "Com rúcula, alcaparras e parmesão", price: 750, category: "entradas" },
      { id: "e3", name: "Salada Caesar", description: "Alface romana, croutons, parmesão e molho caesar", price: 520, category: "entradas" },
      { id: "e4", name: "Sopa do Dia", description: "Consulte o nosso staff", price: 380, category: "entradas" },
      { id: "e5", name: "Camarão ao Alho", description: "Camarões salteados com alho e azeite", price: 890, category: "entradas", isSeafood: true },
    ]
  },
  {
    id: "hamburgueres",
    name: "Hambúrgueres",
    icon: "🍔",
    items: [
      { id: "h1", name: "Classic Burger", description: "Carne 180g, queijo cheddar, alface, tomate, cebola e molho especial", price: 650, category: "hamburgueres" },
      { id: "h2", name: "Bacon Lover", description: "Carne 180g, bacon crocante, queijo cheddar, cebola caramelizada", price: 750, category: "hamburgueres" },
      { id: "h3", name: "Fortaleza Burger", description: "Dupla carne 360g, duplo queijo, bacon, ovo, cogumelos", price: 950, category: "hamburgueres" },
      { id: "h4", name: "Chicken Burger", description: "Peito de frango grelhado, queijo suíço, abacate e maionese de ervas", price: 620, category: "hamburgueres" },
      { id: "h5", name: "Veggie Burger", description: "Hambúrguer de legumes, queijo halloumi, rúcula e hummus", price: 580, category: "hamburgueres", isVegetarian: true },
    ]
  },
  {
    id: "petiscos",
    name: "Petiscos",
    icon: "🍟",
    items: [
      { id: "p1", name: "Batatas Fritas", description: "Porção generosa com sal e ervas", price: 280, category: "petiscos" },
      { id: "p2", name: "Onion Rings", description: "Anéis de cebola empanados e crocantes", price: 320, category: "petiscos" },
      { id: "p3", name: "Chicken Wings", description: "Asinhas de frango com molho à escolha", price: 490, category: "petiscos" },
      { id: "p4", name: "Nachos Completos", description: "Com guacamole, sour cream, jalapeños e queijo derretido", price: 520, category: "petiscos" },
      { id: "p5", name: "Calamares Fritos", description: "Lulas empanadas com molho tártaro", price: 580, category: "petiscos", isSeafood: true },
      { id: "p6", name: "Tábua de Queijos", description: "Seleção de queijos artesanais com mel e nozes", price: 720, category: "petiscos" },
    ]
  },
  {
    id: "sopas",
    name: "Sopas",
    icon: "🍲",
    items: [
      { id: "s1", name: "Sopa de Tomate", description: "Com croutons e manjericão fresco", price: 350, category: "sopas", isVegetarian: true },
      { id: "s2", name: "Caldo Verde", description: "Tradicional portuguesa com chouriço", price: 380, category: "sopas" },
      { id: "s3", name: "Sopa de Marisco", description: "Rica sopa com camarão, mexilhões e peixe", price: 650, category: "sopas", isSeafood: true },
      { id: "s4", name: "Creme de Legumes", description: "Mistura de legumes da época", price: 320, category: "sopas", isVegetarian: true },
    ]
  },
  {
    id: "pratos-principais",
    name: "Pratos Principais",
    icon: "🍽️",
    items: [
      { id: "pp1", name: "Picanha Grelhada", description: "400g com arroz, feijão tropeiro e farofa", price: 1450, category: "pratos-principais" },
      { id: "pp2", name: "Frango à Cafreal", description: "Meio frango marinado com especiarias moçambicanas", price: 890, category: "pratos-principais" },
      { id: "pp3", name: "Camarão à Moçambicana", description: "Camarões gigantes com molho de coco e piri-piri", price: 1650, category: "pratos-principais", isSeafood: true },
      { id: "pp4", name: "Costelas de Porco BBQ", description: "Costelas lentas com molho barbecue caseiro", price: 980, category: "pratos-principais" },
      { id: "pp5", name: "Peixe do Dia Grelhado", description: "Com legumes salteados e arroz de ervas", price: 1250, category: "pratos-principais", isSeafood: true },
      { id: "pp6", name: "Bife à Portuguesa", description: "Bife com ovo, presunto e batatas fritas", price: 1180, category: "pratos-principais" },
      { id: "pp7", name: "Espetada Mista", description: "Carne, frango e camarão grelhados", price: 1350, category: "pratos-principais", isSeafood: true },
    ]
  },
  {
    id: "tabuas",
    name: "Tábuas",
    icon: "🥩",
    items: [
      { id: "t1", name: "Tábua de Carnes (2 pessoas)", description: "Picanha, frango, linguiça, costela e acompanhamentos", price: 2400, category: "tabuas" },
      { id: "t2", name: "Tábua de Carnes (4 pessoas)", description: "Variedade completa de carnes grelhadas", price: 4200, category: "tabuas" },
      { id: "t3", name: "Tábua de Carnes (6 pessoas)", description: "Experiência completa para grupos", price: 5800, category: "tabuas" },
      { id: "t4", name: "Tábua de Mariscos (2 pessoas)", description: "Camarão, lagosta, caranguejo e mexilhões", price: 3200, category: "tabuas", isSeafood: true },
      { id: "t5", name: "Tábua de Mariscos (4 pessoas)", description: "Festim de frutos do mar", price: 5800, category: "tabuas", isSeafood: true },
      { id: "t6", name: "Tábua de Mariscos (6 pessoas)", description: "A experiência definitiva de mariscos", price: 8200, category: "tabuas", isSeafood: true },
    ]
  },
  {
    id: "pizzas",
    name: "Pizzas",
    icon: "🍕",
    items: [
      { id: "pz1", name: "Margherita", description: "Molho de tomate, mozzarella e manjericão fresco", price: 580, category: "pizzas", isVegetarian: true },
      { id: "pz2", name: "Pepperoni", description: "Molho de tomate, mozzarella e pepperoni", price: 680, category: "pizzas" },
      { id: "pz3", name: "Quatro Queijos", description: "Mozzarella, gorgonzola, parmesão e provolone", price: 720, category: "pizzas", isVegetarian: true },
      { id: "pz4", name: "Frango com Catupiry", description: "Frango desfiado, catupiry e milho", price: 690, category: "pizzas" },
      { id: "pz5", name: "Portuguesa", description: "Presunto, ovo, cebola, azeitonas e pimentos", price: 720, category: "pizzas" },
      { id: "pz6", name: "Camarão", description: "Camarões, alho, mozzarella e rúcula", price: 890, category: "pizzas", isSeafood: true },
      { id: "pz7", name: "Vegetariana", description: "Legumes grelhados, azeitonas e queijo feta", price: 620, category: "pizzas", isVegetarian: true },
    ]
  },
  {
    id: "massas",
    name: "Massas",
    icon: "🍝",
    items: [
      { id: "m1", name: "Spaghetti Carbonara", description: "Com bacon, ovo, parmesão e pimenta preta", price: 620, category: "massas" },
      { id: "m2", name: "Fettuccine Alfredo", description: "Massa fresca com molho cremoso de queijo", price: 580, category: "massas", isVegetarian: true },
      { id: "m3", name: "Lasanha Bolonhesa", description: "Camadas de massa, carne e molho béchamel", price: 680, category: "massas" },
      { id: "m4", name: "Penne ao Pesto", description: "Com pesto de manjericão caseiro e parmesão", price: 550, category: "massas", isVegetarian: true },
      { id: "m5", name: "Spaghetti com Frutos do Mar", description: "Camarão, mexilhões, lulas em molho de tomate", price: 890, category: "massas", isSeafood: true },
      { id: "m6", name: "Ravioli de Espinafre", description: "Recheado com ricota, molho de tomate fresco", price: 620, category: "massas", isVegetarian: true },
    ]
  },
  {
    id: "wraps",
    name: "Wraps",
    icon: "🌯",
    items: [
      { id: "w1", name: "Wrap de Frango Grelhado", description: "Frango, alface, tomate, queijo e maionese", price: 480, category: "wraps" },
      { id: "w2", name: "Wrap Vegetariano", description: "Legumes grelhados, hummus e queijo feta", price: 420, category: "wraps", isVegetarian: true },
      { id: "w3", name: "Wrap de Carne", description: "Tiras de carne, cebola caramelizada e molho chimichurri", price: 520, category: "wraps" },
      { id: "w4", name: "Wrap Caesar", description: "Frango crocante, alface romana e molho caesar", price: 490, category: "wraps" },
    ]
  },
  {
    id: "sobremesas",
    name: "Sobremesas",
    icon: "🍰",
    items: [
      { id: "sb1", name: "Cheesecake", description: "Com calda de frutas vermelhas", price: 380, category: "sobremesas" },
      { id: "sb2", name: "Brownie com Gelado", description: "Brownie quente com gelado de baunilha", price: 420, category: "sobremesas" },
      { id: "sb3", name: "Pudim de Leite", description: "Tradicional português com caramelo", price: 320, category: "sobremesas" },
      { id: "sb4", name: "Mousse de Chocolate", description: "Intenso chocolate belga", price: 350, category: "sobremesas" },
      { id: "sb5", name: "Tiramisu", description: "Clássico italiano com café e mascarpone", price: 420, category: "sobremesas" },
      { id: "sb6", name: "Gelado (3 bolas)", description: "Sabores à escolha", price: 280, category: "sobremesas" },
    ]
  },
  {
    id: "menu-infantil",
    name: "Menu Infantil",
    icon: "👶",
    items: [
      { id: "mi1", name: "Mini Hambúrguer", description: "Com batatas fritas e sumo", price: 380, category: "menu-infantil", isKidsFriendly: true },
      { id: "mi2", name: "Nuggets de Frango", description: "6 unidades com batatas e molho", price: 350, category: "menu-infantil", isKidsFriendly: true },
      { id: "mi3", name: "Mini Pizza Margherita", description: "Tamanho perfeito para os pequenos", price: 320, category: "menu-infantil", isKidsFriendly: true },
      { id: "mi4", name: "Spaghetti com Molho", description: "Molho de tomate ou bolonhesa", price: 340, category: "menu-infantil", isKidsFriendly: true },
      { id: "mi5", name: "Frango Grelhado com Arroz", description: "Opção saudável para crianças", price: 360, category: "menu-infantil", isKidsFriendly: true },
    ]
  },
  {
    id: "bebidas",
    name: "Bebidas",
    icon: "🥤",
    items: [
      { id: "b1", name: "Água Mineral", description: "500ml", price: 80, category: "bebidas", subcategory: "Águas" },
      { id: "b2", name: "Água com Gás", description: "500ml", price: 90, category: "bebidas", subcategory: "Águas" },
      { id: "b3", name: "Refrigerante", description: "Coca-Cola, Fanta, Sprite", price: 120, category: "bebidas", subcategory: "Refrigerantes" },
      { id: "b4", name: "Sumo Natural", description: "Laranja, Maracujá, Manga", price: 180, category: "bebidas", subcategory: "Sumos" },
      { id: "b5", name: "Limonada Fresca", description: "Com hortelã", price: 150, category: "bebidas", subcategory: "Sumos" },
      { id: "b6", name: "Café Expresso", description: "Intenso e aromático", price: 80, category: "bebidas", subcategory: "Bebidas Quentes" },
      { id: "b7", name: "Cappuccino", description: "Com espuma de leite", price: 150, category: "bebidas", subcategory: "Bebidas Quentes" },
      { id: "b8", name: "Chá", description: "Variedades disponíveis", price: 100, category: "bebidas", subcategory: "Bebidas Quentes" },
      { id: "b9", name: "Cerveja Nacional", description: "2M, Laurentina, Manica", price: 120, category: "bebidas", subcategory: "Cervejas" },
      { id: "b10", name: "Cerveja Importada", description: "Heineken, Corona, Stella", price: 180, category: "bebidas", subcategory: "Cervejas" },
    ]
  },
  {
    id: "vinhos-cocktails",
    name: "Vinhos & Cocktails",
    icon: "🍷",
    items: [
      { id: "vc1", name: "Vinho da Casa Tinto", description: "Copo / Garrafa", price: "180 / 850", category: "vinhos-cocktails", subcategory: "Vinhos" },
      { id: "vc2", name: "Vinho da Casa Branco", description: "Copo / Garrafa", price: "180 / 850", category: "vinhos-cocktails", subcategory: "Vinhos" },
      { id: "vc3", name: "Vinho da Casa Rosé", description: "Copo / Garrafa", price: "180 / 850", category: "vinhos-cocktails", subcategory: "Vinhos" },
      { id: "vc4", name: "Caipirinha", description: "Limão, açúcar e cachaça", price: 320, category: "vinhos-cocktails", subcategory: "Cocktails" },
      { id: "vc5", name: "Mojito", description: "Rum, hortelã, lima e soda", price: 350, category: "vinhos-cocktails", subcategory: "Cocktails" },
      { id: "vc6", name: "Piña Colada", description: "Rum, coco e ananás", price: 380, category: "vinhos-cocktails", subcategory: "Cocktails" },
      { id: "vc7", name: "Margarita", description: "Tequila, triple sec e lima", price: 350, category: "vinhos-cocktails", subcategory: "Cocktails" },
      { id: "vc8", name: "Gin Tónico", description: "Gin premium com tónica e botanicals", price: 320, category: "vinhos-cocktails", subcategory: "Cocktails" },
      { id: "vc9", name: "Whisky", description: "Johnnie Walker, Jack Daniel's", price: 280, category: "vinhos-cocktails", subcategory: "Spirits" },
      { id: "vc10", name: "Vodka", description: "Absolut, Smirnoff", price: 220, category: "vinhos-cocktails", subcategory: "Spirits" },
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
