# How to Create Your Social Preview Image

Since you can't save the HTML as an image directly, here are several ways to create the `social-preview.png` file:

## Method 1: Use the SVG (Easiest)

1. Open `public/social-preview.svg` in your browser (double-click it)
2. Right-click on the image and select "Save image as..."
3. Save as `social-preview.png` in the `public` folder

## Method 2: Screenshot Method

1. Open `public/social-preview-generator.html` in your browser
2. Take a screenshot of just the preview card (1200x630px)
3. Use Preview or any image editor to crop it to the exact dimensions
4. Save as `social-preview.png` in the `public` folder

## Method 3: Online SVG to PNG Converter

1. Go to https://convertio.co/svg-png/ or https://cloudconvert.com/svg-to-png
2. Upload `public/social-preview.svg`
3. Set dimensions to 1200x630px
4. Download the PNG file
5. Rename it to `social-preview.png` and place it in the `public` folder

## Method 4: Use Canva (Recommended for customization)

1. Go to https://canva.com
2. Create a custom design with dimensions 1200x630px
3. Use the design elements from the HTML file as inspiration
4. Download as PNG
5. Save as `social-preview.png` in the `public` folder

## Once you have the image:

1. Make sure `social-preview.png` is in the `public` folder
2. Run `npm run build` to include it in your build
3. Deploy to Firebase
4. Test your social preview cards!

The image should be exactly 1200x630 pixels for optimal display across all social platforms.
