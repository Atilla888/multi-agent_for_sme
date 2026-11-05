# WhatsApp demo: customer writes on WhatsApp, the Claude agent answers

This guide takes you from nothing to a working demo where a message sent from your own phone to a WhatsApp test number is answered by the Sales or Support agent, and the conversation shows up in the staff Inbox.

Everything runs on your laptop with Docker. The only external pieces are Meta's free WhatsApp test number and the Anthropic API.

## What you will need

| Item | Where to get it | Cost |
| --- | --- | --- |
| Meta developer account and app | developers.facebook.com | Free |
| WhatsApp test number and a permanent token | Inside the Meta app, WhatsApp › API setup | Free (test number can message up to 5 verified phones) |
| Anthropic API key | console.anthropic.com | Pay per use; a demo costs cents |
| A public HTTPS URL for the webhook | `ngrok http 8000` (free account) | Free |
| Docker Desktop | docker.com | Free |

## 1. Meta side (about 20 minutes)

1. Go to developers.facebook.com, create an app, choose **Business** as the type, and add the **WhatsApp** product.
2. Open **WhatsApp › API setup**. You will see a **test phone number** and its **Phone number ID**. Copy the Phone number ID.
3. Under **To**, add your own mobile number and confirm the code WhatsApp sends you. Only numbers added here can message the test number.
4. Open **App settings › Basic** and copy the **App secret**. The backend uses it to check that every webhook really comes from Meta.
5. Create a permanent access token: **Business settings › Users › System users**, add a system user with the Admin role, assign the app to it with full control, then **Generate new token** with the `whatsapp_business_messaging` and `whatsapp_business_management` permissions. Copy the token. (The temporary token shown on the API setup page also works, but it expires after 24 hours.)

Keep the webhook step for later; the backend has to be running first.

## 2. Local configuration

In `platform/`, copy `.env.example` to `.env` if you have not already and replace every `CHANGE_ME` value. The new entries for this demo:

```dotenv
DEV_LLM_PROVIDER=claude
DEV_LLM_MODEL=claude-opus-5-5
ANTHROPIC_API_KEY=sk-ant-...

WHATSAPP_VERIFY_TOKEN=any-long-random-string-you-choose
WHATSAPP_APP_SECRET=<App secret from step 1.4>
WHATSAPP_ACCESS_TOKEN=<token from step 1.5>
WHATSAPP_PHONE_NUMBER_ID=<Phone number ID from step 1.2>
WHATSAPP_BUSINESS_ID=00000000-0000-4000-8000-000000000001
TOOL_CURSOR_SIGNING_KEY=<32 random characters>
```

`WHATSAPP_BUSINESS_ID` is the tenant that owns the number. Any UUID works; the seed step creates the business for it.

The P5I transport settings (`OIDC_*`, `KEYCLOAK_PUBLIC_ORIGIN`, `HTTP_CORS_ORIGINS`) must also be filled in, because the backend validates them at start. If you do not plan to show the staff Inbox, the Keycloak realm itself does not have to exist yet.

## 3. Start the stack and seed the demo shop

```bash
cd platform
docker compose -f infra/compose/compose.yaml -f infra/compose/compose.p5i.yaml -f infra/compose/compose.demo.yaml --env-file .env up -d --wait
docker compose -f infra/compose/compose.yaml -f infra/compose/compose.p5i.yaml -f infra/compose/compose.demo.yaml --env-file .env --profile demo run --rm demo-seed
```

The seed creates the business "North Shop" with three products (Desk Lamp, Work Chair, Wall Shelf), stock levels, and the WhatsApp integration row for your Phone number ID. It is safe to run again.

Check the backend is up: `curl http://127.0.0.1:8000/health/ready` should return `{"status":"ready",...}`.

## 4. Expose the webhook and register it with Meta

```bash
ngrok http 8000
```

Copy the `https://....ngrok-free.app` URL. In the Meta app, open **WhatsApp › Configuration › Webhook**:

- Callback URL: `https://<your-ngrok-host>/webhooks/whatsapp`
- Verify token: the exact `WHATSAPP_VERIFY_TOKEN` from your `.env`
- Click **Verify and save**. The backend answers Meta's challenge; if it fails, check the token and that ngrok points at port 8000.
- Under **Webhook fields**, subscribe to **messages**.

## 5. Try it

From the phone you verified in step 1.3, send a message to the test number, for example:

- "Hi! Do you have a desk lamp in stock?" → the Sales agent looks up the catalog and stock, then answers.
- "I'd like to order one desk lamp" → the agent prepares the order and asks you to reply **YES** before anything is written. Reply "yes" and the order is created and stock reserved.
- "Where is my order?" → routed to the Support agent.
- Anything the agent cannot settle with verified facts is handed to a person: you get a polite "our team will get back to you" message and the conversation is marked **Needs a person** in the Inbox.

