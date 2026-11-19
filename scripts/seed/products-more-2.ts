import type { SeedProduct } from './products'

type FruitInput = {
  slug: string
  name: [string, string]
  alt: [string[], string[]]
  short: [string, string]
  desc: [string, string]
  ident: [string, string]
  tips: [string, string][]
  season: [string, string]
  months?: number[]
  onlyMonths?: number[]
  variety: [string, string]
  unit?: SeedProduct['unit']
  price: [number, number]
  popular?: boolean
}

const fruit = (f: FruitInput): SeedProduct => ({
  slug: f.slug,
  category: 'fruits',
  checklist: 'fruit',
  name: f.name,
  alt: { bn: f.alt[0], en: f.alt[1] },
  short: f.short,
  desc: f.desc,
  ident: f.ident,
  tips: f.tips,
  season: f.season,
  months: f.months,
  onlyMonths: f.onlyMonths,
  variety: f.variety,
  unit: f.unit ?? 'kg',
  price: f.price,
  popular: f.popular,
  profile: f.onlyMonths ? 'veg' : 'stable',
})

const LOCAL: [string, string] = ['দেশি ফল', 'Local fruit']
const IMPORTED: [string, string] = ['আমদানি ফল', 'Imported fruit']

/** Additional fruits, spices, grains and other everyday bazar items. */
export const MORE_PRODUCTS_2: SeedProduct[] = [
  // ---------------- Fruits ----------------
  fruit({
    slug: 'papaya',
    name: ['পাকা পেঁপে', 'Ripe papaya'],
    alt: [['পেঁপে'], ['Papaya', 'Pawpaw']],
    short: ['সারা বছর পাওয়া যায় এমন মিষ্টি ফল।', 'A sweet fruit available all year.'],
    desc: [
      'দেশি পাকা পেঁপে হজমে সহায়ক ও ভিটামিন এ সমৃদ্ধ।',
      'Local ripe papaya is easy to digest and rich in vitamin A.',
    ],
    ident: [
      'লম্বাটে, খোসা হলুদ-কমলা ও সবুজ ছোপ; ভেতরে কমলা শাঁস ও কালো বীজ।',
      'Elongated with yellow-orange skin and green patches; orange flesh with black seeds.',
    ],
    tips: [
      [
        'গাছপাকা পেঁপের খোসায় হলুদ ভাব সমানভাবে ছড়ানো থাকে।',
        'Tree-ripened papaya has yellow spread evenly over the skin.',
      ],
      [
        'বাইরে হলুদ কিন্তু খুব শক্ত হলে কার্বাইড দিয়ে পাকানো হতে পারে।',
        'Yellow outside but very hard may mean it was ripened with carbide.',
      ],
    ],
    season: ['সারা বছর।', 'Year-round.'],
    variety: LOCAL,
    price: [80, 110],
  }),
  fruit({
    slug: 'jackfruit',
    name: ['কাঁঠাল', 'Jackfruit'],
    alt: [['কাঁঠাল'], ['Kathal', 'Jack']],
    short: ['বাংলাদেশের জাতীয় ফল।', 'The national fruit of Bangladesh.'],
    desc: [
      'কাঁঠাল পিস হিসেবে বিক্রি হয়। খাজা কাঁঠালের কোষ শক্ত, গালা কাঁঠালের কোষ নরম ও রসালো।',
      'Sold by the piece. Khaja jackfruit has firm bulbs; gala has soft, juicy ones.',
    ],
    ident: [
      'বিশাল আকার, সবুজ-হলুদ খসখসে কাঁটাযুক্ত খোসা; ভেতরে হলুদ কোষ ও বড় বীজ।',
      'Huge, with rough, spiky green-yellow skin and yellow bulbs around large seeds.',
    ],
    tips: [
      [
        'পাকা কাঁঠালে মিষ্টি গন্ধ আসে এবং চাপ দিলে হালকা দেবে যায়।',
        'A ripe jackfruit smells sweet and gives slightly when pressed.',
      ],
      ['আঙুল দিয়ে টোকা দিলে ভোঁতা আওয়াজ হলে পাকা।', 'A dull sound when tapped means it is ripe.'],
    ],
    season: ['মে থেকে আগস্ট।', 'May to August.'],
    months: [5, 6, 7],
    onlyMonths: [5, 6, 7, 8],
    variety: LOCAL,
    unit: 'piece',
    price: [150, 400],
    popular: true,
  }),
  fruit({
    slug: 'litchi',
    name: ['লিচু', 'Litchi'],
    alt: [
      ['লিচু', 'বোম্বাই লিচু'],
      ['Lychee', 'Lichu'],
    ],
    short: [
      'দিনাজপুর ও রাজশাহীর বিখ্যাত গ্রীষ্মকালীন ফল।',
      'A famous summer fruit from Dinajpur and Rajshahi.',
    ],
    desc: [
      'লিচু ১০০টি হিসেবে বিক্রি হয়; বোম্বাই ও চায়না-৩ জাত জনপ্রিয়।',
      'Sold in hundreds; Bombai and China-3 varieties are popular.',
    ],
    ident: [
      'ছোট গোল ফল, খসখসে লাল-গোলাপি খোসা; ভেতরে সাদা রসালো শাঁস ও বাদামি বীজ।',
      'Small and round with rough red-pink skin; white juicy flesh around a brown seed.',
    ],
    tips: [
      [
        'উজ্জ্বল লাল ও শক্ত খোসার লিচু নিন; কালচে হলে বাসি।',
        'Pick bright red, firm litchis; darkened skin means they are old.',
      ],
      [
        'ডালে পাতা সবুজ থাকলে লিচু সদ্য পাড়া।',
        'Green leaves on the stems mean they were picked recently.',
      ],
    ],
    season: ['মে-জুন।', 'May–June.'],
    months: [5, 6],
    onlyMonths: [5, 6],
    variety: LOCAL,
    unit: 'dozen',
    price: [60, 100],
  }),
  fruit({
    slug: 'green-coconut',
    name: ['ডাব', 'Green coconut'],
    alt: [
      ['ডাবের পানি', 'কচি নারকেল'],
      ['Dab', 'Tender coconut'],
    ],
    short: ['গরমে তেষ্টা মেটানো প্রাকৃতিক পানীয়।', 'A natural drink for hot days.'],
    desc: [
      'ডাব পিস হিসেবে বিক্রি হয়; আকার ও পানির পরিমাণ অনুযায়ী দাম।',
      'Sold by the piece; price depends on size and how much water it holds.',
    ],
    ident: [
      'সবুজ মসৃণ খোসা, ভেতরে মিষ্টি পানি ও নরম শাঁস।',
      'Smooth green husk with sweet water and soft flesh inside.',
    ],
    tips: [
      [
        'ঝাঁকালে পানির আওয়াজ কম হলে ডাব পানিতে ভরা।',
        'A full coconut makes little sloshing sound when shaken.',
      ],
    ],
    season: ['সারা বছর, গ্রীষ্মে চাহিদা বেশি।', 'Year-round, in high demand in summer.'],
    variety: LOCAL,
    unit: 'piece',
    price: [80, 130],
  }),
  fruit({
    slug: 'coconut',
    name: ['ঝুনা নারকেল', 'Mature coconut'],
    alt: [
      ['নারকেল', 'নারিকেল'],
      ['Coconut', 'Narkel'],
    ],
    short: ['পিঠা ও রান্নায় ব্যবহৃত পাকা নারকেল।', 'A mature coconut used in pitha and cooking.'],
    desc: [
      'ঝুনা নারকেলের শাঁস কুরিয়ে পিঠা, মিষ্টি ও তরকারিতে দেওয়া হয়।',
      'The grated flesh goes into pitha, sweets and curries.',
    ],
    ident: [
      'শক্ত বাদামি খোসা ও আঁশ; ঝাঁকালে ভেতরে পানির আওয়াজ।',
      'A hard brown shell and fibre; water sloshes inside when shaken.',
    ],
    tips: [
      [
        'ঝাঁকালে পানির আওয়াজ হয় এবং চোখগুলো শুকনো এমন নারকেল নিন।',
        'Pick one that sloshes and has dry, mould-free eyes.',
      ],
    ],
    season: ['সারা বছর।', 'Year-round.'],
    variety: LOCAL,
    unit: 'piece',
    price: [90, 130],
  }),
  fruit({
    slug: 'apple',
    name: ['আপেল', 'Apple'],
    alt: [
      ['লাল আপেল', 'সবুজ আপেল'],
      ['Red apple', 'Fuji apple'],
    ],
    short: [
      'চীন, দক্ষিণ আফ্রিকা ও ভারত থেকে আমদানি।',
      'Imported from China, South Africa and India.',
    ],
    desc: ['বাজারে ফুজি, গালা ও সবুজ আপেল পাওয়া যায়।', 'Fuji, Gala and green apples are common.'],
    ident: [
      'গোল, মসৃণ চকচকে লাল বা সবুজ খোসা; ভেতরে সাদা কচকচে শাঁস।',
      'Round with smooth, shiny red or green skin and crisp white flesh.',
    ],
    tips: [
      [
        'শক্ত ও ভারী আপেল নিন; নরম হলে ভেতরে ময়দার মতো।',
        'Choose firm, heavy apples; soft ones are mealy.',
      ],
      [
        'অতিরিক্ত চকচকে মোম লাগানো থাকতে পারে — ভালো করে ধুয়ে খান।',
        'Very shiny apples may be waxed — wash them well.',
      ],
    ],
    season: ['সারা বছর।', 'Year-round.'],
    variety: IMPORTED,
    price: [250, 320],
    popular: true,
  }),
  fruit({
    slug: 'orange',
    name: ['কমলা', 'Orange (mandarin)'],
    alt: [['কমলালেবু'], ['Mandarin', 'Komola']],
    short: ['শীতের রসালো ফল।', 'A juicy winter fruit.'],
    desc: [
      'শীতে দেশি ও আমদানি কমলা পাওয়া যায়; পঞ্চগড় ও সিলেটে চাষ হয়।',
      'Local and imported oranges appear in winter; grown in Panchagarh and Sylhet.',
    ],
    ident: [
      'ছোট গোল, ঢিলা কমলা খোসা যা সহজে ছাড়ানো যায়; ভেতরে কোয়া।',
      'Small and round with loose orange peel that comes off easily, segmented inside.',
    ],
    tips: [['আকারের তুলনায় ভারী কমলায় রস বেশি।', 'Oranges heavy for their size are juicier.']],
    season: ['নভেম্বর থেকে ফেব্রুয়ারি।', 'November to February.'],
    months: [11, 12, 1, 2],
    variety: IMPORTED,
    price: [220, 300],
  }),
  fruit({
    slug: 'pomegranate',
    name: ['আনার (ডালিম)', 'Pomegranate'],
    alt: [
      ['ডালিম', 'বেদানা'],
      ['Anar', 'Dalim'],
    ],
    short: ['লাল রসালো দানার ফল।', 'A fruit full of juicy red seeds.'],
    desc: [
      'বাজারের বেশিরভাগ আনার ভারত ও আফগানিস্তান থেকে আসে।',
      'Most pomegranates come from India and Afghanistan.',
    ],
    ident: [
      'গোল, শক্ত লাল-গোলাপি খোসা, মাথায় মুকুটের মতো বোঁটা; ভেতরে লাল দানা।',
      'Round with tough red-pink skin and a crown on top; red seeds inside.',
    ],
    tips: [
      ['ভারী, শক্ত ও খোসায় ফাটল নেই এমন আনার নিন।', 'Choose heavy, firm fruit with no cracks.'],
    ],
    season: ['সারা বছর, শীতে বেশি।', 'Year-round, more in winter.'],
    variety: IMPORTED,
    price: [400, 550],
  }),
  fruit({
    slug: 'grapes',
    name: ['আঙুর', 'Grapes'],
    alt: [
      ['আঙ্গুর', 'কালো আঙুর', 'সবুজ আঙুর'],
      ['Green grapes', 'Black grapes'],
    ],
    short: ['আমদানি করা সবুজ, কালো ও লাল আঙুর।', 'Imported green, black and red grapes.'],
    desc: ['ভারত, চীন ও দক্ষিণ আফ্রিকা থেকে আসে।', 'Comes from India, China and South Africa.'],
    ident: [
      'থোকায় ঝোলানো ছোট গোল বা ডিম্বাকার রসালো ফল।',
      'Small round or oval juicy berries in bunches.',
    ],
    tips: [
      [
        'বোঁটা সবুজ ও দানা শক্তভাবে লেগে থাকা থোকা নিন।',
        'Pick bunches with green stems and firmly attached grapes.',
      ],
    ],
    season: ['সারা বছর।', 'Year-round.'],
    variety: IMPORTED,
    price: [350, 450],
  }),
  fruit({
    slug: 'dates',
    name: ['খেজুর', 'Dates'],
    alt: [
      ['আজওয়া', 'মরিয়ম খেজুর'],
      ['Khejur', 'Ajwa', 'Mariam dates'],
    ],
    short: ['রমজানে চাহিদার শীর্ষে থাকা শুকনো ফল।', 'A dried fruit in peak demand during Ramadan.'],
    desc: [
      'সৌদি আরব, ইরাক ও আমিরাত থেকে নানা জাতের খেজুর আসে; জাতভেদে দামের বিশাল পার্থক্য।',
      'Many types come from Saudi Arabia, Iraq and the UAE; prices vary hugely by type.',
    ],
    ident: [
      'লম্বাটে, বাদামি থেকে কালো, কোঁচকানো খোসা ও ভেতরে একটি লম্বা বীজ।',
      'Oblong, brown to black, wrinkled skin with a single long seed.',
    ],
    tips: [
      [
        'চিনির সিরা মাখানো চকচকে খেজুর এড়িয়ে চলুন।',
        'Avoid dates that look glossy with added syrup.',
      ],
      ['পোকা বা ছত্রাক আছে কিনা একটা খুলে দেখুন।', 'Open one to check for insects or mould.'],
    ],
    season: ['সারা বছর; রমজানে চাহিদা বেশি।', 'Year-round; demand spikes in Ramadan.'],
    variety: IMPORTED,
    price: [450, 900],
  }),
  fruit({
    slug: 'jujube',
    name: ['বরই (কুল)', 'Jujube (boroi)'],
    alt: [
      ['কুল', 'বরই', 'আপেল কুল', 'নারকেলি কুল'],
      ['Indian jujube', 'Kul', 'Ber'],
    ],
    short: ['শীতের টক-মিষ্টি ফল।', 'A sweet-sour winter fruit.'],
    desc: [
      'আপেল কুল, বাউ কুল ও নারকেলি কুল জনপ্রিয়; দেশি টক কুল আচারে ব্যবহার হয়।',
      'Apple kul, BAU kul and narkeli kul are popular; sour local kul is used for pickles.',
    ],
    ident: [
      'ছোট গোল বা লম্বাটে, সবুজ থেকে হলুদ-লালচে মসৃণ খোসা, ভেতরে শক্ত বীজ।',
      'Small, round or oval, smooth green to yellow-red skin with a hard stone.',
    ],
    tips: [
      [
        'শক্ত ও উজ্জ্বল কুল নিন; কোঁচকানো হলে বাসি।',
        'Pick firm, bright fruit; wrinkled ones are old.',
      ],
    ],
    season: ['জানুয়ারি থেকে মার্চ।', 'January to March.'],
    months: [1, 2, 3],
    onlyMonths: [12, 1, 2, 3],
    variety: LOCAL,
    price: [100, 160],
  }),
  fruit({
    slug: 'lemon',
    name: ['লেবু', 'Lemon'],
    alt: [
      ['কাগজি লেবু', 'এলাচি লেবু', 'কলম্বো লেবু'],
      ['Lime', 'Lebu'],
    ],
    short: ['হালি হিসেবে বিক্রি হওয়া টক ফল।', 'A sour fruit sold by the hali.'],
    desc: [
      'কাগজি, এলাচি ও কলম্বো লেবু সবচেয়ে প্রচলিত।',
      'Kagoji, elachi and Colombo lemons are most common.',
    ],
    ident: [
      'ছোট গোল বা ডিম্বাকার, সবুজ থেকে হলুদ চকচকে খোসা।',
      'Small, round or oval with glossy green-to-yellow skin.',
    ],
    tips: [
      [
        'পাতলা খোসা ও হাতে নরম-ভারী লেবুতে রস বেশি।',
        'Thin-skinned lemons that feel soft and heavy are juiciest.',
      ],
    ],
    season: ['সারা বছর, বর্ষায় সবচেয়ে বেশি।', 'Year-round, most in the monsoon.'],
    variety: LOCAL,
    unit: 'hali',
    price: [30, 50],
  }),
  fruit({
    slug: 'hog-plum',
    name: ['আমড়া', 'Hog plum (amra)'],
    alt: [['আমড়া'], ['Amra', 'Ambarella']],
    short: ['টক-মিষ্টি কচকচে ফল।', 'A crunchy sweet-sour fruit.'],
    desc: [
      'আমড়া কাঁচা লবণ-মরিচ দিয়ে বা আচার করে খাওয়া হয়।',
      'Eaten raw with salt and chilli, or pickled.',
    ],
    ident: [
      'ডিম্বাকার, সবুজ থেকে হলুদ খোসা, ভেতরে আঁশযুক্ত শক্ত আঁটি।',
      'Oval with green-to-yellow skin and a fibrous, spiky stone.',
    ],
    tips: [
      [
        'সবুজ ও শক্ত আমড়া কচকচে; হলুদ হলে নরম ও মিষ্টি।',
        'Green, firm amra is crunchy; yellow ones are soft and sweeter.',
      ],
    ],
    season: ['আগস্ট থেকে নভেম্বর।', 'August to November.'],
    months: [8, 9, 10],
    onlyMonths: [8, 9, 10, 11],
    variety: LOCAL,
    price: [60, 80],
  }),
  fruit({
    slug: 'black-plum',
    name: ['কালোজাম', 'Black plum (jamun)'],
    alt: [
      ['জাম', 'কালো জাম'],
      ['Jamun', 'Java plum'],
    ],
    short: ['গ্রীষ্মের বেগুনি-কালো রসালো ফল।', 'A juicy purple-black summer fruit.'],
    desc: [
      'কালোজাম খেলে জিভ বেগুনি হয়ে যায়; দ্রুত নষ্ট হয়।',
      'It stains the tongue purple and spoils quickly.',
    ],
    ident: [
      'ছোট ডিম্বাকার, চকচকে গাঢ় বেগুনি-কালো খোসা, ভেতরে একটি বীজ।',
      'Small and oval with glossy deep purple-black skin and one seed.',
    ],
    tips: [['থেঁতলানো বা রস বের হওয়া জাম এড়িয়ে চলুন।', 'Avoid bruised or leaking fruit.']],
    season: ['জুন-জুলাই।', 'June–July.'],
    months: [6, 7],
    onlyMonths: [6, 7],
    variety: LOCAL,
    price: [200, 300],
  }),
  fruit({
    slug: 'wood-apple',
    name: ['বেল', 'Wood apple (bael)'],
    alt: [['বেল'], ['Bael', 'Bengal quince']],
    short: ['শরবতের জন্য বিখ্যাত শক্ত খোসার ফল।', 'A hard-shelled fruit famous for sherbet.'],
    desc: [
      'পাকা বেলের শরবত গরমে জনপ্রিয় ও হজমে সহায়ক।',
      'Bael sherbet is popular in summer and aids digestion.',
    ],
    ident: [
      'গোল, কাঠের মতো শক্ত সবুজ-হলুদ খোসা; ভেতরে হলুদ-কমলা আঠালো শাঁস।',
      'Round with a wood-hard green-yellow shell; sticky yellow-orange pulp inside.',
    ],
    tips: [
      ['খোসা হলুদ ও মিষ্টি গন্ধ এলে বেল পাকা।', 'A yellow shell and sweet smell mean it is ripe.'],
    ],
    season: ['মার্চ থেকে মে।', 'March to May.'],
    months: [3, 4, 5],
    onlyMonths: [3, 4, 5],
    variety: LOCAL,
    unit: 'piece',
    price: [60, 120],
  }),
  fruit({
    slug: 'sapodilla',
    name: ['সফেদা', 'Sapodilla'],
    alt: [['সফেদা'], ['Chikoo', 'Sofeda']],
    short: ['মধুর মতো মিষ্টি বাদামি ফল।', 'A honey-sweet brown fruit.'],
    desc: ['সফেদা নরম হলে খাওয়ার উপযোগী হয়।', 'Sapodilla is ready to eat once soft.'],
    ident: [
      'ছোট ডিম্বাকার, বাদামি খসখসে খোসা (আলুর মতো); ভেতরে বাদামি দানাদার শাঁস ও কালো বীজ।',
      'Small and oval with rough brown, potato-like skin; grainy brown flesh with black seeds.',
    ],
    tips: [
      ['আঙুলে হালকা চাপে দেবে যায় এমন সফেদা পাকা।', 'Ripe ones give slightly to finger pressure.'],
    ],
    season: ['বর্ষা থেকে শরৎ।', 'Monsoon to autumn.'],
    months: [7, 8, 9, 10],
    variety: LOCAL,
    price: [120, 160],
  }),
  fruit({
    slug: 'custard-apple',
    name: ['আতা', 'Custard apple'],
    alt: [
      ['আতা', 'শরিফা'],
      ['Sugar apple', 'Sharifa', 'Ata'],
    ],
    short: ['ক্রিমের মতো মিষ্টি শাঁসের ফল।', 'A fruit with sweet, creamy flesh.'],
    desc: [
      'আতা পাকলে খোসার খোপগুলো আলাদা হয়ে যায়।',
      'When ripe, the bumpy segments of the skin separate.',
    ],
    ident: [
      'গোল, সবুজ খোসায় খোপ খোপ উঁচু অংশ; ভেতরে সাদা ক্রিমি শাঁস ও কালো বীজ।',
      'Round with knobbly green segmented skin; white creamy flesh and black seeds.',
    ],
    tips: [
      [
        'খোপের মাঝে হলদে-সাদা রেখা দেখা দিলে পাকা।',
        'Pale lines between the segments mean it is ripe.',
      ],
    ],
    season: ['আগস্ট থেকে অক্টোবর।', 'August to October.'],
    months: [8, 9, 10],
    onlyMonths: [8, 9, 10],
    variety: LOCAL,
    price: [150, 220],
  }),
  fruit({
    slug: 'star-fruit',
    name: ['কামরাঙা', 'Star fruit'],
    alt: [['কামরাঙ্গা'], ['Carambola', 'Kamranga']],
    short: [
      'কাটলে তারার মতো দেখায় টক-মিষ্টি ফল।',
      'A sweet-sour fruit that is star-shaped when sliced.',
    ],
    desc: ['কামরাঙা কাঁচা বা ডালে দিয়ে খাওয়া হয়।', 'Eaten raw or cooked in dal.'],
    ident: [
      'পাঁচ শিরাওয়ালা লম্বাটে মোমের মতো চকচকে সবুজ-হলুদ ফল।',
      'An oblong, waxy green-yellow fruit with five ridges.',
    ],
    tips: [
      [
        'শিরার কিনারা বাদামি না হওয়া উজ্জ্বল ফল নিন।',
        'Pick bright fruit without browned ridge edges.',
      ],
    ],
    season: ['শরৎ ও শীত।', 'Autumn and winter.'],
    months: [9, 10, 11, 12],
    variety: LOCAL,
    price: [80, 120],
  }),
  fruit({
    slug: 'olive',
    name: ['জলপাই', 'Indian olive (jolpai)'],
    alt: [['জলপাই'], ['Jolpai', 'Ceylon olive']],
    short: ['আচার ও টক ডালের জন্য শীতের ফল।', 'A winter fruit for pickles and sour dal.'],
    desc: [
      'দেশি জলপাই খুব টক; আচার ও চাটনিতে ব্যবহৃত হয়।',
      'Local jolpai is very sour and used in pickles and chutneys.',
    ],
    ident: [
      'ডিম্বাকার, মসৃণ সবুজ খোসা, ভেতরে শক্ত খাঁজকাটা আঁটি।',
      'Oval with smooth green skin and a hard, ridged stone.',
    ],
    tips: [
      [
        'দাগহীন উজ্জ্বল সবুজ জলপাই আচারের জন্য সেরা।',
        'Spotless bright green olives are best for pickling.',
      ],
    ],
    season: ['সেপ্টেম্বর থেকে ডিসেম্বর।', 'September to December.'],
    months: [9, 10, 11, 12],
    onlyMonths: [9, 10, 11, 12],
    variety: LOCAL,
    price: [80, 120],
  }),
  fruit({
    slug: 'burmese-grape',
    name: ['লটকন', 'Burmese grape (lotkon)'],
    alt: [
      ['লটকন', 'বুবি'],
      ['Lotkon', 'Latkan'],
    ],
    short: ['নরসিংদীর বিখ্যাত টক-মিষ্টি ফল।', 'A sweet-sour fruit famous in Narsingdi.'],
    desc: ['লটকন গাছের কাণ্ডে থোকায় থোকায় ধরে।', 'It grows in clusters on the tree trunk.'],
    ident: [
      'ছোট গোল, মসৃণ হলুদ খোসা; ভেতরে সাদা রসালো কোয়া।',
      'Small and round with smooth yellow skin and white juicy segments.',
    ],
    tips: [
      ['উজ্জ্বল হলুদ ও দাগহীন লটকন বেশি মিষ্টি।', 'Bright yellow, spotless fruit is sweeter.'],
    ],
    season: ['জুলাই-আগস্ট।', 'July–August.'],
    months: [7, 8],
    onlyMonths: [7, 8],
    variety: LOCAL,
    price: [120, 180],
  }),
  fruit({
    slug: 'pomelo',
    name: ['জাম্বুরা', 'Pomelo'],
    alt: [
      ['বাতাবি লেবু', 'জাম্বুরা'],
      ['Batabi lebu', 'Shaddock'],
    ],
    short: ['সবচেয়ে বড় লেবুজাতীয় ফল।', 'The largest citrus fruit.'],
    desc: [
      'জাম্বুরা লবণ-মরিচ দিয়ে মাখিয়ে খাওয়া জনপ্রিয়।',
      'Popular mixed with salt and chilli.',
    ],
    ident: [
      'বড় গোল, মোটা সবুজ-হলুদ খোসা; ভেতরে গোলাপি বা সাদা কোয়া।',
      'Large and round with thick green-yellow peel; pink or white segments inside.',
    ],
    tips: [
      ['আকারের তুলনায় ভারী জাম্বুরায় রস বেশি।', 'Pomelos heavy for their size are juicier.'],
    ],
    season: ['আগস্ট থেকে অক্টোবর।', 'August to October.'],
    months: [8, 9, 10],
    variety: LOCAL,
    unit: 'piece',
    price: [60, 100],
  }),
  fruit({
    slug: 'palm-fruit',
    name: ['তাল', 'Palmyra palm fruit'],
    alt: [
      ['তাল', 'তালের শাঁস'],
      ['Tal', 'Toddy palm', 'Ice apple'],
    ],
    short: ['কচি শাঁস ও পাকা রস দুই রূপেই খাওয়া হয়।', 'Eaten as young jelly or as ripe pulp.'],
    desc: [
      'কচি তালের শাঁস গ্রীষ্মে, পাকা তাল ভাদ্র মাসে পিঠার জন্য।',
      'Young jelly-like kernels in summer; ripe tal in Bhadra for pitha.',
    ],
    ident: [
      'গোল, কালো-বেগুনি শক্ত খোসা; কচি তালে স্বচ্ছ জেলির মতো শাঁস।',
      'Round with hard black-purple skin; young fruit holds clear jelly-like kernels.',
    ],
    tips: [['পাকা তালে তীব্র মিষ্টি গন্ধ আসে।', 'Ripe tal has a strong sweet smell.']],
    season: ['মে থেকে সেপ্টেম্বর।', 'May to September.'],
    months: [5, 6, 8, 9],
    onlyMonths: [5, 6, 7, 8, 9],
    variety: LOCAL,
    unit: 'piece',
    price: [60, 100],
  }),
  fruit({
    slug: 'dragon-fruit',
    name: ['ড্রাগন ফল', 'Dragon fruit'],
    alt: [['ড্রাগন'], ['Pitaya', 'Pitahaya']],
    short: ['এখন দেশেই চাষ হওয়া উজ্জ্বল গোলাপি ফল।', 'A bright pink fruit now grown locally.'],
    desc: [
      'ড্রাগন ফলের শাঁস লাল বা সাদা হয়; লাল শাঁসের দাম বেশি।',
      'The flesh is red or white; red-fleshed fruit costs more.',
    ],
    ident: [
      'উজ্জ্বল গোলাপি খোসায় সবুজ ডগার পাপড়ির মতো অংশ; ভেতরে কালো ছোট বীজ।',
      'Bright pink skin with green-tipped scales; flesh dotted with tiny black seeds.',
    ],
    tips: [
      ['সমান রঙের ও হালকা নরম ফল পাকা।', 'Evenly coloured, slightly soft fruit is ripe.'],
      [
        'অস্বাভাবিক বড় ও ফ্যাকাশে ফলে হরমোন প্রয়োগ হয়ে থাকতে পারে।',
        'Unusually large, pale fruit may have been grown with hormones.',
      ],
    ],
    season: ['জুন থেকে নভেম্বর।', 'June to November.'],
    months: [6, 7, 8, 9, 10],
    variety: LOCAL,
    price: [250, 350],
  }),
  fruit({
    slug: 'pear',
    name: ['নাশপাতি', 'Pear'],
    alt: [['নাশপাতি'], ['Nashpati', 'Chinese pear']],
    short: ['আমদানি করা রসালো কচকচে ফল।', 'An imported juicy, crisp fruit.'],
    desc: [
      'চীন থেকে আসা হলুদ নাশপাতি সবচেয়ে বেশি দেখা যায়।',
      'Yellow Chinese pears are the most common.',
    ],
    ident: [
      'গোল বা নাশপাতি আকৃতির, হলুদ-সবুজ খোসায় ছোট ছোট বাদামি ফোঁটা।',
      'Round or pear-shaped with yellow-green skin speckled brown.',
    ],
    tips: [['থেঁতলানো দাগহীন শক্ত নাশপাতি নিন।', 'Choose firm pears without bruises.']],
    season: ['সারা বছর।', 'Year-round.'],
    variety: IMPORTED,
    price: [250, 320],
  }),
  fruit({
    slug: 'strawberry',
    name: ['স্ট্রবেরি', 'Strawberry'],
    alt: [['স্ট্রবেরি'], ['Strawberries']],
    short: ['শীতে দেশে চাষ হওয়া লাল ফল।', 'A red fruit grown locally in winter.'],
    desc: [
      'রাজশাহী, সাভার ও চট্টগ্রামে চাষ হয়; বাক্সে বিক্রি হয়।',
      'Grown in Rajshahi, Savar and Chattogram and sold in boxes.',
    ],
    ident: [
      'হৃৎপিণ্ড আকৃতির উজ্জ্বল লাল ফল, গায়ে ছোট হলুদ বীজ ও সবুজ বোঁটা।',
      'Heart-shaped bright red fruit dotted with yellow seeds and a green cap.',
    ],
    tips: [
      [
        'বাক্সের তলায় থেঁতলানো বা ছত্রাক পড়া ফল আছে কিনা দেখুন।',
        'Check the bottom of the box for squashed or mouldy berries.',
      ],
    ],
    season: ['ডিসেম্বর থেকে মার্চ।', 'December to March.'],
    months: [12, 1, 2, 3],
    onlyMonths: [12, 1, 2, 3],
    variety: LOCAL,
    price: [400, 600],
  }),
  fruit({
    slug: 'amloki',
    name: ['আমলকী', 'Indian gooseberry (amloki)'],
    alt: [['আমলকি'], ['Amla', 'Amloki']],
    short: ['ভিটামিন সি-তে ভরপুর টক-কষা ফল।', 'A sour, astringent fruit packed with vitamin C.'],
    desc: ['কাঁচা, আচার বা মোরব্বা করে খাওয়া হয়।', 'Eaten raw, pickled or as morabba.'],
    ident: [
      'ছোট গোল, হালকা সবুজ স্বচ্ছাভ খোসায় ছয়টি অস্পষ্ট শিরা।',
      'Small and round, pale translucent green with six faint lines.',
    ],
    tips: [['শক্ত, দাগহীন ও উজ্জ্বল আমলকী নিন।', 'Pick firm, spotless, bright fruit.']],
    season: ['অক্টোবর থেকে জানুয়ারি।', 'October to January.'],
    months: [10, 11, 12, 1],
    onlyMonths: [10, 11, 12, 1],
    variety: LOCAL,
    price: [100, 150],
  }),
  fruit({
    slug: 'sabri-banana',
    name: ['সবরি কলা', 'Sabri banana'],
    alt: [
      ['সবরি', 'চাঁপা কলা', 'অমৃতসাগর'],
      ['Sabri kola', 'Champa banana'],
    ],
    short: ['ছোট, সুগন্ধি দেশি কলা।', 'A small, fragrant local banana.'],
    desc: [
      'সবরি কলা সাগর কলার চেয়ে ছোট ও বেশি সুগন্ধি; হালি হিসেবে বিক্রি হয়।',
      'Smaller and more fragrant than sagor kola, sold by the hali.',
    ],
    ident: [
      'ছোট মোটা কলা, পাতলা হলুদ খোসা যাতে পাকলে কালো ফোঁটা পড়ে।',
      'Short and plump with thin yellow skin that freckles when ripe.',
    ],
    tips: [
      [
        'বোঁটা শক্ত ও খোসায় অল্প কালো ফোঁটা থাকা কলা সবচেয়ে মিষ্টি।',
        'Bananas with firm stems and a few dark freckles are sweetest.',
      ],
    ],
    season: ['সারা বছর।', 'Year-round.'],
    variety: LOCAL,
    unit: 'hali',
    price: [40, 50],
  }),
  fruit({
    slug: 'kiwi',
    name: ['কিউই', 'Kiwi'],
    alt: [['কিউই ফল'], ['Kiwifruit']],
    short: [
      'আমদানি করা টক-মিষ্টি সবুজ শাঁসের ফল।',
      'An imported sweet-sour fruit with green flesh.',
    ],
    desc: [
      'নিউজিল্যান্ড ও চীন থেকে আসে; পিস হিসেবে বিক্রি হয়।',
      'Imported from New Zealand and China and sold by the piece.',
    ],
    ident: [
      'ছোট ডিম্বাকার, বাদামি লোমশ খোসা; ভেতরে উজ্জ্বল সবুজ শাঁস ও কালো বীজ।',
      'Small and oval with fuzzy brown skin; bright green flesh with black seeds.',
    ],
    tips: [
      [
        'হালকা চাপে সামান্য দেবে যায় এমন কিউই খাওয়ার উপযোগী।',
        'Ready to eat when it gives slightly to pressure.',
      ],
    ],
    season: ['সারা বছর।', 'Year-round.'],
    variety: IMPORTED,
    unit: 'piece',
    price: [50, 70],
  }),

  // ---------------- Spices ----------------
  ...(
    [
      [
        'turmeric',
        'হলুদ (আস্ত)',
        'Turmeric (whole)',
        ['হলুদ', 'কাঁচা হলুদ'],
        ['Haldi', 'Holud'],
        'রান্নার রং ও স্বাদের মূল মসলা।',
        'The core spice for colour and flavour.',
        'শুকনো আঙুলের মতো শক্ত গিঁটযুক্ত মূল, বাইরে হলদে-বাদামি, ভাঙলে ভেতরে গাঢ় কমলা-হলুদ।',
        'Hard, knobbly finger-like dried roots, yellow-brown outside and deep orange-yellow inside.',
        [
          [
            'আস্ত হলুদ কিনে ভাঙিয়ে নিলে ভেজাল গুঁড়ার ঝুঁকি থাকে না।',
            'Buy whole turmeric and grind it to avoid adulterated powder.',
          ],
          [
            'অস্বাভাবিক উজ্জ্বল গুঁড়া হলুদে রং মেশানো থাকতে পারে — পানিতে দিলে রং আলাদা হয়ে যায়।',
            'Unnaturally bright powder may be dyed — the colour separates in water.',
          ],
        ],
        'kg',
        [280, 350],
      ],
      [
        'cumin',
        'জিরা',
        'Cumin seeds',
        ['জিরা', 'সাদা জিরা'],
        ['Jeera', 'Jira'],
        'ভাজা ও গুঁড়া করে ব্যবহৃত সুগন্ধি মসলা।',
        'A fragrant spice used roasted and ground.',
        'লম্বাটে সরু খাঁজকাটা বাদামি দানা; হাতে ঘষলে তীব্র ঘ্রাণ।',
        'Slim, ridged brown seeds with a strong aroma when rubbed.',
        [
          [
            'হাতে ঘষে দেখুন — রং উঠে এলে ভেজাল।',
            'Rub some in your palm — colour coming off means adulteration.',
          ],
          ['ঘাসের বীজ বা ধুলা মেশানো আছে কিনা দেখুন।', 'Watch for grass seeds or dust mixed in.'],
        ],
        'kg',
        [650, 800],
      ],
      [
        'cardamom',
        'এলাচ',
        'Green cardamom',
        ['এলাচি', 'ছোট এলাচ'],
        ['Elach', 'Elaichi'],
        'পোলাও, কোরমা ও চায়ের সুগন্ধি মসলা।',
        'The aromatic spice for pulao, korma and tea.',
        'ছোট সবুজ ডিম্বাকার খোসা, ভেতরে কালো সুগন্ধি দানা।',
        'Small green oval pods with black aromatic seeds inside.',
        [
          [
            'উজ্জ্বল সবুজ, পুষ্ট ও তীব্র ঘ্রাণের এলাচ নিন।',
            'Pick plump, bright green pods with a strong aroma.',
          ],
          [
            'ফ্যাকাশে ও ফাঁপা এলাচে তেল বের করে নেওয়া হতে পারে।',
            'Pale, hollow pods may have had their oil extracted.',
          ],
        ],
        '100g',
        [400, 550],
      ],
      ['cinnamon', 'দারুচিনি', 'Cinnamon', ['দারচিনি'], ['Darchini', 'Cassia']],
      ['bay-leaf', 'তেজপাতা', 'Bay leaf', ['তেজপাতা'], ['Tejpata', 'Indian bay leaf']],
      [
        'black-pepper',
        'গোলমরিচ',
        'Black pepper',
        ['গোল মরিচ', 'কালো মরিচ'],
        ['Gol morich', 'Peppercorn'],
      ],
      [
        'coriander-seed',
        'ধনিয়া (আস্ত)',
        'Coriander seeds',
        ['ধনে', 'ধনিয়া'],
        ['Dhonia', 'Dhania'],
      ],
      ['cloves', 'লবঙ্গ', 'Cloves', ['লং'], ['Labanga', 'Long']],
      ['fenugreek', 'মেথি', 'Fenugreek seeds', ['মেথি'], ['Methi']],
      [
        'nigella',
        'কালিজিরা',
        'Nigella seeds',
        ['কালোজিরা', 'কালো জিরা'],
        ['Kalijira', 'Black seed', 'Kalonji'],
      ],
    ] as const
  ).map(spiceFrom),

  // ---------------- Pulses & grains ----------------
  ...GRAINS(),

  // ---------------- Others ----------------
  {
    slug: 'duck-egg',
    category: 'others',
    checklist: 'egg',
    name: ['হাঁসের ডিম', 'Duck eggs'],
    alt: { bn: ['হাঁসের ডিম'], en: ['Duck egg'] },
    short: ['মুরগির ডিমের চেয়ে বড় ও কুসুম বেশি।', 'Bigger than chicken eggs with a larger yolk.'],
    desc: [
      'হাঁসের ডিম ভুনা ও ডিমের তরকারিতে জনপ্রিয়; হালি হিসেবে বিক্রি হয়।',
      'Popular in egg bhuna and curry; sold by the hali.',
    ],
    ident: [
      'বড়, খোসা সাদা বা হালকা নীলচে-সবুজ ও মোটা।',
      'Large with thick white or pale blue-green shells.',
    ],
    tips: [['ভালোভাবে সেদ্ধ বা রান্না করে খান।', 'Always cook duck eggs thoroughly.']],
    season: ['সারা বছর, শীতে বেশি।', 'Year-round, more in winter.'],
    variety: ['ডিম', 'Eggs'],
    unit: 'hali',
    price: [70, 80],
    profile: 'stable',
  },
  {
    slug: 'duck',
    category: 'others',
    checklist: 'poultry',
    name: ['হাঁস', 'Duck'],
    alt: { bn: ['দেশি হাঁস', 'পাতিহাঁস'], en: ['Deshi duck'] },
    short: ['শীতের ভুনার জন্য জনপ্রিয় হাঁস।', 'Duck, a winter favourite for bhuna.'],
    desc: [
      'হাঁস সাধারণত জীবিত অবস্থায় পিস বা কেজি দরে বিক্রি হয়।',
      'Usually sold live, per bird or per kg.',
    ],
    ident: [
      'চ্যাপ্টা ঠোঁট, জালযুক্ত পা ও সাদা, বাদামি বা ছোপ ছোপ পালক।',
      'A flat bill, webbed feet and white, brown or speckled feathers.',
    ],
    tips: [
      [
        'চঞ্চল, চোখ উজ্জ্বল ও পালক পরিষ্কার হাঁস নিন।',
        'Pick active birds with bright eyes and clean feathers.',
      ],
    ],
    season: ['শীতে চাহিদা বেশি।', 'Demand peaks in winter.'],
    months: [11, 12, 1, 2],
    variety: ['হাঁস', 'Duck'],
    unit: 'kg',
    price: [500, 600],
    profile: 'meat',
  },
  {
    slug: 'peanut',
    category: 'others',
    checklist: 'grain',
    name: ['চিনাবাদাম', 'Peanuts'],
    alt: { bn: ['বাদাম', 'চীনাবাদাম'], en: ['Groundnut', 'Badam'] },
    short: ['ভাজা বা কাঁচা বাদাম।', 'Roasted or raw peanuts.'],
    desc: ['খোসাসহ ও খোসা ছাড়া দুই রকমই পাওয়া যায়।', 'Sold both in the shell and shelled.'],
    ident: [
      'লম্বাটে বাদামি খোসা, ভেতরে লালচে পাতলা আবরণে দুটি দানা।',
      'Oblong brown shells holding two kernels in thin red skins.',
    ],
    tips: [
      [
        'তিতা বা ভ্যাপসা গন্ধের বাদাম খাবেন না — ছত্রাকের বিষ থাকতে পারে।',
        'Do not eat bitter or musty peanuts — they may carry mould toxins.',
      ],
    ],
    season: ['সারা বছর।', 'Year-round.'],
    variety: ['বাদাম', 'Nuts'],
    unit: 'kg',
    price: [180, 220],
    profile: 'stable',
  },
  {
    slug: 'honey',
    category: 'others',
    checklist: 'staple',
    name: ['মধু', 'Honey'],
    alt: {
      bn: ['খাঁটি মধু', 'সুন্দরবনের মধু', 'সরিষা ফুলের মধু'],
      en: ['Sundarbans honey', 'Mustard honey'],
    },
    short: ['সুন্দরবন, সরিষা ও লিচু ফুলের মধু।', 'Sundarbans, mustard-flower and litchi honey.'],
    desc: [
      'উৎসভেদে মধুর রং, ঘনত্ব ও দাম আলাদা। সরিষার মধু শীতে জমে যায় — এটি স্বাভাবিক।',
      'Colour, thickness and price vary by source. Mustard honey crystallises in winter — that is normal.',
    ],
    ident: [
      'ঘন সোনালি থেকে গাঢ় বাদামি তরল; প্রাকৃতিক ফুলের ঘ্রাণ।',
      'A thick golden to dark brown liquid with a natural floral scent.',
    ],
    tips: [
      [
        'জমে যাওয়া মানেই ভেজাল নয় — অনেক খাঁটি মধু জমে।',
        'Crystallised does not mean fake — many pure honeys set.',
      ],
      [
        'খুব কম দামের মধুতে চিনির সিরা মেশানো থাকতে পারে।',
        'Very cheap honey may be mixed with sugar syrup.',
      ],
    ],
    season: ['সারা বছর।', 'Year-round.'],
    variety: ['মধু', 'Honey'],
    unit: 'kg',
    price: [800, 1200],
    profile: 'stable',
  },
]

