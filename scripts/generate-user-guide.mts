// Generates docs/user-guide.pdf — a workflow/functionality guide for the
// Material & Operations Management System. Not part of the app; run with
// `npx tsx scripts/generate-user-guide.mts`.
// @ts-expect-error - Node build has no bundled type declarations
import jspdfNode from "../node_modules/jspdf/dist/jspdf.node.js";
import autoTable from "jspdf-autotable";
import { writeFileSync } from "node:fs";

const { jsPDF } = jspdfNode;

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const MARGIN = 18;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const NAVY: [number, number, number] = [0, 23, 36];
const INDIGO: [number, number, number] = [0, 99, 153];
const GOLD: [number, number, number] = [244, 166, 11];

const doc = new jsPDF({ unit: "mm", format: "a4" });
let y = MARGIN;
let pageNum = 1;

function footer() {
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    `Material & Operations Management System — User Guide`,
    MARGIN,
    PAGE_HEIGHT - 10
  );
  doc.text(String(pageNum), PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 10, { align: "right" });
}

function newPage() {
  footer();
  doc.addPage();
  pageNum++;
  y = MARGIN;
}

function ensureSpace(height: number) {
  if (y + height > PAGE_HEIGHT - MARGIN - 10) newPage();
}

function h1(text: string) {
  ensureSpace(16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...NAVY);
  doc.text(text, MARGIN, y);
  y += 3;
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1);
  doc.line(MARGIN, y, MARGIN + 30, y);
  y += 9;
}

function h2(text: string) {
  ensureSpace(12);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INDIGO);
  doc.text(text, MARGIN, y);
  y += 8;
}

function para(text: string) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(30, 30, 30);
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
  ensureSpace(lines.length * 5 + 3);
  doc.text(lines, MARGIN, y);
  y += lines.length * 5 + 4;
}

function bullets(items: string[]) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(30, 30, 30);
  for (const item of items) {
    const lines = doc.splitTextToSize(item, CONTENT_WIDTH - 6);
    ensureSpace(lines.length * 5 + 2);
    doc.setTextColor(...GOLD);
    doc.text("•", MARGIN, y);
    doc.setTextColor(30, 30, 30);
    doc.text(lines, MARGIN + 5, y);
    y += lines.length * 5 + 2;
  }
  y += 3;
}

function steps(items: string[]) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  items.forEach((item, i) => {
    const lines = doc.splitTextToSize(item, CONTENT_WIDTH - 8);
    ensureSpace(lines.length * 5 + 2);
    doc.setTextColor(...INDIGO);
    doc.setFont("helvetica", "bold");
    doc.text(`${i + 1}.`, MARGIN, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 30, 30);
    doc.text(lines, MARGIN + 7, y);
    y += lines.length * 5 + 2;
  });
  y += 3;
}

