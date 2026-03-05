/**
 * ============================================================================
 * 🚀 Anti-Gravity DOM-to-JSON Extractor
 * ============================================================================
 * 
 * A browser-console script that converts a live webpage into the AI-to-UI
 * Figma Plugin JSON schema. Handles:
 *   ✅ Auto Layout mapping (flex → HORIZONTAL/VERTICAL)
 *   ✅ Font extraction & mapping to safe Google Fonts
 *   ✅ Image → Base64 conversion (bypasses CORS)
 *   ✅ SVG icon extraction via XMLSerializer
 *   ✅ Precise layout via getBoundingClientRect()
 *   ✅ Shadow, border-radius, opacity, gradient extraction
 * 
 * Usage: Paste into browser console on any webpage. Result is copied to clipboard.
 * ============================================================================
 */

(async function AntiGravityExtractor() {
    'use strict';

    // ==========================================================================
    // CONFIGURATION
    // ==========================================================================

    const CONFIG = {
        // Maximum depth to traverse (prevents infinite recursion)
        maxDepth: 25,
        // Minimum element size to consider (pixels)
        minSize: 2,
        // Skip invisible elements
        skipInvisible: true,
        // Maximum number of children before truncation warning
        maxChildren: 200,
        // Image conversion timeout (ms)
        imageTimeout: 5000,
        // Elements to always skip
        skipTags: new Set([
            'SCRIPT', 'STYLE', 'NOSCRIPT', 'META', 'LINK', 'HEAD',
            'BR', 'WBR', 'TEMPLATE', 'SLOT', 'DIALOG',
            'IFRAME', 'OBJECT', 'EMBED', 'AUDIO', 'VIDEO', 'CANVAS',
            'MAP', 'AREA', 'SOURCE', 'TRACK', 'PARAM',
            'COL', 'COLGROUP', 'DATALIST', 'OPTGROUP', 'OPTION',
        ]),
        // Elements that are primarily text containers
        textTags: new Set([
            'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
            'SPAN', 'A', 'STRONG', 'EM', 'B', 'I', 'U', 'S',
            'SMALL', 'MARK', 'DEL', 'INS', 'SUB', 'SUP',
            'LABEL', 'LEGEND', 'CAPTION', 'FIGCAPTION',
            'ABBR', 'CITE', 'CODE', 'DFN', 'KBD', 'SAMP', 'VAR',
            'BLOCKQUOTE', 'Q', 'TIME', 'DATA', 'RUBY', 'RT', 'RP',
        ]),
    };

    // ==========================================================================
    // FONT MAPPER
    // ==========================================================================

    const SAFE_FONTS = [
        'Inter', 'Poppins', 'Roboto', 'Open Sans',
        'Montserrat', 'Lato', 'Nunito', 'DM Sans',
    ];

    // Mapping of common web/system fonts to the closest Google Font equivalent
    const FONT_MAP = {
        // System fonts
        'arial': 'Inter',
        'helvetica': 'Inter',
        'helvetica neue': 'Inter',
        'system-ui': 'Inter',
        '-apple-system': 'Inter',
        'blinkmacsystemfont': 'Inter',
        'segoe ui': 'Inter',
        'sf pro display': 'Inter',
        'sf pro text': 'Inter',
        'sf pro': 'Inter',

        // Serif fonts
        'times new roman': 'Lato',
        'times': 'Lato',
        'georgia': 'Lato',
        'garamond': 'Lato',
        'palatino': 'Lato',
        'book antiqua': 'Lato',
        'cambria': 'Lato',

        // Sans-serif web fonts
        'verdana': 'Open Sans',
        'tahoma': 'Open Sans',
        'trebuchet ms': 'Montserrat',
        'comic sans ms': 'Nunito',
        'impact': 'Montserrat',
        'calibri': 'Inter',
        'candara': 'DM Sans',

        // Google fonts → self
        'inter': 'Inter',
        'poppins': 'Poppins',
        'roboto': 'Roboto',
        'open sans': 'Open Sans',
        'montserrat': 'Montserrat',
        'lato': 'Lato',
        'nunito': 'Nunito',
        'dm sans': 'DM Sans',

        // Popular brand fonts → nearest match
        'google sans': 'Inter',
        'product sans': 'Poppins',
        'proxima nova': 'Montserrat',
        'futura': 'Montserrat',
        'avenir': 'Nunito',
        'gill sans': 'DM Sans',
        'century gothic': 'Poppins',
        'circular': 'Inter',
        'graphik': 'DM Sans',
        'aktiv grotesk': 'Inter',
        'neue haas grotesk': 'Inter',
        'source sans pro': 'Open Sans',
        'source sans 3': 'Open Sans',
        'noto sans': 'Open Sans',
        'ubuntu': 'Roboto',
        'fira sans': 'Roboto',
        'barlow': 'Roboto',
        'work sans': 'DM Sans',
        'raleway': 'Poppins',
        'quicksand': 'Nunito',
        'rubik': 'Nunito',
        'manrope': 'Inter',
        'plus jakarta sans': 'DM Sans',
        'outfit': 'Inter',
        'space grotesk': 'DM Sans',
        'sora': 'Poppins',
        'jost': 'Poppins',
        'urbanist': 'Poppins',
        'lexend': 'Inter',
        'albert sans': 'DM Sans',
        'figtree': 'Inter',

        // Monospace
        'courier new': 'Roboto',
        'courier': 'Roboto',
        'lucida console': 'Roboto',
        'consolas': 'Roboto',
        'menlo': 'Roboto',
        'monaco': 'Roboto',
        'sf mono': 'Roboto',
        'fira code': 'Roboto',
        'jetbrains mono': 'Roboto',
        'source code pro': 'Roboto',
    };

    /**
     * Map a CSS font-family string to the closest safe Google Font.
     */
    function mapFont(cssFontFamily) {
        if (!cssFontFamily) return 'Inter';

        // Split comma-separated font stack and try each one
        const families = cssFontFamily.split(',').map(f =>
            f.trim().replace(/^["']|["']$/g, '').toLowerCase()
        );

        for (const family of families) {
            // Direct match in our safe list (case-insensitive)
            const directMatch = SAFE_FONTS.find(sf => sf.toLowerCase() === family);
            if (directMatch) return directMatch;

            // Check our mapping table
            if (FONT_MAP[family]) return FONT_MAP[family];
        }

        // Fallback: fuzzy match using Levenshtein-like similarity
        for (const family of families) {
            // Skip generic families
            if (['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace', 'math', 'emoji', 'fangsong'].includes(family)) continue;

            // Try partial matching
            for (const [key, value] of Object.entries(FONT_MAP)) {
                if (family.includes(key) || key.includes(family)) {
                    return value;
                }
            }
        }

        return 'Inter'; // Ultimate fallback
    }

    /**
     * Map CSS font-weight (numeric or keyword) to Figma font weight string.
     */
    function mapFontWeight(cssWeight) {
        const w = typeof cssWeight === 'string' ? parseInt(cssWeight, 10) : cssWeight;
        if (isNaN(w)) {
            // Handle keywords
            const keywords = {
                'normal': 'Regular',
                'bold': 'Bold',
                'bolder': 'Bold',
                'lighter': 'Light',
            };
            return keywords[String(cssWeight).toLowerCase()] || 'Regular';
        }
        if (w <= 300) return 'Light';
        if (w <= 400) return 'Regular';
        if (w <= 500) return 'Medium';
        if (w <= 600) return 'SemiBold';
        if (w <= 700) return 'Bold';
        return 'ExtraBold';
    }

    // ==========================================================================
    // COLOR UTILITIES
    // ==========================================================================

    /**
     * Parse any CSS color value to hex string.
     */
    function cssColorToHex(cssColor) {
        if (!cssColor || cssColor === 'transparent' || cssColor === 'rgba(0, 0, 0, 0)') return null;

        // Already hex
        if (cssColor.startsWith('#')) return cssColor;

        // rgb/rgba
        const rgbMatch = cssColor.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
        if (rgbMatch) {
            const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
            const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
            const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        }

        // Fallback: use canvas to resolve named colors
        try {
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = 1;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = cssColor;
            ctx.fillRect(0, 0, 1, 1);
            const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        } catch {
            return '#000000';
        }
    }

    /**
     * Extract opacity from rgba/hsla color strings.
     */
    function cssColorOpacity(cssColor) {
        if (!cssColor) return 1;
        const rgbaMatch = cssColor.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/);
        if (rgbaMatch) return parseFloat(rgbaMatch[1]);
        const hslaMatch = cssColor.match(/hsla?\([^,]+,[^,]+,[^,]+,\s*([\d.]+)\s*\)/);
        if (hslaMatch) return parseFloat(hslaMatch[1]);
        if (cssColor === 'transparent') return 0;
        return 1;
    }

    // ==========================================================================
    // IMAGE → BASE64 CONVERTER
    // ==========================================================================

    const imageCache = new Map();

    /**
     * Convert an image URL to a Base64 data URI.
     * Uses canvas drawImage approach. Falls back gracefully.
     */
    async function imageToBase64(url) {
        if (!url || url.startsWith('data:')) return url; // Already Base64 or empty

        // Check cache
        if (imageCache.has(url)) return imageCache.get(url);

        try {
            const result = await new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                const timer = setTimeout(() => {
                    reject(new Error('Timeout'));
                }, CONFIG.imageTimeout);
                img.onload = () => {
                    clearTimeout(timer);
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = img.naturalWidth || img.width;
                        canvas.height = img.naturalHeight || img.height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0);
                        const dataUrl = canvas.toDataURL('image/png');
                        resolve(dataUrl);
                    } catch (e) {
                        // CORS blocked even with crossOrigin
                        reject(e);
                    }
                };
                img.onerror = () => {
                    clearTimeout(timer);
                    reject(new Error('Load failed'));
                };
                img.src = url;
            });
            imageCache.set(url, result);
            return result;
        } catch (e) {
            console.warn(`[Anti-Gravity] Could not convert image to Base64: ${url}`, e.message);
            // Store the original URL as fallback
            imageCache.set(url, url);
            return url;
        }
    }

    /**
     * Extract background-image URL from computed style.
     */
    function extractBgImageUrl(bgImage) {
        if (!bgImage || bgImage === 'none') return null;
        const match = bgImage.match(/url\(["']?([^"')]+)["']?\)/);
        return match ? match[1] : null;
    }

    // ==========================================================================
    // SVG ICON EXTRACTOR
    // ==========================================================================

    /**
     * Serialize an SVG element to a raw SVG string.
     */
    function extractSvg(svgElement) {
        try {
            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(svgElement);

            // Clean up the SVG string - ensure it has proper namespace
            if (!svgString.includes('xmlns=')) {
                svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
            }

            return svgString;
        } catch (e) {
            console.warn('[Anti-Gravity] Failed to serialize SVG:', e);
            return null;
        }
    }

    // ==========================================================================
    // LAYOUT ANALYSIS
    // ==========================================================================

    /**
     * Determine if an element is using flex layout and map to Figma Auto Layout.
     */
    function analyzeLayout(computedStyle) {
        const display = computedStyle.display;
        const result = {};

        if (display === 'flex' || display === 'inline-flex') {
            const direction = computedStyle.flexDirection;
            result.layoutMode = (direction === 'column' || direction === 'column-reverse')
                ? 'VERTICAL' : 'HORIZONTAL';

            // Flex wrap
            const wrap = computedStyle.flexWrap;
            if (wrap === 'wrap' || wrap === 'wrap-reverse') {
                result.layoutWrap = 'WRAP';
            }

            // Gap → itemSpacing
            const gap = computedStyle.gap || computedStyle.rowGap || '0';
            const gapValue = parseInt(gap, 10);
            if (!isNaN(gapValue) && gapValue > 0) {
                result.itemSpacing = gapValue;
            }

            // Justify content → primaryAxisAlignItems
            const justify = computedStyle.justifyContent;
            if (justify.includes('center')) result.primaryAxisAlignItems = 'CENTER';
            else if (justify.includes('end') || justify.includes('right')) result.primaryAxisAlignItems = 'MAX';
            else if (justify.includes('space-between')) result.primaryAxisAlignItems = 'SPACE_BETWEEN';
            else result.primaryAxisAlignItems = 'MIN';

            // Align items → counterAxisAlignItems
            const align = computedStyle.alignItems;
            if (align === 'center') result.counterAxisAlignItems = 'CENTER';
            else if (align === 'flex-end' || align === 'end') result.counterAxisAlignItems = 'MAX';
            else if (align === 'baseline') result.counterAxisAlignItems = 'BASELINE';
            else result.counterAxisAlignItems = 'MIN';
        }

        return result;
    }

    /**
     * Extract padding from computed style.
     */
    function extractPadding(computedStyle) {
        const top = parseInt(computedStyle.paddingTop, 10) || 0;
        const right = parseInt(computedStyle.paddingRight, 10) || 0;
        const bottom = parseInt(computedStyle.paddingBottom, 10) || 0;
        const left = parseInt(computedStyle.paddingLeft, 10) || 0;

        if (top === 0 && right === 0 && bottom === 0 && left === 0) return undefined;

        return { top, right, bottom, left };
    }

    /**
     * Extract corner radius (handles individual corners).
     */
    function extractCornerRadius(computedStyle) {
        const tl = parseInt(computedStyle.borderTopLeftRadius, 10) || 0;
        const tr = parseInt(computedStyle.borderTopRightRadius, 10) || 0;
        const bl = parseInt(computedStyle.borderBottomLeftRadius, 10) || 0;
        const br = parseInt(computedStyle.borderBottomRightRadius, 10) || 0;

        // All same → single cornerRadius
        if (tl === tr && tr === bl && bl === br) {
            return tl > 0 ? { cornerRadius: tl } : {};
        }

        // Mixed → individual radii
        const result = {};
        if (tl > 0) result.topLeftRadius = tl;
        if (tr > 0) result.topRightRadius = tr;
        if (bl > 0) result.bottomLeftRadius = bl;
        if (br > 0) result.bottomRightRadius = br;
        return result;
    }

    /**
     * Extract box-shadow as Figma effects array.
     */
    function extractEffects(computedStyle) {
        const shadow = computedStyle.boxShadow;
        if (!shadow || shadow === 'none') return undefined;

        const effects = [];
        // Parse multiple shadows (split by commas not inside parentheses)
        const shadowParts = shadow.split(/,(?![^(]*\))/);

        for (const part of shadowParts) {
            const trimmed = part.trim();
            const isInset = trimmed.includes('inset');
            const cleanPart = trimmed.replace('inset', '').trim();

            // Match: color-value offset-x offset-y blur-radius? spread-radius?
            // CSS shadows can have color at start OR end
            const numericMatch = cleanPart.match(/([-\d.]+)px\s+([-\d.]+)px\s*(?:([-\d.]+)px)?\s*(?:([-\d.]+)px)?/);
            if (!numericMatch) continue;

            const colorMatch = cleanPart.match(/rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]{3,8}|\b[a-z]+\b/i);
            const color = colorMatch ? cssColorToHex(colorMatch[0]) : '#000000';

            effects.push({
                type: isInset ? 'INNER_SHADOW' : 'DROP_SHADOW',
                color: color || '#000000',
                offset: {
                    x: parseFloat(numericMatch[1]) || 0,
                    y: parseFloat(numericMatch[2]) || 0,
                },
                radius: parseFloat(numericMatch[3]) || 0,
                spread: parseFloat(numericMatch[4]) || 0,
                visible: true,
            });
        }

        return effects.length > 0 ? effects : undefined;
    }

    /**
     * Extract border/stroke information.
     */
    function extractStrokes(computedStyle) {
        const width = parseInt(computedStyle.borderTopWidth, 10) || 0;
        if (width === 0) return {};

        const style = computedStyle.borderTopStyle;
        if (style === 'none' || style === 'hidden') return {};

        const color = cssColorToHex(computedStyle.borderTopColor);
        if (!color) return {};

        return {
            strokes: [{
                type: 'SOLID',
                color: color,
                opacity: cssColorOpacity(computedStyle.borderTopColor),
            }],
            strokeWeight: width,
            strokeAlign: 'INSIDE',
        };
    }

    /**
     * Extract fills from computed style (background color and gradients).
     */
    function extractFills(computedStyle) {
        const fills = [];
        const bgColor = computedStyle.backgroundColor;
        const bgImage = computedStyle.backgroundImage;

        // Check for CSS gradients
        if (bgImage && bgImage !== 'none') {
            const linearGradientMatch = bgImage.match(/linear-gradient\(([^)]+(?:\([^)]*\))*[^)]*)\)/);
            if (linearGradientMatch) {
                const gradientContent = linearGradientMatch[1];
                // Extract color stops
                const colorStopRegex = /(rgba?\([^)]+\)|hsla?\([^)]+\)|#[0-9a-fA-F]{3,8}|\b[a-z]+(?:\s+[a-z]+)?\b)\s*(\d+%)?/gi;
                const stops = [];
                let match;
                while ((match = colorStopRegex.exec(gradientContent)) !== null) {
                    const color = cssColorToHex(match[1]);
                    if (color) {
                        const position = match[2] ? parseFloat(match[2]) / 100 : null;
                        stops.push({
                            color,
                            position: position !== null ? position : stops.length === 0 ? 0 : 1,
                            opacity: cssColorOpacity(match[1]),
                        });
                    }
                }
                if (stops.length >= 2) {
                    // Assign even positions if not specified
                    stops.forEach((s, i) => {
                        if (s.position === null) {
                            s.position = i / (stops.length - 1);
                        }
                    });
                    fills.push({
                        type: 'GRADIENT_LINEAR',
                        gradientStops: stops,
                        gradientTransform: [[0, 1, 0], [-1, 0, 1]],
                    });
                }
            }
        }

        // Background color (only if meaningful)
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            const hex = cssColorToHex(bgColor);
            const opacity = cssColorOpacity(bgColor);
            if (hex) {
                fills.push({
                    type: 'SOLID',
                    color: hex,
                    opacity: opacity < 1 ? opacity : undefined,
                });
            }
        }

        return fills.length > 0 ? fills : undefined;
    }

    // ==========================================================================
    // ELEMENT VISIBILITY CHECK
    // ==========================================================================

    function isElementVisible(element, computedStyle) {
        if (computedStyle.display === 'none') return false;
        if (computedStyle.visibility === 'hidden') return false;
        if (parseFloat(computedStyle.opacity) === 0) return false;

        const rect = element.getBoundingClientRect();
        if (rect.width < CONFIG.minSize && rect.height < CONFIG.minSize) return false;

        return true;
    }

    // ==========================================================================
    // TEXT CONTENT EXTRACTION
    // ==========================================================================

    /**
     * Get direct text content of an element (not from children).
     */
    function getDirectTextContent(element) {
        let text = '';
        for (const child of element.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) {
                text += child.textContent;
            }
        }
        return text.trim();
    }

    /**
     * Get all visible text content (recursive) for elements that are text-like.
     */
    function getAllTextContent(element) {
        return (element.textContent || '').trim();
    }

    /**
     * Check if an element is purely a text container (no meaningful child elements).
     */
    function isPureTextElement(element) {
        // If it has no element children, it's text
        if (element.children.length === 0) {
            return (element.textContent || '').trim().length > 0;
        }

        // If all children are inline text elements (span, strong, em, etc.)
        const inlineTextTags = new Set(['SPAN', 'STRONG', 'EM', 'B', 'I', 'U', 'S', 'A', 'MARK', 'SMALL', 'SUB', 'SUP', 'CODE', 'KBD', 'SAMP', 'VAR', 'ABBR', 'CITE', 'DFN', 'TIME']);
        for (const child of element.children) {
            if (!inlineTextTags.has(child.tagName)) return false;
        }
        return true;
    }

    // ==========================================================================
    // MAIN DOM TRAVERSAL
    // ==========================================================================

    let imageConversionCount = 0;
    let svgExtractionCount = 0;
    let nodeCount = 0;

    /**
     * Recursively traverse the DOM and build the NodeData tree.
     */
    async function traverseElement(element, depth = 0) {
        if (depth > CONFIG.maxDepth) return null;
        if (!element || !element.tagName) return null;

        const tagName = element.tagName.toUpperCase();

        // Skip excluded tags
        if (CONFIG.skipTags.has(tagName)) return null;

        const computedStyle = window.getComputedStyle(element);

        // Skip invisible elements
        if (CONFIG.skipInvisible && !isElementVisible(element, computedStyle)) return null;

        nodeCount++;
        if (nodeCount % 50 === 0) {
            console.log(`[Anti-Gravity] Processing node ${nodeCount}...`);
        }

        const rect = element.getBoundingClientRect();

        // -----------------------------------------------------------------------
        // Handle SVG elements → ICON type
        // -----------------------------------------------------------------------
        if (tagName === 'SVG' || element instanceof SVGElement) {
            const svgString = extractSvg(element.closest('svg') || element);
            if (svgString) {
                svgExtractionCount++;
                return {
                    type: 'ICON',
                    name: element.getAttribute('aria-label') || element.getAttribute('data-icon') || `SVG Icon ${svgExtractionCount}`,
                    icon: svgString,
                    size: Math.max(rect.width, rect.height) || 24,
                    color: cssColorToHex(computedStyle.color) || '#000000',
                    width: Math.round(rect.width) || 24,
                    height: Math.round(rect.height) || 24,
                };
            }
        }

        // -----------------------------------------------------------------------
        // Handle IMG elements → IMAGE type
        // -----------------------------------------------------------------------
        if (tagName === 'IMG') {
            const src = element.src || element.getAttribute('src');
            if (!src) return null;

            const base64Src = await imageToBase64(src);
            imageConversionCount++;

            return {
                type: 'IMAGE',
                name: element.alt || element.getAttribute('aria-label') || `Image ${imageConversionCount}`,
                src: base64Src,
                width: Math.round(rect.width) || parseInt(element.getAttribute('width')) || 100,
                height: Math.round(rect.height) || parseInt(element.getAttribute('height')) || 100,
                ...extractCornerRadius(computedStyle),
            };
        }

        // -----------------------------------------------------------------------
        // Handle INPUT / BUTTON / SELECT → simplified representations
        // -----------------------------------------------------------------------
        if (tagName === 'INPUT') {
            const inputType = element.type || 'text';
            if (['text', 'email', 'password', 'search', 'tel', 'url', 'number'].includes(inputType)) {
                // Render as a frame with text (input-like)
                const placeholder = element.placeholder || element.value || '';
                const fills = extractFills(computedStyle);
                const node = {
                    type: 'FRAME',
                    name: `Input: ${element.name || inputType}`,
                    layoutMode: 'HORIZONTAL',
                    counterAxisAlignItems: 'CENTER',
                    width: Math.round(rect.width) || 200,
                    height: Math.round(rect.height) || 40,
                    padding: extractPadding(computedStyle),
                    ...extractCornerRadius(computedStyle),
                    ...extractStrokes(computedStyle),
                    fills: fills,
                    children: [{
                        type: 'TEXT',
                        name: 'Placeholder',
                        characters: placeholder || 'Enter text...',
                        fontSize: parseInt(computedStyle.fontSize) || 14,
                        fontFamily: mapFont(computedStyle.fontFamily),
                        fontWeight: mapFontWeight(computedStyle.fontWeight),
                        textColor: cssColorToHex(computedStyle.color) || '#666666',
                        width: 'fill',
                    }],
                };
                return node;
            }
            // Checkbox / radio → simplified rectangle
            if (['checkbox', 'radio'].includes(inputType)) {
                return {
                    type: 'RECTANGLE',
                    name: `${inputType === 'checkbox' ? 'Checkbox' : 'Radio'}`,
                    width: Math.round(rect.width) || 16,
                    height: Math.round(rect.height) || 16,
                    cornerRadius: inputType === 'radio' ? 999 : 3,
                    fills: extractFills(computedStyle) || [{ type: 'SOLID', color: '#FFFFFF' }],
                    ...extractStrokes(computedStyle),
                };
            }
            return null;
        }

        if (tagName === 'SELECT' || tagName === 'TEXTAREA') {
            const text = tagName === 'TEXTAREA' ? (element.value || element.placeholder || '') : (element.options?.[element.selectedIndex]?.text || '');
            return {
                type: 'FRAME',
                name: `${tagName === 'SELECT' ? 'Dropdown' : 'Textarea'}: ${element.name || ''}`,
                layoutMode: 'HORIZONTAL',
                counterAxisAlignItems: 'CENTER',
                width: Math.round(rect.width) || 200,
                height: Math.round(rect.height) || (tagName === 'TEXTAREA' ? 100 : 40),
                padding: extractPadding(computedStyle),
                ...extractCornerRadius(computedStyle),
                ...extractStrokes(computedStyle),
                fills: extractFills(computedStyle),
                children: [{
                    type: 'TEXT',
                    characters: text || '...',
                    fontSize: parseInt(computedStyle.fontSize) || 14,
                    fontFamily: mapFont(computedStyle.fontFamily),
                    fontWeight: mapFontWeight(computedStyle.fontWeight),
                    textColor: cssColorToHex(computedStyle.color) || '#333333',
                }],
            };
        }

        // -----------------------------------------------------------------------
        // Handle pure text elements → TEXT type
        // -----------------------------------------------------------------------
        if (isPureTextElement(element) || (CONFIG.textTags.has(tagName) && element.children.length === 0)) {
            const text = getAllTextContent(element);
            if (!text) return null;

            const fontSize = parseInt(computedStyle.fontSize, 10) || 14;
            const textNode = {
                type: 'TEXT',
                name: element.getAttribute('data-testid') || element.id || tagName.toLowerCase(),
                characters: text,
                fontSize,
                fontFamily: mapFont(computedStyle.fontFamily),
                fontWeight: mapFontWeight(computedStyle.fontWeight),
                textColor: cssColorToHex(computedStyle.color) || '#000000',
            };

            // Text alignment
            const textAlign = computedStyle.textAlign;
            if (textAlign === 'center') textNode.textAlign = 'CENTER';
            else if (textAlign === 'right' || textAlign === 'end') textNode.textAlign = 'RIGHT';
            else if (textAlign === 'justify') textNode.textAlign = 'JUSTIFIED';

            // Line height
            const lh = computedStyle.lineHeight;
            if (lh && lh !== 'normal') {
                const lhValue = parseFloat(lh);
                if (!isNaN(lhValue)) {
                    textNode.lineHeight = Math.round(lhValue);
                }
            }

            // Letter spacing
            const ls = computedStyle.letterSpacing;
            if (ls && ls !== 'normal' && ls !== '0px') {
                const lsValue = parseFloat(ls);
                if (!isNaN(lsValue) && lsValue !== 0) {
                    textNode.letterSpacing = lsValue;
                }
            }

            // Text decoration
            const td = computedStyle.textDecorationLine || computedStyle.textDecoration;
            if (td && td.includes('underline')) textNode.textDecoration = 'UNDERLINE';
            else if (td && td.includes('line-through')) textNode.textDecoration = 'STRIKETHROUGH';

            // Width sizing (try to match)
            if (rect.width > 0) {
                textNode.width = Math.round(rect.width);
            }

            return textNode;
        }

        // -----------------------------------------------------------------------
        // Handle container elements → FRAME type
        // -----------------------------------------------------------------------
        const frameNode = {
            type: 'FRAME',
            name: element.getAttribute('data-testid')
                || element.getAttribute('aria-label')
                || element.id
                || element.className?.split?.(' ')?.[0]
                || tagName.toLowerCase(),
        };

        // Dimensions from bounding rect
        frameNode.width = Math.round(rect.width);
        frameNode.height = Math.round(rect.height);

        // Layout analysis
        const layout = analyzeLayout(computedStyle);
        Object.assign(frameNode, layout);

        // If no auto layout detected, default to VERTICAL for block elements
        if (!frameNode.layoutMode) {
            const display = computedStyle.display;
            if (display === 'grid' || display === 'inline-grid') {
                frameNode.layoutMode = 'VERTICAL'; // Approximate grid as vertical
            }
            // For block-level elements with children, use VERTICAL
            else if (['block', 'list-item', 'table', 'flow-root'].includes(display)) {
                frameNode.layoutMode = 'VERTICAL';
            }
        }

        // Padding
        const padding = extractPadding(computedStyle);
        if (padding) frameNode.padding = padding;

        // Item spacing (if not already set from flex gap)
        if (!frameNode.itemSpacing && frameNode.layoutMode) {
            // Try to infer spacing from children positions
            const childElements = Array.from(element.children).filter(c =>
                !CONFIG.skipTags.has(c.tagName) &&
                window.getComputedStyle(c).display !== 'none'
            );
            if (childElements.length >= 2) {
                const rects = childElements.slice(0, 3).map(c => c.getBoundingClientRect());
                if (frameNode.layoutMode === 'VERTICAL' && rects.length >= 2) {
                    const spacing = Math.round(rects[1].top - rects[0].bottom);
                    if (spacing > 0 && spacing < 100) frameNode.itemSpacing = spacing;
                } else if (frameNode.layoutMode === 'HORIZONTAL' && rects.length >= 2) {
                    const spacing = Math.round(rects[1].left - rects[0].right);
                    if (spacing > 0 && spacing < 100) frameNode.itemSpacing = spacing;
                }
            }
        }

        // Corner radius
        Object.assign(frameNode, extractCornerRadius(computedStyle));

        // Fills
        const fills = extractFills(computedStyle);
        if (fills) frameNode.fills = fills;

        // Strokes
        Object.assign(frameNode, extractStrokes(computedStyle));

        // Effects (box-shadow)
        const effects = extractEffects(computedStyle);
        if (effects) frameNode.effects = effects;

        // Opacity
        const opacity = parseFloat(computedStyle.opacity);
        if (!isNaN(opacity) && opacity < 1) {
            frameNode.opacity = opacity;
        }

        // Handle background images (not gradients) → add an IMAGE child
        const bgImageUrl = extractBgImageUrl(computedStyle.backgroundImage);
        if (bgImageUrl && !computedStyle.backgroundImage.includes('gradient')) {
            const base64Src = await imageToBase64(bgImageUrl);
            imageConversionCount++;

            // If this frame has a bg image, we can represent it as a child image
            if (!frameNode.children) frameNode.children = [];
            frameNode.children.push({
                type: 'IMAGE',
                name: 'Background Image',
                src: base64Src,
                width: frameNode.width,
                height: frameNode.height,
                layoutPositioning: 'ABSOLUTE',
                x: 0,
                y: 0,
            });
        }

        // -----------------------------------------------------------------------
        // Process children
        // -----------------------------------------------------------------------
        const childElements = Array.from(element.children);
        if (childElements.length > 0 && childElements.length <= CONFIG.maxChildren) {
            const childPromises = childElements.map(child => traverseElement(child, depth + 1));
            const childNodes = await Promise.all(childPromises);
            const validChildren = childNodes.filter(Boolean);

            if (validChildren.length > 0) {
                if (!frameNode.children) frameNode.children = [];
                frameNode.children.push(...validChildren);
            }
        } else if (childElements.length > CONFIG.maxChildren) {
            console.warn(`[Anti-Gravity] Skipping ${childElements.length} children of "${frameNode.name}" (exceeds limit of ${CONFIG.maxChildren})`);
        }

        // If the frame has no children but has text, convert the direct text
        if ((!frameNode.children || frameNode.children.length === 0)) {
            const directText = getDirectTextContent(element);
            if (directText) {
                if (!frameNode.children) frameNode.children = [];
                frameNode.children.push({
                    type: 'TEXT',
                    characters: directText,
                    fontSize: parseInt(computedStyle.fontSize) || 14,
                    fontFamily: mapFont(computedStyle.fontFamily),
                    fontWeight: mapFontWeight(computedStyle.fontWeight),
                    textColor: cssColorToHex(computedStyle.color) || '#000000',
                });
            }
        }

        return frameNode;
    }

    // ==========================================================================
    // EXECUTION
    // ==========================================================================

    console.log('%c🚀 Anti-Gravity Extractor Starting...', 'color: #e94560; font-size: 16px; font-weight: bold;');
    console.log('%c  Scanning DOM and extracting layout, styles, and assets...', 'color: #a0a0a0;');
    const startTime = performance.now();

    // Start traversal from the <body> element
    const rootElement = document.body;
    const rootRect = rootElement.getBoundingClientRect();

    // Build the root node
    const rootNode = await traverseElement(rootElement, 0);

    if (!rootNode) {
        console.error('[Anti-Gravity] Failed to extract any nodes from the page.');
        return;
    }

    // Wrap in the plugin's expected structure
    const pluginJson = {
        type: 'FRAME',
        name: document.title || 'Extracted Page',
        layoutMode: rootNode.layoutMode || 'VERTICAL',
        width: Math.round(rootRect.width) || window.innerWidth,
        height: Math.round(rootRect.height) || window.innerHeight,
        padding: rootNode.padding,
        itemSpacing: rootNode.itemSpacing,
        fills: rootNode.fills || [{ type: 'SOLID', color: '#FFFFFF' }],
        children: rootNode.children || [],
    };

    const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);

    // Copy to clipboard
    const jsonOutput = JSON.stringify(pluginJson, null, 2);

    try {
        // Try the modern clipboard API first
        await navigator.clipboard.writeText(jsonOutput);
        console.log('%c✅ JSON copied to clipboard!', 'color: #00ff94; font-size: 14px; font-weight: bold;');
    } catch {
        // Fallback: try the copy() function available in some browser consoles
        try {
            copy(jsonOutput);
            console.log('%c✅ JSON copied to clipboard via copy()!', 'color: #00ff94; font-size: 14px; font-weight: bold;');
        } catch {
            // Last resort: log it
            console.log('%c⚠️ Could not auto-copy. Use copy(jsonOutput) or grab it from the output below.', 'color: #ffb800; font-size: 13px;');
            console.log(jsonOutput);
        }
    }

    // Summary
    console.log(`%c📊 Extraction Summary:`, 'color: #8B5CF6; font-size: 14px; font-weight: bold;');
    console.log(`   ⏱  Time:     ${elapsed}s`);
    console.log(`   🧩 Nodes:    ${nodeCount}`);
    console.log(`   🖼  Images:   ${imageConversionCount} (converted to Base64)`);
    console.log(`   🎨 SVG Icons: ${svgExtractionCount} (serialized)`);
    console.log(`   📦 JSON Size: ${(jsonOutput.length / 1024).toFixed(1)} KB`);
    console.log('%c  Paste the JSON into the AI-to-UI Figma Plugin to generate your design! ✨', 'color: #a0a0a0;');

    // Also store on window for easy access
    window.__antiGravityJSON = pluginJson;
    console.log('%c💡 Tip: Access the data anytime via window.__antiGravityJSON', 'color: #a0a0a0;');

    return pluginJson;
})();
