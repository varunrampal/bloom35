export type CheckInField = {
  highLabel: string;
  hint: string;
  id: string;
  label: string;
  lowLabel: string;
};

export type ResourceTopic = {
  category: string;
  readTime: string;
  slug: string;
  summary: string;
  tags: string[];
  title: string;
};

export type BlogPreviewSource = "managed" | "starter";

export type BlogPreview = {
  category: string;
  href: string;
  readTime: string;
  slug: string;
  source: BlogPreviewSource;
  summary: string;
  tags: string[];
  title: string;
};

export type BlogArticleCard = {
  description: string;
  title: string;
};

export type BlogRecommendedProductOption = {
  bestFor: string;
  category: string;
  id: number;
  isEnabled: boolean;
  summary: string;
  title: string;
};

export type BlogArticleContent = {
  authorName: string;
  authorRole: string;
  body: string;
  bodyHeading: string;
  breadcrumb: string;
  closing: string;
  closingHeading: string;
  ctaDescription: string;
  ctaPrimaryHref: string;
  ctaPrimaryLabel: string;
  ctaSecondaryHref: string;
  ctaSecondaryLabel: string;
  ctaTitle: string;
  foods: BlogArticleCard[];
  foodsHeading: string;
  foodsIntro: string;
  heroImageAlt: string;
  heroImageSrc: string;
  intro: string;
  label: string;
  recommendedProductIds: number[];
  statDescription: string;
  statFootnote: string;
  statValue: string;
  strategies: BlogArticleCard[];
  strategiesHeading: string;
  strategiesIntro: string;
  subtitle: string;
  takeaway: string;
};

export type ManagedBlogPost = BlogPreview & {
  authorName: string;
  authorRole: string;
  breadcrumb: string;
  createdAt: string;
  description: string;
  hasAffiliateLinks: boolean;
  id: number;
  structuredContent: BlogArticleContent | null;
  subtitle: string;
};

export type AffiliateProduct = {
  bestFor: string;
  category: string;
  ctaLabel: string;
  href: string;
  imageAlt: string;
  imageSrc: string;
  summary: string;
  title: string;
};

export type CommonConcern = {
  firstSteps: string[];
  guideHref: string;
  href: string;
  name: string;
  overview: string[];
  patterns: string[];
  signal: string;
  slug: string;
  support: string;
  summary: string;
  trackTips: string[];
};

const amazonAssociateTag = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG;

const createAmazonSearchLink = (searchTerm: string) => {
  const url = new URL("https://www.amazon.com/s");

  url.searchParams.set("k", searchTerm);

  if (amazonAssociateTag) {
    url.searchParams.set("tag", amazonAssociateTag);
  }

  return url.toString();
};

export const allAffiliateProductsHref = createAmazonSearchLink(
  "perimenopause cooling sleep support products",
);

