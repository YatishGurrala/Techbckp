// Seeds two Notion blog post pages with body content.
// Run: node --env-file=.env.local scripts/seed-blog-content.mjs

const headers = {
  Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

const p = (s) => ({
  object: "block",
  type: "paragraph",
  paragraph: { rich_text: [{ type: "text", text: { content: s } }] },
});
const h2 = (s) => ({
  object: "block",
  type: "heading_2",
  heading_2: { rich_text: [{ type: "text", text: { content: s } }] },
});
const h3 = (s) => ({
  object: "block",
  type: "heading_3",
  heading_3: { rich_text: [{ type: "text", text: { content: s } }] },
});
const li = (s) => ({
  object: "block",
  type: "bulleted_list_item",
  bulleted_list_item: { rich_text: [{ type: "text", text: { content: s } }] },
});
const ol = (s) => ({
  object: "block",
  type: "numbered_list_item",
  numbered_list_item: { rich_text: [{ type: "text", text: { content: s } }] },
});
const quote = (s) => ({
  object: "block",
  type: "quote",
  quote: { rich_text: [{ type: "text", text: { content: s } }] },
});
const callout = (s) => ({
  object: "block",
  type: "callout",
  callout: {
    rich_text: [{ type: "text", text: { content: s } }],
    icon: { type: "emoji", emoji: "💡" },
  },
});
const divider = () => ({ object: "block", type: "divider", divider: {} });

const posts = [
  {
    id: "10fdbb8f-db89-4319-aa8e-5a420be12f5f",
    title: "From Idea to MVP in 45 Days",
    blocks: [
      p(
        "Most founders do not need a six-month roadmap. They need a working product that real users can touch in weeks, not quarters. The 45-day MVP framework strips the launch process down to the only steps that actually move the needle.",
      ),
      h2("Why 45 days, not 90"),
      p(
        "A 90-day plan invites scope creep. A 45-day window forces ruthless prioritization, which is the exact muscle every early-stage founder needs to build. Constraints make decisions easier and force a single, testable thesis to the surface.",
      ),
      callout(
        "If a feature does not validate or invalidate your core hypothesis, it does not belong in v1.",
      ),
      h2("The four-stage execution plan"),
      h3("Week 1 — Decide"),
      p(
        "Pick exactly one user, one job-to-be-done, and one outcome they will pay for. Write it as a single sentence. If you cannot, you do not have a thesis yet.",
      ),
      li("Define the smallest action a user must take to prove value."),
      li("List 3 metrics you will watch after launch (one acquisition, one activation, one retention)."),
      li("Lock the scope in writing. Anything else goes to a v2 backlog."),
      h3("Weeks 2–4 — Build"),
      p(
        "Choose a stack you can ship with, not the trendiest one. Boring infrastructure beats clever infrastructure when the goal is shipping in days.",
      ),
      li("Auth, payments, and data: pick managed services. Do not roll your own."),
      li("Use one component library. Do not redesign the wheel."),
      li("Ship in branches. Deploy preview every PR so feedback is continuous."),
      h3("Week 5 — Polish"),
      p(
        "Spend the week on the three things users notice in the first 60 seconds: empty states, loading states, and error states. These are the difference between a demo and a product.",
      ),
      h3("Weeks 6 — Launch"),
      p(
        "Soft launch to 10 hand-picked users, then a public launch on day 45. Announce the metric you are watching, not the feature list.",
      ),
      h2("Common traps"),
      li("Designing the v3 dashboard before you have v1 users."),
      li("Building admin tooling for a product nobody is using yet."),
      li("Adding a second persona before the first one is paying."),
      divider(),
      quote(
        "Speed is the only competitive advantage early-stage founders actually have. Use it.",
      ),
      p(
        "If you can hold the line for 45 days, you will end the sprint with a product, paying users, and the data to make the next decision with conviction instead of opinion.",
      ),
    ],
  },
  {
    id: "ccc83be5-587c-4692-8a09-e2a5bd73aaf0",
    title: "Automation That Actually Sticks",
    blocks: [
      p(
        "Most automation projects die for the same reason: they were built around a tool, not a workflow. The result is a beautiful Zap that nobody trusts and nobody maintains six months later.",
      ),
      h2("The three failure modes"),
      h3("1. Automating chaos"),
      p(
        "If a process is not documented and stable, automation only makes the chaos faster. Map the workflow on paper before opening any builder.",
      ),
      h3("2. Optimizing for clever, not clear"),
      p(
        "Multi-branch flows feel impressive but break in subtle ways. Linear flows with clear handoffs survive team turnover and edge cases.",
      ),
      h3("3. No owner, no observability"),
      p(
        "Every automation needs a human owner and a place where failures show up. Silent automations rot until they are expensive to fix.",
      ),
      h2("A workflow that survives"),
      ol("Document the manual process end to end with the team that runs it."),
      ol("Identify the single most repetitive step. Automate only that step first."),
      ol("Measure time saved for two weeks. Confirm the team prefers the new flow."),
      ol("Add the next step. Repeat."),
      callout(
        "Ship one boring automation that runs every day for a year, not ten clever ones that break in a month.",
      ),
      h2("Choosing a tool"),
      li("n8n or Make.com when you need branching logic and self-hosting options."),
      li("Zapier when speed-to-first-value matters more than cost-at-scale."),
      li("Custom code when the workflow touches your core product or sensitive data."),
      h2("The maintenance contract"),
      p(
        "Treat every automation like a small piece of production software. Add it to a runbook, give it an owner, and review it quarterly. The automations that stick are the ones somebody loves.",
      ),
      divider(),
      quote(
        "Automation is not about removing humans. It is about removing the parts of the job humans should not be doing.",
      ),
    ],
  },
];

(async () => {
  for (const post of posts) {
    // Notion accepts up to 100 children per request; both posts fit.
    const r = await fetch(
      `https://api.notion.com/v1/blocks/${post.id}/children`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ children: post.blocks }),
      },
    );
    const j = await r.json();
    if (!r.ok) {
      console.error(`FAIL ${post.title}:`, r.status, j.code, j.message);
    } else {
      console.log(`OK   ${post.title}: appended ${post.blocks.length} blocks`);
    }
  }
})();
