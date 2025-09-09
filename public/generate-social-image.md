# How to Generate Your Social Preview Image

## Option 1: Using the HTML Generator (Recommended)

1. Open `public/social-preview-generator.html` in your browser
2. Right-click on the preview card
3. Select "Save image as..." or "Copy image"
4. Save as `social-preview.png` in the `public` directory
5. The image will be automatically included in your build

## Option 2: Using the SVG

1. Open `public/social-preview.svg` in a browser or design tool
2. Export as PNG with dimensions 1200x630px
3. Save as `social-preview.png` in the `public` directory

## Option 3: Using Online Tools

You can also use online tools like:
- [Canva](https://canva.com) - Create a 1200x630px design
- [Figma](https://figma.com) - Design and export
- [Social Media Image Generators](https://www.canva.com/create/social-media-graphics/)

## Testing Your Preview Cards

After deploying your app with the social preview image, test it using:

1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
4. **WhatsApp**: Share the link in a chat to see the preview

## What We've Added

✅ Open Graph meta tags for Facebook, LinkedIn, WhatsApp
✅ Twitter Card meta tags for Twitter
✅ Standard meta tags for SEO
✅ Social preview image generator
✅ Updated Vite config to include the image in builds

Your app will now show rich preview cards instead of just the URL when shared on social media!
