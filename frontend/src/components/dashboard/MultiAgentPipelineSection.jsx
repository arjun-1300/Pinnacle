// components/dashboard/MultiAgentPipelineSection.jsx — Simple, Clean 4-Agent Workflow
import { Activity, Pill, Brain, ShieldCheck, ShieldAlert } from 'lucide-react'

export function MultiAgentPipelineSection({ result }) {
  const agents = [
    {
      id: 1,
      num: '01',
      title: 'Monitoring Agent',
      icon: <Activity size={18} />,
      color: '#008744',
      role: 'Monitors vital signs to detect patient health risks.',
      status: result ? result.predicted_risk : 'STANDBY',
      statusBg: result
        ? (result.predicted_risk === 'Critical' ? '#fee2e2' : result.predicted_risk === 'Warning' ? '#fef3c7' : '#dcfce7')
        : '#f3f4f6',
      statusColor: result
        ? (result.predicted_risk === 'Critical' ? '#991b1b' : result.predicted_risk === 'Warning' ? '#92400e' : '#166534')
        : '#4b5563',
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
      icon: <Pill size={18} />,
      color: '#b45309',
      role: 'Checks active medications against allergies and drug conflicts.',
      status: result
        ? (result.interaction_warnings?.length ? `${result.interaction_warnings.length} CONFLICTS` : 'CLEARED')
        : 'READY',
      statusBg: result
        ? (result.interaction_warnings?.length ? '#fef3c7' : '#dcfce7')
        : '#f3f4f6',
      statusColor: result
        ? (result.interaction_warnings?.length ? '#92400e' : '#166534')
        : '#4b5563',
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
      icon: <Brain size={18} />,
      color: '#1d4ed8',
      role: 'Recommends medical actions and appropriate care plans.',
      status: result
        ? `${result.suggested_actions?.length || 0} ACTIONS`
        : 'READY',
      statusBg: result ? '#eff6ff' : '#f3f4f6',
      statusColor: result ? '#1e40af' : '#4b5563',
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
      icon: result?.drug_blocked ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />,
      color: result?.drug_blocked ? '#b91c1c' : '#008744',
      role: 'Performs strict safety verification before doctor review.',
      status: result
        ? (result.drug_blocked ? 'BLOCKED' : 'CLEARED')
        : 'ACTIVE',
      statusBg: result
        ? (result.drug_blocked ? '#fee2e2' : '#dcfce7')
        : '#e6fcf1',
      statusColor: result
        ? (result.drug_blocked ? '#991b1b' : '#166534')
        : '#005a2b',
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
      <div className="card-header" style={{ marginBottom: 16 }}>
        <div className="card-title-row">
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
            4-Agent Multi-Agent Workflow
          </div>
        </div>
        <span style={{ fontSize: '0.72rem', color: '#6b7280', fontFamily: 'var(--font-mono)' }}>
          Collaborative Clinical Pipeline
        </span>
      </div>

      {/* ── Subtitle Description ── */}
      <div style={{
        fontSize: '0.84rem',
        color: '#4b5563',
        lineHeight: 1.5,
        marginBottom: 18,
      }}>
        Each specialized agent evaluates a distinct clinical domain: monitoring vitals, reviewing medications, planning care, and verifying safety.
      </div>

      {/* ── Simple 4-Card Grid (1, 2, 3, 4) ── */}
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
              border: '1px solid #e5e7eb',
              borderRadius: 4,
              padding: '16px 18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 12,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'border-color 0.15s ease',
            }}
          >
            {/* Header: Number, Name, Status Badge */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  background: '#111827',
                  color: '#ffffff',
                  padding: '2px 6px',
                  borderRadius: 2,
                }}>
                  {agent.num}
                </span>

                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 2,
                  background: agent.statusBg,
                  color: agent.statusColor,
                  border: '1px solid rgba(0,0,0,0.08)',
                }}>
                  {agent.status}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ color: agent.color }}>
                  {agent.icon}
                </span>
                <strong style={{ fontSize: '0.92rem', color: '#111827' }}>
                  {agent.title}
                </strong>
              </div>

              <p style={{ fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.45, marginBottom: 10 }}>
                {agent.role}
              </p>
            </div>

            {/* Live Finding / Status Block */}
            <div style={{
              background: '#fafaf9',
              border: '1px solid #e5e7eb',
              borderLeft: `3px solid ${agent.color}`,
              borderRadius: 3,
              padding: '10px 12px',
              fontSize: '0.78rem',
              lineHeight: 1.45,
              color: '#1f2937',
            }}>
              {agent.metric && (
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  color: '#4b5563',
                  marginBottom: 4,
                  paddingBottom: 4,
                  borderBottom: '1px dashed #e5e7eb',
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
