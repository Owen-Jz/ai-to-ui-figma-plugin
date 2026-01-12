// AI-to-UI Figma Plugin - Main Logic
// Recursively builds native Figma elements from AI-generated JSON

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Padding {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

interface FillStyle {
    type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL';
    color?: string;
    opacity?: number;
}

interface StrokeStyle {
    type: 'SOLID';
    color: string;
    opacity?: number;
}

interface ShadowEffect {
    type: 'DROP_SHADOW' | 'INNER_SHADOW';
    color: string;
    offset?: { x: number; y: number };
    radius: number;
    spread?: number;
    visible?: boolean;
}

interface BlurEffect {
    type: 'LAYER_BLUR' | 'BACKGROUND_BLUR';
    radius: number;
    visible?: boolean;
}

type EffectStyle = ShadowEffect | BlurEffect;

interface NodeData {
    type: 'FRAME' | 'TEXT' | 'IMAGE' | 'RECTANGLE';
    name?: string;

    // Layout properties
    layoutMode?: 'HORIZONTAL' | 'VERTICAL';
    primaryAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN';
    counterAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER';
    primaryAxisSizingMode?: 'FIXED' | 'AUTO';
    counterAxisSizingMode?: 'FIXED' | 'AUTO';
    itemSpacing?: number;
    padding?: Padding;

    // Sizing
    width?: 'fill' | 'hug' | number;
    height?: 'fill' | 'hug' | number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;

    // Position (only used when absolute: true)
    absolute?: boolean;
    x?: number;
    y?: number;

    // Styling
    fills?: FillStyle[];
    strokes?: StrokeStyle[];
    strokeWeight?: number;
    strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
    cornerRadius?: number;
    topLeftRadius?: number;
    topRightRadius?: number;
    bottomLeftRadius?: number;
    bottomRightRadius?: number;
    effects?: EffectStyle[];
    opacity?: number;

    // Text properties
    characters?: string;
    fontSize?: number;
    fontWeight?: 'Regular' | 'Medium' | 'Bold' | 'Light' | 'SemiBold' | 'ExtraBold';
    fontFamily?: string;
    textColor?: string;
    textAlign?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
    lineHeight?: number | 'AUTO';
    letterSpacing?: number;
    textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';

    // Image properties
    src?: string;

    // Children
    children?: NodeData[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Parse hex color to RGB object (0-1 range)
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Handle shorthand hex (e.g., #FFF)
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }

    // Handle 8-character hex (with alpha)
    if (hex.length === 8) {
        hex = hex.substring(0, 6);
    }

    const bigint = parseInt(hex, 16);
    return {
        r: ((bigint >> 16) & 255) / 255,
        g: ((bigint >> 8) & 255) / 255,
        b: (bigint & 255) / 255
    };
}

/**
 * Parse hex color alpha if present (8-char hex)
 */
function hexToAlpha(hex: string): number {
    hex = hex.replace(/^#/, '');
    if (hex.length === 8) {
        return parseInt(hex.substring(6, 8), 16) / 255;
    }
    return 1;
}

/**
 * Generate placeholder image URL based on keyword
 */
function getPlaceholderImageUrl(keyword: string, width: number = 400, height: number = 300): string {
    const keywords: Record<string, string> = {
        'avatar': 'portrait,face',
        'hero': 'landscape,nature',
        'product': 'product,minimal',
        'team': 'people,team',
        'office': 'office,workspace',
        'nature': 'nature,landscape',
        'tech': 'technology,computer',
        'food': 'food,restaurant',
        'travel': 'travel,adventure',
        'abstract': 'abstract,pattern'
    };

    const searchTerm = keywords[keyword.toLowerCase()] || keyword;
    return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(searchTerm)}`;
}

/**
 * Map font weight string to Figma font style
 */
function mapFontWeight(weight?: string): string {
    const weightMap: Record<string, string> = {
        'Light': 'Light',
        'Regular': 'Regular',
        'Medium': 'Medium',
        'SemiBold': 'SemiBold',
        'Bold': 'Bold',
        'ExtraBold': 'ExtraBold'
    };
    return weightMap[weight || 'Regular'] || 'Regular';
}

/**
 * Load image from URL and return image hash
 */
async function loadImageFromUrl(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;

        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const imageHash = figma.createImage(uint8Array).hash;

        return imageHash;
    } catch (error) {
        console.error('Failed to load image:', error);
        return null;
    }
}

// ============================================================================
// NODE CREATION FUNCTIONS
// ============================================================================

/**
 * Apply common styling properties to a node
 */
function applyCommonStyles(node: SceneNode & MinimalFillsMixin & MinimalBlendMixin, data: NodeData): void {
    // Apply fills
    if (data.fills && data.fills.length > 0) {
        const paints: Paint[] = data.fills.map(fill => {
            if (fill.type === 'SOLID' && fill.color) {
                const rgb = hexToRgb(fill.color);
                return {
                    type: 'SOLID' as const,
                    color: rgb,
                    opacity: fill.opacity ?? hexToAlpha(fill.color)
                };
            }
            return { type: 'SOLID' as const, color: { r: 0.5, g: 0.5, b: 0.5 } };
        });
        node.fills = paints;
    }

    // Apply opacity
    if (data.opacity !== undefined) {
        node.opacity = data.opacity;
    }
}

/**
 * Apply geometry styles (strokes, corners, effects) to a node
 */
function applyGeometryStyles(node: FrameNode | RectangleNode, data: NodeData): void {
    // Apply strokes
    if (data.strokes && data.strokes.length > 0) {
        const strokePaints: Paint[] = data.strokes.map(stroke => {
            const rgb = hexToRgb(stroke.color);
            return {
                type: 'SOLID' as const,
                color: rgb,
                opacity: stroke.opacity ?? 1
            };
        });
        node.strokes = strokePaints;
        node.strokeWeight = data.strokeWeight ?? 1;
        node.strokeAlign = data.strokeAlign ?? 'INSIDE';
    }

    // Apply corner radius
    if (data.cornerRadius !== undefined) {
        node.cornerRadius = data.cornerRadius;
    }

    // Apply individual corner radii
    if (data.topLeftRadius !== undefined) node.topLeftRadius = data.topLeftRadius;
    if (data.topRightRadius !== undefined) node.topRightRadius = data.topRightRadius;
    if (data.bottomLeftRadius !== undefined) node.bottomLeftRadius = data.bottomLeftRadius;
    if (data.bottomRightRadius !== undefined) node.bottomRightRadius = data.bottomRightRadius;

    // Apply effects (shadows, blurs)
    if (data.effects && data.effects.length > 0) {
        const figmaEffects: Effect[] = data.effects.map(effect => {
            if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
                const shadowEffect = effect as ShadowEffect;
                const rgb = hexToRgb(shadowEffect.color);
                const alpha = hexToAlpha(shadowEffect.color);
                return {
                    type: shadowEffect.type,
                    color: { ...rgb, a: alpha },
                    offset: shadowEffect.offset ?? { x: 0, y: 4 },
                    radius: shadowEffect.radius,
                    spread: shadowEffect.spread ?? 0,
                    visible: shadowEffect.visible ?? true,
                    blendMode: 'NORMAL' as const
                };
            } else {
                const blurEffect = effect as BlurEffect;
                return {
                    type: blurEffect.type,
                    radius: blurEffect.radius,
                    visible: blurEffect.visible ?? true
                };
            }
        });
        node.effects = figmaEffects;
    }
}

/**
 * Check if a node is inside an auto-layout parent
 */
function isInAutoLayoutParent(node: SceneNode): boolean {
    const parent = node.parent;
    if (parent && 'layoutMode' in parent) {
        return parent.layoutMode !== 'NONE';
    }
    return false;
}

/**
 * Apply sizing properties to a node
 * Note: FILL sizing only works when node is already appended to an auto-layout parent
 */
function applySizing(node: FrameNode | RectangleNode | TextNode, data: NodeData, isAppended: boolean = false): void {
    const canUseFillHug = isAppended && isInAutoLayoutParent(node);

    // Handle width
    if (data.width === 'fill') {
        if (canUseFillHug && 'layoutSizingHorizontal' in node) {
            node.layoutSizingHorizontal = 'FILL';
        }
    } else if (data.width === 'hug') {
        // HUG can be set on auto-layout frames even without parent
        if ('layoutSizingHorizontal' in node) {
            node.layoutSizingHorizontal = 'HUG';
        }
    } else if (typeof data.width === 'number') {
        if ('resize' in node) {
            node.resize(data.width, node.height);
        }
        if ('layoutSizingHorizontal' in node) {
            node.layoutSizingHorizontal = 'FIXED';
        }
    }

    // Handle height
    if (data.height === 'fill') {
        if (canUseFillHug && 'layoutSizingVertical' in node) {
            node.layoutSizingVertical = 'FILL';
        }
    } else if (data.height === 'hug') {
        // HUG can be set on auto-layout frames even without parent
        if ('layoutSizingVertical' in node) {
            node.layoutSizingVertical = 'HUG';
        }
    } else if (typeof data.height === 'number') {
        if ('resize' in node) {
            node.resize(node.width, data.height);
        }
        if ('layoutSizingVertical' in node) {
            node.layoutSizingVertical = 'FIXED';
        }
    }

    // Apply min/max constraints
    if ('minWidth' in node && data.minWidth !== undefined) {
        node.minWidth = data.minWidth;
    }
    if ('maxWidth' in node && data.maxWidth !== undefined) {
        node.maxWidth = data.maxWidth;
    }
    if ('minHeight' in node && data.minHeight !== undefined) {
        node.minHeight = data.minHeight;
    }
    if ('maxHeight' in node && data.maxHeight !== undefined) {
        node.maxHeight = data.maxHeight;
    }
}

/**
 * Create a FRAME node with Auto Layout
 */
async function createFrame(data: NodeData, parent?: FrameNode): Promise<{ node: FrameNode; data: NodeData }> {
    const frame = figma.createFrame();
    frame.name = data.name || 'Frame';

    // Apply Auto Layout (mandatory unless absolute)
    if (!data.absolute) {
        frame.layoutMode = data.layoutMode || 'VERTICAL';
        frame.primaryAxisAlignItems = data.primaryAxisAlignItems || 'MIN';
        frame.counterAxisAlignItems = data.counterAxisAlignItems || 'MIN';
        frame.itemSpacing = data.itemSpacing ?? 0;

        // Apply padding
        if (data.padding) {
            frame.paddingTop = data.padding.top ?? 0;
            frame.paddingRight = data.padding.right ?? 0;
            frame.paddingBottom = data.padding.bottom ?? 0;
            frame.paddingLeft = data.padding.left ?? 0;
        }

        // Default sizing for auto layout
        frame.primaryAxisSizingMode = data.primaryAxisSizingMode || 'AUTO';
        frame.counterAxisSizingMode = data.counterAxisSizingMode || 'AUTO';
    }

    // Apply common and geometry styles
    applyCommonStyles(frame, data);
    applyGeometryStyles(frame, data);

    // Set initial size if specified (fixed sizes only)
    if (typeof data.width === 'number') {
        frame.resize(data.width, frame.height);
    }
    if (typeof data.height === 'number') {
        frame.resize(frame.width, data.height);
    }

    // Process children recursively
    if (data.children && data.children.length > 0) {
        for (const childData of data.children) {
            const result = await createNodeWithData(childData, frame);
            if (result) {
                // Append child to frame first
                frame.appendChild(result.node);
                // Now apply FILL sizing since node is in auto-layout parent
                applySizing(result.node as FrameNode | RectangleNode | TextNode, result.data, true);
            }
        }
    }

    // Apply HUG sizing (doesn't require parent) - but NOT fill yet
    if (data.width === 'hug' && 'layoutSizingHorizontal' in frame) {
        frame.layoutSizingHorizontal = 'HUG';
    }
    if (data.height === 'hug' && 'layoutSizingVertical' in frame) {
        frame.layoutSizingVertical = 'HUG';
    }

    // Handle absolute positioning
    if (data.absolute && data.x !== undefined && data.y !== undefined) {
        frame.x = data.x;
        frame.y = data.y;
    }

    return { node: frame, data };
}

/**
 * Create a TEXT node
 */
async function createText(data: NodeData, parent?: FrameNode): Promise<{ node: TextNode; data: NodeData }> {
    const text = figma.createText();
    text.name = data.name || 'Text';

    // Determine font family and style
    const fontFamily = data.fontFamily || 'Inter';
    const fontStyle = mapFontWeight(data.fontWeight);

    // Track which font we actually loaded
    let loadedFont = { family: fontFamily, style: fontStyle };

    // Load font FIRST before any text operations
    try {
        await figma.loadFontAsync({ family: fontFamily, style: fontStyle });
    } catch {
        // Fallback to Inter Regular if requested font isn't available
        try {
            await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
            loadedFont = { family: 'Inter', style: 'Regular' };
        } catch {
            // Last resort fallback
            await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
            loadedFont = { family: 'Roboto', style: 'Regular' };
        }
    }

    // Set fontName BEFORE setting characters (required by Figma API)
    text.fontName = loadedFont;

    // Now we can safely set the text content
    text.characters = data.characters || 'Text';

    // Apply font size after characters are set
    if (data.fontSize) {
        text.fontSize = data.fontSize;
    }

    // Apply text color
    if (data.textColor) {
        const rgb = hexToRgb(data.textColor);
        text.fills = [{ type: 'SOLID', color: rgb }];
    }

    // Apply text alignment
    if (data.textAlign) {
        text.textAlignHorizontal = data.textAlign;
    }

    // Apply line height
    if (data.lineHeight !== undefined) {
        if (data.lineHeight === 'AUTO') {
            text.lineHeight = { unit: 'AUTO' };
        } else {
            text.lineHeight = { unit: 'PIXELS', value: data.lineHeight };
        }
    }

    // Apply letter spacing
    if (data.letterSpacing !== undefined) {
        text.letterSpacing = { unit: 'PIXELS', value: data.letterSpacing };
    }

    // Apply text decoration
    if (data.textDecoration) {
        text.textDecoration = data.textDecoration;
    }

    // Note: FILL sizing will be applied after appending to parent
    return { node: text, data };
}

/**
 * Create an IMAGE node (rectangle with image fill)
 */
async function createImage(data: NodeData, parent?: FrameNode): Promise<{ node: RectangleNode; data: NodeData }> {
    const rect = figma.createRectangle();
    rect.name = data.name || 'Image';

    // Set initial size
    const width = typeof data.width === 'number' ? data.width : 400;
    const height = typeof data.height === 'number' ? data.height : 300;
    rect.resize(width, height);

    // Apply corner radius
    if (data.cornerRadius !== undefined) {
        rect.cornerRadius = data.cornerRadius;
    }

    // Load and apply image
    if (data.src) {
        let imageUrl = data.src;

        // Check if it's a keyword rather than a URL
        if (!data.src.startsWith('http')) {
            imageUrl = getPlaceholderImageUrl(data.src, width, height);
        }

        const imageHash = await loadImageFromUrl(imageUrl);
        if (imageHash) {
            rect.fills = [{
                type: 'IMAGE',
                imageHash: imageHash,
                scaleMode: 'FILL'
            }];
        } else {
            // Fallback to a solid color if image fails to load
            rect.fills = [{
                type: 'SOLID',
                color: { r: 0.9, g: 0.9, b: 0.9 }
            }];
        }
    }

    // Note: FILL sizing will be applied after appending to parent
    return { node: rect, data };
}

/**
 * Create a RECTANGLE node
 */
function createRectangle(data: NodeData, parent?: FrameNode): { node: RectangleNode; data: NodeData } {
    const rect = figma.createRectangle();
    rect.name = data.name || 'Rectangle';

    // Set initial size
    const width = typeof data.width === 'number' ? data.width : 100;
    const height = typeof data.height === 'number' ? data.height : 100;
    rect.resize(width, height);

    // Apply common and geometry styles
    applyCommonStyles(rect, data);
    applyGeometryStyles(rect, data);

    // Note: FILL sizing will be applied after appending to parent
    return { node: rect, data };
}

/**
 * Interface for node creation result
 */
interface NodeResult {
    node: SceneNode;
    data: NodeData;
}

/**
 * Main recursive function to create nodes - returns node with its data
 * for deferred sizing application
 */
async function createNodeWithData(data: NodeData, parent?: FrameNode): Promise<NodeResult | null> {
    switch (data.type) {
        case 'FRAME':
            return await createFrame(data, parent);
        case 'TEXT':
            return await createText(data, parent);
        case 'IMAGE':
            return await createImage(data, parent);
        case 'RECTANGLE':
            return createRectangle(data, parent);
        default:
            console.warn(`Unknown node type: ${(data as any).type}`);
            return null;
    }
}

/**
 * Create the root node - handles the top-level node that gets added to the page
 */
async function createRootNode(data: NodeData): Promise<SceneNode | null> {
    const result = await createNodeWithData(data);
    if (!result) return null;

    // Root nodes don't need FILL sizing since they're not in an auto-layout parent
    return result.node;
}

// ============================================================================
// PLUGIN INITIALIZATION
// ============================================================================

// Show the plugin UI
figma.showUI(__html__, {
    width: 420,
    height: 600,
    themeColors: true
});

// Handle messages from the UI
figma.ui.onmessage = async (msg: { type: string; data?: NodeData }) => {
    if (msg.type === 'build' && msg.data) {
        try {
            // Start building the design
            const rootNode = await createRootNode(msg.data);

            if (rootNode) {
                // Position at center of viewport
                const viewportCenter = figma.viewport.center;
                rootNode.x = viewportCenter.x - rootNode.width / 2;
                rootNode.y = viewportCenter.y - rootNode.height / 2;

                // Append to current page
                figma.currentPage.appendChild(rootNode);

                // Select the created node and zoom to it
                figma.currentPage.selection = [rootNode];
                figma.viewport.scrollAndZoomIntoView([rootNode]);

                // Send success message
                figma.ui.postMessage({
                    type: 'success',
                    message: `✨ Design created successfully! ${countNodes(msg.data)} nodes generated.`
                });
            } else {
                figma.ui.postMessage({
                    type: 'error',
                    message: 'Failed to create the design. Please check your JSON structure.'
                });
            }
        } catch (error) {
            console.error('Build error:', error);
            figma.ui.postMessage({
                type: 'error',
                message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            });
        }
    }
};

/**
 * Count total nodes in the design
 */
function countNodes(data: NodeData): number {
    let count = 1;
    if (data.children) {
        for (const child of data.children) {
            count += countNodes(child);
        }
    }
    return count;
}
