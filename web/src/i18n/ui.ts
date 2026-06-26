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
    "site.tagline": "Now it's your turn to take aim.",

    "nav.home": "Home",
    "nav.videos": "Videos",
    "nav.about": "About",
    "nav.support": "Support",
    "nav.shop": "Shop",
    "nav.cart": "Cart",
    "nav.language": "Language",

    "common.soon": "Soon",

    "hero.cta.watch": "Watch the Series",

    "home.statement.p1":
      "Every piece of content we create is an arrow for your quiver: each one illuminates a hidden truth, dispels a common myth, or unpacks a detail of the Iran Prosperity Project.",

    "videos.title": "The Series",
    "videos.intro": "Every piece is an arrow for the quiver.",
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
    "video.unavailable": "This video is not yet available in this language.",
    "video.alsoInFa": "Also available for Persian speakers.",
    "video.alsoInEn": "Also available for English speakers.",
    "video.faSoon": "Available for Persian speakers soon.",
    "video.enSoon": "Available for English speakers soon.",

    "share.button": "Share",
    "share.x": "Post on X",
    "share.instagram": "View Reel",
    "share.youtube": "Watch Short",

    "share.guide.title": "How to Share",
    "share.guide.x": "Post on X.com",
    "share.guide.instagram": "Post on Instagram",
    "share.guide.tiktok": "Post on TikTok",
    "share.guide.youtube": "Watch on YouTube Shorts",
    "share.guide.reddit": "Post on Reddit",

    "about.title": "Who We Are",
    "about.image_alt":
      "A Persian mosaic of a flag-bearer raising the Lion and Sun flag of Iran.",
    "about.lead":
      "We are a small, unlikely band of friends who met on Discord: a group of Iranians, a Jewish video editor, and an activist from Hong Kong. Among us, a true daughter of Persia whose luminous voice gives our videos their soul.",
    "about.vision.title": "Our Vision",
    "about.vision.body":
      "We are an independent collaboration bound by a single shared vision: a secular, democratic Iran. We stand with Reza Pahlavi, and we bring the Iran Prosperity Project to life in content you can share. Beyond that, we stay politically neutral — the goal is to build a coalition behind a transition. We can work out our differences once Iran is free.",
    "about.mission.title": "Our Mission",
    "about.mission.body":
      "Most of the world knows very little about Iran or the Lion and Sun Revolution, and that silence leaves room for misconceptions to spread unchallenged. We want to change that — to show a global audience the Free Iran that will soon benefit us all. We do it with short videos, where every piece is an arrow for the quiver: each one illuminates a hidden truth, dispels a common myth, or unpacks a detail of the Iran Prosperity Project.",
    "about.help.title": "How You Can Help",
    "about.help.body":
      "This is where you come in. These videos only matter if they are seen. Watch them where they live, then follow our channels, like, comment, and repost — every share pushes the message past the regime's noise and into the world. Join our email list below to catch each new video the moment it drops, and, if you are able, support the work with a donation or by wearing the message. We make it for free; you make it travel.",

    "promote.title": "Be the arrow.",
    "promote.body":
      "These videos only matter if they are seen. Watch them where they live, then follow our channels, like, comment, and repost — every share pushes the message past the regime's noise and into the world.",
    "promote.share": "Share this video",

    "newsletter.headline": "Get the next arrow first.",
    "newsletter.body":
      "These videos only matter if they are seen. Join the email list and we'll send each new one the moment it drops — so you're first to watch, and first to share.",
    "newsletter.placeholder": "Your email",
    "newsletter.subscribe": "Subscribe",
    "newsletter.success": "You're in. Watch your inbox.",
    "newsletter.error": "Something went wrong. Please try again.",
    "newsletter.consent": "No spam. Unsubscribe anytime.",

    "support.title": "Fund the Fight",
    "support.lead":
      "Every video is made and shared for free. Your support pays for the next one — and the one after that.",
    "support.donate.title": "Make a one-time gift",
    "support.donate.body":
      "A quick, no-account donation keeps the cameras rolling. Give whatever you can.",
    "support.kofi": "Donate on Ko-fi",
    "support.bmac": "Buy us a coffee",
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
    "site.tagline": "حالا نوبت توست که نشانه بگیری.",

    "nav.home": "خانه",
    "nav.videos": "ویدیوها",
    "nav.about": "درباره",
    "nav.support": "حمایت",
    "nav.shop": "فروشگاه",
    "nav.cart": "سبد خرید",
    "nav.language": "زبان",

    "common.soon": "به‌زودی",

    "hero.cta.watch": "تماشای مجموعه",

    "home.statement.p1":
      "هر محتوایی که می‌سازیم تیری برای ترکش توست: هر کدام حقیقتی پنهان را روشن می‌کند، افسانه‌ای رایج را باطل می‌کند، یا جزئیاتی از پروژه شکوفایی ایران را شرح می‌دهد.",

    "videos.title": "مجموعه",
    "videos.intro": "هر اثر تیری برای ترکش است.",
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
    "video.unavailable": "این ویدیو هنوز به این زبان در دسترس نیست.",
    "video.alsoInFa": "این ویدیو برای فارسی‌زبانان نیز در دسترس است.",
    "video.alsoInEn": "این ویدیو برای انگلیسی‌زبانان نیز در دسترس است.",
    "video.faSoon": "نسخه فارسی به‌زودی در دسترس قرار می‌گیرد.",
    "video.enSoon": "نسخه انگلیسی به‌زودی در دسترس قرار می‌گیرد.",

    "share.button": "هم‌رسانی",
    "share.x": "انتشار در ایکس",
    "share.instagram": "دیدن ریل",
    "share.youtube": "تماشای شورت",

    "share.guide.title": "چگونه هم‌رسانی کنیم",
    "share.guide.x": "انتشار در X.com",
    "share.guide.instagram": "انتشار در اینستاگرام",
    "share.guide.tiktok": "انتشار در تیک‌تاک",
    "share.guide.youtube": "تماشا در یوتیوب شورتس",
    "share.guide.reddit": "انتشار در ردیت",

    "about.title": "ما که هستیم",
    "about.image_alt":
      "موزاییکی ایرانی از پرچم‌داری که پرچم شیر و خورشید ایران را برافراشته است.",
    "about.lead":
      "ما گروهی کوچک و نامحتمل از دوستانی هستیم که در دیسکورد با هم آشنا شدیم: گروهی از ایرانیان، یک تدوین‌گر ویدیوی یهودی، و کنشگری از هنگ‌کنگ. در میان ما، دختری راستین از پارس که صدای درخشانش به ویدیوهای ما جان می‌بخشد.",
    "about.vision.title": "چشم‌انداز ما",
    "about.vision.body":
      "ما یک همکاری مستقل هستیم که با یک چشم‌انداز مشترک به هم پیوسته‌ایم: ایرانی سکولار و دموکراتیک. ما در کنار رضا پهلوی ایستاده‌ایم و پروژه‌ی شکوفایی ایران را در قالب محتوایی که می‌توانید هم‌رسانی کنید، زنده می‌کنیم. فراتر از این، ما از نظر سیاسی بی‌طرف می‌مانیم — هدف، ساختن ائتلافی برای یک گذار است. اختلاف‌هایمان را می‌توانیم پس از آزادی ایران حل کنیم.",
    "about.mission.title": "مأموریت ما",
    "about.mission.body":
      "بیشتر جهان درباره‌ی ایران و انقلاب شیر و خورشید بسیار کم می‌داند، و این سکوت فضایی می‌سازد که در آن برداشت‌های نادرست بدون چالش گسترش می‌یابند. ما می‌خواهیم این را تغییر دهیم — تا ایرانِ آزادی را به جهان نشان دهیم که به‌زودی به سود همه‌ی ما خواهد بود. این کار را با ویدیوهای کوتاه انجام می‌دهیم، جایی که هر اثر تیری برای ترکش است: هر کدام حقیقتی پنهان را روشن می‌کند، افسانه‌ای رایج را باطل می‌کند، یا جزئیاتی از پروژه‌ی شکوفایی ایران را شرح می‌دهد.",
    "about.help.title": "چگونه می‌توانید کمک کنید",
    "about.help.body":
      "اینجا جایی است که شما وارد می‌شوید. این ویدیوها تنها وقتی اهمیت دارند که دیده شوند. آن‌ها را همان‌جا که منتشر شده‌اند تماشا کنید، سپس کانال‌های ما را دنبال کنید، بپسندید، نظر بدهید و بازنشر کنید — هر هم‌رسانی پیام را از هیاهوی رژیم عبور می‌دهد و به جهان می‌رساند. در پایین به فهرست ایمیل ما بپیوندید تا هر ویدیوی تازه را همان لحظه‌ی انتشار دریافت کنید، و اگر می‌توانید، با یک کمک مالی یا پوشیدن پیام از این کار حمایت کنید. ما آن را رایگان می‌سازیم؛ شما آن را به حرکت درمی‌آورید.",

    "promote.title": "تو خودِ تیر باش.",
    "promote.body":
      "این ویدیوها تنها وقتی اهمیت دارند که دیده شوند. آن‌ها را همان‌جا که منتشر شده‌اند تماشا کنید، سپس کانال‌های ما را دنبال کنید، بپسندید، نظر بدهید و بازنشر کنید — هر هم‌رسانی پیام را از هیاهوی رژیم عبور می‌دهد و به جهان می‌رساند.",
    "promote.share": "این ویدیو را هم‌رسانی کن",

    "newsletter.headline": "تیر بعدی را زودتر دریافت کن.",
    "newsletter.body":
      "این ویدیوها تنها وقتی اهمیت دارند که دیده شوند. به فهرست ایمیل بپیوندید تا هر ویدیوی تازه را همان لحظه‌ی انتشار برایتان بفرستیم — تا اولین کسی باشید که آن را می‌بیند و هم‌رسانی می‌کند.",
    "newsletter.placeholder": "ایمیل شما",
    "newsletter.subscribe": "عضویت",
    "newsletter.success": "ثبت شد. منتظر ایمیل ما باشید.",
    "newsletter.error": "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
    "newsletter.consent": "بدون هرزنامه. هر زمان بخواهید لغو عضویت کنید.",

    "support.title": "از مبارزه حمایت کن",
    "support.lead":
      "هر ویدیو رایگان ساخته و هم‌رسانی می‌شود. حمایت شما هزینه‌ی ویدیوی بعدی — و ویدیوی پس از آن — را تأمین می‌کند.",
    "support.donate.title": "یک کمک یک‌باره بکن",
    "support.donate.body":
      "یک کمک مالی سریع و بدون نیاز به حساب، دوربین‌ها را روشن نگه می‌دارد. هر چه می‌توانید ببخشید.",
    "support.kofi": "کمک در Ko-fi",
    "support.bmac": "برای ما یک قهوه بخر",
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
