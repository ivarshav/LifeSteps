# Source attribution guide

`content/source-providers.json` is the only registry for trusted educational and
informational providers. It is content metadata, not a content feed and not an integration
point for retrieval.

## Provider classes

| Class | Use |
|---|---|
| `official-primary` | The original public authority or service owner. Use it to support factual claims about procedures, rights, or requirements. |
| `reviewed-supplementary` | A reviewed additional perspective. It can add context, but does not replace the primary source for facts the primary source can establish. |

## Adding or approving a provider

1. Add a provider record with a permanent kebab-case `id`, HTTPS `sourceUrl`, and a concise
   `attributionNote` explaining the source to readers.
2. Start external candidates as `"approvalStatus": "proposed"` and
   `"reviewStatus": "pending"`.
3. Before a provider can appear in a step or task link, an editor verifies the source and
   changes both values to `"approved"` and `"reviewed"`.
4. Add `"providerId": "<id>"` to the attributed `sources` or task `links` record, retaining
   the exact page URL and a useful Hebrew label.

The validator rejects an unknown, proposed, retired, or unreviewed provider reference.

## Editorial boundary

Provider material never becomes LifeSteps advice by itself. Do not scrape, automatically
retrieve, copy, or mechanically summarize it. An editor must check the source, write
original LifeSteps guidance, and approve the attribution. Keep
`"editorialReviewRequired": true` and
`"contentUsage": "editorial-review-required"` on every provider record.

`midrag` is intentionally listed as a proposed reviewed-supplementary provider. It is not
eligible for a step link or for publication until the approval and editorial review above
are complete.
