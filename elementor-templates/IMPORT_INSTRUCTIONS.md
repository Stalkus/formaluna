# How to Import Elementor Templates

## Files Included

- **3 B2C templates** — consumer / Studio (`elementor-templates/b2c/`)
- **3 B2B trade templates** — wholesale portal (`elementor-templates/b2b/`)

## Import Steps

### Method 1: Direct Upload (Recommended)

1. Go to **WordPress Dashboard**
2. **Pages → Add New**
3. Click **Edit with Elementor**
4. Open **Templates** (or your theme’s template import flow, depending on Elementor version)
5. **Insert Template** / **Import** the JSON file
6. Click **Insert**
7. Customize media, copy, and links, then **Publish**

> Elementor’s exact menu labels vary by version (Free vs Pro). If you do not see JSON upload in the editor, use **Elementor → Tools → Import / Export** or the **Theme Builder / Template** library where your install exposes imports.

### Method 2: File Manager (Advanced)

1. If your host or workflow supports it, place exported templates where your Elementor library expects them (often via **Import** in the dashboard rather than raw files).
2. Refresh the template library in WordPress
3. **Insert Template** → choose the imported item

## Template Names

**B2C Segment**

- `b2c-product-detail.json`
- `b2c-about-us.json`
- `b2c-contact-us.json`

**B2B Segment**

- `b2b-product-detail-nova.json`
- `b2b-about-us-nova.json`
- `b2b-contact-us-nova.json`

## Customization

Each template includes placeholders you should edit after import:

1. Product images (external URLs — replace with **Media Library** IDs/URLs as needed)
2. Product titles and descriptions
3. Company and trade messaging
4. Contact details and `tel:` / `mailto:` links in text widgets
5. Form fields and submit actions (**Form** widget)
6. Button links (`/projects/...` and `/professionals/...`)

## Requirements & Notes

- **Forms**: Contact templates use the Elementor **Form** widget. This typically requires **Elementor Pro** (or another plugin that registers the same widget). If the form does not appear, rebuild the fields using your form plugin and match the field list in the READMEs.
- **Containers**: JSON uses the **container** layout model (`elType: "container"`) with flex settings and `_tablet` / `_mobile` variants.
- **Design system**: Colors `#4b604c`, `#f5f3f0`, `#ededed`; headings **Georgia**, body **Arial, Helvetica, sans-serif**.

## Support

Templates are structured for production import; always preview on **desktop, tablet, and mobile** before publishing.

For segment-specific setup hints, see:

- `b2c/README.md`
- `b2b/README.md`
