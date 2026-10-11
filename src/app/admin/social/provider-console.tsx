"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Check,
  Copy,
  ExternalLink,
  KeyRound,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { providerMark } from "@/components/auth/social-buttons";
import {
  Badge,
  Button,
  Callout,
  Card,
  CardFooter,
  CardHeader,
  SkeletonList,
  StatusBadge,
  Switch,
} from "@/components/ui";
import { relativeTime } from "@/lib/utils";
import {
  deleteSocialProvider,
  inspectSocialProvider,
  listSocialProviders,
  updateSocialProvider,
  type AdminSocialProvider,
  type ProviderInspection,
} from "@/lib/social-client";
import type { AuthResult } from "@/lib/auth-client";
import { ProviderForm, draftFrom, draftToInput, type Draft } from "./provider-form";

/**
 * The social provider console.
 *
 * This screen is the feature's control panel, and it is the whole of it: a
 * provider is a database row, so configuring Google or Facebook means editing
 * this form rather than deploying a change. Two consequences shape the UI:
 *
 *  - **The secret only travels inward.** A stored secret is never sent to the
 *    browser, so the field starts blank and means "leave it alone"; the row shows
 *    whether one is stored, and that is all anyone can learn about it.
 *  - **Enabling is the publish step.** A provider is dark until it is switched on,
 *    and a disabled one is invisible to the sign-in page as well as unusable —
 *    so the toggle sits next to the save button, where its consequence is stated.
 *  - **The form asks for two things.** Client ID and client secret are what only
 *    an admin has; the endpoints, scopes and claim mapping are seeded per
 *    provider and are not the console's business to ask about again.
 *
 * Every call goes through this app's own `/api/admin/social-providers`, which
 * relays the session cookie; the API checks the admin role again on each one, so
 * this page hiding itself is convenience and never the control.
 */

