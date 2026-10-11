# Ilm API

The backend for Ilm: **Hono** on Node with **Drizzle ORM** over PostgreSQL.

It runs as its own service (`server/`), separate from the Next.js app, and serves
the domain model the frontend already declares in [`src/lib/types.ts`](../src/lib/types.ts) —
that file was written to map 1:1 onto a backend schema, and this is that schema.

## Quick start

```bash
pnpm install                      # once, from the repo root (server/ is a workspace member)
pnpm server:db:setup              # create the database, migrate, seed from src/lib/data
pnpm server:dev                   # http://127.0.0.1:8787
```

`db:setup` is idempotent: it creates `ilm` only if missing, applies pending
migrations, and re-seeds (the seed truncates first, inside one transaction).

| Command | What it does |
| --- | --- |
| `pnpm server:dev` | `tsx watch` on `server/src/index.ts` |
| `pnpm server:typecheck` | `tsc --noEmit` for the server project |
| `pnpm server:db:setup` | create → migrate → seed |
| `pnpm server:db:migrate` | apply pending migrations only |
| `pnpm server:db:seed` | truncate and reload from `src/lib/data` |
| `pnpm server:smoke` | HTTP acceptance test against a running server (238 checks, incl. a real passkey ceremony and a real OAuth round trip) |
| `pnpm server:audit` | report unresolved ids in the mock dataset (no database needed) |

Configuration lives in `server/.env` (gitignored; see `.env.example`):
`DATABASE_URL`, `DATABASE_ADMIN_URL`, `ILM_API_PORT`, optionally `CORS_ORIGINS`,
plus `ILM_SEED_PASSWORD`, the session-cookie settings (`ILM_COOKIE_SAMESITE` /
`ILM_COOKIE_SECURE`), the second-factor delivery providers (`ILM_EMAIL_PROVIDER`,
`ILM_SMS_PROVIDER` and their keys) and the passkey relying party (`ILM_RP_ID`,
`ILM_RP_NAME`, `ILM_RP_ORIGINS`).

`server:smoke` needs a freshly seeded database: it registers an account, posts a
question and enrols second factors, so the seeded counts stop matching after a
run. `pnpm server:db:seed` between runs. It needs no email or SMS provider — the
`console` driver hands the code back in the response, and the suite reads it.

> The port variable is `ILM_API_PORT`, not `PORT`. Other tools in this workspace
> set `PORT` for their own servers, and a shared name meant the API silently bound
> to whatever they had chosen.

## Layout

```
server/
  src/
    index.ts            boot: check the database, listen, shut down cleanly
    app.ts              middleware, route mounting, 404/error envelopes
    context.ts          per-request db + identity, and the guards that read it
    env.ts              validated environment
    auth/
      password.ts       scrypt hashing and verification
      session.ts        session tokens, the cookie, lookup and revocation
      login.ts          the one place a session is handed out
      credentials.ts    the password policy, and verifying the current one
      device.ts        a coarse device label from a User-Agent
    mfa/
      service.ts        factors, code challenges, pending logins, recovery codes
      webauthn.ts       the relying party, and the passkey ceremonies
      delivery.ts       console / Resend / Twilio code delivery
    social/
      providers.ts      provider config: read, validated, secret never returned
      oauth.ts          the whole OAuth flow, with no provider names in it
      service.ts        state, identity resolution, linking and unlinking
      crypto.ts         AES-256-GCM for stored client secrets
    users/defaults.ts   what a new account is filled in with
    db/
      schema/           the schema, one module per domain
      index.ts          pool + Drizzle client
      relations.ts      batched join loaders (one query per page, not per row)
    http/               query parsing, body reading, rate limiting, error types
    present/dto.ts      rows → src/lib/types.ts shapes
    routes/             one module per domain
  scripts/              create-database, migrate, seed, smoke, audit, row-counts
  drizzle/              generated SQL migrations (commit these)
```

## Endpoints

All routes are under `/api/v1`. Small fixed collections come back as
`{ data: [...] }`; content collections are paginated:

```json
{ "data": [], "page": 1, "limit": 20, "total": 0, "totalPages": 1 }
```

