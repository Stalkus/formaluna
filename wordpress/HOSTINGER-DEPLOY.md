# Hostinger — staging → production (Forma Luna)

## What is in this repo

- **`public_html/`** — WordPress files from your Hostinger export (core, plugins, `wp-content`, etc.).
- **`u640400267_a9U0w.sql`** — Database dump. Treat as **confidential**; rotate passwords after sharing the repo.
- **`imports/woocommerce-products.csv`** — Product import aligned with the React prototype (Studio + Trade categories, image URLs).
- **`public_html/wp-content/plugins/formaluna-luna/`** — Custom plugin: **Elementor page import** + **trade partner applications** (approve / decline in admin).

We **do not** replace every file in `public_html` automatically: third-party plugins (Elementor, WooCommerce, LiteSpeed, etc.) should be updated on the server or via Hostinger tools, not hand-edited in bulk.

## Recommended order on staging (before production)

1. **Upload** this `public_html` tree to your Hostinger staging site (merge with what is already there, or replace if this is a full snapshot).
2. **Import the database** in phpMyAdmin only if this dump matches that environment’s URL (otherwise run **Better Search Replace** or WP-CLI to fix `siteurl` / `home` and serialized URLs).
3. In **Plugins**, activate **Forma Luna — Site Tools** (`formaluna-luna`).
4. **WooCommerce → Products → Import** — upload `imports/woocommerce-products.csv`.  
   - Enable “Download images from URLs” if offered.  
   - Set real **prices** and **stock** after import (CSV uses `0` as placeholder price).
5. **Tools → Forma Luna Import** — run **Import / update pages** once (requires **Elementor** active). This creates/updates:
   - `studio-about`, `studio-contact`, `studio-product-detail`
   - `trade-about`, `trade-contact`, `trade-product-detail`
6. **Menus & permalinks** — assign a primary menu; open **Settings → Permalinks** and save (flushes rules).
7. **Trade partner flow** — on your **Trade contact** page (or any page), add the shortcode:
   ```text
   [formaluna_partner_register]
   ```
   Admins review entries under **Partner applications** in the admin menu; use **Approve** / **Decline** in the list.

## Production cutover

1. Take a **fresh backup** of live files + database.
2. Replace live `public_html` with your tested staging files (or use Hostinger staging push-to-live if available).
3. Import/sync the **database** the same way you validated on staging; fix URLs if the domain changes.
4. Clear **LiteSpeed** / server cache and **Elementor → Tools → Regenerate CSS & Data** if layouts look wrong.

## Security checklist

- Change all **admin** and **DB** passwords after moving dumps through Git or zip.
- Do not commit **new** production secrets; add `wp-config.php` to `.gitignore` if you keep a local copy with real credentials.
