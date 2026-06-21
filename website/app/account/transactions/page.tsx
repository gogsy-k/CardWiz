"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { authedFetch } from "@/lib/auth";
import {
  listTransactions,
  addTransaction,
  deleteTransaction,
  type Transaction,
} from "@/lib/transactions-api";
import { CATEGORY_LABEL } from "@/lib/cards";

// All spendable categories from the catalog vocabulary
const CATEGORIES = Object.entries(CATEGORY_LABEL).sort((a, b) => a[1].localeCompare(b[1]));

type WalletEntry = { id: string; cardId: string; nickname?: string; last4?: string };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function fmtDate(d: string): string {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtAmount(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// ── Add Transaction Form ─────────────────────────────────────────────────────
function AddForm({
  wallet,
  onAdded,
  onCancel,
}: {
  wallet: WalletEntry[];
  onAdded: (txn: Transaction) => void;
  onCancel: () => void;
}) {
  const [date, setDate] = useState(today());
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("online_shopping");
  const [cardId, setCardId] = useState(wallet[0]?.cardId ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) { setError("Enter a valid amount."); return; }
    setSubmitting(true);
    setError("");
    try {
      const txn = await addTransaction({ cardId: cardId || undefined, date, merchant: merchant || undefined, amount: amt, category });
      onAdded(txn);
    } catch (err) {
      if (err instanceof Error && err.message === "free_limit") {
        setError("Free limit reached (3 transactions). Upgrade to Premium to add more.");
      } else {
        setError(err instanceof Error ? err.message : "Failed to save.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-surface2 p-5 space-y-4">
      <div className="text-sm font-black">Add Transaction</div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Date */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs text-muted mb-1">Date *</label>
          <input
            type="date"
            value={date}
            max={today()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            required
          />
        </div>

        {/* Amount */}
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs text-muted mb-1">Amount (₹) *</label>
          <input
            type="number"
            placeholder="e.g. 1500"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            required
          />
        </div>

        {/* Category */}
        <div className="col-span-2">
          <label className="block text-xs text-muted mb-1">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {CATEGORIES.map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Merchant */}
        <div>
          <label className="block text-xs text-muted mb-1">Merchant (optional)</label>
          <input
            type="text"
            placeholder="e.g. Amazon, Swiggy…"
            maxLength={200}
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>

        {/* Card used */}
        <div>
          <label className="block text-xs text-muted mb-1">Card used (optional)</label>
          <select
            value={cardId}
            onChange={(e) => setCardId(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="">— Not sure —</option>
            {wallet.map((w) => (
              <option key={w.id} value={w.cardId}>
                {w.nickname || w.cardId}{w.last4 ? ` (••${w.last4})` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-bold text-bg transition-opacity disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Add"}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-muted hover:text-text">
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Transaction Row ──────────────────────────────────────────────────────────
function TxnRow({
  txn,
  wallet,
  onDelete,
}: {
  txn: Transaction;
  wallet: WalletEntry[];
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const cardEntry = wallet.find((w) => w.cardId === txn.cardId);
  const cardLabel = cardEntry
    ? (cardEntry.nickname || txn.cardId) + (cardEntry.last4 ? ` ••${cardEntry.last4}` : "")
    : txn.cardId || "—";

  async function handleDelete() {
    if (!confirm("Delete this transaction?")) return;
    setDeleting(true);
    try {
      await deleteTransaction(txn.id);
      onDelete(txn.id);
    } catch {
      alert("Delete failed — try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
      <div className="shrink-0 text-xs text-muted w-[84px]">{fmtDate(txn.date)}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold truncate">{txn.merchant || "—"}</div>
        <div className="text-xs text-muted">{CATEGORY_LABEL[txn.category] ?? txn.category} · {cardLabel}</div>
      </div>
      <div className="shrink-0 text-sm font-black text-green">{fmtAmount(txn.amount)}</div>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="shrink-0 text-xs text-muted hover:text-red-400 disabled:opacity-40 transition-colors"
        title="Delete"
      >
        ✕
      </button>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const { user } = useAuth();
  const isPremium = user?.plan === "premium";

  const [txns, setTxns] = useState<Transaction[]>([]);
  const [count, setCount] = useState(0);
  const [freeLimit] = useState(3);
  const [wallet, setWallet] = useState<WalletEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [txnRes, walletRes] = await Promise.all([
        listTransactions(),
        authedFetch("/cards"),
      ]);
      setTxns(txnRes.transactions);
      setCount(txnRes.count);
      const w: WalletEntry[] = walletRes.ok ? await walletRes.json() : [];
      setWallet(w);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleAdded(txn: Transaction) {
    setTxns((prev) => [txn, ...prev]);
    setCount((c) => c + 1);
    setShowForm(false);
  }

  function handleDeleted(id: string) {
    setTxns((prev) => prev.filter((t) => t.id !== id));
    setCount((c) => Math.max(0, c - 1));
  }

  const atFreeLimit = !isPremium && count >= freeLimit;
  const canAdd = !atFreeLimit;

  if (!user) return null; // layout handles auth guard

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-5 py-10">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link href="/account" className="text-xs text-muted hover:text-subtle">← Account</Link>
          <h1 className="mt-1 text-2xl font-black">My Transactions</h1>
          <p className="text-sm text-muted mt-0.5">
            Log spends to power the Missed Savings Report.
            {!isPremium && (
              <span className="ml-1">
                {count}/{freeLimit} free entries used.{" "}
                <Link href="/pricing" className="text-accent hover:underline">Upgrade</Link>
                {" "}for unlimited.
              </span>
            )}
          </p>
        </div>
        {canAdd && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="shrink-0 rounded-xl bg-accent px-4 py-2 text-sm font-bold text-bg"
          >
            + Add
          </button>
        )}
      </div>

      {/* Free limit wall */}
      {atFreeLimit && (
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6 text-center">
          <div className="text-3xl mb-2">💎</div>
          <div className="font-bold mb-1">Free limit reached</div>
          <p className="text-sm text-muted mb-5 max-w-sm mx-auto leading-relaxed">
            You&apos;ve used all {freeLimit} free transaction entries. Upgrade to Premium for unlimited
            transactions and the full Missed Savings Report.
          </p>
          <Link
            href="/pricing"
            className="inline-block rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-bg"
          >
            Upgrade to Premium →
          </Link>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <AddForm
          wallet={wallet}
          onAdded={handleAdded}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Transactions list */}
      {loading ? (
        <div className="py-12 text-center text-sm text-muted animate-pulse">Loading…</div>
      ) : txns.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted">
          <div className="text-4xl mb-3">📋</div>
          <div className="text-sm">No transactions yet.</div>
          {canAdd && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-accent hover:underline"
            >
              Add your first transaction →
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface2 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-xs font-bold text-muted uppercase tracking-wide">
              {count} transaction{count !== 1 ? "s" : ""}
            </span>
          </div>
          {txns.map((txn) => (
            <TxnRow key={txn.id} txn={txn} wallet={wallet} onDelete={handleDeleted} />
          ))}
        </div>
      )}

      {/* Missed Savings teaser (always visible) */}
      <div className="rounded-2xl border border-border bg-surface2 p-5 flex items-center gap-4">
        <span className="text-3xl shrink-0">💸</span>
        <div className="min-w-0">
          <div className="text-sm font-bold">Missed Savings Report</div>
          <p className="text-xs text-muted mt-0.5 leading-relaxed">
            {isPremium
              ? "Coming soon — once Missed Savings is live, your transactions will power the full report."
              : "Log transactions to see exactly how much you left on the table by using the wrong card."}
          </p>
        </div>
        {!isPremium && (
          <Link href="/pricing" className="shrink-0 rounded-lg border border-accent text-accent px-3 py-1.5 text-xs font-bold hover:bg-accent/10">
            Upgrade
          </Link>
        )}
      </div>

    </div>
  );
}
