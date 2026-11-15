# M08 DEVELOPMENT prompt and model registry

Checkpoint 2026-09-29. These entries are implementation drafts, **not Final experiment freezes**. The executable source of truth is `agents/prompts.py` and `agents/provider.py`; digests below were computed in the Python 3.12 test image from those modules. Prompt `updated_at` is 2026-09-29. All entries have status DEVELOPMENT.

| Prompt ID / role | Version | SHA-256 of template content | Combined shared+role SHA-256 |
|---|---|---|---|
| shared-agent-policy / ALL | dev-1 | `d2ae40ad1144ebbab58d2051ed70c5437e1974d01110dbd2cbe4acb3eb78e7a3` | — |
| sales-specialist / Sales | dev-1 | `8fc97e6f61eb8841083183c712d792e24e8ab28c3512e67dfb24005eda983c06` | `e178bd629e15c3c60f14790ca62339c9072bdee3920f10f96e44161736dd59ec` |
| support-specialist / Support | dev-1 | `ed7cc938fcf02d28f76e007b0623b8ea657401f179790ed835eb4df3bdbc0107` | `ded154ac9c710946f635a8e4453127dba6a492309c0206240d2f25ebb07c2a6c` |
| analytics-specialist / Analytics | dev-1 | `1dcb727304de3023a25c00ebaeb0d848db234dba40503f68f8eedd67cbfca766` | `61655a2e667e91af9abe536928f4a9a7fe9b0a2d1fa6ba8bed4e8374bd5780ca` |

The shared prompt declares grounding, tenant/permission authority, retrieved-text untrustworthiness, clarification, escalation and no invented business facts. Specialist prompts add only role-specific capability and E02/forecast limits. The model receives only the M06 `ContextBundle.model_projection()`, allowed tool schemas and prior trusted results. The prompts alone never authorize a tool.

Development provider/model: `gemini` / `gemini-3.8-flash`, REST adapter using `httpx==0.28.1` (no Google SDK). Default config: temperature `0.2`, top-p `0.95`, max output `1024`, timeout `20` seconds, max retries `1`; canonical JSON SHA-256 of `DevModelConfig()` fields is `2c2ddff21bffc51ac36853b09816e1a61a023032606bae67a8d9205dd635e56d`. Two bounded real-provider cases later passed, proving one structured reply and one native function proposal. The live model-version value was not recorded or independently asserted, and the later three live-specialist cases did not complete. The latest status-only `generateContent` probe returned HTTP 429; no secret or response body was logged. No seed/reproducibility claim is made. The [official model page](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash) documents stable tool/structured-output support; this choice remains subject to complete live validation.

SINGLE prompt, static routing policy, adaptive routing policy and mode registry are **NOT IMPLEMENTED**. They have no version or hash yet; no value is fabricated. M09–M12 remain gated behind M08.
