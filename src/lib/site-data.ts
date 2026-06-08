export const externalLinks = {
  stripe: "https://buy.stripe.com/test_placeholder",
  calendly: "https://calendly.com/yatishg/30min",
  email: `mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@techbckp.com"}`,
};

export const navItems = [
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export const services = [
  {
    name: "MVP Launch System",
    price: "$2,000+",
    duration: "45 Days",
    description:
      "Launch your app or SaaS product quickly with a clean roadmap, product architecture, and a launch-ready version.",
    includes: [
      "Core feature roadmap",
      "Scalable tech stack",
      "Cloud infrastructure setup",
      "Deployment and launch",
    ],
  },
  {
    name: "Business Automation Setup",
    price: "$500+",
    duration: "30 Days",
    description:
      "Replace repetitive tasks with connected workflows, reporting, and systems your team can actually maintain.",
    includes: [
      "Workflow automation",
      "API integrations",
      "Data synchronization",
      "Training and support",
    ],
    featured: true,
  },
  {
    name: "Conversion Website Setup",
    price: "$500 - $1,500",
    duration: "21 Days",
    description:
      "Build high-converting websites with focused messaging, fast pages, and clear CTAs for your offer.",
    includes: [
      "Custom design",
      "Responsive development",
      "SEO foundations",
      "Performance optimization",
    ],
  },
  {
    name: "Content Growth System",
    price: "$300+",
    duration: "90 Days",
    description:
      "Turn your expertise into a repeatable content engine that builds trust and generates qualified leads.",
    includes: [
      "Content strategy",
      "Production workflow",
      "Distribution automation",
      "Analytics and reporting",
    ],
  },
];

export const audiences = [
  {
    title: "Founders",
    body: "Launch faster without hiring a full tech team. We help you validate and ship with confidence.",
  },
  {
    title: "Coaches & Creators",
    body: "Productize your expertise with systems that sell while you focus on serving your audience.",
  },
  {
    title: "Niche Businesses",
    body: "From fitness to eCommerce to digital brands, we build systems that remove execution bottlenecks.",
  },
];

export const processSteps = [
  {
    title: "Idea",
    subtitle: "We refine what to build",
    description:
      "We clarify your offer, define your fastest path to results, and map what truly matters for version one.",
  },
  {
    title: "Build",
    subtitle: "We use proven systems and templates",
    description:
      "Execution starts with tested foundations. We build with reusable systems to move fast without chaos.",
  },
  {
    title: "Launch",
    subtitle: "Your product or system is ready for growth",
    description:
      "We ship your solution with clear handoff and optimization priorities so growth is the next move, not a guess.",
  },
];

export const qualification = {
  goodFit: [
    "Founders with a clear problem to solve",
    "Experts looking to productize services",
    "Businesses needing systems, not random tasks",
  ],
  notFit: [
    "One-off design-only requests",
    "Projects without clear ownership",
    "Teams looking only for cheap labor",
  ],
};
