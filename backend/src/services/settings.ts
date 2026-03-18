import Cryptr from 'cryptr';
import { prisma } from '../prisma.js';
import { env } from '../lib/env.js';

type SettingKey =
  | 'googleAnalyticsMeasurementId'
  | 'smtpHost'
  | 'smtpPort'
  | 'smtpUser'
  | 'smtpPass'
  | 'smtpFromEmail'
  | 'smtpFromName';

const secretKeys = new Set<SettingKey>(['smtpPass']);

function cryptr() {
  if (!env.ENCRYPTION_KEY) throw new Error('Missing ENCRYPTION_KEY');
  return new Cryptr(env.ENCRYPTION_KEY);
}

export async function getSettings(keys: SettingKey[]) {
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
  const map = new Map(rows.map((r) => [r.key, r]));
  const out: Record<string, string | null> = {};
  for (const k of keys) {
    const row = map.get(k);
    if (!row?.value) {
      out[k] = null;
      continue;
    }
    if (row.isSecret) {
      try {
        out[k] = cryptr().decrypt(row.value);
      } catch {
        out[k] = null;
      }
    } else {
      out[k] = row.value;
    }
  }
  return out as Record<SettingKey, string | null>;
}

export async function setSettings(input: Partial<Record<SettingKey, string | null>>) {
  for (const [key, value] of Object.entries(input)) {
    const k = key as SettingKey;
    const isSecret = secretKeys.has(k);
    const stored = value == null ? null : isSecret ? cryptr().encrypt(value) : value;
    await prisma.setting.upsert({
      where: { key: k },
      create: { key: k, value: stored, isSecret },
      update: { value: stored, isSecret },
    });
  }
}

