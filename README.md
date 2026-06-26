# Alta Packet Auditor

Drop an Alta California contract packet (DocuSign or phone-scanned) → it reads
every page, checks it against the Alta rulebook, and **flags only what's wrong**.
A clean packet shows nothing marked. Problems get a red box on the page plus a
breakdown list at the top.

It reads handwriting via Claude's vision (handles messy phone scans far better
than OCR). OCR is used only to locate where each flag sits on a scanned page.

## What it checks (current rulebook)
- **Long Sheet** — remeasure/date/name/address/price filled; down-payment cap
  ($1,000 or 10%, lesser); finance charge = none; deposit matches; grid math
  balances; terms marked; 3-day initial; owner + contractor signatures & dates;
  salesperson name.
- **Change Order** — all customer/job/terms fields filled AND consistent with the
  Long Sheet (name, address, phone, email, product, date sold, rep, terms); Paid =
  No / Upon Completion; conditional price-change math (a + b = Revised); customer
  printed name, signature, date.
- **Three-Day Right to Cancel** — buyer name (matches cover), date, signature.
  Mandatory unless the packet is a pure change order/modification.
- **Consumer Loan Agreement (Term Sheet)** — required only when financed. Borrower
  (+ co-borrower if two on cover), lender, date, **amount financed = Upon
  Completion of Project**, payment count, monthly, rate, stated income + initials,
  credit-check initials, signatures.
- **Packet-wide axioms** — primary name consistent everywhere; every signature
  traces to a printed name on the cover; cosigner signature requires a cover-sheet
  name; dates consistent; cross-page field match.

The rulebook lives in `rulebook.js` — edit it to add forms or change rules, then
commit + push and Render redeploys. (More forms — Roofing, Pavers, Exteriors,
Windows addendums + mandatory-packet rules — to be added.)

## Get an Anthropic API key
1. console.anthropic.com → sign in.
2. Settings → Plans & Billing → add a card + at least $5 credit.
3. Settings → API Keys → Create Key → copy it (starts with `sk-ant-`).

## Deploy on Render (same as Aloha Doors)
1. Push to GitHub:
   ```
   cd alta-auditor
   git init && git add . && git commit -m "Alta Packet Auditor"
   git remote add origin https://github.com/mikegyver777/alta-packet-auditor.git
   git branch -M main && git push -u origin main
   ```
2. render.com → New → Web Service → connect the repo.
   - Build: `npm install`   Start: `npm start`   Instance: Starter
   - Environment → add `ANTHROPIC_API_KEY` = your `sk-ant-...` key
3. Create. Open the URL it gives you, drop a packet, read the flags.

## Run locally
```
npm install
export ANTHROPIC_API_KEY=sk-ant-...   # Windows: set ANTHROPIC_API_KEY=...
npm start
# http://localhost:3000
```
