# ✨ AI-to-UI Figma Plugin

Transform AI-generated JSON into native Figma designs with Auto Layout, proper styling, and responsive properties.

![Plugin Preview](https://img.shields.io/badge/Figma-Plugin-purple?style=for-the-badge&logo=figma&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [Figma Desktop App](https://www.figma.com/downloads/)

### Installation

```bash
# Navigate to the plugin directory
cd ai-to-ui-figma-plugin

# Install dependencies
npm install

# Build the plugin
npm run build
```

### Loading in Figma

1. Open Figma Desktop
2. Go to **Plugins** → **Development** → **Import plugin from manifest...**
3. Select the `manifest.json` file from this directory
4. The plugin is now available under **Plugins** → **Development** → **AI-to-UI**

---

## 🎯 How It Works

### The Two-Part System

This project consists of two parts:

1. **The Plugin** (`/src`) - A Figma plugin that parses JSON and creates native Figma elements
2. **The Context Guide** (`MODEL_CONTEXT_GUIDE.md`) - Instructions for AI models to generate compatible JSON

### Workflow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Describe your  │────▶│   AI generates  │────▶│  Paste JSON in  │
│  UI to an AI    │     │   valid JSON    │     │  Figma plugin   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  Native Figma   │
                                                │  elements with  │
                                                │  Auto Layout!   │
                                                └─────────────────┘
```

---

## 📐 Supported Features

### Node Types

| Type | Description |
|------|-------------|
| `FRAME` | Container with Auto Layout support |
| `TEXT` | Text layer with full typography control |
| `IMAGE` | Rectangle with image fill (URLs or keywords) |
| `RECTANGLE` | Basic shape with styling |

### Auto Layout Properties

- `layoutMode`: "HORIZONTAL" or "VERTICAL"
- `primaryAxisAlignItems`: "MIN", "MAX", "CENTER", "SPACE_BETWEEN"
- `counterAxisAlignItems`: "MIN", "MAX", "CENTER"
- `itemSpacing`: Gap between children
- `padding`: `{ top, right, bottom, left }`

### Responsive Sizing

- `width: "fill"` → `layoutSizingHorizontal: "FILL"`
- `height: "hug"` → `layoutSizingVertical: "HUG"`
- Fixed pixel values also supported

### Styling

- Fills with hex colors (including alpha)
- Strokes with configurable weight
- Corner radius (uniform or per-corner)
- Drop shadows and inner shadows
- Opacity control

### Image Keywords

Instead of URLs, use these keywords for placeholder images:
- `avatar` - Portrait faces
- `hero` - Landscape/nature scenes
- `product` - Product photography
- `team` - Team/people photos
- `tech` - Technology themed
- `food` - Food photography
- `travel` - Travel/adventure scenes
- `abstract` - Abstract patterns

---

## 📝 Example JSON

```json
{
  "type": "FRAME",
  "name": "Card",
  "layoutMode": "VERTICAL",
  "padding": { "top": 24, "right": 24, "bottom": 24, "left": 24 },
  "itemSpacing": 16,
  "cornerRadius": 16,
  "fills": [{ "type": "SOLID", "color": "#FFFFFF" }],
  "effects": [{
    "type": "DROP_SHADOW",
    "color": "#00000015",
    "offset": { "x": 0, "y": 8 },
    "radius": 24,
    "visible": true
  }],
  "children": [
    {
      "type": "IMAGE",
      "name": "Hero Image",
      "src": "nature",
      "width": "fill",
      "height": 200,
      "cornerRadius": 12
    },
    {
      "type": "TEXT",
      "name": "Title",
      "characters": "Beautiful Landscape",
      "fontSize": 20,
      "fontWeight": "Bold",
      "textColor": "#1F2937"
    },
    {
      "type": "TEXT",
      "name": "Description",
      "characters": "Explore the wonders of nature.",
      "fontSize": 14,
      "textColor": "#6B7280"
    }
  ]
}
```

---

## 🤖 Using with AI Models

### Step 1: Load the Context

Copy the entire contents of `MODEL_CONTEXT_GUIDE.md` and paste it at the beginning of your conversation with any AI model (Claude, Gemini, ChatGPT, Cursor).

### Step 2: Request a Design

After pasting the context, make your request:

> "Design a modern pricing section with three tiers: Basic, Pro, and Enterprise. Include features lists and CTA buttons."

### Step 3: Copy & Paste

The AI will respond with valid JSON. Copy it and paste it directly into the plugin's text area.

### Step 4: Build

Click "Build Design" and watch your design appear in Figma!

---

## 🛠 Development

### Project Structure

```
ai-to-ui-figma-plugin/
├── manifest.json          # Figma plugin manifest
├── package.json           # npm configuration
├── tsconfig.json          # TypeScript configuration
├── MODEL_CONTEXT_GUIDE.md # AI model instructions
├── src/
│   ├── code.ts           # Main plugin logic
│   └── ui.html           # Plugin UI
└── dist/                 # Compiled output
    ├── code.js
    └── ui.html
```

### Commands

```bash
# Build once
npm run build

# Watch mode (auto-rebuild on changes)
npm run dev
```

### Editing

1. Make changes to `src/code.ts` or `src/ui.html`
2. Run `npm run build` or use watch mode
3. In Figma, right-click the plugin → **Run last plugin** to reload

---

## 🎨 Design Philosophy

The plugin enforces good Figma practices:

1. **Auto Layout First** - Every frame gets auto layout by default
2. **No Magic Numbers** - Use the 8px spacing grid
3. **Semantic Naming** - Name every layer descriptively
4. **Component Thinking** - Build from atoms to organisms

---

## 📄 License

MIT License - Feel free to use, modify, and distribute.

---

## 🤝 Contributing

Contributions welcome! Feel free to:
- Add new node types
- Improve the styling engine
- Enhance the AI context guide
- Add new example templates

---

Made with ❤️ for designers who love AI-powered workflows