export const commonConcerns: CommonConcern[] = [
  {
    firstSteps: [
      "Lower friction before bed with a cooler room, lighter layers, and a shorter wind-down routine.",
      "Notice whether heat, stress, caffeine timing, or late-evening work changes are making nights harder.",
      "Aim for repeatable supports you can stick with on tired days, not a perfect bedtime checklist.",
    ],
    guideHref: "/library#sleep-pressure",
    href: "/concerns/sleep-issues",
    name: "Sleep issues",
    overview: [
      "Sleep disruption in perimenopause often comes from several things stacking together at once: temperature shifts, changing cycle timing, stress, and a body that feels less predictable at night than it used to.",
      "That is why sleep can suddenly feel inconsistent even if your routine has not changed much. The goal is usually not to control every variable, but to make nights easier to recover from and patterns easier to spot.",
    ],
    patterns: [
      "Feeling tired all day but suddenly more alert once it is finally time to sleep.",
      "Waking in the middle of the night warm, uncomfortable, or mentally switched on.",
      "Sleeping enough hours on paper but still waking up unrested or easily depleted.",
    ],
    summary:
      "Bedtime can turn unpredictable when warmth, stress, or cycle changes start stacking together.",
    signal: "Often shows up as trouble falling asleep, 3 AM wakeups, or less restorative rest.",
    slug: "sleep-issues",
    support:
      "Start with a cooler room, a lighter evening routine, and notes on what changed before harder nights.",
    trackTips: [
      "What time you fell asleep, when wakeups happened, and whether heat or racing thoughts showed up first.",
      "Anything that changed on harder nights, like alcohol, caffeine, travel, work stress, or heavier evening meals.",
      "Whether better nights have anything in common, so you can repeat what is actually helping.",
    ],
  },
  {
    firstSteps: [
      "Keep cooling supports close before symptoms start, not just after they build.",
      "Use lighter layers, breathable fabrics, and flexible hydration routines through the part of the day symptoms cluster.",
      "Track timing so you can spot whether heat symptoms are more tied to sleep, stress, meals, or cycle changes.",
    ],
    guideHref: "/library#heat-management",
    href: "/concerns/hot-flashes",
    name: "Hot flashes",
    overview: [
      "Hot flashes and night sweats can feel especially disruptive because they arrive quickly and can interrupt work, sleep, and confidence without much warning.",
      "A lot of support starts with timing. The more clearly you can see when symptoms tend to cluster, the easier it becomes to build routines around those windows instead of reacting from scratch every time.",
    ],
    patterns: [
      "Sudden waves of warmth that rise fast and leave you needing air, water, or a clothing change.",
      "Night sweats that interrupt sleep and make it harder to fall back asleep comfortably.",
      "Afternoon or evening heat spikes that seem more intense during stressful or busy stretches.",
    ],
    summary:
      "Temperature shifts often feel most disruptive when they hit repeatedly in the late afternoon or overnight.",
    signal: "Often shows up as sudden warmth, night sweats, or a need to change layers fast.",
    slug: "hot-flashes",
    support:
      "Keep cooling tools close, notice timing patterns, and build routines around the hours symptoms cluster.",
    trackTips: [
      "When heat symptoms happen most often and how long they tend to last.",
      "Whether certain contexts like stress, warm rooms, spicy meals, or disrupted sleep seem to intensify them.",
      "How much symptoms are affecting rest, work, or daily functioning so you can describe impact clearly.",
    ],
  },
  {
    firstSteps: [
      "Reduce switching costs by simplifying plans, closing extra tabs, and shrinking your must-do list on foggier days.",
      "Protect the hours when your mind feels clearest for heavier thinking, and use low-friction tasks for noisier windows.",
      "Look at sleep, stress, and meal timing alongside focus changes rather than treating fog as an isolated problem.",
    ],
    guideHref: "/library#focus-fog",
    href: "/concerns/brain-fog",
    name: "Brain fog",
    overview: [
      "Brain fog can feel frustrating because it often changes how capable you feel from one day to the next. Tasks that are normally simple may suddenly require more rereading, more reminders, or more effort to start.",
      "That does not mean you are doing something wrong. It usually helps to work with the pattern by lowering cognitive friction, protecting clearer windows, and noticing what seems to make foggier days worse.",
    ],
    patterns: [
      "More rereading, slower recall, or a harder time holding several steps in mind at once.",
      "Losing momentum after interruptions and needing more time to re-enter work.",
      "Feeling mentally tired earlier in the day, especially after poor sleep or higher stress.",
    ],
    summary:
      "Cognitive noise can make simple tasks feel heavier, especially when sleep and stress are already stretched.",
    signal: "Often shows up as slower recall, more rereading, or lower tolerance for context switching.",
    slug: "brain-fog",
    support:
      "Use shorter work blocks, fewer open tabs, and simpler plans on days when clarity drops.",
    trackTips: [
      "What times of day feel clearest versus hardest for concentration.",
      "Whether fog correlates with sleep quality, skipped meals, stress spikes, or temperature symptoms.",
      "Which workarounds help most, so you can build a routine around what actually reduces mental load.",
    ],
  },
  {
    firstSteps: [
      "Track mood with timing and context so you can see whether swings have recognizable patterns instead of feeling random.",
      "Lower extra strain where possible on more reactive days by shortening decisions, reducing overload, and asking for support earlier.",
      "Use more specific language than 'I feel off' so it is easier to explain what is changing and what kind of support would help.",
    ],
    guideHref: "/library#mood-language",
    href: "/concerns/mood-shifts",
    name: "Mood shifts",
    overview: [
      "Mood changes during perimenopause can feel sharper because they are often layered on top of sleep disruption, temperature symptoms, workload, caregiving, and a body that feels less predictable than usual.",
      "Patterns matter here too. When you can connect mood shifts to timing, context, and physical symptoms, it becomes easier to respond with more support and talk about what is happening in a more useful way.",
    ],
    patterns: [
      "Shorter patience, irritability, or overwhelm that seems to arrive faster than it used to.",
      "Feeling tearful, flat, or more emotionally exposed during already demanding weeks.",
      "Mood swings that feel harder to explain unless you also look at sleep, cycle changes, and stress load.",
    ],
    summary:
      "Emotional swings can feel sharper or arrive faster when hormones, sleep disruption, and workload overlap.",
    signal: "Often shows up as irritability, overwhelm, tears, or feeling less resourced than usual.",
    slug: "mood-shifts",
    support:
      "Track mood with timing and context so it is easier to spot patterns and talk about what is changing.",
    trackTips: [
      "When mood shifts show up and what else was happening physically or emotionally around that time.",
      "Whether certain cycle windows, sleep disruptions, or higher-stress periods make changes more noticeable.",
      "How symptoms affect relationships, work, or recovery so you can describe impact clearly if you need support.",
    ],
  },
];

