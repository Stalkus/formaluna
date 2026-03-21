# WordPress (Hostinger export) + Forma Luna

## Layout

| Path | Purpose |
|------|---------|
| `public_html/` | Full WordPress tree from Hostinger (core + `wp-content`). |
| `u640400267_a9U0w.sql` | DB dump from the export — **sensitive**; rotate credentials if this repo is shared. |
| `imports/woocommerce-products.csv` | WooCommerce import (Studio + Trade products, placeholder prices). |
| `HOSTINGER-DEPLOY.md` | Step-by-step staging → live checklist. |

## Custom code added for Forma Luna

1. **`public_html/wp-content/plugins/formaluna-luna/`**  
   - **Tools → Forma Luna Import** — pushes the six Elementor JSON layouts into real pages.  
   - **Partner applications** admin list with **Approve** / **Decline**; shortcode `[formaluna_partner_register]` for the public form.

2. **`public_html/wp-content/themes/ciri-child/`**  
   - `assets/css/formaluna-brand.css` + enqueue in `functions.php` — Forma Luna colours / fonts over Ciri + WooCommerce buttons.

3. **Elementor JSON copies** live under  
   `public_html/wp-content/plugins/formaluna-luna/assets/elementor-pages/`  
   (synced from the repo’s `elementor-templates/`).

## React app (`../src/`)

The Vite/React site is still a **reference**; WordPress + Elementor is the production frontend unless you decide otherwise.
