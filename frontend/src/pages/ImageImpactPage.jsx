import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Camera,
  Check,
  ImagePlus,
  Leaf,
  Lightbulb,
  LoaderCircle,
  RotateCcw,
  Sparkles,
  Trees,
  Upload,
  X,
  Zap
} from 'lucide-react';
import { GRID_EMISSION_REGIONS } from '../data/emissionFactors';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i;
const ANALYSIS_STAGES = [
  'Preparing an on-device image preview',
  'Displaying the demo scan animation',
  'Demo complete — no AI findings were generated'
];
const OBSERVATIONS = [
  { id: 'solar', priority: 'Medium', title: 'Rooftop solar potential', prompt: 'Check roof area, shading, orientation, and structural suitability.' },
  { id: 'lighting', priority: 'Low', title: 'Natural lighting opportunities', prompt: 'Review daylight access and opportunities to reduce electric lighting.' },
  { id: 'ventilation', priority: 'Medium', title: 'Ventilation improvements', prompt: 'Review ventilation and cooling operation with a qualified building professional.' },
  { id: 'vegetation', priority: 'Low', title: 'Green roof or vegetation opportunities', prompt: 'Check local climate, roof capacity, and maintenance requirements.' },
  { id: 'emissions', priority: 'High', title: 'Visible smoke or other possible emission sources', prompt: 'A photo cannot verify an emissions source; investigate on site if relevant.' }
];

function drawSustainableConcept(imageUrl) {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => {
      const scale = Math.min(1, 1200 / image.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(image.width * scale);
      canvas.height = Math.round(image.height * scale);
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Your browser could not prepare the image preview.'));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      context.fillStyle = 'rgba(22, 101, 52, 0.13)';
      context.fillRect(0, canvas.height * 0.48, canvas.width, canvas.height * 0.52);

      const panelWidth = canvas.width * 0.18;
      const panelHeight = Math.max(18, canvas.height * 0.1);
      context.save();
      context.translate(canvas.width * 0.58, canvas.height * 0.2);
      context.transform(1, -0.12, 0.28, 1, 0, 0);
      context.fillStyle = 'rgba(15, 45, 61, 0.94)';
      context.strokeStyle = '#a7f3d0';
      context.lineWidth = Math.max(2, canvas.width * 0.003);
      context.fillRect(0, 0, panelWidth, panelHeight);
      context.strokeRect(0, 0, panelWidth, panelHeight);
      context.restore();

      const treeSize = Math.max(20, canvas.height * 0.12);
      [0.1, 0.87].forEach(position => {
        const x = canvas.width * position;
        const y = canvas.height * 0.82;
        context.fillStyle = '#704b2a';
        context.fillRect(x - treeSize * 0.07, y, treeSize * 0.14, treeSize * 0.48);
        context.fillStyle = '#15803d';
        context.beginPath();
        context.arc(x, y, treeSize * 0.3, 0, Math.PI * 2);
        context.arc(x - treeSize * 0.2, y + treeSize * 0.16, treeSize * 0.22, 0, Math.PI * 2);
        context.arc(x + treeSize * 0.2, y + treeSize * 0.16, treeSize * 0.22, 0, Math.PI * 2);
        context.fill();
      });

      context.fillStyle = 'rgba(6, 78, 59, 0.92)';
      context.fillRect(0, canvas.height - 42, canvas.width, 42);
      context.fillStyle = '#ffffff';
      context.font = `600 ${Math.max(13, canvas.width * 0.022)}px sans-serif`;
      context.fillText('Illustrative concept — not an AI-generated retrofit plan', 14, canvas.height - 15);
      resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    image.onerror = () => reject(new Error('The selected image could not be loaded.'));
    image.src = imageUrl;
  });
}

function formatKg(value) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 1 });
}

