# CHATGPT_MISSION_ASK_MONI_CONSOLE_V1

Origin:
ChatGPT

Role:
Mentor
Auditor
Mission Author

Destination:
Atlas

Priority:
HIGH

Mission:
Restore MONI Console Ask Moni functionality.

Observed Symptom:
MONI Console loads.
Status is online.
Incidents load.
Recovery loads.
Events load.
Ask Moni input accepts text.
When user sends "hola", the UI returns:

Error: Failed to fetch

Objective:
Make Ask Moni return a valid MONI response from the existing console.

Important:
Do not create a new dashboard.
Do not create a new assistant.
Do not redesign Atlas.
Do not bypass Founder OS.
Do not bypass Auditor.
Do not patch production blindly.
Repair existing Ask Moni connectivity only.

Required Investigation:
Trace the real request path:

Ask Moni UI
-> frontend handler
-> API route
-> MONI backend/service
-> MONI runtime/listener
-> response

Verify:
- Browser request URL
- HTTP method
- Request payload
- API route existence
- Backend process status
- Port/listener status
- Proxy configuration
- CORS configuration
- Authentication/session requirement
- Runtime logs
- Error logs

Questions for Atlas:
1. What exact endpoint does Ask Moni call?
2. Does that endpoint exist?
3. Which component owns it?
4. Is the backend service running?
5. Is the browser blocked by CORS, proxy, auth, route mismatch, or network path?
6. What is the confirmed root cause?
7. What is the smallest safe recovery plan?
8. Should Nexus generate a patch from inside the ecosystem?
9. What validation proves success?

Expected Deliverables:
- ASK_MONI_ROOT_CAUSE_V1.md
- ASK_MONI_RECOVERY_PLAN_V1.md
- ASK_MONI_VALIDATION_V1.md

Success Criteria:
Input:
hola

Expected Output:
Valid MONI response.

Failure Output:
Failed to fetch

Authority:
Founder authorized investigation.
Founder OS governs.
Atlas investigates.
Oracle prioritizes.
Leonidas directs.
Nexus builds if needed.
Auditor validates.
Forge executes only approved repair.

Publish response to:
Knowledge Gateway
GitHub

End Mission.
