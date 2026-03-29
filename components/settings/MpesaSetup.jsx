"use client";

import { useState } from "react";
import { Copy, Check, RefreshCw, Smartphone, Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { saveMpesaNumber, regenerateWebhookToken } from "@/actions/mpesa-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MpesaSetup({ initialPhone, webhookToken, appUrl }) {
  const [phone,      setPhone]      = useState(initialPhone || "");
  const [token,      setToken]      = useState(webhookToken || "");
  const [saving,     setSaving]     = useState(false);
  const [regen,      setRegen]      = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [copied,     setCopied]     = useState("");

  const webhookUrl = `${appUrl}/api/mpesa/sms`;

  // ── Copy to clipboard ─────────────────────────────────────────────────────
  async function copyText(text, key) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
    toast.success("Copied to clipboard");
  }

  // ── Save phone number ─────────────────────────────────────────────────────
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
        toast.success("Token regenerated. Update your SMS Forwarder app.");
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRegen(false);
    }
  }

  return (
    <div className="space-y-8">

      {/* ── Step 1: Enter phone number ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center shrink-0">1</div>
          <h3 className="text-sm font-bold text-gray-800">Enter your M-Pesa number</h3>
        </div>
        <p className="text-xs text-gray-400 ml-8">
          This is the phone number registered with M-Pesa (your Safaricom number).
        </p>
        <div className="flex gap-2 ml-8">
          <Input
            type="tel"
            placeholder="e.g. 0712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="max-w-xs"
          />
          <Button
            onClick={handleSavePhone}
            disabled={saving || !phone}
            className="bg-green-600 hover:bg-green-700 text-white shrink-0"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : phoneSaved ? (
              <><Check className="h-4 w-4 mr-1" /> Saved</>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </div>

      {/* ── Step 2: Install SMS Forwarder ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center shrink-0">2</div>
          <h3 className="text-sm font-bold text-gray-800">Install SMS Forwarder on your Android phone</h3>
        </div>
        <div className="ml-8 space-y-2">
          <p className="text-xs text-gray-500">
            SMS Forwarder is a free Android app that automatically forwards your M-Pesa messages to SmartFinance the moment they arrive.
          </p>
          <a
            href="https://play.google.com/store/apps/details?id=com.frzinapps.smsforwarder"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-semibold text-green-700 hover:bg-green-100 transition-colors"
          >
            <Smartphone className="h-3.5 w-3.5" />
            Download SMS Forwarder
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            ⚠️ Only works on Android. iPhone does not allow SMS forwarding apps.
          </p>
        </div>
      </div>

      {/* ── Step 3: Configure SMS Forwarder ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center shrink-0">3</div>
          <h3 className="text-sm font-bold text-gray-800">Configure SMS Forwarder</h3>
        </div>
        <div className="ml-8 space-y-4">
          <p className="text-xs text-gray-500">
            Open SMS Forwarder → tap <strong>Add Rule</strong> → set these values:
          </p>

          {/* Config fields */}
          <div className="space-y-3 bg-gray-50 rounded-xl border border-gray-100 p-4">

            {/* Filter */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">SMS Filter (sender)</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-700">
                  MPESA
                </code>
                <button
                  onClick={() => copyText("MPESA", "filter")}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copied === "filter" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

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

            {/* Method */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Method</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-700">
                  POST
                </code>
                <button
                  onClick={() => copyText("POST", "method")}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {copied === "method" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
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
                  {regen
                    ? <Loader2 className="h-3 w-3 animate-spin" />
                    : <RefreshCw className="h-3 w-3" />}
                  Regenerate
                </button>
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 break-all">
                  {token}
                </code>
                <button
                  onClick={() => copyText(token, "token")}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                >
                  {copied === "token" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Add this as a field named <code className="bg-gray-100 px-1 rounded">token</code> in the SMS Forwarder request body.
              </p>
            </div>

            {/* JSON body */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Request Body (JSON)</label>
              <div className="flex items-start gap-2">
                <pre className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 whitespace-pre-wrap">
{`{
  "from":    "%from%",
  "message": "%message%",
  "token":   "${token}"
}`}
                </pre>
                <button
                  onClick={() => copyText(`{\n  "from":    "%from%",\n  "message": "%message%",\n  "token":   "${token}"\n}`, "body")}
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-1"
                >
                  {copied === "body" ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                <code className="bg-gray-100 px-1 rounded">%from%</code> and <code className="bg-gray-100 px-1 rounded">%message%</code> are SMS Forwarder variables — they get replaced automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Step 4: Test it ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center shrink-0">4</div>
          <h3 className="text-sm font-bold text-gray-800">Test it</h3>
        </div>
        <div className="ml-8 space-y-2">
          <p className="text-xs text-gray-500">
            Make any M-Pesa transaction (send money, buy goods, pay bill). Within seconds it should appear on your SmartFinance dashboard automatically.
          </p>
          <div className="flex items-start gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
            <p className="text-xs text-green-700">
              Once set up, <strong>every M-Pesa transaction is saved automatically</strong> — sends, receives, pay bill, buy goods, withdrawals and airtime. No manual input needed.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}