| Area | Routes |
| --- | --- |
| Auth | `POST /auth/register`, `/auth/login`, `/auth/logout`, `GET /auth/session` |
| Second factor (sign-in) | `POST /auth/mfa/challenge`, `/auth/mfa/verify`, `/auth/mfa/passkey/options`, `/auth/mfa/passkey/verify`, `/auth/mfa/recovery` |
| Passkey sign-in | `POST /auth/passkey/options`, `/auth/passkey/verify` |
| Second factor (account) | `GET /me/mfa`, `POST /me/mfa/{email,sms,passkey}/{start,confirm}`, `DELETE /me/mfa/:id`, `POST /me/mfa/recovery-codes` |
| Account security | `POST /me/password`, `GET /me/sessions`, `DELETE /me/sessions/:id`, `DELETE /me/sessions` |
| Social sign-in | `GET /auth/social/providers`, `/auth/social/:slug/start`, `/auth/social/:slug/callback`, `/auth/social/:slug/link` |
| Connected accounts | `GET /me/identities`, `DELETE /me/identities/:id` |
| Social config (admin) | `GET|POST /admin/social-providers`, `GET|PATCH|DELETE /admin/social-providers/:id`, `POST /admin/social-providers/:id/inspect` |
| Health | `GET /health`, `GET /status` |
| Taxonomy | `GET /departments`, `/departments/:slug`, `/topics`, `/topics/:slug`, `/districts` |
| Qur'an | `GET /quran/surahs`, `/quran/surahs/:numberOrSlug`, `/quran/ayahs?surah=&from=&to=`, `/quran/ayahs?ref=2:255`, `/quran/search?q=` |
| Hadith | `GET /hadith/collections`, `/hadith/collections/:slug`, `/hadith/hadiths?collection=&book=&grade=&topic=&q=`, `/hadith/hadiths/:id`, `/hadith/:collection/:number` |
| Duas | `GET /duas`, `/duas?category=&q=`, `/duas/:slug`, `/duas/categories` |
| Daily | `GET /daily` — the curated ayah/hadith rotation, dhikr and focus themes |
| Articles | `GET /articles?status=&department=&topic=&author=&q=&sort=recent\|popular`, `/articles/:slug` |
| Fatwas | `GET /fatwas?status=&fiqh=&pinned=&department=&mufti=&q=`, `/fatwas/:slug` |
| Citations | `GET /references?kind=&q=`, `/references/:id` |
| Q&A | `GET /questions?status=&urgency=&department=&topic=&asker=&answeredBy=&q=`, `/questions/:slug`, `GET /answers?scholar=&question=`, `POST /questions`, `POST /questions/:slug/answers` |
| Community | `GET /discussions?department=&topic=&author=&moderation=&q=`, `/discussions/:slug`, `POST /discussions/:slug/replies` |
| Scholars | `GET /scholars?department=&district=&available=&verified=&q=`, `/scholars/:slug` (profile + biography + work) |
| People | `GET /users/:id`, `/feed`, `/search?q=` |
| Personal (`/me`) | `GET /me`, `/me/bookmarks`, `/me/bookmark-collections`, `/me/progress`, `/me/notifications`, `/me/learning`, `/me/contributions`, `POST /me/bookmarks`, `DELETE /me/bookmarks/:id`, `GET /journeys`, `/journeys/:slug` |
| Admin | `GET /admin/overview`, `/admin/users`, `/admin/reports`, `/admin/review`, `/admin/activity`, `/admin/applications`, `/scholar/:id/dashboard` |

### Topic and department filters

`?department=` takes a department id or slug. `?topic=` resolves a topic by id or
slug and matches the authored `topic_ids` tags — strictly, by default.

The dataset tags content with a *mix* of topic slugs and department slugs, which
is why the topic pages need a second tier. Pass `?includeRelated=true` to add
department overlap, reproducing the two-tier rule the frontend uses in
`src/app/(app)/topics/[slug]/page.tsx`. `GET /topics/:slug` returns the
`tagKeys` and `departmentSlugs` a client needs to make either call.

## Authentication

Email and password, hashed with scrypt, carried in a session cookie.

```bash
# create an account — 201, and it signs you in
curl -i -X POST http://127.0.0.1:8787/api/v1/auth/register \
  -H 'content-type: application/json' \
  -d '{"name":"Abdullah","email":"me@example.com","password":"a-long-password","district":"dhaka"}'

# sign in, keeping the cookie
curl -i -c cookie.txt -X POST http://127.0.0.1:8787/api/v1/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"me@example.com","password":"a-long-password"}'

curl -b cookie.txt http://127.0.0.1:8787/api/v1/me
```

