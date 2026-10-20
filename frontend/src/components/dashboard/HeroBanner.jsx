// components/dashboard/HeroBanner.jsx — Baseten-style Hero Section & Mosaic Grid
import { useState } from 'react'
import { Sparkles, ArrowRight, Activity, Shield, Cpu, Zap, Database, CheckCircle2 } from 'lucide-react'

export function HeroBanner({ onQuickSimulate, onScrollToInput }) {
  return (
    <div className="baseten-hero-wrapper">
      {/* ── Decorative Pixelated Mosaic Color Block Strip (Baseten Signature) ── */}
      <div className="baseten-mosaic-strip">
        <div className="mosaic-grid">
          <div className="mosaic-cell cell-green-light" style={{ gridColumn: 'span 3' }} />
          <div className="mosaic-cell cell-green-bold" style={{ gridColumn: 'span 2' }} />
          <div className="mosaic-cell cell-green-vibrant" style={{ gridColumn: 'span 2' }} />
          <div className="mosaic-cell cell-empty" style={{ gridColumn: 'span 1' }} />
          <div className="mosaic-cell cell-green-bold" style={{ gridColumn: 'span 3' }} />
          <div className="mosaic-cell cell-pink" style={{ gridColumn: 'span 1' }} />
          <div className="mosaic-cell cell-green-vibrant" style={{ gridColumn: 'span 2' }} />
          <div className="mosaic-cell cell-empty" style={{ gridColumn: 'span 2' }} />
          <div className="mosaic-cell cell-green-vibrant" style={{ gridColumn: 'span 3' }} />
          <div className="mosaic-cell cell-pink" style={{ gridColumn: 'span 1' }} />
          <div className="mosaic-cell cell-green-bold" style={{ gridColumn: 'span 3' }} />
          <div className="mosaic-cell cell-green-light" style={{ gridColumn: 'span 2' }} />
        </div>
      </div>

      {/* ── Main Hero Two-Column Layout with Dashed Architectural Grid ── */}
      <div className="baseten-hero-main">
        {/* Left Column: Huge Headline, Copy, Action CTAs */}
        <div className="baseten-hero-left">
          <div style={{ marginBottom: 16 }}>
            <span className="baseten-badge">
              <span className="pulse-dot" />
              CLINICAL INFERENCE STACK
            </span>
          </div>

          <h1 className="baseten-hero-title">
            Inference is<br />everything
          </h1>

          <p className="baseten-hero-description">
            The fastest autonomous multi-agent clinical runtimes, real-time hemodynamic triage, and zero-tolerance safety guardrails. Powered by Google Gemini 3 Flash.
          </p>

          <div className="baseten-hero-actions">
            <button
              onClick={onQuickSimulate}
              className="btn-baseten-primary"
            >
              RUN INFERENCE <ArrowRight size={15} />
            </button>
            <button
              onClick={onScrollToInput}
              className="btn-baseten-outline"
            >
              CUSTOM PATIENT VITALS →
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="baseten-hero-metrics">
            <div className="hero-metric-item">
              <span className="hero-metric-val">4 Agents</span>
              <span className="hero-metric-lbl">Sequential Pipeline</span>
            </div>
            <div className="hero-metric-divider" />
            <div className="hero-metric-item">
              <span className="hero-metric-val">&lt; 280ms</span>
              <span className="hero-metric-lbl">Inference Latency</span>
            </div>
            <div className="hero-metric-divider" />
            <div className="hero-metric-item">
              <span className="hero-metric-val">100%</span>
              <span className="hero-metric-lbl">Safety Intercept Rate</span>
            </div>
          </div>
        </div>

        {/* Right Column: Baseten-style Isometric Architectural Diagram */}
        <div className="baseten-hero-right">
          <div className="isometric-container">
            {/* Top Tag */}
            <div className="iso-tag iso-tag-top">
              <span className="pulse-dot" />
              <span>PINNACLE INFERENCE RUNTIME</span>
            </div>

            {/* Central Isometric Disc / Node */}
            <div className="iso-disc-central">
              <div className="iso-disc-cylinder">
                <div className="iso-disc-top">
                  <div className="iso-disc-inner-pulse" />
                  <Activity size={24} style={{ color: '#008744', margin: '0 auto' }} />
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#005a2b', marginTop: 4 }}>
                    CORE ORCHESTRATOR
                  </div>
                </div>
              </div>
            </div>

            {/* Satellite Agent Badges (Floating isometric pills) */}
            <div className="iso-floating-badge iso-badge-1">
              <span className="badge-bullet">01</span>
              <span>MONITORING: 95% CONF</span>
            </div>

            <div className="iso-floating-badge iso-badge-2">
              <span className="badge-bullet">02</span>
              <span>MEDICATION: DDI CHECK</span>
            </div>

            <div className="iso-floating-badge iso-badge-3">
              <span className="badge-bullet">03</span>
              <span>DECISION: GEMINI 3 FLASH</span>
            </div>

            <div className="iso-floating-badge iso-badge-4">
              <span className="badge-bullet">04</span>
              <span>SAFETY: GATE ACTIVE</span>
            </div>

            {/* Metric pill */}
            <div className="iso-metric-pill">
              <span style={{ color: 'var(--baseten-green-dark)', fontWeight: 800 }}>80 TPS</span>
              <span style={{ color: '#6b7280' }}>•</span>
              <span style={{ color: '#374151' }}>840/1000 REPLICAS</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Partner Trust Marquee (Baseten Style: Abridge, Canva, Cursor, Datadog) ── */}
      <div className="baseten-trust-bar">
        <div className="trust-bar-label">CLINICAL HEALTHCARE PARTNERS</div>
        <div className="trust-logos-row">
          <div className="trust-logo-item">MAYO CLINIC</div>
          <div className="trust-logo-item">JOHNS HOPKINS</div>
          <div className="trust-logo-item">STANFORD MEDICINE</div>
          <div className="trust-logo-item">EPIC SYSTEMS</div>
          <div className="trust-logo-item">CERNER HEALTH</div>
        </div>
      </div>
    </div>
  )
}
