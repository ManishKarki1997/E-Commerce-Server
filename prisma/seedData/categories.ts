const categories = [
  {
    name: "Electronic Devices",
    description: "Electronic Devices",
    iconName: "playstation",
    imageUrl:
      "https://images.unsplash.com/photo-1593305841991-05c297ba4575?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=1080",
    subCategories: [
      {
        name: "Smartphones",
        description: "Budget, Gaming and General purpose smartphones",
        iconName: "playstation",
        imageUrl:
          "https://images.unsplash.com/photo-1556656793-08538906a9f8?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=1080",
      },
      {
        name: "Consoles",
        description: "Budget, Gaming and General purpose smartphones",
        iconName: "playstation",
        imageUrl:
          "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=1080",
      },
      {
        name: "Laptops",
        description: "Budget, Gaming and General purpose smartphones",
        iconName: "playstation",
        imageUrl:
          "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=1080",
      },
    ],
  },
  {
    name: "Electronic Accessories",
    description: "Electronic Accessories",
    iconName: "playstation",
    imageUrl:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=1080",
    subCategories: [
      {
        name: "Headphones",
        description: "Gaming and general purpose headphones",
        iconName: "headphone",
        categoryName: "Electronic Accessories",
        imageUrl:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=1080",
      },
      {
        name: "Keyboard and Mouse",
        description: "Wired and Wireless Keyboard and Mouse",
        categoryName: "Electronic Accessories",
        iconName: "mouse",
        categoryId: 2,
        imageUrl:
          "https://images.unsplash.com/photo-1602726428221-9af5b227ed5d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=1080",
      },
      {
        name: "Speakers",
        description: "Loud speakers and woofers.",
        categoryName: "Electronic Accessories",
        iconName: "headphone",
        imageUrl:
          "https://images.unsplash.com/photo-1545454675-3531b543be5d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=1080",
      },
    ],
  },
  {
    name: "TV & Home Appliances",
    description: "TV & Home Appliances",
    iconName: "playstation",
    imageUrl:
      "https://images.unsplash.com/photo-1586024486164-ce9b3d87e09f?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTR8fHRlbGV2aXNpb258ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=1090",
    subCategories: [
      {
        name: "Televisions",
        description: "LCD and LED smart televisions",
        categoryName: "TV & Home Appliances",
        iconName: "tv",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1577979749830-f1d742b96791?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=1080",
      },
      {
        name: "Washing Machine",
        description: "Washing machines for all sizes",
        categoryName: "TV & Home Appliances",
        iconName: "tv",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=1080",
      },
      {
        name: "Refrigerator",
        description: "Refrigerators of all kind, smart and normal.",
        categoryName: "TV & Home Appliances",
        iconName: "tv",
        categoryId: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1557688664-4f5d04cd34ad?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=1080",
      },
    ],
  },
  {
    name: "Health & Beauty",
    description: "Health & Beauty",
    iconName: "playstation",
    imageUrl:
      "https://images.unsplash.com/photo-1526947425960-945c6e72858f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=1080",
    subCategories: [
      {
        name: "Lotions",
        description: "Body lotions for all purposes",
        categoryName: "Health & Beauty",
        iconName: "tv",
        categoryId: 5,
        imageUrl:
          "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=1080",
      },
      {
        name: "Oil",
        description: "Branded hair oils",
        categoryName: "Health & Beauty",
        iconName: "tv",
        categoryId: 5,
        imageUrl:
          "https://images.unsplash.com/photo-1574785289548-b6604d39125d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=1080",
      },
      {
        name: "Treadmill",
        description: "Treadmill",
        categoryName: "Health & Beauty",
        iconName: "tv",
        categoryId: 5,
        imageUrl:
          "https://images.unsplash.com/photo-1596357395104-ba989e72b5ec?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=1080",
      },
      {
        name: "Gym Equipments",
        description: "Gym equipments of all kinds",
        categoryName: "Health & Beauty",
        iconName: "tv",
        categoryId: 5,
        imageUrl:
          "https://images.unsplash.com/photo-1540496905036-5937c10647cc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=1080",
      },
    ],
  },
  {
    name: "Women's Fashion",
    description: "Women's Fashion",
    iconName: "playstation",
    imageUrl:
      "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=1080",
    subCategories: [
      {
        name: "Skirts",
        description: "Skirts",
        categoryName: "Women's Fashion",
        iconName: "tv",
        categoryId: 6,
        imageUrl:
          "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=1080",
      },
      {
        name: "One Piece",
        description: "Ladies one piece dresses",
        categoryName: "Women's Fashion",
        iconName: "tv",
        categoryId: 6,
        imageUrl:
          "https://images.unsplash.com/photo-1529170813899-823c551d2a74?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=1080",
      },
      {
        name: "Watches",
        description: "Watches for women",
        categoryName: "Women's Fashion",
        iconName: "tv",
        categoryId: 6,
        imageUrl:
          "https://images.unsplash.com/photo-1490915785914-0af2806c22b6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&q=1080",
      },
    ],
  },
  {
    name: "Men's Fashion",
    description: "Men's Fashion",
    iconName: "playstation",
    imageUrl:
      "https://images.pexels.com/photos/450212/pexels-photo-450212.jpeg?auto=compress",
    subCategories: [
      {
        name: "Smart Watches",
        description: "Smart Watches for men",
        categoryName: "Men's Fashion",
        iconName: "tv",
        categoryId: 7,
        imageUrl:
          "https://images.unsplash.com/photo-1597923709001-5a061c88418d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=1080",
      },
      {
        name: "Pants",
        description: "Latest pants for men",
        categoryName: "Men's Fashion",
        iconName: "tv",
        categoryId: 7,
        imageUrl:
          "https://images.unsplash.com/photo-1604176354204-9268737828e4?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=1080",
      },
      {
        name: "Jackets",
        description: "Jackets for men",
        categoryName: "Men's Fashion",
        iconName: "tv",
        categoryId: 7,
        imageUrl:
          "https://images.unsplash.com/photo-1587821100455-3c4313578ccb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2004&q=1080",
      },
    ],
  },
];

export default categories;