export const getCommonConcernBySlug = (slug: string) =>
  commonConcerns.find((concern) => concern.slug === slug) ?? null;

export const checkInFields: CheckInField[] = [
  {
    id: "sleep",
    label: "Sleep quality",
    hint: "How restorative did last night feel overall?",
    lowLabel: "Rested",
    highLabel: "Disrupted",
  },
  {
    id: "temperature",
    label: "Temperature symptoms",
    hint: "Think hot flashes, warmth surges, or night sweats.",
    lowLabel: "Quiet",
    highLabel: "Frequent",
  },
  {
    id: "mood",
    label: "Mood variability",
    hint: "How much emotional swing or irritability showed up today?",
    lowLabel: "Steady",
    highLabel: "High",
  },
  {
    id: "focus",
    label: "Focus + mental clarity",
    hint: "How noisy or effortful did concentration feel?",
    lowLabel: "Clear",
    highLabel: "Foggy",
  },
  {
    id: "energy",
    label: "Energy",
    hint: "How depleted or resourced did your body feel?",
    lowLabel: "Resourced",
    highLabel: "Drained",
  },
];

export const supportTracks = [
  "Cooling plan",
  "Sleep buffer",
  "Mood support",
  "Nourishment reset",
  "Gentle movement",
];

export const journalPrompts = [
  "What time of day felt hardest, and what was happening around it?",
  "Was there anything that made symptoms feel even 10% easier to carry?",
  "Did today feel more tied to sleep, stress, temperature, or cycle changes?",
  "What is one thing tomorrow's version of you would want to remember?",
];

export const clinicianPrep = [
  "How have my symptoms changed over the last 6 to 8 weeks, not just this week?",
  "Which symptoms are most affecting sleep, work, or quality of life right now?",
  "Are there patterns around cycle length, skipped periods, or heavier bleeding worth flagging?",
  "What tracking format would make my next appointment more useful?",
];

