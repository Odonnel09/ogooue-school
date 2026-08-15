---
trigger: always_on
---

<!-- BEGIN:ogooue-design-system -->

# Ogooué School - Design System & UI Rules

All frontend components MUST strictly adhere to the following design system extracted from the main dashboard. DO NOT invent new UI patterns.

## 1. Cards and Containers
- **Main Cards (Sections)**: `bg-white rounded-2xl p-6 shadow-sm border border-slate-100`
- **Inner/Secondary Cards**: `bg-slate-50 rounded-xl p-5 border border-slate-100`
- **Flex Layouts**: Use `flex justify-between items-center` for headers. Use `gap-6` or `gap-8` for spacing between cards.

## 2. Typography & Colors
- **Main Headings (H1/H2)**: `text-2xl font-bold text-slate-900` or `text-lg font-bold text-slate-900`
- **Values / Big Stats**: `text-3xl font-bold text-slate-900` or `text-4xl`
- **Subtitles / Labels**: `text-sm font-medium text-slate-500`
- **Muted text**: `text-xs text-slate-500`
- **Brand Accents**: Use `text-brand-600` for primary links/buttons. Use `bg-brand-50` for active states or soft backgrounds.

## 3. Interactive Elements & Animations
- **Transitions**: All interactive elements (buttons, links, inputs) MUST have `transition-colors` or `transition-all duration-200` (or `duration-300` pour les inputs).
- **Hover States**: Links/Buttons should use `hover:text-slate-900`, `hover:bg-slate-50`, or `hover:text-brand-600`.
- **Primary Buttons**: `w-full bg-brand-600 hover:bg-brand-700 text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors`
- **Secondary Buttons**: `bg-slate-900 hover:bg-slate-800 text-white rounded-lg py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-colors`

## 4. Forms & Inputs
- **Inputs**: `block w-full py-3 px-4 bg-slate-50 border-transparent rounded-2xl text-sm placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 transition-all duration-300 outline-none`

## 5. Icons & Data Visualization
- **Icons**: Always use `lucide-react`. Sizes are typically `size={20}` or `size={24}`. Wrap icons in a soft background for emphasis: `w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center text-brand-500`.
- **Tables**: Use `w-full text-sm text-left`. Headers: `text-xs text-slate-500 uppercase bg-slate-50`. Rows: `border-b last:border-0 border-slate-100`.

## 6. Responsiveness
- Always build mobile-first. Use `grid-cols-1` by default, then `md:grid-cols-2` or `lg:grid-cols-3` for larger screens.
- Hide non-essential UI elements on mobile using `hidden md:block` (like we did for the user name in the Header).
- Ensure spacing is consistent (e.g., `p-6` for cards, `p-8` for page layouts).

<!-- END:ogooue-design-system -->
