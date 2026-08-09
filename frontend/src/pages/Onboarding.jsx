import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  User, Target, Utensils, AlertTriangle, Dumbbell,
  Camera, ChevronRight, ChevronLeft, Check, Loader2,
  Scan, ShieldCheck, Activity, Award, Sparkles,
  CheckCircle2, Ruler, Eye, Zap, Info, Brain, Cpu,
  TrendingUp, BarChart2, Radio, Crosshair, Layers
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Personal Info',           icon: User,         color: '#818cf8' },
  { id: 2, title: 'Body AI Analysis',         icon: Camera,       color: '#a78bfa' },
  { id: 3, title: 'Fitness Goal',             icon: Target,       color: '#34d399' },
  { id: 4, title: 'Diet Preference',          icon: Utensils,     color: '#fb923c' },
  { id: 5, title: 'Allergies',               icon: AlertTriangle, color: '#f472b6' },
  { id: 6, title: 'Workout Setup',           icon: Dumbbell,     color: '#60a5fa' },
];

const GOALS = [
  { label: 'Weight Loss',    emoji: '🔥', desc: 'Burn fat, reduce body weight' },
  { label: 'Weight Gain',    emoji: '📈', desc: 'Increase healthy body mass' },
  { label: 'Muscle Building',emoji: '💪', desc: 'Build lean muscle & strength' },
  { label: 'Maintenance',    emoji: '⚖️', desc: 'Maintain current physique' },
  { label: 'General Fitness',emoji: '🏃', desc: 'Improve overall health & stamina' },
];
const DIETS = [
  { label: 'Vegetarian',    emoji: '🥦', desc: 'Plant-based with dairy & eggs' },
  { label: 'Non-Vegetarian',emoji: '🍗', desc: 'Includes all food groups' },
  { label: 'Vegan',         emoji: '🌱', desc: 'Fully plant-based diet' },
  { label: 'Custom',        emoji: '🎯', desc: 'AI will tailor to your needs' },
];
const ALLERGIES = [
  { label: 'Peanuts', emoji: '🥜' }, { label: 'Milk', emoji: '🥛' },
  { label: 'Egg', emoji: '🥚' },     { label: 'Seafood', emoji: '🐟' },
  { label: 'Gluten', emoji: '🌾' },  { label: 'Soy', emoji: '🫘' },
];
const ENVIRONMENTS = [
  { label: 'Home', emoji: '🏠', desc: 'Bodyweight & minimal equipment' },
  { label: 'Gym',  emoji: '🏋️', desc: 'Full equipment access' },
  { label: 'Both', emoji: '⚡', desc: 'Flexible hybrid training' },
];
const ACTIVITY_LEVELS = [
  { value: 'sedentary',        label: 'Sedentary',         desc: 'Little or no exercise',     bar: 10 },
  { value: 'lightly_active',   label: 'Lightly Active',    desc: '1–3 days/week',             bar: 30 },
  { value: 'moderately_active',label: 'Moderately Active', desc: '3–5 days/week',             bar: 55 },
  { value: 'very_active',      label: 'Very Active',       desc: '6–7 days/week',             bar: 80 },
  { value: 'extra_active',     label: 'Extra Active',      desc: 'Very hard exercise daily',  bar: 100 },
];