export const resourceTopics: ResourceTopic[] = [
  {
    slug: "tracking-basics",
    category: "Start here",
    title: "Tracking without making your whole day about symptoms",
    summary:
      "A lightweight framework for following sleep, cycle changes, mood, and temperature symptoms without checking in constantly.",
    readTime: "4 min read",
    tags: ["tracking", "routine", "overview"],
  },
  {
    slug: "sleep-pressure",
    category: "Sleep",
    title: "What to do when perimenopause turns bedtime into a negotiation",
    summary:
      "A calmer approach to wind-down routines that prioritizes lower friction over perfect habits.",
    readTime: "5 min read",
    tags: ["sleep", "night sweats", "habits"],
  },
  {
    slug: "heat-management",
    category: "Temperature",
    title: "Cooling strategies that fit real afternoons and real nights",
    summary:
      "Design simple temperature support around the hours when symptoms tend to cluster most often.",
    readTime: "3 min read",
    tags: ["hot flashes", "night sweats", "cooling"],
  },
  {
    slug: "focus-fog",
    category: "Focus",
    title: "Working with brain fog instead of fighting it every hour",
    summary:
      "Use shorter focus windows, lower switching costs, and simpler planning on noisier cognition days.",
    readTime: "4 min read",
    tags: ["focus", "brain fog", "work"],
  },
  {
    slug: "mood-language",
    category: "Mood",
    title: "Language for describing mood shifts in a more useful way",
    summary:
      "Move from vague overwhelm to patterns that are easier to understand and talk through with support people or clinicians.",
    readTime: "4 min read",
    tags: ["mood", "reflection", "communication"],
  },
  {
    slug: "appointment-summary",
    category: "Care",
    title: "How to turn symptom notes into a better care conversation",
    summary:
      "A short guide to preparing summaries that highlight timing, severity, and the impact on daily life.",
    readTime: "6 min read",
    tags: ["appointments", "care team", "summary"],
  },
];

export const affiliateProducts: AffiliateProduct[] = [
  {
    category: "Cooling",
    title: "Breathable cooling blanket",
    summary:
      "A queen-size cooling blanket with dual-sided breathable fabric designed to feel lighter, cooler, and more comfortable for hot sleepers on warm nights.",
    bestFor: "Hot sleepers and night sweats",
    imageAlt:
      "KMUSET breathable cooling blanket in grey folded on a bed.",
    imageSrc:
      "https://m.media-amazon.com/images/I/91X5CRuEJ2L._AC_SL1500_.jpg",
    ctaLabel: "View on Amazon",
    href: "https://amzn.to/4cCqK57",
  },
  {
    category: "Bedroom",
    title: "Quiet bedside fan",
    summary:
      "A small fan can support a more flexible cooling setup without reworking the whole room.",
    bestFor: "Quick airflow during sleep or desk time",
    imageAlt: "Illustration of a compact bedside fan on a table.",
    imageSrc: "/products/bedside-fan.svg",
    ctaLabel: "Shop Amazon",
    href: createAmazonSearchLink("quiet bedside fan for bedroom"),
  },
  {
    category: "Hydration",
    title: "Insulated water bottle",
    summary:
      "Cold water within reach makes hydration cues simpler to follow on higher-noise symptom days.",
    bestFor: "Keeping water cold through work blocks",
    imageAlt: "Illustration of an insulated water bottle with a straw lid.",
    imageSrc: "/products/water-bottle.svg",
    ctaLabel: "See bottle options",
    href: createAmazonSearchLink("insulated water bottle with straw"),
  },
  {
    category: "Tracking",
    title: "Symptom and sleep journal",
    summary:
      "A dedicated notebook can make it easier to notice timing, triggers, and what helped enough to repeat.",
    bestFor: "Patterns you want to bring to appointments",
    imageAlt: "Illustration of a wellness journal with a pen and bookmark.",
    imageSrc: "/products/symptom-journal.svg",
    ctaLabel: "Browse journals",
    href: createAmazonSearchLink("wellness symptom tracker journal"),
  },
];
