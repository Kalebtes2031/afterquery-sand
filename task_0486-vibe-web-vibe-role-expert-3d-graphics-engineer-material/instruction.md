# The tactile matrix has no scale

## What you see

Ten flooring swatches are plotted on the matrix card as little colored circles, and the grid lines behind them look fine. The problem is the ruler around the edges of that card. Along the bottom, where a row of numbers ought to mark the scale, the strip is completely blank. Down the left side, same story — no numbers, nothing. Both scales are gone, not faded or squeezed, just absent from the white card entirely, as if they'd been drawn somewhere outside it and never made it back in.

Because of that, the chart is decorative rather than useful. I can tell that one swatch sits further right than another, or higher than a third, but I can't put a number on any of it. Every single one of the ten pieces is affected — there's no corner of the card, no swatch, where a scale reading is available. Switching which property drives the X or Y axis doesn't bring the numbers back either; whatever axis is picked, the edges of the card stay blank.

## What correct looks like

Both scales should sit inside the white card, not outside it: whole numbers running left-to-right along the bottom edge, and whole numbers running bottom-to-top along the left edge, for every swatch on the board and for whichever pair of properties is currently chosen for the two axes. The numbers have to actually correspond to the grid they sit next to — pick any swatch, read straight across to the left edge and straight down to the bottom edge, and the two numbers you land on should be that swatch's real values, not just some numbers in roughly the right place.

The broken app currently looks like this:

![current (broken) app](/app/problem_assets/broken.png)

The expected app should look like this:

![expected (fixed) app](/app/problem_assets/target.png)
