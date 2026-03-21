# B2C Templates (Forma Luna Studio)

## Templates Included

1. **Product Detail**
   - File: `01-product-detail/b2c-product-detail.json`
   - Purpose: Individual product showcase for the consumer Projects segment
   - URL: `/projects/products/{id}`
   - Setup: 15–20 min per product (replace image, title, description, spec list HTML, related items)

2. **About Us**
   - File: `02-about-us/b2c-about-us.json`
   - Purpose: Studio story and credentials
   - URL: `/projects/about`
   - Setup: 10–15 min (hero copy, body text, stats, hero image)

3. **Contact Us**
   - File: `03-contact-us/b2c-contact-us.json`
   - Purpose: Customer inquiries (Elementor **Form** widget — requires Elementor Pro or compatible form extension)
   - URL: `/projects/contact`
   - Setup: 10–15 min (connect form actions, confirm email routing)

## How to Import

1. In WordPress: **Pages → Add New**
2. **Edit with Elementor**
3. **Templates → Insert Template** (or import via your Elementor library workflow)
4. Upload the JSON file (if your setup supports direct JSON import), or paste/import through the template library
5. Click **Insert**
6. Replace placeholder images and links, then publish

## Customization

- Product images and Unsplash URLs are placeholders — swap for Media Library assets
- Spec list on the product template is an **HTML** widget for a clean list layout; edit labels and values there
- Button links point at `/projects/...` paths — align with your WordPress permalinks
- See `../IMPORT_INSTRUCTIONS.md` for global import notes
