/**
 * Sending a second-factor code.
 *
 * One interface, three drivers — `console` for a laptop, Resend for email and
 * Twilio for SMS. The rest of the API asks for a channel and never learns which
 * provider answered, so adding Vonage or MailerSend later is one function here.
 *
 * `local` is the interesting property: a console deliverer does not send
 * anything, so the code has to come back in the API response or the person can
 * never sign in. The routes use it to decide whether to include the code — which
 * means the code is only ever exposed by a channel that is provably not
 * delivering. There is no flag to forget to unset.
 */

import { env } from "../env.ts";

export type MfaChannel = "email" | "sms";

export interface CodeMessage {
  /** The address or number the code goes to. */
  to: string;
  code: string;
  /** Login proves an existing account; enroll confirms a new address. */
  purpose: "login" | "enroll";
  minutes: number;
}

export interface Deliverer {
  readonly provider: string;
  /** True when nothing was sent, and the code must be returned to the caller. */
  readonly local: boolean;
  send(message: CodeMessage): Promise<void>;
}

function subjectFor(message: CodeMessage): string {
  return message.purpose === "login"
    ? "ইলম — সাইন-ইনের কোড / Your Ilm sign-in code"
    : "ইলম — যোগাযোগের মাধ্যম নিশ্চিত করুন / Confirm your Ilm contact method";
}

function textFor(message: CodeMessage): string {
  const heading =
    message.purpose === "login"
      ? "আপনার ইলম অ্যাকাউন্টে সাইন-ইন করার কোড:"
      : "আপনার ইলম অ্যাকাউন্টে এই যোগাযোগের মাধ্যম যুক্ত করার কোড:";

  return [
    heading,
    "",
    `    ${message.code}`,
    "",
    `কোডটি ${message.minutes} মিনিটের জন্য বৈধ। এই কোড কাউকে দেবেন না — ইলমের কেউ কখনো এটি চাইবে না।`,
    "",
    "— ইলম",
  ].join("\n");
}

function htmlFor(message: CodeMessage): string {
  const heading =
    message.purpose === "login"
      ? "আপনার ইলম অ্যাকাউন্টে সাইন-ইন করার কোড"
      : "আপনার ইলম অ্যাকাউন্টে এই যোগাযোগের মাধ্যম যুক্ত করার কোড";

  return [
    `<div style="font-family:system-ui,sans-serif;line-height:1.6">`,
    `<p>${heading}:</p>`,
    `<p style="font-size:28px;font-weight:700;letter-spacing:4px">${message.code}</p>`,
    `<p>কোডটি ${message.minutes} মিনিটের জন্য বৈধ। এই কোড কাউকে দেবেন না।</p>`,
    `<p>— ইলম</p>`,
    `</div>`,
  ].join("");
}

/**
 * ASCII on purpose: Bangla in an SMS forces UCS-2 encoding, which halves how
 * much fits in one segment and can double what the message costs to deliver.
 */
function smsTextFor(message: CodeMessage): string {
  return `Ilm verification code: ${message.code}. Valid for ${message.minutes} minutes. Never share it.`;
}

function consoleDeliverer(channel: MfaChannel): Deliverer {
  return {
    provider: "console",
    local: true,
    async send(message) {
      console.log(
        `[ilm] ${channel} code for ${message.to}: ${message.code} ` +
          `(${message.purpose}, valid ${message.minutes} minute(s)) — not sent, no provider configured`,
      );
    },
  };
}

function resendDeliverer(): Deliverer {
  return {
    provider: "resend",
    local: false,
    async send(message) {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${env.resendApiKey ?? ""}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: env.mailFrom,
          to: [message.to],
          subject: subjectFor(message),
          text: textFor(message),
          html: htmlFor(message),
        }),
      });

      if (!response.ok) {
        // The code is deliberately absent from the log line.
        const detail = await response.text();
        throw new Error(`Resend refused the message (${response.status}): ${detail.slice(0, 300)}`);
      }
    },
  };
}

function twilioDeliverer(): Deliverer {
  return {
    provider: "twilio",
    local: false,
    async send(message) {
      const accountSid = env.twilio.accountSid ?? "";
      const body = new URLSearchParams({
        To: message.to,
        From: env.twilio.phoneNumber ?? "",
        Body: smsTextFor(message),
      });

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`,
        {
          method: "POST",
          headers: {
            authorization: `Basic ${Buffer.from(`${accountSid}:${env.twilio.authToken ?? ""}`).toString("base64")}`,
            "content-type": "application/x-www-form-urlencoded",
          },
          body,
        },
      );

      if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Twilio refused the message (${response.status}): ${detail.slice(0, 300)}`);
      }
    },
  };
}

const cache = new Map<MfaChannel, Deliverer>();

/** The deliverer configured for a channel, built once per process. */
export function delivererFor(channel: MfaChannel): Deliverer {
  const existing = cache.get(channel);
  if (existing) return existing;

  const deliverer =
    channel === "email"
      ? env.emailProvider === "resend"
        ? resendDeliverer()
        : consoleDeliverer("email")
      : env.smsProvider === "twilio"
        ? twilioDeliverer()
        : consoleDeliverer("sms");

  cache.set(channel, deliverer);
  return deliverer;
}
