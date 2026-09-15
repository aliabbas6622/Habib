import { doc, setDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import { TeamRegistrationData, AmbassadorRegistrationData } from '../types';

export interface DispatchedEmail {
  id: string;
  registrationId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  type: 'team_confirmation' | 'ambassador_confirmation';
  htmlContent: string;
  status: 'Delivered' | 'Sent' | 'Failed';
  timestamp: string;
  sentAt: string;
}

export function generateTeamConfirmationEmailHtml(reg: TeamRegistrationData, totalFeePKR: number = 3500): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>HURC 2026 Official Registration Confirmation</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0704; color: #f5f5f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1a0f0a; border: 1px solid #78350f; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #ea580c, #b45309); padding: 30px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 26px; color: #ffffff; text-transform: uppercase; letter-spacing: 2px; }
          .header p { margin: 6px 0 0 0; color: #fed7aa; font-size: 13px; letter-spacing: 1px; }
          .body { padding: 28px 24px; }
          .badge { display: inline-block; padding: 6px 14px; background: #431407; border: 1px solid #ea580c; border-radius: 8px; color: #fdba74; font-size: 12px; font-weight: bold; margin-bottom: 20px; }
          .details-card { background: #26140b; border: 1px solid #451a03; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #3c1e0e; font-size: 14px; }
          .row:last-child { border-bottom: none; }
          .label { color: #a8a29e; }
          .value { color: #fafaf9; font-weight: 600; text-align: right; }
          .modules-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
          .module-tag { background: #9a3412; color: #ffedd5; font-size: 11px; font-weight: bold; padding: 4px 8px; border-radius: 6px; }
          .members-box { background: #190c06; border-radius: 8px; padding: 12px; margin-top: 15px; font-size: 13px; }
          .btn { display: inline-block; width: 100%; text-align: center; background: #ea580c; color: #ffffff; text-decoration: none; padding: 14px; border-radius: 10px; font-weight: bold; font-size: 15px; margin-top: 20px; box-sizing: border-box; }
          .footer { background: #120905; padding: 20px; text-align: center; font-size: 12px; color: #78716c; border-top: 1px solid #3c1e0e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HURC 2026</h1>
            <p>HABIB UNIVERSITY ROBOTICS COMPETITION</p>
          </div>
          <div class="body">
            <div class="badge">REGISTRATION CONFIRMED • ID: ${reg.id}</div>
            
            <p style="font-size: 16px; margin-top: 0; line-height: 1.5;">
              Dear <strong>${reg.leader.fullName}</strong>,
            </p>
            <p style="font-size: 14px; color: #d6d3d1; line-height: 1.6;">
              Congratulations! Your team <strong>${reg.teamName}</strong> has been successfully registered for the <strong>Habib University Robotics Competition 2026</strong>. Below is your official registration summary and e-dossier.
            </p>

            <div class="details-card">
              <div class="row">
                <span class="label">Team Name</span>
                <span class="value">${reg.teamName}</span>
              </div>
              <div class="row">
                <span class="label">Team Leader</span>
                <span class="value">${reg.leader.fullName} (${reg.leader.email})</span>
              </div>
              <div class="row">
                <span class="label">Contact / Phone</span>
                <span class="value">${reg.leader.phone}</span>
              </div>
              <div class="row">
                <span class="label">Institute / University</span>
                <span class="value">${reg.leader.university}</span>
              </div>
              <div class="row">
                <span class="label">Total Members</span>
                <span class="value">${reg.memberCount} Members</span>
              </div>
              <div class="row">
                <span class="label">Registration Fee</span>
                <span class="value" style="color: #fb923c;">PKR ${totalFeePKR.toLocaleString()}</span>
              </div>
              <div class="row">
                <span class="label">Status</span>
                <span class="value" style="color: #34d399;">${reg.status}</span>
              </div>
            </div>

            <div class="details-card">
              <span class="label" style="font-size: 12px; text-transform: uppercase; font-weight: bold; color: #fb923c; display: block; margin-bottom: 8px;">
                Registered Competition Modules:
              </span>
              <div class="modules-list">
                ${reg.selectedModules.map(m => `<span class="module-tag">${m.toUpperCase().replace('-', ' ')}</span>`).join(' ')}
              </div>

              <div class="members-box">
                <strong style="color: #e7e5e4;">Registered Team Roster:</strong>
                <div style="margin-top: 6px; color: #a8a29e; line-height: 1.6;">
                  1. ${reg.leader.fullName} (Leader) - ${reg.leader.cnic}<br>
                  ${reg.members.map((m, i) => `${i + 2}. ${m.fullName} - ${m.cnic} (${m.university})`).join('<br>')}
                </div>
              </div>
            </div>

            <p style="font-size: 13px; color: #a8a29e; line-height: 1.6;">
              <strong>Important Next Steps:</strong><br>
              • Keep your Registration ID <code>${reg.id}</code> safe for entry at the Habib University campus security gate.<br>
              • All teams must arrive 60 minutes prior to match schedule for hardware safety scrutineering.<br>
              • Official WhatsApp group invitations and match draw brackets will be communicated via your leader email.
            </p>

            <a href="https://hurc2026.vercel.app/#/register" class="btn">View &amp; Print Team Slip</a>
          </div>
          <div class="footer">
            © 2026 Habib University Robotics Competition (HURC).<br>
            Habib University, Block 18, Gulistan-e-Jauhar, University Avenue, Karachi.<br>
            Need assistance? Contact hurc.support@habib.edu.pk
          </div>
        </div>
      </body>
    </html>
  `;
}

export function generateAmbassadorConfirmationEmailHtml(reg: AmbassadorRegistrationData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>HURC 2026 Ambassador Application Received</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0704; color: #f5f5f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #1a0f0a; border: 1px solid #78350f; border-radius: 16px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #ea580c, #b45309); padding: 30px 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 26px; color: #ffffff; text-transform: uppercase; letter-spacing: 2px; }
          .body { padding: 28px 24px; }
          .badge { display: inline-block; padding: 6px 14px; background: #431407; border: 1px solid #ea580c; border-radius: 8px; color: #fdba74; font-size: 12px; font-weight: bold; margin-bottom: 20px; }
          .details-card { background: #26140b; border: 1px solid #451a03; border-radius: 12px; padding: 18px; margin-bottom: 20px; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #3c1e0e; font-size: 14px; }
          .label { color: #a8a29e; }
          .value { color: #fafaf9; font-weight: 600; text-align: right; }
          .footer { background: #120905; padding: 20px; text-align: center; font-size: 12px; color: #78716c; border-top: 1px solid #3c1e0e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>HURC 2026</h1>
            <p>CAMPUS AMBASSADOR PROGRAM</p>
          </div>
          <div class="body">
            <div class="badge">APPLICATION SUBMITTED • ID: ${reg.id}</div>
            <p style="font-size: 16px; margin-top: 0;">Dear <strong>${reg.fullName}</strong>,</p>
            <p style="font-size: 14px; color: #d6d3d1; line-height: 1.6;">
              Thank you for applying to be a Campus Ambassador for HURC 2026 representing <strong>${reg.university}</strong>! Our organizing committee has received your submission and will review your outreach strategy.
            </p>
            <div class="details-card">
              <div class="row"><span class="label">Candidate</span><span class="value">${reg.fullName}</span></div>
              <div class="row"><span class="label">Email</span><span class="value">${reg.email}</span></div>
              <div class="row"><span class="label">Phone</span><span class="value">${reg.phone}</span></div>
              <div class="row"><span class="label">Institute</span><span class="value">${reg.university}</span></div>
              <div class="row"><span class="label">Status</span><span class="value" style="color: #38bdf8;">${reg.status}</span></div>
            </div>
            <p style="font-size: 13px; color: #a8a29e; line-height: 1.6;">
              Selected Ambassadors will receive official merchandise, exclusive networking passes, and certificates of distinction.
            </p>
          </div>
          <div class="footer">
            © 2026 Habib University Robotics Competition (HURC).<br>
            Habib University, Karachi.
          </div>
        </div>
      </body>
    </html>
  `;
}

// Dispatch email to registeree via the /api/send-email Vercel function and store record in Firestore
export async function sendRegistrationConfirmationEmail(
  reg: TeamRegistrationData | AmbassadorRegistrationData,
  totalFeePKR: number = 3500
): Promise<DispatchedEmail> {
  const isTeam = reg.type === 'team';
  const recipientEmail = isTeam 
    ? (reg as TeamRegistrationData).leader.email 
    : (reg as AmbassadorRegistrationData).email;
  const recipientName = isTeam 
    ? (reg as TeamRegistrationData).leader.fullName 
    : (reg as AmbassadorRegistrationData).fullName;

  const subject = isTeam
    ? `[HURC 2026] Registration Confirmed: ${(reg as TeamRegistrationData).teamName} (#${reg.id})`
    : `[HURC 2026] Ambassador Application Received (#${reg.id})`;

  const htmlContent = isTeam
    ? generateTeamConfirmationEmailHtml(reg as TeamRegistrationData, totalFeePKR)
    : generateAmbassadorConfirmationEmailHtml(reg as AmbassadorRegistrationData);

  const emailRecord: DispatchedEmail = {
    id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    registrationId: reg.id,
    recipientEmail,
    recipientName,
    subject,
    type: isTeam ? 'team_confirmation' : 'ambassador_confirmation',
    htmlContent,
    status: 'Sent',
    timestamp: new Date().toISOString(),
    sentAt: new Date().toLocaleString()
  };

  // Attempt real delivery through the serverless endpoint
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: recipientEmail,
        subject,
        html: htmlContent
      })
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      emailRecord.status = 'Delivered';
    } else {
      emailRecord.status = 'Failed';
      console.warn('Email API returned error:', data?.error || res.status);
    }
  } catch (err) {
    emailRecord.status = 'Failed';
    console.warn('Email dispatch failed (recorded as Failed):', err);
  }

  try {
    // Persist dispatched email to Firestore
    await setDoc(doc(db, 'emails', emailRecord.id), emailRecord);
  } catch (error) {
    console.warn('Could not write email log to Firestore (continuing locally):', error);
  }

  // Also cache to localStorage outbox
  try {
    const existing = JSON.parse(localStorage.getItem('hurc_dispatched_emails') || '[]');
    localStorage.setItem('hurc_dispatched_emails', JSON.stringify([emailRecord, ...existing]));
  } catch (e) {
    // ignore
  }

  return emailRecord;
}

export async function getDispatchedEmails(): Promise<DispatchedEmail[]> {
  try {
    const snap = await getDocs(collection(db, 'emails'));
    const list: DispatchedEmail[] = [];
    snap.forEach(d => list.push(d.data() as DispatchedEmail));
    if (list.length > 0) {
      return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  } catch (e) {
    console.warn('Falling back to local email records');
  }

  try {
    return JSON.parse(localStorage.getItem('hurc_dispatched_emails') || '[]');
  } catch {
    return [];
  }
}
