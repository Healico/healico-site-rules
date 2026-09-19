---
name: healico-rule-author
description: Write and validate self-contained Healico generic site rules. Use when creating, reviewing, or explaining Healico site rule JSON, selectors, URL templates, chapter APIs, gallery pagination, or offline rule fixtures.
---

# Healico Rule Author

Use this skill to author Healico “generic site configuration” JSON safely and reproducibly.

## Required workflow

1. Locate the target repository’s current documentation:
   - `docs/通用站点配置.md`
   - `entry/src/main/ets/engine/model/Rules.ets`
   - `entry/src/main/ets/engine/model/RuleValidation.ets`
2. Start from the smallest valid list rule, then add search, detail, chapters, and gallery only after the previous stage works.
3. Use the current generic schema. Do not invent compatibility fields.
4. Validate every rule before presenting it:
   ```sh
   node scripts/lint-rules.cjs path/to/rule-directory
   ```
5. When a runnable fixture is useful, start the repository’s local test server:
   ```sh
   node scripts/serve-blog.cjs
   ```
   Then import or inspect `site/rule-demo.json`.

## Content boundaries

- Use only content the operator is authorized to access.
- Do not include cookies, tokens, passwords, API keys, signing secrets, private headers, or account-specific values.
- Do not provide instructions to bypass authentication, paywalls, rate limits, CAPTCHA, DRM, or copyright controls.
- Do not use real external site examples in public teaching material. Use `127.0.0.1` for an executable local fixture or a reserved `.test` domain for an inert illustration.
- Keep public rule examples self-contained and free of analytics, external scripts, and tracking URLs.

## Rule-writing essentials

- A site needs `name`, `domain`, `indexUrl`, and `indexRule`.
- A list rule needs `item`, `idCode`, and normally `title`.
- JSONPath selectors operate relative to the current object:
  - `item` is evaluated from the response root.
  - entry fields such as `idCode` and `title` are evaluated from each item.
  - `nextPageUrl` is evaluated from the response root.
- Supported JSONPath is intentionally small: `$`, `$.field`, `$['field']`, and numeric indexes. Arrays selected by `item` are iterated automatically.
- CSS rules can use `selector`, `function`, and `param`. Prefer `text` for visible text and `attr` with an explicit attribute for links or images.
- URL placeholders include `{page:1}`, `{keyword:}`, `{idCode:}`, `{cidCode:}`, and `{domain:}`.
- Stage headers are `indexHTTPHeaders`, `searchHTTPHeaders`, `detailHTTPHeaders`, and `galleryHTTPHeaders`; image and media headers use `imageHTTPHeaders` and `videoHTTPHeaders`.

## Chapter and gallery rules

- For an independent chapter API, put `chaptersApi` in `detailRule`.
- Put response-level fields in `chaptersApiRule`; put chapter entry fields in `chaptersApiRule.chapterRule`.
- `chapterRule.item` and `chapterRule.idCode` are required.
- Stop pagination by returning an empty value or `null` for `nextPageUrl`.
- Set `maxPages` to a small realistic bound during development.
- Gallery rules normally need `item`, `image`, and `nextPageUrl`.

## Review checklist

Before finalizing, verify:

- JSON parses and contains no comments or trailing commas.
- `node scripts/lint-rules.cjs` passes.
- The list returns unique, non-empty `idCode` values.
- Detail and gallery URL templates expand correctly.
- Pagination terminates and does not revisit an earlier URL.
- Relative URLs resolve as intended.
- No credential-like field or header is present.
- The example works with local or reserved-domain data only.
