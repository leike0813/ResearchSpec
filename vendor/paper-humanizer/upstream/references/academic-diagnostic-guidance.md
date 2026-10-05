# Diagnostic Guidance for Review and Full Modes

This document provides additional diagnostic procedures and calibration guidance for **review mode** and **full mode** only. Reference mode must work from SKILL.md alone and should not load this file.

## Academic Genre Diagnostics

When the input is academic writing (research papers, theses, dissertations, literature reviews), apply these additional diagnostics alongside the 43 core patterns.

### 1. Question-First Diagnostic

**Target sections:** Introduction, Discussion, Analysis, Literature Review

**Procedure:**
- For each paragraph, ask: "What specific question does this paragraph answer?"
- A well-formed academic paragraph addresses a clear question: Why does this matter? What evidence supports X? How do these findings differ? What explains this phenomenon?

**Flag when:**
- The paragraph exists only to fill a template slot (Background, Context, Related Work) without clear argumentative function
- Material is included for categorical completeness ("we should mention Y because papers in this field always do") rather than to advance this paper's argument
- The paragraph could be removed without creating a gap in the paper's reasoning

**Do not flag:**
- Standard required sections: methods descriptions, IRB/ethics statements, funding disclosures, acknowledgments
- Survey/related-work sections that legitimately enumerate prior work
- Background paragraphs that establish necessary context for understanding the research question

**Example:**

> **Template-driven (flag):** "Wind energy has experienced rapid growth in recent years. Turbine technology continues to advance. Many countries have invested in wind infrastructure. This background provides context for our study."
>
> **Question-driven (keep):** "Early wind turbine designs assumed linear structural response under operational loads, but recent field measurements show nonlinear behavior above 15 m/s wind speeds (Smith 2020, Jones 2021). Whether this nonlinearity arises from material properties or geometric effects remains unclear, and resolving this determines which monitoring approach is appropriate."

### 2. Fact-Function Diagnostic

**Target sections:** Introduction, Results discussion, Literature Review

**Procedure:**
- For each cited result, method, or data point, check: "Does the text explain what this proves, solves, or clarifies for this paper's question?"
- Academic facts should connect to the argument: "X was measured → X shows Y → Y matters because Z"

**Flag when:**
- Methods or results are listed without explaining their contribution to the paper's findings
- Data appears because sources mention it, not because it advances the argument
- Technical details accumulate without showing what observation or interpretation problem they solve
- Generic significance tags ("这说明", "由此可见", "this demonstrates") substitute for actual analysis

**Do not flag:**
- Survey sections that legitimately enumerate findings across studies
- Methods sections where procedure descriptions don't need argumentative links
- Results sections presenting data before interpretation (interpretation comes in Discussion)

**Example:**

> **Inert facts (flag):** "Smith et al. (2020) used ground-penetrating radar to detect subsurface anomalies in concrete towers. The method showed 85% accuracy in controlled tests. Multiple studies have employed similar nondestructive approaches. Wang et al. (2019) applied ultrasonic testing with good results."
>
> **Argumentative facts (keep):** "Ground-penetrating radar (Smith et al., 2020) detected subsurface cracks that visual inspection missed, which explains why early damage estimates were systematically low. This measurement gap matters because maintenance schedules based on surface inspection alone may miss load-bearing deterioration."

### 3. Citation-Continuity Diagnostic

**Target:** All sections with literature citations

**Procedure:**
- Scan for author names throughout the document
- Flag if the same study appears with full introduction (authors + year + method description) in multiple sections within 5-10 paragraphs
- Check if pronouns or short references ("that study", "those measurements", "the same approach") could replace subsequent full introductions

**Flag when:**
- "Wang et al. (2018) measured X using method Y..." appears in Section 3, then "Wang and colleagues (2018) investigated Z using method Y..." appears in Section 4, creating the impression of two independent studies
- The same study is fragmented to fit categorical sections (one result in "Structural Analysis", another in "Dynamic Response") with redundant setup each time

**Do not flag:**
- Studies genuinely referenced far apart in the document (different chapters, 20+ pages separation)
- First mention in abstract/introduction + detailed mention in literature review (standard structure)
- Cases where the second mention adds genuinely new information about the study not stated before

**Suggested fix:**
- Use pronouns or brief references for continuity: "The same study found...", "Those measurements also revealed...", "Wang et al. subsequently showed..."

