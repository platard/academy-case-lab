# Signal Notes — Follow the evidence

[Launch the interactive lab](https://platard.github.io/academy-case-lab/)

A five-minute instructional design work sample for new analysts reviewing a fictional wallet alert. Learners inspect two transactions, distinguish observations from assumptions, verify a source, and write a handoff note.

| Learning objective | Practice and assessment |
| --- | --- |
| Identify a supportable claim | Select a statement and get feedback specific to the chosen answer. |
| Identify an evidence gap | Choose the next check and explain its purpose using the feedback. |
| Communicate a defensible handoff | Write a note, then compare it with a worked example for fact, uncertainty, and next action. |

**Design rationale.** The evidence stays visible while learners make decisions. Incorrect answers allow a retry. The debrief distinguishes first-attempt performance from eventual completion. The written response uses self-assessment. The prototype collects no learner data and makes no claims about training outcomes.

**Run locally.** Download this repository and open `index.html` in a browser. No account, installation, API key, or external service is required. Refreshing clears the session.

Independent educational example using invented records. No affiliation with an employer or real investigation.

## Learning studio

Use the navigation to inspect sources, debug real SQLite queries against two datasets, ask the tutor questions, or explore instructor interventions. The dashboard combines three explicitly fictional profiles with activity from the current page session. Its signals describe attempts and checks, not ability. Reloading clears learner activity.

Guided mode works immediately. Under Tutor chat, expand **Use a local AI model** to optionally download Qwen2.5-0.5B-Instruct through WebLLM on a WebGPU-capable browser. The same local model supports chat, SQL coaching and dashboard suggestions. Generated hints can be wrong; check them against the case. Without a loaded model, responses are explicitly labeled guided hints. No API key or prompt server is used.

Serve the folder over HTTP for the full studio (for example, run `python3 -m http.server` and open localhost:8000). The workshop bundles sql.js 1.13.0 and its license in vendor/.
