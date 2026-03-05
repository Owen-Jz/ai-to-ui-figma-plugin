export const DESIGN_TOKENS = {
    colors: {
        primary: '#6366F1',
        primaryHover: '#4F46E5',
        primaryPressed: '#4338CA',
        onPrimary: '#FFFFFF',

        secondary: '#8B5CF6',
        secondaryHover: '#7C3AED',
        onSecondary: '#FFFFFF',

        surface: '#FFFFFF',
        surfaceSubtle: '#F8FAFC',
        surfaceMuted: '#F1F5F9',
        onSurface: '#1E293B',
        onSurfaceMuted: '#64748B',

        background: '#FFFFFF',
        onBackground: '#0F172A',

        border: '#E2E8F0',
        borderSubtle: '#F1F5F9',

        success: '#10B981',
        successBg: '#D1FAE5',
        onSuccess: '#065F46',
        warning: '#F59E0B',
        warningBg: '#FEF3C7',
        onWarning: '#92400E',
        error: '#EF4444',
        errorBg: '#FEE2E2',
        onError: '#991B1B',
        info: '#3B82F6',
        infoBg: '#DBEAFE',
        onInfo: '#1E40AF',

        text: '#111827',
        textSecondary: '#6B7280',
        textTertiary: '#9CA3AF',
        textInverse: '#FFFFFF',
    },

    typography: {
        display: { fontSize: 36, fontWeight: 'Bold' as const, lineHeight: 1.2 },
        h1: { fontSize: 32, fontWeight: 'Bold' as const, lineHeight: 1.25 },
        h2: { fontSize: 28, fontWeight: 'SemiBold' as const, lineHeight: 1.3 },
        h3: { fontSize: 24, fontWeight: 'SemiBold' as const, lineHeight: 1.35 },
        h4: { fontSize: 20, fontWeight: 'SemiBold' as const, lineHeight: 1.4 },
        h5: { fontSize: 18, fontWeight: 'Medium' as const, lineHeight: 1.45 },
        h6: { fontSize: 16, fontWeight: 'Medium' as const, lineHeight: 1.5 },
        body: { fontSize: 16, fontWeight: 'Regular' as const, lineHeight: 1.5 },
        bodySmall: { fontSize: 14, fontWeight: 'Regular' as const, lineHeight: 1.5 },
        caption: { fontSize: 12, fontWeight: 'Regular' as const, lineHeight: 1.4 },
        overline: { fontSize: 11, fontWeight: 'SemiBold' as const, lineHeight: 1.5, letterSpacing: 0.5 },
    },

    spacing: {
        0: 0,
        1: 4,
        2: 8,
        3: 12,
        4: 16,
        5: 20,
        6: 24,
        7: 28,
        8: 32,
        9: 36,
        10: 40,
        11: 44,
        12: 48,
        14: 56,
        16: 64,
        20: 80,
        24: 96,
    },

    radius: {
        none: 0,
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        '2xl': 20,
        '3xl': 24,
        full: 9999,
    },

    shadows: {
        sm: {
            type: 'DROP_SHADOW' as const,
            color: '#00000015',
            offset: { x: 0, y: 1 },
            radius: 2,
        },
        md: {
            type: 'DROP_SHADOW' as const,
            color: '#0000001A',
            offset: { x: 0, y: 2 },
            radius: 4,
        },
        lg: {
            type: 'DROP_SHADOW' as const,
            color: '#0000001A',
            offset: { x: 0, y: 4 },
            radius: 6,
        },
        xl: {
            type: 'DROP_SHADOW' as const,
            color: '#0000001F',
            offset: { x: 0, y: 8 },
            radius: 16,
        },
    },

    borderWidth: {
        none: 0,
        thin: 1,
        medium: 2,
        thick: 3,
    },
};

export const LAYOUT_TOKENS = {
    minTouchTarget: 44,
    iconSize: {
        xs: 12,
        sm: 16,
        md: 20,
        lg: 24,
        xl: 32,
    },
    button: {
        height: {
            sm: 32,
            md: 40,
            lg: 48,
        },
        padding: {
            sm: { left: 12, right: 12 },
            md: { left: 16, right: 16 },
            lg: { left: 24, right: 24 },
        },
    },
    input: {
        height: {
            sm: 32,
            md: 40,
            lg: 48,
        },
        padding: 12,
    },
    avatar: {
        size: {
            xs: 24,
            sm: 32,
            md: 40,
            lg: 56,
            xl: 80,
            '2xl': 120,
        },
    },
};
