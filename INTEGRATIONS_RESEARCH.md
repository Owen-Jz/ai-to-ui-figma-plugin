# AI-to-UI Plugin: Future Integrations Research

This document outlines potential integrations and enhancements to elevate the "AI-to-UI" Figma plugin. These recommendations are based on current industry trends in AI-driven design tools and aimed at improving workflow efficiency, output quality, and user experience.

## 1. Direct LLM Integration (OpenAI / Anthropic API)
**Current State:** Users must generate JSON externally (e.g., ChatGPT) and paste it into the plugin.
**Proposed Integration:** Integrate OpenAI's GPT-4o or Anthropic's Claude 3.5 Sonnet directly within the plugin.
**Benefits:**
- **Zero-Friction Workflow:** Users type a text prompt directly in the plugin (e.g., "Create a dark mode crypto dashboard") and get immediate results.
- **Context Awareness:** The plugin could send selected Figma layers as context (text representation) to the LLM to "iterate" on existing designs.
- **Structured Output Reliability:** By using "Function Calling" or "JSON Mode" features of these APIs, the plugin can ensure the generated data handles the plugin's schema perfectly every time.

## 2. Dynamic Image Service (Unsplash / Pexels API)
**Current State:** Uses `source.unsplash.com` with simple keywords. This service is often deprecated, slow, or returns irrelevant results without authentication.
**Proposed Integration:** Implement the official Unsplash or Pexels API.
**Benefits:**
- **Relevance:** Search for specific image types based on the context of the card/section (e.g., "corporate headshots" vs "casual avatars").
- **Quality Control:** Filter by orientation (landscape/portrait) and color tone to match the generated UI's palette.
- **Legal Compliance:** Properly attribute photographers (required by Unsplash API) and ensure stable image links.

## 3. Figma Native Variables & Styles Integration
**Current State:** The plugin uses hardcoded HEX values and font names.
**Proposed Integration:** Read the user's local variables (Color, Number) and Text/Color Styles.
**Benefits:**
- **Brand Consistency:** The AI can map "Primary Color" to the user's specific `var(--primary)` instead of a generic blue.
- **Design System ready:** Generated UIs will immediately belong to the user's design system, reducing cleanup time.
- **Theming:** Easily switch generated UIs between light/dark modes if using Figma's native variable modes.

## 4. Real Data Population (Faker.js / RandomUser.me) ✅ IMPLEMENTED
**Current State:** ~~Generic text placeholders.~~ **Now supports dynamic fake data generation!**
**Implementation:** Built-in Faker-like functionality directly in the plugin.
**How to Use:** Add `{{placeholder}}` tokens in TEXT node `characters` field.

### Available Placeholders:
| Category | Placeholders |
|----------|-------------|
| Names | `{{name}}`, `{{firstname}}`, `{{lastname}}`, `{{username}}` |
| Contact | `{{email}}`, `{{phone}}`, `{{url}}`, `{{avatar}}` |
| Professional | `{{company}}`, `{{jobtitle}}`, `{{title}}` |
| Address | `{{address}}`, `{{city}}`, `{{country}}`, `{{zip}}` |
| Numbers | `{{number}}`, `{{price}}`, `{{percentage}}`, `{{rating}}` |
| Date/Time | `{{date}}`, `{{time}}`, `{{datetime}}` |
| Lorem Ipsum | `{{word}}`, `{{words}}`, `{{sentence}}`, `{{paragraph}}` |
| Other | `{{uuid}}`, `{{heading}}`, `{{short}}` |

**Example JSON:**
```json
{
  "type": "TEXT",
  "characters": "Hello, {{name}}! Your order total is {{price}}.",
  "fontSize": 16
}
```
**Renders as:** "Hello, Sarah Johnson! Your order total is $149.99."

## 5. Accessibility Check (Stark / Native Logic)
**Current State:** No accessibility checks.
**Proposed Integration:** Algorithm to check contrast ratios of generated colors.
**Benefits:**
- **Inclusive Design:** Automatically flag or auto-correct generated colors that don't meet WCAG AA standards.
- **Best Practices:** Ensure font sizes and touch targets meet minimum requirements before rendering.
