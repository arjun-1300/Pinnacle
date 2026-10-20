// pages/DashboardPage.jsx — Baseten-Inspired Clinical Multi-Agent Dashboard
import { useState, useCallback, useEffect } from 'react'
import { api } from '../api'
import { AppShell } from '../components/layout/AppShell'
import { Navbar } from '../components/layout/Navbar'
import { ClinicalCommandHeader } from '../components/dashboard/ClinicalCommandHeader'
import { VitalsForm } from '../components/dashboard/VitalsForm'
import { AgentRiskCard } from '../components/dashboard/AgentRiskCard'
import { SafetyBanner } from '../components/dashboard/SafetyBanner'
import { PhysicianApprovalBar } from '../components/dashboard/PhysicianApprovalBar'
import { MultiAgentPipelineSection } from '../components/dashboard/MultiAgentPipelineSection'
import { AuditTimeline } from '../components/dashboard/AuditTimeline'
import { ToastContainer, toast } from '../components/ui/Toast'

export function DashboardPage() {
  const [result, setResult] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  const [auditEntries, setAuditEntries] = useState([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [serverOnline, setServerOnline] = useState(false)

  // Initial health check
  useEffect(() => {
    api.health()
      .then(() => setServerOnline(true))
      .catch(() => setServerOnline(false))
  }, [])

  const refreshAudit = useCallback(async () => {
    setAuditLoading(true)
    try {
      const data = await api.audit()
      const sorted = Array.isArray(data) ? [...data].reverse() : []
      setAuditEntries(sorted)
    } catch {
      /* Backend offline or unreachable */
    } finally {
      setAuditLoading(false)
    }
  }, [])

  async function handleAnalyze(payload) {
    setAnalyzing(true)
    setError(null)
    try {
      const data = await api.analyze(payload)
      setResult(data)
      setServerOnline(true)

      if (data.drug_blocked) {
        toast.error(
          'Safety Interceptor Triggered',
          `Prescription blocked: ${data.candidate_drug || 'contraindicated agent'}.`
        )
      } else {
        toast.success(
          'Inference Completed',
          `Risk assessed as ${data.predicted_risk} (${Math.round((data.confidence || 0) * 100)}% conf).`
        )
      }

      refreshAudit()
    } catch (err) {
      const msg = err.message || 'Analysis request failed'
      setError(msg)
      setServerOnline(false)
      toast.error('Pipeline Execution Error', msg)
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleQuickSimulate() {
    try {
      const data = await api.simulate()
      await handleAnalyze({
        heart_rate: data.heart_rate,
        spo2: data.spo2,
        temperature: data.temperature,
        systolic_bp: data.systolic_bp,
        current_meds: data.current_meds || [],
        allergies: data.allergies || [],
      })
      document.getElementById('clinical-console')?.scrollIntoView({ behavior: 'smooth' })
    } catch (err) {
      document.getElementById('clinical-console')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  async function handleDecide(choice) {
    const data = await api.decide(choice)
    setServerOnline(true)
    refreshAudit()
    return data
  }

  return (
    <AppShell navbar={<Navbar />}>
      <div className="dashboard-container">
        {/* ── Baseten-Themed Clinical Command Header ── */}
        <ClinicalCommandHeader
          onQuickSimulate={handleQuickSimulate}
          onScrollToInput={() => document.getElementById('clinical-console')?.scrollIntoView({ behavior: 'smooth' })}
        />

        {/* ── 2-Column Clinical Workbench Grid ── */}
        <div className="dashboard-grid">
          {/* Left Column (40%): Patient Input Console */}
          <div className="dashboard-left">
            <VitalsForm onAnalyze={handleAnalyze} loading={analyzing} />

            {error && (
              <div style={{
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 2,
                color: '#b91c1c',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}>
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Right Column (60%): Assessment, Safety & Physician Governance */}
          <div className="dashboard-right">
            <AgentRiskCard result={result} />
            <SafetyBanner result={result} />
            <PhysicianApprovalBar
              result={result}
              onDecide={handleDecide}
              onAuditRefresh={refreshAudit}
            />
          </div>
        </div>

        {/* ── 4-Agent Autonomous Pipeline Full Breakdown (Baseten Blueprint Style) ── */}
        <MultiAgentPipelineSection result={result} />

        {/* ── Full-width Bottom Section: Audit Trail & Compliance Table ── */}
        <div className="dashboard-bottom">
          <AuditTimeline
            entries={auditEntries}
            loading={auditLoading}
            onRefresh={refreshAudit}
          />
        </div>
      </div>

      <ToastContainer />
    </AppShell>
  )
}
export default DashboardPage
