import type { Pair } from './checklists'

const U = (id: string) => `https://images.unsplash.com/photo-${id}?w=1000&q=75&auto=format&fit=crop`

export type SeedProduct = {
  slug: string
  category: string
  checklist: string
  name: [string, string]
  alt?: { bn: string[]; en: string[] }
  short: Pair
  desc: Pair
  ident: Pair
  good?: Pair[]
  warn?: Pair[]
  tips: Pair[]
  season: Pair
  months?: number[]
  variety?: Pair
  unit: 'kg' | 'piece' | 'hali' | 'dozen' | 'bundle'
  image?: string
  featured?: boolean
  popular?: boolean
  /** Demo price range for November 2026; null = no observations yet. */
  price: [number, number] | null
  profile?: 'fish' | 'meat' | 'veg' | 'stable' | 'onion'
  /** Month indexes (0 = Dec 2025 … 11 = Nov 2026) with no observation. */
  gaps?: number[]
  /** Only observe these months (1–12), e.g. for seasonal fruit. */
  onlyMonths?: number[]
  /** Latest month index to observe (for "older observation" examples). */
  lastIndex?: number
  /** Current month kept as DRAFT (not publicly visible). */
  draftLatest?: boolean
}

export const PRODUCTS: SeedProduct[] = [
  // ---------------- Fish ----------------
  {
    slug: 'rui-fish',
    category: 'fish',
    checklist: 'fish',
    name: ['রুই মাছ', 'Rui fish'],
    alt: { bn: ['রুই', 'রোহু'], en: ['Rohu', 'Rohu carp', 'Rui'] },
    short: [
      'বাঙালির সবচেয়ে প্রিয় কার্প জাতীয় মাছ — ঝোল, ভাজি, কালিয়া সবকিছুতেই চলে।',
      "Bengal's favourite carp — perfect for curry, frying and kalia.",
    ],
    desc: [
      'রুই মিঠা পানির কার্প জাতীয় মাছ। নদী, বিল ও পুকুরে চাষ হয়। মাঝারি আকারের (১.৫–৩ কেজি) রুইয়ের স্বাদ ও কাঁটার অনুপাত সবচেয়ে ভালো।',
      'Rui is a freshwater carp raised in rivers, beels and ponds. Medium fish (1.5–3 kg) offer the best balance of flavour and bones.',
    ],
    ident: [
      'শরীর লম্বাটে ও দুই পাশ থেকে সামান্য চাপা। পিঠ ধূসর-কালচে, পেট রুপালি সাদা। প্রতিটি আঁশের মাঝখানে হালকা লালচে আভা থাকে। মুখ ছোট এবং ঠোঁট মোটা ও ঝালরযুক্ত। কাতলার তুলনায় মাথা ছোট — এটিই দুটো চেনার সহজ উপায়।',
      'The body is long and slightly flattened from the sides, grey-black on the back and silvery-white below. Each scale often has a faint reddish centre. The mouth is small with thick, fringed lips. Its head is much smaller than a katla’s — the easiest way to tell them apart.',
    ],
    good: [
      [
        'আঁশের নিচে হালকা লালচে আভা স্পষ্ট দেখা যায়।',
        'A faint reddish tint is visible on the scales.',
      ],
    ],
    tips: [
      [
        'মাঝারি আকারের মাছ নিন — খুব বড় রুইয়ের মাংস শক্ত ও তেলতেলে হতে পারে।',
        'Choose medium-sized fish — very large rui can be coarse and oily.',
      ],
      [
        'কাটার সময় সামনে দাঁড়িয়ে থাকুন এবং মাথা ও পেটের অংশ আলাদা করে নিতে বলুন।',
        'Stay while it is cut and ask for the head and belly pieces separately if you prefer.',
      ],
      [
        'নদীর রুই চাষের রুইয়ের চেয়ে লম্বাটে ও কম চর্বিযুক্ত হয়, দামও বেশি।',
        'River rui is slimmer and leaner than farmed rui, and costs more.',
      ],
    ],
    season: [
      'সারা বছর পাওয়া যায়। শীতের শেষে পুকুর সেচের সময় সরবরাহ বেশি থাকে।',
      'Available year-round. Supply peaks in late winter when ponds are drained.',
    ],
    variety: ['চাষের মাছ', 'Farmed fish'],
    unit: 'kg',
    featured: true,
    popular: true,
    price: [300, 380],
    profile: 'fish',
    gaps: [2],
  },
  {
    slug: 'katla-fish',
    category: 'fish',
    checklist: 'fish',
    name: ['কাতলা মাছ', 'Katla fish'],
    alt: { bn: ['কাতলা'], en: ['Catla', 'Katla'] },
    short: [
      'বড় মাথার কার্প মাছ — মাথা দিয়ে মুড়িঘণ্ট বিখ্যাত।',
      'A big-headed carp — its head is famous for muri ghonto.',
    ],
    desc: [
      'কাতলা দ্রুত বড় হওয়া কার্প মাছ। এর বড় মাথা ও চওড়া শরীরের জন্য সহজে চেনা যায়। মাথা ও পেটির অংশ সবচেয়ে জনপ্রিয়।',
      'Katla is a fast-growing carp, easily recognised by its huge head and deep body. The head and belly pieces are most popular.',
    ],
    ident: [
      'মাথা শরীরের তুলনায় অনেক বড় ও চওড়া, মুখ ওপরের দিকে বাঁকানো এবং নিচের চোয়াল সামনে বাড়ানো। শরীর চওড়া ও উঁচু, পিঠ ধূসর এবং পাশে বড় রুপালি আঁশ। রুইয়ের চেয়ে শরীর বেশি গোলগাল।',
      'The head is very large and broad, the mouth turns upward and the lower jaw juts out. The body is deep and tall, grey above with large silver scales — rounder than rui.',
    ],
    tips: [
      [
        'মুড়িঘণ্টের জন্য বড় মাথা আলাদা করে কিনতে পারেন।',
        'For muri ghonto you can buy a large head on its own.',
      ],
      ['২ কেজির বেশি ওজনের কাতলার পেটি বেশি সুস্বাদু।', 'Katla above 2 kg has the tastiest belly.'],
    ],
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['চাষের মাছ', 'Farmed fish'],
    unit: 'kg',
    popular: true,
    price: [350, 420],
    profile: 'fish',
    gaps: [7],
  },
  {
    slug: 'hilsa',
    category: 'fish',
    checklist: 'fish',
    name: ['ইলিশ মাছ', 'Hilsa'],
    alt: { bn: ['ইলিশ', 'ইলশে'], en: ['Ilish', 'Hilsa shad'] },
    short: [
      'বাংলাদেশের জাতীয় মাছ — পদ্মা-মেঘনার ইলিশের স্বাদ অতুলনীয়।',
      "Bangladesh's national fish — Padma and Meghna hilsa are unmatched in flavour.",
    ],
    desc: [
      'ইলিশ সমুদ্র থেকে নদীতে ডিম পাড়তে আসে। নদীর ইলিশ বেশি চর্বিযুক্ত ও সুস্বাদু। আকার যত বড়, দাম তত বেশি — ১ কেজি বা তার বেশি ওজনের ইলিশ সবচেয়ে দামি।',
      'Hilsa migrate from the sea into rivers to spawn. River hilsa are fattier and tastier. Price rises sharply with size — fish of 1 kg or more are the most expensive.',
    ],
    ident: [
      'শরীর চ্যাপ্টা, চকচকে রুপালি এবং পিঠে হালকা বেগুনি-নীল আভা। পেট ধারালো ও ঢেউখেলানো। নদীর ইলিশ তুলনামূলক চওড়া ও মোটা, পিঠের রং উজ্জ্বল; সাগরের ইলিশ লম্বাটে ও সরু। কানকোর পেছনে একটি কালচে দাগ থাকতে পারে।',
      'The body is flat and bright silver with a faint purple-blue sheen on the back, and a sharp, keeled belly. River hilsa are broader and plumper with a brighter back; sea hilsa are longer and slimmer. There may be a dark spot behind the gill cover.',
    ],
    good: [
      [
        'পেট টিপলে ভরাট ও শক্ত লাগে, গায়ে উজ্জ্বল রুপালি আভা।',
        'The belly feels full and firm, with a brilliant silver shine.',
      ],
    ],
    warn: [
      [
        'চোখ লালচে ও পেট নরম — অনেকদিন বরফে থাকা মাছ হতে পারে।',
        'Reddish eyes and a soft belly — it may have been on ice for a long time.',
      ],
    ],
    tips: [
      [
        'সরকারি নিষেধাজ্ঞার সময় ইলিশ ধরা ও বিক্রি নিষিদ্ধ; এ সময় জাটকা কিনবেন না।',
        'Catching and selling hilsa is banned during government closures; never buy jatka (juvenile hilsa).',
      ],
      [
        'ওজন করার আগে নিজে মাছ বেছে নিন এবং দাম কেজি নাকি পিস হিসেবে তা নিশ্চিত হোন।',
        'Pick the fish yourself before weighing and confirm whether the price is per kg or per piece.',
      ],
    ],
    season: [
      'জুলাই থেকে অক্টোবর ইলিশের ভরা মৌসুম। প্রজনন মৌসুমে নির্দিষ্ট সময় ধরা নিষিদ্ধ থাকে।',
      'Peak season is July to October. Fishing is banned for set periods during breeding.',
    ],
    months: [7, 8, 9, 10],
    variety: ['নদী/সামুদ্রিক মাছ', 'River & sea fish'],
    unit: 'kg',
    featured: true,
    price: [1200, 1600],
    profile: 'fish',
    gaps: [3, 4],
  },
  {
    slug: 'pangas-fish',
    category: 'fish',
    checklist: 'fish',
    name: ['পাঙ্গাস মাছ', 'Pangas fish'],
    alt: { bn: ['পাঙাস'], en: ['Pangasius', 'Basa', 'Pangas'] },
    short: [
      'কম দামে বেশি মাংস — আঁশহীন, কাঁটা কম।',
      'Plenty of meat for little money — scaleless with few bones.',
    ],
    desc: [
      'পাঙ্গাস আঁশবিহীন চাষের মাছ। দাম তুলনামূলক কম এবং কাঁটা কম থাকায় শিশুদের জন্যও সুবিধাজনক।',
      'Pangas is a scaleless farmed catfish. It is affordable and has few bones, which makes it convenient for children.',
    ],
    ident: [
      'শরীর লম্বা, মসৃণ ও আঁশবিহীন। পিঠ ধূসর-কালো, পেট সাদা। মুখের কোণে ছোট গোঁফ থাকে। মাংস সাদা ও নরম।',
      'The body is long, smooth and scaleless, dark grey on top and white underneath, with short barbels at the mouth. The flesh is white and soft.',
    ],
    good: [
      ['চামড়া মসৃণ ও উজ্জ্বল, কোনো লাল ঘা নেই।', 'Skin is smooth and glossy with no red sores.'],
    ],
    tips: [
      [
        'মাটির গন্ধ কমাতে কাটার পর লবণ-লেবু দিয়ে ধুয়ে নিন।',
        'Wash with salt and lemon after cutting to reduce any muddy smell.',
      ],
      ['জীবিত বা সদ্য মরা মাছ বেছে নিন।', 'Prefer live or just-killed fish.'],
    ],
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['চাষের মাছ', 'Farmed fish'],
    unit: 'kg',
    price: [170, 210],
    profile: 'fish',
  },
  {
    slug: 'tilapia-fish',
    category: 'fish',
    checklist: 'fish',
    name: ['তেলাপিয়া মাছ', 'Tilapia'],
    alt: { bn: ['তেলাপিয়া', 'নাইলোটিকা'], en: ['Nile tilapia', 'Tilapia'] },
    short: [
      'সহজলভ্য চাষের মাছ, ভাজি ও দোপেঁয়াজায় দারুণ।',
      'An easy-to-find farmed fish, great fried or as dopeyaja.',
    ],
    desc: [
      'তেলাপিয়া দ্রুত বর্ধনশীল চাষের মাছ। মাঝারি আকারের তেলাপিয়া (৩–৪টিতে কেজি) রান্নার জন্য সবচেয়ে উপযোগী।',
      'Tilapia is a fast-growing farmed fish. Medium fish (3–4 per kg) are the most practical for cooking.',
    ],
    ident: [
      'শরীর চওড়া ও দুই পাশে চাপা। গায়ে ধূসর-কালো বা লালচে খাড়া ডোরা থাকতে পারে। পিঠের পাখনা লম্বা ও কাঁটাযুক্ত।',
      'The body is deep and laterally flattened, sometimes with grey-black or reddish vertical bands. The dorsal fin is long and spiny.',
    ],
    tips: [
      [
        'জীবিত তেলাপিয়া সহজেই পাওয়া যায় — সেটিই নিন।',
        'Live tilapia is widely available — choose that.',
      ],
    ],
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['চাষের মাছ', 'Farmed fish'],
    unit: 'kg',
    price: [200, 240],
    profile: 'fish',
    draftLatest: true,
  },
  {
    slug: 'shing-fish',
    category: 'fish',
    checklist: 'fish',
    name: ['শিং মাছ', 'Shing fish'],
    alt: { bn: ['শিঙি', 'শিং'], en: ['Stinging catfish', 'Singhi'] },
    short: [
      'পুষ্টিকর জিওল মাছ — রোগীর পথ্য হিসেবে জনপ্রিয়।',
      'A nutritious air-breathing fish, popular food for convalescents.',
    ],
    desc: [
      'শিং জীবিত অবস্থায় বিক্রি হয়। দেশি শিং ছোট ও কালচে; চাষের শিং বড় ও হালকা রঙের।',
      'Shing is sold alive. Wild (deshi) shing are small and dark; farmed shing are larger and paler.',
    ],
    ident: [
      'শরীর লম্বা, আঁশবিহীন, গাঢ় বাদামি থেকে কালচে। মুখে চার জোড়া গোঁফ। বুকের পাখনায় বিষাক্ত কাঁটা থাকে — সাবধানে ধরুন।',
      'The body is long, scaleless and dark brown to black, with four pairs of barbels. The pectoral fins carry venomous spines — handle with care.',
    ],
    good: [
      [
        'জীবিত ও চঞ্চল — পাত্রে জোরে নড়াচড়া করছে।',
        'Alive and lively — moving vigorously in the tub.',
      ],
    ],
    tips: [
      [
        'দেশি শিং চিনতে রং ও আকার দেখুন; দাম দ্বিগুণ হতে পারে।',
        'Judge deshi shing by its dark colour and small size — it can cost twice as much.',
      ],
      ['বিক্রেতাকে দিয়ে কাঁটা কেটে নিন।', 'Ask the seller to trim the spines.'],
    ],
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['জিওল মাছ', 'Live fish'],
    unit: 'kg',
    price: [450, 600],
    profile: 'fish',
  },
  {
    slug: 'koi-fish',
    category: 'fish',
    checklist: 'fish',
    name: ['কৈ মাছ', 'Koi fish'],
    alt: { bn: ['কই'], en: ['Climbing perch', 'Koi'] },
    short: [
      'শক্ত আঁশের ছোট জিওল মাছ — কৈ ভাজা ও তেল কৈ বিখ্যাত।',
      'A small, hard-scaled live fish famous for koi bhaja and tel koi.',
    ],
    desc: [
      'কৈ মাছ অনেকক্ষণ পানির বাইরেও বাঁচতে পারে। দেশি কৈ ছোট ও কালচে-সবুজ; থাই কৈ বড় ও হালকা।',
      'Koi can survive out of water for a long time. Deshi koi are small and dark olive; Thai koi are larger and paler.',
    ],
    ident: [
      'শরীর ছোট, শক্ত আঁশে ঢাকা, রং জলপাই-সবুজ থেকে কালচে। কানকোর কিনারায় কাঁটা থাকে। লেজের গোড়ায় একটি কালো দাগ দেখা যায়।',
      'A small body covered in hard scales, olive-green to dark. The gill cover edge is spiny and there is a dark spot at the base of the tail.',
    ],
    tips: [
      [
        'জীবিত কৈ কিনুন এবং দেশি-থাই পার্থক্য জেনে দর করুন।',
        'Buy live koi and know the deshi vs. Thai difference before bargaining.',
      ],
    ],
    season: [
      'সারা বছর, বর্ষায় দেশি কৈ বেশি পাওয়া যায়।',
      'Year-round; deshi koi are more common in the monsoon.',
    ],
    months: [6, 7, 8, 9],
    variety: ['জিওল মাছ', 'Live fish'],
    unit: 'kg',
    price: [260, 320],
    profile: 'fish',
    lastIndex: 10,
  },
  {
    slug: 'golda-chingri',
    category: 'fish',
    checklist: 'fish',
    name: ['গলদা চিংড়ি', 'Golda prawn'],
    alt: { bn: ['গলদা'], en: ['Giant freshwater prawn', 'Lobster prawn'] },
    short: [
      'বড় দাঁড়ার মিঠা পানির চিংড়ি — মালাইকারির জন্য সেরা।',
      'Freshwater prawn with long claws — the best choice for malaikari.',
    ],
    desc: [
      'গলদা চিংড়ি মিঠা পানির বড় চিংড়ি। আকার অনুযায়ী (কেজিতে কয়টি) দাম অনেক বদলায়।',
      'Golda is a large freshwater prawn. Price varies a lot with size (count per kg).',
    ],
    ident: [
      'দ্বিতীয় জোড়া পা লম্বা নীলচে দাঁড়ায় পরিণত। মাথা বড়, খোলস স্বচ্ছ ধূসর-নীল। রান্নার পর উজ্জ্বল কমলা হয়।',
      'The second pair of legs forms long bluish claws. The head is large and the shell translucent grey-blue; it turns bright orange when cooked.',
    ],
    good: [
      [
        'মাথা শরীরের সঙ্গে শক্তভাবে লাগানো ও খোলস চকচকে।',
        'The head is firmly attached and the shell is glossy.',
      ],
    ],
    warn: [
      ['মাথা কালো হয়ে গেছে বা সহজেই খুলে আসছে।', 'The head has turned black or comes off easily.'],
    ],
    tips: [
      [
        'দাম জিজ্ঞেস করার সময় কেজিতে কয়টি চিংড়ি তা জেনে নিন।',
        'When asking the price, find out how many prawns make a kilo.',
      ],
    ],
    season: [
      'সারা বছর; বর্ষার শেষে সরবরাহ বেশি।',
      'Year-round; supply is highest at the end of the monsoon.',
    ],
    variety: ['চিংড়ি', 'Prawn'],
    unit: 'kg',
    image: U('1565680018434-b513d5e5fd47'),
    price: [750, 950],
    profile: 'fish',
  },
  {
    slug: 'pabda-fish',
    category: 'fish',
    checklist: 'fish',
    name: ['পাবদা মাছ', 'Pabda fish'],
    alt: { bn: ['পাবদা'], en: ['Butter catfish', 'Pabda'] },
    short: [
      'নরম মাংস ও কম কাঁটার সুস্বাদু মাছ।',
      'A delicious fish with soft flesh and few bones.',
    ],
    desc: [
      'পাবদা ছোট আকারের আঁশবিহীন মাছ। সরষে পাবদা ও পাবদার ঝোল খুব জনপ্রিয়।',
      'Pabda is a small scaleless catfish, loved in mustard curry and light jhol.',
    ],
    ident: [
      'শরীর চ্যাপ্টা, রুপালি-গোলাপি আভাযুক্ত, আঁশবিহীন। কানকোর ঠিক পেছনে একটি কালো দাগ থাকে। পিঠের পাখনা খুব ছোট।',
      'A flat, scaleless body with a silvery-pink sheen and a dark spot just behind the gill. The dorsal fin is tiny.',
    ],
    tips: [
      [
        'চাপ দিয়ে দেখুন — পাবদার মাংস নরম হলেও তাজা মাছ টানটান থাকে।',
        'Press gently — pabda flesh is soft, but fresh fish still feels taut.',
      ],
    ],
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['দেশি মাছ', 'Native fish'],
    unit: 'kg',
    price: null,
  },

  // ---------------- Chicken ----------------
  {
    slug: 'broiler-chicken',
    category: 'chicken',
    checklist: 'poultry',
    name: ['ব্রয়লার মুরগি', 'Broiler chicken'],
    alt: { bn: ['ব্রয়লার', 'ফার্মের মুরগি'], en: ['Broiler', 'Farm chicken'] },
    short: [
      'সবচেয়ে সাশ্রয়ী মুরগি — নরম মাংস, দ্রুত রান্না হয়।',
      'The most affordable chicken — tender meat that cooks quickly.',
    ],
    desc: [
      'ব্রয়লার মাংসের জন্য খামারে পালন করা মুরগি। সাধারণত জীবিত অবস্থায় ওজন করে বিক্রি হয়, তারপর জবাই ও পরিষ্কার করা হয়।',
      'Broilers are farm-raised for meat. They are usually weighed live, then slaughtered and dressed at the shop.',
    ],
    ident: [
      'পালক সাদা, শরীর ভারী ও মাংসল, পা মোটা ও হলুদাভ। মাংস নরম ও ফ্যাকাশে গোলাপি। সাধারণত ১.২–২ কেজি ওজনের হয়।',
      'White feathers, a heavy fleshy body and thick yellowish legs. The meat is soft and pale pink. Usually 1.2–2 kg live weight.',
    ],
    tips: [
      [
        'জীবিত ওজন আর কাটার পর ওজন আলাদা — দাম কোনটির ভিত্তিতে তা নিশ্চিত হোন।',
        'Live weight and dressed weight differ — confirm which one the price is based on.',
      ],
      [
        'জবাইয়ের সময় সামনে থাকুন এবং চামড়া রাখবেন কি না বলে দিন।',
        'Watch the slaughter and say whether you want the skin kept.',
      ],
    ],
    season: [
      'সারা বছর পাওয়া যায়; উৎসবের আগে দাম বাড়ে।',
      'Available year-round; prices rise before festivals.',
    ],
    variety: ['খামারের মুরগি', 'Farm chicken'],
    unit: 'kg',
    image: U('1604503468506-a8da13d82791'),
    featured: true,
    popular: true,
    price: [180, 210],
    profile: 'meat',
  },
  {
    slug: 'sonali-chicken',
    category: 'chicken',
    checklist: 'poultry',
    name: ['সোনালি মুরগি', 'Sonali chicken'],
    alt: { bn: ['সোনালী', 'পাকিস্তানি মুরগি'], en: ['Sonali', 'Cross-breed chicken'] },
    short: [
      'দেশি মুরগির কাছাকাছি স্বাদ, দাম তুলনামূলক কম।',
      'Close to deshi chicken in taste, at a lower price.',
    ],
    desc: [
      'সোনালি একটি সংকর জাতের মুরগি। মাংস ব্রয়লারের চেয়ে শক্ত ও স্বাদে দেশি মুরগির কাছাকাছি।',
      'Sonali is a cross-breed. Its meat is firmer than broiler and tastes closer to deshi chicken.',
    ],
    ident: [
      'পালক সোনালি-বাদামি বা লালচে, শরীর ব্রয়লারের চেয়ে হালকা ও লম্বাটে। পা সরু, ঝুঁটি ছোট ও লাল।',
      'Golden-brown or reddish feathers, a leaner and longer body than a broiler, slim legs and a small red comb.',
    ],
    tips: [
      [
        'দেশি মুরগি বলে সোনালি বিক্রি হয় কি না খেয়াল করুন — পা ও ওজন দেখে বুঝুন।',
        'Watch that sonali is not sold as deshi — check the legs and weight.',
      ],
    ],
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['খামারের মুরগি', 'Farm chicken'],
    unit: 'kg',
    price: [290, 330],
    profile: 'meat',
  },
  {
    slug: 'deshi-chicken',
    category: 'chicken',
    checklist: 'poultry',
    name: ['দেশি মুরগি', 'Deshi chicken'],
    alt: { bn: ['দেশী মুরগি', 'গ্রামের মুরগি'], en: ['Native chicken', 'Village chicken'] },
    short: [
      'গ্রামে খোলা পরিবেশে বড় হওয়া মুরগি — স্বাদ ও দাম দুটোই বেশি।',
      'Free-range village chicken — more flavour and a higher price.',
    ],
    desc: [
      'দেশি মুরগি ছোট আকারের হলেও মাংস শক্ত ও সুস্বাদু। রান্না হতে বেশি সময় লাগে।',
      'Deshi chickens are small, but the meat is firm and flavourful and takes longer to cook.',
    ],
    ident: [
      'আকারে ছোট (৮০০ গ্রাম–১.৫ কেজি), পালক বিভিন্ন রঙের মিশ্রণ। পা সরু ও লম্বা, নখ ধারালো। শরীরে চর্বি খুব কম।',
      'Small (800 g–1.5 kg) with mixed-colour feathers, long slim legs and sharp claws. There is very little fat.',
    ],
    tips: [
      [
        'ছোট ও সরু পায়ের মুরগি দেশি হওয়ার সম্ভাবনা বেশি; ভারী ও মোটা পায়ের হলে সন্দেহ করুন।',
        'Small birds with slim legs are likely deshi; be suspicious of heavy, thick-legged birds.',
      ],
    ],
    season: ['সারা বছর পাওয়া যায়, শীতে চাহিদা বেশি।', 'Year-round; demand is higher in winter.'],
    variety: ['দেশি মুরগি', 'Native chicken'],
    unit: 'kg',
    price: [550, 650],
    profile: 'meat',
  },
  {
    slug: 'layer-chicken',
    category: 'chicken',
    checklist: 'poultry',
    name: ['লেয়ার মুরগি', 'Layer chicken'],
    alt: { bn: ['লাল মুরগি', 'কক মুরগি'], en: ['Spent hen', 'Layer hen'] },
    short: [
      'ডিম পাড়া শেষ হওয়া খামারের মুরগি — মাংস শক্ত, ঝোলে ভালো।',
      'Retired laying hens — firm meat that suits curries.',
    ],
    desc: [
      'লেয়ার মুরগি ডিম উৎপাদনের পর মাংসের জন্য বিক্রি হয়। মাংস শক্ত, তাই প্রেশার কুকারে রান্না সুবিধাজনক।',
      'Layers are sold for meat after their egg-laying life. The meat is tough, so a pressure cooker helps.',
    ],
    ident: [
      'পালক লালচে-বাদামি, শরীর হালকা, ঝুঁটি বড় ও লাল। চামড়া হলুদাভ এবং পেটে চর্বি থাকতে পারে।',
      'Reddish-brown feathers, a light body and a large red comb. The skin is yellowish and there may be belly fat.',
    ],
    tips: [['দীর্ঘ সময় রান্নার জন্য প্রস্তুত থাকুন।', 'Plan for a longer cooking time.']],
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['খামারের মুরগি', 'Farm chicken'],
    unit: 'kg',
    price: [270, 310],
    profile: 'meat',
  },

  // ---------------- Beef ----------------
  {
    slug: 'beef',
    category: 'beef',
    checklist: 'meat',
    name: ['গরুর মাংস (হাড়সহ)', 'Beef (bone-in)'],
    alt: { bn: ['গরুর মাংস', 'গোশত'], en: ['Beef', 'Cow meat'] },
    short: [
      'হাড়, চর্বি ও মাংস মিলিয়ে বিক্রি হয় — ভুনা ও কালাভুনার জন্য আদর্শ।',
      'Sold as a mix of bone, fat and meat — ideal for bhuna and kala bhuna.',
    ],
    desc: [
      'বাজারে সাধারণত হাড়-চর্বি মিশিয়ে গরুর মাংস বিক্রি হয়। কোন অংশ থেকে কাটা হচ্ছে (রান, সিনা, কাঁধ) তা দাম ও স্বাদকে প্রভাবিত করে।',
      'Beef is usually sold mixed with bone and fat. The cut — leg, brisket or shoulder — affects price and flavour.',
    ],
    ident: [
      'রং উজ্জ্বল লাল থেকে চেরি-লাল, চর্বি সাদা বা হালকা হলুদ। মাংসের আঁশ মোটা হলেও ঘন। কচি গরুর মাংস হালকা লাল ও নরম; বয়স্ক গরুর মাংস গাঢ় লাল ও শক্ত।',
      'Bright to cherry red with white or pale-yellow fat and a coarse but dense grain. Young cattle give lighter, tender meat; older animals give darker, tougher meat.',
    ],
    tips: [
      [
        'কেনার আগে হাড় ও চর্বির পরিমাণ নিয়ে কথা বলে নিন।',
        'Agree on how much bone and fat you will accept before buying.',
      ],
      [
        'ঝুলিয়ে রাখা মাংস থেকে নিজে অংশ দেখিয়ে কাটিয়ে নিন।',
        'Point to the piece you want from the hanging carcass and have it cut in front of you.',
      ],
      ['ওজনের সময় পাল্লা শূন্যে আছে কি না দেখুন।', 'Check the scale reads zero before weighing.'],
    ],
    season: [
      'সারা বছর; ঈদুল আজহা ও রমজানে দাম বাড়ার প্রবণতা থাকে।',
      'Year-round; prices tend to rise around Eid-ul-Adha and Ramadan.',
    ],
    variety: ['হাড়সহ', 'Bone-in'],
    unit: 'kg',
    image: U('1603048297172-c92544798d5a'),
    featured: true,
    popular: true,
    price: [750, 800],
    profile: 'meat',
  },
  {
    slug: 'boneless-beef',
    category: 'beef',
    checklist: 'meat',
    name: ['হাড়ছাড়া গরুর মাংস', 'Boneless beef'],
    alt: { bn: ['বোনলেস', 'খাঁটি মাংস'], en: ['Boneless', 'Beef fillet cuts'] },
    short: [
      'হাড় ও চর্বি ছাড়া খাঁটি মাংস — কাবাব, স্টেক ও কিমার জন্য।',
      'Pure meat without bone or fat — for kebabs, steaks and mince.',
    ],
    desc: [
      'হাড়ছাড়া মাংস রান বা পিঠের অংশ থেকে কাটা হয়। দাম বেশি হলেও অপচয় কম।',
      'Boneless meat is cut from the leg or back. It costs more but there is little waste.',
    ],
    ident: [
      'সমান রঙের ঘন লাল মাংস, চারপাশে সামান্য চর্বির স্তর থাকতে পারে। শিরা ও পর্দা কম।',
      'Evenly red, dense meat, perhaps with a thin layer of fat around it and few sinews.',
    ],
    tips: [
      [
        'কিমা কিনলে সামনে মাংস বেছে মেশিনে করিয়ে নিন।',
        'For mince, choose the meat first and have it ground in front of you.',
      ],
    ],
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['হাড়ছাড়া', 'Boneless'],
    unit: 'kg',
    price: [900, 1000],
    profile: 'meat',
  },

  // ---------------- Goat & Mutton ----------------
  {
    slug: 'goat-meat',
    category: 'mutton',
    checklist: 'meat',
    name: ['খাসির মাংস', 'Goat meat'],
    alt: { bn: ['খাসি', 'ছাগলের মাংস'], en: ['Khashi', 'Mutton (goat)', 'Chevon'] },
    short: [
      'কচি খাসির নরম মাংস — রেজালা ও বিরিয়ানির প্রাণ।',
      'Tender meat from young castrated goats — the soul of rezala and biryani.',
    ],
    desc: [
      'খাসি হলো খোজা করা পুরুষ ছাগল। কচি খাসির মাংস নরম ও কম গন্ধযুক্ত। দেশি কালো ছাগলের (ব্ল্যাক বেঙ্গল) মাংস সবচেয়ে সুস্বাদু।',
      'Khashi is a castrated male goat. Young khashi meat is tender with a mild aroma; Black Bengal goat meat is considered the tastiest.',
    ],
    ident: [
      'মাংস হালকা থেকে মাঝারি লাল, আঁশ মিহি। চর্বি সাদা ও শক্ত, পরিমাণে কম। হাড় সরু। ভেড়ার মাংস তুলনায় গাঢ় ও চর্বি বেশি, গন্ধ তীব্র।',
      'Light to medium red with a fine grain; the fat is white, firm and sparse, and the bones are slender. Sheep meat is darker, fattier and stronger-smelling.',
    ],
    warn: [
      [
        'মাংসে তীব্র বোঁটকা গন্ধ — বয়স্ক পাঁঠা বা ভেড়ার মাংস হতে পারে।',
        'A strong, goaty odour — it may be from an old billy goat or sheep.',
      ],
    ],
    tips: [
      [
        'ঝুলিয়ে রাখা খাসির মাথা বা চামড়া দেখে প্রাণীটি চিনে নিন।',
        'Use the head or skin displayed at the shop to identify the animal.',
      ],
      [
        'রানের মাংস বিরিয়ানির জন্য, সিনার মাংস ঝোলের জন্য ভালো।',
        'Leg meat suits biryani; brisket suits curries.',
      ],
    ],
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['খাসি', 'Goat'],
    unit: 'kg',
    image: U('1602470520998-f4a52199a3d6'),
    featured: true,
    price: [1100, 1200],
    profile: 'meat',
  },
  {
    slug: 'sheep-meat',
    category: 'mutton',
    checklist: 'meat',
    name: ['ভেড়ার মাংস', 'Sheep meat'],
    alt: { bn: ['ভেড়া'], en: ['Mutton (sheep)', 'Lamb'] },
    short: [
      'খাসির চেয়ে কম দামি, স্বাদ ও গন্ধ আলাদা।',
      'Cheaper than goat, with a different flavour and aroma.',
    ],
    desc: [
      'ভেড়ার মাংস খাসির তুলনায় চর্বিযুক্ত ও গন্ধ বেশি। কেনার আগে কোন প্রাণীর মাংস তা নিশ্চিত হোন।',
      'Sheep meat is fattier and stronger-smelling than goat. Make sure you know which animal it is from.',
    ],
    ident: [
      'রং গাঢ় লাল, চর্বি বেশি ও নরম। চর্বি আঙুলে ঘষলে মোমের মতো লাগে।',
      'Deep red with more, softer fat that feels waxy when rubbed between fingers.',
    ],
    tips: [
      [
        'খাসি বলে ভেড়ার মাংস বিক্রি হচ্ছে কি না সতর্ক থাকুন।',
        'Be careful that sheep meat is not being sold as goat.',
      ],
    ],
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['ভেড়া', 'Sheep'],
    unit: 'kg',
    price: null,
  },

  // ---------------- Vegetables ----------------
  {
    slug: 'potato',
    category: 'vegetables',
    checklist: 'vegetable',
    name: ['আলু', 'Potato'],
    alt: { bn: ['গোল আলু', 'বগুড়ার আলু'], en: ['Aloo', 'Potatoes'] },
    short: ['প্রতিদিনের রান্নার অপরিহার্য সবজি।', 'An everyday kitchen essential.'],
    desc: [
      'বাংলাদেশে আলু শীতকালে উৎপাদিত হয় এবং হিমাগারে সংরক্ষণ করে সারা বছর বিক্রি হয়। নতুন আলুর খোসা পাতলা, পুরনো আলুর খোসা মোটা।',
      'Potatoes are harvested in winter and kept in cold storage for year-round sale. New potatoes have thin skins; stored ones are thicker-skinned.',
    ],
    ident: [
      'গোলাকার বা ডিম্বাকার, খোসা হালকা বাদামি বা লালচে। ভেতরটা সাদা বা হালকা হলুদ।',
      'Round or oval with light brown or reddish skin; white or pale-yellow inside.',
    ],
    good: [
      [
        'শক্ত ও মসৃণ, কোনো অঙ্কুর বা সবুজ ভাব নেই।',
        'Firm and smooth, with no sprouts and no green patches.',
      ],
    ],
    warn: [
      [
        'খোসায় সবুজ রং — এই অংশ কেটে ফেলুন, বেশি হলে কিনবেন না।',
        'Green patches on the skin — cut them away, and avoid heavily green potatoes.',
      ],
    ],
    tips: [
      [
        'অন্ধকার ও শুকনো জায়গায় রাখুন, পেঁয়াজের পাশে নয়।',
        'Store in a dark, dry place — not next to onions.',
      ],
    ],
    season: [
      'ডিসেম্বর–মার্চে নতুন আলু; সারা বছর হিমাগারের আলু পাওয়া যায়।',
      'New potatoes from December to March; cold-stored potatoes year-round.',
    ],
    months: [12, 1, 2, 3],
    variety: ['মূল ও কন্দ', 'Roots & tubers'],
    unit: 'kg',
    image: U('1518977676601-b53f82aba655'),
    featured: true,
    popular: true,
    price: [25, 35],
    profile: 'veg',
  },
  {
    slug: 'tomato',
    category: 'vegetables',
    checklist: 'vegetable',
    name: ['টমেটো', 'Tomato'],
    alt: { bn: ['বিলাতি বেগুন'], en: ['Tomatoes'] },
    short: [
      'শীতের টমেটো সস্তা ও সুস্বাদু; গ্রীষ্মে দাম বাড়ে।',
      'Winter tomatoes are cheap and tasty; prices climb in summer.',
    ],
    desc: [
      'টমেটো মূলত শীতকালীন ফসল। মৌসুমের বাইরে দাম কয়েকগুণ বেড়ে যেতে পারে।',
      'Tomato is mainly a winter crop; off-season prices can be several times higher.',
    ],
    ident: [
      'গোল বা সামান্য চ্যাপ্টা, পাকা অবস্থায় উজ্জ্বল লাল; বোঁটার কাছে সবুজ তারকা আকৃতির পাতা।',
      'Round or slightly flat, bright red when ripe, with a green star-shaped calyx at the stalk.',
    ],
    good: [
      [
        'হালকা চাপে সামান্য নরম কিন্তু থলথলে নয়।',
        'Yields slightly to gentle pressure without being mushy.',
      ],
    ],
    warn: [
      [
        'বাইরে টকটকে লাল অথচ ভেতরে শক্ত ও সাদাটে।',
        'Bright red outside but hard and whitish inside.',
      ],
    ],
    tips: [
      [
        'সালাদের জন্য শক্ত, রান্নার জন্য একটু বেশি পাকা টমেটো নিন।',
        'Pick firm tomatoes for salad and riper ones for cooking.',
      ],
    ],
    season: ['নভেম্বর থেকে মার্চ ভরা মৌসুম।', 'Peak season is November to March.'],
    months: [11, 12, 1, 2, 3],
    variety: ['ফল জাতীয় সবজি', 'Fruiting vegetables'],
    unit: 'kg',
    image: U('1546094096-0df4bcaaa337'),
    price: [60, 90],
    profile: 'veg',
    gaps: [5],
  },
  {
    slug: 'brinjal',
    category: 'vegetables',
    checklist: 'vegetable',
    name: ['বেগুন', 'Brinjal'],
    alt: { bn: ['গোল বেগুন', 'লম্বা বেগুন'], en: ['Eggplant', 'Aubergine', 'Begun'] },
    short: [
      'ভাজা, ভর্তা, ঝোল — বেগুনের ব্যবহার অসংখ্য।',
      'Fried, mashed or in curry — brinjal is endlessly useful.',
    ],
    desc: [
      'বেগুনের অনেক জাত — লম্বা বেগুন, গোল বেগুন, সাদা বেগুন। রমজানে বেগুনির জন্য চাহিদা ও দাম বাড়ে।',
      'There are many varieties — long, round and white. Demand and prices rise during Ramadan for beguni.',
    ],
    ident: [
      'খোসা চকচকে বেগুনি থেকে সবুজ বা সাদা; বোঁটায় কাঁটাযুক্ত সবুজ টুপি।',
      'Glossy skin from purple to green or white, with a spiny green cap at the stalk.',
    ],
    good: [['হাতে হালকা লাগে — ভেতরে বীজ কম।', 'Feels light for its size — fewer seeds inside.']],
    warn: [
      [
        'খোসায় ছোট ছিদ্র — ভেতরে পোকা থাকতে পারে।',
        'Tiny holes in the skin — there may be a borer inside.',
      ],
    ],
    tips: [
      [
        'কাটার পর ভেতরে কালো দাগ বা পোকা দেখলে সেই অংশ ফেলে দিন।',
        'If you find dark streaks or a larva after cutting, discard that part.',
      ],
    ],
    season: ['সারা বছর; শীতে বেশি ও সস্তা।', 'Year-round; more plentiful and cheaper in winter.'],
    variety: ['ফল জাতীয় সবজি', 'Fruiting vegetables'],
    unit: 'kg',
    price: [50, 80],
    profile: 'veg',
  },
  {
    slug: 'cauliflower',
    category: 'vegetables',
    checklist: 'vegetable',
    name: ['ফুলকপি', 'Cauliflower'],
    alt: { bn: ['ফুল কপি'], en: ['Cauli', 'Phulkopi'] },
    short: [
      'শীতের জনপ্রিয় সবজি, পিস হিসেবে বিক্রি হয়।',
      'A favourite winter vegetable, sold by the piece.',
    ],
    desc: [
      'ফুলকপি শীতকালীন সবজি। আগাম জাতের ফুলকপি অক্টোবর থেকে বাজারে আসে, তখন দাম বেশি থাকে।',
      'Cauliflower is a winter vegetable. Early varieties arrive from October at higher prices.',
    ],
    ident: [
      'সাদা বা হালকা ক্রিম রঙের ঘন ফুল, চারপাশে সবুজ পাতা দিয়ে ঢাকা।',
      'A dense white or cream head wrapped in green leaves.',
    ],
    good: [
      [
        'ফুল ঘন ও আঁটসাঁট, পাতা সবুজ ও সতেজ।',
        'The head is tight and compact; the leaves are green and fresh.',
      ],
    ],
    warn: [
      [
        'ফুলে বাদামি বা কালো ছোপ, ফুল ছড়িয়ে গেছে।',
        'Brown or black spots, or florets that have spread apart.',
      ],
    ],
    tips: [
      [
        'রান্নার আগে লবণ-গরম পানিতে কিছুক্ষণ ভিজিয়ে রাখুন — ভেতরের পোকা বেরিয়ে আসবে।',
        'Soak in warm salted water before cooking to draw out any hidden insects.',
      ],
    ],
    season: ['নভেম্বর থেকে ফেব্রুয়ারি।', 'November to February.'],
    months: [11, 12, 1, 2],
    variety: ['পাতা ও ফুল জাতীয় সবজি', 'Flower & leaf vegetables'],
    unit: 'piece',
    image: U('1566842600175-97dca489844f'),
    price: [40, 60],
    profile: 'veg',
    onlyMonths: [10, 11, 12, 1, 2, 3],
  },
  {
    slug: 'cabbage',
    category: 'vegetables',
    checklist: 'vegetable',
    name: ['বাঁধাকপি', 'Cabbage'],
    alt: { bn: ['বাধাকপি'], en: ['Bandhakopi'] },
    short: [
      'ভাজি ও তরকারির জন্য সাশ্রয়ী শীতের সবজি।',
      'An economical winter vegetable for stir-fries and curries.',
    ],
    desc: [
      'বাঁধাকপি শীতকালে প্রচুর পাওয়া যায় এবং দাম কম থাকে।',
      'Cabbage is plentiful and cheap in winter.',
    ],
    ident: [
      'গোলাকার, পাতা একটার পর একটা শক্তভাবে জড়ানো; রং হালকা সবুজ।',
      'Round, with tightly wrapped pale-green leaves.',
    ],
    good: [
      [
        'হাতে ভারী ও শক্ত, বাইরের পাতা সতেজ।',
        'Heavy and hard in the hand with fresh outer leaves.',
      ],
    ],
    tips: [
      [
        'বাইরের দুই-তিনটি পাতা ফেলে দিয়ে রান্না করুন।',
        'Remove the two or three outer leaves before cooking.',
      ],
    ],
    season: ['নভেম্বর থেকে ফেব্রুয়ারি।', 'November to February.'],
    months: [11, 12, 1, 2],
    variety: ['পাতা ও ফুল জাতীয় সবজি', 'Flower & leaf vegetables'],
    unit: 'piece',
    price: [35, 50],
    profile: 'veg',
    onlyMonths: [11, 12, 1, 2, 3],
  },
  {
    slug: 'bottle-gourd',
    category: 'vegetables',
    checklist: 'vegetable',
    name: ['লাউ', 'Bottle gourd'],
    alt: { bn: ['কদু'], en: ['Lau', 'Calabash'] },
    short: [
      'হালকা ও সহজপাচ্য সবজি — লাউ-চিংড়ি বিখ্যাত।',
      'Light and easy to digest — lau chingri is a classic.',
    ],
    desc: [
      'লাউ পিস হিসেবে বিক্রি হয়। কচি লাউ নরম ও মিষ্টি; বেশি পাকা লাউয়ের বীজ শক্ত।',
      'Bottle gourd is sold by the piece. Young gourds are tender and sweet; mature ones have hard seeds.',
    ],
    ident: [
      'লম্বা বা গোলাকার, হালকা সবুজ মসৃণ খোসা, গায়ে হালকা লোম।',
      'Long or round, with smooth light-green skin and a fine fuzz.',
    ],
    good: [
      [
        'নখ দিয়ে চাপ দিলে সহজে দাগ বসে — কচি লাউয়ের লক্ষণ।',
        'A fingernail easily marks the skin — a sign of a young gourd.',
      ],
    ],
    tips: [
      [
        'খুব বড় লাউ এড়িয়ে চলুন, ভেতরে বীজ শক্ত হতে পারে।',
        'Avoid very large gourds — the seeds may be hard.',
      ],
    ],
    season: ['সারা বছর, শীতে বেশি।', 'Year-round; most plentiful in winter.'],
    variety: ['লতানো সবজি', 'Gourds'],
    unit: 'piece',
    price: [50, 70],
    profile: 'veg',
  },
  {
    slug: 'pointed-gourd',
    category: 'vegetables',
    checklist: 'vegetable',
    name: ['পটল', 'Pointed gourd'],
    alt: { bn: ['পটোল'], en: ['Potol', 'Parwal'] },
    short: [
      'গ্রীষ্ম-বর্ষার জনপ্রিয় সবজি — পটল ভাজা ও দোলমা।',
      'A summer and monsoon favourite — potol bhaja and dolma.',
    ],
    desc: [
      'পটল গ্রীষ্ম ও বর্ষাকালের সবজি। ছোট ও মাঝারি পটল সবচেয়ে নরম।',
      'Pointed gourd is a summer–monsoon vegetable. Small and medium ones are the most tender.',
    ],
    ident: [
      'ছোট, দুই প্রান্ত সুচালো, গায়ে সবুজ ও হালকা সাদা ডোরা।',
      'Small with pointed ends and green skin striped with pale white.',
    ],
    good: [
      ['টিপলে শক্ত, ভেতরে বীজ নরম ও সাদা।', 'Firm when pressed, with soft white seeds inside.'],
    ],
    warn: [
      [
        'হলুদাভ পটল — বেশি পেকে গেছে, বীজ শক্ত।',
        'Yellowing gourds are over-mature with hard seeds.',
      ],
    ],
    tips: [['একটি পটল ভেঙে বীজ দেখে নিতে পারেন।', 'You can break one open to check the seeds.']],
    season: ['মার্চ থেকে সেপ্টেম্বর।', 'March to September.'],
    months: [4, 5, 6, 7, 8, 9],
    variety: ['লতানো সবজি', 'Gourds'],
    unit: 'kg',
    price: [50, 70],
    profile: 'veg',
    lastIndex: 10,
  },
  {
    slug: 'carrot',
    category: 'vegetables',
    checklist: 'vegetable',
    name: ['গাজর', 'Carrot'],
    alt: { bn: ['গাঁজর'], en: ['Carrots', 'Gajor'] },
    short: [
      'মিষ্টি ও পুষ্টিকর — সালাদ, হালুয়া ও সবজিতে।',
      'Sweet and nutritious — for salads, halwa and mixed vegetables.',
    ],
    desc: [
      'শীতের দেশি গাজর মিষ্টি ও রসালো। অন্য সময় আমদানি করা গাজর পাওয়া যায়।',
      'Winter local carrots are sweet and juicy; imported carrots fill the rest of the year.',
    ],
    ident: ['লম্বা, শঙ্কু আকৃতির, উজ্জ্বল কমলা রঙের মূল।', 'A long, conical, bright-orange root.'],
    good: [['শক্ত ও মসৃণ, সহজে বাঁকে না।', 'Firm and smooth — it does not bend easily.']],
    warn: [
      [
        'রাবারের মতো নরম, ফাটা বা গায়ে অনেক শিকড়।',
        'Rubbery, split, or covered in hairy rootlets.',
      ],
    ],
    tips: [['মাঝারি আকারের গাজর বেশি মিষ্টি হয়।', 'Medium carrots tend to be sweeter.']],
    season: ['ডিসেম্বর থেকে মার্চ।', 'December to March.'],
    months: [12, 1, 2, 3],
    variety: ['মূল ও কন্দ', 'Roots & tubers'],
    unit: 'kg',
    image: U('1598170845058-32b9d6a5da37'),
    price: [50, 80],
    profile: 'veg',
    draftLatest: true,
  },
  {
    slug: 'okra',
    category: 'vegetables',
    checklist: 'vegetable',
    name: ['ঢেঁড়স', 'Okra'],
    alt: { bn: ['ঢেড়স', 'ভেন্ডি'], en: ["Lady's finger", 'Bhindi'] },
    short: ['গ্রীষ্মের সবজি — ভাজি ও চচ্চড়িতে।', 'A summer vegetable for bhaji and chorchori.'],
    desc: [
      'ঢেঁড়স কচি অবস্থায় খেতে হয়; বেশি পাকলে আঁশযুক্ত ও শক্ত হয়ে যায়।',
      'Okra must be eaten young; once over-mature it turns fibrous and tough.',
    ],
    ident: [
      'লম্বা, পাঁচ বা ছয় কোণা, সবুজ রঙের ও গায়ে হালকা লোম।',
      'Long, five- or six-ridged green pods with a light fuzz.',
    ],
    good: [['ডগা ভাঙলে কট করে ভেঙে যায়।', 'The tip snaps off cleanly.']],
    warn: [
      ['ডগা বাঁকে কিন্তু ভাঙে না — বেশি পাকা।', 'The tip bends instead of snapping — over-mature.'],
    ],
    tips: [
      ['৮–১০ সেন্টিমিটার লম্বা ঢেঁড়স সবচেয়ে নরম।', 'Pods 8–10 cm long are the most tender.'],
    ],
    season: ['মার্চ থেকে সেপ্টেম্বর।', 'March to September.'],
    months: [3, 4, 5, 6, 7, 8, 9],
    variety: ['ফল জাতীয় সবজি', 'Fruiting vegetables'],
    unit: 'kg',
    price: [50, 70],
    profile: 'veg',
    draftLatest: true,
  },

  // ---------------- Leafy greens ----------------
  {
    slug: 'lal-shak',
    category: 'leafy-greens',
    checklist: 'leafy',
    name: ['লালশাক', 'Red amaranth'],
    alt: { bn: ['লাল শাক'], en: ['Lal shak', 'Red spinach'] },
    short: [
      'রঙিন ও পুষ্টিকর শাক — রসুন দিয়ে ভাজি জনপ্রিয়।',
      'Colourful, nutritious greens — popular stir-fried with garlic.',
    ],
    desc: [
      'লালশাক আঁটি হিসেবে বিক্রি হয়। শীতের লালশাক বেশি নরম ও সুস্বাদু।',
      'Red amaranth is sold in bundles. Winter crops are especially tender and tasty.',
    ],
    ident: [
      'পাতা ছোট, ডিম্বাকার, মাঝখানে গাঢ় লাল বা বেগুনি রং, কিনারা সবুজ হতে পারে। ডাঁটা নরম ও লালচে।',
      'Small oval leaves with a deep red or purple centre, sometimes green at the edges, on soft reddish stems.',
    ],
    tips: [
      ['শিকড়সহ লালশাক বেশিক্ষণ তাজা থাকে।', 'Bundles with roots attached stay fresh longer.'],
      [
        'রান্নার পর পানি লাল হওয়া স্বাভাবিক — এটি শাকের প্রাকৃতিক রং।',
        'Red cooking water is normal — it is the natural pigment.',
      ],
    ],
    season: ['সারা বছর, শীতে বেশি।', 'Year-round; best in winter.'],
    variety: ['শাক', 'Leafy greens'],
    unit: 'bundle',
    featured: true,
    price: [15, 20],
    profile: 'veg',
  },
  {
    slug: 'palong-shak',
    category: 'leafy-greens',
    checklist: 'leafy',
    name: ['পালংশাক', 'Spinach'],
    alt: { bn: ['পালং শাক', 'পালং'], en: ['Palong shak', 'Spinach'] },
    short: [
      'শীতের প্রিয় শাক — ডাল ও মাছের সঙ্গে রান্না হয়।',
      'A winter favourite, cooked with dal or fish.',
    ],
    desc: [
      'পালংশাক শীতকালীন শাক। নরম, চওড়া সবুজ পাতা এর বৈশিষ্ট্য।',
      'Spinach is a winter green with soft, broad leaves.',
    ],
    ident: [
      'পাতা চওড়া, মসৃণ ও গাঢ় সবুজ; ডাঁটা লম্বা ও রসালো। গোড়ায় হালকা গোলাপি আভা থাকতে পারে।',
      'Broad, smooth, dark-green leaves on long juicy stems, sometimes pinkish at the base.',
    ],
    tips: [['কচি ও ছোট পাতার পালং বেশি নরম।', 'Young spinach with smaller leaves is more tender.']],
    season: ['নভেম্বর থেকে ফেব্রুয়ারি।', 'November to February.'],
    months: [11, 12, 1, 2],
    variety: ['শাক', 'Leafy greens'],
    unit: 'bundle',
    image: U('1574316071802-0d684efa7bf5'),
    price: [20, 30],
    profile: 'veg',
    onlyMonths: [10, 11, 12, 1, 2, 3],
  },
  {
    slug: 'pui-shak',
    category: 'leafy-greens',
    checklist: 'leafy',
    name: ['পুঁইশাক', 'Malabar spinach'],
    alt: { bn: ['পুঁই শাক', 'পুই শাক'], en: ['Pui shak', 'Basella'] },
    short: [
      'মোটা রসালো পাতা — চিংড়ি দিয়ে পুঁইশাক অনন্য।',
      'Thick, succulent leaves — classic with prawns.',
    ],
    desc: [
      'পুঁইশাক লতানো গাছের পাতা ও ডগা। পুঁইশাকের বিচি (মিচুড়ি) ও ডাঁটাও খাওয়া হয়।',
      'Malabar spinach is a climbing vine; its leaves, tips and berries are all eaten.',
    ],
    ident: [
      'পাতা পুরু, চকচকে ও হৃদয় আকৃতির; ডাঁটা মোটা, সবুজ বা লালচে।',
      'Thick, glossy, heart-shaped leaves on fleshy green or reddish stems.',
    ],
    tips: [['কচি ডগাসহ আঁটি বেছে নিন।', 'Choose bundles with tender tips.']],
    season: ['মার্চ থেকে অক্টোবর।', 'March to October.'],
    months: [4, 5, 6, 7, 8, 9],
    variety: ['শাক', 'Leafy greens'],
    unit: 'bundle',
    price: [30, 40],
    profile: 'veg',
  },
  {
    slug: 'kolmi-shak',
    category: 'leafy-greens',
    checklist: 'leafy',
    name: ['কলমিশাক', 'Water spinach'],
    alt: { bn: ['কলমি শাক', 'কলমি'], en: ['Kolmi shak', 'Kangkong'] },
    short: [
      'জলজ শাক — সস্তা, সহজলভ্য ও আয়রনসমৃদ্ধ।',
      'An aquatic green — cheap, widely available and iron-rich.',
    ],
    desc: [
      'কলমিশাক পানিতে জন্মায়। ফাঁপা ডাঁটা এর বৈশিষ্ট্য।',
      'Water spinach grows in water and has distinctive hollow stems.',
    ],
    ident: [
      'পাতা লম্বা ও তীরের মতো সুচালো; ডাঁটা ফাঁপা ও সবুজ।',
      'Long, arrow-shaped leaves on hollow green stems.',
    ],
    warn: [
      [
        'নোংরা বা দূষিত জলাশয়ের শাক এড়াতে বিশ্বস্ত বিক্রেতার কাছ থেকে কিনুন ও ভালো করে ধুয়ে নিন।',
        'Buy from a trusted seller and wash thoroughly, as it may come from polluted water.',
      ],
    ],
    tips: [['শুধু কচি ডগা ও পাতা রান্না করুন।', 'Cook only the tender tips and leaves.']],
    season: ['সারা বছর, বর্ষায় বেশি।', 'Year-round; most plentiful in the monsoon.'],
    variety: ['শাক', 'Leafy greens'],
    unit: 'bundle',
    price: [10, 15],
    profile: 'veg',
  },
  {
    slug: 'lau-shak',
    category: 'leafy-greens',
    checklist: 'leafy',
    name: ['লাউশাক', 'Bottle gourd leaves'],
    alt: { bn: ['লাউ শাক', 'লাউয়ের ডগা'], en: ['Lau shak', 'Gourd greens'] },
    short: [
      'লাউয়ের কচি ডগা ও পাতা — হালকা ও সুস্বাদু।',
      'Tender shoots and leaves of the bottle gourd vine.',
    ],
    desc: [
      'লাউশাক লাউ গাছের কচি ডগা। ডাঁটার আঁশ ছাড়িয়ে রান্না করতে হয়।',
      'Lau shak are the young shoots of the bottle-gourd vine; peel the stem fibres before cooking.',
    ],
    ident: [
      'পাতা বড়, নরম ও হালকা লোমযুক্ত; ডগায় আকর্ষী থাকে।',
      'Large, soft, slightly hairy leaves with curling tendrils at the tip.',
    ],
    tips: [
      ['ডাঁটা ভেঙে আঁশ টেনে ছাড়িয়ে নিন।', 'Snap the stems and pull off the fibrous strings.'],
    ],
    season: ['শীতকালে বেশি পাওয়া যায়।', 'Mostly available in winter.'],
    months: [11, 12, 1, 2],
    variety: ['শাক', 'Leafy greens'],
    unit: 'bundle',
    price: null,
  },

  // ---------------- Fruits ----------------
  {
    slug: 'sagor-kola',
    category: 'fruits',
    checklist: 'fruit',
    name: ['সাগর কলা', 'Sagor banana'],
    alt: { bn: ['কলা', 'পাকা কলা'], en: ['Banana', 'Sagar kola'] },
    short: [
      'সারা বছরের সহজলভ্য ফল — ডজন হিসেবে বিক্রি হয়।',
      'A year-round fruit sold by the dozen.',
    ],
    desc: [
      'সাগর কলা বাংলাদেশের সবচেয়ে জনপ্রিয় পাকা কলা। চম্পা ও সবরি কলাও বাজারে পাওয়া যায়।',
      'Sagor is the most popular ripe banana in Bangladesh; champa and sobri are also common.',
    ],
    ident: [
      'মাঝারি আকারের, পাকা অবস্থায় হলুদ খোসায় ছোট বাদামি দাগ। খোসা পাতলা, শাঁস মিষ্টি ও নরম।',
      'Medium-sized, with yellow skin and small brown freckles when ripe; thin skin and sweet, soft flesh.',
    ],
    good: [
      [
        'বোঁটার কাছে সামান্য সবুজ থাকলে কয়েক দিন রাখা যায়।',
        'A little green near the stem means it will keep a few more days.',
      ],
    ],
    warn: [
      [
        'খোসা পুরো কালো ও থলথলে, বা বোঁটা পচে গেছে।',
        'Skin completely black and mushy, or a rotten stalk.',
      ],
    ],
    tips: [
      ['একসঙ্গে বেশি কিনলে আধা-পাকা কলা নিন।', 'If buying in bulk, choose semi-ripe bananas.'],
    ],
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['দেশি ফল', 'Local fruit'],
    unit: 'dozen',
    image: U('1571771894821-ce9b6c11b08e'),
    featured: true,
    price: [100, 120],
    profile: 'stable',
  },
  {
    slug: 'mango',
    category: 'fruits',
    checklist: 'fruit',
    name: ['আম (হিমসাগর)', 'Mango (Himsagar)'],
    alt: { bn: ['আম', 'হিমসাগর', 'খিরসাপাত'], en: ['Mango', 'Himsagar', 'Khirsapat'] },
    short: [
      'ফলের রাজা — রাজশাহী ও চাঁপাইনবাবগঞ্জের হিমসাগর বিখ্যাত।',
      'The king of fruits — Himsagar from Rajshahi and Chapainawabganj is famous.',
    ],
    desc: [
      'হিমসাগর মৌসুমের শুরুর দিকের আম। পাকলেও খোসা সবুজাভ-হলুদ থাকে, শাঁস আঁশহীন ও খুব মিষ্টি।',
      'Himsagar is an early-season mango. Even when ripe the skin stays greenish-yellow; the flesh is fibreless and very sweet.',
    ],
    ident: [
      'মাঝারি আকার, ডিম্বাকার; খোসা পাতলা ও সবুজাভ-হলুদ। পাকা আমের বোঁটার কাছে মিষ্টি সুবাস।',
      'Medium, oval and thin-skinned, greenish-yellow; ripe fruit smells sweet at the stem end.',
    ],
    warn: [
      [
        'সব আম একই রকম উজ্জ্বল হলুদ অথচ ঘ্রাণ নেই — সময়ের আগে পাড়া হতে পারে।',
        'All mangoes uniformly bright yellow yet scentless — they may have been picked too early.',
      ],
    ],
    tips: [
      [
        'সরকার ঘোষিত আম পাড়ার সময়সূচির পরে কেনা নিরাপদ।',
        'It is safest to buy after the government’s official harvest dates for each variety.',
      ],
      [
        'বোঁটার কাছে শুঁকে দেখুন — পাকা আমের সুবাস স্পষ্ট।',
        'Smell near the stem — ripe mangoes have a clear aroma.',
      ],
    ],
    season: ['মে থেকে জুলাই; হিমসাগর জুনে সবচেয়ে ভালো।', 'May to July; Himsagar is best in June.'],
    months: [5, 6, 7],
    variety: ['মৌসুমি ফল', 'Seasonal fruit'],
    unit: 'kg',
    image: U('1553279768-865429fa0078'),
    price: [100, 140],
    profile: 'stable',
    onlyMonths: [5, 6, 7, 8],
  },
  {
    slug: 'pineapple',
    category: 'fruits',
    checklist: 'fruit',
    name: ['আনারস', 'Pineapple'],
    alt: { bn: ['জলডুগি', 'হানিকুইন'], en: ['Ananas', 'Honey Queen'] },
    short: [
      'টক-মিষ্টি রসালো ফল, পিস হিসেবে বিক্রি হয়।',
      'A sweet-tart juicy fruit sold by the piece.',
    ],
    desc: [
      'মধুপুর ও শ্রীমঙ্গলের আনারস বিখ্যাত। হানিকুইন ছোট ও খুব মিষ্টি; জায়ান্ট কিউ বড় ও রসালো।',
      'Pineapples from Madhupur and Sreemangal are famous. Honey Queen is small and very sweet; Giant Kew is large and juicy.',
    ],
    ident: [
      'খোসা খাঁজকাটা চোখে ভরা, মাথায় সবুজ কাঁটাযুক্ত পাতার মুকুট।',
      'A rough skin of hexagonal "eyes" topped by a crown of spiky green leaves.',
    ],
    good: [
      [
        'মুকুটের মাঝের একটি পাতা সহজে টেনে তোলা যায় এবং তলায় মিষ্টি ঘ্রাণ।',
        'A centre leaf of the crown pulls out easily and the base smells sweet.',
      ],
    ],
    tips: [
      [
        'চোখগুলো চ্যাপ্টা ও বড় হলে আনারস বেশি পাকা ও মিষ্টি।',
        'Flatter, larger eyes indicate a riper, sweeter fruit.',
      ],
    ],
    season: ['মে থেকে আগস্ট মূল মৌসুম।', 'Main season is May to August.'],
    months: [5, 6, 7, 8],
    variety: ['মৌসুমি ফল', 'Seasonal fruit'],
    unit: 'piece',
    image: U('1550258987-190a2d41a8ba'),
    price: [50, 70],
    profile: 'stable',
  },
  {
    slug: 'watermelon',
    category: 'fruits',
    checklist: 'fruit',
    name: ['তরমুজ', 'Watermelon'],
    alt: { bn: ['তরমুজ'], en: ['Tormuj'] },
    short: ['গরমের সেরা ফল — রসালো ও ঠান্ডা।', 'The ultimate summer fruit — juicy and cooling.'],
    desc: [
      'তরমুজ চৈত্র-বৈশাখে প্রচুর পাওয়া যায়। কখনো পিস, কখনো কেজি দরে বিক্রি হয়।',
      'Watermelon floods the market in spring and early summer, sold by the piece or by the kilo.',
    ],
    ident: [
      'বড়, গোল বা ডিম্বাকার; খোসা গাঢ় সবুজ বা ডোরাকাটা। ভেতরে লাল শাঁস ও কালো বিচি।',
      'Large, round or oval, dark green or striped; red flesh with black seeds inside.',
    ],
    good: [
      [
        'টোকা দিলে ফাঁপা ঢপঢপ শব্দ হয় এবং মাটিতে থাকা দিকটি হলুদাভ।',
        'It sounds hollow when tapped, and the ground spot is creamy yellow.',
      ],
    ],
    warn: [
      [
        'কাটা তরমুজের শাঁস অস্বাভাবিক গাঢ় লাল অথচ স্বাদ পানসে — ক্রয় এড়িয়ে চলুন।',
        'Cut fruit that is unnaturally deep red yet tasteless — better to skip it.',
      ],
    ],
    tips: [
      ['কেজি দরে কিনলে ওজন নিজে দেখে নিন।', 'If priced by the kilo, watch the weighing yourself.'],
    ],
    season: ['মার্চ থেকে মে।', 'March to May.'],
    months: [3, 4, 5],
    variety: ['মৌসুমি ফল', 'Seasonal fruit'],
    unit: 'kg',
    image: U('1587049352846-4a222e784d38'),
    price: [50, 70],
    profile: 'stable',
    onlyMonths: [3, 4, 5, 6],
  },
  {
    slug: 'guava',
    category: 'fruits',
    checklist: 'fruit',
    name: ['পেয়ারা', 'Guava'],
    alt: { bn: ['পেয়ারা', 'কাজী পেয়ারা'], en: ['Peyara', 'Kazi guava'] },
    short: ['ভিটামিন সি-তে ভরপুর দেশি ফল।', 'A local fruit packed with vitamin C.'],
    desc: [
      'পেয়ারা কাঁচা-পাকা দুই অবস্থায়ই খাওয়া হয়। বর্ষাকালে সবচেয়ে বেশি পাওয়া যায়।',
      'Guava is eaten both crisp and ripe, and is most plentiful in the monsoon.',
    ],
    ident: [
      'গোল বা নাশপাতি আকৃতি, খোসা সবুজ থেকে হলুদাভ সবুজ; ভেতরে সাদা শাঁস ও ছোট শক্ত বিচি।',
      'Round or pear-shaped, green to yellow-green, with white flesh and small hard seeds.',
    ],
    warn: [
      [
        'খোসায় ছোট ছিদ্র বা কালো নরম দাগ — ভেতরে পোকা থাকতে পারে।',
        'Pinholes or soft black spots — there may be fruit-fly larvae inside.',
      ],
    ],
    tips: [
      [
        'কাঁচা খেতে চাইলে শক্ত, সবুজ পেয়ারা বেছে নিন।',
        'For crunchy eating, pick firm green guavas.',
      ],
    ],
    season: [
      'জুলাই থেকে অক্টোবর; থাই পেয়ারা সারা বছর।',
      'July to October; Thai guava is available year-round.',
    ],
    months: [7, 8, 9, 10],
    variety: ['দেশি ফল', 'Local fruit'],
    unit: 'kg',
    price: [70, 100],
    profile: 'stable',
    lastIndex: 10,
  },
  {
    slug: 'malta',
    category: 'fruits',
    checklist: 'fruit',
    name: ['মাল্টা', 'Malta orange'],
    alt: { bn: ['কমলা', 'মালটা'], en: ['Orange', 'Malta'] },
    short: [
      'রসালো সাইট্রাস ফল — জুস ও সরাসরি খাওয়ার জন্য।',
      'A juicy citrus fruit for juice or eating fresh.',
    ],
    desc: [
      'বাজারের বেশিরভাগ মাল্টা আমদানি করা; দেশি সবুজ মাল্টাও এখন পাওয়া যায়।',
      'Most malta in the market is imported, though green local malta is now common too.',
    ],
    ident: [
      'গোল, খোসা কমলা বা সবুজাভ, গায়ে ছোট ছোট তেলগ্রন্থি। ভেতরে রসালো কোয়া।',
      'Round with orange or greenish skin dotted with oil glands; juicy segments inside.',
    ],
    good: [['খোসা পাতলা ও মসৃণ, হাতে ভারী।', 'Thin, smooth skin and heavy for its size.']],
    tips: [
      [
        'দেশি সবুজ মাল্টা সবুজ থাকলেও ভেতরে পাকা ও মিষ্টি হতে পারে।',
        'Local green malta can be ripe and sweet inside even when the skin is green.',
      ],
    ],
    season: [
      'আমদানি করা মাল্টা সারা বছর; দেশি মাল্টা আগস্ট–নভেম্বর।',
      'Imported year-round; local malta from August to November.',
    ],
    variety: ['আমদানি করা ফল', 'Imported fruit'],
    unit: 'kg',
    image: U('1611080626919-7cf5a9dbab5b'),
    price: [200, 240],
    profile: 'stable',
    draftLatest: true,
  },

  // ---------------- Spices ----------------
  {
    slug: 'onion',
    category: 'spices',
    checklist: 'spice',
    name: ['দেশি পেঁয়াজ', 'Local onion'],
    alt: { bn: ['পেঁয়াজ', 'পিঁয়াজ', 'দেশী পেয়াজ'], en: ['Onion', 'Piyaj', 'Shallot'] },
    short: [
      'রান্নার সবচেয়ে জরুরি মসলা — দাম ওঠানামা করে সবচেয়ে বেশি।',
      'The most essential kitchen staple — and the one whose price swings most.',
    ],
    desc: [
      'দেশি পেঁয়াজ ছোট ও ঝাঁঝালো; আমদানি করা পেঁয়াজ বড় ও কম ঝাঁঝালো। সরবরাহ অনুযায়ী দাম দ্রুত বদলায়।',
      'Local onions are small and pungent; imported ones are larger and milder. Prices change quickly with supply.',
    ],
    ident: [
      'ছোট থেকে মাঝারি, খোসা লালচে-গোলাপি ও পাতলা। কাটলে ঝাঁঝ বেশি।',
      'Small to medium with thin reddish-pink skin and a strong bite when cut.',
    ],
    tips: [
      [
        'মাসের প্রয়োজন অনুযায়ী কিনুন, শুকনো ও বাতাস চলাচলের জায়গায় রাখুন।',
        'Buy for a month’s use and store in a dry, airy place.',
      ],
    ],
    season: [
      'মার্চ–এপ্রিলে নতুন পেঁয়াজ ওঠে; শরতে দাম বাড়ার প্রবণতা।',
      'New harvest in March–April; prices tend to rise in autumn.',
    ],
    months: [3, 4],
    variety: ['কন্দ জাতীয় মসলা', 'Bulb & root spices'],
    unit: 'kg',
    image: U('1580201092675-a0a6a6cafbb1'),
    popular: true,
    price: [90, 110],
    profile: 'onion',
  },
  {
    slug: 'garlic',
    category: 'spices',
    checklist: 'spice',
    name: ['রসুন', 'Garlic'],
    alt: { bn: ['দেশি রসুন', 'চায়না রসুন'], en: ['Rosun', 'Local garlic'] },
    short: [
      'দেশি রসুনের কোয়া ছোট কিন্তু ঝাঁঝ বেশি।',
      'Local garlic has small cloves but a stronger punch.',
    ],
    desc: [
      'বাজারে দেশি ও আমদানি করা (চায়না) রসুন পাওয়া যায়। আমদানি করা রসুনের কোয়া বড় ও ছিলতে সহজ।',
      'Both local and imported (Chinese) garlic are sold. Imported garlic has large, easy-to-peel cloves.',
    ],
    ident: [
      'সাদা বা হালকা বেগুনি খোসায় মোড়া মাথা, ভেতরে অনেকগুলো কোয়া।',
      'A head wrapped in white or purplish papery skin containing many cloves.',
    ],
    tips: [
      [
        'শক্ত, ভারী মাথা নিন; চাপ দিলে দেবে গেলে নেবেন না।',
        'Pick heavy, firm heads; reject any that give when squeezed.',
      ],
    ],
    season: [
      'মার্চ–এপ্রিলে নতুন দেশি রসুন; সারা বছর পাওয়া যায়।',
      'New local garlic in March–April; available all year.',
    ],
    variety: ['কন্দ জাতীয় মসলা', 'Bulb & root spices'],
    unit: 'kg',
    price: [180, 220],
    profile: 'stable',
  },
  {
    slug: 'ginger',
    category: 'spices',
    checklist: 'spice',
    name: ['আদা', 'Ginger'],
    alt: { bn: ['দেশি আদা'], en: ['Ada', 'Ginger root'] },
    short: [
      'ঝাঁঝালো সুগন্ধি মূল — মাংস রান্নায় অপরিহার্য।',
      'A pungent aromatic root — essential for meat dishes.',
    ],
    desc: [
      'দেশি আদা আঁশযুক্ত ও ঝাঁঝালো; আমদানি করা আদা বড় ও মসৃণ।',
      'Local ginger is fibrous and sharp; imported ginger is larger and smoother.',
    ],
    ident: [
      'গাঁটযুক্ত শাখা-প্রশাখার মতো মূল, পাতলা হালকা বাদামি খোসা, ভেতরে হলুদাভ।',
      'A knobbly, branching root with thin light-brown skin and yellowish flesh.',
    ],
    good: [
      [
        'নখ দিয়ে ঘষলে খোসা সহজে ওঠে ও তীব্র ঘ্রাণ বের হয়।',
        'The skin scrapes off easily with a fingernail, releasing a strong aroma.',
      ],
    ],
    tips: [['কুঁচকানো ও হালকা আদা এড়িয়ে চলুন।', 'Avoid wrinkled, light-weight ginger.']],
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['কন্দ জাতীয় মসলা', 'Bulb & root spices'],
    unit: 'kg',
    price: [180, 240],
    profile: 'stable',
  },
  {
    slug: 'green-chili',
    category: 'spices',
    checklist: 'vegetable',
    name: ['কাঁচা মরিচ', 'Green chilli'],
    alt: { bn: ['কাচা মরিচ', 'মরিচ'], en: ['Green chili', 'Kacha morich'] },
    short: [
      'প্রতিদিনের ঝাল — বর্ষায় দাম হঠাৎ বেড়ে যায়।',
      'The everyday heat — prices can jump suddenly in the monsoon.',
    ],
    desc: [
      'কাঁচা মরিচ অল্প পরিমাণে (২৫০ গ্রাম/পোয়া) কেনা হয়। অতিবৃষ্টিতে সরবরাহ কমে দাম অনেক বেড়ে যেতে পারে।',
      'Green chillies are bought in small amounts. Heavy rain can cut supply and push prices up sharply.',
    ],
    ident: [
      'সরু, লম্বা, উজ্জ্বল সবুজ ও চকচকে। বোঁটা সবুজ।',
      'Slender, long, glossy bright-green pods with green stalks.',
    ],
    good: [['টানটান ও চকচকে, বোঁটা সবুজ।', 'Taut and shiny with green stalks.']],
    warn: [['নরম, কুঁচকানো বা কালো দাগযুক্ত মরিচ।', 'Soft, wrinkled or black-spotted chillies.']],
    tips: [
      [
        'ফ্রিজে কাগজে মুড়ে রাখলে বেশিদিন ভালো থাকে; বোঁটা ছিঁড়ে রাখুন।',
        'Remove stalks and wrap in paper in the fridge to keep them longer.',
      ],
    ],
    season: ['সারা বছর; বর্ষায় দাম বেশি থাকে।', 'Year-round; prices run higher in the monsoon.'],
    variety: ['ঝাল মসলা', 'Chillies'],
    unit: 'kg',
    price: [100, 160],
    profile: 'veg',
  },
  {
    slug: 'dried-red-chili',
    category: 'spices',
    checklist: 'spice',
    name: ['শুকনা মরিচ', 'Dried red chilli'],
    alt: { bn: ['শুকনো মরিচ', 'লাল মরিচ'], en: ['Dry chili', 'Red chili'] },
    short: [
      'গুঁড়া ও ফোড়নের জন্য শুকনো লাল মরিচ।',
      'Dried red chillies for grinding and tempering.',
    ],
    desc: [
      'শুকনা মরিচ নিজে গুঁড়া করলে বিশুদ্ধতা নিয়ে দুশ্চিন্তা কম থাকে।',
      'Grinding dried chillies yourself means less worry about what is in the powder.',
    ],
    ident: [
      'গাঢ় লাল, কুঁচকানো ও শুকনো খোসা; ঝাঁকালে ভেতরে বিচির শব্দ হয়।',
      'Deep red, wrinkled dry skin; seeds rattle inside when shaken.',
    ],
    warn: [
      [
        'সাদা ছোপ বা ভ্যাপসা গন্ধ — আর্দ্রতায় ছত্রাক ধরেছে।',
        'White patches or a musty smell — mould from damp storage.',
      ],
    ],
    tips: [
      [
        'মচমচে শুকনো মরিচ নিন — আঙুলে ভাঙলে ভেঙে যায়।',
        'Choose crisp chillies that snap between your fingers.',
      ],
    ],
    season: [
      'ফেব্রুয়ারি–এপ্রিলে নতুন মরিচ; সারা বছর পাওয়া যায়।',
      'New crop February–April; available year-round.',
    ],
    variety: ['ঝাল মসলা', 'Chillies'],
    unit: 'kg',
    price: [350, 450],
    profile: 'stable',
    lastIndex: 8,
  },

  // ---------------- Pulses & grains ----------------
  {
    slug: 'miniket-rice',
    category: 'pulses-grains',
    checklist: 'grain',
    name: ['মিনিকেট চাল', 'Miniket rice'],
    alt: { bn: ['চিকন চাল', 'মিনিকেট'], en: ['Fine rice', 'Miniket'] },
    short: [
      'সরু ও সাদা চাল — বাজারে সবচেয়ে বেশি বিক্রি হয়।',
      'Slender white rice — the best-selling rice in the market.',
    ],
    desc: [
      'মিনিকেট বাজারে প্রচলিত একটি নাম; এটি সাধারণত বিভিন্ন জাতের মোটা ধান ছেঁটে-পালিশ করে তৈরি সরু চাল।',
      '“Miniket” is a market name, usually for slender rice milled and polished from various paddy varieties.',
    ],
    ident: [
      'দানা সরু, লম্বাটে ও চকচকে সাদা। রান্নার পর ঝরঝরে হয়।',
      'Slender, elongated, glossy white grains that cook up separate and fluffy.',
    ],
    tips: [
      [
        'বস্তার নিচের দিক থেকে মুঠো নিয়ে ভাঙা দানা ও কাঁকর দেখুন।',
        'Take a handful from deep in the sack and check for broken grains and grit.',
      ],
      [
        'অতিরিক্ত চকচকে চালের চেয়ে প্রাকৃতিক রঙের চাল পুষ্টিকর।',
        'Less heavily polished rice keeps more nutrients.',
      ],
    ],
    season: [
      'সারা বছর; বোরো ও আমন মৌসুমের পরে দাম কিছুটা কমে।',
      'Year-round; prices ease slightly after the boro and aman harvests.',
    ],
    variety: ['চাল', 'Rice'],
    unit: 'kg',
    image: U('1586201375761-83865001e31c'),
    price: [72, 80],
    profile: 'stable',
  },
  {
    slug: 'coarse-rice',
    category: 'pulses-grains',
    checklist: 'grain',
    name: ['মোটা চাল', 'Coarse rice'],
    alt: { bn: ['স্বর্ণা', 'মোটা চাউল'], en: ['Swarna rice', 'Thick rice'] },
    short: ['সাশ্রয়ী ও পেট ভরানো চাল।', 'Affordable, filling everyday rice.'],
    desc: [
      'মোটা চাল (যেমন স্বর্ণা, গুটি) কম দামি এবং নিম্ন আয়ের পরিবারে প্রধান খাদ্য।',
      'Coarse rice such as swarna or guti is the cheapest and a staple for lower-income households.',
    ],
    ident: [
      'দানা খাটো ও মোটা, রং সাদা থেকে হালকা লালচে।',
      'Short, thick grains, white to slightly reddish.',
    ],
    tips: [['পুরনো চাল রান্নায় বেশি ঝরঝরে হয়।', 'Older (aged) rice cooks up less sticky.']],
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['চাল', 'Rice'],
    unit: 'kg',
    price: [52, 58],
    profile: 'stable',
  },
  {
    slug: 'masoor-dal',
    category: 'pulses-grains',
    checklist: 'grain',
    name: ['মসুর ডাল (মোটা)', 'Red lentils (coarse)'],
    alt: { bn: ['মসুর ডাল', 'লাল ডাল', 'বোম্বাই ডাল'], en: ['Masoor dal', 'Red lentil'] },
    short: [
      'প্রতিদিনের ডাল — মোটা দানা সাশ্রয়ী, চিকন দানা বেশি সুস্বাদু।',
      'The everyday dal — coarse grains are cheaper, fine grains tastier.',
    ],
    desc: [
      'মোটা মসুর ডাল বেশিরভাগ আমদানি করা; দেশি মসুর ডাল চিকন ও দামে বেশি।',
      'Coarse red lentils are mostly imported; local lentils are smaller and pricier.',
    ],
    ident: [
      'কমলা-লাল রঙের চ্যাপ্টা গোল দানা। মোটা ডালের দানা বড়, দেশি ডালের দানা ছোট।',
      'Flat, round orange-red split lentils; coarse lentils are large, local ones small.',
    ],
    tips: [
      [
        'রঙ খুব উজ্জ্বল ও অস্বাভাবিক হলে এড়িয়ে চলুন; ভালো করে ধুয়ে রান্না করুন।',
        'Avoid unnaturally bright colour, and rinse well before cooking.',
      ],
    ],
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['ডাল', 'Pulses'],
    unit: 'kg',
    popular: true,
    price: [105, 115],
    profile: 'stable',
  },
  {
    slug: 'mung-dal',
    category: 'pulses-grains',
    checklist: 'grain',
    name: ['মুগ ডাল', 'Mung dal'],
    alt: { bn: ['সোনা মুগ', 'মুগ'], en: ['Moong dal', 'Split mung beans'] },
    short: [
      'ভাজা মুগ ডালের সুবাস অনন্য — খিচুড়ির প্রাণ।',
      'Roasted mung dal has a unique aroma — the heart of khichuri.',
    ],
    desc: [
      'মুগ ডাল হালকা হলুদ ও সহজপাচ্য। সোনা মুগ সবচেয়ে সুগন্ধি।',
      'Mung dal is pale yellow and easy to digest; sona mung is the most fragrant.',
    ],
    ident: ['ছোট, ডিম্বাকার, হালকা হলুদ ভাঙা দানা।', 'Small, oval, pale-yellow split grains.'],
    tips: [
      ['দানা ঝকঝকে হলুদ ও সমান আকারের হলে ভালো।', 'Look for bright, even, pale-yellow grains.'],
    ],
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['ডাল', 'Pulses'],
    unit: 'kg',
    price: [150, 170],
    profile: 'stable',
  },
  {
    slug: 'chickpea',
    category: 'pulses-grains',
    checklist: 'grain',
    name: ['ছোলা', 'Chickpeas'],
    alt: { bn: ['বুট', 'ছোলাবুট'], en: ['Chana', 'Bengal gram'] },
    short: ['রমজানে ইফতারের অপরিহার্য উপকরণ।', 'An essential for iftar during Ramadan.'],
    desc: [
      'ছোলা প্রোটিনসমৃদ্ধ। রমজানের আগে চাহিদা ও দাম বেড়ে যায়।',
      'Chickpeas are protein-rich; demand and prices rise before Ramadan.',
    ],
    ident: [
      'গোলাকার, খসখসে, হালকা বাদামি দানা; একদিকে ছোট ঠোঁটের মতো খাঁজ।',
      'Round, wrinkled, light-brown seeds with a small beak-like point.',
    ],
    tips: [
      [
        'দানা সমান আকারের ও পোকামুক্ত কি না দেখুন; ছিদ্রযুক্ত দানা পোকার লক্ষণ।',
        'Check for even size; grains with holes indicate weevils.',
      ],
    ],
    season: ['সারা বছর; রমজানে চাহিদা বেশি।', 'Year-round; demand peaks in Ramadan.'],
    variety: ['ডাল', 'Pulses'],
    unit: 'kg',
    image: U('1515543904379-3d757afe72e4'),
    price: [100, 115],
    profile: 'meat',
  },

  // ---------------- Others ----------------
  {
    slug: 'farm-egg',
    category: 'others',
    checklist: 'egg',
    name: ['ফার্মের ডিম (লাল)', 'Farm eggs (brown)'],
    alt: { bn: ['ডিম', 'লাল ডিম', 'মুরগির ডিম'], en: ['Eggs', 'Brown eggs', 'Layer eggs'] },
    short: [
      'সাশ্রয়ী প্রোটিন — হালি হিসেবে বিক্রি হয়।',
      'Affordable protein, sold by the hali (4 eggs).',
    ],
    desc: [
      'বাজারে লেয়ার মুরগির লাল ডিম সবচেয়ে বেশি বিক্রি হয়। এক হালি = ৪টি ডিম।',
      'Brown eggs from layer hens are the most common. One hali = 4 eggs.',
    ],
    ident: [
      'মাঝারি আকার, খোসা হালকা থেকে গাঢ় বাদামি ও মসৃণ।',
      'Medium-sized with smooth light-to-dark brown shells.',
    ],
    tips: [
      [
        'ডজন বা ক্রেট হিসেবে কিনলে হালিপ্রতি দাম কিছুটা কম পড়ে।',
        'Buying by the dozen or tray usually lowers the per-hali price.',
      ],
    ],
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['ডিম', 'Eggs'],
    unit: 'hali',
    image: U('1587486913049-53fc88980cfc'),
    popular: true,
    price: [48, 52],
    profile: 'stable',
  },
  {
    slug: 'deshi-egg',
    category: 'others',
    checklist: 'egg',
    name: ['দেশি মুরগির ডিম', 'Deshi chicken eggs'],
    alt: { bn: ['দেশি ডিম', 'দেশী ডিম'], en: ['Native eggs', 'Village eggs'] },
    short: ['ছোট আকারের ডিম, কুসুম গাঢ় রঙের।', 'Smaller eggs with deeper-coloured yolks.'],
    desc: [
      'দেশি মুরগির ডিম আকারে ছোট ও দামে বেশি। খোসা সাধারণত সাদাটে বা হালকা বাদামি।',
      'Deshi eggs are smaller and cost more; shells are usually off-white to pale brown.',
    ],
    ident: [
      'ছোট, হালকা সাদাটে খোসা; ভাঙলে কুসুম গাঢ় কমলা-হলুদ।',
      'Small with off-white shells; the yolk is a deep orange-yellow.',
    ],
    tips: [
      [
        'ফার্মের ছোট ডিম দেশি বলে বিক্রি হচ্ছে কি না সতর্ক থাকুন।',
        'Be careful that small farm eggs are not sold as deshi.',
      ],
    ],
    season: ['সারা বছর, তবে সরবরাহ সীমিত।', 'Year-round but in limited supply.'],
    variety: ['ডিম', 'Eggs'],
    unit: 'hali',
    price: [75, 85],
    profile: 'stable',
  },
]