type SpiceRow = readonly [
  string,
  string,
  string,
  readonly string[],
  readonly string[],
  ...unknown[],
]

type SpiceDetail = {
  short: [string, string]
  ident: [string, string]
  tips: [string, string][]
  unit: SeedProduct['unit']
  price: [number, number]
}

// A function (hoisted) rather than a const, because MORE_PRODUCTS_2 is built above.
function spiceDetails(): Record<string, SpiceDetail> {
  return {
    cinnamon: {
      short: ['মিষ্টি-ঝাঁঝালো সুগন্ধের গাছের বাকল।', 'A sweet, warm-scented tree bark.'],
      ident: [
        'পাতলা বাদামি বাকল যা গুটিয়ে লাঠির মতো হয়েছে।',
        'Thin brown bark rolled into sticks.',
      ],
      tips: [
        [
          'বাজারের বেশিরভাগ দারুচিনি আসলে ক্যাসিয়া — মোটা ও শক্ত।',
          'Most market cinnamon is actually cassia — thicker and harder.',
        ],
        [
          'ভাঙলে তীব্র মিষ্টি ঘ্রাণ আসা দারুচিনি নিন।',
          'Choose sticks with a strong sweet smell when snapped.',
        ],
      ],
      unit: '100g',
      price: [55, 70],
    },
    'bay-leaf': {
      short: ['পোলাও-কোরমার সুগন্ধি পাতা।', 'A fragrant leaf for pulao and korma.'],
      ident: [
        'লম্বাটে শুকনো জলপাই-সবুজ পাতা, তিনটি লম্বা শিরা।',
        'Long, dried olive-green leaves with three lengthwise veins.',
      ],
      tips: [
        [
          'সবুজাভ ও অক্ষত পাতা নিন; বাদামি ভাঙা পাতায় ঘ্রাণ কম।',
          'Pick greenish, whole leaves; brown broken ones have little aroma.',
        ],
      ],
      unit: '100g',
      price: [20, 30],
    },
    'black-pepper': {
      short: ['ঝাঁঝালো কালো মসলা।', 'A pungent black spice.'],
      ident: ['ছোট গোল কালো কোঁচকানো দানা।', 'Small, round, wrinkled black berries.'],
      tips: [
        [
          'পেঁপের বীজ মেশানো থাকতে পারে — সেগুলো হালকা ও মসৃণ, পানিতে ভাসে।',
          'Papaya seeds are a common filler — they are lighter, smoother and float in water.',
        ],
      ],
      unit: '100g',
      price: [130, 170],
    },
    'coriander-seed': {
      short: ['গুঁড়া ধনের মূল উপাদান।', 'The base of ground coriander.'],
      ident: [
        'ছোট গোল হলদে-বাদামি দানা, গায়ে হালকা শিরা।',
        'Small, round yellow-brown seeds with faint ridges.',
      ],
      tips: [
        [
          'আস্ত কিনে ভেজে গুঁড়া করলে ঘ্রাণ বেশি থাকে।',
          'Buying whole and grinding after roasting keeps more aroma.',
        ],
      ],
      unit: 'kg',
      price: [220, 280],
    },
    cloves: {
      short: [
        'তীব্র ঘ্রাণের ছোট পেরেক আকৃতির মসলা।',
        'A small, nail-shaped spice with a strong aroma.',
      ],
      ident: [
        'পেরেকের মতো গাঢ় বাদামি শুকনো ফুলের কুঁড়ি, মাথা গোল।',
        'Dark brown dried flower buds shaped like nails with a round head.',
      ],
      tips: [
        [
          'নখ দিয়ে চাপ দিলে তেল বের হয় এমন লবঙ্গ তাজা।',
          'Fresh cloves release oil when pressed with a fingernail.',
        ],
      ],
      unit: '100g',
      price: [160, 200],
    },
    fenugreek: {
      short: [
        'হালকা তেতো স্বাদের পাঁচফোড়নের উপাদান।',
        'A slightly bitter seed used in panch phoron.',
      ],
      ident: ['ছোট চারকোনা হলদে-বাদামি শক্ত দানা।', 'Small, squarish, hard yellow-brown seeds.'],
      tips: [['পোকা ও ধুলামুক্ত শুকনো দানা নিন।', 'Pick dry seeds free of insects and dust.']],
      unit: 'kg',
      price: [180, 240],
    },
    nigella: {
      short: [
        'ভর্তা, আচার ও পাঁচফোড়নে ব্যবহৃত কালো দানা।',
        'Black seeds used in bhorta, pickles and panch phoron.',
      ],
      ident: ['ছোট তিনকোনা কুচকুচে কালো দানা।', 'Tiny, three-cornered jet-black seeds.'],
      tips: [
        [
          'পেঁয়াজ বীজ মেশানো থাকতে পারে — সেগুলো বড় ও কম ঘ্রাণের।',
          'Onion seeds are sometimes mixed in — they are bigger and less aromatic.',
        ],
      ],
      unit: 'kg',
      price: [350, 450],
    },
  }
}

