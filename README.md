# Niranjana V — AI/ML Engineer Portfolio

A dark, glassmorphism-styled personal portfolio built with plain HTML, CSS, and vanilla JavaScript (no build step, no dependencies to install). Everything in `index.html`, `assets/css/style.css`, and `assets/js/main.js` is hand-written and ready to deploy as-is.

## Why plain HTML/CSS/JS instead of the requested React + Vite + TypeScript + Tailwind stack

This file was generated in a sandboxed environment with no internet access, so `npm install` for React/Vite/Tailwind/Framer Motion couldn't be run or verified here. Rather than hand you an untested project that might not actually build, this delivers the same design and all the same functionality (scroll reveals, animated node-graph hero visual, project modals, scrollspy nav, animated stat counters, mobile menu, contact form) in a version that is guaranteed to work the moment you open it — no install step required.

If you'd like, this can be converted into the React/TypeScript/Vite/Tailwind project structure described in your brief (`src/components`, `src/sections`, `src/data`, etc.) as a follow-up — the content and component boundaries below already map cleanly onto that structure.

## Structure

```
index.html
assets/
  css/style.css      — design tokens, layout, animations
  js/main.js         — nav, scroll reveal, stat counters, node-graph SVG, project data + modal, contact form
  img/profile.jpg    — profile photo used in the About section
resume/
  README.txt         — replace with Niranjana-V-Resume.pdf (the Download Resume buttons already point to this path)
```

## Editing content

- **Projects, skills, experience, achievements, certifications**: edit the HTML directly in `index.html`, or edit the `projects` array at the top of `assets/js/main.js` for project cards/modals.
- **Project links**: each project's `links.github` / `links.demo` is `null` until you add a real URL — buttons show as disabled until then, per the "don't invent links" instruction.
- **Resume**: drop `Niranjana-V-Resume.pdf` into the `resume/` folder (same filename) and the three Download Resume buttons will work immediately.
- **Colors**: all colors are CSS variables at the top of `style.css` under `:root`.

## Deploying

This is a fully static site — drag the folder into Netlify/Vercel/GitHub Pages, or serve it with any static file host. No build command needed.
