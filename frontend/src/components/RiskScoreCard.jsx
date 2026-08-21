import React, { useEffect, useRef } from 'react';
import { getRiskStyling, fmt2, fmtPct } from '../utils/formatters';

/**
 * Draws a semi-circular arc gauge on a <canvas> element.
 */
const RiskMeter = ({ score, riskLevel }) => {
  const canvasRef = useRef(null);
  const style = getRiskStyling(riskLevel);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const cx = W / 2;
    const cy = H * 0.72;
    const radius = Math.min(W, H) * 0.38;
    const strokeWidth = 12;
    const startAngle = Math.PI;       // 9 o'clock (left)
    const endAngle = 2 * Math.PI;     // 3 o'clock (right)

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Zone arcs (LOW / MEDIUM / HIGH)
    const zones = [
      { from: 0, to: 30, color: 'rgba(16,185,129,0.5)' },
      { from: 30, to: 70, color: 'rgba(245,158,11,0.5)' },
      { from: 70, to: 100, color: 'rgba(239,68,68,0.5)' },
    ];
    zones.forEach(({ from, to, color }) => {
      const aStart = startAngle + (from / 100) * Math.PI;
      const aEnd = startAngle + (to / 100) * Math.PI;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, aStart, aEnd);
      ctx.strokeStyle = color;
      ctx.lineWidth = strokeWidth - 2;
      ctx.lineCap = 'butt';
      ctx.stroke();
    });

    // Score arc
    const clampedScore = Math.min(Math.max(score || 0, 0), 100);
    const scoreAngle = startAngle + (clampedScore / 100) * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, startAngle, scoreAngle);
    ctx.strokeStyle = style.meter;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Needle dot at score position
    const dotX = cx + radius * Math.cos(scoreAngle);
    const dotY = cy + radius * Math.sin(scoreAngle);
    ctx.beginPath();
    ctx.arc(dotX, dotY, 7, 0, 2 * Math.PI);
    ctx.fillStyle = style.meter;
    ctx.shadowColor = style.meter;
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Labels: 0, 30, 70, 100
    const labelData = [
      { val: 0, pct: 0 },
      { val: 30, pct: 30 },
      { val: 70, pct: 70 },
      { val: 100, pct: 100 },
    ];
    ctx.font = `500 10px Inter, system-ui, sans-serif`;
    ctx.fillStyle = 'rgba(148,163,184,0.9)';
    ctx.textAlign = 'center';
    labelData.forEach(({ val, pct }) => {
      const angle = startAngle + (pct / 100) * Math.PI;
      const lx = cx + (radius + 20) * Math.cos(angle);
      const ly = cy + (radius + 20) * Math.sin(angle);
      ctx.fillText(val, lx, ly);
    });

    // Zone text labels
    const zoneLabels = [
      { label: 'LOW', pct: 15, color: 'rgba(16,185,129,0.9)' },
      { label: 'MED', pct: 50, color: 'rgba(245,158,11,0.9)' },
      { label: 'HIGH', pct: 85, color: 'rgba(239,68,68,0.9)' },
    ];
    ctx.font = `600 9px Inter, system-ui, sans-serif`;
    zoneLabels.forEach(({ label, pct, color }) => {
      const angle = startAngle + (pct / 100) * Math.PI;
      const lx = cx + (radius - 24) * Math.cos(angle);
      const ly = cy + (radius - 24) * Math.sin(angle);
      ctx.fillStyle = color;
      ctx.fillText(label, lx, ly);
    });
  }, [score, riskLevel, style.meter]);

  return (
    <div className="risk-meter-wrap">
      <canvas
        ref={canvasRef}
        className="risk-meter-canvas"
        aria-label={`Risk meter showing score ${score}`}
      />
      <div className="risk-meter-center">
        <span className="meter-score">{fmt2(score)}</span>
        <span className="meter-label">/ 100</span>
      </div>
    </div>
  );
};

const RiskScoreCard = ({ result }) => {
  const style = getRiskStyling(result.risk_level);

  return (
    <div className={`card risk-score-card ${style.border} ${style.glow}`}>
      <div className="card-header">
        <div className="card-header-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div>
          <h2 className="card-title">Risk Assessment Result</h2>
          <p className="card-subtitle">XGBoost model output · SHAP explained</p>
        </div>
      </div>

      {/* Risk Level Badge */}
      <div className="risk-level-row">
        <span className={`risk-badge ${style.badge}`}>
          {result.risk_level || '—'}
        </span>
        <div className="risk-meta">
          <span className="risk-meta-label">Confidence</span>
          <span className={`risk-meta-value ${style.accent}`}>
            {result.confidence || '—'}
          </span>
        </div>
      </div>

      {/* Gauge */}
      <RiskMeter score={result.risk_score} riskLevel={result.risk_level} />

      {/* Stats Grid */}
      <div className="risk-stats-grid">
        <div className="risk-stat">
          <span className="stat-label">Risk Score</span>
          <span className={`stat-value ${style.accent}`}>
            {fmt2(result.risk_score)}
          </span>
        </div>
        <div className="risk-stat">
          <span className="stat-label">Fraud Probability</span>
          <span className={`stat-value ${style.accent}`}>
            {result.fraud_probability !== undefined && result.fraud_probability !== null
              ? (result.fraud_probability * 100).toFixed(2) + '%'
              : '—'}
          </span>
        </div>
        <div className="risk-stat">
          <span className="stat-label">ML Decision</span>
          <span className="stat-value">{result.ml_decision || '—'}</span>
        </div>
        <div className="risk-stat">
          <span className="stat-label">Recommended Action</span>
          <span className="stat-value">{result.recommended_action || result.action || '—'}</span>
        </div>
      </div>
    </div>
  );
};

export default RiskScoreCard;
