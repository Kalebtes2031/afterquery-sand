# Garissa night shift: wrong bills, dead override, overlapping hub cards

I ran last night’s close on AfriGrid Solar from Nairobi. Garissa is still sitting on a brownout flag, the vaccine-clinic backup never actually lands on the station, and the community bill for a 350 kWh household comes back negative or nonsense.

On Community Tariff & Subsidies I quoted 350 kWh at $0.15, a 50% lifeline on the first 50 kWh, 60 kWh of rooftop export at $0.06, and a $4.50 rural access fee. Gross energy should stay $52.50 (the full 350 kWh, not after subtracting export). Lifeline relief should be $3.75 only. Export credit should be $3.60 after that, then the access fee. Net due is $49.65. What I get now knocks export kWh off before the lifeline band and then treats “50” like a 50× multiplier, so the total goes negative. Switching billing currency to Naira (or KES / EGP / ZAR) also prints the same totals as `e+` scientific notation instead of a naira sign and grouped digits.

On Garissa I opened Manage Emergency Circuits and engaged the critical clinic backup (Garissa County Vaccine Clinic Backup). The toast says it engaged, but the drawer status never moves off BROWNOUT_ALERT to OPTIMAL, the circuit never shows up on the protected list, and a later reload still looks like the brownout. That override has to come back as shielded, with the station optimal / normal and the clinic name on the priority circuits.

I also sent DISCHARGE on Garissa MegaPack Inverter Bank A. The bank flips to OFFLINE_TRIPPED instead of DISCHARGING, and the thermal list puts the 28.1 °C rack first so the 58.2 °C critical rack is last. Discharge has to leave the unit DISCHARGING and list racks hottest-first (58.2, then 44.8, 32.4, 28.1). Crewing three high-voltage specialists to Garissa is worse: one or two people come back as full records, three come back as id strings with no name or certification, so the roster pane dies.

The control room itself is unusable on a laptop. Hub cards sit in one overlapping horizontal strip (Kainji is off-screen unless you scroll sideways). West Africa is clipped off the filter row. The yellow BROWNOUT_ALERT chip is white-on-yellow and unreadable. The emergency drawer paints the whole viewport and covers the top nav. On a phone-width window the page also scrolls sideways. Cards need a wrapping grid with every hub visible, filters wrapping so Connect Installation stays reachable, dark text on the warning chip, and the circuit panel docking from the right without burying the header.

This is the control room as it is now — cards colliding, West Africa cut off, warning chip washed out:

<img src="/app/problem_assets/broken.png" alt="AfriGrid microgrid network with overlapping station cards" width="900" />

After the fix it has to look like this same All Regions view: five separate hub cards, full filter row, readable brownout chip:

<img src="/app/problem_assets/target.png" alt="AfriGrid microgrid network with a wrapping hub grid" width="900" />
