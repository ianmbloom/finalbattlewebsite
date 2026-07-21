import type { Locale } from "@/consts";

/**
 * All user-facing UI copy keyed by locale. Video titles/scripts live in the
 * content collection; everything chrome-level lives here. Add a new locale by
 * adding a block with the same keys.
 */
export const ui = {
  en: {
    "site.name": "Final Battle",
    "site.subtitle": "Films",
    "site.tagline": "Educating the world about a free nation.",

    "nav.home": "Home",
    "nav.videos": "Videos",
    "nav.about": "About",
    "nav.support": "Fund",
    "nav.shop": "Shop",
    "nav.cart": "Cart",
    "nav.language": "Language",

    "common.soon": "Soon",

    "hero.cta.watch": "Watch the Series",

    "home.statement.p1":
      "Every piece of content we create is an arrow for your quiver: each one illuminates a hidden truth, dispels a common myth, or unpacks a detail of the IPP.",
    "home.hero.sub": "Every video is an arrow in your quiver: a truth few outside the country know, certainty for a bright future, a piece of the plan for a free nation.\n\nWatch them where they live, follow our channels, like, comment, and repost. Every share carries the message past the regime's noise and into the world.",

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
    "video.goToFa": "به فارسی برو",
    "video.goToEn": "Go to English",
    "video.faSoon": "Available for Persian speakers soon.",
    "video.enSoon": "Available for English speakers soon.",
    "video.comingSoon": "Coming Soon",
    "video.comingSoon.cta": "Be the first to know",

    "share.x": "Repost on X",
    "share.instagram": "Share on Instagram",
    "share.youtube": "Share on YouTube",
    "share.linkedin": "Repost on LinkedIn",

    "share.repost": "Share this video with your followers",
    "share.repostShort": "SHARE THIS VIDEO",
    "share.repostTitle": "Methods to repost this video:",
    "share.telegram": "Share on Telegram",
    "share.copyLink": "Copy link to this page",
    "share.copied": "Copied",
    "share.close": "Close",

    "social.follow": "Follow our channels:",
    "social.riseIran": "Support the democratic transition",

    "video.download": "Download and share anywhere",

    "about.title": "Who We Are",
    "about.image_alt":
      "A Persian mosaic of a flag-bearer raising the Lion and Sun flag.",
    "about.lead":
      "We are a small, unlikely band of friends who met online: a group of compatriots, a Jewish video editor, and an activist from Hong Kong. Among us, a true daughter of Persia whose luminous voice gives our videos their soul.",
    "about.vision.title": "Our Vision",
    "about.vision.body":
      "We are an independent collaboration bound by a single shared vision: a secular, democratic nation. Our task is to bring the IPP to life in content you can share. We stand with Reza Pahlavi and strive to reflect his message. Beyond that, we stay politically neutral: the goal is to build a coalition behind a transition. We can work out our differences once the nation is free.",
    "about.mission.title": "Our Mission",
    "about.mission.body":
      "Most of the world knows very little about the homeland or the Lion and Sun Revolution, and that silence leaves room for misconceptions to spread unchallenged. We want to change that: to show a global audience the free nation that will soon benefit us all. We do it with short videos, where every piece is an arrow for the quiver: each one illuminates a hidden truth, dispels a common myth, or unpacks a detail of the IPP.",
    "about.help.title": "How You Can Help",
    "about.help.body":
      "This is where you come in. These videos only matter if they are seen. Watch them where they live, then follow our channels, like, comment, and repost. Every share pushes the message past the regime's noise and into the world. Join our email list below to catch each new video the moment it drops. If you can, fund the work by {launch} or {shop}, or visit the {fund} page to back all our videos. We make it for free; you make it travel.",

    "link.fund": "funding",
    "link.launch": "launching a video",
    "link.shop": "wearing the message",

    "promote.title": "Be the archer.",
    "promote.body":
      "These videos only matter if they are seen. Watch them where they live, then follow our channels, like, comment, and repost. Every share pushes the message past the regime's noise and into the world.",
    "promote.share": "Share this video",

    "newsletter.headline": "Get the next arrow first.",
    "newsletter.body":
      "These videos only matter if they are seen. Join the email list and we'll send each new one the moment it drops, so you're first to watch, and first to share.",
    "newsletter.placeholder": "Your email",
    "newsletter.subscribe": "Subscribe",
    "newsletter.success": "You're on the list. We'll email you when the next video drops.",
    "newsletter.error": "Something went wrong. Please try again.",
    "newsletter.consent": "No spam. Unsubscribe anytime.",

    "popup.close": "Close",
    "popup.email.title": "Don't miss the next one.",
    "popup.email.body":
      "You've watched more than one, so you get it. Join the list and every new video lands in your inbox the moment it drops.",
    "popup.email.dismiss": "Maybe later",
    "popup.soon.title": "Be the first to see it.",
    "popup.soon.body":
      "“{film}” is on the way. Join the list and you'll be first to hear the moment it drops.",

    "launch.trigger": "Launch this video",
    "launch.anthem":
      "For the price of one Shahed drone,\nwe can open the eyes of millions.",
    "launch.action": "Launch this video:",
    "launch.mechanics":
      "You can give this video paid reach on Instagram and X and put wings on our next production.",
    "launch.counter": "{count} launched",
    "launch.error": "Something went wrong. Please try again.",
    "launch.confirm.title": "It's in the air.",
    "launch.confirm.body":
      "This message is now heading toward more people who haven't heard it.",
    "launch.confirm.repost": "Add your own voice: repost on X",
    "launch.confirm.fund.title": "Send another.",
    "launch.confirm.fund.body":
      "Every launch buys more reach and funds the next production. Pick another video to send further.",
    "launch.confirm.fund.cta": "Launch another video",

    "terms.title": "How launching works",
    "terms.lead":
      "Launching is patronage. When you back a video, you buy it paid reach on X and help fund the next one. That's the whole deal: your support carries the message to people who haven't seen it yet.",
    "terms.spend.title": "How we spend it",
    "terms.spend.body":
      "Launches are pooled and spent as ad reach on a regular cadence, weighted toward the videos people back most, so reach isn't bought one transaction at a time. A share of every launch funds the next production. X decides what it will promote; if a video is limited, that reach goes to the videos where it does the most good.",
    "terms.fund.title": "Fund everything",
    "terms.fund.body":
      "Launch backs one video at a time. To fund all our videos, visit the {fund} page.",

    "support.title": "Fund the Videos",
    "support.lead":
      "You can help us share\na confident vision for\na secular, democratic nation\nand teach the world about the IPP.",
    "support.donate.title": "Buy us a kotlet… or maybe a few",
    "support.donate.body":
      "Your patronage puts wings on our next video and sends it soaring to millions.",
    "support.error": "Could not start checkout. Please try again.",
    "support.donate.custom": "No guest goes unfed",
    "support.donate.customPlaceholder": "How many?",
    "support.shop.title": "Wear the message",
    "support.shop.body":
      "Grab a shirt or a print. Every order helps fund the next video.",
    "support.riseIran.title": "Support the democratic transition",
    "support.riseIran.body":
      "The best way to back the transition to a free, democratic nation is to please support the campaign led by Prince Reza Pahlavi directly.",

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

    "footer.rights": "See You In a Free Nation.",
    "footer.terms": "How launching works",
    "abbr.note": "Unfortunately, online platforms too often fail to distinguish between the current government and the people of our beloved nation, so we've found it necessary to abbreviate certain terms.",
  },
  fa: {
    "site.name": "نبرد نهایی",
    "site.subtitle": "فیلم‌ها",
    "site.tagline": "جهان را دربارهٔ میهنِ آزاد آگاه می‌کنیم.",

    "nav.home": "خانه",
    "nav.videos": "ویدیوها",
    "nav.about": "درباره",
    "nav.support": "تأمین مالی",
    "nav.shop": "فروشگاه",
    "nav.cart": "سبد خرید",
    "nav.language": "زبان",

    "common.soon": "به‌زودی",

    "hero.cta.watch": "تماشای مجموعه",

    "home.statement.p1":
      "هر محتوایی که می‌سازیم تیری برای ترکش توست: هر کدام حقیقتی پنهان را روشن می‌کند، افسانه‌ای رایج را باطل می‌کند، یا جزئیاتی از IPP را شرح می‌دهد.",

    "home.hero.sub": "هر ویدیو تیری در ترکش توست: حقیقتی که کمتر کسی بیرون از کشور می‌داند، یقین به آینده‌ای روشن، تکه‌ای از نقشهٔ میهنِ آزاد.\n\nآن‌ها را همان‌جا که منتشر شده‌اند تماشا کنید، کانال‌های ما را دنبال کنید، بپسندید، نظر بدهید و بازنشر کنید. هر هم‌رسانی پیام را از هیاهوی رژیم عبور می‌دهد و به جهان می‌رساند.",

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
    "video.goToFa": "به فارسی برو",
    "video.goToEn": "Go to English",
    "video.faSoon": "نسخه فارسی به‌زودی در دسترس قرار می‌گیرد.",
    "video.enSoon": "نسخه انگلیسی به‌زودی در دسترس قرار می‌گیرد.",
    "video.comingSoon": "به‌زودی",
    "video.comingSoon.cta": "اولین نفر باش که خبردار می‌شوی",

    "share.x": "بازنشر در ایکس",
    "share.instagram": "هم‌رسانی در اینستاگرام",
    "share.youtube": "هم‌رسانی در یوتیوب",
    "share.linkedin": "بازنشر در لینکدین",

    "share.repost": "این ویدیو را با دنبال‌کنندگانتان هم‌رسانی کنید",
    "share.repostShort": "این ویدیو را هم‌رسانی کنید",
    "share.repostTitle": "روش‌های بازنشر این ویدیو:",
    "share.telegram": "هم‌رسانی در تلگرام",
    "share.copyLink": "کپی لینک این صفحه",
    "share.copied": "کپی شد",
    "share.close": "بستن",

    "social.follow": "کانال‌های ما را دنبال کنید:",
    "social.riseIran": "از گذار دموکراتیک حمایت کنید",

    "video.download": "دانلود و هم‌رسانی در هر جا",

    "about.title": "ما که هستیم",
    "about.image_alt":
      "موزاییکی پارسی از پرچم‌داری که پرچم شیر و خورشید را برافراشته است.",
    "about.lead":
      "ما گروهی کوچک و نامحتمل از دوستانی هستیم که آنلاین با هم آشنا شدیم: گروهی از هم‌میهنان، یک تدوین‌گر ویدیوی یهودی، و کنشگری از هنگ‌کنگ. در میان ما، دختری راستین از پارس که صدای درخشانش به ویدیوهای ما جان می‌بخشد.",
    "about.vision.title": "چشم‌انداز ما",
    "about.vision.body":
      "ما یک همکاری مستقل هستیم که با یک چشم‌انداز مشترک به هم پیوسته‌ایم: ملتی سکولار و دموکراتیک. مأموریت ما این است که IPP را در قالب محتوایی که می‌توانید هم‌رسانی کنید، زنده کنیم. ما در کنار رضا پهلوی ایستاده‌ایم و کوشش می‌کنیم پیام او را بازتاب دهیم. فراتر از این، ما از نظر سیاسی بی‌طرف می‌مانیم: هدف، ساختن ائتلافی برای یک گذار است. اختلاف‌هایمان را می‌توانیم پس از آزادی میهن حل کنیم.",
    "about.mission.title": "مأموریت ما",
    "about.mission.body":
      "بیشتر جهان درباره‌ی میهن و انقلاب شیر و خورشید بسیار کم می‌داند، و این سکوت فضایی می‌سازد که در آن برداشت‌های نادرست بدون چالش گسترش می‌یابند. ما می‌خواهیم این را تغییر دهیم: تا میهنِ آزادی را به جهان نشان دهیم که به‌زودی به سود همه‌ی ما خواهد بود. این کار را با ویدیوهای کوتاه انجام می‌دهیم، جایی که هر اثر تیری برای ترکش است: هر کدام حقیقتی پنهان را روشن می‌کند، افسانه‌ای رایج را باطل می‌کند، یا جزئیاتی از IPP را شرح می‌دهد.",
    "about.help.title": "چگونه می‌توانید کمک کنید",
    "about.help.body":
      "اینجا جایی است که شما وارد می‌شوید. این ویدیوها تنها وقتی اهمیت دارند که دیده شوند. آن‌ها را همان‌جا که منتشر شده‌اند تماشا کنید، سپس کانال‌های ما را دنبال کنید، بپسندید، نظر بدهید و بازنشر کنید. هر هم‌رسانی پیام را از هیاهوی رژیم عبور می‌دهد و به جهان می‌رساند. در پایین به فهرست ایمیل ما بپیوندید تا هر ویدیوی تازه را همان لحظه‌ی انتشار دریافت کنید. اگر می‌توانید، با {launch} یا {shop} هزینهٔ این کار را تأمین کنید، یا برای حمایت از همهٔ ویدیوهایمان به {fund} بروید. ما آن را رایگان می‌سازیم؛ شما آن را به حرکت درمی‌آورید.",

    "link.fund": "صفحهٔ تأمین مالی",
    "link.launch": "پرتاب یک ویدیو",
    "link.shop": "پوشیدن پیام",

    "promote.title": "کماندار باش.",
    "promote.body":
      "این ویدیوها تنها وقتی اهمیت دارند که دیده شوند. آن‌ها را همان‌جا که منتشر شده‌اند تماشا کنید، سپس کانال‌های ما را دنبال کنید، بپسندید، نظر بدهید و بازنشر کنید. هر هم‌رسانی پیام را از هیاهوی رژیم عبور می‌دهد و به جهان می‌رساند.",
    "promote.share": "این ویدیو را هم‌رسانی کن",

    "newsletter.headline": "تیر بعدی را زودتر دریافت کن.",
    "newsletter.body":
      "این ویدیوها تنها وقتی اهمیت دارند که دیده شوند. به فهرست ایمیل بپیوندید تا هر ویدیوی تازه را همان لحظه‌ی انتشار برایتان بفرستیم تا اولین کسی باشید که آن را می‌بیند و هم‌رسانی می‌کند.",
    "newsletter.placeholder": "ایمیل شما",
    "newsletter.subscribe": "عضویت",
    "newsletter.success": "به فهرست اضافه شدی. وقتی ویدیوی بعدی منتشر شود برایت ایمیل می‌کنیم.",
    "newsletter.error": "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
    "newsletter.consent": "بدون هرزنامه. هر زمان بخواهید لغو عضویت کنید.",

    "popup.close": "بستن",
    "popup.email.title": "ویدیوی بعدی را از دست نده.",
    "popup.email.body":
      "بیش از یکی را تماشا کرده‌ای، پس اهلش هستی. به فهرست بپیوند تا هر ویدیوی تازه همان لحظه‌ی انتشار به ایمیلت برسد.",
    "popup.email.dismiss": "شاید بعداً",
    "popup.soon.title": "اولین نفری باش که می‌بیندش.",
    "popup.soon.body":
      "«{film}» در راه است. به فهرست بپیوند تا همان لحظه‌ی انتشار، اولین نفری باشی که خبردار می‌شود.",

    "launch.trigger": "این ویدیو را پرتاب کن",
    "launch.anthem":
      "به قیمت یک پهپاد شاهد، می‌توانیم میلیون‌ها شاهد بسازیم.",
    "launch.action": "این ویدیو را پرتاب کن:",
    "launch.mechanics":
      "می‌توانی به این ویدیو بازدید تبلیغاتی در اینستاگرام و ایکس بدهی و به تولید بعدی ما بال بدهی.",
    "launch.counter": "{count} پرتاب شده",
    "launch.error": "مشکلی پیش آمد. لطفاً دوباره تلاش کنید.",
    "launch.confirm.title": "پرتاب شد.",
    "launch.confirm.body":
      "این پیام حالا به سوی افراد بیشتری در حرکت است که هنوز آن را نشنیده‌اند.",
    "launch.confirm.repost": "صدای خودت را اضافه کن: در ایکس بازنشر کن",
    "launch.confirm.fund.title": "یکی دیگر بفرست.",
    "launch.confirm.fund.body":
      "هر پرتاب بازدید بیشتری می‌خرد و تولید بعدی را تأمین می‌کند. ویدیوی دیگری را برای فرستادن انتخاب کن.",
    "launch.confirm.fund.cta": "یک ویدیوی دیگر را پرتاب کن",

    "terms.title": "پرتاب چگونه کار می‌کند",
    "terms.lead":
      "پرتاب، حمایتگری است. وقتی از یک ویدیو پشتیبانی می‌کنی، برایش بازدید پولی در ایکس می‌خری و در ساخت ویدیوی بعدی سهیم می‌شوی. تمام ماجرا همین است: حمایت تو پیام را به دست کسانی می‌رساند که هنوز آن را ندیده‌اند.",
    "terms.spend.title": "چگونه آن را هزینه می‌کنیم",
    "terms.spend.body":
      "پرتاب‌ها در یک استخر جمع می‌شوند و به‌صورت دوره‌ای به‌عنوان بازدید تبلیغاتی هزینه می‌شوند، با وزن بیشتر برای ویدیوهایی که مردم بیشتر از آن‌ها حمایت می‌کنند؛ بنابراین بازدید تک‌به‌تک برای هر تراکنش خریده نمی‌شود. بخشی از هر پرتاب تولید ویدیوی بعدی را تأمین می‌کند. ایکس تصمیم می‌گیرد چه چیزی را تبلیغ کند؛ اگر ویدیویی محدود شود، آن بازدید به ویدیوهایی می‌رود که بیشترین اثر را دارند.",
    "terms.fund.title": "حمایت از همه",
    "terms.fund.body":
      "پرتاب هر بار یک ویدیو را پشتیبانی می‌کند. برای تأمین همهٔ ویدیوهایمان به {fund} بروید.",

    "support.title": "تأمین ویدیوها",
    "support.lead":
      "می‌توانی کمک کنی چشم‌اندازی مطمئن\nاز ملتی سکولار و دموکراتیک را به اشتراک بگذاریم\nو جهان را با IPP آشنا کنیم.",
    "support.donate.title": "برایمان یک کتلت بخر… یا شاید چند تا",
    "support.donate.body":
      "حمایت شما به ویدیوی بعدی ما بال می‌دهد و آن را به سوی میلیون‌ها نفر به پرواز درمی‌آورد.",
    "support.error": "شروع پرداخت ممکن نشد. لطفاً دوباره تلاش کن.",
    "support.donate.custom": "مهرِ نان و نمک",
    "support.donate.customPlaceholder": "چند تا؟",
    "support.shop.title": "پیام را بپوش",
    "support.shop.body":
      "یک تی‌شرت یا پوستر بگیر. هر سفارش به تأمین ویدیوی بعدی کمک می‌کند.",
    "support.riseIran.title": "از گذار دموکراتیک حمایت کنید",
    "support.riseIran.body":
      "بهترین راه برای پشتیبانی از گذار به میهنی آزاد و دموکراتیک این است که لطفاً مستقیماً از کارزار به رهبری شاهزاده رضا پهلوی حمایت کنی.",

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

    "footer.rights": "میهنِ آزاد.",
    "footer.terms": "پرتاب چگونه کار می‌کند",
    "abbr.note": "متأسفانه پلتفرم‌های آنلاین بارها میان حکومت کنونی و مردمِ میهن عزیز ما تمایز نمی‌گذارند، از این‌رو ناچار شده‌ایم برخی واژه‌ها را به‌صورت مخفف بنویسیم.",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof ui)["en"];