| Route | What it does |
| --- | --- |
| `POST /auth/register` | Creates a `user` account and signs it in. 409 on a taken address. |
| `POST /auth/login` | Verifies the password and issues a session. |
| `POST /auth/logout` | Revokes the session and clears the cookie. Idempotent. |
| `GET /auth/session` | The signed-in account, or `null` — 200 either way. |

**How a request proves who it is.** The `ilm_session` cookie holds a 32-byte
random token; the database stores only its SHA-256, so a dump of `sessions`
cannot be replayed against the API. `app.ts` resolves it once per request into
`identity`, and `requireIdentity` / `requireRole` in `context.ts` are the entire
surface a handler sees — no route module knows how a caller was authenticated.

**Every seeded account** signs in with the password in `ILM_SEED_PASSWORD`
(default `ilm-dev-password`), for example `abdullah.almamun@gmail.com` (reader),
`abdur.rahman@ilm.bd` (scholar) and `mahbub.alam@ilm.bd` (admin).

Decisions worth knowing:

1. **Credentials are their own table.** `auth_credentials` is separate from
   `users` so the dozen DTO mappers that run `select().from(users)` cannot pull a
   hash into a response — there is no column to forget to strip.
2. **scrypt from `node:crypto`.** Memory-hard, no native build step, and the
   parameters live inside the digest, so raising the cost later verifies old
   hashes against the parameters they were made with instead of locking those
   accounts out.
3. **No account enumeration.** A wrong password and an unknown address both
   answer `401 Email or password is incorrect`, and an unknown address still pays
   for a password verification, so response time does not reveal which addresses
   exist.
4. **No privilege from the client.** Registration always creates a `user`; a
   `role` in the request body is ignored, not validated.
5. **The cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` in production.**
   State-changing requests are additionally checked against the CORS allowlist,
   so a cross-site write is refused rather than merely failing the cookie check.
6. **Sessions follow the account.** Role and status come from `users` on every
   request, so suspending an account takes effect on the next request, and
   deleting it cascades its sessions away.

## Social sign-in

Facebook and Google, with **provider configuration in the database, administered
rather than deployed**. The seed creates both rows, disabled, with placeholder
credentials; nothing works until an admin pastes in real ones and enables them.

```bash
# what a sign-in page should draw — a slug and a label, nothing else
curl -s localhost:8787/api/v1/auth/social/providers
# -> { "data": [ { "slug": "google", "name": { "bn": "গুগল", "en": "Google" } } ] }

# sign in: this redirects to the provider, which redirects back to /callback
open "localhost:8787/api/v1/auth/social/google/start?returnTo=/settings"
```

### Why adding a provider is a form, not a deployment

Every disagreement between the two providers is a column, so nothing in the flow
names either of them:

| Column | Facebook | Google |
| --- | --- | --- |
| `tokenMethod` | `get` — code exchanged with a query string | `post` — a form-encoded body |
| `userinfoAuth` | `query` — `?access_token=` | `bearer` |
| `userinfoParams` | `{"fields":"id,name,email,picture"}` — Graph returns only what you ask for | `{}` |
| `sendAppSecretProof` | `true` — HMAC of the token, keyed with the secret | `false` |
| `claims.subject` | `id` | `sub` |
| `claims.picture` | `picture.data.url` — hence dotted paths | `picture` |
| `claims.emailVerified` | `null` — Meta documents no such claim | `email_verified` |
| `extraAuthorizeParams` | `{}` | `{"prompt":"select_account"}` |

The `sub`/`id` distinction matters and is why the subject is the account key: a
Google `sub` is stable even if the address changes, so a changed email never moves
an account.

### Administering it

Every route needs an admin. `POST /admin/social-providers` creates one;
`PATCH` updates it; omitting `clientSecret` leaves the stored one alone, so a scope
can be edited without handling the secret again.

**The client secret only travels inward.** It is encrypted with AES-256-GCM under
`ILM_SECRET_KEY` (`src/social/crypto.ts`) because a client secret can impersonate
the app to the provider; the API reports `hasClientSecret` and can never read one
back. `POST /admin/social-providers/:id/inspect` returns the exact redirect URI to
register and the exact authorization URL a sign-in will open — and its success is
also the proof that the stored secret still decrypts, which distinguishes "your
configuration is wrong" from "this deployment's key changed". Endpoints must be
https: http is accepted only on loopback, where a test stub lives.

### What happens on the way back

The rules are ordered, because this is where an account can be taken over:

1. **A known identity wins.** `(provider, subject)` identifies the account.
2. **An unknown identity may attach to an existing account only when the provider
   says the email is confirmed.** That is what stops someone pointing a Facebook
   account at a stranger's address and inheriting their account — and because Meta
   documents no such claim, a Facebook sign-in whose address is already in use is
   refused with instructions to link it from account settings instead.
3. **Otherwise an account is created**, which needs an address: the column is
   required and unique. A provider that shares none (a Facebook user may decline
   the `email` permission) is refused rather than given a placeholder.

The round trip remembers what it was for. `state` is generated per attempt, stored
hashed, single-use and short-lived; it is what binds the callback to an attempt we
began, and it is also where a *link* carries the account it will attach to — so no
user id ever travels through the provider. `returnTo` is accepted only as a
relative path, because an absolute URL there would make the sign-in page an open
redirect.

Linking from a signed-in session is deliberate consent, so it is the one path that
accepts an unconfirmed address. Unlinking requires the account password when the
account has one, and is **refused outright** if the identity is the last way in.

### Verified, and what is not

`pnpm server:smoke` runs a complete OAuth round trip against a stub identity
provider it starts in-process — authorization, code exchange, token, userinfo,
claim mapping, account creation, the returning sign-in, the browser redirect, a
replayed state, a forged state, a cancelled consent, both linking rules, and
unlinking. Because the flow reads its configuration from the database, the same
code path a Google sign-in would take is the one being tested.

What that cannot establish is Meta's or Google's own behaviour. A live sign-in
needs real credentials, and the seeded rows are placeholders until then.

## Account security

### Changing a password

```bash
curl -s -X POST localhost:8787/api/v1/me/password \
  -H "cookie: $SESSION" -H 'content-type: application/json' \
  -d '{"currentPassword":"…","newPassword":"…"}'
