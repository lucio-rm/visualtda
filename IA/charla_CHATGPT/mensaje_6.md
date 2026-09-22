Sí. Leí el mensaje_5 como documento principal, la sesión del 19/09, la sesión del 19/09 13:01 y los documentos arquitectónicos que aparecen ahí. Hay una conclusión importante:

Antigravity hizo muchísimo y la base está bastante avanzada, pero su propio informe se contradice. En particular, declara G1-G12 y "production-ready", mientras que el mismo material muestra que varias cosas fueron verificadas de forma demasiado superficial o cambiaron después. Por ejemplo, el E2E reportado es happy-dom, no necesariamente navegador real, y el propio audit original identificaba problemas que luego fueron marcados como solucionados sin evidencia equivalente de QA visual real.

Además, ya hubo una mejora importante: pasó de 184 a 220 tests, incorporó oráculos independientes, límites de stdout, cleanup del worker, persistencia del código, Graph Coloring y una arquitectura de registro mucho más limpia.

Estado real, en corto

Yo lo pondría aproximadamente así:

~65-75% de la infraestructura del producto V1 está hecha.
~45-55% del producto "terminado, pulido y confiable para mostrárselo a profesores" está hecho.

No significa que falte rehacer la mitad. Significa que ahora entramos en la parte menos vistosa y más importante: demostrar que todo lo construido realmente funciona como producto.

Faltan principalmente:

QA real de navegador y visual.
terminar de comprobar accesibilidad.
endurecer Pyodide y documentar exactamente sus límites.
CSP y seguridad de deployment.
verificar realmente los 100 usuarios.
eliminar inconsistencias entre documentación y código.
revisar ejercicio por ejercicio la corrección pedagógica.
mejorar matemática/LaTeX.
terminar la arquitectura modular si todavía quedan acoplamientos.
pulir UX de PC/notebook.
imágenes/ilustraciones 2D donde aporten comprensión.
decidir cuidadosamente dónde una visualización 3D sí enseña algo y dónde sería decoración.
completar el catálogo fundamental, no simplemente aumentar el número.
deployment real y prueba del sitio desplegado.
una pasada final de regresión completa.

La idea original sigue siendo correcta: 2D primero, 3D solamente cuando sea pedagógicamente superior. Eso coincide con el principio original del proyecto.

Y ahora sí, viene lo importante.

PROMPT MAESTRO PARA ANTIGRAVITY

Este reemplaza al prompt anterior. No le mandes el anterior además de este. Este ya incorpora la auditoría de lo que hizo, sus contradicciones, y la siguiente etapa.

Visual TDA — Master Engineering Mission V2

You are the PRIMARY ORCHESTRATOR of Visual TDA.

This is no longer a prototype-expansion task.

The repository already contains a large amount of implemented functionality. Your mission now is to transform that existing work into a genuinely trustworthy, polished, secure, maintainable educational product.

The user wants Visual TDA to become a serious web platform for teaching algorithms and algorithmic problem solving, initially focused on desktop/laptop usage, potentially usable by real FIUBA students and eventually by 100+ concurrent students.

The project must not merely LOOK complete.

It must BE demonstrably correct.

The central principle for this session is:

THINK + AUDIT + VERIFY >>> IMPLEMENT

Do not confuse:

compiling with working
passing unit tests with correctness
mocked browser tests with real browser verification
static hosting with proven scalability
a security checklist with security
many exercises with a coherent curriculum
a beautiful screenshot with good UX
a Pyodide timeout with complete sandbox security
documentation saying PASS with an actually verified PASS

Your job is to find these gaps and close them.

DO NOT blindly trust previous Antigravity reports.

The previous session claimed:

G1-G12 PASS
production readiness
100+ concurrent users
complete architecture
complete accessibility
complete security
complete curriculum audit

Those claims must now be independently re-verified.

If evidence does not support a claim:

MARK IT AS UNVERIFIED.

Do not preserve a PASS merely because a previous report says PASS.

The repository is the source of truth.

==================================================

READ EVERYTHING FIRST
==================================================

Before making substantial changes, read the actual repository and all project knowledge available inside it.