export function ProviderConsole() {
  /** `null` while the first read is in flight, so the list can be a skeleton. */
  const [providers, setProviders] = useState<AdminSocialProvider[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  /** The provider whose form is open. One at a time: the forms are long. */
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [lead, setLead] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  /** The one thing that could not be sent, per form. */
  const [blocked, setBlocked] = useState<Record<string, string>>({});
  const [inspections, setInspections] = useState<Record<string, ProviderInspection>>({});
  /** Two-step delete: the id the admin has already asked to remove once. */
  const [confirming, setConfirming] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  /** One answer from the list endpoint becomes the rows and their fresh baselines. */
  const applyLoaded = useCallback((result: AuthResult<AdminSocialProvider[]>) => {
    if (!result.ok) {
      setProviders([]);
      setLead("প্রোভাইডার তালিকা আনা যায়নি");
      setDetail(result.message);
      return;
    }

    setProviders(result.data);
    setBlocked({});
    setDrafts(
      Object.fromEntries(result.data.map((provider) => [provider.id, draftFrom(provider)])),
    );
    setLead(null);
    setDetail(null);
  }, []);

  const refresh = useCallback(async () => {
    setBusy("refresh");
    const result = await listSocialProviders();
    setBusy(null);
    applyLoaded(result);
  }, [applyLoaded]);

  useEffect(() => {
    // The state writes sit in the `then` callback rather than the effect body, so
    // they land when the request answers instead of triggering a second render.
    let active = true;
    void listSocialProviders().then((result) => {
      if (active) applyLoaded(result);
    });
    return () => {
      active = false;
    };
  }, [applyLoaded]);

  function fail(nextLead: string, message: string) {
    setLead(nextLead);
    setDetail(message);
    setNotice(null);
  }

  /** One answer from the API becomes the list's row *and* its form's baseline. */
  function applyProvider(updated: AdminSocialProvider) {
    setProviders((prev) =>
      prev ? prev.map((row) => (row.id === updated.id ? updated : row)) : [updated],
    );
    setDrafts((prev) => ({ ...prev, [updated.id]: draftFrom(updated) }));
    setBlocked((prev) => {
      if (!(updated.id in prev)) return prev;
      const rest = { ...prev };
      delete rest[updated.id];
      return rest;
    });
  }

  function patchDraft(id: string, patch: Partial<Draft>) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } as Draft }));
    setNotice(null);
  }

  async function save(provider: AdminSocialProvider) {
    const draft = drafts[provider.id];
    if (!draft) return;

    const converted = draftToInput(draft);
    if (!converted.ok) {
      setBlocked({ [provider.id]: converted.error });
      return;
    }

    setBlocked({});
    setBusy(provider.id);
    setNotice(null);
    const result = await updateSocialProvider(provider.id, converted.input);
    setBusy(null);

    if (!result.ok) {
      fail("সংরক্ষণ করা যায়নি", result.message);
      return;
    }

    applyProvider(result.data);
    setLead(null);
    setDetail(null);
    setNotice(`${result.data.name.bn} সংরক্ষিত হয়েছে।`);
  }

  async function toggleEnabled(provider: AdminSocialProvider, enabled: boolean) {
    setBusy(provider.id);
    setNotice(null);
    const result = await updateSocialProvider(provider.id, { enabled });
    setBusy(null);

    if (!result.ok) {
      fail("অবস্থা বদলানো যায়নি", result.message);
      return;
    }

    applyProvider(result.data);
    setNotice(
      enabled
        ? `${result.data.name.bn} চালু করা হয়েছে — এখন সাইন-ইন পাতায় এর বোতাম দেখাবে।`
        : `${result.data.name.bn} বন্ধ করা হয়েছে — সাইন-ইন পাতায় আর দেখাবে না।`,
    );
  }

  async function inspect(provider: AdminSocialProvider) {
    setBusy(provider.id);
    setNotice(null);
    const result = await inspectSocialProvider(provider.id);
    setBusy(null);

    if (!result.ok) {
      fail("যাচাই করা যায়নি", result.message);
      return;
    }

    setInspections((prev) => ({ ...prev, [provider.id]: result.data }));
    setLead(null);
    setDetail(null);
  }

  async function remove(provider: AdminSocialProvider) {
    setBusy(provider.id);
    setNotice(null);
    const result = await deleteSocialProvider(provider.id);
    setBusy(null);
    setConfirming(null);

    if (!result.ok) {
      fail("মুছে ফেলা যায়নি", result.message);
      return;
    }

    setProviders((prev) => (prev ? prev.filter((row) => row.id !== provider.id) : prev));
    setOpenId((prev) => (prev === provider.id ? null : prev));
    setNotice(`${provider.name.bn} মুছে ফেলা হয়েছে।`);
  }

  /**
   * A refused clipboard is not worth a message: the value is on screen right
   * above the button, so the fallback is selecting it by hand.
   */
  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((prev) => (prev === key ? null : prev)), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="space-y-5">
      {lead ? (
        <Callout tone="danger" icon={AlertTriangle} title={lead}>
          {detail}
        </Callout>
      ) : null}

      {notice ? (
        <Callout tone="success" icon={BadgeCheck} title="সম্পন্ন">
          {notice}
        </Callout>
      ) : null}

      <Card>
        <CardHeader
          icon={KeyRound}
          tone="admin"
          title="প্রোভাইডারসমূহ"
          subtitle="সাইন-ইন পাতায় ঠিক যেসব বোতাম এই তালিকায় চালু আছে সেগুলোই দেখা যায় — বাকিগুলো অদৃশ্য থাকে।"
          action={
            <Button
              size="sm"
              variant="outline"
              icon={RefreshCw}
              loading={busy === "refresh"}
              disabled={providers === null}
              onClick={() => void refresh()}
            >
              রিফ্রেশ
            </Button>
          }
        />

        {providers === null ? (
          <SkeletonList count={2} />
        ) : providers.length === 0 ? (
          <Callout tone="warning" icon={AlertTriangle} className="mt-5" title="কোনো প্রোভাইডার নেই">
            সিড করা গুগল ও ফেসবুক সারি পাওয়া যায়নি। সারিগুলো ফিরিয়ে আনতে server/scripts/seed.ts চালান —
            এখানে যোগ করা যায় না, কারণ নতুন প্রোভাইডারের endpoints ও claim ম্যাপিং কোডের অংশ।
          </Callout>
        ) : (
          <div className="mt-5 space-y-4">
            {providers.map((provider) => {
              const draft = drafts[provider.id];
              const open = openId === provider.id;
              const info = inspections[provider.id];
              const placeholder = provider.clientId.startsWith("REPLACE-WITH-");

              return (
                <Card key={provider.id} variant="flat" padding="sm" className="border border-border">
                  <CardHeader
                    icon={KeyRound}
                    tone={provider.enabled ? "success" : "neutral"}
                    title={
                      <span className="flex flex-wrap items-center gap-2">
                        {providerMark(provider.slug)}
                        {provider.name.bn}
                        <span className="font-mono text-[0.75rem] font-normal text-subtle-foreground">
                          /{provider.slug}
                        </span>
                      </span>
                    }
                    subtitle={
                      <span>
                        সর্বশেষ পরিবর্তন {relativeTime(provider.updatedAt, "bn")}
                        {provider.updatedBy ? ` · ${provider.updatedBy}` : ""} ·{" "}
                        {provider.hasClientSecret
                          ? "সিক্রেট সংরক্ষিত আছে"
                          : "কোনো সিক্রেট সংরক্ষিত নেই"}
                      </span>
                    }
                    action={
                      <div className="flex items-center gap-2">
                        {placeholder ? (
                          <Badge tone="warning" size="xs">
                            প্লেসহোল্ডার
                          </Badge>
                        ) : null}
                        <StatusBadge
                          status={provider.enabled ? "active" : "inactive"}
                          label={provider.enabled ? "চালু" : "বন্ধ"}
                        />
                        <Button
                          size="sm"
                          variant={open ? "ghost" : "outline"}
                          onClick={() => setOpenId(open ? null : provider.id)}
                        >
                          {open ? "গোপন করুন" : "কনফিগার"}
                        </Button>
                      </div>
                    }
                  />

                  {open && draft ? (
                    <div className="mt-5">
                      {placeholder ? (
                        <Callout tone="warning" icon={AlertTriangle} className="mb-5" title="আসল ক্রেডেনশিয়াল বসানো হয়নি">
                          এই সারিতে এখনও প্রোভাইডারের ড্যাশবোর্ড থেকে পাওয়া ক্লায়েন্ট আইডি ও সিক্রেট বসানো হয়নি। বসিয়ে
                          চালু করার আগে বোতামটি ক্লিক করলে প্রোভাইডার নিজেই ত্রুটি দেখাবে।
                        </Callout>
                      ) : null}

                      <ProviderForm
                        draft={draft}
                        idPrefix={provider.id}
                        disabled={busy === provider.id}
                        onChange={(patch) => patchDraft(provider.id, patch)}
                      />

                      {blocked[provider.id] ? (
                        <Callout tone="danger" icon={AlertTriangle} className="mt-4" title="এখনই ঠিক করতে হবে">
                          {blocked[provider.id]}
                        </Callout>
                      ) : null}

                      {info ? (
                        <div className="mt-4 rounded-card border border-border bg-surface p-4">
                          <p className="text-[0.8125rem] font-semibold text-foreground">
                            প্রোভাইডারের ড্যাশবোর্ডে বসানোর তথ্য
                          </p>

                          <div className="mt-3">
                            <p className="text-[0.6875rem] uppercase tracking-wide text-subtle-foreground">
                              Redirect URI — হুবহু একই অক্ষরে
                            </p>
                            <div className="mt-1 flex items-start gap-2">
                              <code className="min-w-0 flex-1 break-all rounded-lg border border-border bg-surface-2 px-2.5 py-2 font-mono text-[0.75rem] text-foreground">
                                {info.redirectUri}
                              </code>
                              <Button
                                size="icon-sm"
                                variant="outline"
                                icon={copied === "redirect" ? Check : Copy}
                                aria-label="Redirect URI কপি করুন"
                                onClick={() => void copy(info.redirectUri, "redirect")}
                              />
                            </div>
                          </div>

                          <p className="mt-3 text-[0.6875rem] leading-relaxed text-muted-foreground">
                            সিক্রেটটি পাঠানো ও ডিক্রিপ্ট করা গেছে — অর্থাৎ এই ডিপ্লয়মেন্টের{" "}
                            <span className="font-mono">ILM_SECRET_KEY</span> অপরিবর্তিত আছে এবং কনফিগারেশনটি পাঠানোর মতো
                            অবস্থায় আছে। scopes:{" "}
                            <span className="font-mono">{info.scopes.join(" ") || "—"}</span>
                          </p>

                          <Button
                            href={info.authorizationUrl}
                            external
                            size="sm"
                            variant="ghost"
                            iconRight={ExternalLink}
                            className="mt-3"
                          >
                            প্রোভাইডারের অনুমোদন স্ক্রিন খুলে দেখুন
                          </Button>
                        </div>
                      ) : null}

                      <CardFooter className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            icon={Save}
                            loading={busy === provider.id}
                            onClick={() => void save(provider)}
                          >
                            সংরক্ষণ করুন
                          </Button>
                          <Button
                            variant="outline"
                            icon={ShieldCheck}
                            disabled={busy === provider.id}
                            onClick={() => void inspect(provider)}
                          >
                            যাচাই
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <Switch
                            id={`${provider.id}-enabled`}
                            checked={provider.enabled}
                            onChange={(next) => void toggleEnabled(provider, next)}
                            label="সাইন-ইন চালু"
                            className="min-w-[15rem]"
                          />

                          {confirming === provider.id ? (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="danger"
                                size="sm"
                                icon={Trash2}
                                loading={busy === provider.id}
                                onClick={() => void remove(provider)}
                              >
                                মুছে ফেলুন
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirming(null)}
                              >
                                বাতিল
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={Trash2}
                              onClick={() => setConfirming(provider.id)}
                            >
                              মুছুন
                            </Button>
                          )}
                        </div>
                      </CardFooter>

                      {confirming === provider.id ? (
                        <Callout tone="danger" icon={AlertTriangle} className="mt-4" title="মুছে ফেললে কী হবে">
                          রেকর্ডটি যায়, এবং এই প্রোভাইডার দিয়ে তৈরি অ্যাকাউন্ট-সংযোগগুলোও (linked identities) মুছে যায়।
                          যেসব ব্যবহারকারীর পাসওয়ার্ড নেই, তারা অন্য কোনো উপায় ছাড়া অ্যাকাউন্টে ঢুকতে পারবেন না —
                          তাই আগে চালু বন্ধ করে দেখা যায় কি না, তা বিবেচনা করুন।
                        </Callout>
                      ) : null}
                    </div>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
