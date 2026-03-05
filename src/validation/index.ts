import { z } from 'zod';
import type { NodeData, PluginInput, SitemapNode } from '../types/index';

export const PaddingSchema = z.object({
    top: z.number().optional(),
    right: z.number().optional(),
    bottom: z.number().optional(),
    left: z.number().optional(),
}).optional();

export const FillStyleSchema = z.object({
    type: z.enum(['SOLID', 'GRADIENT_LINEAR', 'GRADIENT_RADIAL']),
    color: z.string().optional(),
    opacity: z.number().optional(),
    gradientStops: z.array(z.object({
        color: z.string(),
        position: z.number(),
        opacity: z.number().optional(),
    })).optional(),
    gradientTransform: z.tuple([
        z.tuple([z.number(), z.number(), z.number()]),
        z.tuple([z.number(), z.number(), z.number()]),
    ]).optional(),
});

export const StrokeStyleSchema = z.object({
    type: z.literal('SOLID'),
    color: z.string(),
    opacity: z.number().optional(),
});

export const ShadowEffectSchema = z.object({
    type: z.enum(['DROP_SHADOW', 'INNER_SHADOW']),
    color: z.string(),
    offset: z.object({
        x: z.number(),
        y: z.number(),
    }).optional(),
    radius: z.number(),
    spread: z.number().optional(),
    visible: z.boolean().optional(),
});

export const BlurEffectSchema = z.object({
    type: z.enum(['LAYER_BLUR', 'BACKGROUND_BLUR']),
    radius: z.number(),
    visible: z.boolean().optional(),
});

export const EffectStyleSchema = z.union([ShadowEffectSchema, BlurEffectSchema]);

export const ChartDataPointSchema = z.object({
    label: z.string(),
    value: z.number(),
    color: z.string().optional(),
});

const SitemapNodeSchema: z.ZodType<SitemapNode> = z.object({
    label: z.string(),
    url: z.string().optional(),
    children: z.array(z.lazy((): z.ZodType<SitemapNode> => SitemapNodeSchema)).optional(),
    status: z.enum(['pending', 'completed', 'in-progress']).optional(),
    assignee: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
});

export const StyleDefinitionSchema = z.object({
    colors: z.record(z.string()).optional(),
    typography: z.record(z.object({
        fontFamily: z.string(),
        fontSize: z.number(),
        fontWeight: z.string(),
        lineHeight: z.union([z.number(), z.literal('AUTO')]).optional(),
        letterSpacing: z.number().optional(),
    })).optional(),
});