Watch the backend log while you chat: `docker compose ... logs -f backend`.

## 6. Show it in the staff Inbox (optional)

The Inbox at `/conversations` in the frontend reads live conversations when a staff member is signed in. That needs a Keycloak realm, client and user, and the frontend `.env.local`. If you only want to demo the WhatsApp side, skip this step.

1. Create an isolated demo realm with a staff user. The script refuses realm names that do not start with `p5i-engineering-` and writes the generated password to the output file only:

   ```bash
   cd platform
   mkdir -p /tmp/p5i-private && chmod 700 /tmp/p5i-private
   docker compose -f infra/compose/compose.yaml -f infra/compose/compose.p5i.yaml -f infra/compose/compose.demo.yaml --env-file .env \
     --profile test run --rm --no-deps -e PYTHONPATH=/workspace \
     -e P5I_REALM=p5i-engineering-demo -e KEYCLOAK_PUBLIC_ORIGIN=http://127.0.0.1:8080 \
     -e P5I_APP_ORIGIN=http://127.0.0.1:3000 -e P5I_SMOKE_OUTPUT=/private-out/p5i.json \
     -v /tmp/p5i-private:/private-out db-tests python tests/p5i/provision_local.py
   ```

   `/tmp/p5i-private/p5i.json` now holds `username`, `password` and `issuer`. Never commit it.

2. Point the backend at that realm in `platform/.env` and restart it:

   ```dotenv
   OIDC_ISSUER=http://127.0.0.1:8080/realms/p5i-engineering-demo
   OIDC_JWKS_TRANSPORT_URL=http://keycloak:8080/realms/p5i-engineering-demo/protocol/openid-connect/certs
   ```

   ```bash
   docker compose -f infra/compose/compose.yaml -f infra/compose/compose.p5i.yaml -f infra/compose/compose.demo.yaml --env-file .env up -d --wait backend
   ```

3. Make the staff user an owner of North Shop by re-running the seed with the user's issuer and Keycloak subject id (the subject is the `id` of the user in Keycloak admin, or `SELECT subject FROM app_users` in Postgres):

   ```bash
   docker compose ... --profile demo run --rm --no-deps \
     -e DEMO_STAFF_ISSUER=http://127.0.0.1:8080/realms/p5i-engineering-demo \
     -e DEMO_STAFF_SUBJECT=<keycloak user id> demo-seed
   ```

4. Create `frontend/.env.local` from `.env.example` with `OIDC_ISSUER` set to the realm above, `OIDC_CLIENT_ID=diploma-frontend`, `APP_BUSINESS_ID` equal to `WHATSAPP_BUSINESS_ID`, and `P5I_ENABLE_FIXTURE_REVIEW=true` if you also want the sample screens. Then `cd frontend && npm run dev` and open http://127.0.0.1:3000/login. Sign in with the username and password from step 1.

Once signed in, every WhatsApp conversation appears in the Inbox with the customer's name, the last message, which agent handled it, and whether it needs a person. Use the **Needs a person** filter to show escalations. Append `?mode=fixture` to any staff page to see the sample-data version of that screen.

## How it works, in one paragraph

Meta posts every inbound message to `POST /webhooks/whatsapp`. The backend checks the HMAC signature with the app secret, returns 200 immediately, and processes the message in the background: it finds or creates the customer and conversation, stores the message, creates an agent run, and asks the Sales or Support specialist for a decision. The specialist talks to Claude, which can only propose tool calls (find product, check stock, create order, reserve stock); the trusted executor runs them under the customer's own permissions, and writes need an explicit YES from the customer. The reply is stored and sent back through the WhatsApp Cloud API, and delivery receipts update its status. Nothing in the model's text can change prices, stock, or permissions.

## Troubleshooting

- **Meta says the callback URL could not be validated**: the verify token differs, ngrok is not running, or the backend is not configured (it returns 503 until all `WHATSAPP_*` values are set).
- **Messages arrive but no reply**: look at `logs -f backend`. A 401 from Anthropic means the API key is wrong; "Model service is unavailable" in the reply means the model call failed and the conversation was escalated.
- **"Not connected" reply from WhatsApp itself**: your phone is not in the test number's allowed list, or the 24-hour window since your last message closed. Send a new message first.
- **Duplicate webhooks**: Meta retries when a response is slow. The backend de-duplicates by WhatsApp message id, so a retry never runs the agent twice.