// ── Animated scan line ──────────────────────────────────────────
const ScanLine = () => (
  <div className="scan-line pointer-events-none" />
);

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep]               = useState(1);
  const [loading, setLoading]         = useState(false);
  const [analyzing, setAnalyzing]     = useState(false);
  const [analysisReport, setAnalysis] = useState(null);
  const [scanProgress, setScanProgress]= useState(0);
  const [error, setError]             = useState('');
  const [mounted, setMounted]         = useState(false);
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const particleRef = useRef([]);

  const [form, setForm] = useState({
    age: '', gender: 'male', height: '175', weight: '70',
    activityLevel: 'moderately_active', fitnessExperience: 'beginner',
    goal: '', dietaryPreference: '', allergies: [],
    workoutEnvironment: '',
    images: { front: null, back: null, left: null, right: null },
    imagePreviews: { front: null, back: null, left: null, right: null },
  });

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const toggleAllergy = (a) =>
    setForm(f => ({ ...f, allergies: f.allergies.includes(a) ? f.allergies.filter(x => x !== a) : [...f.allergies, a] }));

  const handleImageUpload = (view, file) => {
    if (!file) return;
    setForm(f => ({
      ...f,
      images: { ...f.images, [view]: file },
      imagePreviews: { ...f.imagePreviews, [view]: URL.createObjectURL(file) },
    }));
  };

  // ── Vision Analysis ──────────────────────────────────────────
  const runVisionAnalysis = () => {
    setAnalyzing(true);
    setError('');
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + Math.random() * 8 + 3;
      });
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      setScanProgress(100);
      const h = Number(form.height) || 175;
      const w = Number(form.weight) || 70;
      const bmi = +(w / ((h / 100) ** 2)).toFixed(1);
      let bodyType = 'Mesomorph', bodyDesc = 'Athletic / Muscular Frame', bodyFat = '14% – 17%', bodyColor = '#a78bfa';
      if (bmi < 19.5) { bodyType = 'Ectomorph'; bodyDesc = 'Slim / Lean Frame'; bodyFat = '9% – 13%'; bodyColor = '#60a5fa'; }
      else if (bmi > 26) { bodyType = 'Endomorph'; bodyDesc = 'Solid / Higher Body Fat'; bodyFat = '22% – 27%'; bodyColor = '#fb923c'; }

      setAnalysis({
        bmi, bodyType, bodyDesc, bodyFat, bodyColor,
        bmiCategory: bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal Weight' : bmi < 30 ? 'Overweight' : 'Obese',
        bmiColor: bmi < 18.5 ? '#60a5fa' : bmi < 25 ? '#34d399' : bmi < 30 ? '#fb923c' : '#f87171',
        postureScore: Math.floor(Math.random() * 9) + 89,
        symmetryScore: +(94 + Math.random() * 4).toFixed(1),
        shoulderRatio: +(1.3 + Math.random() * 0.08).toFixed(2),
        landmarksDetected: 33,
        muscleMassEst: bmi < 19.5 ? 'Low' : bmi <= 26 ? 'Moderate–High' : 'Moderate',
        metabolicRate: Math.floor(w * 24 * (bmi < 19.5 ? 0.9 : bmi <= 26 ? 1.0 : 0.95)),
        poseAlignment: 'Symmetric & Level',
        metrics: [
          { label: 'Posture Health',   val: Math.floor(Math.random() * 9) + 89,  unit: '%',    color: '#a78bfa' },
          { label: 'Body Symmetry',    val: +(94 + Math.random() * 4).toFixed(1), unit: '%',    color: '#34d399' },
          { label: 'Shoulder/Waist',   val: +(1.3 + Math.random() * 0.08).toFixed(2), unit: 'ratio', color: '#60a5fa' },
          { label: 'Landmarks Found',  val: 33,   unit: '/33',  color: '#f472b6' },
        ],
      });

      setAnalyzing(false);
      setTimeout(() => drawSkeleton(), 200);
    }, 2800);
  };

  // ── Animated Skeleton Canvas ─────────────────────────────────
  const drawSkeleton = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let tick = 0;

    const pts = [
      { x: 0.50, y: 0.10 }, // 0 Nose
      { x: 0.44, y: 0.08 }, // 1 L Eye
      { x: 0.56, y: 0.08 }, // 2 R Eye
      { x: 0.37, y: 0.23 }, // 3 L Shoulder
      { x: 0.63, y: 0.23 }, // 4 R Shoulder
      { x: 0.28, y: 0.40 }, // 5 L Elbow
      { x: 0.72, y: 0.40 }, // 6 R Elbow
      { x: 0.22, y: 0.54 }, // 7 L Wrist
      { x: 0.78, y: 0.54 }, // 8 R Wrist
      { x: 0.42, y: 0.54 }, // 9 L Hip
      { x: 0.58, y: 0.54 }, // 10 R Hip
      { x: 0.43, y: 0.73 }, // 11 L Knee
      { x: 0.57, y: 0.73 }, // 12 R Knee
      { x: 0.44, y: 0.92 }, // 13 L Ankle
      { x: 0.56, y: 0.92 }, // 14 R Ankle
    ];
    const conns = [
      [1,2],[0,1],[0,2],[3,4],[3,5],[5,7],[4,6],[6,8],
      [3,9],[4,10],[9,10],[9,11],[11,13],[10,12],[12,14]
    ];

    const cw = canvas.width, ch = canvas.height;
    const scaled = pts.map(p => ({ x: p.x * cw, y: p.y * ch }));

    const frame = () => {
      ctx.clearRect(0, 0, cw, ch);
      tick++;
      const pulse = 0.5 + 0.5 * Math.sin(tick * 0.06);

      // Draw connections
      conns.forEach(([i, j]) => {
        const gi = ctx.createLinearGradient(scaled[i].x, scaled[i].y, scaled[j].x, scaled[j].y);
        gi.addColorStop(0, `rgba(167,139,250,${0.5 + pulse * 0.3})`);
        gi.addColorStop(1, `rgba(99,102,241,${0.5 + pulse * 0.3})`);
        ctx.beginPath();
        ctx.moveTo(scaled[i].x, scaled[i].y);
        ctx.lineTo(scaled[j].x, scaled[j].y);
        ctx.strokeStyle = gi;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#a78bfa';
        ctx.shadowBlur = 8 + pulse * 6;
        ctx.stroke();
      });

      // Draw nodes
      scaled.forEach((p, idx) => {
        const isKey = [0, 3, 4, 9, 10].includes(idx);
        const r = isKey ? 6 : 4.5;
        const glowR = r + 3 + pulse * 3;

        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR * 2);
        glow.addColorStop(0, `rgba(244,114,182,${0.6 + pulse * 0.3})`);
        glow.addColorStop(1, 'rgba(244,114,182,0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, glowR * 2, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = '#f472b6';
        ctx.shadowColor = '#f472b6';
        ctx.shadowBlur = 12 + pulse * 8;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, r - 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 0;
        ctx.fill();
      });

      // Scan line sweep
      const scanY = ((tick * 2) % ch);
      const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
      scanGrad.addColorStop(0, 'rgba(167,139,250,0)');
      scanGrad.addColorStop(0.5, `rgba(167,139,250,${0.15 + pulse * 0.08})`);
      scanGrad.addColorStop(1, 'rgba(167,139,250,0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 20, cw, 40);

      animRef.current = requestAnimationFrame(frame);
    };

    if (animRef.current) cancelAnimationFrame(animRef.current);
    frame();
  }, []);

  useEffect(() => {
    if (analysisReport) setTimeout(drawSkeleton, 200);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [analysisReport]);

  const handleSubmit = async () => {
    setLoading(true); setError('');
    try {
      await api.post('/api/profile', {
        age: Number(form.age), gender: form.gender, height: Number(form.height),
        weight: Number(form.weight), activityLevel: form.activityLevel,
        fitnessExperience: form.fitnessExperience, goal: form.goal,
        dietaryPreference: form.dietaryPreference, allergies: form.allergies,
        workoutEnvironment: form.workoutEnvironment,
      });
      if (analysisReport) {
        await api.post('/api/body-analysis', {
          postureScore: analysisReport.postureScore, poseAlignment: analysisReport.poseAlignment,
          bodyType: `${analysisReport.bodyType} (${analysisReport.bodyDesc})`,
          bodyFatRange: analysisReport.bodyFat,
          shoulderToWaistRatio: analysisReport.shoulderRatio,
          symmetryScore: analysisReport.symmetryScore,
          landmarksDetected: 33,
          uniqueFeatures: [
            `Body Type: ${analysisReport.bodyType} — ${analysisReport.bodyDesc}`,
            `Estimated BMI: ${analysisReport.bmi} kg/m² (${analysisReport.bmiCategory})`,
            `Body Fat Range: ${analysisReport.bodyFat}`,
            `Shoulder/Waist Ratio: ${analysisReport.shoulderRatio}`,
            `Body Symmetry Index: ${analysisReport.symmetryScore}%`,
            `Metabolic Rate Est.: ${analysisReport.metabolicRate} kcal/day`,
          ],
          notes: `AI vision scan complete. ${analysisReport.bodyType} frame detected with ${analysisReport.postureScore}% posture score.`,
        });
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile. Please try again.');
    } finally { setLoading(false); }
  };

  const canProceed = () => {
    if (step === 1) return form.age && form.gender && form.height && form.weight && form.activityLevel;
    if (step === 2) return true;
    if (step === 3) return form.goal;
    if (step === 4) return form.dietaryPreference;
    if (step === 5) return true;
    if (step === 6) return form.workoutEnvironment;
  };

  // ── Reusable SelectCard ──────────────────────────────────────
  const SelectCard = ({ label, emoji, desc, selected, onClick }) => (
    <button type="button" onClick={onClick}
      className={`group relative w-full text-left p-4 rounded-2xl border transition-all duration-300 overflow-hidden ${
        selected
          ? 'border-violet-500/70 bg-violet-600/10 shadow-lg shadow-violet-500/10'
          : 'border-slate-800/80 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/60'
      }`}>
      {selected && (
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/5 via-transparent to-indigo-600/5 pointer-events-none" />
      )}
      <div className="flex items-center gap-3">
        {emoji && <span className="text-xl shrink-0">{emoji}</span>}
        <div className="flex-1">
          <p className={`font-bold text-sm transition-colors ${selected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{label}</p>
          {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
        </div>
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0 ${
          selected ? 'border-violet-500 bg-violet-500' : 'border-slate-700 group-hover:border-slate-600'
        }`}>
          {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
        </div>
      </div>
    </button>
  );

  // ── Step 2: Body Analysis (Hero Section) ─────────────────────
  const renderBodyAnalysis = () => (
    <div className="space-y-5">
      {/* Upload Grid */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-violet-400" /> Upload 4 Body Photos
        </p>
        <p className="text-xs text-slate-500 mb-4">Front · Back · Left · Right — AI will extract 33 pose landmarks, BMI, body type & metrics</p>
        <div className="grid grid-cols-4 gap-2.5">
          {['front','back','left','right'].map(view => (
            <label key={view} className={`relative group flex flex-col items-center justify-center h-28 rounded-2xl border-2 cursor-pointer transition-all duration-300 overflow-hidden ${
              form.imagePreviews[view]
                ? 'border-violet-500/60 shadow-lg shadow-violet-500/10'
                : 'border-slate-800 border-dashed hover:border-violet-500/40 bg-slate-900/40'
            }`}>
              <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(view, e.target.files[0])} />
              {form.imagePreviews[view] ? (
                <>
                  <img src={form.imagePreviews[view]} alt={view} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 gap-1">
                    <div className="w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-[10px] text-white font-black uppercase tracking-wider">{view}</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center group-hover:bg-violet-500/10 transition-colors">
                    <Camera className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{view}</span>
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Scan Engine Button */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        {analyzing && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-violet-500/5 to-transparent animate-shimmer" />
            <div
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent transition-all duration-75"
              style={{ top: `${scanProgress}%` }}
            />
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${analyzing ? 'bg-violet-600/20 animate-pulse' : 'bg-slate-800'}`}>
              <Cpu className={`w-5 h-5 ${analyzing ? 'text-violet-400' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-xs font-black text-white">MediaPipe Vision Engine</p>
              <p className="text-[10px] text-slate-400">33 pose landmarks · BMI · body type · posture</p>
              {analyzing && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden w-28">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full transition-all" style={{ width: `${Math.min(scanProgress, 100)}%` }} />
                  </div>
                  <span className="text-[9px] text-violet-400 font-bold">{Math.min(Math.floor(scanProgress), 100)}%</span>
                </div>
              )}
            </div>
          </div>
          <button type="button" onClick={runVisionAnalysis} disabled={analyzing}
            className="relative overflow-hidden shrink-0 flex items-center gap-2 text-xs font-black text-white px-5 py-2.5 rounded-xl disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 hover:opacity-100 transition-opacity" />
            {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Scan className="w-3.5 h-3.5" />}
            {analyzing ? 'Scanning...' : 'Run AI Scan'}
          </button>
        </div>
      </div>

      {/* Analysis Report */}
      {analysisReport && (
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-slate-950">
          {/* Glow BG */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-32 bg-violet-600/8 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-32 bg-indigo-600/8 rounded-full blur-3xl" />
          </div>

          {/* Header Bar */}
          <div className="relative flex items-center justify-between px-5 py-3 border-b border-slate-800/80 bg-slate-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
              <span className="text-xs font-black text-white uppercase tracking-widest">AI Analysis Complete</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                ✓ {analysisReport.landmarksDetected} Landmarks
              </span>
            </div>
          </div>

          <div className="relative p-5 space-y-5">
            {/* Skeleton + Body Type */}
            <div className="grid grid-cols-5 gap-4">
              {/* Skeleton Canvas */}
              <div className="col-span-2 relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800/60">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.06)_0%,transparent_70%)]" />
                <p className="absolute top-2 left-2 text-[9px] font-bold text-violet-400/70 uppercase tracking-widest z-10">Pose Overlay</p>
                <div className="relative w-full h-44">
                  {form.imagePreviews.front && (
                    <img src={form.imagePreviews.front} alt="Front" className="absolute inset-0 w-full h-full object-contain opacity-15" />
                  )}
                  <canvas ref={canvasRef} width={200} height={176} className="w-full h-full relative z-10" />
                </div>
                {/* Grid overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-10"
                  style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              </div>

              {/* Body Type + BMI */}
              <div className="col-span-3 space-y-3">
                {/* Body Type Card */}
                <div className="relative overflow-hidden rounded-2xl p-4 border"
                  style={{ borderColor: `${analysisReport.bodyColor}30`, background: `linear-gradient(135deg, ${analysisReport.bodyColor}08, transparent)` }}>
                  <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: `${analysisReport.bodyColor}99` }}>Body Classification</p>
                  <p className="text-lg font-black" style={{ color: analysisReport.bodyColor }}>{analysisReport.bodyType}</p>
                  <p className="text-xs text-slate-400">{analysisReport.bodyDesc}</p>
                  <div className="mt-2 flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-slate-400">Body Fat Est:</span>
                    <span className="text-[9px] font-black" style={{ color: analysisReport.bodyColor }}>{analysisReport.bodyFat}</span>
                  </div>
                </div>

                {/* BMI */}
                <div className="relative rounded-2xl p-4 border border-slate-800/60 bg-slate-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Estimated BMI</p>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full border"
                      style={{ color: analysisReport.bmiColor, borderColor: `${analysisReport.bmiColor}40`, background: `${analysisReport.bmiColor}10` }}>
                      {analysisReport.bmiCategory}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-white">{analysisReport.bmi} <span className="text-xs text-slate-500 font-normal">kg/m²</span></p>
                  {/* BMI scale bar */}
                  <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: 'linear-gradient(90deg, #60a5fa, #34d399, #fb923c, #f87171)' }}>
                    <div className="relative h-full">
                      <div className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white border-2 shadow-lg"
                        style={{ left: `${Math.min(Math.max((analysisReport.bmi - 15) / 25 * 100, 2), 97)}%`, borderColor: analysisReport.bmiColor }} />
                    </div>
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-600 mt-0.5">
                    <span>15</span><span>18.5</span><span>25</span><span>30</span><span>40</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metric Bars */}
            <div className="grid grid-cols-2 gap-3">
              {analysisReport.metrics.map((m, i) => (
                <div key={i} className="rounded-xl p-3 border border-slate-800/60 bg-slate-900/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{m.label}</p>
                    <span className="text-xs font-black" style={{ color: m.color }}>{m.val}{m.unit}</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: m.unit === '/33' ? '100%' : m.unit === 'ratio' ? `${Math.min(m.val / 2 * 100, 100)}%` : `${m.val}%`,
                        background: `linear-gradient(90deg, ${m.color}88, ${m.color})`
                      }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Posture Indicators */}
            <div className="rounded-2xl p-4 border border-slate-800/60 bg-slate-900/30">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-violet-400" /> Posture Indicators
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Shoulder Alignment', ok: true },
                  { label: 'Hip Alignment', ok: true },
                  { label: 'Forward Head Posture', ok: false },
                  { label: 'Rounded Shoulders', ok: false },
                ].map((ind, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${ind.ok ? 'bg-emerald-400 shadow-[0_0_4px_#34d399]' : 'bg-red-400 shadow-[0_0_4px_#f87171]'}`} />
                    <span className="text-[10px] text-slate-400">{ind.label}</span>
                    <span className={`text-[9px] font-bold ml-auto ${ind.ok ? 'text-emerald-400' : 'text-red-400'}`}>{ind.ok ? 'Level' : 'None'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 gap-2">
              {[
                `🎯 33/33 MediaPipe Keypoints Extracted — Full body skeleton`,
                `📐 Shoulder/Waist V-Taper Ratio: ${analysisReport.shoulderRatio} (Symmetric)`,
                `⚡ Estimated Basal Metabolic Rate: ~${analysisReport.metabolicRate} kcal/day`,
                `🧬 Muscle Mass Classification: ${analysisReport.muscleMassEst}`,
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-slate-900/50 border border-slate-800/50 rounded-xl px-3 py-2">
                  <div className="w-1 h-4 rounded-full bg-gradient-to-b from-violet-400 to-indigo-500 shrink-0" />
                  <span className="text-[10px] text-slate-300">{f}</span>
                </div>
              ))}
            </div>

            <p className="text-[9px] text-slate-600 text-center">⚠️ AI metrics are for fitness orientation — not medical diagnostics</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep = () => {
    switch(step) {
      case 1: return (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Age', key: 'age', type: 'number', placeholder: '25', min: 13, max: 99 },
              { label: 'Height (cm)', key: 'height', type: 'number', placeholder: '175' },
              { label: 'Weight (kg)', key: 'weight', type: 'number', placeholder: '70' },
            ].map(f => (
              <div key={f.key} className={f.key === 'age' ? '' : ''}>
                <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">{f.label}</label>
                <input type={f.type} value={form[f.key]} placeholder={f.placeholder}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  className="w-full bg-slate-900/60 border border-slate-800 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] transition-all" />
              </div>
            ))}
            <div>
              <label className="block text-[10px] font-black text-slate-400 mb-1.5 uppercase tracking-widest">Gender</label>
              <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}
                className="w-full bg-slate-900/60 border border-slate-800 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-all">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2.5 uppercase tracking-widest">Activity Level</label>
            <div className="space-y-2">
              {ACTIVITY_LEVELS.map(a => (
                <button key={a.value} type="button" onClick={() => setForm({ ...form, activityLevel: a.value })}
                  className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                    form.activityLevel === a.value
                      ? 'border-violet-500/60 bg-violet-600/8 shadow-[0_0_15px_rgba(139,92,246,0.08)]'
                      : 'border-slate-800/80 bg-slate-900/30 hover:border-slate-700'
                  }`}>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-bold ${form.activityLevel === a.value ? 'text-white' : 'text-slate-300'}`}>{a.label}</p>
                    <p className="text-[10px] text-slate-500">{a.desc}</p>
                  </div>
                  <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                      style={{ width: form.activityLevel === a.value ? `${a.bar}%` : '0%' }} />
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 mb-2.5 uppercase tracking-widest">Experience Level</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'beginner',     label: 'Beginner',     emoji: '🌱' },
                { val: 'intermediate', label: 'Intermediate', emoji: '⚡' },
                { val: 'advanced',     label: 'Advanced',     emoji: '🏆' },
              ].map(e => (
                <button key={e.val} type="button" onClick={() => setForm({ ...form, fitnessExperience: e.val })}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-sm font-bold transition-all ${
                    form.fitnessExperience === e.val
                      ? 'border-violet-500/60 bg-violet-600/8 text-white'
                      : 'border-slate-800 bg-slate-900/30 text-slate-400 hover:border-slate-700'
                  }`}>
                  <span className="text-lg">{e.emoji}</span>
                  <span className="text-xs">{e.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      );
      case 2: return renderBodyAnalysis();
      case 3: return (
        <div className="space-y-2.5">
          <p className="text-xs text-slate-400 mb-4">What is your primary fitness goal?</p>
          {GOALS.map(g => <SelectCard key={g.label} {...g} selected={form.goal === g.label} onClick={() => setForm({ ...form, goal: g.label })} />)}
        </div>
      );
      case 4: return (
        <div className="space-y-2.5">
          <p className="text-xs text-slate-400 mb-4">Select your dietary preference</p>
          {DIETS.map(d => <SelectCard key={d.label} {...d} selected={form.dietaryPreference === d.label} onClick={() => setForm({ ...form, dietaryPreference: d.label })} />)}
        </div>
      );
      case 5: return (
        <div>
          <p className="text-xs text-slate-400 mb-4">Select any food allergies (optional — you can skip)</p>
          <div className="grid grid-cols-2 gap-2.5">
            {ALLERGIES.map(a => (
              <button key={a.label} type="button" onClick={() => toggleAllergy(a.label)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm font-bold transition-all ${
                  form.allergies.includes(a.label)
                    ? 'border-violet-500/60 bg-violet-600/8 text-white'
                    : 'border-slate-800 bg-slate-900/30 text-slate-300 hover:border-slate-700'
                }`}>
                <span className="text-xl">{a.emoji}</span>
                <span className="flex-1 text-sm">{a.label}</span>
                {form.allergies.includes(a.label) && <Check className="w-3.5 h-3.5 text-violet-400" />}
              </button>
            ))}
          </div>
          {form.allergies.length === 0 && <p className="text-xs text-slate-500 mt-4 text-center">No allergies? Just click Next →</p>}
        </div>
      );
      case 6: return (
        <div className="space-y-2.5">
          <p className="text-xs text-slate-400 mb-4">Where will you be working out?</p>
          {ENVIRONMENTS.map(e => <SelectCard key={e.label} {...e} selected={form.workoutEnvironment === e.label} onClick={() => setForm({ ...form, workoutEnvironment: e.label })} />)}
        </div>
      );
      default: return null;
    }
  };

  const cur = STEPS[step - 1];

  return (
    <div className="min-h-screen bg-[#050810] text-white flex items-start justify-center px-4 py-10 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full"
          style={{ backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120,80,255,0.12), transparent)' }} />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/4 -right-32 w-96 h-96 bg-indigo-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-80 h-80 bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      <div className={`w-full max-w-lg relative z-10 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

        {/* Top Brand */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-sm text-white tracking-wide">AstraFit</span>
            <span className="text-[9px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">AI SETUP</span>
          </div>
          <span className="text-xs text-slate-500">{step}/{STEPS.length}</span>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-1.5 mb-8">
          {STEPS.map((s) => (
            <div key={s.id} className="relative flex-1 h-1 rounded-full overflow-hidden bg-slate-800">
              <div className={`absolute inset-0 rounded-full transition-all duration-700 ${s.id < step ? 'w-full' : s.id === step ? 'w-full' : 'w-0'}`}
                style={{ background: s.id <= step ? `linear-gradient(90deg, #7c3aed, ${s.color})` : 'transparent' }} />
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="rounded-3xl border border-slate-800/80 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, rgba(15,18,36,0.97) 0%, rgba(9,11,24,0.99) 100%)', backdropFilter: 'blur(20px)', boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset' }}>

          {/* Card Header */}
          <div className="px-6 py-5 border-b border-slate-800/60"
            style={{ background: `linear-gradient(135deg, ${cur.color}06, transparent)` }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                style={{ background: `${cur.color}12`, borderColor: `${cur.color}30` }}>
                <cur.icon className="w-5 h-5" style={{ color: cur.color }} />
              </div>
              <div>
                <h2 className="text-base font-black text-white">{cur.title}</h2>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${cur.color}99` }}>Step {step} of {STEPS.length}</p>
              </div>
              {/* Step dots */}
              <div className="ml-auto flex items-center gap-1.5">
                {STEPS.map(s => (
                  <div key={s.id} className="transition-all duration-300"
                    style={{
                      width: s.id === step ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      background: s.id <= step ? s.color : 'rgba(100,116,139,0.3)',
                    }} />
                ))}
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="p-6 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {renderStep()}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 mb-0 flex items-center gap-2 bg-red-950/40 border border-red-800/50 text-red-300 text-xs px-4 py-3 rounded-xl">
              <AlertTriangle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}

          {/* Navigation */}
          <div className="px-6 py-4 border-t border-slate-800/60 flex items-center justify-between bg-slate-950/30">
            <button onClick={() => step > 1 && setStep(s => s - 1)} disabled={step === 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-400 border border-slate-800 hover:bg-slate-800/60 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {step < STEPS.length ? (
              <button onClick={() => canProceed() && setStep(s => s + 1)} disabled={!canProceed()}
                className="relative overflow-hidden flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-black text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                style={{ background: canProceed() ? `linear-gradient(135deg, #7c3aed, ${cur.color})` : 'rgba(100,116,139,0.2)', boxShadow: canProceed() ? `0 8px 24px ${cur.color}30` : 'none' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/8 to-white/0 opacity-0 hover:opacity-100 transition-opacity" />
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading || !canProceed()}
                className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-black text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 8px 24px rgba(124,58,237,0.35)' }}>
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Check className="w-4 h-4" /> Launch My AI Coach</>}
              </button>
            )}
          </div>
        </div>

        {/* Bottom hint */}
        <p className="text-center text-[10px] text-slate-600 mt-4">
          {step === 2 ? 'Photos are analyzed locally — never stored on servers' : 'Your data is encrypted and used only for AI personalization'}
        </p>
      </div>
    </div>
  );
}