const NodeDataSchema: z.ZodType<NodeData> = z.lazy(() => z.object({
    type: z.enum(['FRAME', 'TEXT', 'IMAGE', 'RECTANGLE', 'ICON', 'CHART', 'SITEMAP', 'INSTANCE', 'BUTTON', 'INPUT', 'AVATAR', 'BADGE', 'DIVIDER', 'PROGRESS', 'SPACER']),
    name: z.string().optional(),
    componentName: z.string().optional(),

    layoutMode: z.enum(['HORIZONTAL', 'VERTICAL', 'WRAP']).optional(),
    layoutWrap: z.enum(['NO_WRAP', 'WRAP']).optional(),
    primaryAxisAlignItems: z.enum(['MIN', 'MAX', 'CENTER', 'SPACE_BETWEEN']).optional(),
    counterAxisAlignItems: z.enum(['MIN', 'MAX', 'CENTER', 'BASELINE']).optional(),
    primaryAxisSizingMode: z.enum(['FIXED', 'AUTO']).optional(),
    counterAxisSizingMode: z.enum(['FIXED', 'AUTO']).optional(),
    itemSpacing: z.number().optional(),
    padding: PaddingSchema,

    width: z.union([z.literal('fill'), z.literal('hug'), z.number()]).optional(),
    height: z.union([z.literal('fill'), z.literal('hug'), z.number()]).optional(),
    minWidth: z.number().optional(),
    maxWidth: z.number().optional(),
    minHeight: z.number().optional(),
    maxHeight: z.number().optional(),

    absolute: z.boolean().optional(),
    x: z.number().optional(),
    y: z.number().optional(),

    layoutPositioning: z.enum(['AUTO', 'ABSOLUTE']).optional(),
    constraints: z.object({
        horizontal: z.enum(['MIN', 'MAX', 'CENTER', 'STRETCH', 'SCALE']).optional(),
        vertical: z.enum(['MIN', 'MAX', 'CENTER', 'STRETCH', 'SCALE']).optional(),
    }).optional(),

    fills: FillStyleSchema.array().optional(),
    fillStyleId: z.string().optional(),
    strokes: StrokeStyleSchema.array().optional(),
    strokeStyleId: z.string().optional(),
    strokeWeight: z.number().optional(),
    strokeAlign: z.enum(['INSIDE', 'OUTSIDE', 'CENTER']).optional(),
    cornerRadius: z.number().optional(),
    topLeftRadius: z.number().optional(),
    topRightRadius: z.number().optional(),
    bottomLeftRadius: z.number().optional(),
    bottomRightRadius: z.number().optional(),
    effects: EffectStyleSchema.array().optional(),
    opacity: z.number().optional(),

    characters: z.string().optional(),
    fontSize: z.number().optional(),
    fontWeight: z.enum(['Regular', 'Medium', 'Bold', 'Light', 'SemiBold', 'ExtraBold']).optional(),
    fontFamily: z.string().optional(),
    textColor: z.string().optional(),
    textStyleId: z.string().optional(),
    textAlign: z.enum(['LEFT', 'CENTER', 'RIGHT', 'JUSTIFIED']).optional(),
    lineHeight: z.union([z.number(), z.literal('AUTO')]).optional(),
    letterSpacing: z.number().optional(),
    textDecoration: z.enum(['NONE', 'UNDERLINE', 'STRIKETHROUGH']).optional(),

    src: z.string().optional(),

    icon: z.string().optional(),
    size: z.number().optional(),
    color: z.string().optional(),

    background: z.string().optional(),

    chartType: z.enum(['PIE', 'DONUT', 'BAR', 'LINE']).optional(),
    chartData: ChartDataPointSchema.array().optional(),
    showLabels: z.boolean().optional(),
    showLegend: z.boolean().optional(),
    donutHoleSize: z.number().optional(),

    sitemapData: SitemapNodeSchema.optional(),
    nodeWidth: z.number().optional(),
    levelSpacing: z.number().optional(),
    siblingSpacing: z.number().optional(),

    children: z.array(NodeDataSchema).optional(),

    variant: z.enum(['primary', 'secondary', 'outline', 'ghost', 'danger']).optional(),
    disabled: z.boolean().optional(),
    iconPosition: z.enum(['left', 'right']).optional(),
    loading: z.boolean().optional(),
    fullWidth: z.boolean().optional(),

    placeholder: z.string().optional(),
    inputType: z.enum(['text', 'email', 'password', 'number', 'search', 'tel', 'url']).optional(),
    prefix: z.string().optional(),
    suffix: z.string().optional(),
    multiline: z.boolean().optional(),

    fallback: z.string().optional(),
    avatarShape: z.enum(['circle', 'square', 'rounded']).optional(),

    badgeLabel: z.string().optional(),
    badgeVariant: z.enum(['default', 'success', 'warning', 'error', 'info']).optional(),

    dividerOrientation: z.enum(['horizontal', 'vertical']).optional(),
    dividerThickness: z.number().optional(),

    progressValue: z.number().optional(),
    progressVariant: z.enum(['linear', 'circular']).optional(),
    progressColor: z.string().optional(),

    spacerSize: z.number().optional(),
}));

export const PluginInputSchema: z.ZodType<PluginInput> = z.object({
    styles: StyleDefinitionSchema.optional(),
    components: z.record(NodeDataSchema).optional(),
    root: NodeDataSchema,
});

export function validateNodeData(data: unknown): { success: boolean; data?: NodeData; error?: string } {
    const result = NodeDataSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return {
        success: false,
        error: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    };
}

export function validatePluginInput(data: unknown): { success: boolean; data?: PluginInput; error?: string } {
    const result = PluginInputSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return {
        success: false,
        error: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    };
}
