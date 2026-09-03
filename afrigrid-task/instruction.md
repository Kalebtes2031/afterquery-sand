# Weaknesses in Solar-based Renewable Microgrid and Control Operations of AfriGrid 

Several malfunctions are found in data transmission of solar plants and storage batteries of AfriGrid, billing, and interface of these plants, which strongly influence operation of processes in the control room.

On the dashboard of the microgrid system, installation cards lay one on top of another horizontally and do not show power capacity so district names cannot be read. The regional filter pills are spilling over the page as well, which does not allow for using the connection controls. The warning icons are unreadable as there is not enough contrast between the white letters and the bright yellow background. Opening the emergency circuit box leads to losing the menu at the top and the borders of the closed box are not styled.

When using Community Tariff Calculator for calculating monthly consumption of electrical energy in rural areas with the account of lifeline subsidies and credits from the rooftop solar systems, it is possible to get negative or strange results, as credits are deducted before calculating tiered consumption brackets and subsidies are incorrectly calculated. Moreover, utilizing an unconventional currency for payment in Africa (such as NGN, KES, EGP, ZAR) serves to display the result of the invoice in terms of scientific notation (`e+`) rather than the traditional numeral representation separated by commas.

Employing the emergency circuit of the SCADA system results in the notification referring to alerting without providing any safeguard on the hospital line and generates the alert about brownout issue on the device card. In addition to this, assigning personnel for more than two high-voltage specialists leads to creating breakdown in the engineers’ roster. Moreover, issuing the discharge command for BESS batteries makes it possible to change the status of their operation to offline tripped mode while registering the temperatures of thermal racks in the reversed order in a way that allows to conceal the differences in unit overheating. 

Here is how the broken website looks like with overlapping cards, missing filters, and excessive contrast:

<img src="/app/problem_assets/broken.png" alt="current (broken) site" width="900" />

Below you can see how the needed website should look like displaying distinct card layouts, proper multi-currency billing, harmonized state of the emergency circuit, and order of thermal racks along with noticeable badges:

<img src="/app/problem_assets/target.png" alt="expected site" width="900" />
