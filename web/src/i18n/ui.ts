import type { Locale } from "@/consts";

/**
 * All user-facing UI copy keyed by locale. Video titles/scripts live in the
 * content collection; everything chrome-level lives here. Add a new locale by
 * adding a block with the same keys.
 */
export const ui = {
  en: {
    "site.name": "Final Battle",
    "site.subtitle": "For Iran",
    "site.tagline": "Educating the world about a free Iran.",

    "nav.home": "Home",
    "nav.videos": "Videos",
    "nav.about": "About",
    "nav.support": "Donate",
    "nav.shop": "Shop",
    "nav.cart": "Cart",
    "nav.language": "Language",

    "common.soon": "Soon",

    "hero.cta.watch": "Watch the Series",

    "home.statement.p1":
      "Every piece of content we create is an arrow for your quiver: each one illuminates a hidden truth, dispels a common myth, or unpacks a detail of the Iran Prosperity Project.",
    "home.hero.sub": "Every video is an arrow in your quiver — a truth few outside Iran know, certainty for a bright future, a piece of the plan for a free Iran.\n\nWatch them where they live, follow our channels, like, comment, and repost — every share carries the message past the regime's noise and into the world.",

    "videos.title": "The Series",
    "videos.intro": "Every piece is an arrow for the quiver.",
    "videos.longForm.title": "Long Form",
    "filter.all": "All",
    "filter.truth": "Hidden Truths",
    "filter.myth": "Common Myths",
    "filter.project": "The Project",
    "videos.empty": "No videos in this category yet.",

    "category.truth": "Hidden Truth",
    "category.myth": "Common Myth",
    "category.project": "The Project",

    "video.script": "Transcript",
    "video.context": "Background",
    "video.share": "Share",
    "video.watchOn": "Watch on",
    "video.back": "Back to the series",
    "video.narratedBy": "Narrated by Daughter of Persia",
    "video.unavailable": "This video is not yet available in this language.",
    "video.alsoInFa": "Also available for Persian speakers.",
    "video.alsoInEn": "Also available for English speakers.",
    "video.faSoon": "Available for Persian speakers soon.",
    "video.enSoon": "Available for English speakers soon.",

    "share.button": "Share",
    "share.x": "Repost on X",
    "share.instagram": "Share on Instagram",
    "share.tiktok": "Repost on TikTok",
    "share.youtube": "Share on YouTube",
    "share.linkedin": "Repost on LinkedIn",

    "share.guide.title": "How to Share",
    "share.guide.hint":
      "Reposts put this in front of new people, while likes and comments help the video rise on each platform.",
    "share.guide.x": "Repost on X.com",
    "share.guide.instagram": "Share on Instagram",
    "share.guide.tiktok": "Repost on TikTok",
    "share.guide.youtube": "Share on YouTube Shorts",
    "share.guide.linkedin": "Repost on LinkedIn",
    "share.guide.reddit": "Post on Reddit",

    "about.title": "Who We Are",
    "about.image_alt":
      "A Persian mosaic of a flag-bearer raising the Lion and Sun flag of Iran.",
    "about.lead":
      "We are a small, unlikely band of friends who met on Discord: a group of Iranians, a Jewish video editor, and an activist from Hong Kong. Among us, a true daughter of Persia whose luminous voice gives our videos their soul.",
    "about.vision.title": "Our Vision",
    "about.vision.body":
      "We are an independent collaboration bound by a single shared vision: a secular, democratic Iran. Our task is to bring the Iran Prosperity Project to life in content you can share. We stand with Reza Pahlavi and work to reflect his message. Beyond that, we stay politically neutral — the goal is to build a coalition behind a transition. We can work out our differences once Iran is free.",
    "about.mission.title": "Our Mission",
    "about.mission.body":
      "Most of the world knows very little about Iran or the Lion and Sun Revolution, and that silence leaves room for misconceptions to spread unchallenged. We want to change that — to show a global audience the Free Iran that will soon benefit us all. We do it with short videos, where every piece is an arrow for the quiver: each one illuminates a hidden truth, dispels a common myth, or unpacks a detail of the Iran Prosperity Project.",
    "about.help.title": "How You Can Help",
    "about.help.body":
      "This is where you come in. These videos only matter if they are seen. Watch them where they live, then follow our channels, like, comment, and repost — every share pushes the message past the regime's noise and into the world. Join our email list below to catch each new video the moment it drops, and, if you are able, support the work with a donation or by wearing the message. We make it for free; you make it travel.",

    "promote.title": "Be the archer.",
    "promote.body":
      "These videos only matter if they are seen. Watch them where they live, then follow our channels, like, comment, and repost — every share pushes the message past the regime's noise and into the world.",
    "promote.share": "Share this video",

    "newsletter.headline": "Get the next arrow first.",
    "newsletter.body":
      "These videos only matter if they are seen. Join the email list and we'll send each new one the moment it drops — so you're first to watch, and first to share.",
    "newsletter.placeholder": "Your email",
    "newsletter.subscribe": "Subscribe",
    "newsletter.success": "You're on the list. We'll email you when the next video drops.",
    "newsletter.error": "Something went wrong. Please try again.",
    "newsletter.consent": "No spam. Unsubscribe anytime.",

    "popup.close": "Close",
    "popup.email.title": "Don't miss the next one.",
    "popup.email.body":
      "You've watched more than one — you get it. Join the list and every new video lands in your inbox the moment it drops.",
    "popup.email.dismiss": "Maybe later",
    "popup.donate.title": "Fund the next arrow.",
    "popup.donate.body":
      "You keep coming back. Every video is made and shared for free — a small gift keeps them coming.",
    "popup.donate.cta": "Buy us a kotlet",
    "popup.donate.dismiss": "Not now",

    "support.title": "Fund the Fight",
    "support.lead":
      "A free Iran is an Iranian project — not a fantasy, and not something handed down from outside. These videos make that case, and reach further only with your help.",
    "support.donate.title": "Fuel the next video",
    "support.donate.body":
      "Your gift covers production, hosting, and reach — the difference between a video that merely exists and one the world actually sees. Give whatever you can.",
    "support.bmac": "Buy us a kotlet",
    "support.shop.title": "Wear the message",
    "support.shop.body":
      "Grab a shirt or a print and carry the fight into the streets. Every order funds more videos.",
    "support.shop.cta": "Visit the shop",

    "shop.title": "The Shop",
    "shop.intro": "Wear the message. Every order funds more videos.",
    "shop.empty": "New designs are on the way.",

    "product.format": "Format",
    "product.tee": "T-Shirt",
    "product.poster": "Poster",
    "product.size": "Size",
    "product.language": "Language",
    "product.from": "From",
    "product.add": "Add to Cart",
    "product.shipping_note": "Printed on demand and shipped worldwide.",
    "product.fulfillment_note": "Fulfilled by our independent print network.",
    "product.lang.en": "English",
    "product.lang.fa": "Farsi",

    "cart.title": "Your Cart",
    "cart.empty": "Your cart is empty.",
    "cart.subtotal": "Subtotal",
    "cart.shipping_note": "Shipping & taxes calculated at checkout.",
    "cart.checkout": "Checkout",
    "cart.continue": "Continue Shopping",
    "cart.close": "Close",
    "cart.error": "Could not start checkout. Please try again.",

    "checkout.success.title": "Thank you.",
    "checkout.success.body":
      "Your order is confirmed and a receipt is on its way to your inbox. We'll print and ship it shortly.",
    "checkout.cancel.title": "Checkout canceled",
    "checkout.cancel.body":
      "No charge was made and your cart is still saved. Pick up where you left off whenever you're ready.",

    "footer.rights": "See You In Free Iran.",
  },
  fa: {
    "site.name": "نبرد نهایی",
    "site.subtitle": "برای ایران",
    "site.tagline": "جهان را دربارهٔ ایرانِ آزاد آگاه می‌کنیم.",

    "nav.home": "خانه",
    "nav.videos": "ویدیوها",
    "nav.about": "درباره",
    "nav.support": "کمک مالی",
    "nav.shop": "فروشگاه",
    "nav.cart": "سبد خرید",
    "nav.language": "زبان",

    "common.soon": "به‌زودی",

    "hero.cta.watch": "تماشای مجموعه",

    "home.statement.p1":
      "هر محتوایی که می‌سازیم تیری برای ترکش توست: هر کدام حقیقتی پنهان را روشن می‌کند، افسانه‌ای رایج را باطل می‌کند، یا جزئیاتی از پروژه شکوفایی ایران را شرح می‌دهد.",

    "home.hero.sub": "هر ویدیو تیری در ترکش توست — حقیقتی که کمتر کسی بیرون از ایران می‌داند، یقین به آینده‌ای روشن، تکه‌ای از نقشهٔ ایرانِ آزاد.\n\nآن‌ها را همان‌جا که منتشر شده‌اند تماشا کنید، کانال‌های ما را دنبال کنید، بپسندید، نظر بدهید و بازنشر کنید — هر هم‌رسانی پیام را از هیاهوی رژیم عبور می‌دهد و به جهان می‌رساند.",

    "videos.title": "مجموعه",
    "videos.intro": "هر اثر تیری برای ترکش است.",
    "videos.longForm.title": "فرم بلند",
    "filter.all": "همه",
    "filter.truth": "حقیقت‌های پنهان",
    "filter.myth": "افسانه‌های رایج",
    "filter.project": "پروژه",
    "videos.empty": "هنوز ویدیویی در این دسته وجود ندارد.",

    "category.truth": "حقیقت پنهان",
    "category.myth": "افسانه رایج",
    "category.project": "پروژه",

    "video.script": "متن",
    "video.context": "پیشینه",
    "video.share": "هم‌رسانی",
    "video.watchOn": "تماشا در",
    "video.back": "بازگشت به مجموعه",
    "video.narratedBy": "روایت دختر پارس",
    "video.unavailable": "این ویدیو هنوز به این زبان در دسترس نیست.",
    "video.alsoInFa": "این ویدیو برای فارسی‌زبانان نیز در دسترس است.",
    "video.alsoInEn": "این ویدیو برای انگلیسی‌زبانان نیز در دسترس است.",
    "video.faSoon": "نسخه فارسی به‌زودی در دسترس قرار می‌گیرد.",
    "video.enSoon": "نسخه انگلیسی به‌زودی در دسترس قرار می‌گیرد.",

    "share.button": "هم‌رسانی",
    "share.x": "بازنشر در ایکس",
    "share.instagram": "هم‌رسانی در اینستاگرام",
    "share.tiktok": "بازنشر در تیک‌تاک",
    "share.youtube": "هم‌رسانی در یوتیوب",
    "share.linkedin": "بازنشر در لینکدین",

    "share.guide.title": "چگونه هم‌رسانی کنیم",
    "share.guide.hint":
      "بازنشرها این را به افراد تازه می‌رسانند، و لایک‌ها و نظرها به بالا آمدن ویدیو در هر پلتفرم کمک می‌کنند.",
    "share.guide.x": "بازنشر در X.com",
    "share.guide.instagram": "هم‌رسانی در اینستاگرام",
    "share.guide.tiktok": "بازنشر در تیک‌تاک",
    "share.guide.youtube": "هم‌رسانی در یوتیوب شورتس",
    "share.guide.linkedin": "بازنشر در لینکدین",
    "share.guide.reddit": "انتشار در ردیت",

    "about.title": "ما که هستیم",
    "about.image_alt":
      "موزاییکی ایرانی از پرچم‌داری که پرچم شیر و خورشید ایران را برافراشته است.",
    "about.lead":
      "ما گروهی کوچک و نامحتمل از دوستانی هستیم که در دیسکورد با هم آشنا شدیم: گروهی از ایرانیان، یک تدوین‌گر ویدیوی یهودی، و کنشگری از هنگ‌کنگ. در میان ما، دختری راستین از پارس که صدای درخشانش به ویدیوهای ما جان می‌بخشد.",
    "about.vision.title": "چشم‌انداز ما",
    "about.vision.body":
      "ما یک همکاری مستقل هستیم که با یک چشم‌انداز مشترک به هم پیوسته‌ایم: ایرانی سکولار و دموکراتیک. مأموریت ما این است که پروژهٔ شکوفایی ایران را در قالب محتوایی که می‌توانید هم‌رسانی کنید، زنده کنیم. ما در کنار رضا پهلوی ایستاده‌ایم و کوشش می‌کنیم پیام او را بازتاب دهیم. فراتر از این، ما از نظر سیاسی بی‌طرف می‌مانیم — هدف، ساختن ائتلافی برای یک گذار است. اختلاف‌هایمان را می‌توانیم پس از آزادی ایران حل کنیم.",
    "about.mission.title": "مأموریت ما",
    "about.mission.body":
      "بیشتر جهان درباره‌ی ایران و انقلاب شیر و خورشید بسیار کم می‌داند، و این سکوت فضایی می‌سازد که در آن برداشت‌های نادرست بدون چالش گسترش می‌یابند. ما می‌خواهیم این را تغییر دهیم — تا ایرانِ آزادی را به جهان نشان دهیم که به‌زودی به سود همه‌ی ما خواهد بود. این کار را با ویدیوهای کوتاه انجام می‌دهیم، جایی که هر اثر تیری برای ترکش است: هر کدام حقیقتی پنهان را روشن می‌کند، افسانه‌ای رایج را باطل می‌کند، یا جزئیاتی از پروژه‌ی شکوفایی ایران را شرح می‌دهد.",
    "about.help.title": "چگونه می‌توانید کمک کنید",
    "about.help.body":
      "اینجا جایی است که شما وارد می‌شوید. این ویدیوها تنها وقتی اهمیت دارند که دیده شوند. آن‌ها را همان‌جا که منتشر شده‌اند تماشا کنید، سپس کانال‌های ما را دنبال کنید، بپسندید، نظر بدهید و بازنشر کنید — هر هم‌رسانی پیام را از هیاهوی رژیم عبور می‌دهد و به جهان می‌رساند. در پایین به فهرست ایمیل ما بپیوندید تا هر ویدیوی تازه را همان لحظه‌ی انتشار دریافت کنید، و اگر می‌توانید، با یک کمک مالی یا پوشیدن پیام از این کار حمایت کنید. ما آن را رایگان می‌سازیم؛ شما آن را به حرکت درمی‌آورید.",

    "promote.title": "کماندار باش.",
    "promote.body":
      "این ویدیوها تنها وقتی اهمیت دارند که دیده شوند. آن‌ها را همان‌جا که منتشر شده‌اند تماشا کنید، سپس کانال‌های ما را دنبال کنید، بپسندید، نظر بدهید و بازنشر کنید — هر هم‌رسانی پیام را از هیاهوی رژیم عبور می‌دهد و به جهان می‌رساند.",
    "promote.share": "این ویدیو را هم‌رسانی کن",

    "newsletter.headline": "تیر بعدی را زودتر دریافت کن.",
    "newsletter.body":
      "این ویدیوها تنها وقتی اهمیت دارند که دیده شوند. به فهرست ایمیل بپیوندید تا هر ویدیوی تازه را همان لحظه‌ی انتشار برایتان بفرستیم — تا اولین کسی باشید که آن را می‌بیند و هم‌رسانی می‌کند.",
    "newsletter.placeholder": "ایمیل شما",
    "newsletter.subscribe": "عضویت",
    "newsletter.success": "به فهرست اضافه شدی. وقتی ویدیوی بعدی منتشر شود برایت ایمیل می‌کنیم.",
    "newsletter.error": "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
    "newsletter.consent": "بدون هرزنامه. هر زمان بخواهید لغو عضویت کنید.",

    "popup.close": "بستن",
    "popup.email.title": "ویدیوی بعدی را از دست نده.",
    "popup.email.body":
      "بیش از یکی را تماشا کرده‌ای — پس اهلش هستی. به فهرست بپیوند تا هر ویدیوی تازه همان لحظه‌ی انتشار به ایمیلت برسد.",
    "popup.email.dismiss": "شاید بعداً",
    "popup.donate.title": "تیر بعدی را تأمین کن.",
    "popup.donate.body":
      "تو بارها برگشته‌ای. هر ویدیو رایگان ساخته و هم‌رسانی می‌شود — یک کمک کوچک آن‌ها را ادامه می‌دهد.",
    "popup.donate.cta": "برای ما یک کتلت بخر",
    "popup.donate.dismiss": "الان نه",

    "support.title": "از مبارزه حمایت کن",
    "support.lead":
      "ایرانِ آزاد یک پروژه‌ی ایرانی است — نه یک خیال، و نه چیزی که از بیرون فرو بریزد. این ویدیوها همین را ثابت می‌کنند و تنها با کمک تو دورتر می‌رسند.",
    "support.donate.title": "سوختِ ویدیوی بعدی باش",
    "support.donate.body":
      "کمک تو هزینه‌ی تولید، میزبانی و انتشار را می‌پوشاند — همان تفاوت میان ویدیویی که فقط وجود دارد و ویدیویی که جهان واقعاً آن را می‌بیند. هر چه می‌توانی ببخش.",
    "support.bmac": "برای ما یک کتلت بخر",
    "support.shop.title": "پیام را بپوش",
    "support.shop.body":
      "یک تی‌شرت یا پوستر بگیرید و مبارزه را به خیابان‌ها ببرید. هر سفارش ویدیوهای بیشتری را ممکن می‌کند.",
    "support.shop.cta": "به فروشگاه برو",

    "shop.title": "فروشگاه",
    "shop.intro": "پیام را بپوش. هر سفارش ویدیوهای بیشتری را می‌سازد.",
    "shop.empty": "طرح‌های تازه در راه‌اند.",

    "product.format": "نوع",
    "product.tee": "تی‌شرت",
    "product.poster": "پوستر",
    "product.size": "اندازه",
    "product.language": "زبان",
    "product.from": "از",
    "product.add": "افزودن به سبد",
    "product.shipping_note": "چاپ بر اساس سفارش و ارسال به سراسر جهان.",
    "product.fulfillment_note": "توسط شبکه‌ی چاپ مستقل ما انجام می‌شود.",
    "product.lang.en": "انگلیسی",
    "product.lang.fa": "فارسی",

    "cart.title": "سبد خرید شما",
    "cart.empty": "سبد خرید شما خالی است.",
    "cart.subtotal": "جمع جزء",
    "cart.shipping_note": "هزینه ارسال و مالیات در زمان پرداخت محاسبه می‌شود.",
    "cart.checkout": "پرداخت",
    "cart.continue": "ادامه خرید",
    "cart.close": "بستن",
    "cart.error": "شروع پرداخت ممکن نشد. لطفاً دوباره تلاش کنید.",

    "checkout.success.title": "سپاسگزاریم.",
    "checkout.success.body":
      "سفارش شما تأیید شد و رسید آن در راه ایمیل شماست. به‌زودی آن را چاپ و ارسال می‌کنیم.",
    "checkout.cancel.title": "پرداخت لغو شد",
    "checkout.cancel.body":
      "هیچ هزینه‌ای کسر نشد و سبد خرید شما ذخیره است. هر وقت آماده بودید از همان‌جا ادامه دهید.",

    "footer.rights": "ایران آزاد.",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof ui)["en"];
