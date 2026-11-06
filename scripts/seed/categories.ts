const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=900&q=75&auto=format&fit=crop`

export const CATEGORIES = [
  {
    slug: 'fish',
    icon: 'fish',
    name: { bn: 'মাছ', en: 'Fish' },
    description: {
      bn: 'নদী, পুকুর ও সমুদ্রের মাছ — রুই, কাতলা, ইলিশ থেকে চিংড়ি পর্যন্ত। তাজা মাছ চেনার উপায় ও মাসিক বাজারদর।',
      en: 'River, pond and sea fish — from rui, katla and hilsa to prawns. How to spot fresh fish, plus monthly prices.',
    },
    image: U('1498654200943-1088dd4438ae'),
  },
  {
    slug: 'chicken',
    icon: 'chicken',
    name: { bn: 'মুরগি', en: 'Chicken' },
    description: {
      bn: 'ব্রয়লার, সোনালি, দেশি ও লেয়ার মুরগি — কোনটি কেমন, কীভাবে সুস্থ মুরগি বাছবেন।',
      en: 'Broiler, sonali, deshi and layer chicken — how they differ and how to choose a healthy bird.',
    },
    image: U('1604503468506-a8da13d82791'),
  },
  {
    slug: 'beef',
    icon: 'beef',
    name: { bn: 'গরুর মাংস', en: 'Beef' },
    description: {
      bn: 'হাড়সহ ও হাড়ছাড়া গরুর মাংস — রং, গন্ধ, চর্বি ও কাটার ধরন দেখে ভালো মাংস চেনার উপায়।',
      en: 'Bone-in and boneless beef — judging good meat by colour, smell, fat and cut.',
    },
    image: U('1603048297172-c92544798d5a'),
  },
  {
    slug: 'mutton',
    icon: 'mutton',
    name: { bn: 'খাসির মাংস', en: 'Goat & Mutton' },
    description: {
      bn: 'খাসি ও ভেড়ার মাংস — পার্থক্য চেনা এবং কেনার সময় যা খেয়াল রাখবেন।',
      en: 'Goat and sheep meat — telling them apart and what to check when buying.',
    },
    image: U('1602470520998-f4a52199a3d6'),
  },
  {
    slug: 'vegetables',
    icon: 'vegetable',
    name: { bn: 'সবজি', en: 'Vegetables' },
    description: {
      bn: 'আলু, টমেটো, বেগুন, ফুলকপিসহ প্রতিদিনের সবজি — তাজা সবজি বাছাইয়ের নিয়ম ও মৌসুমি দাম।',
      en: 'Everyday vegetables like potato, tomato, brinjal and cauliflower — picking fresh produce and seasonal prices.',
    },
    image: U('1597362925123-77861d3fbac7'),
  },
  {
    slug: 'leafy-greens',
    icon: 'leafy',
    name: { bn: 'শাক', en: 'Leafy greens' },
    description: {
      bn: 'লালশাক, পালংশাক, পুঁইশাক, কলমিশাক — পাতা ও ডাঁটা দেখে তাজা শাক চেনার উপায়।',
      en: 'Red amaranth, spinach, Malabar spinach, water spinach — reading leaves and stems for freshness.',
    },
    image: U('1576045057995-568f588f82fb'),
  },
  {
    slug: 'fruits',
    icon: 'fruit',
    name: { bn: 'ফলমূল', en: 'Fruits' },
    description: {
      bn: 'কলা, আম, আনারস, তরমুজসহ দেশি-বিদেশি ফল — পাকা ও ভালো ফল চেনার সহজ কৌশল।',
      en: 'Local and imported fruit — banana, mango, pineapple, watermelon — simple ways to pick ripe, good fruit.',
    },
    image: U('1610832958506-aa56368176cf'),
  },
  {
    slug: 'spices',
    icon: 'spice',
    name: { bn: 'মসলা', en: 'Spices' },
    description: {
      bn: 'পেঁয়াজ, রসুন, আদা, মরিচ, হলুদ — রান্নার অপরিহার্য মসলা চেনা ও মান যাচাই।',
      en: 'Onion, garlic, ginger, chilli, turmeric — identifying and checking the quality of kitchen essentials.',
    },
    image: U('1596040033229-a9821ebd058d'),
  },
  {
    slug: 'pulses-grains',
    icon: 'grain',
    name: { bn: 'ডাল ও শস্য', en: 'Pulses & grains' },
    description: {
      bn: 'চাল, মসুর ডাল, মুগ ডাল, ছোলা — দানা দেখে মান বোঝা ও সংরক্ষণের পরামর্শ।',
      en: 'Rice, red lentils, mung beans, chickpeas — judging grain quality and storing it well.',
    },
    image: U('1515543904379-3d757afe72e4'),
  },
  {
    slug: 'others',
    icon: 'other',
    name: { bn: 'অন্যান্য', en: 'Others' },
    description: {
      bn: 'ডিমসহ অন্যান্য নিত্যপ্রয়োজনীয় পণ্য।',
      en: 'Eggs and other everyday essentials.',
    },
    image: U('1587486913049-53fc88980cfc'),
  },
] as const
