import { PHOSPHOR_ICONS } from '../constants/icons';

export function hexToRgb(hex: string | { r: number; g: number; b: number }): { r: number; g: number; b: number } {
    if (typeof hex === 'object') {
        return hex;
    }

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        return { r: 0, g: 0, b: 0 };
    }
    return {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
    };
}

export function processFakePlaceholders(text: string): string {
    const placeholders: Record<string, string> = {
        '{{name}}': 'John Doe',
        '{{email}}': 'john@example.com',
        '{{phone}}': '+1 (555) 123-4567',
        '{{address}}': '123 Main Street',
        '{{company}}': 'Acme Corp',
        '{{title}}': 'Software Engineer',
        '{{date}}': 'January 15, 2024',
        '{{time}}': '10:30 AM',
        '{{price}}': '$99.99',
        '{{quantity}}': '5',
        '{{rating}}': '4.5',
        '{{percent}}': '75%',
        '{{country}}': 'United States',
        '{{city}}': 'San Francisco',
        '{{username}}': 'johndoe',
        '{{avatar}}': '👤',
        '{{status}}': 'Active',
        '{{role}}': 'Admin',
    };

    let result = text;
    for (const [key, value] of Object.entries(placeholders)) {
        result = result.replace(new RegExp(key, 'g'), value);
    }
    return result;
}

export function getPlaceholderImageUrl(keyword: string, width: number = 400, height: number = 300): string {
    const cleanKeyword = keyword.toLowerCase().replace(/[^a-z0-9]/g, '+');
    return `https://placehold.co/${width}x${height}/6366F1/FFFFFF?text=${encodeURIComponent(cleanKeyword)}`;
}

export function serializeFills(fills: readonly Paint[]): { type: 'SOLID'; color: string; opacity?: number }[] {
    const result: { type: 'SOLID'; color: string; opacity?: number }[] = [];

    for (const fill of fills) {
        if (fill.type === 'SOLID' && fill.color) {
            const r = Math.round(fill.color.r * 255);
            const g = Math.round(fill.color.g * 255);
            const b = Math.round(fill.color.b * 255);
            const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

            result.push({
                type: 'SOLID',
                color: hex,
                opacity: fill.opacity,
            });
        }
    }

    return result;
}

export function getIconPath(iconName: string): string | null {
    const normalized = iconName.toLowerCase().replace(/[_\-\s]/g, '-');
    return PHOSPHOR_ICONS[normalized] || null;
}

export function createColorPalette(): Record<string, string> {
    return {
        background: '#0F172A',
        surface: '#1E293B',
        primary: '#6366F1',
        secondary: '#8B5CF6',
        accent: '#EC4899',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        text: '#F8FAFC',
        textMuted: '#94A3B8',
        border: '#334155',
    };
}

export function createTypographyScale(): Record<string, { fontFamily: string; fontSize: number; fontWeight: string }> {
    return {
        h1: { fontFamily: 'Inter', fontSize: 32, fontWeight: 'Bold' },
        h2: { fontFamily: 'Inter', fontSize: 24, fontWeight: 'Bold' },
        h3: { fontFamily: 'Inter', fontSize: 20, fontWeight: 'SemiBold' },
        body: { fontFamily: 'Inter', fontSize: 16, fontWeight: 'Regular' },
        small: { fontFamily: 'Inter', fontSize: 14, fontWeight: 'Regular' },
        caption: { fontFamily: 'Inter', fontSize: 12, fontWeight: 'Regular' },
    };
}
