// Isolated real-browser regression. Never records credentials or OIDC/cookie values.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";

const seed = JSON.parse(await readFile(process.env.P5I_PRIVATE_SEED, "utf8"));
const origin = process.env.APP_ORIGIN ?? "http://127.0.0.1:3100";
const output = process.env.P5I_EVIDENCE_DIR;
const pause = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
function assert(ok, message) { if (!ok) throw new Error(message); }
// This helper may submit credentials only to the isolated local engineering realm.
assert(new URL(origin).hostname === "127.0.0.1" && new URL(seed.issuer).hostname === "127.0.0.1" &&
  new URL(seed.issuer).pathname.startsWith("/realms/p5i-engineering-"), "Isolated local test origins required");
await mkdir(output, { recursive: true });
const browser = spawn(process.env.P5I_BROWSER, ["--headless=new", "--disable-gpu", "--no-first-run",
  "--remote-debugging-port=9225", `--user-data-dir=${path.join(output, "browser-profile")}`, "about:blank"],
{ windowsHide: true, stdio: "ignore" });
const tabs = [];
const report = {};

async function tab() {
  const target = await fetch("http://127.0.0.1:9225/json/new?about:blank", { method: "PUT" }).then(r => r.json());
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let serial = 0;
  const pending = new Map();
  const traffic = [];
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.method === "Network.requestWillBeSent") {
      const url = new URL(message.params.request.url);
      // Deliberately retain no query, headers, cookies or request body.
      traffic.push({ origin: url.origin, path: url.pathname });
    }
    const call = pending.get(message.id);
    if (call) {
      pending.delete(message.id);
      if (message.error) call.reject(new Error("Browser protocol command failed"));
      else call.resolve(message.result);
    }
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++serial;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    assert(!result.exceptionDetails, "Browser expression failed");
    return result.result.value;
  };
  const waitFor = async (expression, message) => {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate(expression)) return;
      await pause(150);
    }
    throw new Error(message);
  };
  const page = { socket, send, evaluate, waitFor, traffic, id: target.id };
  tabs.push(page);
  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
  return page;
}

function starts(page) { return page.traffic.filter(url => url.origin === origin && url.path === "/api/auth/login").length; }
async function transaction(page) {
  const result = await page.send("Network.getCookies", { urls: [origin] });
  return result.cookies.find(cookie => cookie.name === "diploma_oidc_transaction");
}
async function openLogin(page) {
  await page.send("Page.navigate", { url: `${origin}/login` });
  await page.waitFor("document.readyState === 'complete' && !!document.querySelector('a[href=\"/api/auth/login\"]')", "Native login control absent");
  // Bounded observation after load/hydration, with the link visible in the viewport.
  await pause(1500);
}
async function explicitLogin(page) {
  await page.evaluate("document.querySelector('a[href=\"/api/auth/login\"]').click(); true");
  await page.waitFor("!!document.querySelector('input[name=password]')", "Real Keycloak form unavailable");
  const destination = new URL(await page.evaluate("location.href"));
  assert(destination.origin === new URL(seed.issuer).origin, "Unexpected credential destination");
  assert(destination.searchParams.get("code_challenge_method") === "S256" && destination.searchParams.has("code_challenge") &&
    destination.searchParams.has("state") && destination.searchParams.has("nonce"), "OIDC security parameters absent");
  const cookie = await transaction(page);
  assert(cookie?.httpOnly && cookie.sameSite === "Lax" && cookie.path === "/", "Protected transaction cookie absent");
  return cookie;
}
async function completeLogin(page) {
  await page.evaluate(`(() => { document.querySelector('input[name=username]').value=${JSON.stringify(seed.username)}; document.querySelector('input[name=password]').value=${JSON.stringify(seed.password)}; document.querySelector('input[name=password]').form.requestSubmit(); return true; })()`);
  await page.waitFor(`location.origin === ${JSON.stringify(origin)} && location.pathname === '/overview' && document.readyState === 'complete'`, "Original login callback did not succeed");
  const session = await page.evaluate("fetch('/api/auth/session',{cache:'no-store'}).then(async r=>({status:r.status,body:await r.json()}))");
  assert(session.status === 200 && session.body.identity.roles.includes("OWNER") && session.body.identity.activeBusinessId === seed.business_id,
    "Verified principal/business session absent");
}
async function logout(page) {
  await page.evaluate("document.querySelector('form[action=\"/api/auth/logout\"]').requestSubmit(); true");
  await page.waitFor("location.pathname === '/login' && document.readyState === 'complete'", "Real logout failed");
  const status = await page.evaluate("fetch('/api/auth/session',{cache:'no-store'}).then(r=>r.status)");
  assert(status === 401, "Logout did not revoke session");
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 50; attempt++) {
    try { ready = (await fetch("http://127.0.0.1:9225/json/version")).ok; if (ready) break; } catch { /* Poll readiness. */ }
    await pause(200);
  }
  assert(ready, "Isolated browser did not become ready");
  const main = await tab();
  await main.send("Network.clearBrowserCookies");
  await openLogin(main);
  assert(starts(main) === 0 && !await transaction(main), "Rendering login initiated authentication");
  await explicitLogin(main);
  assert(starts(main) === 1, "Explicit login did not initiate exactly one transaction");
  await completeLogin(main);
  report.normalSingleTab = "PASS";
  await logout(main);

  const beforeA = starts(main);
  await openLogin(main);
  assert(starts(main) === beforeA, "Login render started a transaction");
  const cookieA = await explicitLogin(main);
  const background = await tab();
  await main.send("Page.bringToFront");
  await openLogin(background);
  const afterBackground = await transaction(main);
  assert(starts(background) === 0, "Background login page invoked auth-start without a click");
  assert(afterBackground?.value === cookieA.value, "Background login replaced the original transaction");
  assert(starts(main) === beforeA + 1, "Original login has an unexpected auth-start request");
  await completeLogin(main);
  report.backgroundTab = { authStartRequests: starts(background), transactionAUnchanged: true, callbackA: "PASS" };
  await logout(main);

  await openLogin(main);
  await explicitLogin(main);
  const wrong = new URL(`${origin}/api/auth/callback`);
  wrong.searchParams.set("state", randomUUID());
  wrong.searchParams.set("code", randomUUID());
  wrong.searchParams.set("iss", seed.issuer);
  await main.send("Page.navigate", { url: wrong.href });
  await main.waitFor("location.pathname === '/login' && location.search.includes('login-failed') && document.readyState === 'complete'", "Mismatched state did not fail closed");
  assert(await main.evaluate("fetch('/api/auth/session',{cache:'no-store'}).then(r=>r.status)") === 401,
    "State mismatch created a session");
  report.stateMismatch = "REJECTED / no session";
  report.result = "PASS";
  await writeFile(path.join(output, "login-race-report.json"), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} catch (error) {
  console.error(`P5I login race regression failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  for (const page of tabs) page.socket.close();
  browser.kill();
}
