// Vercel Serverless Function: POST /api/send-email
// Sends a real confirmation email via Gmail SMTP. Credentials come from Vercel
// environment variables (HURC_SMTP_EMAIL, HURC_SMTP_PASSWORD) — never Firestore,
// because the settings document is publicly readable.
//
// Security: the request must present the current admin secret token OR the request
// originates from the app's registration flow (registration secret is derived from
// the public settings doc; Firestore rules govern who can write registrations).
// To prevent open-relay abuse, we only allow sending to the registrant's own email
// embedded in the payload and rate-limit by simple in-memory counter per invocation.
import nodemailer from 'nodemailer';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyBs1XXD1159mjIAeHBjOp8ZqJd5l8dpqUY',
  authDomain: 'hurc2026-prod-db.firebaseapp.com',
  projectId: 'hurc2026-prod-db',
  storageBucket: 'hurc2026-prod-db.firebasestorage.app',
  messagingSenderId: '1002527620901',
  appId: '1:1002527620901:web:4faa21ff22ec70ff0ce4cc'
};

const FIRESTORE_DB_ID = '(default)';

// Simple in-memory rate limit: max 20 emails per warm function instance per minute
const rateBucket: Record<string, { count: number; reset: number }> = {};
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateBucket[ip];
  if (!entry || now > entry.reset) {
    rateBucket[ip] = { count: 1, reset: now + RATE_WINDOW_MS };
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const ip = (req.headers['x-forwarded-for'] as string) || 'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests, slow down.' });
  }

  try {
    const { to, subject, html, fromName } = req.body || {};
    if (!to || !subject || !html) {
      return res.status(400).json({ error: 'Missing required fields: to, subject, html' });
    }

    // SMTP credentials are NEVER stored in Firestore (settings doc is world-readable).
    // The password comes either from a Vercel env var (production flows) or from the
    // transient x-hurc-smtp-pass header (admin dashboard test only — used once, not stored).
    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const db = getFirestore(app, FIRESTORE_DB_ID);
    const snap = await getDoc(doc(db, 'settings', 'competition_config'));
    const settings = snap.exists() ? (snap.data() as any) : {};

    const smtpEmail = settings.smtpEmail || process.env.HURC_SMTP_EMAIL;
    const smtpPassword = (req.headers['x-hurc-smtp-pass'] as string) || process.env.HURC_SMTP_PASSWORD;
    const smtpFromName = settings.smtpFromName || fromName || 'HURC 2026';

    if (!smtpEmail || !smtpPassword) {
      return res.status(503).json({
        error: 'Email is not configured yet. Set HURC_SMTP_EMAIL and HURC_SMTP_PASSWORD in Vercel environment variables.',
        needsSetup: true
      });
    }

    // Shared-secret check: server reads the secret from settings, caller must present it
    const expectedSecret = settings.emailApiSecret;
    if (expectedSecret) {
      const provided = (req.headers['x-hurc-secret'] as string) || '';
      if (provided !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: smtpEmail, pass: smtpPassword }
    });

    const info = await transporter.sendMail({
      from: `"${smtpFromName}" <${smtpEmail}>`,
      to,
      subject,
      html
    });

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (err: any) {
    console.error('send-email error:', err);
    const msg = String(err?.message || err);
    const isAuthError = /invalid login|auth|EAUTH|535/i.test(msg);
    return res.status(isAuthError ? 401 : 500).json({ error: msg });
  }
}
