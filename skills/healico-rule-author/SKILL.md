---
name: healico-rule-author
description: Author, review, and validate self-contained Healico generic site rules. Use when creating or explaining Healico site-rule JSON, selectors, URL templates, chapter APIs, gallery pagination, request profiles, response steps, browser modes, or offline rule fixtures.
---

# Healico Rule Author

Use this skill to write correct, safe, testable Healico “generic site configuration” JSON. The goal is to teach the rule format and verify behavior with local or reserved-domain fixtures.

## Non-negotiable boundaries

- Use only content the operator is authorized to access.
- Do not include cookies, tokens, passwords, API keys, signing secrets, account identifiers, device identifiers, or private headers.
- Do not provide or optimize instructions to bypass authentication, CAPTCHA, paywalls, rate limits, DRM, copyright controls, or other access controls.
- Do not mention, name, link to, or imitate any real third-party site in examples.
- Use `127.0.0.1` for an executable local fixture, a private LAN address for a device fixture, or a reserved `*.test` domain for an inert illustration.
- Do not include analytics, trackers, external scripts, or external teaching links.
- Prefer the smallest correct rule. Do not add protocol capabilities until the previous stage is verified.

## Source of truth

If working inside a Healico application repository, read these files before writing or reviewing a rule:

1. `docs/通用站点配置.md`
2. `entry/src/main/ets/engine/model/Rules.ets`
3. `entry/src/main/ets/engine/model/RuleValidation.ets`
4. `entry/src/main/ets/engine/model/Capabilities.ets`
5. `entry/src/main/ets/engine/selector/SelectorEvaluator.ets`
6. `entry/src/main/ets/engine/url/UrlTemplate.ets`
7. `entry/src/main/ets/engine/net/ValuePipeline.ets`

If those files are unavailable, use this skill’s field reference and clearly state that the target application version must be rechecked before import.

## Authoring workflow

1. **Confirm authorization and scope**
   - Ask what content the user is authorized to access when the destination is not a local fixture.
   - Prefer a local or reserved-domain fixture for teaching.

2. **Inspect one real response shape**
   - Identify whether the response is JSON or HTML.
   - Record the exact list-array path, item ID, title, cover, URL, and next-page path.
   - Do not guess selectors from memory.

3. **Write the minimal list rule first**
   ```json
   {
     "name": "本地示例",
     "domain": "127.0.0.1:8787",
     "indexUrl": "http://127.0.0.1:8787/api/books?page={page:1}",
     "indexRule": {
       "item": { "selector": "$.payload.books" },
       "idCode": { "selector": "$.key" },
       "title": { "selector": "$.label" },
       "cover": { "selector": "$.cover" },
       "nextPageUrl": { "selector": "$.links.next" }
     }
   }
   ```

4. **Validate JSON syntax**
   ```sh
   node -e "JSON.parse(require('fs').readFileSync('rule.json','utf8')); console.log('JSON OK')"
   ```

5. **Validate with the application validator when available**
   ```sh
   node scripts/lint-rules.cjs path/to/rule-directory
   ```

6. **Run the local fixture when available**
   ```sh
   node scripts/serve-blog.cjs
   node scripts/test-rule-blog.cjs
   ```

7. **Expand one stage at a time**
   - Add detail only after the list works.
   - Add chapters only after detail works.
   - Add gallery only after chapter IDs are correct.
   - Add search last.
   - Add protocol or browser capabilities only after the plain pipeline works.

## Top-level site fields

### Required for a minimal rule

- `name`: display name.
- `domain`: host, such as `127.0.0.1:8787` or `reader.example.test`.
- `indexUrl`: first list URL.
- `indexRule`: list parser.

### Entry URLs

- `indexUrl`: list.
- `searchUrl`: search.
- `detailUrl`: detail.
- `galleryUrl`: chapter images or media.
- `webUrl`: human-readable page when the detail entry is an API.
- `seriesUrl`: series.
- `tagUrl`: tags.
- `loginUrl`: login page entry only; never credentials.

### Parsers

- `indexRule`
- `searchRule`
- `detailRule`
- `galleryRule`
- `seriesRule`
- `tagSearchRule`
- `extraRule`
- `pages[].listRule`
- `pages[].detailRule`
- `pages[].galleryRule`

### Headers

- `httpHeaders`: common headers.
- `indexHTTPHeaders`
- `searchHTTPHeaders`
- `detailHTTPHeaders`
- `galleryHTTPHeaders`
- `imageHTTPHeaders`
- `videoHTTPHeaders`

Stage headers override common headers with the same name. Only use public negotiation headers in shareable rules.

