export type Pair = [bn: string, en: string]

/**
 * Category-type checklists. Fish, meat, produce etc. each get their own
 * criteria; products then add product-specific points on top.
 */
export const CHECKLISTS: Record<string, { good: Pair[]; warn: Pair[] }> = {
  fish: {
    good: [
      [
        'চোখ উজ্জ্বল, স্বচ্ছ ও সামান্য ফোলা — ঘোলা বা বসে যাওয়া নয়।',
        'Eyes are bright, clear and slightly bulging — not cloudy or sunken.',
      ],
      [
        'কানকো উল্টালে ভেতরটা উজ্জ্বল লাল বা গোলাপি দেখায়।',
        'Under the gill cover the gills are bright red or pink.',
      ],
      [
        'আঙুল দিয়ে চাপ দিলে মাংস শক্ত থাকে এবং দাগ দ্রুত মিলিয়ে যায়।',
        'The flesh is firm and a finger-press springs back quickly.',
      ],
      [
        'গায়ে পানির বা নদীর হালকা স্বাভাবিক গন্ধ থাকে।',
        'It has only a mild, natural fresh-water smell.',
      ],
      ['আঁশ চকচকে ও শরীরে শক্তভাবে লেগে থাকে।', 'Scales are shiny and held tightly to the skin.'],
    ],
    warn: [
      ['কানকো বাদামি, ধূসর বা কালচে হয়ে গেছে।', 'Gills have turned brown, grey or dark.'],
      [
        'টক, অ্যামোনিয়ার মতো বা তীব্র দুর্গন্ধ আসছে।',
        'There is a sour, ammonia-like or strong unpleasant smell.',
      ],
      ['চাপ দিলে মাংস দেবে যায় এবং দাগ থেকে যায়।', 'The flesh stays dented after you press it.'],
      [
        'আঁশ সহজেই খসে পড়ে, পেট ফোলা বা ফেটে গেছে।',
        'Scales come off easily, or the belly is swollen or split.',
      ],
      [
        'শরীর অস্বাভাবিক শক্ত ও শুকনো অথচ কোনো গন্ধই নেই — কীভাবে সংরক্ষণ করা হয়েছে বিক্রেতাকে জিজ্ঞেস করুন।',
        'The body is oddly stiff and dry with no smell at all — ask the seller how it was stored.',
      ],
    ],
  },
  poultry: {
    good: [
      [
        'জীবিত মুরগি চটপটে, চোখ উজ্জ্বল ও পরিষ্কার।',
        'A live bird is alert, with bright, clean eyes.',
      ],
      [
        'পালক পরিষ্কার; ঝুঁটি ও গলার লতি স্বাভাবিক লাল।',
        'Feathers are clean; the comb and wattles are a natural red.',
      ],
      ['জবাই করা মাংস হালকা গোলাপি ও চামড়া মসৃণ।', 'Dressed meat is light pink with smooth skin.'],
      [
        'চাপ দিলে মাংস স্থিতিস্থাপক, গন্ধ নেই বা হালকা স্বাভাবিক গন্ধ।',
        'The meat is springy and has no smell or only a mild natural one.',
      ],
    ],
    warn: [
      [
        'মুরগি ঝিমাচ্ছে, মাথা নুয়ে আছে বা হাঁ করে শ্বাস নিচ্ছে।',
        'The bird is drowsy, its head droops, or it breathes with an open beak.',
      ],
      [
        'নাক বা চোখ দিয়ে পানি পড়ছে, পায়খানার জায়গা নোংরা।',
        'There is discharge from the nose or eyes, or a soiled vent.',
      ],
      [
        'কাটা মাংস চটচটে, সবুজাভ বা ধূসর ছোপযুক্ত।',
        'Cut meat is sticky or has greenish or grey patches.',
      ],
      ['মাংস থেকে টক বা পচা গন্ধ আসছে।', 'The meat smells sour or rotten.'],
    ],
  },
  meat: {
    good: [
      [
        'মাংসের রং প্রাকৃতিক উজ্জ্বল লাল; কাটা অংশ বাতাসে কিছুক্ষণ থাকলে একটু গাঢ় হতে পারে।',
        'The meat is a natural bright red; cut surfaces may darken slightly in air, which is normal.',
      ],
      [
        'আঁশ বা দানা মিহি; চাপ দিলে শক্ত লাগে ও আগের অবস্থায় ফিরে আসে।',
        'The grain is fine; it feels firm and springs back when pressed.',
      ],
      ['চর্বি সাদা থেকে হালকা ক্রিম রঙের এবং শক্ত।', 'Fat is white to light cream and firm.'],
      [
        'কাঁচা মাংসের হালকা স্বাভাবিক গন্ধ, কোনো টক ভাব নেই।',
        'A mild natural raw-meat smell with no sourness.',
      ],
      [
        'দোকান পরিষ্কার, মাংস ঢেকে রাখা এবং ছুরি-কাঠের গুঁড়ি পরিষ্কার।',
        'The shop is clean, meat is covered, and knives and chopping block are clean.',
      ],
    ],
    warn: [
      ['মাংস বাদামি, ধূসর বা সবুজাভ হয়ে গেছে।', 'The meat has turned brown, grey or greenish.'],
      ['পৃষ্ঠ চটচটে বা পিচ্ছিল।', 'The surface is sticky or slimy.'],
      ['টক বা অ্যামোনিয়ার মতো গন্ধ।', 'It smells sour or ammonia-like.'],
      [
        'মাছি বসছে বা মাংস খোলা অবস্থায় রোদে ঝুলছে।',
        'Flies are settling on it, or it hangs uncovered in the sun.',
      ],
      [
        'মাংস থেকে অস্বাভাবিক পানি ঝরছে — বিক্রেতাকে প্রশ্ন করুন।',
        'Unusual amounts of water are dripping from the meat — ask questions.',
      ],
    ],
  },
  vegetable: {
    good: [
      ['প্রাকৃতিক ও সমান উজ্জ্বল রং।', 'Natural, even and bright colour.'],
      [
        'খোসা টানটান ও শক্ত; আকারের তুলনায় হাতে ভারী লাগে।',
        'Skin is taut and firm; it feels heavy for its size.',
      ],
      [
        'বোঁটা সবুজ ও তাজা, শুকিয়ে কালো হয়নি।',
        'The stalk is green and fresh, not dried or blackened.',
      ],
      ['কোথাও নরম, পচা বা কালো দাগ নেই।', 'No soft, rotten or black spots anywhere.'],
    ],
    warn: [
      ['কুঁচকে গেছে বা নেতিয়ে পড়েছে।', 'It is wrinkled or limp.'],
      ['ছত্রাক বা সাদা-কালো ছোপ দেখা যাচ্ছে।', 'There is mould or white/black patches.'],
      ['পোকায় কাটা ছিদ্র আছে।', 'There are insect bore holes.'],
      [
        'অস্বাভাবিক চকচকে — রান্নার আগে ভালো করে ধুয়ে নিন।',
        'It looks unnaturally glossy — wash thoroughly before cooking.',
      ],
    ],
  },
  leafy: {
    good: [
      ['পাতা সতেজ, টানটান ও উজ্জ্বল রঙের।', 'Leaves are crisp, taut and brightly coloured.'],
      [
        'কচি ডাঁটা ভাঙলে কট করে ভেঙে যায়, আঁশ কম।',
        'Tender stems snap cleanly and are not fibrous.',
      ],
      [
        'গোড়ায় সামান্য মাটি থাকা স্বাভাবিক — এটি সদ্য তোলার লক্ষণ।',
        'A little soil at the roots is normal — a sign it was recently picked.',
      ],
      ['আঁটি আঁটসাঁট; ভেতরে পচা পাতা নেই।', 'The bundle is tight with no rotten leaves inside.'],
    ],
    warn: [
      ['পাতা হলুদ, নেতানো বা ভিজে পচে গেছে।', 'Leaves are yellow, limp or soggy and decaying.'],
      ['আঁটির ভেতরে কালো বা পিচ্ছিল অংশ।', 'Black or slimy parts inside the bundle.'],
      ['পাতায় পোকার ছিদ্র বা সাদা দাগ।', 'Insect holes or white spots on the leaves.'],
      [
        'বারবার পানি ছিটিয়ে তাজা দেখানো হচ্ছে — আঁটির ভেতরের পাতা দেখে নিন।',
        'Water is being sprayed repeatedly to make it look fresh — check the inner leaves.',
      ],
    ],
  },
  fruit: {
    good: [
      ['পাকা ফলের প্রাকৃতিক মিষ্টি ঘ্রাণ আছে।', 'It has the natural sweet aroma of ripe fruit.'],
      ['আকারের তুলনায় ভারী — অর্থাৎ রসালো।', 'It feels heavy for its size — a sign of juiciness.'],
      ['খোসা অক্ষত, থেঁতলানো বা ফাটা নয়।', 'The skin is intact, not bruised or cracked.'],
      ['বোঁটা তাজা, একেবারে শুকিয়ে যায়নি।', 'The stalk is fresh, not completely dried out.'],
    ],
    warn: [
      ['থেঁতলানো, ফাটা বা রস চুইয়ে পড়ছে।', 'It is bruised, cracked or leaking juice.'],
      ['টক বা গাঁজানো গন্ধ।', 'It smells sour or fermented.'],
      ['খোসায় ছত্রাক বা পচা দাগ।', 'Mould or rotten spots on the skin.'],
      [
        'বাইরে সমান রং অথচ শক্ত ও ঘ্রাণহীন — হয়তো সময়ের আগে পাড়া হয়েছে।',
        'Evenly coloured outside but hard and scentless — it may have been picked before it was ripe.',
      ],
    ],
  },
  spice: {
    good: [
      ['শুকনো, শক্ত ও হাতে ভারী।', 'Dry, firm and heavy in the hand.'],
      ['প্রাকৃতিক ঝাঁঝালো ঘ্রাণ।', 'A natural, pungent aroma.'],
      ['খোসা অক্ষত ও পরিষ্কার।', 'The skin is intact and clean.'],
      ['ছত্রাক বা অঙ্কুর নেই।', 'No mould and no sprouting.'],
    ],
    warn: [
      ['নরম, স্যাঁতসেঁতে বা পচা অংশ আছে।', 'Soft, damp or rotten parts.'],
      ['খোসার নিচে কালো গুঁড়ার মতো ছত্রাক।', 'Black, powdery mould under the skin.'],
      ['অঙ্কুর বের হয়েছে।', 'It has started sprouting.'],
      ['ঘ্রাণ খুব কম বা ভ্যাপসা গন্ধ।', 'Very weak aroma or a musty smell.'],
    ],
  },
  grain: {
    good: [
      [
        'দানা সমান আকারের ও আস্ত, ভাঙা দানা কম।',
        'Grains are even-sized and whole, with few broken ones.',
      ],
      [
        'শুকনো ও ঝরঝরে — হাতে লেগে থাকে না।',
        'Dry and free-flowing — it does not stick to your hand.',
      ],
      ['প্রাকৃতিক রং ও হালকা মিষ্টি ঘ্রাণ।', 'Natural colour and a light, pleasant smell.'],
      ['কাঁকর, তুষ ও ধুলা খুব কম।', 'Very little grit, husk or dust.'],
    ],
    warn: [
      ['পোকা, পোকার গুঁড়া বা জালের মতো সুতা।', 'Insects, insect dust or web-like threads.'],
      ['ভ্যাপসা বা ছত্রাকের গন্ধ।', 'A musty or mouldy smell.'],
      ['অনেক বেশি ভাঙা দানা বা কাঁকর।', 'A lot of broken grains or grit.'],
      ['দলা বাঁধা বা ভেজা ভাব।', 'Clumps or a damp feel.'],
    ],
  },
  egg: {
    good: [
      ['খোসা পরিষ্কার, অক্ষত ও সামান্য খসখসে।', 'The shell is clean, intact and slightly rough.'],
      ['আকারের তুলনায় হাতে ভারী লাগে।', 'It feels heavy for its size.'],
      ['এক বাটি পানিতে রাখলে তলায় শুয়ে থাকে।', 'In a bowl of water it lies flat on the bottom.'],
    ],
    warn: [
      ['খোসা ফাটা বা চিড় ধরা।', 'The shell is cracked or has hairline cracks.'],
      ['পানিতে ভেসে ওঠে — ডিমটি পুরনো।', 'It floats in water — the egg is old.'],
      ['খোসায় ময়লা বা পিচ্ছিল ভাব।', 'The shell is dirty or slimy.'],
      [
        'ভাঙার পর দুর্গন্ধ বা কুসুম ছড়িয়ে পড়ে।',
        'A bad smell, or a yolk that spreads flat when broken.',
      ],
    ],
  },
}
