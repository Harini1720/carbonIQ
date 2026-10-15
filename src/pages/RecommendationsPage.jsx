import React, { useState, useMemo } from 'react';
import { useCarbon } from '../context/CarbonContext';
import { generateRecommendations } from '../data/recommendationsEngine';
import RecommendationCard from '../components/recommendations/RecommendationCard';
import InfoNotice from '../components/common/InfoNotice';
import {
  Sparkles,
  Zap,
  Bus,
  Trash2,
  Filter,
  CheckCircle2,
  Sliders,
  Layers,
  Info
} from 'lucide-react';

export default function RecommendationsPage({ onNavigate }) {
  const {
    totalFootprint,
    inputs,
    currentGridFactor,
    applyRecommendationToScenario
  } = useCarbon();

  const [activeFilter, setActiveFilter] = useState('all');
  const [notification, setNotification] = useState(null);

  // Generate dynamic, mathematically linked recommendations
  const recommendations = useMemo(() => {
    return generateRecommendations(totalFootprint, inputs, currentGridFactor);
  }, [totalFootprint, inputs, currentGridFactor]);

  const filteredRecommendations = useMemo(() => {
    if (activeFilter === 'all') return recommendations;
    if (activeFilter === 'high') return recommendations.filter(r => r.priority === 'High Priority');
    if (activeFilter === 'quick') return recommendations.filter(r => r.priority === 'Quick Win');
    return recommendations.filter(r => r.category === activeFilter);
  }, [recommendations, activeFilter]);

  const handleApply = (rec) => {
    applyRecommendationToScenario(rec);
    setNotification(`Successfully applied "${rec.title}" to your Scenario Simulator!`);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="page-header-title">
              Data-Driven Sustainability Recommendations
            </h1>
            <span className="badge badge-green">
              Rule-Based Intelligence
            </span>
          </div>
          <p className="page-header-subtitle">
            Targeted decarbonization measures ranked by marginal carbon abatement efficiency and tailored to your campus emissions distribution.
          </p>
        </div>

        <button
          onClick={() => onNavigate('simulator')}
          className="btn btn-primary btn-sm"
          style={{ gap: '6px' }}
        >
          <Sliders size={15} />
          <span>Go to Scenario Simulator</span>
        </button>
      </div>

      <InfoNotice
        title="Rule-Based Intelligent Engine Architecture:"
        message="This engine operates transparently without external paid LLM APIs or black-box predictions. Recommendations are dynamically derived from marginal emission factors and ranked by actual campus data."
        type="verified"
      />

      {/* Applied Banner Notification */}
      {notification && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid var(--primary)',
            padding: '12px 18px',
            borderRadius: '10px',
            color: '#a7f3d0',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#34d399" />
            <span>{notification}</span>
          </div>
          <button
            onClick={() => onNavigate('simulator')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.8rem',
              fontWeight: 700
            }}
          >
            Review Simulator →
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[
          { id: 'all', label: `All Recommendations (${recommendations.length})` },
          { id: 'high', label: 'High Priority Only' },
          { id: 'quick', label: 'Quick Wins' },
          { id: 'electricity', label: 'Electricity / HVAC' },
          { id: 'transport', label: 'Commuter Mobility' },
          { id: 'waste', label: 'Circular Waste' }
        ].map((tab) => {
          const isActive = activeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem' }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid-cols-3" style={{ gap: '20px' }}>
        {filteredRecommendations.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={rec}
            onApply={handleApply}
          />
        ))}
      </div>

      {filteredRecommendations.length === 0 && (
        <div
          className="glass-card"
          style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}
        >
          <Info size={32} color="#34d399" style={{ margin: '0 auto 10px auto' }} />
          <h4 style={{ color: '#fff', marginBottom: '6px' }}>No recommendations in this filter</h4>
          <p style={{ fontSize: '0.85rem' }}>Try selecting "All Recommendations" to review all actionable items.</p>
        </div>
      )}
    </div>
  );
}