function spiceFrom(row: SpiceRow): SeedProduct {
  const [slug, bn, en, altBn, altEn] = row
  const full = row.length > 5
  const d = full
    ? {
        short: [row[5], row[6]] as [string, string],
        ident: [row[7], row[8]] as [string, string],
        tips: row[9] as [string, string][],
        unit: row[10] as SeedProduct['unit'],
        price: row[11] as [number, number],
      }
    : spiceDetails()[slug]
  return {
    slug,
    category: 'spices',
    checklist: 'spice',
    name: [bn, en],
    alt: { bn: [...altBn], en: [...altEn] },
    short: d.short,
    desc: d.short,
    ident: d.ident,
    tips: d.tips,
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety: ['গুঁড়া ও আস্ত মসলা', 'Whole spices'],
    unit: d.unit,
    price: d.price,
    profile: 'stable',
  }
}

function GRAINS(): SeedProduct[] {
  const g = (
    slug: string,
    name: [string, string],
    alt: [string[], string[]],
    short: [string, string],
    ident: [string, string],
    tips: [string, string][],
    price: [number, number],
    variety: [string, string],
  ): SeedProduct => ({
    slug,
    category: 'pulses-grains',
    checklist: 'grain',
    name,
    alt: { bn: alt[0], en: alt[1] },
    short,
    desc: short,
    ident,
    tips,
    season: ['সারা বছর পাওয়া যায়।', 'Available year-round.'],
    variety,
    unit: 'kg',
    price,
    profile: 'stable',
  })
  const RICE: [string, string] = ['চাল', 'Rice']
  const DAL: [string, string] = ['ডাল', 'Lentils']
  const SNACK: [string, string] = ['চিড়া-মুড়ি', 'Flattened & puffed rice']
  return [
    g(
      'nazirshail-rice',
      ['নাজিরশাইল চাল', 'Nazirshail rice'],
      [['নাজির', 'নাজিরশাইল'], ['Nazirshail']],
      ['চিকন ও সাদা উন্নত মানের চাল।', 'A fine, white premium rice.'],
      [
        'লম্বা, সরু ও উজ্জ্বল সাদা দানা; রান্নার পর ঝরঝরে।',
        'Long, slim, bright white grains that cook up separate.',
      ],
      [
        [
          'অতিরিক্ত চকচকে চাল পলিশ করা — পুষ্টি কম।',
          'Very shiny rice has been over-polished and is less nutritious.',
        ],
        [
          'মোটা চাল কেটে চিকন বলে বিক্রি হচ্ছে কিনা দানার মাথা দেখে বুঝুন।',
          'Check grain ends — coarse rice is sometimes cut and sold as fine.',
        ],
      ],
      [80, 90],
      RICE,
    ),
    g(
      'chinigura-rice',
      ['চিনিগুঁড়া চাল', 'Chinigura rice'],
      [
        ['কালিজিরা চাল', 'পোলাওর চাল'],
        ['Polao rice', 'Aromatic rice', 'Kalijira rice'],
      ],
      [
        'পোলাও ও বিরিয়ানির ছোট দানার সুগন্ধি চাল।',
        'A small-grained aromatic rice for pulao and biryani.',
      ],
      [
        'খুব ছোট, গোলাটে সাদা দানা; মুঠোয় নিলে মিষ্টি সুগন্ধ।',
        'Very short, rounded white grains with a sweet aroma.',
      ],
      [
        ['নতুন মৌসুমের চালে ঘ্রাণ বেশি।', 'New-season rice is more fragrant.'],
        [
          'খোলা চালে সুগন্ধি মেশানো থাকতে পারে — অস্বাভাবিক তীব্র ঘ্রাণে সন্দেহ করুন।',
          'Loose rice may be scented artificially — be wary of an overpowering smell.',
        ],
      ],
      [130, 160],
      RICE,
    ),
    g(
      'brri28-rice',
      ['বিআর-২৮ চাল', 'BR-28 rice'],
      [
        ['মাঝারি চাল', 'আটাশ চাল'],
        ['Medium rice', 'BRRI-28'],
      ],
      ['সবচেয়ে প্রচলিত মাঝারি মানের চাল।', 'The most common medium-grade rice.'],
      ['মাঝারি লম্বা, সাদা বা হালকা ঘিয়ে দানা।', 'Medium-length white or off-white grains.'],
      [
        [
          'ভাঙা দানা ও কাঁকর কম আছে কিনা মুঠো ভরে দেখুন।',
          'Check a handful for broken grains and grit.',
        ],
      ],
      [62, 68],
      RICE,
    ),
    g(
      'anchor-dal',
      ['অ্যাংকর ডাল', 'Anchor dal (split pea)'],
      [
        ['এংকর ডাল', 'মটর ডাল'],
        ['Yellow split pea', 'Matar dal'],
      ],
      ['সাশ্রয়ী ডাল — হালিম ও পিয়াজুতে।', 'An affordable dal used in haleem and piyaju.'],
      [
        'গোল, হলুদাভ ও দুই ভাগ করা দানা; মসুরের চেয়ে বড়।',
        'Round, yellowish split peas larger than lentils.',
      ],
      [
        [
          'রং করা উজ্জ্বল হলুদ ডাল এড়িয়ে চলুন।',
          'Avoid dal that looks artificially bright yellow.',
        ],
      ],
      [55, 65],
      DAL,
    ),
    g(
      'mashkalai-dal',
      ['মাষকলাই ডাল', 'Black gram (mashkalai)'],
      [
        ['মাসকলাই', 'কালাই ডাল'],
        ['Urad dal', 'Black gram'],
      ],
      [
        'ঘন ও আঠালো ডাল — রাজশাহীর কালাই রুটিতে ব্যবহৃত।',
        'A thick, sticky dal used in Rajshahi’s kalai roti.',
      ],
      [
        'খোসাসহ কালো-সবুজ, খোসা ছাড়ালে সাদা-ঘিয়ে ছোট দানা।',
        'Black-green with the husk; small creamy-white grains when hulled.',
      ],
      [['দানা আস্ত ও পোকামুক্ত কিনা দেখুন।', 'Make sure grains are whole and insect-free.']],
      [150, 180],
      DAL,
    ),
    g(
      'khesari-dal',
      ['খেসারি ডাল', 'Grass pea (khesari)'],
      [['খেসারি'], ['Khesari', 'Lathyrus']],
      ['সস্তা ডাল — বড়া ও পিয়াজুতে জনপ্রিয়।', 'A cheap dal popular for fritters.'],
      ['চ্যাপ্টা, কোণাকৃতি ধূসর-ঘিয়ে দানা।', 'Flat, angular grey-cream grains.'],
      [
        [
          'অতিরিক্ত পরিমাণে নিয়মিত খাওয়া স্বাস্থ্যের জন্য ভালো নয়।',
          'Eating large amounts regularly is not advised.',
        ],
      ],
      [90, 110],
      DAL,
    ),
    g(
      'flattened-rice',
      ['চিড়া', 'Flattened rice (chira)'],
      [
        ['চিঁড়া', 'চিড়ে'],
        ['Poha', 'Beaten rice'],
      ],
      ['দই-চিড়া ও নাস্তার জন্য চ্যাপ্টা চাল।', 'Pressed rice flakes for doi-chira and snacks.'],
      ['পাতলা চ্যাপ্টা সাদা বা লালচে চালের চাকতি।', 'Thin, flat white or reddish rice flakes.'],
      [['গুঁড়া কম ও আস্ত চিড়া নিন।', 'Pick whole flakes with little powder.']],
      [80, 100],
      SNACK,
    ),
    g(
      'puffed-rice',
      ['মুড়ি', 'Puffed rice (muri)'],
      [
        ['মুড়ি', 'হাতে ভাজা মুড়ি'],
        ['Muri', 'Murmura'],
      ],
      ['ইফতার ও বিকেলের নাস্তার প্রধান উপাদান।', 'A staple for iftar and evening snacks.'],
      ['হালকা, ফোলা, কুড়মুড়ে চালের দানা।', 'Light, puffed, crunchy rice grains.'],
      [
        [
          'অস্বাভাবিক সাদা ও বড় মুড়িতে ইউরিয়া বা হাইড্রোজ দেওয়া হতে পারে — হাতে ভাজা মুড়ি লালচে ও ছোট।',
          'Unusually white, large muri may be treated with urea or hydrose — hand-roasted muri is smaller and reddish.',
        ],
      ],
      [90, 120],
      SNACK,
    ),
  ]
}
