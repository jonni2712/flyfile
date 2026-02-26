# FlyFile - Project Guidelines

## Design Context

### Users
Privacy-conscious individuals and enterprise teams who need to transfer files securely. They arrive with a clear task — send or receive files — and expect the process to be instant, trustworthy, and require zero learning curve. Multi-language audience across Italy and Europe (IT, EN, DE, FR, ES).

### Brand Personality
**Bold, Modern, Premium** — FlyFile presents itself as a design-forward, high-end file transfer platform. It's not a utilitarian tool; it's a product that earns trust through visual polish and confident simplicity.

### Emotional Goals
Users should feel:
- **Confidence & Trust** — "My files are safe, this is reliable"
- **Speed & Delight** — "That was easy!" from fast, frictionless interactions
- **Professional Control** — "I'm in control of my data"
- **Calm & Effortless** — "It just works" with zero friction

### Aesthetic Direction
- **Visual tone**: Clean, consumer-friendly file sharing (WeTransfer / Dropbox lineage) elevated with premium polish
- **Theme**: Light mode primary with dark accents (footer, mobile menu). Blue-purple gradient identity
- **Anti-references**: Avoid cluttered enterprise dashboards, overly technical/developer-oriented interfaces, or generic Bootstrap aesthetics
- **Typography**: Inter — clean, modern, highly legible at all sizes
- **Color system**: Brand blue (#409cff / `brand-500`) primary, accent purple (#7c5cfc / `accent-500`), Tailwind blue-500 for gradients. Functional colors: green=success, red=danger, gray=neutral

### Design Principles
1. **Instant clarity** — Every screen should communicate its purpose within 1 second. No ambiguity, no hunting for the next step.
2. **Earned trust through craft** — Security isn't just a feature, it's communicated through polished UI, smooth transitions, and attention to detail. If it looks premium, it feels safe.
3. **Frictionless by default** — Remove every unnecessary step. The fastest path to "file sent" wins. Progressive disclosure over upfront complexity.
4. **Inclusive for everyone** — WCAG AA compliance, reduced motion support, color-blindness safe palettes, dyslexia-friendly text, 44px minimum touch targets. Design for the full spectrum of human ability.
5. **Consistent visual language** — Use the established component system (Button variants, Input patterns, card layouts, gradient accents). Every new element should feel like it belongs to the same family.

### Technical Design Tokens
- **Font**: Inter (--font-inter), weights 400-700
- **Brand colors** (defined in globals.css `@theme`):
  - `brand-500` (#409cff) — primary interactive blue
  - `brand-600` (#2d8ae8) — primary hover
  - `brand-700` (#1a75d2) — primary active
  - `accent-500` (#7c5cfc) — secondary purple
  - `accent-600` (#6a4be0) — secondary hover
  - `surface-subtle` (#f0edfa) — light purple background
  - Tailwind `blue-500` (#3b82f6) — gradients, meta theme
- **Radius**: rounded-xl (buttons), rounded-2xl (cards/modals)
- **Shadows**: shadow-sm (subtle), shadow-md (cards), shadow-lg (modals/panels)
- **Spacing**: Tailwind scale, sections py-16/20/24, content px-4 sm:px-6 lg:px-8
- **Transitions**: transition-colors (default), transition-all (interactive), 0.2s ease standard
- **Breakpoints**: sm:640 md:768 lg:1024 xl:1280
- **Icons**: Lucide React exclusively
- **IMPORTANT**: Never use arbitrary hex values `bg-[#...]` — always use design tokens or Tailwind palette classes