### Network and display options

- `requestProfile`
- `imageTransport`
- `imageHeaderMode`: `merge` or `replace`
- `imageHostPatterns`
- `mirrors`
- `credentialOrigins`
- `displayMode`
- `chapterOrder`
- `galleryDirection`
- `imagePairingMode`
- `flags`
- `version`
- `author`
- `authorWebsite`
- `icon`
- `throttleBudget`
- `pages`

## Selector reference

A selector object supports:

- `selector`: JSONPath, CSS selector, or `this`.
- `function`: `text`, `attr`, or `html`.
- `param`: attribute name or fallback chain.
- `regex`: extraction regex.
- `replacement`: output template using `$1` through `$9`.

### JSONPath subset

Supported:

- `$`
- `$.field`
- `$['field']`
- `$.items[0].name`

Not supported:

- wildcards
- filters
- recursive descent

When `item.selector` points to an array, the engine iterates it automatically.

### CSS behavior

- Multiple selectors may be separated by commas; the first match wins.
- `this` means the current item.
- `function: "attr"` requires `param`.
- `param: "data-src, src"` tries `data-src`, then `src`.
- `function: "text, attr"` tries text, then attribute extraction.
- `function: "attr.decodeBase64"` extracts an attribute and decodes Base64.
- `function: "text.reversed"` extracts text and reverses it.

### Context levels

- `item`, `nextPageUrl`, `totalPages`, and other response-level fields are evaluated from the response root.
- `idCode`, `title`, `cover`, `url`, `image`, and other item fields are evaluated from each item.

This distinction is the most common source of empty results.

## URL templates

Supported placeholders:

- `{page:}` or `{page:1}`: page starting at 1.
- `{page:N}`: page starting at N.
- `{page:N:S}`: page starting at N and stepping by S.
- `{keyword:}`: URL-encoded search keyword.
- `{idCode:}`: post ID.
- `{cidCode:}`: chapter ID.
- `{domain:}`: site host.
- `{source:}`: current successful request URL.
- `{pageFormat:...}`: wrapper whose inner placeholders expand first.

Relative URL resolution:

- list/search/detail/gallery entry URLs resolve against the site domain.
- independent chapter API URLs resolve against the detail URL.
- `nextPageUrl` resolves against the current successful request URL.

## Detail, chapters, and gallery

### Detail fields

Common fields include:

- `title`
- `desc`
- `cover`
- `author`
- `uploader`
- `category`
- `datetime`
- `published`
- `rating`
- `tags`
- `pictures`
- `photoAlbumLink`
- `secondLevelPageUrl`

### Chapters from the detail page

```json
"chapterRule": {
  "item": { "selector": "$.payload.chapters" },
  "idCode": { "selector": "$.key" },
  "title": { "selector": "$.label" },
  "url": { "selector": "$.href" }
}
```

`chapterRule.item` and `chapterRule.idCode` are required. Empty IDs are invalid. Duplicate IDs are deduplicated by first occurrence.

### Independent chapter API

```json
"chaptersApi": "/api/books/{idCode:}/chapters",
"chaptersApiRule": {
  "maxPages": 20,
  "chapterRule": {
    "item": { "selector": "$.payload.entries" },
    "idCode": { "selector": "$.key" },
    "title": { "selector": "$.label" },
    "url": { "selector": "$.href" }
  },
  "nextPageUrl": { "selector": "$.links.next" }
}
```

Chapter entry fields belong inside `chaptersApiRule.chapterRule`, not directly inside `chaptersApiRule`.

If `url` is omitted, `galleryUrl` is generated from `cidCode`.

### Gallery fields

- `item`: picture array or nodes.
- `image`: original image URL.
- `link`: viewer page URL.
- `nextPageUrl`: next gallery page.
- `totalImages`: expected total.
- `requestUrl`: canonical request URL.
- `requestUrlPattern`: regex limiting when rewriting is allowed.

A string-array response can use:

```json
{
  "item": { "selector": "$" },
  "image": { "selector": "this" }
}
```

### Gallery processing

- `processing.orderPath`: order array; its length must equal the image count.
- `processing.urlPattern`: URL rewrite regex.
- `processing.urlReplacement`: URL rewrite template.
- `processing.strips`: explicit image-strip restoration configuration.

Do not silently emit reordered or partial images. Fail when counts or slots do not match.

## Request profile

`requestProfile` is the generic protocol pipeline.

### Main fields

