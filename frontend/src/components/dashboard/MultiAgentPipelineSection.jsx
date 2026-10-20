// components/dashboard/MultiAgentPipelineSection.jsx — Baseten Engineering Architecture Style
import { useState } from 'react'
import {
  Activity,
  Pill,
  Brain,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Cpu,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  Sliders,
  Layers,
  Terminal,
  Zap
} from 'lucide-react'

export function MultiAgentPipelineSection({ result }) {
  const [selectedAgent, setSelectedAgent] = useState('all') // 'all' or 1, 2, 3, 4
  const [collapsed, setCollapsed] = useState(false)

  // Agent specifications and data mapping
  const agents = [
    {
      id: 1,
      key: 'monitoring_agent',
      num: '01',
      title: 'Physiological Monitoring Agent',
      shortName: '01 / MONITORING',
      icon: <Activity size={18} />,
      color: '#008744',
      pillBg: '#e6fcf1',
      pillBorder: 'rgba(0, 229, 117, 0.5)',
      isLlm: result?.agent_llm_status?.monitoring_agent,
      techLabel: result?.agent_llm_status?.monitoring_agent ? 'GEMINI 3 FLASH' : 'RANDOMFOREST ML',
      whatItDoes: 'Continuous biometric telemetry ingestion (HR, SpO2, Temp, SBP), automated anomaly detection, and patient hemodynamic risk tier stratification.',
      inputsProcessed: result?.vitals ? [
        { label: 'HR', value: `${result.vitals.heart_rate} bpm` },
        { label: 'SpO₂', value: `${result.vitals.spo2}%` },
        { label: 'Temp', value: `${result.vitals.temperature}°C` },
        { label: 'SBP', value: `${result.vitals.systolic_bp} mmHg` },
      ] : [
        { label: 'HR', value: '75-160 bpm' },
        { label: 'SpO₂', value: '85-99%' },
        { label: 'Temp', value: '36.5-40°C' },
        { label: 'SBP', value: '90-170 mmHg' },
      ],
      clinicalReasoning: result?.monitoring_reasoning || 'Evaluates physiological signals against clinical thresholds and learned Gaussian vital distributions.',
      outputSummary: result ? {
        headline: `Triage Tier: ${result.predicted_risk}`,
        detail: `Confidence: ${Math.round((result.confidence || 0) * 100)}%`,
        tag: result.predicted_risk,
        tagBg: result.predicted_risk === 'Critical' ? '#fee2e2' : result.predicted_risk === 'Warning' ? '#fef3c7' : '#dcfce7',
        tagColor: result.predicted_risk === 'Critical' ? '#991b1b' : result.predicted_risk === 'Warning' ? '#92400e' : '#166534',
      } : {
        headline: 'Awaiting Vitals Stream',
        detail: 'Standby for ingest',
        tag: 'STANDBY',
        tagBg: '#f3f4f6',
        tagColor: '#374151',
      },
    },
    {
      id: 2,
      key: 'medication_agent',
      num: '02',
      title: 'Pharmacovigilance & Medication Agent',
      shortName: '02 / PHARMACOLOGY',
      icon: <Pill size={18} />,
      color: '#b45309',
      pillBg: '#fffbeb',
      pillBorder: 'rgba(245, 158, 11, 0.4)',
      isLlm: result?.agent_llm_status?.medication_agent,
      techLabel: result?.agent_llm_status?.medication_agent ? 'GEMINI 3 FLASH' : 'DDI RULES ENGINE',
      whatItDoes: 'Conducts automated pharmacological cross-referencing against active medications and documented allergies to preempt drug-drug interactions (DDIs).',
      inputsProcessed: result ? [
        { label: 'Active Meds', value: result.current_medications?.length ? result.current_medications.join(', ') : 'None' },
        { label: 'Allergies', value: result.known_allergies?.length ? result.known_allergies.join(', ') : 'None' },
        { label: 'Risk Context', value: result.predicted_risk || 'Normal' },
      ] : [
        { label: 'Meds Pool', value: 'warfarin, lisinopril, metformin' },
        { label: 'Allergy Pool', value: 'aspirin, ibuprofen, penicillin' },
      ],
      clinicalReasoning: result?.medication_reasoning || 'Surveils enzyme competitive inhibition and additive hemorrhage / nephrotoxic risks across drug pairs.',
      outputSummary: result ? {
        headline: result.interaction_warnings?.length ? `${result.interaction_warnings.length} DDI Warning(s)` : 'No DDI Conflicts Found',
        detail: result.avoid_list?.length ? `Contraindicated: ${result.avoid_list.join(', ')}` : 'Profile cleared',
        tag: result.interaction_warnings?.length ? 'DDI FLAGGED' : 'CLEARED',
        tagBg: result.interaction_warnings?.length ? '#fef3c7' : '#dcfce7',
        tagColor: result.interaction_warnings?.length ? '#92400e' : '#166534',
      } : {
        headline: 'DDI Database Ready',
        detail: 'Pre-loaded interaction graph',
        tag: 'READY',
        tagBg: '#f3f4f6',
        tagColor: '#374151',
      },
    },
    {
      id: 3,
      key: 'decision_agent',
      num: '03',
      title: 'Clinical Decision & Intervention Agent',
      shortName: '03 / DECISION',
      icon: <Brain size={18} />,
      color: '#1d4ed8',
      pillBg: '#eff6ff',
      pillBorder: 'rgba(59, 130, 246, 0.4)',
      isLlm: result?.agent_llm_status?.decision_agent,
      techLabel: result?.agent_llm_status?.decision_agent ? 'GEMINI 3 FLASH' : 'CLINICAL HEURISTIC',
      whatItDoes: 'Synthesizes biometric acuity with pharmacological contraindications to generate prioritized clinical action plans and propose therapeutic candidates.',
      inputsProcessed: result ? [
        { label: 'Acuity', value: result.predicted_risk || 'Normal' },
        { label: 'Filter', value: `${result.avoid_list?.length || 0} restricted` },
        { label: 'Telemetry', value: `${result.vitals?.heart_rate || '--'} HR / ${result.vitals?.spo2 || '--'}% SpO2` },
      ] : [
        { label: 'Synthesis', value: 'Vitals + Pharmacological avoid-list' },
        { label: 'Output', value: 'Clinical protocol + Candidate Rx' },
      ],
      clinicalReasoning: result?.clinical_rationale || 'Formulates evidence-based resuscitation, monitoring orders, and anti-pyretic selection adhering to avoid lists.',
      outputSummary: result ? {
        headline: result.candidate_drug ? `Candidate Drug: ${result.candidate_drug}` : 'Supportive Protocol',
        detail: `${result.suggested_actions?.length || 0} Interventions Synthesized`,
        tag: `${result.suggested_actions?.length || 0} ACTIONS`,
        tagBg: '#e0e7ff',
        tagColor: '#3730a3',
      } : {
        headline: 'Protocol Generator',
        detail: 'Guideline-driven synthesis',
        tag: 'READY',
        tagBg: '#f3f4f6',
        tagColor: '#374151',
      },
    },
    {
      id: 4,
      key: 'safety_agent',
      num: '04',
      title: 'Safety Interceptor & Regulatory Gatekeeper',
      shortName: '04 / SAFETY GATE',
      icon: result?.drug_blocked ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />,
      color: result?.drug_blocked ? '#b91c1c' : '#008744',
      pillBg: result?.drug_blocked ? '#fef2f2' : '#e6fcf1',
      pillBorder: result?.drug_blocked ? 'rgba(239, 68, 68, 0.4)' : 'rgba(0, 229, 117, 0.4)',
      isLlm: result?.agent_llm_status?.safety_agent,
      techLabel: result?.agent_llm_status?.safety_agent ? 'GEMINI 3 FLASH' : 'DETERMINISTIC GATE',
      whatItDoes: 'Autonomous pre-execution interceptor enforcing zero-tolerance safety bounds, checking candidate prescriptions against allergies and severe DDIs before physician review.',
      inputsProcessed: result ? [
        { label: 'Audited Drug', value: result.candidate_drug || 'None' },
        { label: 'Allergies', value: result.known_allergies?.length ? result.known_allergies.join(', ') : 'None' },
        { label: 'Avoid List', value: result.avoid_list?.length ? result.avoid_list.join(', ') : 'None' },
      ] : [
        { label: 'Enforcement', value: 'Zero-tolerance allergy & DDI gate' },
        { label: 'Audit', value: 'Physician override or approval' },
      ],
      clinicalReasoning: result?.safety_reasoning || 'Intercepts orders that conflict with documented allergies or black-box anticoagulant combinations.',
      outputSummary: result ? {
        headline: result.drug_blocked ? `INTERCEPTED: Blocked ${result.candidate_drug}` : (result.final_drug ? `CLEARED: ${result.final_drug} Safe` : 'Verified Safe'),
        detail: result.drug_blocked ? (result.block_reason || 'Severe clinical contraindication') : 'Zero contraindications detected',
        tag: result.drug_blocked ? '🛑 BLOCKED' : '✅ CLEARED',
        tagBg: result.drug_blocked ? '#fee2e2' : '#dcfce7',
        tagColor: result.drug_blocked ? '#991b1b' : '#166534',
      } : {
        headline: 'Safety Firewall Active',
        detail: 'Zero-tolerance enforcement',
        tag: 'SHIELD ON',
        tagBg: '#e6fcf1',
        tagColor: '#005a2b',
      },
    },
  ]

  const activeAgents = selectedAgent === 'all'
    ? agents
    : agents.filter(a => a.id === Number(selectedAgent))

  return (
    <div id="multi-agent-pipeline" className="card" style={{ marginTop: 20 }}>
      {/* ── Baseten Header Bar ────────────────────────────────────── */}
      <div className="card-header" style={{ marginBottom: 16 }}>
        <div className="card-title-row">
          <span className="baseten-badge">
            <span className="pulse-dot" />
            ARCHITECTURE / 4 AUTONOMOUS AGENTS
          </span>
          <span className="baseten-pill-green">
            <Sparkles size={11} style={{ marginRight: 4 }} />
            REAL-TIME PIPELINE
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Filter Pills */}
          <div style={{
            display: 'flex',
            background: '#fafaf9',
            padding: 3,
            borderRadius: 2,
            border: '1px solid #d1d5db',
            gap: 2,
          }}>
            <button
              onClick={() => setSelectedAgent('all')}
              style={{
                background: selectedAgent === 'all' ? '#000000' : 'transparent',
                color: selectedAgent === 'all' ? '#ffffff' : '#4b5563',
                border: 'none',
                borderRadius: 2,
                padding: '4px 10px',
                fontSize: '0.70rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              ALL 4 AGENTS
            </button>
            {agents.map((ag) => (
              <button
                key={ag.id}
                onClick={() => setSelectedAgent(ag.id)}
                style={{
                  background: selectedAgent === ag.id ? '#000000' : 'transparent',
                  color: selectedAgent === ag.id ? '#ffffff' : '#4b5563',
                  border: 'none',
                  borderRadius: 2,
                  padding: '4px 8px',
                  fontSize: '0.70rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {ag.num}
              </button>
            ))}
          </div>

          {/* Collapse/Expand Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="btn-baseten-outline"
            style={{ padding: '4px 8px', fontSize: '0.70rem', height: 28 }}
            title={collapsed ? 'Expand Pipeline' : 'Collapse Pipeline'}
          >
            {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* ── Subtitle Description ───────────────────────────────────── */}
      <div style={{
        fontSize: '0.82rem',
        color: '#4b5563',
        lineHeight: 1.5,
        marginBottom: 16,
      }}>
        Sequential collaborative intelligence: Each specialized agent operates with autonomous telemetry, strict domain boundaries, and Google Gemini 3 Flash synthesis.
      </div>

      {/* ── Stepper Navigation Tabs (Baseten Blueprint Style) ──────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 8,
        marginBottom: 20,
      }}>
        {agents.map((ag) => {
          const isSelected = selectedAgent === 'all' || selectedAgent === ag.id
          return (
            <div
              key={ag.id}
              onClick={() => setSelectedAgent(ag.id === selectedAgent ? 'all' : ag.id)}
              style={{
                cursor: 'pointer',
                padding: '10px 14px',
                borderRadius: 2,
                background: isSelected ? '#ffffff' : '#fafaf9',
                border: isSelected ? '1px solid #000000' : '1px dashed #d1d5db',
                boxShadow: isSelected ? '2px 2px 0px #000' : 'none',
                transition: 'all 0.15s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  fontFamily: 'var(--font-mono)',
                  color: ag.color,
                }}>
                  AGENT {ag.num}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.62rem',
                  padding: '1px 6px',
                  borderRadius: 2,
                  background: ag.isLlm ? '#e6fcf1' : '#f3f4f6',
                  color: ag.isLlm ? '#005a2b' : '#374151',
                  fontWeight: 700,
                  border: '1px solid rgba(0,0,0,0.1)',
                }}>
                  {ag.isLlm ? '✨ LLM' : 'RULE'}
                </span>
              </div>

              <div style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                color: '#000000',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {ag.title.replace(' Agent', '')}
              </div>

              <div style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                color: '#6b7280',
                marginTop: 2,
              }}>
                {ag.outputSummary?.tag || 'READY'}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Detailed Agent Deployment Cards ────────────────────────── */}
      {!collapsed && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: selectedAgent === 'all' ? 'repeat(auto-fit, minmax(320px, 1fr))' : '1fr',
          gap: 16,
        }}>
          {activeAgents.map((agent) => (
            <div
              key={agent.id}
              style={{
                borderRadius: 4,
                background: '#ffffff',
                border: '1px solid #e5e7eb',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                position: 'relative',
              }}
            >
              {/* Header: Number, Title, and Baseten Tech Badge */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    background: agent.pillBg,
                    color: agent.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${agent.pillBorder}`,
                    flexShrink: 0,
                  }}>
                    {agent.icon}
                  </div>
                  <div>
                    <div style={{
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.08em',
                      color: agent.color,
                    }}>
                      AGENT {agent.num} // DEPLOYED RUNTIME
                    </div>
                    <div style={{
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: '#000000',
                      lineHeight: 1.3,
                    }}>
                      {agent.title}
                    </div>
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  padding: '3px 8px',
                  borderRadius: 2,
                  background: agent.isLlm ? '#e6fcf1' : '#f3f4f6',
                  border: `1px solid ${agent.isLlm ? 'rgba(0,229,117,0.5)' : '#d1d5db'}`,
                  color: agent.isLlm ? '#005a2b' : '#374151',
                }}>
                  {agent.isLlm ? <Sparkles size={11} /> : <Cpu size={11} />}
                  <span>{agent.techLabel}</span>
                </div>
              </div>

              {/* SECTION 1: What This Agent Does */}
              <div style={{
                background: '#fafaf9',
                borderRadius: 2,
                padding: '10px 14px',
                border: '1px dashed #d1d5db',
              }}>
                <div style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  color: '#4b5563',
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <Sliders size={12} style={{ color: agent.color }} />
                  WHAT THIS AGENT DOES
                </div>
                <div style={{
                  fontSize: '0.78rem',
                  lineHeight: 1.5,
                  color: '#374151',
                }}>
                  {agent.whatItDoes}
                </div>
              </div>

              {/* SECTION 2: Ingested Inputs Processed */}
              {agent.inputsProcessed && (
                <div>
                  <div style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.06em',
                    color: '#6b7280',
                    marginBottom: 6,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}>
                    <Layers size={12} style={{ color: agent.color }} />
                    INGESTED BIOMETRIC / CLINICAL INPUTS
                  </div>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                  }}>
                    {agent.inputsProcessed.map((inp, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: '0.72rem',
                          padding: '4px 8px',
                          borderRadius: 2,
                          background: '#ffffff',
                          border: '1px solid #e5e7eb',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span style={{ color: '#6b7280' }}>{inp.label}:</span>
                        <strong style={{ color: '#111827', fontFamily: 'var(--font-mono)' }}>
                          {inp.value}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 3: Live Clinical Reasoning */}
              <div style={{
                borderRadius: 2,
                background: '#fafaf9',
                padding: '12px 14px',
                border: '1px solid #e5e7eb',
                borderLeft: `3px solid ${agent.color}`,
              }}>
                <div style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  color: agent.color,
                  marginBottom: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={12} />
                    AI CLINICAL REASONING
                  </span>
                  {agent.isLlm && (
                    <span style={{
                      fontSize: '0.62rem',
                      fontFamily: 'var(--font-mono)',
                      background: 'rgba(0, 229, 117, 0.15)',
                      color: '#005a2b',
                      padding: '1px 6px',
                      borderRadius: 2,
                    }}>
                      LIVE GEMINI SYNTHESIS
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: '0.78rem',
                  lineHeight: 1.55,
                  color: '#1f2937',
                  fontStyle: result ? 'normal' : 'italic',
                }}>
                  {agent.clinicalReasoning}
                </div>
              </div>

              {/* SECTION 4: Output / Decision Verdict */}
              {agent.outputSummary && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 2,
                  background: '#fafaf9',
                  border: '1px solid #e5e7eb',
                  marginTop: 'auto',
                }}>
                  <div>
                    <div style={{
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      color: '#000000',
                    }}>
                      {agent.outputSummary.headline}
                    </div>
                    <div style={{
                      fontSize: '0.70rem',
                      color: '#4b5563',
                    }}>
                      {agent.outputSummary.detail}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.70rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    padding: '3px 10px',
                    borderRadius: 2,
                    background: agent.outputSummary.tagBg,
                    color: agent.outputSummary.tagColor,
                    border: '1px solid rgba(0,0,0,0.08)',
                    flexShrink: 0,
                  }}>
                    {agent.outputSummary.tag}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