function table(head: string[][], body: string[][]) {
  ensureSpace(20);
  autoTable(doc, {
    startY: y,
    head,
    body,
    margin: { left: MARGIN, right: MARGIN },
    styles: { fontSize: 9.5, cellPadding: 3 },
    headStyles: { fillColor: INDIGO, textColor: 255 },
    didDrawPage: () => {
      // autoTable can trigger its own page breaks; keep our tracker in sync.
    },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
}

// ---------- Cover ----------
doc.setFillColor(...NAVY);
doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, "F");
doc.setDrawColor(...GOLD);
doc.setLineWidth(1.5);
doc.line(MARGIN, 110, PAGE_WIDTH - MARGIN, 110);
doc.setFont("helvetica", "bold");
doc.setFontSize(26);
doc.setTextColor(255, 255, 255);
doc.text("Material & Operations", MARGIN, 90);
doc.text("Management System", MARGIN, 102);
doc.setFont("helvetica", "normal");
doc.setFontSize(13);
doc.setTextColor(200, 220, 230);
doc.text("User Guide — Features & Workflows", MARGIN, 120);
doc.setFontSize(10);
doc.setTextColor(150, 180, 195);
doc.text(`Generated ${new Date().toLocaleDateString("en-GB")}`, MARGIN, 132);

newPage();

// ---------- Overview ----------
h1("1. Overview");
para(
  "This application replaces hand-written stock registers with a single system for tracking material moving in and out of the factory, current stock levels, supplier rates, and who recorded each transaction. It works on both phone and laptop, so a storekeeper can log a delivery at the gate while the owner reviews reports from an office."
);
para(
  "Three things make it reliable rather than just a form: stock and “last rate” are calculated automatically from the entries logged (never typed in directly, so they can never drift out of sync with reality), every entry is tied to the person who recorded it, and access is restricted by role so each person sees only what's relevant to their job."
);

// ---------- Roles ----------
h1("2. Roles & Permissions");
para(
  "Every user has exactly one role, set by the Owner. Roles control what a person can see and do throughout the app — not just which buttons are visible, but what the system will actually allow, even if someone tries to act outside the app's own screens."
);
table(
  [["Capability", "Owner", "Admin", "Storekeeper"]],
  [
    ["Log inbound / outbound entries", "Yes", "Yes", "Yes"],
    ["View dashboard", "Yes", "Yes", "Yes (simplified view)"],
    ["Add / edit items & suppliers", "Yes", "Yes", "View only"],
    ["View Reports & Search, export PDF", "Yes", "Yes", "No access"],
    ["View supplier business volume (Rs.)", "Yes", "No", "No"],
    ["Create / manage user accounts", "Yes", "No", "No"],
  ]
);
para(
  "The Storekeeper's dashboard intentionally shows fewer columns (Item, Stock, Last Rate, Status only) — enough to do the job at the gate without the analysis-oriented detail (rate trend, historical reports) that role doesn't need."
);

// ---------- Getting started ----------
h1("3. Getting Started");
h2("Logging in");
steps([
  "Open the app URL. You'll land on the login screen.",
  "Enter the username and password given to you by the Owner.",
  "On success you're taken to the Dashboard. If you try to open any other page while signed out, you're redirected back to login automatically and returned to that page afterward.",
]);
para(
  "There is no self-service sign-up — accounts are created by the Owner from the Users screen (see Section 8). If you forget your password, ask the Owner to reset it for you."
);

// ---------- Dashboard ----------
h1("4. The Dashboard");
para(
  "The dashboard is the home screen after login. It gives an at-a-glance view of stock health and quick access to the two most common actions."
);
h2("Summary tiles");
bullets([
  "Items in Stock — count of items currently holding stock above zero.",
  "Low Stock Alerts — count of items below their configured threshold.",
  "Inbound This Month / Outbound This Month — entry counts for the current calendar month.",
]);
h2("Stock table");
para(
  "Lists every item with its current stock, last purchase rate, a rate trend arrow (comparing the two most recent purchases), and a status badge:"
);
bullets([
  "LOW STOCK (amber/red) — stock has fallen below the item's configured threshold, but is still above zero.",
  "OUT OF STOCK (bright red) — stock has reached zero. This is a more urgent, visually distinct signal than a plain low-stock warning.",
]);
h2("Quick actions");
para(
  "Two prominent buttons — Inbound Entry and Outbound Entry — go straight to the entry forms described next. On a phone, these sit at the top of the screen so a storekeeper can act immediately without scrolling."
);

// ---------- Inbound workflow ----------
h1("5. Workflow: Logging an Inbound Delivery");
para("Use this whenever material arrives from a supplier.");
steps([
  "From the Dashboard, tap Inbound Entry (or navigate to it from the menu).",
  "Select the Item being delivered from the dropdown.",
  "Select the Supplier who delivered it.",
  "Enter the Quantity received.",
  "Enter the Rate (price per unit) for this delivery — this is what powers rate history and trend tracking.",
  "Pick the Date using the calendar (shown in Indian DD/MM/YYYY format once selected).",
  "Optionally add Notes.",
  "Submit. Stock and the item's “last rate” update immediately — no separate step required.",
]);
para(
  "There's no way to type a stock number directly anywhere in the app — the only way stock changes is through an inbound or outbound entry. This is deliberate: it keeps the figure trustworthy."
);

// ---------- Outbound workflow ----------
h1("6. Workflow: Logging an Outbound Issue");
para("Use this whenever material leaves — to production or to a customer.");
steps([
  "From the Dashboard, tap Outbound Entry.",
  "Select the Item being issued.",
  "Enter the Quantity.",
  "Enter a Purpose / Recipient — free text, e.g. “Production – Job 12” or a customer name.",
  "Pick the Date.",
  "Submit.",
]);
para(
  "The system will refuse to log an outbound entry for more than the item's current stock — this guards against a typo silently sending stock negative. If you hit this error, double-check the quantity or confirm the item's actual current stock on the Dashboard first."
);

// ---------- Items ----------
h1("7. Managing Items");
para("The Items screen (Owner and Admin only for changes; Storekeeper can view) lists every material tracked in the system.");
bullets([
  "Add Item — name, unit of measure (kg, pcs, etc.), and a low-stock threshold.",
  "Edit — update any of those fields at any time; changing the threshold takes effect immediately on the dashboard.",
  "Item detail page — shows full inbound rate history for that item: every delivery, its supplier, quantity, and rate, newest first.",
  "Delete — only allowed if the item has no recorded entries, to protect transaction history.",
]);
para(
  "Items can also be created automatically from the Supplier form (Section 8) by typing a new material name — useful when onboarding a new supplier who brings materials not yet in the system."
);

// ---------- Suppliers ----------
h1("8. Managing Suppliers");
para("The Suppliers screen works the same way, with a few extras specific to supplier relationships.");
bullets([
  "Add Supplier is tucked behind a button rather than always open, to keep the list uncluttered.",
  "Materials Supplied — a searchable, creatable field: pick from existing items, or type a new material name and add it on the fly (it's created as a new Item automatically).",
  "Address — free-text field for the supplier's location.",
  "Business volume (Owner only) — each supplier card shows total inbound purchase value (quantity × rate, summed across every delivery). This is inbound-only by nature: outbound entries record where material went (production or a customer), not which supplier it originally came from, so a per-supplier outbound figure isn't something that can meaningfully exist.",
]);

// ---------- Reports ----------
h1("9. Reports & Search");
para("Available to Owner and Admin. Gives a unified, filterable view across every inbound and outbound entry ever logged.");
h2("Filters");
bullets([
  "Item, Supplier, and Type (Inbound / Outbound) — dropdowns.",
  "Date range — pick From / To dates from the calendar; once picked, the date is echoed back in DD/MM/YY format beneath the field so there's no ambiguity about which day was selected.",
]);
h2("Exporting");
para(
  "The Download PDF button exports exactly what's currently on screen (respecting active filters) as a formatted PDF report — useful for sharing a specific period or supplier's activity outside the app."
);

// ---------- Users ----------
h1("10. User Management (Owner Only)");
para("The Users screen is where the Owner administers accounts.");
bullets([
  "Add User — name, username, password, and role (Admin or Storekeeper only; there is exactly one Owner).",
  "Change Role — promote or demote between Admin and Storekeeper at any time.",
  "Reset Password — set a new password for any Admin or Storekeeper account directly, without needing their old one.",
]);
para(
  "The Owner's own account isn't editable from this screen. There's currently no self-service “forgot password” flow for the Owner — if that credential is lost, recovering it requires direct database access."
);

// ---------- Concepts ----------
h1("11. Key Concepts");
h2("Stock is always derived, never entered");
para(
  "Current stock for any item = (sum of every inbound quantity) minus (sum of every outbound quantity). There's no field anywhere to override this directly, which is what keeps it trustworthy over time."
);
h2("Rate trend");
para(
  "The trend arrow next to an item's last rate compares its two most recent inbound rates by date. An upward arrow means the most recent purchase cost more than the one before it; a downward arrow means it cost less."
);
h2("Low Stock vs. Out of Stock");
para(
  "Low Stock means the quantity has fallen below the threshold you set for that item, but some stock remains. Out of Stock specifically means the quantity has reached zero — a more urgent state, shown with a distinct, more attention-grabbing badge."
);

// ---------- Tips ----------
h1("12. Tips");
bullets([
  "Set low-stock thresholds realistically — too low and you won't get warned in time to reorder; too high and every item looks perpetually low.",
  "Use consistent purpose text for outbound entries (e.g. always “Production - Job <number>”) so Reports & Search stays easy to scan.",
  "Change the Owner account's password immediately after it's first created or reset — it's a bootstrap credential, not meant to be long-lived as-is.",
  "When onboarding a new supplier, add their materials directly on the Supplier form rather than creating items separately first — it's one fewer step.",
]);

footer();
const outputPath = new URL("../docs/user-guide.pdf", import.meta.url).pathname;
writeFileSync(outputPath, Buffer.from(doc.output("arraybuffer")));
console.log(`Written to ${outputPath}`);
