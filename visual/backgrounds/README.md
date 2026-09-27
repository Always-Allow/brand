# Wash backgrounds

[Back to the brand library](../../README.md)

Choose the image matching your canvas size and place it behind the graphic. These are background-only PNGs. Keep their proportions; stretching one shape into another changes the wash.

| Background | Size | Download | Status |
|---|---|---|---|
| Draft Landscape 1920x1080 | 1920 × 1080 | [PNG](2026.09.18_AlwaysAllow_WashBackground_Draft_Landscape_1920x1080.png) | Draft, awaiting Sarah’s approval |
| Draft Portrait 1080x1350 | 1080 × 1350 | [PNG](2026.09.18_AlwaysAllow_WashBackground_Draft_Portrait_1080x1350.png) | Draft, awaiting Sarah’s approval |
| Draft Square 1080x1080 | 1080 × 1080 | [PNG](2026.09.18_AlwaysAllow_WashBackground_Draft_Square_1080x1080.png) | Draft, awaiting Sarah’s approval |
| Draft Story 1080x1920 | 1080 × 1920 | [PNG](2026.09.18_AlwaysAllow_WashBackground_Draft_Story_1080x1920.png) | Draft, awaiting Sarah’s approval |
| Locked LinkPreview 1200x630 | 1200 × 630 | [PNG](2026.09.18_AlwaysAllow_WashBackground_Locked_LinkPreview_1200x630.png) | Locked in the September 18 source package |
| Locked LinkedInCompanyCover 4200x700 | 4200 × 700 | [PNG](2026.09.18_AlwaysAllow_WashBackground_Locked_LinkedInCompanyCover_4200x700.png) | Locked in the September 18 source package |
| Locked LinkedInPersonalBanner 1584x396 | 1584 × 396 | [PNG](2026.09.18_AlwaysAllow_WashBackground_Locked_LinkedInPersonalBanner_1584x396.png) | Locked in the September 18 source package |
| Locked WideCover 1500x500 | 1500 × 500 | [PNG](2026.09.18_AlwaysAllow_WashBackground_Locked_WideCover_1500x500.png) | Locked in the September 18 source package |

All eight images were viewed and their dimensions read on September 27. They are byte-identical copies from the September 18 social kit. The four Draft files remain drafts; this filing does not approve them. The Locked label is inherited from the recorded source package, not a new pixel comparison with live platform images.

## Source and rebuild recipe

The recipe uses the canvas colour `#FEFDFB` with two soft Petrol (`#1D5372`) pools, one beyond the top-right corner and one beyond the bottom-left. The preserved [builder](build/render-wash.py) records the exact CSS and scales its positions by canvas width. It is unchanged archival source; it was inspected but not executed in this pass.

[Archive audit](../../docs/2026.09.27_SocialKitAudit.md) records the exact package and hashes. The original package remains in the content repository. Its older deck and Canva instructions are historical; [the deck source guide](../../templates/decks/README.md) describes the current workflow.
