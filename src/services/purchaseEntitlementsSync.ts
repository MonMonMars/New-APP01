import AsyncStorage from '@react-native-async-storage/async-storage';

import { EntitlementGrant, PurchaseProductId } from '../types/purchases';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

const APPLIED_LEDGER_KEY = '@spark/applied_purchase_ledger_ids';

type LedgerRow = {
  id: string;
  product_id: string;
  status: string;
  grant: EntitlementGrant | null;
  external_id: string | null;
};

async function loadAppliedLedgerIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(APPLIED_LEDGER_KEY);
    if (!raw) {
      return new Set();
    }
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

async function saveAppliedLedgerIds(ids: Set<string>): Promise<void> {
  try {
    await AsyncStorage.setItem(APPLIED_LEDGER_KEY, JSON.stringify([...ids].slice(-200)));
  } catch {
    // ignore
  }
}

function grantFromRow(row: LedgerRow): EntitlementGrant | null {
  if (row.grant && typeof row.grant === 'object') {
    return row.grant;
  }
  return null;
}

/** Pull completed server ledger entries not yet applied on this device. */
export async function fetchUnappliedPurchaseGrants(userId: string): Promise<
  Array<{ ledgerId: string; productId: PurchaseProductId; grant: EntitlementGrant }>
> {
  if (!isSupabaseConfigured()) {
    return [];
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const applied = await loadAppliedLedgerIds();
  const { data, error } = await supabase
    .from('purchase_ledger')
    .select('id, product_id, status, grant, external_id')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error || !data) {
    return [];
  }

  const rows = data as LedgerRow[];
  const pending: Array<{ ledgerId: string; productId: PurchaseProductId; grant: EntitlementGrant }> = [];

  for (const row of rows) {
    if (applied.has(row.id)) {
      continue;
    }
    const grant = grantFromRow(row);
    if (!grant) {
      continue;
    }
    pending.push({
      ledgerId: row.id,
      productId: row.product_id as PurchaseProductId,
      grant,
    });
  }

  return pending;
}

export async function markPurchaseLedgerApplied(ledgerIds: string[]): Promise<void> {
  if (ledgerIds.length === 0) {
    return;
  }
  const applied = await loadAppliedLedgerIds();
  for (const id of ledgerIds) {
    applied.add(id);
  }
  await saveAppliedLedgerIds(applied);
}

export async function pollStripeCheckoutFulfillment(
  userId: string,
  sessionId: string,
  attempts = 12,
  delayMs = 1500,
): Promise<EntitlementGrant | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  for (let i = 0; i < attempts; i += 1) {
    const { data } = await supabase
      .from('purchase_ledger')
      .select('id, status, grant')
      .eq('user_id', userId)
      .eq('external_id', sessionId)
      .maybeSingle();

    if (data?.status === 'completed' && data.grant) {
      await markPurchaseLedgerApplied([data.id as string]);
      return data.grant as EntitlementGrant;
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  return null;
}
