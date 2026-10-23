// components/dashboard/MultiAgentPipelineSection.jsx — Simple, Clean 4-Agent Workflow
import { Activity, Pill, Brain, ShieldCheck, ShieldAlert } from 'lucide-react'

export function MultiAgentPipelineSection({ result }) {
  const agents = [
    {
      id: 1,
      num: '01',
      title: 'Monitoring Agent',
      icon: <Activity size={18} strokeWidth={2.2} />,
      color: '#059669',
      iconBg: '#f0fdf4',
      iconBorder: '#bbf7d0',
      role: 'Monitors vital signs to detect patient health risks.',
      badge: 'RandomForest ML (99.02% F1)',
      status: result ? result.predicted_risk : 'STANDBY',
      statusBg: result
        ? (result.predicted_risk === 'Critical' ? '#fef2f2' : result.predicted_risk === 'Warning' ? '#fffbeb' : '#f0fdf4')
        : '#f8fafc',
      statusColor: result
        ? (result.predicted_risk === 'Critical' ? '#dc2626' : result.predicted_risk === 'Warning' ? '#d97706' : '#059669')
        : '#64748b',
      statusBorder: result
        ? (result.predicted_risk === 'Critical' ? '#fecaca' : result.predicted_risk === 'Warning' ? '#fde68a' : '#bbf7d0')
        : '#e2e8f0',
      finding: result
        ? (result.monitoring_reasoning || `Vital signs evaluated. Classified as ${result.predicted_risk} risk.`)
        : 'Standby for patient vitals input.',
      metric: result?.vitals
        ? `HR ${result.vitals.heart_rate} · SpO₂ ${result.vitals.spo2}% · ${result.vitals.temperature}°C · ${result.vitals.systolic_bp} mmHg`
        : null,
    },
    {
      id: 2,
      num: '02',
      title: 'Medication Agent',
      icon: <Pill size={18} strokeWidth={2.2} />,
      color: '#d97706',
      iconBg: '#fffbeb',
      iconBorder: '#fde68a',
      role: 'Checks active medications against allergies and drug conflicts.',
      badge: 'DDI Classifier ML (100% F1)',
      status: result
        ? (result.interaction_warnings?.length ? `${result.interaction_warnings.length} Conflicts` : 'Cleared')
        : 'Ready',
      statusBg: result
        ? (result.interaction_warnings?.length ? '#fffbeb' : '#f0fdf4')
        : '#f8fafc',
      statusColor: result
        ? (result.interaction_warnings?.length ? '#d97706' : '#059669')
        : '#64748b',
      statusBorder: result
        ? (result.interaction_warnings?.length ? '#fde68a' : '#bbf7d0')
        : '#e2e8f0',
      finding: result
        ? (result.medication_reasoning || (result.interaction_warnings?.length ? 'Medication interaction identified.' : 'No interaction conflicts detected.'))
        : 'Standby for medication screening.',
      metric: result?.current_medications?.length
        ? `Medications: ${result.current_medications.join(', ')}`
        : null,
    },
    {
      id: 3,
      num: '03',
      title: 'Decision Agent',
      icon: <Brain size={18} strokeWidth={2.2} />,
      color: '#2563eb',
      iconBg: '#eff6ff',
      iconBorder: '#bfdbfe',
      role: 'Recommends medical actions and appropriate care plans.',
      status: result
        ? `${result.suggested_actions?.length || 0} Actions`
        : 'Ready',
      statusBg: result ? '#eff6ff' : '#f8fafc',
      statusColor: result ? '#2563eb' : '#64748b',
      statusBorder: result ? '#bfdbfe' : '#e2e8f0',
      finding: result
        ? (result.clinical_rationale || `${result.suggested_actions?.length || 0} prioritized clinical care steps formulated.`)
        : 'Standby for care plan generation.',
      metric: result?.candidate_drug
        ? `Proposed Rx: ${result.candidate_drug}`
        : (result ? 'Supportive care protocol' : null),
    },
    {
      id: 4,
      num: '04',
      title: 'Safety Checking Agent',
      icon: result?.drug_blocked ? <ShieldAlert size={18} strokeWidth={2.2} /> : <ShieldCheck size={18} strokeWidth={2.2} />,
      color: result?.drug_blocked ? '#dc2626' : '#059669',
      iconBg: result?.drug_blocked ? '#fef2f2' : '#f0fdf4',
      iconBorder: result?.drug_blocked ? '#fecaca' : '#bbf7d0',
      role: 'Performs strict safety verification before doctor review.',
      status: result
        ? (result.drug_blocked ? 'Blocked' : 'Cleared')
        : 'Active',
      statusBg: result
        ? (result.drug_blocked ? '#fef2f2' : '#f0fdf4')
        : '#f8fafc',
      statusColor: result
        ? (result.drug_blocked ? '#dc2626' : '#059669')
        : '#64748b',
      statusBorder: result
        ? (result.drug_blocked ? '#fecaca' : '#bbf7d0')
        : '#e2e8f0',
      finding: result
        ? (result.safety_reasoning || (result.drug_blocked ? result.block_reason : 'Zero contraindications detected.'))
        : 'Pre-execution safety gate active.',
      metric: result?.drug_blocked
        ? `Intercepted: ${result.candidate_drug}`
        : (result?.final_drug ? `Verified: ${result.final_drug}` : null),
    },
  ]

  return (
    <div id="multi-agent-pipeline" className="card" style={{ marginTop: 20 }}>
      {/* ── Section Header ── */}
      <div className="card-header" style={{ marginBottom: 14 }}>
        <div className="card-title-row">
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
            4-Agent Multi-Agent Workflow
          </div>
        </div>
        <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 500 }}>
          Collaborative Clinical Pipeline
        </span>
      </div>

      {/* ── Subtitle Description ── */}
      <div style={{
        fontSize: '0.86rem',
        color: '#475569',
        lineHeight: 1.55,
        marginBottom: 18,
      }}>
        Each specialized agent evaluates a distinct clinical domain: monitoring vitals, reviewing medications, planning care, and verifying safety.
      </div>

      {/* ── Simple 4-Card Grid ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 16,
      }}>
        {agents.map((agent) => (
          <div
            key={agent.id}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 14,
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}
          >
            {/* Header: Number, Name, Status Badge */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  background: '#f1f5f9',
                  color: '#475569',
                  padding: '2px 7px',
                  borderRadius: 4,
                  border: '1px solid #e2e8f0',
                }}>
                  {agent.num}
                </span>

                <span style={{
                  fontSize: '0.70rem',
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 4,
                  background: agent.statusBg,
                  color: agent.statusColor,
                  border: `1px solid ${agent.statusBorder}`,
                }}>
                  {agent.status}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  background: agent.iconBg,
                  border: `1px solid ${agent.iconBorder}`,
                  color: agent.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {agent.icon}
                </div>
                <strong style={{ fontSize: '0.90rem', color: '#0f172a' }}>
                  {agent.title}
                </strong>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5, marginBottom: 8 }}>
                {agent.role}
              </p>

              {agent.badge && (
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.67rem',
                  fontWeight: 600,
                  color: '#047857',
                  background: '#ecfdf5',
                  padding: '2px 7px',
                  borderRadius: 4,
                  border: '1px solid #a7f3d0',
                  marginBottom: 10,
                }}>
                  <span style={{ fontSize: '0.75rem' }}>⚡</span> {agent.badge}
                </div>
              )}
            </div>

            {/* Live Finding / Status Block */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              padding: '10px 12px',
              fontSize: '0.78rem',
              lineHeight: 1.5,
              color: '#334155',
            }}>
              {agent.metric && (
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: '#475569',
                  marginBottom: 6,
                  paddingBottom: 6,
                  borderBottom: '1px solid #e2e8f0',
                }}>
                  {agent.metric}
                </div>
              )}
              <div>
                {agent.finding}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default MultiAgentPipelineSection
