# SavannaRoute Safari & Conservation Logistics Management Issues

When managing wildlife expeditions and park logistics on the SavannaRoute portal, several core operations fail across reservations, fleet dispatch, rate calculations, and visual presentation.

When viewing the expedition overview dashboard, the cards horizontally overlap and squish into one another, making safari details unreadable. The reserve filter buttons overflow and crowd out page actions. Status tags have virtually invisible white text over bright yellow and light gray backgrounds, and opening the details drawer completely covers the top navigation with no clear layout boundary.

In the rate calculator, quoting a peak season safari with conservation partner discounts and ranger escorts produces distorted and negative cost totals because discounts and park conservation levies are deducted in the wrong calculation sequence. Additionally, switching display currency to East African Shillings (KES / TZS / UGX) formats amounts with raw exponent notation (`e+`) instead of standard currency figures.

In the operations drawer, requesting and verifying gorilla habituation tracking permits reports success in the notification but leaves the expedition in a pending state without refreshing the status badge. Furthermore, assigning more than two armed ranger escorts fails to display ranger details, and dispatching a 4x4 Land Cruiser marks the vehicle as decommissioned while listing route transit waypoints in reverse order instead of departure sequence.

The broken site currently looks like this with overlapping cards, truncated filter controls, and unreadable contrast:

<img src="/app/problem_assets/broken.png" alt="current (broken) site" width="900" />

The expected site should look like this with clean card grids, properly formatted multi-currency pricing, verified permit sync, ascending route waypoints, and high-contrast badges:

<img src="/app/problem_assets/target.png" alt="expected site" width="900" />
