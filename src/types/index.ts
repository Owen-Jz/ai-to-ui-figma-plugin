export interface Padding {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

export interface FillStyle {
    type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL';
    color?: string;
    opacity?: number;
    gradientStops?: { color: string; position: number; opacity?: number }[];
    gradientTransform?: [[number, number, number], [number, number, number]];
}

export interface StrokeStyle {
    type: 'SOLID';
    color: string;
    opacity?: number;
}

export interface ShadowEffect {
    type: 'DROP_SHADOW' | 'INNER_SHADOW';
    color: string;
    offset?: { x: number; y: number };
    radius: number;
    spread?: number;
    visible?: boolean;
}

export interface BlurEffect {
    type: 'LAYER_BLUR' | 'BACKGROUND_BLUR';
    radius: number;
    visible?: boolean;
}

export type EffectStyle = ShadowEffect | BlurEffect;

export interface SitemapNode {
    label: string;
    url?: string;
    children?: SitemapNode[];
    status?: 'pending' | 'completed' | 'in-progress';
    assignee?: string;
    priority?: 'low' | 'medium' | 'high';
}

export interface SitemapLayoutNode {
    data: SitemapNode;
    x: number;
    y: number;
    width: number;
    height: number;
    children: SitemapLayoutNode[];
    subtreeWidth: number;
}

export interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
}

export interface StyleDefinition {
    colors?: Record<string, string>;
    typography?: Record<string, {
        fontFamily: string;
        fontSize: number;
        fontWeight: string;
        lineHeight?: number | 'AUTO';
        letterSpacing?: number;
    }>;
}

export interface PluginInput {
    styles?: StyleDefinition;
    components?: Record<string, NodeData>;
    root: NodeData;
}

export interface BuildContext {
    styles: {
        colors: Record<string, string>;
        typography: Record<string, string>;
    };
    components: Record<string, ComponentNode>;
}

export type NodeType = 'FRAME' | 'TEXT' | 'IMAGE' | 'RECTANGLE' | 'ICON' | 'CHART' | 'SITEMAP' | 'INSTANCE' | 'BUTTON' | 'INPUT' | 'AVATAR' | 'BADGE' | 'DIVIDER' | 'PROGRESS' | 'SPACER';

export interface NodeData {
    type: NodeType;
    name?: string;
    componentName?: string;

    layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'WRAP';
    layoutWrap?: 'NO_WRAP' | 'WRAP';
    primaryAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN';
    counterAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE';
    primaryAxisSizingMode?: 'FIXED' | 'AUTO';
    counterAxisSizingMode?: 'FIXED' | 'AUTO';
    itemSpacing?: number;
    padding?: Padding;

    width?: 'fill' | 'hug' | number;
    height?: 'fill' | 'hug' | number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;

    absolute?: boolean;
    x?: number;
    y?: number;

    layoutPositioning?: 'AUTO' | 'ABSOLUTE';
    constraints?: {
        horizontal?: 'MIN' | 'MAX' | 'CENTER' | 'STRETCH' | 'SCALE';
        vertical?: 'MIN' | 'MAX' | 'CENTER' | 'STRETCH' | 'SCALE';
    };

    fills?: FillStyle[];
    fillStyleId?: string;
    strokes?: StrokeStyle[];
    strokeStyleId?: string;
    strokeWeight?: number;
    strokeAlign?: 'INSIDE' | 'OUTSIDE' | 'CENTER';
    cornerRadius?: number;
    topLeftRadius?: number;
    topRightRadius?: number;
    bottomLeftRadius?: number;
    bottomRightRadius?: number;
    effects?: EffectStyle[];
    opacity?: number;

    characters?: string;
    fontSize?: number;
    fontWeight?: 'Regular' | 'Medium' | 'Bold' | 'Light' | 'SemiBold' | 'ExtraBold';
    fontFamily?: string;
    textColor?: string;
    textStyleId?: string;
    textAlign?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
    lineHeight?: number | 'AUTO';
    letterSpacing?: number;
    textDecoration?: 'NONE' | 'UNDERLINE' | 'STRIKETHROUGH';

    src?: string;

    icon?: string;
    size?: number;
    color?: string;

    background?: string;

    chartType?: 'PIE' | 'DONUT' | 'BAR' | 'LINE';
    chartData?: ChartDataPoint[];
    showLabels?: boolean;
    showLegend?: boolean;
    donutHoleSize?: number;

    sitemapData?: SitemapNode;
    nodeWidth?: number;
    levelSpacing?: number;
    siblingSpacing?: number;

    children?: NodeData[];

    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    disabled?: boolean;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    fullWidth?: boolean;

    placeholder?: string;
    inputType?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
    prefix?: string;
    suffix?: string;
    multiline?: boolean;

    fallback?: string;
    avatarShape?: 'circle' | 'square' | 'rounded';

    badgeLabel?: string;
    badgeVariant?: 'default' | 'success' | 'warning' | 'error' | 'info';

    dividerOrientation?: 'horizontal' | 'vertical';
    dividerThickness?: number;

    progressValue?: number;
    progressVariant?: 'linear' | 'circular';
    progressColor?: string;

    spacerSize?: number;
}

export interface NodeResult {
    node: SceneNode;
    data: NodeData;
}