### 4. Register-Drift Diagnostic

**Target sections:** Discussion, Analysis, Results interpretation

**Procedure:**
- Scan analysis and discussion sections for clusters of prescription language
- Check if the text shifts from analyzing what evidence shows to prescribing what researchers should do

**Prescription markers:**
- "requires further investigation"
- "should be combined with"
- "needs validation"
- "deserves attention"
- "warrants exploration"
- "merits consideration"
- "需要调查"
- "应进一步检测"

**Flag when:**
- Prescription language appears in place of concrete findings or limitations
- Analysis sections prescribe next steps instead of interpreting current evidence
- Multiple prescription phrases cluster in paragraphs meant to discuss current results

**Do not flag:**
- Dedicated "Future Work" or "Recommendations" sections where prescription is legitimate
- Single, well-scoped suggestions grounded in specific study limitations
- Methods sections describing what procedures should be followed (procedural, not analytical)

**Suggested fix:**
- Replace: "The correlation between X and Y requires further investigation" 
- With: "The correlation between X and Y has not been tested across multiple wind farm contexts"
- Or simply state the finding and move on, leaving future directions to a dedicated section

### 5. Section-Specific Pattern Calibration

Different sections of academic papers have different genre conventions. Calibrate pattern detection accordingly:

#### Methods Sections
- **Passive voice is conventional**, not an AI tell (Pattern #13)
- "The samples were prepared..." is standard academic style
- Only flag passive voice if it obscures agency where clarity matters ("Measurements were taken" vs. "We measured")

#### Results Sections
- **Hedging reflects statistical uncertainty**, not AI over-caution (Pattern #24)
- "The data suggest...", "may indicate...", "appears to show..." are appropriate when statistical confidence is limited
- Flag hedging only if it's uniform across all claims regardless of evidence strength

#### Discussion Sections
- **Some prescription is legitimate** in future-work subsections (Pattern #40)
- Distinguish between prescription replacing analysis (flag) vs. scoped suggestions in a dedicated paragraph (keep)
- Author stance and interpretation should be strongest here (Pattern #39)

#### Introduction Sections
- **Generic background is more suspect** than in dedicated Background/Related Work sections (Pattern #38)
- "In recent years, with the rapid development of..." as an opening is a stronger AI signal in introductions
- Background sections legitimately establish context; introductions should move quickly to the research question

#### Literature Review / Related Work
- **Enumeration of prior studies is legitimate** (Pattern #41)
- Don't expect every cited fact to connect to an argument in pure survey sections
- Flag only if the section reads like an annotated bibliography without synthesis or thematic organization

## Cross-Pattern Interactions

Some patterns amplify each other when they co-occur:

### High-Confidence Clusters

When 3+ of these appear together, confidence increases:
- Pattern #1 (inflated significance) + Pattern #3 (superficial -ing) + Pattern #7 (stock AI vocabulary)
- Pattern #9 (negative parallelisms) + Pattern #10 (rule of three) + Pattern #32 (aphorism formulas)
- Pattern #36 (connector density) + Pattern #2 (paragraph templates) + Pattern #43 (template-driven paragraphs)

### Mutually Exclusive Patterns

Some patterns contradict each other; if both appear, reconsider:
- Pattern #13 (passive voice overuse) vs. legitimate academic methods section
- Pattern #24 (excessive hedging) vs. statistically cautious results section
- Pattern #39 (erased stance) vs. encyclopedic literature review section

## Verification Checklist

Before finalizing review or full mode output:

1. **False positives scanned:** Did you preserve legitimate academic conventions?
2. **Section context checked:** Did you calibrate patterns by section type?
3. **Cluster principle applied:** Did you require multiple patterns, not single tells?
4. **Genre honored:** Did you preserve the document's academic register and required structure?
5. **Scope maintained:** Did you avoid fact-checking or adding missing arguments?

## When to Mark "Unresolved"

In review and full modes, mark cases as unresolved (don't edit) when:
- A paragraph seems template-driven but removing it would violate journal requirements
- Author stance is unclear and adding it would require judgment beyond your scope
- Facts seem inert but you cannot determine if they serve a purpose readers would recognize
- Register drift is ambiguous (is this Future Work or misplaced prescription?)

Always prefer leaving ambiguous spans unchanged over making uncertain edits.
