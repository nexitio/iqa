"use client";

import { Field, Input } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import type { AdminSocialProvider, ProviderInput } from "@/lib/social-client";

/**
 * The provider form: the client ID, and the client secret.
 *
 * That is the whole of what an admin supplies, because it is the whole of what
 * only an admin has. A provider's endpoints, transport quirks, scopes and claim
 * mapping are facts about Google and Facebook rather than decisions about this
 * deployment — they are seeded on the row and the form never sends them, so
 * saving credentials cannot disturb them.
 *
 * The one thing the form cannot tell you is the redirect URI to register, since
 * that follows from the slug and this deployment's origin: the console's
 * "verify" button hands you the exact string.
 */

/** The form's state: two inputs, one of which is write-only. */
export interface Draft {
  clientId: string;
  /** Blank means "leave the stored secret alone"; never the stored value. */
  clientSecret: string;
}

export function draftFrom(provider: AdminSocialProvider): Draft {
  return { clientId: provider.clientId, clientSecret: "" };
}

/**
 * `error` is a dictionary key rather than a finished sentence: this function has
 * no locale, and the console that shows the message does — so the wording stays
 * with the copy it belongs to.
 */
export type DraftResult = { ok: true; input: ProviderInput } | { ok: false; error: string };

/**
 * The draft as the API's input, or the one thing that has to be fixed first.
 *
 * Only the emptiness of the client ID is judged here — it is the one value a
 * save cannot do without, and the API re-checks everything it is handed anyway.
 */
export function draftToInput(draft: Draft): DraftResult {
  const clientId = draft.clientId.trim();
  if (!clientId) {
    return { ok: false, error: "admin.social.clientIdRequired" };
  }

  return {
    ok: true,
    input: {
      clientId,
      // Absent, not empty: the API reads a missing secret as "keep the stored one".
      ...(draft.clientSecret ? { clientSecret: draft.clientSecret } : {}),
    },
  };
}

export function ProviderForm({
  draft,
  onChange,
  idPrefix,
  disabled = false,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
  /** Unique per provider, so labels point at the right input on a list of forms. */
  idPrefix: string;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const id = (field: string) => `${idPrefix}-${field}`;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label="Client ID"
        htmlFor={id("client-id")}
        required
        hint={t("admin.social.clientIdHint")}
      >
        <Input
          id={id("client-id")}
          value={draft.clientId}
          disabled={disabled}
          autoComplete="off"
          onChange={(event) => onChange({ clientId: event.target.value })}
        />
      </Field>

      <Field
        label="Client secret"
        htmlFor={id("client-secret")}
        hint={t("admin.social.clientSecretHint")}
      >
        <Input
          id={id("client-secret")}
          type="password"
          value={draft.clientSecret}
          disabled={disabled}
          autoComplete="new-password"
          onChange={(event) => onChange({ clientSecret: event.target.value })}
          placeholder="••••••••"
        />
      </Field>
    </div>
  );
}
