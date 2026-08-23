# MVP Analytics Specification

## Data Scope

The MVP analysis uses only aggregate operational data already held by the product. It does not send employee names, email addresses, request text, or company-contact details to the analysis model.

| Indicator | Source | Decision Question |
|---|---|---|
| Total and open service requests | `serviceRequests` | Is the operational queue being cleared? |
| In-review and urgent requests | `serviceRequests` | Which work needs immediate ownership or escalation? |
| Completion and rejection mix | `serviceRequests` | Are request outcomes balanced and visible? |
| Demo request funnel | `demoRequests` | Where is commercial follow-up needed? |
| Generated HR plans | `hrSystemPlans` | Is the AI planning tool being adopted? |

## AI Output Contract

The analysis returns a short executive summary, up to three positive signals, up to three attention signals, and up to three concrete recommendations. The model must explain only what the aggregates support, state when data is insufficient, and avoid personnel, legal, or performance judgments about individuals.
