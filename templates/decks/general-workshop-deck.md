# Workshop Deck V2 — Working Draft

Status: Sections 1-5 + terminal demo drafted. Under active revision.

## Session Structure
- 6:30 PM: Pizza and snacks, icebreakers happen naturally
- 7:15 PM: Workshop starts
- 8:30-8:45 PM: Content wraps
- 8:45-9:30 PM: Hands-on together

## Open Items To Workshop

### Slide 4 — Journey Timeline
- NOT cards. Line chart / progression timeline with months/seasons + year
- Screenshots of things built along the way
- Markers for when tech significantly changed (Opus 4.5, Cowork launch, etc.)
- Need to workshop the actual milestones + screenshots — do later

### Folder Structure
- Need deeper content on how to set up your local files
- Research: what's the best approach for beginners who'll eventually use GitHub?
- Sarah's "projects" folder confused people vs Claude "projects" concept
- Footnote tip: "Tell Claude to keep project folders organized, up to date, easy to navigate — so even you can understand how to reference .json and .py files"
- This needs its own research session

### Persona Feedback Rounds
- Better examples needed
- Structure: groups of users → subject matter experts → technical experts (tech last)
- Rounds go back to back, not one-off

### Workflow Progression Story
- Emphasize: break down friction points, automate one thing at a time
- Sarah's example: hours writing project overviews → GPT with voice memo → copy/paste to Notion was friction → Claude Projects with Notion integration → friction was on-the-fly delegation → Slack app
- "I didn't set out to build a project manager Slack app"
- This is the key story that makes workflows click for people

### Demo Approach
- Remove the Notion option (don't assume everyone has it)
- Need to decide: start broad and let them watch Claude figure it out, or give an overview of what'll happen first?
- Consider: overview of what will likely happen, where you can intervene, human-in-the-loop moments, rounds of feedback
- Watch usage — don't let people go bananas on API credits
- Options we brainstormed: scrape events, restaurants, apartments, job postings

### Hands-On Exercise
- Guided: everyone builds the same scraping thing together (Chat brainstorm → Code build)
- Needs to work without Cowork (security issues at work)
- Needs to work without Notion
- Personal but not private
- Free build session after

### CLI + MCP Definitions
- Need to define CLI somewhere (people don't know what it means)
- MCP needs a clearer explanation than just a glossary entry

### Setup Options
- Frame as: "You can either use Terminal + Claude.ai OR download the desktop app"
- Code + Chat, not just one

---

## Completed Slide Copy

[See below — all slide copy from the working session]

### Section 1: Welcome

#### Slide 1 — Title
Getting Started with Claude
building with AI
[date] · [time] · [location]
⌘↵ AlwaysAllow

#### Slide 2 — Who I am
Sarah Madden (Smadds)
Head of RevOps & Strategy at Fermát

Background:
- Early stage VC & operating for 10+ years
- GTM, RevOps, Chief of Staff
- Agentic transformation — building AI into how my team actually works

Personal:
- Flatbush, Brooklyn
- Tallulah, Golden Retriever
- New York Knicks

#### Slide 3 — Disclaimer
I'm not an engineer.
I've never written a line of code that wasn't vibes. Everything I'm about to show you, I built with Claude.
If something breaks during a live demo, that's part of the experience.

#### Slide 4 — Journey Timeline
[TO BE WORKSHOPPED — line chart format with tool logos, screenshots, tech change markers]

#### Slide 5 — Setup Checklist
- Laptop ready
- Claude desktop app downloaded (claude.ai/download) OR Terminal + claude.ai
- Claude Pro subscription (ideal, $20/month)
- Logged into your Claude account

### Section 2: Claude 101

#### Slide 6 — Tools + Buzzwords
Tools table: Claude.ai, Claude Desktop, Claude Code, Cowork
Buzzword glossary: API, MCP, CLI, VibeCoding, Vibe anything, LLM, Agent, Skills

#### Slide 7 — How the Folder Works
[NEEDS MORE DEPTH — research best practices for beginners, GitHub-readiness, naming]
Footnote: "Tip: tell Claude to keep project folders organized, up to date, easy to navigate — so even you can understand how to reference .json and .py files"

#### Slide 8 — Terminal Setup: Mac
[Screenshots of each step]

#### Slide 9 — Terminal Setup: PC
[Screenshots of each step]

### Section 3: Fluency Scale

#### Slide 10 — Where Are You?
4 levels: Prompted → Connected → Automated → Built
Work + personal examples at each level
"Start with the one where you already know what the output should look like."

### Section 4: Mindset

#### Slide 11 — Mindset Table
| How to think about it | What that looks like |
| Start with what was never possible before | Open Claude, describe the whole situation including the anxiety |
| Describe the problem, not the steps | "I need to convince my skeptical VP..." |
| When in doubt, open Claude first | A habit, not a tool |
| You're the director, Claude is the cast | "Is that the only way?" "Give me three approaches" |
| Own every word | Read it like your boss will |

#### Slide 12 — Practical Tips
- Voice memos
- Feedback in bulk
- Show it the finish line (quality bar + save to memory)
- Persona feedback rounds: users → SMEs → technical experts, back to back

#### Slide 13 — Thinking About Workflows
Story-based: Sarah's progression from GPT voice memo → Claude Projects → Slack app
"I didn't set out to build a project manager Slack app"
Break down friction points, automate one thing, find the next friction point

### Section 5: AI Has Amnesia

#### Slide 14 — Pyramid
Layer 1: Your profile
Layer 2: Projects
Layer 3: Skills
Layer 4: Connections (MCP)
Layer 5: Your system

#### Slide 15 — Reference Table
Detailed breakdown of each layer

#### Slide 16+ — Screenshots of each layer

### Terminal Demo (between guided + free build)

#### Demo Intro
"Let's build something right now."
Finder window visible behind terminal

#### Demo
[APPROACH TBD — broad prompt first? overview first? human-in-the-loop walkthrough?]
[Options: scrape events, restaurants, apartments, job postings]
[No Notion assumption]

#### Demo Debrief
1. Described what I wanted in plain English
2. Claude figured out how to do it
3. It wrote real files on my computer
4. Opened the result in my browser
