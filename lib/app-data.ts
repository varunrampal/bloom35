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

export type AffiliateProduct = {
  bestFor: string;
  category: string;
  ctaLabel: string;
  href: string;
  imageAlt: string;
  imageSrc: string;
  note: string;
  summary: string;
  title: string;
};

export type CommonConcern = {
  href: string;
  name: string;
  signal: string;
  support: string;
  summary: string;
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
    href: "/library#sleep-pressure",
    name: "Sleep issues",
    summary:
      "Bedtime can turn unpredictable when warmth, stress, or cycle changes start stacking together.",
    signal: "Often shows up as trouble falling asleep, 3 AM wakeups, or less restorative rest.",
    support:
      "Start with a cooler room, a lighter evening routine, and notes on what changed before harder nights.",
  },
  {
    href: "/library#heat-management",
    name: "Hot flashes",
    summary:
      "Temperature shifts often feel most disruptive when they hit repeatedly in the late afternoon or overnight.",
    signal: "Often shows up as sudden warmth, night sweats, or a need to change layers fast.",
    support:
      "Keep cooling tools close, notice timing patterns, and build routines around the hours symptoms cluster.",
  },
  {
    href: "/library#focus-fog",
    name: "Brain fog",
    summary:
      "Cognitive noise can make simple tasks feel heavier, especially when sleep and stress are already stretched.",
    signal: "Often shows up as slower recall, more rereading, or lower tolerance for context switching.",
    support:
      "Use shorter work blocks, fewer open tabs, and simpler plans on days when clarity drops.",
  },
  {
    href: "/library#mood-language",
    name: "Mood shifts",
    summary:
      "Emotional swings can feel sharper or arrive faster when hormones, sleep disruption, and workload overlap.",
    signal: "Often shows up as irritability, overwhelm, tears, or feeling less resourced than usual.",
    support:
      "Track mood with timing and context so it is easier to spot patterns and talk about what is changing.",
  },
];

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
    note: "This one highlights dual-sided cooling fabric, queen-size coverage, and machine-washable care.",
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
    note: "Oscillation and low-noise settings tend to matter more than raw power.",
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
    note: "A straw lid or easy-open cap usually makes daily use more consistent.",
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
    note: "Simple page layouts usually work better than overly detailed trackers.",
    ctaLabel: "Browse journals",
    href: createAmazonSearchLink("wellness symptom tracker journal"),
  },
];
