# Wash backgrounds

[Back to the brand library](../../README.md)

Choose the image matching your canvas size and place it behind the graphic. These are background-only PNGs. Keep their proportions; stretching one shape into another changes the wash.

| Background | Size | Download | Status |
|---|---|---|---|
| Locked Landscape 1920x1080 | 1920 × 1080 | [PNG](2026.09.18_AlwaysAllow_WashBackground_Locked_Landscape_1920x1080.png) | Approved by Sarah, September 27, 2026 |
| Locked Portrait 1080x1350 | 1080 × 1350 | [PNG](2026.09.18_AlwaysAllow_WashBackground_Locked_Portrait_1080x1350.png) | Approved by Sarah, September 27, 2026 |
| Locked Square 1080x1080 | 1080 × 1080 | [PNG](2026.09.18_AlwaysAllow_WashBackground_Locked_Square_1080x1080.png) | Approved by Sarah, September 27, 2026 |
| Locked Story 1080x1920 | 1080 × 1920 | [PNG](2026.09.18_AlwaysAllow_WashBackground_Locked_Story_1080x1920.png) | Approved by Sarah, September 27, 2026 |
| Locked LinkPreview 1200x630 | 1200 × 630 | [PNG](2026.09.18_AlwaysAllow_WashBackground_Locked_LinkPreview_1200x630.png) | Locked in the September 18 source package |
| Locked LinkedInCompanyCover 4200x700 | 4200 × 700 | [PNG](2026.09.18_AlwaysAllow_WashBackground_Locked_LinkedInCompanyCover_4200x700.png) | Locked in the September 18 source package |
| Locked LinkedInPersonalBanner 1584x396 | 1584 × 396 | [PNG](2026.09.18_AlwaysAllow_WashBackground_Locked_LinkedInPersonalBanner_1584x396.png) | Locked in the September 18 source package |
| Locked WideCover 1500x500 | 1500 × 500 | [PNG](2026.09.18_AlwaysAllow_WashBackground_Locked_WideCover_1500x500.png) | Locked in the September 18 source package |

All eight images were viewed and their dimensions read on September 27. They are byte-identical copies from the September 18 social kit. Sarah approved the Landscape, Portrait, Square and Story backgrounds on September 27; their filenames now use Locked. The other four Locked labels come from the September 18 source package. [Approval and unchanged file identities](../../docs/2026.09.27_BackgroundApproval.md).

## Source and rebuild recipe

The recipe uses the canvas colour `#FEFDFB` with two soft Petrol (`#1D5372`) pools, one beyond the top-right corner and one beyond the bottom-left. The preserved [builder](build/render-wash.py) records the exact CSS and scales its positions by canvas width. It is unchanged archival source; it was inspected but not executed in this pass.

[Archive audit](../../docs/2026.09.27_SocialKitAudit.md) records the exact package and hashes. The original package remains in the content repository. Its older deck and Canva instructions are historical; [the deck source guide](../../templates/decks/README.md) describes the current workflow.

The archived builder retains the original September 18 Draft output names. The approval record maps those names to the current Locked filenames; this approval changes filenames and status only.
