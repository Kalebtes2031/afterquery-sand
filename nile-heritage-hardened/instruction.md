# Nile Heritage Pass register — wrong totals, currencies, and mobile layout

I'm stewarding visitor passes for heritage sites across East and West Africa. The register should show how many passes are still valid, how many guests are on site today, each admission price in the venue's own currency, and expiry clocks in the correct local time zone. On my phone I also need the table to fit without sideways scrolling.

Several things are off at once:

**Summary cards.** The active-pass total counts the expired Cape Coast record even though its status badge reads Expired — there should be **3** active passes, not 4. Visitors today adds guests from that expired pass too; the live total should be **7**, not 8.

**Prices.** Every row prints in ETB even when the pass was issued in Kenya, Tanzania, or Ghana. Lamu should read **KES 1,500**, Stone Town **TZS 45,000**, and Cape Coast **GHS 220**.

**Expiry clocks.** Times look shifted. Lalibela should show **18:00 EAT**, Lamu **17:00 EAT**, and Cape Coast **16:00 GMT** — not a blanket UTC offset with EAT appended everywhere.

**Mobile layout (390px wide).** On a phone the register forces horizontal scrolling because the table is locked to a desktop width. Core columns (pass name, price, status) should stay visible without dragging sideways; venue and expiry can collapse on narrow screens.

Broken mobile view — note the sideways scroll, all-ETB prices, and inflated totals:

<img src="/app/problem_assets/broken.png" alt="Broken Nile Heritage Pass register on a 390px phone viewport" width="390" />

Fixed mobile view — same viewport, no horizontal scroll, local currencies and corrected totals:

<img src="/app/problem_assets/target.png" alt="Fixed Nile Heritage Pass register on a 390px phone viewport" width="390" />
