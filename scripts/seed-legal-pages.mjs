// Creates Privacy Policy + Terms of Service pages under the Techbckp parent
// Notion page, fills them with structured blocks, and prints their IDs so they
// can be added to .env.local as NOTION_PAGE_PRIVACY / NOTION_PAGE_TERMS.
//
// Run: node --env-file=.env.local scripts/seed-legal-pages.mjs

const PARENT_PAGE_ID = "35121165-c02b-8058-ad2f-cd33df161246";

const headers = {
  Authorization: `Bearer ${process.env.NOTION_API_KEY}`,
  "Notion-Version": "2022-06-28",
  "Content-Type": "application/json",
};

const rt = (s) => [{ type: "text", text: { content: s } }];
const p = (s) => ({ object: "block", type: "paragraph", paragraph: { rich_text: rt(s) } });
const h2 = (s) => ({ object: "block", type: "heading_2", heading_2: { rich_text: rt(s) } });
const h3 = (s) => ({ object: "block", type: "heading_3", heading_3: { rich_text: rt(s) } });
const li = (s) => ({ object: "block", type: "bulleted_list_item", bulleted_list_item: { rich_text: rt(s) } });
const divider = () => ({ object: "block", type: "divider", divider: {} });
const callout = (s, emoji = "ℹ️") => ({
  object: "block",
  type: "callout",
  callout: { rich_text: rt(s), icon: { type: "emoji", emoji } },
});

const privacyBlocks = [
  callout("Effective Date: May 1, 2026"),
  p('Welcome to Techbckp ("we", "our", "us"). Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our website and services.'),
  h2("1. Information We Collect"),
  p("We may collect the following types of information:"),
  h3("a. Personal Information"),
  li("Name"),
  li("Email address"),
  li("Payment details (processed securely via third-party providers like Stripe)"),
  li("Any information you provide via forms or communication"),
  h3("b. Non-Personal Information"),
  li("Browser type"),
  li("Device information"),
  li("IP address"),
  li("Usage data (pages visited, time spent)"),
  divider(),
  h2("2. How We Use Your Information"),
  p("We use your information to:"),
  li("Provide and deliver our services"),
  li("Process payments"),
  li("Improve our website and offerings"),
  li("Communicate updates, offers, or support"),
  li("Ensure security and prevent fraud"),
  divider(),
  h2("3. Third-Party Services"),
  p("We may use trusted third-party services such as:"),
  li("Payment processors (e.g., Stripe)"),
  li("Analytics tools"),
  li("Email services"),
  p("These providers handle your data according to their own privacy policies."),
  divider(),
  h2("4. Data Security"),
  p("We implement reasonable security measures to protect your data. However, no system is 100% secure."),
  divider(),
  h2("5. Cookies"),
  p("We may use cookies to:"),
  li("Improve user experience"),
  li("Analyze traffic"),
  li("Personalize content"),
  p("You can disable cookies via your browser settings."),
  divider(),
  h2("6. Your Rights"),
  p("Depending on your location, you may have rights to:"),
  li("Access your data"),
  li("Request correction or deletion"),
  li("Opt-out of marketing emails"),
  p("Contact us at: contact@techbckp.com"),
  divider(),
  h2("7. Changes to This Policy"),
  p("We may update this Privacy Policy from time to time. Changes will be posted on this page."),
  divider(),
  h2("8. Contact Us"),
  p("If you have questions:"),
  li("Email: contact@techbckp.com"),
  li("Website: https://www.techbckp.com/"),
];

const termsBlocks = [
  callout("Effective Date: May 1, 2026"),
  p("Welcome to Techbckp. By using our website and services, you agree to the following terms."),
  divider(),
  h2("1. Use of Services"),
  p("You agree to use our services only for lawful purposes. You must not:"),
  li("Violate any laws"),
  li("Misuse or exploit our platform"),
  li("Attempt unauthorized access"),
  divider(),
  h2("2. Services Provided"),
  p("Techbckp provides:"),
  li("Digital products"),
  li("Software solutions"),
  li("Consulting and related services"),
  p('All services are provided "as is" unless otherwise agreed.'),
  divider(),
  h2("3. Payments & Refunds"),
  li("Payments are processed securely via third-party providers"),
  li("Pricing is subject to change"),
  li("Refunds are provided only if explicitly stated"),
  divider(),
  h2("4. Intellectual Property"),
  p("All content, branding, and materials are owned by Techbckp unless stated otherwise."),
  p("You may not:"),
  li("Copy"),
  li("Resell"),
  li("Redistribute"),
  p("without permission."),
  divider(),
  h2("5. User Content"),
  p("If you submit content (messages, feedback, etc.):"),
  li("You grant us the right to use it for improving services"),
  li("You confirm you own or have rights to it"),
  divider(),
  h2("6. Limitation of Liability"),
  p("We are not liable for:"),
  li("Indirect or incidental damages"),
  li("Loss of data or profits"),
  li("Service interruptions"),
  p("Use services at your own risk."),
  divider(),
  h2("7. Termination"),
  p("We may suspend or terminate access if:"),
  li("Terms are violated"),
  li("Misuse is detected"),
  divider(),
  h2("8. Changes to Terms"),
  p("We may update these terms at any time. Continued use means acceptance."),
  divider(),
  h2("9. Governing Law"),
  p("These terms are governed by the laws of the United States."),
  divider(),
  h2("10. Contact"),
  li("Email: contact@techbckp.com"),
  li("Website: https://www.techbckp.com/"),
];

async function createPage(title, blocks) {
  // Notion limits page creation to 100 children; both fit easily.
  const r = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers,
    body: JSON.stringify({
      parent: { type: "page_id", page_id: PARENT_PAGE_ID },
      properties: { title: { title: rt(title) } },
      children: blocks,
    }),
  });
  const j = await r.json();
  if (!r.ok) {
    console.error(`FAIL ${title}:`, r.status, j.code, j.message);
    process.exit(1);
  }
  console.log(`OK   ${title}: ${j.id}  (${blocks.length} blocks)`);
  return j.id;
}

(async () => {
  const privacyId = await createPage("Privacy Policy", privacyBlocks);
  const termsId = await createPage("Terms of Service", termsBlocks);
  console.log("\nAdd to .env.local:");
  console.log(`NOTION_PAGE_PRIVACY=${privacyId.replace(/-/g, "")}`);
  console.log(`NOTION_PAGE_TERMS=${termsId.replace(/-/g, "")}`);
})();
