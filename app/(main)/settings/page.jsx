"use client";

import { useState, useEffect } from "react";
import { saveMpesaNumber, getMpesaSettings, regenerateWebhookToken } from "@/actions/mpesa-settings";
import { Copy, Check, RefreshCw, Loader2, ExternalLink, CheckCircle2, Smartphone } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [phone,       setPhone]       = useState("");
  const [token,       setToken]       = useState("");
  const [appUrl,      setAppUrl]      = useState("");
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [regen,       setRegen]       = useState(false);
  const [phoneSaved,  setPhoneSaved]  = useState(false);
  const [copied,      setCopied]      = useState("");

  // ── Load settings on mount ───────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const settings = await getMpesaSettings();
        setPhone(settings.mpesaNumber  || "");
        setToken(settings.webhookToken || "");
        setAppUrl(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
      } catch (err) {
        toast.error("Failed to load settings: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const webhookUrl = `${appUrl}/api/mpesa/sms`;

  // ── Copy to clipboard ────────────────────────────────────────────────────
  async function copyText(text, key) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
    toast.success("Copied!");
  }

  // ── Save phone ───────────────────────────────────────────────────────────
  async function handleSavePhone() {
    setSaving(true);
    try {
      const res = await saveMpesaNumber(phone);
      if (res.success) {
        setPhoneSaved(true);
        toast.success("M-Pesa number saved");
        setTimeout(() => setPhoneSaved(false), 3000);
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  // ── Regenerate token ─────────────────────────────────────────────────────
  async function handleRegen() {
    if (!confirm("Regenerate token? You will need to update SMS Forwarder with the new token.")) return;
    setRegen(true);
    try {
      const res = await regenerateWebhookToken();
      if (res.success) {
        setToken(res.token);
        toast.success("Token regenerated. Update your MacroDroid app.");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRegen(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-5 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded-xl w-40" />
          <div className="h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">

      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">Manage your account preferences</p>
      </div>

      {/* M-Pesa card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-8">

        {/* Card header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-xl">
            📱
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-800">M-Pesa Auto-Import</h2>
            <p className="text-xs text-gray-400">
              Automatically save M-Pesa transactions the moment they happen
            </p>
          </div>
        </div>

        {/* Step 1 — Phone number */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">1</div>
            <h3 className="text-sm font-bold text-gray-800">Enter your M-Pesa number</h3>
          </div>
          <div className="flex gap-2 ml-8">
            <input
              type="tel"
              placeholder="e.g. 0712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 max-w-xs rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              onClick={handleSavePhone}
              disabled={saving || !phone}
              className="px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-all"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : phoneSaved ? (
                <span className="flex items-center gap-1"><Check className="h-4 w-4" /> Saved</span>
              ) : "Save"}
            </button>
          </div>
        </div>

        {/* Step 2 — Install app */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">2</div>
            <h3 className="text-sm font-bold text-gray-800">Install MacroDroid on your Android phone</h3>
          </div>
          <div className="ml-8 space-y-2">
            <p className="text-xs text-gray-500">
              MacroDroid automatically forwards M-Pesa SMS to SmartFinance the moment they arrive.
            </p>
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
              ⚠️ Only works on Android. iPhone does not allow SMS forwarding apps.
            </p>
          </div>
        </div>

        {/* Step 3 — Configure */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">3</div>
            <h3 className="text-sm font-bold text-gray-800">Configure MacroDroid with these values</h3>
          </div>
          <div className="ml-8 space-y-3 bg-gray-50 rounded-xl border border-gray-100 p-4">

            {/* Webhook URL */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Webhook URL</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 break-all">
                  {webhookUrl}
                </code>
                <button
                  onClick={() => copyText(webhookUrl, "url")}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                >
                  {copied === "url" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Token */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Your Secret Token</label>
                <button
                  onClick={handleRegen}
                  disabled={regen}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  {regen ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  Regenerate
                </button>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 break-all">
                  {token || "Loading..."}
                </code>
                <button
                  onClick={() => copyText(token, "token")}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                >
                  {copied === "token" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* JSON Body */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">MacroDroid Request Body (copy this)</label>
              <div className="flex items-start gap-2">
                <pre className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 whitespace-pre-wrap">
{`{
  "from":    "%sms_from_address%",
  "message": "%sms_message_text%",
  "token":   "${token}"
}`}
                </pre>
                <button
                  onClick={() => copyText(`{\n  "from":    "%sms_from_address%",\n  "message": "%sms_message_text%",\n  "token":   "${token}"\n}`, "body")}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-1"
                >
                  {copied === "body" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Step 4 — Test */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">4</div>
            <h3 className="text-sm font-bold text-gray-800">Test it</h3>
          </div>
          <div className="ml-8">
            <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
              <p className="text-xs text-green-700">
                Make any M-Pesa transaction. Within seconds it should appear on your SmartFinance dashboard automatically.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}