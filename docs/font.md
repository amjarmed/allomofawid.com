If your site is **multilingual** (e.g. has Arabic + Latin + maybe other scripts), here are best practices and strategies, plus how to implement in Next.js + TypeScript:

---

## 🧠 Best Practices for Fonts in a Multilingual UI

* **Choose fonts with good script coverage**: Use font families that support both Arabic and Latin (and any other target script), or two complementary fonts (one for Arabic, one for Latin) that match well visually in weight, x-height, contrast.

* **Fallback stack ordering**: Ensure your CSS `font-family` declares the script-specific font first when needed, then fallback to generic or cross-script fonts. This avoids weird glyph substitutions.

* **Language / locale-aware switching**: For components or sections rendered in Arabic vs English (or other languages), switch which font is used accordingly (e.g. via `<html lang="ar">` or a CSS class). Helps with directionality (RTL) and selecting glyph coverage.

* **Optimize load size**: Don’t load all weights/scripts if not used. Use subsets (Arabic, Latin) and only the required weights. Use variable fonts where possible. Reduce layout shift by using `font-display: swap`.

* **Self-host when possible**: This gives more control over loading, licensing, and performance (caching, CDN, etc).

* **Test typography in both directions & scripts**: Arabic has particular features (ligatures, joining, diacritics) that need testing in real content; Latin might have different behaviour at small sizes or with certain fonts.

---

## ⚙️ Implementation in Next.js + TypeScript

Using Next.js 14 / 15, you can leverage the `next/font` module to manage fonts.

Here’s a pattern for multilingual font setup:

1. **Define font loader(s)**

   In a shared file (e.g. `app/fonts.ts` or similar), import both an Arabic-support font and a Latin-preferred font using `next/font/google` or `next/font/local`:

   ```ts
   // app/fonts.ts
   import { Noto_Sans_Arabic, Inter } from 'next/font/google';

   export const notoArabic = Noto_Sans_Arabic({
     subsets: ['arabic', 'latin'],
     weight: ['400', '700'],
     display: 'swap',
     // optional variable option if using CSS variable
     variable: '--font-arabic',
   });

   export const interLatin = Inter({
     subsets: ['latin'],
     weight: ['400', '600', '700'],
     display: 'swap',
     variable: '--font-latin',
   });
   ```

2. **Apply based on locale / direction**

   In your root layout (or highest relevant layout), you can check the current locale or direction (`lang="ar"` vs `lang="en"`) and conditionally apply one of the font classNames / CSS variable.

   ```tsx
   // app/layout.tsx
   import { notoArabic, interLatin } from './fonts';

   export default function RootLayout({ children, params }: { children: React.ReactNode, params: { locale: string } }) {
     const isArabic = params.locale === 'ar';
     const fontClass = isArabic ? notoArabic.className : interLatin.className;
     const dir = isArabic ? 'rtl' : 'ltr';

     return (
       <html lang={params.locale} dir={dir} className={fontClass}>
         <body>{children}</body>
       </html>
     );
   }
   ```

3. **Tailwind / CSS config**

   Use CSS variables or Tailwind theme config so you can easily reference both font-families.

   In `tailwind.config.ts`:

   ```ts
   module.exports = {
     theme: {
       extend: {
         fontFamily: {
           latin: ['var(--font-latin)', 'sans-serif'],
           arabic: ['var(--font-arabic)', 'sans-serif'],
         }
       }
     }
   };
   ```

   Then in components, you can use `className="font-arabic"` when needed, or rely on the global font set by the `html` tag.

4. **Subsets & performance**

   * When importing via `next/font/google`, specify `subsets` properly. For example, Arabic subset will ensure the Arabic glyphs. ([Next.js][1])
   * Limit weights to only what you need.
   * Use `display: 'swap'` to avoid invisible text during load.
   * If you expect dynamic locale switching client-side, make sure both fonts are loaded or that you lazy-load the other only when necessary.

---

## 📚 Font Families Known Good for Multilingual

From research:

* **Noto** family (e.g. *Noto Sans Arabic + Noto Sans Latin*) — very high script support; designed for harmony across scripts. ([Wikipedia][2])
* **Google Fonts** multilingual offerings; many of the recommended multilingual lists include Noto, Tajawal, etc. ([MultiLocale][3])

---

If you like, I can build you 2 example font setups (Arabic + Latin) with variable fonts, optimized subsets, and include Next.js + Tailwind code ready to plug-in.

[1]: https://nextjs.org/docs/14/app/building-your-application/optimizing/fonts?utm_source=chatgpt.com "Optimizing: Fonts | Next.js"
[2]: https://en.wikipedia.org/wiki/Noto_fonts?utm_source=chatgpt.com "Noto fonts"
[3]: https://www.multilocale.com/blog/en/multilingual-fonts?utm_source=chatgpt.com "Top 13 Multilingual Fonts for Your Website"
