# The heritage pass register is showing the wrong details

I’m using this register to follow visitor passes at heritage sites across Africa. The active total includes an expired pass, every admission price is being formatted as ETB, the expiry times are shifted to the wrong timezone, and the register becomes awkward to use on a phone.

I need expired passes excluded from the active and visitor totals, each pass shown in its own local currency, expiry times shown in the venue’s local timezone, and the register kept readable at 390px wide without losing the key status and price columns.

The broken site currently looks like this:

<img src="/app/problem_assets/broken.png" alt="broken Nile Heritage Pass register" width="900" />

The expected site should look like this:

<img src="/app/problem_assets/target.png" alt="expected Nile Heritage Pass register" width="900" />
