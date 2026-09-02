// The generic Find/Update tools return and demand whole page documents — 75 KB for
// one main page, and every edition adds another. These four tools keep the cost of
// an edit flat, so the server says so up front rather than hoping the client guesses.
export const MCP_SERVER_INSTRUCTIONS = `Conference sites for GitNation. The content chain is brand -> conference (brand + eventYear) -> page (key) -> sections (ordered blocks).

Page keys repeat across conferences, so a page is only addressable as brand + eventYear + key.

To read or change site content, use these tools in order:
1. listConferences - every brand, year and page key.
2. getPageOutline - the numbered blocks of one page.
3. getSection - one block, rich text already serialized to html.
4. updateSection - patch one block; the server merges it into the page.

Do not call "Find pages" or "Update pages" for section content. Find returns whole documents including the raw Lexical trees, and Update expects the entire sections array back, which overwrites blocks you did not intend to touch.`;
