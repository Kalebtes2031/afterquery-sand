# Reviewing -border produce shipments

When I look at the East Africa corridor queue the status and country filters sometimes show the wrong shipments. The list and review panel can also display states for the same shipment. The decision buttons take up much space and hide the reviewer note making it hard to see important details.

The status filter should only show shipments that're in that specific state. The country filter should include a shipment if the country is either the origin or the destination. The corridor-weight total must include all shipments, the ones that have been rejected. If a shipment is rejected there must be a -empty reason provided. After any decision is made the queue and the review panel should instantly match in showing the state of the shipment.

The reviewer note and decision controls must stay fully visible. They should be clearly separated so nothing overlaps or gets cut off. The review panel should not hide any part of the note or the controls.

The current broken version of the page looks like this:

<img src="/app/problem_assets/broken.png" alt="current broken shipment review page" width="900" />

The expected version should look like this:

<img src="/app/problem_assets/target.png" alt="expected shipment review page" width="900" />