# -> { "data": { "updated": true, "otherSessionsRevoked": 3 } }
```

The current password is required, the policy is the one registration uses, and
reusing the current password is refused — a "change" that changes nothing keeps a
leaked password alive while looking handled. On success **every other session is
ended** while the device that made the change stays signed in: the caller just
proved it knows the old password, so it has earned the new one.

### Active devices

```json
{ "data": [ { "id": "sess-9f2c…", "device": "Chrome · উইন্ডোজ", "current": true,
              "userAgent": "Mozilla/5.0 …", "createdAt": "…", "lastSeenAt": "…", "expiresAt": "…" } ] }
```

`GET /me/sessions` lists the live sessions on the account, the caller's own first,
newest activity after that, expired ones filtered out. `DELETE /me/sessions/:id`
ends one; `DELETE /me/sessions` ends all of them **except** the one that asked and
reports how many went.

Three decisions shape this:

1. **The id is not the token.** A session's primary key is a random `sess-…` value,
   and the token's SHA-256 is a separate unique column. Nothing that leaves the
   server is a step towards recreating a credential, so a device list can be shown
   and logged without that trade-off. (The smoke suite asserts the token never
   appears in a response.)
2. **The device in use cannot be revoked through the list.** It is a `400` pointing
   at `POST /auth/logout`, because revoking it would leave the browser holding a
   cookie for a session that no longer exists — signed out with no explanation.
3. **Sessions are found by owning them, never by the id alone.** Revoking another
   account's session is a `404`, not a `403`: the difference would confirm that the
   id exists.

`device` is a **heuristic**, not an identification — the User-Agent is
self-reported and trivially forged. It exists so a screen does not have to render
120 characters of `Mozilla/5.0`, and the raw `userAgent` is returned alongside it
for a client that wants its own parsing. There is deliberately **no IP or
location**: an address taken from a forwarding header is only as trustworthy as
the proxy in front of the API, and showing one as fact on a security screen is
worse than showing nothing.

## Two-factor authentication

Three channels: **passkeys** (WebAuthn), **email** codes and **SMS** codes. An
account can hold any number of them, and recovery codes exist so that losing a
device is not the same as losing the account.

**A password only starts the sign-in.** Once an account has a verified factor,
`POST /auth/login` answers with a five-minute pending token instead of a cookie:

```json
{ "data": { "mfaRequired": true, "pendingToken": "…", "expiresAt": "…",
            "factors": [{ "id": "mfa-…", "kind": "email", "destination": "re****@example.com" }],
            "recoveryCodesRemaining": 10 } }