Read:

AGENTS.md
README.md
CLAUDE.md
KIMI.md

docs/
architecture.md
design_principles.md
proyecto.md
roadmap.md
security.md
quality-gates.md
curriculum-audit.md
all relevant documentation

IA/
CHATGPT.md
CLAUDE.md
KIMI.md
architect/*
sessions/*
charla_CHATGPT/*

Read all existing exercise metadata and documentation.

Read:

src/
tests/
exercises/
categories/

Pay special attention to:

architecture
registry
exercise models
visualizers
trace engines
validators
Python runtime
worker protocol
test runner
exercise content
localization
theme
CSS
deployment configuration
CI
security documentation

Do not assume documentation and implementation agree.

Find contradictions.

Run and record:

git status
git branch -vv
git log --oneline --decorate -30
git diff --stat
git diff

npm run lint
npm run typecheck
npm test
npm run build
npm audit

Inspect:

package.json
package-lock.json
vite.config.ts
tsconfig.json
.gitignore
.github/

Also produce:

file count
exercise count
test count
bundle sizes
largest source files
largest generated chunks

Create/update:

IA/architect/current-audit.md

This file must explicitly classify findings as:

VERIFIED
PARTIALLY VERIFIED
UNVERIFIED
FAILED
BLOCKED

Do not use "production-ready" unless the evidence actually justifies it.

Revalidate G1-G12 independently.

G1 BUILD
G2 TYPE SAFETY
G3 LINT
G4 UNIT TESTS
G5 INTEGRATION TESTS
G6 REAL BROWSER/E2E
G7 ACCESSIBILITY
G8 SECURITY
G9 PERFORMANCE
G10 PYTHON EXECUTION RELIABILITY
G11 EXERCISE CORRECTNESS
G12 DEPLOYMENT REPRODUCIBILITY

For EVERY gate document:

exact verification command/tool
what was actually tested
result
evidence
limitations

A gate is NOT PASS merely because a test exists.

This is one of the most important requirements.

The existing happy-dom user journey tests are useful but are NOT equivalent to real browser QA.

If browser automation is available, use it.

If it is not already available, evaluate the smallest appropriate real-browser solution.

Do not add a huge framework without justification.

The objective is actual browser behavior.

Verify at minimum:

landing page loads
category navigation
exercise selection
Discover
Solve
Understand
language switching
theme switching
skip-to-content
keyboard navigation
code editing
test execution
successful validation
failed validation
runtime exception
timeout
reset
exercise switching
timeline controls
visualizer interaction
session persistence
responsive behavior

Use actual browser viewport sizes:

1280x720
1440x900
1920x1080
768x1024
390x844

The V1 priority is desktop/laptop.

Mobile does not need to receive the same polish level as desktop, but it must not catastrophically break.

Do not simply generate screenshots.

Actually inspect them.

For each major screen inspect:

layout
hierarchy
spacing
typography
contrast
alignment
controls
code area
visualization
timeline
theory
hints
errors
success states
loading states
empty states

Look specifically for:

clipping
overflow
horizontal scrolling where it should not exist
text collisions
broken SVG
unreadable formulas
controls that look clickable but are not
controls that are too small
inconsistent spacing
excessive visual noise
weak hierarchy
confusing phase navigation
poor error messages
excessive scrolling
unusable visualizers
visual regressions between light and dark themes

If a real browser/screenshot capability exists, use it.

If visual inspection cannot be automated, document that fact rather than pretending it was verified.

Visual TDA must NOT look like:

an AI dashboard
a generic SaaS admin panel
a template
a flashy developer portfolio

It should look like a serious algorithm laboratory / educational environment.

Design priorities:

educational clarity
algorithmic state visibility
information hierarchy
code ↔ visualization relationship
readable mathematics
calm visual language
excellent desktop experience
accessibility
performance
visual polish

Do not add decorative complexity.

Every visual element should have a reason.

Use the existing design system rather than introducing a UI framework unnecessarily.

Do NOT add 3D everywhere.

The correct rule is:

2D first.

3D only when it materially improves understanding.

For each exercise ask:

"What spatial or algorithmic concept is easier to understand in 3D?"

If there is no strong answer, use 2D.

Examples where 2D is naturally excellent:

N-Queens:

chessboard
attacked cells
candidate positions
backtracking tree/state count

Merge Sort:

array bars/cards
recursive split tree
merge animation

Knapsack:

items
capacity
DP table
selected items

Interval Scheduling:

timeline
intervals
selected intervals

Max Flow:

network graph
capacities
residual capacities
augmenting paths

Linear Programming:

2D feasible region
constraints
objective line

Graph algorithms:

graph nodes/edges
highlighted paths
states

Consider 3D only where it actually teaches something, for example:

geometric algorithms
spatial data
closest pair
3D geometric intuition

Do NOT use Three.js merely because it looks impressive.

If a 3D implementation would add more complexity than educational value, explicitly reject it.

Yes, visual illustrations may be useful.

But do not randomly insert PNGs.

Prefer:

SVG
CSS
programmatic diagrams
interactive visualizers

over raster images when the image represents algorithmic state.

Static 2D illustrations are appropriate for:

introducing a problem
explaining intuition
showing a real-world analogy
showing the relationship between Problem and Technique
illustrating a counterexample
introducing a mathematical concept

Interactive state should generally remain generated from the algorithm state.

For example:

Knapsack Greedy and Knapsack DP may share a common problem illustration to communicate:

"same problem, different technique"

but their actual algorithm visualization must remain separate and truthful.

Do not duplicate assets unnecessarily.

Create a coherent visual asset strategy.

Preserve the original conceptual model:

Problem != Technique != Exercise

An exercise should define:

problem
technique
learning objectives
difficulty
statement
inputs
outputs
constraints
starter code
tests
hints
canonical algorithm
pseudocode
correctness
complexity
trace
visualizer
theory

The intended learning flow is:

Problem
↓
Explore / Discover
↓
Think
↓
Implement
↓
Run tests
↓
Observe algorithm
↓
Understand correctness
↓
Analyze complexity

Do not destroy this educational model during refactoring.

Audit all three phases.

DISCOVER must:

introduce the problem
let the student experiment
provide meaningful parameter manipulation
show algorithmic behavior where appropriate
avoid prematurely revealing the canonical solution

SOLVE must:

present the problem clearly
provide the student editor
provide hints
execute tests
explain failed tests
show progress
preserve code when navigating
never lose student work unexpectedly

UNDERSTAND must:

show canonical solution
show Python
show pseudocode
show deterministic trace where applicable
expose timeline controls
explain correctness
explain complexity
connect code to state transitions

Do not impose an artificial lock that prevents a student from learning.

The original design explicitly rejected:

"you failed the exercise, therefore you cannot see complexity."

Preserve that principle.

Progressive disclosure is good.

Dark patterns are not.

Audit mathematical rendering.

The project contains algorithmic notation such as:

O(n)
O(n log n)
Θ(n²)
OPT(j)
recurrences
mathematical proofs

If formulas currently appear as raw LaTeX text, fix the educational presentation.

However:

DO NOT immediately install a huge math ecosystem.

Evaluate the smallest appropriate solution.

Requirements:

readable on desktop
readable in dark mode
accessible
consistent
does not unnecessarily inflate the initial bundle

Lazy loading is acceptable if appropriate.

Treat student Python as hostile/untrusted input.

Audit again from scratch.

Check:

infinite loops
CPU exhaustion
memory exhaustion
stdout exhaustion
recursion explosion
huge source input
huge test input
huge message payloads
malformed worker messages
worker crashes
worker restarts
stale responses
concurrent executions
repeated execution
pending promise cleanup
worker lifecycle
exceptions
BaseException
sys.exit
KeyboardInterrupt
serialization failures

The existing 5-second watchdog is only one protection.

The 64KB stdout limit is only one protection.

Document exactly:

PROTECTED AGAINST
NOT PROTECTED AGAINST
MITIGATIONS
KNOWN LIMITATIONS

Never claim absolute sandbox security.

Browser-side execution is not equivalent to a remote server sandbox.

The objective is application/resource protection, not impossible guarantees.

The user explicitly wants:

"I don't want them hacking me or extracting data from me."

Audit:

XSS
DOM injection
unsafe HTML
unsafe Markdown
URL injection
localStorage
sessionStorage
query parameters
SVG text injection
error rendering
user-controlled strings
Python stdout
Python traceback
dependency vulnerabilities
source map exposure
secrets
.env files
GitHub Actions permissions
CDN dependencies
worker origins
CSP
iframe behavior
external resource loading

Search for:

dangerouslySetInnerHTML
innerHTML
outerHTML
eval(
Function(
document.write
javascript:
unsafe markdown
unsafe SVG construction

Add a sensible CSP where compatible with the application.

Be careful with worker and Pyodide requirements.

Do not break the application merely to add a theoretically perfect CSP.

Document the tradeoffs.

Preserve the original V1 rule:

NO:

login
accounts
backend
database
analytics
tracking
advertising
personal data collection

unless there is an explicit future architectural decision.

Student code should remain local.

Progress may remain local.

If analytics are ever considered later, create a separate ADR.

Do not quietly add telemetry.

Do not invent a backend.

Analyze the actual architecture:

Static hosting
+
CDN
+
browser execution
+
Pyodide
+
Web Worker

Model:

100 users opening the site
100 downloading initial assets
100 opening exercises
100 loading Pyodide
100 executing Python
100 repeatedly executing Python

Identify:

CDN bandwidth
initial asset size
Pyodide download size
browser CPU
browser memory
worker startup
simultaneous downloads
caching behavior

If possible, perform a realistic local or synthetic load analysis.

Do not claim "100+ concurrent users verified" merely because the site is static.

Distinguish:

ARCHITECTURALLY PLAUSIBLE
from
EMPIRICALLY LOAD TESTED

Audit the actual deployment path.

The intended architecture remains:

React
+
Vite
+
static build
+
Pyodide

No backend for V1.

Verify:

production build
correct asset paths
deep links if applicable
worker loading
Pyodide loading
HTTPS assumptions
caching
static hosting compatibility
deployment reproducibility

The deployed artifact must be tested, not just the local dev server.

If deployment is not yet configured, implement a minimal professional deployment pipeline without adding unnecessary infrastructure.

CI should verify:

lint
typecheck
tests
build

Preferably also:

browser tests
security checks
artifact integrity

Do not grant unnecessary GitHub Actions permissions.

Document:

required checks
branch protection recommendation
deployment permissions
secrets policy
dependency update strategy

Do not modify remote GitHub repository settings unless explicitly authorized and technically supported.

Audit whether the current architecture genuinely supports:

"adding one exercise without modifying unrelated giant files."

The previous audit identified God Files.

The later session improved this substantially.

Verify the CURRENT state.

Target separation:

Problem
Technique
Exercise
Metadata
Algorithm
Validator
Trace
Visualizer
Theory
UI

Algorithm must not depend on React.

Validator must not depend on visualizer.

Trace must not depend on DOM.

Visualizer consumes state/trace.

Content should not be duplicated in multiple authoritative locations.

If duplication exists:

choose ONE source of truth.

Do not create a giant abstraction merely to make a diagram pretty.

Use KISS, DRY, YAGNI and SOLID where actually useful.

Avoid:

speculative plugin systems
over-generic factories
unnecessary dependency injection
unnecessary class hierarchies
premature microservices
state-management frameworks without need

Use design patterns only where they solve real problems.

Relevant patterns may include:

Registry
Strategy
Adapter
Observer/message-passing
Factory only where creation complexity exists
Command/state model for timeline playback if justified

Do not add patterns just to claim that the project uses patterns.

A simple function is preferable to a factory if the factory adds no value.

Document meaningful architectural patterns in:

docs/architecture.md

Do NOT blindly add exercises.

The original objective is:

FUNDAMENTAL EXERCISES.

The student should be able to solve the important canonical problems and understand the technique.

Prioritize exercises from:

Kleinberg & Tardos
FIUBA guides
the starred exercises supplied by the user
other clearly foundational problems

The current catalog is already large.

Audit whether the existing exercises are actually the right ones.

For each category determine:

essential
useful
redundant
niche
missing

Do not optimize exercise count.

Optimize educational coverage.

Every exercise must have a coherent contract.

At minimum:

exercise.json
solution.py
pseudocode.md
theory.md

and the corresponding implementation components where needed.

Verify:

statement
↓
input model
↓
algorithm
↓
validator
↓
tests
↓
trace
↓
visualizer
↓
theory
↓
complexity

They must all describe the SAME algorithmic problem.

No contradictions.

Continue using independent oracles where practical.

For optimization problems:

small brute-force reference solver.

For sorting:

sortedness
+
permutation property.

For graph problems:

structural invariants.

For N-Queens:

row/column/diagonal constraints.

For randomized algorithms:

deterministic seeds for tests.

Never use:

canonical algorithm
→ canonical validator
→ canonical test

as proof of correctness.

That is circular.

A visualization is not allowed to invent algorithmic behavior.

For representative exercises verify:

same input
→ same trace

when deterministic.

Verify:

initial state
→ transitions
→ final state

against canonical algorithm.

Verify:

timeline reset
previous
next
play
pause
jump
replay

Verify no stale trace survives exercise changes.

Verify random algorithms distinguish:

random execution
seed
educational replay

Audit against practical WCAG principles.

Check:

semantic HTML
keyboard navigation
visible focus
labels
forms
buttons
ARIA
screen reader meaning
contrast
reduced motion
SVG accessibility
visualizer interaction

Especially audit the previous known issue:

visualizers that respond only to mouse clicks.

Any meaningful interactive element must have an accessible interaction path.

Do not use color as the only state indicator.

Add:

text
symbols
patterns
labels
ARIA where appropriate

where necessary.

V1 priority:

PC
Notebook

Mobile is secondary.

However:

the application must not become unusable on 390px.

Do not spend weeks making the code editor perfect on mobile.

Do ensure:

no catastrophic overflow
navigation remains possible
content remains readable
no broken layout

Document mobile as V1-secondary rather than pretending it is equally optimized.

Dark mode must have:

SYSTEM
LIGHT
DARK

Verify actual behavior.

Check:

code editor
visualizers
SVG
math
tables
graphs
buttons
focus
error/success states

No unreadable combinations.

Spanish and English must remain consistent.

Audit:

all visible UI strings
exercise metadata
hints
errors
buttons
theory
accessibility labels
visualizer labels

No accidental language mixing.

Do not translate algorithm identifiers or code.

Measure before optimizing.

Inspect:

initial bundle
largest chunks
duplicate code
visualizer chunks
algorithm chunks
Pyodide loading
worker startup
trace memory
large DP tables
graph rendering

Lazy-load expensive exercise-specific functionality when justified.

Do not optimize merely because a number looks ugly.

Optimize measured user-facing bottlenecks.

Every important failure path needs a user-visible recovery path.

Test:

Pyodide unavailable
worker timeout
worker crash
malformed execution
invalid student output
test failure
empty input
invalid input
visualization failure
exercise load failure
corrupted local session data

The application should not become a white screen.

Prefer graceful degradation.

Audit local persistence.

Student code persistence must be:

per exercise
bounded
recoverable
safe against malformed data
non-sensitive

Do not store unnecessary personal information.

Do not trust localStorage/sessionStorage as secure storage.

Treat stored values as untrusted input.

For V1 do not add remote analytics.

However, local developer diagnostics may exist if useful:

execution duration
trace size
worker lifecycle
errors

Do not transmit them.

Do NOT implement these in V1 unless an existing requirement explicitly demands them:

backend
database
accounts
authentication
teacher dashboard
student accounts
leaderboards
social system
AI tutor
gamification
badges
notifications

Keep them in roadmap documentation only.

The project may eventually support comparisons such as:

N-Queens

Brute Force
Backtracking
Optimized Backtracking

Metrics:

states visited
runtime
memory
trace size

But do NOT fabricate performance comparisons.

If implemented, use a common input and clearly define:

environment
metric
number of runs
warm-up
deterministic seed
limitations

This feature is educationally valuable because it makes complexity tangible.

It is not required before the core platform is trustworthy.

Document it as a future capability if the architecture is not ready.

This is a valuable future educational feature.

Example:

N = 4
N = 5
N = 6
N = 7
N = 8

Display:

runtime
states
memory where measurable

Use it to teach growth.

Again:

do not implement it at the expense of correctness/security.

Design the architecture so it can be added later.

Review the educational writing.

A good exercise must answer:

What is the problem?

Why is this technique appropriate?

What is the key idea?

What invariant/property makes it work?

Why is it correct?

What is the complexity?

What happens when the input grows?

What mistakes are students likely to make?

Hints should progress gradually.

Avoid:

Hint 1 = vague
Hint 2 = entire solution

The original pedagogical intent is progressive discovery.

Each visualizer must make the algorithm easier to understand.

For each visualizer ask:

What does the student learn from this?

If the answer is unclear, simplify it.

Visual state must correspond to actual algorithm state.

Do not animate irrelevant details.

Do not animate merely for spectacle.

Use consistent:

controls
timeline
labels
legends
state indicators
reset
play
pause
previous
next

where applicable.

Synchronize:

IA/architect/state.md
IA/architect/next.md
IA/architect/questions.md
IA/architect/current-audit.md
IA/sessions/
docs/architecture.md
docs/roadmap.md
docs/security.md
docs/quality-gates.md
docs/curriculum-audit.md

Never leave stale claims such as:

"20 exercises"

if there are 21.

Never leave:

"App.tsx is 1344 lines"

if it is now 87.

Never leave:

"zero E2E tests"

if they now exist.

The documentation must describe the CURRENT repository.

Create/update:

docs/quality-gates.md

Use evidence-based status.

Recommended states:

PASS
PARTIAL
UNVERIFIED
FAIL
N/A

Add a distinction between:

AUTOMATED
MANUAL
EMPIRICAL
DOCUMENTARY

Example:

G6 Browser:
AUTOMATED: PASS
REAL-BROWSER MANUAL: PASS
LIMITATION: ...

Do not collapse different forms of verification into one number.

Update:

docs/security.md

It must explicitly state:

threat model
assets
attacker capabilities
XSS defenses
Python execution model
worker isolation
resource limits
CSP
dependency policy
secret policy
privacy model
limitations
deployment assumptions

Include:

"what this system does NOT guarantee."

This is important.

Review ADR-001 through ADR-004.

Verify each decision against the actual code.

If an ADR says something that the implementation no longer does:

fix the ADR or implementation.

Do not preserve obsolete architecture merely because an ADR exists.

Never:

switch to main
force push
reset --hard
delete branches
modify outside the repository

Use conventional commits.

Before meaningful changes:

git status
git diff --stat

After coherent changes:

run relevant tests
commit

Never create giant meaningless commits.

Continue autonomously.

Do not stop after writing a report.

Do not stop after one fix.

Do not stop because a phase name changed.

After each atomic task:

inspect
implement
test
review
document
commit
choose next highest-value task
continue

Do not ask the user for approval for ordinary implementation decisions.

Escalate only if a genuinely irreversible architectural decision is blocked.

Use subagents when they are genuinely useful.

Good parallel tasks:

security audit
accessibility audit
curriculum audit
visual QA research
dependency audit
testing audit
documentation consistency

Do NOT let two agents edit the same architectural files simultaneously.

Prefer:

research in parallel
implementation serialized

Correctness > parallelism.

Visual TDA V1 is NOT done because:

build passes
tests pass
there are many exercises
a report says PASS

V1 is done when:

ARCHITECTURE

coherent
maintainable
documented
adding exercises is predictable

CORRECTNESS

canonical algorithms verified
validators independently tested
traces verified
theory matches implementation

SECURITY

no known critical security issues
threat model documented
Python execution hardened
no secrets
no unsafe DOM sinks
CSP/deployment reviewed

UX

desktop experience polished
all core flows usable
errors recoverable
no obvious broken states

ACCESSIBILITY

keyboard paths work
visualizers are accessible
color is not the sole state indicator
reduced motion is respected

PERFORMANCE

initial load reasonable
exercise code appropriately split
Pyodide lazy
large visualizations controlled

TESTING

unit
integration
real browser
adversarial
independent oracles
regression

DEPLOYMENT

reproducible
production build tested
deployed artifact tested
no hidden environment assumptions

CURRICULUM

coherent
fundamental
aligned with intended FIUBA/Kleinberg-Tardos material

CONTENT

clear
mathematically readable
pedagogically progressive

Before declaring completion:

Run:

npm run lint
npm run typecheck
npm test
npm run build
npm audit

Run browser tests.

Run real-browser smoke tests.

Inspect production build.

Inspect deployment if available.

Perform manual visual QA.

Check git status.

Check git diff.

Check git log.

Check untracked files.

Then update:

IA/architect/state.md
IA/architect/next.md
IA/architect/questions.md
IA/architect/current-audit.md

Write a session report:

IA/sessions/YYYY-MM-DD.md

The final report MUST distinguish:

VERIFIED
PARTIALLY VERIFIED
UNVERIFIED
FAILED
BLOCKED

Do not inflate completion.

The user will explicitly send:

STOP

When STOP is received:

finish ONLY the current atomic safe operation
do NOT start another task
run complete relevant verification
git status
git diff --stat
git log
inspect untracked files
document modified files
document commits
document tests
document failures
document security findings
document architectural decisions
document unresolved questions
document technical debt
document ideas
document next work

Write:

IA/sessions/YYYY-MM-DD.md

Update:

IA/architect/state.md
IA/architect/next.md
IA/architect/questions.md

Then remain idle.

Do not optimize for the appearance of progress.

Optimize for TRUST.

If you discover that something previously marked PASS is actually incomplete:

say so
fix it
test it
document it

Do not hide regressions.

Do not protect previous work from criticism.

Do not assume the previous agent was correct.

Do not assume this prompt is correct either.

If the repository reveals a better solution that preserves the project's principles, use it and document why.

The ultimate objective is:

Visual TDA should be a serious algorithm-learning laboratory that a student can open, understand, experiment with, code in, test, visualize, and learn from without the system lying to them.

Make it boringly reliable where reliability matters.

Make it visually excellent where visualization teaches.

Make it secure without pretending browser execution is magic.

Make the architecture simple enough that future exercises do not become another pile of special cases.

Begin now.

Do not wait for approval.

Una corrección importante a lo que veníamos haciendo

No le pediría ahora "agregá 30 ejercicios". Primero haría esta pasada de confiabilidad. La sesión anterior hizo algo muy bueno: creó oráculos independientes, endureció el worker y bajó muchísimo el acoplamiento. Pero también hay señales de que empezó a declarar victoria demasiado pronto. El propio historial muestra que el audit inicial encontró E2E inexistente, problemas de accesibilidad, CSP ausente, dependencia de jsDelivr y God Files, y después esos puntos aparecen como resueltos sin que todos tengan una demostración equivalente de verificación real.

Y hay otra cosa que quiero cambiar de raíz: no vamos a perseguir "perfecto y sin bugs" como una afirmación. Eso no es técnicamente demostrable. Vamos a perseguir algo mejor: que cada superficie importante tenga evidencia, tests y una limitación explícitamente documentada.

Eso es lo que convierte esto de "proyecto que anda" en un producto defendible frente a un profesor.

Tiempo: con solo dos días, el ritmo es muy alto. No te diría "faltan X horas exactas", porque ahora el cuello de botella no es escribir código sino QA, contenido y revisión. Pero con este ritmo de trabajo autónomo, unas semanas de iteración adicional son razonables para una V1 presentable y seria. La versión realmente amplia, con el catálogo curricular completo y todas las visualizaciones refinadas, naturalmente puede extenderse bastante más. El plan original ya estimaba 180-300 horas para un producto amplio, frente a 70-100 horas para un MVP serio.

Y sí: recién llevamos dos días. Lo que hay ya es bastante más parecido a una base de producto que a un boceto. Ahora toca hacerle pasar la inspección técnica con una lupa, no seguir echándole ladrillos al edificio.