export default function ImageImpactPage() {
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [analysisState, setAnalysisState] = useState('idle');
  const [scanStage, setScanStage] = useState(0);
  const [conceptImage, setConceptImage] = useState('');
  const [conceptError, setConceptError] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [buildingType, setBuildingType] = useState('');
  const [electricityKwh, setElectricityKwh] = useState('');
  const [emissionFactor, setEmissionFactor] = useState('');
  const [factorSource, setFactorSource] = useState('');
  const [reportingPeriod, setReportingPeriod] = useState('');
  const [improvement, setImprovement] = useState('');
  const [reductionAssumption, setReductionAssumption] = useState(0);
  const [observations, setObservations] = useState(() => Object.fromEntries(
    OBSERVATIONS.map(observation => [observation.id, { status: 'Not reviewed', note: '', draft: '', editing: false }])
  ));

  const hasEstimate = electricityKwh !== ''
    && emissionFactor !== ''
    && Number.isFinite(Number(electricityKwh))
    && Number.isFinite(Number(emissionFactor))
    && Number(electricityKwh) >= 0
    && Number(emissionFactor) >= 0;
  const emissionsKg = hasEstimate ? Number(electricityKwh) * Number(emissionFactor) : null;
  const projectedKg = emissionsKg === null || !improvement
    ? null
    : emissionsKg * (1 - reductionAssumption / 100);
  const selectedFactor = GRID_EMISSION_REGIONS.find(region => region.id === factorSource);

  useEffect(() => {
    if (!image) {
      setConceptImage('');
      setConceptError('');
      return undefined;
    }

    let isCurrent = true;
    drawSustainableConcept(image.url)
      .then(result => {
        if (isCurrent) {
          setConceptImage(result);
          setConceptError('');
        }
      })
      .catch(error => {
        if (isCurrent) setConceptError(error.message);
      });
    return () => {
      isCurrent = false;
    };
  }, [image]);

  useEffect(() => {
    if (!image?.url) return undefined;
    return () => URL.revokeObjectURL(image.url);
  }, [image]);

  useEffect(() => {
    if (analysisState !== 'scanning') return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let nextStage = 0;
    const timer = window.setInterval(() => {
      nextStage += 1;
      setScanStage(nextStage);
      if (nextStage >= ANALYSIS_STAGES.length - 1) {
        window.clearInterval(timer);
        setAnalysisState('complete');
      }
    }, reducedMotion ? 200 : 900);
    return () => window.clearInterval(timer);
  }, [analysisState]);

  const acceptFile = file => {
    if (!file) return;
    if (!IMAGE_EXTENSIONS.test(file.name) || (file.type && !IMAGE_TYPES.has(file.type))) {
      setImageError('Choose a JPG, JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size === 0) {
      setImageError('That image file is empty. Choose a different image.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError('Choose an image no larger than 10 MB.');
      return;
    }
    setImageError('');
    setAnalysisState('idle');
    setScanStage(0);
    setImage({ name: file.name, size: file.size, url: URL.createObjectURL(file) });
  };

  const handleFileChange = event => {
    acceptFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const clearImage = () => {
    setImage(null);
    setImageError('');
    setAnalysisState('idle');
    setScanStage(0);
  };

  const updateObservation = (id, changes) => {
    setObservations(current => ({ ...current, [id]: { ...current[id], ...changes } }));
  };

  const useGridFactor = event => {
    const regionId = event.target.value;
    setFactorSource(regionId);
    const region = GRID_EMISSION_REGIONS.find(item => item.id === regionId);
    setEmissionFactor(region ? String(region.factor) : '');
  };

  const resetScenario = () => {
    setImprovement('');
    setReductionAssumption(0);
  };

  return (
    <div className="page-content workspace-page studio-page">
      <div className="workspace-page-heading">
        <div>
          <span className="workspace-eyebrow"><Sparkles size={14} /> SUSTAINABILITY STUDIO</span>
          <h1 className="page-header-title">Building image &amp; carbon workspace</h1>
          <p className="page-header-subtitle">Preview a building image, record electricity data, and explore your own improvement assumptions.</p>
        </div>
        <span className="workspace-capability-badge"><Sparkles size={14} /> Image scan: Demo Mode</span>
      </div>

      <div className="studio-grid">
        <section className="glass-card studio-card studio-upload-card">
          <div className="studio-section-heading">
            <span className="studio-step-icon"><ImagePlus size={17} /></span>
            <div>
              <h2>Upload building image</h2>
              <p>JPG, JPEG, PNG, or WebP · maximum 10 MB</p>
            </div>
          </div>

          <div
            className={`studio-dropzone${isDragging ? ' is-dragging' : ''}${image ? ' has-image' : ''}`}
            onDragEnter={event => { event.preventDefault(); setIsDragging(true); }}
            onDragOver={event => event.preventDefault()}
            onDragLeave={event => {
              if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false);
            }}
            onDrop={event => {
              event.preventDefault();
              setIsDragging(false);
              acceptFile(event.dataTransfer.files?.[0]);
            }}
          >
            {image ? (
              <>
                <img className={`studio-preview-image${analysisState === 'scanning' ? ' is-scanning' : ''}`} src={image.url} alt={`Uploaded building preview: ${image.name}`} />
                {analysisState === 'scanning' && (
                  <div className="studio-scan-overlay" aria-hidden="true">
                    <span className="studio-scan-line" />
                    <span>Demo scan animation</span>
                  </div>
                )}
                <div className="studio-image-caption">
                  <strong>{image.name}</strong>
                  <span>{(image.size / (1024 * 1024)).toFixed(2)} MB · local preview</span>
                </div>
              </>
            ) : (
              <div className="studio-drop-prompt">
                <span className="studio-upload-icon"><Upload size={23} /></span>
                <strong>Drag and drop a building image</strong>
                <span>Browse this device or take a photo</span>
                <div className="studio-upload-actions">
                  <label className="btn btn-secondary btn-sm studio-choose-button">
                    Choose image
                    <input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={handleFileChange} />
                  </label>
                  <label className="btn btn-secondary btn-sm studio-choose-button">
                    <Camera size={14} /> Take photo
                    <input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" capture="environment" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            )}
          </div>

          {imageError && <p className="workspace-error" role="alert"><AlertCircle size={15} />{imageError}</p>}
          {image && (
            <div className="studio-image-actions">
              <label className="btn btn-secondary btn-sm">
                <Upload size={14} /> Replace
                <input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={handleFileChange} />
              </label>
              <label className="btn btn-secondary btn-sm">
                <Camera size={14} /> Take photo
                <input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" capture="environment" onChange={handleFileChange} />
              </label>
              <button className="btn btn-secondary btn-sm" onClick={clearImage}><X size={14} /> Remove</button>
              <button
                className="btn btn-primary btn-sm"
                disabled={analysisState === 'scanning'}
                onClick={() => { setScanStage(0); setAnalysisState('scanning'); }}
              >
                {analysisState === 'scanning' ? <LoaderCircle className="studio-loading-icon" size={15} /> : <Sparkles size={15} />}
                {analysisState === 'scanning' ? 'Scanning demo…' : analysisState === 'complete' ? 'Run demo scan again' : 'Analyse Building'}
              </button>
            </div>
          )}

          {analysisState !== 'idle' && (
            <div className="studio-analysis-status" aria-live="polite">
              <div className="studio-analysis-status-heading">
                <span>{analysisState === 'complete' ? <BadgeCheck size={16} /> : <LoaderCircle className="studio-loading-icon" size={16} />}</span>
                <strong>Demo Mode — image analysis model not connected</strong>
              </div>
              <div className="studio-stage-list">
                {ANALYSIS_STAGES.map((stage, index) => (
                  <div className={`studio-stage${scanStage >= index ? ' is-current' : ''}`} key={stage}>
                    {scanStage > index || analysisState === 'complete' ? <Check size={13} /> : <span className="studio-stage-dot" />}
                    <span>{stage}</span>
                  </div>
                ))}
              </div>
              <div className="studio-progress-track" role="progressbar" aria-label="Demo scan progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={analysisState === 'complete' ? 100 : [15, 55, 100][scanStage] || 0}>
                <span style={{ width: `${analysisState === 'complete' ? 100 : [15, 55, 100][scanStage] || 0}%` }} />
              </div>
              <p>No objects, emissions, or AI recommendations are detected from this image.</p>
            </div>
          )}
        </section>

        <section className="glass-card studio-card studio-carbon-card">
          <div className="studio-section-heading">
            <span className="studio-step-icon"><Zap size={17} /></span>
            <div>
              <h2>Building carbon data</h2>
              <p>Electricity calculation uses only the values entered here.</p>
            </div>
          </div>

          <div className="studio-form-grid">
            <label className="studio-field">
              <span>Building name <small>optional</small></span>
              <input value={buildingName} onChange={event => setBuildingName(event.target.value)} maxLength={100} placeholder="Name this building" />
            </label>
            <label className="studio-field">
              <span>Building type <small>optional</small></span>
              <select value={buildingType} onChange={event => setBuildingType(event.target.value)}>
                <option value="">Select type</option>
                {['Office', 'Education', 'Healthcare', 'Residential', 'Industrial', 'Other'].map(type => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className="studio-field">
              <span>Electricity consumption <small>kWh / reporting period</small></span>
              <input type="number" min="0" step="any" value={electricityKwh} onChange={event => setElectricityKwh(event.target.value)} placeholder="Enter measured use" />
            </label>
            <label className="studio-field">
              <span>Reporting period <small>optional</small></span>
              <input type="month" value={reportingPeriod} onChange={event => setReportingPeriod(event.target.value)} />
            </label>
            <label className="studio-field">
              <span>Emission factor <small>kg CO₂e / kWh</small></span>
              <input type="number" min="0" step="any" value={emissionFactor} onChange={event => { setEmissionFactor(event.target.value); setFactorSource(''); }} placeholder="Enter or choose a factor" />
            </label>
            <label className="studio-field">
              <span>Factor reference <small>documented default</small></span>
              <select value={factorSource} onChange={useGridFactor}>
                <option value="">Choose a documented factor</option>
                {GRID_EMISSION_REGIONS.map(region => <option value={region.id} key={region.id}>{region.name} · {region.factor} kg/kWh</option>)}
              </select>
            </label>
          </div>

          <div className="studio-calculation" aria-live="polite">
            <div>
              <span><Zap size={15} /> Electricity-related emissions</span>
              {hasEstimate ? (
                <strong>{formatKg(emissionsKg)} <small>kg CO₂e</small></strong>
              ) : (
                <strong className="studio-no-data">Enter electricity use and an emission factor</strong>
              )}
            </div>
            <p>
              {hasEstimate
                ? `${electricityKwh} kWh × ${emissionFactor} kg CO₂e/kWh${reportingPeriod ? ` · ${reportingPeriod}` : ''}`
                : 'Emissions = entered electricity use × emission factor'}
            </p>
            <small>{selectedFactor ? `Factor source: ${selectedFactor.source}.` : emissionFactor ? 'Factor source: user-entered.' : 'No emission factor selected.'} No other emission categories are included.</small>
          </div>
        </section>
      </div>

      <div className="studio-secondary-grid">
        <section className="glass-card studio-card">
          <div className="studio-section-heading">
            <span className="studio-step-icon"><Lightbulb size={17} /></span>
            <div>
              <h2>Potential sustainability observations</h2>
              <p>Review these prompts yourself. Priority indicates suggested review order—not an AI detection or verified issue.</p>
            </div>
          </div>
          <div className="studio-observation-list">
            {OBSERVATIONS.map(observation => {
              const item = observations[observation.id];
              return (
                <article className="studio-observation" key={observation.id}>
                  <div className="studio-observation-top">
                    <div className="studio-observation-icon"><Leaf size={16} /></div>
                    <div className="studio-observation-copy">
                      <strong>{observation.title}</strong>
                      <p>{observation.prompt}</p>
                    </div>
                    <div className="studio-observation-badges">
                      <span className={`studio-priority priority-${observation.priority.toLowerCase()}`}>{observation.priority} review</span>
                      <span className={`studio-observation-status status-${item.status.toLowerCase().replace(' ', '-')}`}>{item.status}</span>
                    </div>
                  </div>
                  {item.note && <p className="studio-observation-note">Note: {item.note}</p>}
                  <div className="studio-observation-actions">
                    <button className="studio-text-button" onClick={() => updateObservation(observation.id, { status: 'User confirmed' })}>Confirm</button>
                    <button className="studio-text-button" onClick={() => updateObservation(observation.id, { status: 'Dismissed' })}>Dismiss</button>
                    <button className="studio-text-button" onClick={() => updateObservation(observation.id, { editing: !item.editing, draft: item.note })}>{item.editing ? 'Cancel note' : 'Add note'}</button>
                  </div>
                  {item.editing && (
                    <form className="studio-note-form" onSubmit={event => { event.preventDefault(); updateObservation(observation.id, { note: item.draft.trim(), editing: false }); }}>
                      <input aria-label={`Note for ${observation.title}`} value={item.draft} onChange={event => updateObservation(observation.id, { draft: event.target.value })} maxLength={300} placeholder="Add a note from your site review" />
                      <button type="submit" className="btn btn-primary btn-sm">Save note</button>
                    </form>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <section className="glass-card studio-card studio-scenario-card">
          <div className="studio-section-heading">
            <span className="studio-step-icon"><Trees size={17} /></span>
            <div>
              <h2>Explore a greener future</h2>
              <p>Change the assumptions to see a mathematical what-if scenario.</p>
            </div>
          </div>

          <label className="studio-field">
            <span>Improvement assumption</span>
            <select value={improvement} onChange={event => setImprovement(event.target.value)}>
              <option value="">Choose a scenario</option>
              <option value="efficiency">Electricity efficiency</option>
              <option value="renewable">On-site renewable electricity</option>
              <option value="demand">Other electricity demand reduction</option>
            </select>
          </label>
          {improvement && (
            <label className="studio-assumption-slider">
              <span><strong>Assumed reduction</strong><strong>{reductionAssumption}%</strong></span>
              <input type="range" min="0" max="100" step="1" value={reductionAssumption} onChange={event => setReductionAssumption(Number(event.target.value))} />
              <small>This is an assumption you set, not a measured or guaranteed saving.</small>
            </label>
          )}

          <div className="studio-scenario-metrics">
            <div><span>Current emissions</span><strong>{emissionsKg === null ? '—' : `${formatKg(emissionsKg)} kg`}</strong></div>
            <div><span>Estimated reduction</span><strong>{projectedKg === null ? '—' : `${formatKg(emissionsKg - projectedKg)} kg`}</strong></div>
            <div><span>Projected emissions</span><strong>{projectedKg === null ? '—' : `${formatKg(projectedKg)} kg`}</strong></div>
          </div>
          <div className="studio-comparison" aria-label="Current versus simulated emissions">
            <div><span>Current</span><div className="studio-comparison-track"><span style={{ width: emissionsKg === null || emissionsKg === 0 ? '0%' : '100%' }} /></div></div>
            <div><span>Scenario</span><div className="studio-comparison-track is-simulated"><span style={{ width: emissionsKg === null || emissionsKg === 0 || projectedKg === null ? '0%' : `${projectedKg / emissionsKg * 100}%` }} /></div></div>
          </div>
          <div className="studio-assumptions-note"><AlertCircle size={15} /><span>Simulation only. Uses electricity emissions above and your selected reduction assumption; does not predict costs or payback.</span></div>
          <button className="btn btn-secondary btn-sm" onClick={resetScenario}><RotateCcw size={14} /> Reset scenario</button>
        </section>
      </div>

      <section className="glass-card studio-visual-section">
        <div className="studio-visual-heading">
          <div>
            <span className="workspace-eyebrow"><Trees size={14} /> ILLUSTRATIVE VISUAL CONCEPT</span>
            <h2>Explore a greener building concept</h2>
            <p>This local image overlay is a static illustration, not AI image recognition, a verified retrofit proposal, or a functioning 3D twin.</p>
          </div>
          <span className="workspace-capability-badge">2D concept only</span>
        </div>
        {!image ? (
          <div className="studio-visual-empty"><ImagePlus size={23} /><span>Upload an image to see your original and an illustrative concept side by side.</span></div>
        ) : (
          <div className="studio-before-after">
            <article>
              <div className="studio-visual-label"><span>ORIGINAL</span><strong>{buildingName || image.name}</strong></div>
              <img src={image.url} alt={`Original image of ${buildingName || image.name}`} />
            </article>
            <div className="studio-visual-arrow"><ArrowRight size={20} /></div>
            <article>
              <div className="studio-visual-label"><span>ILLUSTRATIVE CONCEPT</span><strong>Solar and greenery overlay</strong></div>
              {conceptImage ? <img src={conceptImage} alt="Local illustrative solar and greenery concept overlay" /> : <div className="studio-concept-placeholder">{conceptError || 'Preparing local concept preview…'}</div>}
            </article>
          </div>
        )}
      </section>
    </div>
  );
}
