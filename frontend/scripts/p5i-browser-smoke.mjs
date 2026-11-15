// Real isolated Keycloak code-flow smoke. Never logs credentials, cookies or tokens.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const seed = JSON.parse(await readFile(process.env.P5I_PRIVATE_SEED, "utf8"));
const origin = process.env.APP_ORIGIN ?? "http://127.0.0.1:3100";
const backend = process.env.API_SERVER_BASE_URL ?? "http://127.0.0.1:8105";
const output = process.env.P5I_EVIDENCE_DIR;
await mkdir(output, { recursive: true });
const browser = spawn(process.env.P5I_BROWSER, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--remote-debugging-port=9225", `--user-data-dir=${path.join(output, "browser-profile")}`, "about:blank"], { windowsHide: true, stdio: "ignore" });
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
let ws;
let diagnosticEvaluate;
let diagnosticSend;
const report = { authentication: {}, reads: [], routeSmoke: [], negativeChecks: {}, performance: {} };
function assert(ok, message) { if (!ok) throw new Error(message); }
try {
  let ready;
  for (let attempt = 0; attempt < 50; attempt++) {
    try { ready = await fetch("http://127.0.0.1:9225/json/version").then(r => r.json()); break; } catch { await pause(200); }
  }
  assert(ready, "Browser DevTools did not become ready");
  const tab = await fetch("http://127.0.0.1:9225/json/new?about:blank", { method: "PUT" }).then(r => r.json());
  ws = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let serial = 0;
  const pending = new Map();
  ws.onmessage = event => { const message = JSON.parse(event.data); const call = pending.get(message.id); if (call) { pending.delete(message.id); if (message.error) call.reject(new Error("Browser protocol command failed")); else call.resolve(message.result); } };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++serial; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    assert(!result.exceptionDetails, "Browser expression failed");
    return result.result.value;
  };
  diagnosticEvaluate = evaluate;
  diagnosticSend = send;
  async function waitFor(expression, message) {
    for (let attempt = 0; attempt < 100; attempt++) { if (await evaluate(expression)) return; await pause(150); }
    throw new Error(message);
  }
  async function navigate(route, text) {
    const started = performance.now();
    await send("Page.navigate", { url: origin + route });
    await waitFor(`document.readyState === 'complete' && document.body.innerText.includes(${JSON.stringify(text)})`, `Expected content absent on ${route.split("?")[0]}`);
    return Math.round(performance.now() - started);
  }
  async function capture(name, width = 1440, height = 1100) {
    await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: width < 600 });
    await pause(200);
    const metrics = await evaluate("({width:innerWidth,documentWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth})");
    const screenshot = await send("Page.captureScreenshot", { format: "png", fromSurface: true, captureBeyondViewport: false });
    await writeFile(path.join(output, name), Buffer.from(screenshot.data, "base64"));
    return metrics;
  }
  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
  await send("Network.clearBrowserCookies"); // This browser uses only its isolated test profile.
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  await navigate("/products?q=P5I", "Staff sign-in");
  report.negativeChecks.unauthenticatedStaffRedirect = true;
  await send("Page.navigate", { url: `${origin}/api/auth/callback?state=wrong&code=invalid` });
  await waitFor("location.pathname === '/login' && location.search.includes('login-failed')", "Callback without transaction did not fail closed");
  report.negativeChecks.callbackWithoutTransaction = true;
  const loginStarted = performance.now();
  await send("Page.navigate", { url: `${origin}/api/auth/login?returnTo=${encodeURIComponent("/products?q=P5I")}` });
  await waitFor("document.querySelector('input[name=password]') !== null", "Real Keycloak login form unavailable");
  const authUrl = await evaluate("location.href");
  assert(new URL(authUrl).origin === new URL(seed.issuer).origin, "Credentials must go only to the local Keycloak origin");
  assert(new URL(authUrl).searchParams.get("code_challenge_method") === "S256", "PKCE was not present");
  await capture("keycloak-login.png");
  await evaluate(`(() => { document.querySelector('input[name=username]').value=${JSON.stringify(seed.username)}; document.querySelector('input[name=password]').value=${JSON.stringify(seed.password)}; document.querySelector('input[name=password]').form.requestSubmit(); return true; })()`);
  await waitFor(`location.origin === ${JSON.stringify(origin)} && location.pathname === '/products' && document.body.innerText.includes('REAL')`, "Real OIDC callback did not produce authenticated Product page");
  report.authentication.login = "PASS";
  report.performance.loginAndFirstReadMs = Math.round(performance.now() - loginStarted);
  const principalStarted = performance.now();
  const session = await evaluate("fetch('/api/auth/session',{cache:'no-store'}).then(async r=>({status:r.status,body:await r.json()}))");
  report.performance.currentPrincipalRoundTripMs = Math.round(performance.now() - principalStarted);
  assert(session.status === 200 && session.body.identity.roles.includes("OWNER") && session.body.identity.activeBusinessId === seed.business_id, "Trusted principal/business did not resolve");
  assert(!JSON.stringify(session.body).match(/access.?token|id.?token|refresh.?token|eyJ[a-zA-Z0-9_-]+\./i), "Session data exposed a token");
  report.authentication.currentPrincipal = "OWNER with verified business membership";
  const cookieInfo = await send("Network.getCookies", { urls: [origin] });
  const sessionCookie = cookieInfo.cookies.find(cookie => cookie.name === "diploma_session");
  assert(sessionCookie?.httpOnly && sessionCookie.sameSite === "Lax" && sessionCookie.value.length >= 43, "Opaque HttpOnly session cookie missing");
  assert(!await evaluate("document.cookie.includes('diploma_session')"), "Session cookie accessible to JavaScript");
  report.authentication.cookie = "Opaque / HttpOnly / SameSite=Lax";
  await capture("products-desktop.png");
  await navigate(`/inventory?product=${seed.product_id}`, "5.0000");
  assert(!await evaluate("document.body.innerText.includes('Pending')"), "Known observed Inventory was labelled as a pending operation");
  report.reads.push("Products + Inventory: REAL data PASS");
  await capture("inventory-mobile.png", 390, 1100);
  report.mobile = await evaluate("({width:innerWidth,documentWidth:document.documentElement.scrollWidth})");
  assert(report.mobile.width === 390 && report.mobile.documentWidth === 390, "Narrow page overflow");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });
  const checks = [
    ["/overview", "Role-scoped orientation"], ["/conversations", "LOCAL UI FIXTURE ONLY"],
    ["/conversations/c-41", "LOCAL UI FIXTURE ONLY"], ["/escalations", "LOCAL UI FIXTURE ONLY"],
    ["/customers", "LOCAL UI FIXTURE ONLY"], [`/customers/${seed.customer_id}`, "Synthetic customer"],
    ["/orders", "LOCAL UI FIXTURE ONLY"], [`/orders/${seed.order_id}`, "Order changes remain restricted"],
    ["/products?q=P5I", "P5I-LOCAL-01"], [`/inventory?product=${seed.product_id}`, "5.0000"],
    ["/products?q=no-real-match", "No matching authorized products"],
    [`/products?product=${seed.foreign_product_id}`, "Record is not accessible"],
    ["/documents", "LOCAL UI FIXTURE ONLY"], ["/documents/doc-1042", "LOCAL UI FIXTURE ONLY"],
    ["/analytics", "REAL"], ["/forecasts", "MODEL_NOT_READY"],
    ["/integrations", "M08 live channels are not accepted"], ["/settings", "Save settings"],
    ["/audit", "Audit access is restricted"], ["/agent-runs", "Agent Runs access is restricted"],
    ["/audit?state=fixture", "LOCAL UI FIXTURE ONLY"], ["/agent-runs?state=fixture", "MODEL PROPOSES"],
    ["/chat", "Web Chat"], ["/chat?state=confirmation-pending", "same request again"],
  ];
  for (const [route, expected] of checks) { const duration = await navigate(route, expected); report.routeSmoke.push({ route: route.split("?")[0], result: "PASS", durationMs: duration }); }
  await navigate("/analytics", "REAL"); await capture("analytics-real-empty.png");
  await navigate(`/products?product=${seed.foreign_product_id}`, "Record is not accessible"); await capture("authorization-state.png");
  const badAuth = await evaluate(`Promise.all([null,'Bearer invalid-token'].map(authorization=>fetch(${JSON.stringify(backend + "/me")},{headers:{'X-Business-ID':${JSON.stringify(seed.business_id)},...(authorization?{Authorization:authorization}:{})}}).then(r=>r.status)))`);
  assert(badAuth.every(status => status === 401), "Backend did not reject missing/invalid tokens");
  report.negativeChecks.backendMissingAndInvalidToken = "401 / 401";
  const csrf = await fetch(`${origin}/api/auth/logout`, { method: "POST", headers: { Origin: "https://foreign.example.invalid", Cookie: `diploma_session=${sessionCookie.value}` }, redirect: "manual" });
  assert(csrf.status === 403, "Cross-origin logout not denied");
  report.negativeChecks.crossOriginLogout = "403";
  if (process.env.P5I_TEST_OUTAGE === "true") {
    const composeArgs = ["compose", "--project-name", "diploma-p5i-baseline", "--env-file", ".env.p2.local", "-f", "infra/compose/compose.yaml"];
    const platform = fileURLToPath(new URL("../../platform/", import.meta.url));
    const isolatedEnv = { ...process.env, KEYCLOAK_PORT: "8185", BACKEND_PORT: "8105" };
    const stopped = spawnSync("docker", [...composeArgs, "stop", "backend"], { cwd: platform, env: isolatedEnv, windowsHide: true, stdio: "ignore", timeout: 30000 });
    assert(stopped.status === 0, "Isolated backend stop failed");
    try {
      await navigate("/products?q=P5I", "Staff context is unavailable");
      assert(!await evaluate("document.body.innerText.includes('P5I-LOCAL-01')"), "Unavailable backend leaked prior product data");
      await capture("backend-unavailable.png");
      report.negativeChecks.backendUnavailable = "PASS / no previous records shown";
    } finally {
      const started = spawnSync("docker", [...composeArgs, "start", "backend"], { cwd: platform, env: isolatedEnv, windowsHide: true, stdio: "ignore", timeout: 30000 });
      assert(started.status === 0, "Isolated backend restart failed");
      for (let attempt = 0; attempt < 40; attempt++) { try { if ((await fetch(`${backend}/health/live`)).ok) break; } catch { /* Wait for the same task-owned service. */ } await pause(200); }
    }
  }
  await navigate("/products?q=P5I", "REAL");
  await evaluate("document.querySelector('form[action=\"/api/auth/logout\"]').requestSubmit(); true");
  await waitFor("location.pathname === '/login' && document.body.innerText.includes('Staff sign-in')", "RP-initiated logout failed");
  const replay = await fetch(`${origin}/api/auth/session`, { headers: { Cookie: `diploma_session=${sessionCookie.value}` } });
  assert(replay.status === 401, "Old session remained usable after logout");
  report.authentication.logoutAndSessionReplay = "PASS / 401";
  const keycloakCookies = await send("Network.getCookies", { urls: [new URL(seed.issuer).origin] });
  assert(!keycloakCookies.cookies.some(cookie => cookie.name === "KEYCLOAK_SESSION" && cookie.value), "Keycloak SSO session still present after logout");
  report.authentication.keycloakLogout = "PASS";
  if (process.env.P5I_TEST_EXPIRY === "true") {
    await send("Page.navigate", { url: `${origin}/api/auth/login?returnTo=${encodeURIComponent("/products?q=P5I")}` });
    await waitFor("document.querySelector('input[name=password]') !== null", "Reauthentication form unavailable");
    await evaluate(`(() => { document.querySelector('input[name=username]').value=${JSON.stringify(seed.username)}; document.querySelector('input[name=password]').value=${JSON.stringify(seed.password)}; document.querySelector('input[name=password]').form.requestSubmit(); return true; })()`);
    await waitFor(`location.origin === ${JSON.stringify(origin)} && location.pathname === '/products' && document.body.innerText.includes('REAL')`, "Reauthentication failed");
    const expiryCookies = await send("Network.getCookies", { urls: [origin] });
    const expiringCookie = expiryCookies.cookies.find(cookie => cookie.name === "diploma_session");
    assert(expiringCookie?.expires > 0, "Session expiry missing");
    const remaining = Math.max(0, expiringCookie.expires * 1000 - Date.now()) + 1500;
    console.log("Real token/session expiry check is running; no token is exposed.");
    for (let waited = 0; waited < remaining; waited += 30000) await pause(Math.min(30000, remaining - waited));
    const expired = await fetch(`${origin}/api/auth/session`, { headers: { Cookie: `diploma_session=${expiringCookie.value}` } });
    assert(expired.status === 401, "Expired session remained valid");
    await navigate("/products?q=P5I", "Sign in to continue");
    await capture("expired-session.png");
    report.negativeChecks.expiredSession = "PASS / 401 / staff redirect";
  }
  await navigate("/chat?state=confirmation-pending", "same request again"); await capture("webchat-mobile.png", 390, 1000);
  await writeFile(path.join(output, "browser-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ result: "PASS", routeSmoke: `${report.routeSmoke.length}/${report.routeSmoke.length}`, auth: report.authentication, negativeChecks: report.negativeChecks, performance: report.performance, mobile: report.mobile }));
} catch (error) {
  if (diagnosticEvaluate && diagnosticSend) {
    const state = await diagnosticEvaluate("({path:location.pathname,applicationOrigin:location.origin==='http://127.0.0.1:3100',loginFailure:location.search.includes('login-failed'),keycloakForm:!!document.querySelector('input[name=password]'),keycloakError:document.querySelector('#input-error')?.textContent?.trim() ?? null})");
    console.error(JSON.stringify(state));
    const screenshot = await diagnosticSend("Page.captureScreenshot", { format: "png", fromSurface: true });
    await writeFile(path.join(output, "smoke-failure.png"), Buffer.from(screenshot.data, "base64"));
  }
  console.error(`P5I browser smoke failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (ws) ws.close();
  browser.kill();
}
