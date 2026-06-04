import type { Dispatch, SetStateAction } from "react";

export type AccountRole = "customer" | "painter";

export type StoredAccount = {
  email: string;
  password: string;
  roles: AccountRole[];
  verifiedEmail?: boolean;
  mfaEnabled?: boolean;
  activeRole?: AccountRole;
  createdAt?: string;
  updatedAt?: string;
};

const ACCOUNTS_KEY = "paintbook:accounts";

function nowIso() {
  return new Date().toISOString();
}

function normaliseEmail(email: string) {
  return email.trim().toLowerCase();
}

export function loadAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistAccounts(accounts: StoredAccount[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export function findAccount(email: string): StoredAccount | undefined {
  const normalised = normaliseEmail(email);
  return loadAccounts().find((acc) => normaliseEmail(acc.email) === normalised);
}

export function upsertAccount(account: StoredAccount): StoredAccount {
  const accounts = loadAccounts();
  const normalised = normaliseEmail(account.email);
  const index = accounts.findIndex((acc) => normaliseEmail(acc.email) === normalised);
  const roles = Array.from(new Set(account.roles)).sort();
  if (index >= 0) {
    const existing = accounts[index];
    const mergedRoles = Array.from(new Set([...(existing.roles || []), ...roles]));
    const next: StoredAccount = {
      ...existing,
      ...account,
      email: normalised,
      roles: mergedRoles,
      updatedAt: nowIso(),
      createdAt: existing.createdAt || account.createdAt || nowIso(),
    };
    accounts[index] = next;
    persistAccounts(accounts);
    return next;
  }
  const next: StoredAccount = {
    ...account,
    email: normalised,
    roles,
    createdAt: account.createdAt || nowIso(),
    updatedAt: nowIso(),
  };
  accounts.push(next);
  persistAccounts(accounts);
  return next;
}

export function removeAccount(email: string) {
  const accounts = loadAccounts();
  const normalised = normaliseEmail(email);
  const next = accounts.filter((acc) => normaliseEmail(acc.email) !== normalised);
  persistAccounts(next);
}

type AuthResult =
  | { status: "ok"; account: StoredAccount }
  | { status: "not_found" }
  | { status: "invalid_password" };

export function authenticate(email: string, password: string): AuthResult {
  const account = findAccount(email);
  if (!account) return { status: "not_found" };
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(account.password);
  const bBytes = encoder.encode(password);
  let mismatch = aBytes.length !== bBytes.length ? 1 : 0;
  const len = Math.max(aBytes.length, bBytes.length);
  for (let i = 0; i < len; i++) {
    mismatch |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  if (mismatch !== 0) return { status: "invalid_password" };
  return { status: "ok", account };
}

export function setActiveUser(account: StoredAccount, role: AccountRole) {
  const next: StoredAccount = {
    ...account,
    activeRole: role,
    verifiedEmail: account.verifiedEmail ?? true,
    updatedAt: nowIso(),
  };
  if (typeof window !== "undefined") {
    localStorage.setItem("paintbook:user", JSON.stringify(next));
    localStorage.setItem("paintbook:lastLoginRole", role);
  }
}

export function ensureAccountHasRole(account: StoredAccount, role: AccountRole): StoredAccount {
  if (account.roles.includes(role)) return account;
  return upsertAccount({ ...account, roles: [...account.roles, role] });
}

export function logout(setState?: Dispatch<SetStateAction<boolean>>) {
  if (typeof window === "undefined") return;
  localStorage.removeItem("paintbook:user");
  setState?.(false);
}
