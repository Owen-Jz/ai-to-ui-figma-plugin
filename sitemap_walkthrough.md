# Sitemap Generation Feature Walkthrough

This walkthrough guides you through testing the new Sitemap Generation feature in the AI-to-UI Figma Plugin.

## 1. Setup

1.  Ensure you have the latest code built:
    ```bash
    npm run build
    ```
2.  Open Figma and load the development plugin from `manifest.json`.

## 2. Verify UI Documentation

1.  Open the plugin.
2.  Go to the **Schema Reference** tab.
3.  Scroll down to find the **🗺️ Sitemap Properties** section.
4.  Verify that `sitemapData`, `nodeWidth`, `levelSpacing`, and `siblingSpacing` are documented.

## 3. Test Sitemap Generation

1.  Open the `test_sitemap.json` file in your editor to see the structure. It defines a "Home Page" with children like "Shop", "About Us", "Contact", and "Blog", with deeper nesting under "Shop".
2.  Copy the content of `test_sitemap.json`.
3.  In the plugin, go to the **Builder** tab.
4.  Paste the JSON into the text area.
5.  Click **Build Layout**.

## 4. Expected Result

*   A new frame named "Site Map Test" should appear.
*   Inside, a "E-commerce Sitemap" group/frame should be generated.
*   **Root Node**: "Home Page" (Blue).
*   **Level 1**: "Shop" (Green), "About Us" (Orange), "Contact" (Red), "Blog" (Purple).
*   **Level 2**: "Men's", "Women's", "Accessories" under Shop; "Careers", "Press" under About Us, etc.
*   **Connectors**: Orthogonal lines connecting parents to children.
*   **Layout**: Nodes should be centered relative to their subtrees, avoiding overlaps.

## 5. Troubleshooting

*   If the layout looks overlapping, check if the `nodeWidth` or `siblingSpacing` in the JSON needs adjustment (though the algorithm should handle this).
*   If connectors are missing, check the console for any SVG errors.
