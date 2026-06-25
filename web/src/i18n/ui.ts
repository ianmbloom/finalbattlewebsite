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
      "Most of the world knows little about Iran and the Lion and Sun Revolution. Our mission is to build the tools that help you change that — to show the world the Free Iran that will soon benefit us all.",
    "home.statement.p2":
      "Every piece of content we create is an arrow for your quiver: each one illuminates a hidden truth, dispels a common myth, or unpacks a detail of the Iran Prosperity Project.",
    "home.statement.p3": "Now it's your turn to take aim.",

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

    "share.button": "Share",
    "share.x": "Post on X",
    "share.instagram": "View Reel",
    "share.youtube": "Watch Short",

    "about.title": "The Mission",
    "about.lead":
      "Most of the world knows very little about Iran or the Lion and Sun Revolution. That gap leaves room for misconceptions to spread unchallenged.",
    "about.goal.title": "The Goal",
    "about.goal.body":
      "Educate a global audience about a Free Iran — one that will soon benefit the entire world.",
    "about.method.title": "The Method",
    "about.method.body":
      "Short-form video content where every piece is an arrow for the quiver. Each arrow does one of three things.",
    "about.arrow.truth": "Illuminates a hidden truth.",
    "about.arrow.myth": "Dispels a common myth.",
    "about.arrow.project": "Unpacks a detail of the Iran Prosperity Project.",

    "promote.title": "Be the arrow.",
    "promote.body":
      "These videos only matter if they are seen. Watch them where they live, then like, comment, and repost — every share pushes the message past the regime's noise and into the world.",
    "promote.share": "Share this video",
    "promote.cta": "Share the series",

    "newsletter.headline": "Get the next arrow.",
    "newsletter.body":
      "Join the email list. We will send you each new video the moment it drops, so you are first in line to share it.",
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
      "بیشتر جهان درباره ایران و انقلاب شیر و خورشید چیز کمی می‌داند. مأموریت ما ساختن ابزارهایی است که به شما کمک می‌کند این را تغییر دهید — تا ایرانِ آزادی را به جهان نشان دهید که به‌زودی به سود همه ما خواهد بود.",
    "home.statement.p2":
      "هر محتوایی که می‌سازیم تیری برای ترکش توست: هر کدام حقیقتی پنهان را روشن می‌کند، افسانه‌ای رایج را باطل می‌کند، یا جزئیاتی از پروژه شکوفایی ایران را شرح می‌دهد.",
    "home.statement.p3": "حالا نوبت توست که نشانه بگیری.",

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

    "share.button": "هم‌رسانی",
    "share.x": "انتشار در ایکس",
    "share.instagram": "دیدن ریل",
    "share.youtube": "تماشای شورت",

    "about.title": "مأموریت",
    "about.lead":
      "بیشتر جهان درباره ایران یا انقلاب شیر و خورشید بسیار کم می‌داند. این شکاف فضایی می‌سازد که در آن برداشت‌های نادرست بدون چالش گسترش می‌یابند.",
    "about.goal.title": "هدف",
    "about.goal.body":
      "آگاه‌سازی مخاطبان جهانی درباره ایرانی آزاد — ایرانی که به‌زودی به سود تمام جهان خواهد بود.",
    "about.method.title": "روش",
    "about.method.body":
      "محتوای ویدیویی کوتاه که هر اثر، تیری برای ترکش است. هر تیر یکی از سه کار را انجام می‌دهد.",
    "about.arrow.truth": "حقیقتی پنهان را روشن می‌کند.",
    "about.arrow.myth": "افسانه‌ای رایج را باطل می‌کند.",
    "about.arrow.project": "جزئیاتی از پروژه شکوفایی ایران را شرح می‌دهد.",

    "promote.title": "تو خودِ تیر باش.",
    "promote.body":
      "این ویدیوها تنها وقتی اهمیت دارند که دیده شوند. آن‌ها را همان‌جا که منتشر شده‌اند تماشا کنید، سپس بپسندید، نظر بدهید و بازنشر کنید — هر هم‌رسانی پیام را از هیاهوی رژیم عبور می‌دهد و به جهان می‌رساند.",
    "promote.share": "این ویدیو را هم‌رسانی کن",
    "promote.cta": "هم‌رسانی مجموعه",

    "newsletter.headline": "تیر بعدی را دریافت کن.",
    "newsletter.body":
      "به فهرست ایمیل بپیوندید. هر ویدیوی تازه را همان لحظه‌ی انتشار برایتان می‌فرستیم تا اولین کسی باشید که آن را هم‌رسانی می‌کند.",
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