```

A pending token is **not** an identity: only `/auth/mfa/*` accepts it, and only to
finish a ceremony. Presented as a session cookie it reaches nothing.

```bash
# send a code to the enrolled number, then finish the sign-in
curl -s -X POST localhost:8787/api/v1/auth/mfa/challenge \
  -H 'content-type: application/json' -d '{"pendingToken":"…","kind":"sms"}'
curl -i -X POST localhost:8787/api/v1/auth/mfa/verify -H 'content-type: application/json' \
  -d '{"pendingToken":"…","challengeId":"…","code":"123456"}'
```

| Step | Email / SMS | Passkey |
| --- | --- | --- |
| 1 | `POST /auth/mfa/challenge` — a code is sent | `POST /auth/mfa/passkey/options` — creation options |
| 2 | `POST /auth/mfa/verify` with the code | `POST /auth/mfa/passkey/verify` with the assertion |
| lost device | `POST /auth/mfa/recovery` with a recovery code | — |

Enrolment and removal live under `/me/mfa`, and **every one of them re-asks for
the account password** — a session alone is not enough, because otherwise anyone
holding a stolen cookie could add a factor of their own and keep the account.

```bash
# enrol an email factor (the confirm call returns the recovery codes once)
curl -s -X POST localhost:8787/api/v1/me/mfa/email/start \
  -H "cookie: $SESSION" -H 'content-type: application/json' \
  -d '{"password":"…","email":"me@example.com"}'
curl -s -X POST localhost:8787/api/v1/me/mfa/email/confirm \
  -H "cookie: $SESSION" -H 'content-type: application/json' \
  -d '{"challengeId":"…","code":"123456"}'
```

### Signing in with a passkey alone

`POST /auth/passkey/options` is the one credential route that asks for nothing:
no cookie, no pending token, no email. It exists so a returning reader can be
signed in from the browser's own autofill — conditional UI — where nothing has
been typed yet. The challenge it returns belongs to no account, and the empty
allow list is what lets the browser offer whichever passkey it holds for this
site; the account is settled only at `POST /auth/passkey/verify`, when the
assertion names a credential. That route issues the same session every other way
in issues.

```bash
# what the sign-in page's autofill asks for, and what it answers with
curl -s -X POST localhost:8787/api/v1/auth/passkey/options
curl -s -X POST localhost:8787/api/v1/auth/passkey/verify \
  -H 'content-type: application/json' -d '{"challengeId":"…","response":{…}}'
```

An unattributed challenge is single-use and only verifies against a private key
the caller would have to hold, so it can authorise nothing but the account its own
assertion proves.

### Delivery

| Provider | Driver | Credentials |
| --- | --- | --- |
| `console` (default) | writes the code to the server log | none |
| `resend` | Resend email API | `RESEND_API_KEY`, `ILM_MAIL_FROM` |
| `twilio` | Twilio Messages API | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` |

`console` sends nothing, so the code comes back in the response as `devCode` —
otherwise nothing could be tested locally. That is read **off the deliverer, not
off a flag**: a response carries a code only when the channel provably did not
send one. `NODE_ENV=production` refuses to boot with `console` selected.

Numbers are normalised to a single E.164 form, so `01712345678`, `+8801712345678`
and `8801712345678` enrol one factor rather than three.

### What protects a code

- **One live code per purpose and channel.** Asking for a new code burns the old
  one, so N outstanding codes never means N valid codes.
- **Five guesses per challenge**, counted on the row; the sixth attempt is a 429.
  A six-digit space cannot be walked.
- **Single use.** Verification consumes the challenge, so a captured request
  cannot be replayed.
- **Hashed at rest** with the same scrypt as a password, so the table holds
  nothing that verifies.
- **Masked in every response.** The owner does not need their own address echoed
  back, and nobody else may see it.

### Passkeys

`ILM_RP_ID` is the domain a passkey is bound to, **permanently** — changing it
invalidates every enrolled passkey. `ILM_RP_ORIGINS` must list every origin the
browser runs on, and the server checks it on every ceremony: without that check a
passkey registered here could be asserted from someone else's page. The signature
counter is stored and must never go backwards, which is how a cloned
authenticator is caught.

`pnpm server:smoke` builds a real ES256 authenticator in-process and runs both
ceremonies against the running server, so the passkey path is verified rather
than assumed.

## Data model notes

The schema mirrors `src/lib/types.ts`, with four decisions worth knowing:

1. **Bilingual fields are `jsonb`.** Almost every human-readable field is a
   `Localized` object, not a string, so storing it as JSON means the API returns
   exactly the declared shape — no `name_bn`/`name_en` columns, no mapping drift.
2. **Topic tags are data, not foreign keys.** `topic_ids` is a `text[]` holding
   what the author wrote (sometimes a topic slug, sometimes, for hadiths, a
   department id). Normalising it would require inventing links the dataset does
   not support. See `pnpm server:audit`.
3. **Citations are snapshots.** `content_references.ref` is deliberately *not* a
   foreign key to `quran_ayahs`/`hadiths`: the pool cites passages outside the
   local corpus (সহীহ বুখারী ৫২৫১ and other works) and renders from its own
   snapshot. The article/fatwa→citation links *are* real, materialised at seed
   time by the frontend's own `citedReferences`.
4. **Personal rows are scoped to a user.** The mock dataset is single-user, so
   `bookmarks`, `reading_progress` and `notifications` had no owner field; here
   each carries `user_id` and the routes never take a user id from the client.

## Known gaps

- **Rate limiting is in-process.** `http/rate-limit.ts` keeps its counters in
  memory: sign-in is capped per address (8 per 15 minutes) and sign-up per caller
  (20 per hour). Several instances would each hold their own window, so this
  needs shared state before the API runs more than one process.
- **No password reset or email verification.** A reader who has forgotten their
  password cannot recover the account yet; only a signed-in reader can change one,
  and only an admin can act on a lost address.
- **Changing a password does not ask for a second factor.** With 2FA on, knowing
  the current password is enough to replace it — a step-up challenge is the
  obvious next hardening.
- **A revoked device is signed out on its next request, not instantly.** The
  session row is gone, so the cookie stops working immediately; there is no push
  channel to tell another open tab to drop its state.
- **Second factors are not yet in the browser.** The API is complete and tested;
  the Next app is not wired to it at all, so nothing calls
  `navigator.credentials.create` yet. `@simplewebauthn/browser` is the missing half.
- **Neither social provider has been used for real.** Both rows are seeded with
  placeholder credentials, so the flow is verified against a stub rather than
  against Meta or Google. Registering the redirect URIs and pasting real
  credentials is the remaining step, not more code.
- **An account created by a provider cannot set a password.** It has none, and
  `POST /me/password` requires the current one — so a "set a password" route is
  missing for accounts that only ever signed in socially. Until then such an
  account is reachable only through its provider (and by a recovery path an admin
  arranges).
- **Changing `ILM_SECRET_KEY` invalidates every stored provider secret.** They are
  not recoverable; each provider has to be re-entered in the console.
- **No token storage.** Access tokens are used for one profile read and dropped;
  nothing keeps a refresh token, so no provider API is callable after sign-in.
- **No "remember this device".** A code is required on every sign-in, which is
  correct but not yet kind to a reader on their own phone.
- **A phone number exists only as a factor.** `users` has no phone column, so
  nothing else in the product can read a verified number — deliberately, until
  something needs it.
- **A wrong recovery code costs ten scrypt verifications** (~600 ms), because
  every unused code is hashed. That is wasteful, and it is also why brute-forcing
  the list is unattractive.
- **A cross-site frontend needs a cookie change.** The API and the Next app are
  the same site in development. A frontend on a different site needs
  `ILM_COOKIE_SAMESITE=none` with `ILM_COOKIE_SECURE=true` and
  `credentials: "include"` on its fetches; the pairing is enforced at boot.
- **Admin trend metrics are empty.** `activeToday`, `quranReads7d`,
  `dailyActiveTrend`, `questionsTrend`, `topDepartments`, `districtBreakdown`
  (and a scholar's `avgResponseHours`, `helpfulRate`, `totalViews`, `streakDays`)
  need per-event rows that nothing writes yet. `/admin/overview` returns zeros
  and lists them under `unavailable` rather than showing invented numbers.
- **Partial corpus.** The seeded Qur'an and hadith sets are the curated subset in
  `src/lib/data` (40 surahs / 67 ayahs / 30 ahadith). Anything outside it has no
  page, which the citation panels already state to the reader.
- **Six scholars have no email** in the dataset; they are seeded with
  `@seed.invalid` addresses so the placeholder is unmistakable.
- **No write path for authored content.** Articles and fatwas are read-only here;
  the composer still writes to the frontend mock.