- `publicParameters`
- `transport`
- `baseUrl`
- `forceBase`
- `domains`
- `headers`
- `steps`
- `responseSteps`
- `state`
- `initializeUrl`
- `initializeHeaders`
- `credentialOrigins`
- `retry`
- `auxiliaryToken`
- `queryDefaults`
- `successCodePath`
- `successCode`
- `cacheTtlMs`
- `galleryCacheTtlMs`
- `cacheMaxEntries`
- `cacheIgnoreQuery`
- `serial`
- `account`
- `readFallback`

### Public parameter restrictions

`publicParameters` may contain at most 32 string values. Names must be identifiers and must not look like credentials or reserved runtime state. Do not use names containing token, cookie, authorization, password, secret, session, signature, device, and similar terms.

### ValueStep operations

- `template`: expand `{{name}}`.
- `hash`: digest; default MD5.
- `hmac`: HMAC; default SHA256.
- `base64`: UTF-8 to Base64.
- `slice`: substring with `start` and `end`.
- `regex`: capture or match.
- `replace`: global regex replacement.
- `json`: read a JSONPath from JSON input.
- `aes`: AES decrypt, CBC or ECB-compatible mode.
- `jsonBoundary`: extract and validate an embedded JSON object or array.
- `zipSort`: reorder characters by a key string.
- `random`: generate values using `d`, `D`, `A`, or `x`.
- `authorization`: build `scheme value`.

Every step needs a valid `out` variable name. Later steps can use earlier outputs. Steps are limited to 64 entries.

### Retry and recovery

`retry` must declare explicit `codes`, `codePath`, `maxAttempts`, and `recoveryUrl`. It must be bounded. Do not treat authentication failure, CAPTCHA, or access denial as an automatic recovery opportunity.

### Read fallback

`readFallback` requires a canonical HTTPS `origin`, a complete `pathPattern`, a `queryParameters` allowlist, and independent `headers`.

## Browser and media modes

Use these only when plain HTTP plus selectors cannot work.

### `webDom`

Required:

- `webDom: true`
- `pageReadyMarker.selector`

The engine waits for the CSS marker and then reads the DOM. It does not execute author-provided JavaScript.

### `renderMode: browserScript`

Fields:

- `xhrPath`
- `resultVar`
- `pageVars`
- `pageVarPrefix`
- `countVar`
- `browserPageStep`
- `browserRequest`
- `browserFallback`

This executes site-returned script and is high risk. Use only when explicitly necessary.

### `renderMode: contentEnvelope`

Fields:

- `keyVar`
- `cctVar`
- `defaultCct`
- `preferWebView`

`keyVar` and `cctVar` must be valid JavaScript identifiers.

### `renderMode: playerEnvelope`

Required:

- `playerUrlPrefix`
- `playerSteps`
- `videoRule`

`webPlayer: true` hands a resolved URL to the embedded web player.

## Validation and legacy fields

Reject these legacy fields:

- `decrypt`
- `apiAuth`
- `aesSalt`
- `chapterJsonPath`
- `chapterIdField`
- `chaptersApiViaWebView`
- `galleryWebView`
- `unsupportedLegacyAuth`
- `legacyKey`

Also reject prototype-bearing keys:

- `__proto__`
- `constructor`
- `prototype`

Structural checks:

- `chaptersApi` requires `chaptersApiRule.chapterRule.item.selector`.
- `chaptersApi` requires `chaptersApiRule.chapterRule.idCode.selector`.
- `webDom` requires `pageReadyMarker.selector`.
- `renderMode` must be one of `browserScript`, `contentEnvelope`, or `playerEnvelope`.
- normal `maxPages` is 1–200.
- browser-script `maxPages` is 1–1000.
- `browserPageStep` is 1–100.

## Review checklist

Before presenting a rule, verify:

1. JSON parses without comments or trailing commas.
2. No legacy or prototype-bearing fields are present.
3. No credential-like value or header is present.
4. No real third-party site is referenced.
5. `item`, `idCode`, and `title` are correct for the list stage.
6. Detail URL expands correctly from a real `idCode`.
7. Chapter IDs are nonempty and unique.
8. Gallery image URLs are correct.
9. First page, last page, and empty search behave correctly.
10. Pagination terminates and does not revisit a URL.
11. Relative URLs resolve as intended.
12. Any browser or protocol mode is explicitly justified.
13. The application validator passes when available.
14. Local fixture tests pass when available.
15. The user has authorization for the destination content.

## Output style

When helping another author:

- Start with the smallest working rule.
- Explain each added field.
- Show one stage at a time.
- Include expected observations.
- Include a validation command.
- Point out the exact difference between response-root selectors and item selectors.
- Do not present an unverified complex protocol rule as working.
