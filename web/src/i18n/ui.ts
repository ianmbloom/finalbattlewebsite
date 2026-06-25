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
    "nav.language": "Language",

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

    "footer.rights": "See You In Free Iran.",
  },
  fa: {
    "site.name": "نبرد نهایی",
    "site.subtitle": "برای ایران",
    "site.tagline": "حالا نوبت توست که نشانه بگیری.",

    "nav.home": "خانه",
    "nav.videos": "ویدیوها",
    "nav.about": "درباره",
    "nav.language": "زبان",

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

    "footer.rights": "ایران آزاد.",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof ui)["en"];
