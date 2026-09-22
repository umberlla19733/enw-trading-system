import React from 'react';
import { Layers, Eye, EyeOff, Sliders, Activity, Clock, Crosshair, Sparkles, Target } from 'lucide-react';

export interface LayerState {
  sIchi: boolean;
  mIchi: boolean;
  lIchi: boolean;
  sFld: boolean;
  mFld: boolean;
  lFld: boolean;
  sCloud: boolean;
  mCloud: boolean;
  eszZone: boolean;
  boundaries: boolean;
  targets: boolean;
  cycleMarks: boolean;
  hosodaWaves: boolean;
  positionTool: boolean;
  timeWindows: boolean;
}

interface LayerControlsProps {
  layers: LayerState;
  setLayers: React.Dispatch<React.SetStateAction<LayerState>>;
}

export const LayerControls: React.FC<LayerControlsProps> = ({ layers, setLayers }) => {
  const toggle = (key: keyof typeof layers) => {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setPreset = (preset: 'all' | 'clean' | 'fld_only' | 'system_only') => {
    if (preset === 'all') {
      setLayers({
        sIchi: true,
        mIchi: true,
        lIchi: true,
        sFld: true,
        mFld: true,
        lFld: true,
        sCloud: true,
        mCloud: true,
        eszZone: true,
        boundaries: true,
        targets: true,
        cycleMarks: true,
        hosodaWaves: true,
        positionTool: true,
        timeWindows: true,
      });
    } else if (preset === 'clean') {
      setLayers({
        sIchi: false,
        mIchi: false,
        lIchi: false,
        sFld: false,
        mFld: false,
        lFld: false,
        sCloud: false,
        mCloud: false,
        eszZone: true,
        boundaries: true,
        targets: true,
        cycleMarks: false,
        hosodaWaves: false,
        positionTool: false,
        timeWindows: false,
      });
    } else if (preset === 'fld_only') {
      setLayers({
        sIchi: false,
        mIchi: false,
        lIchi: false,
        sFld: true,
        mFld: true,
        lFld: true,
        sCloud: false,
        mCloud: false,
        eszZone: false,
        boundaries: true,
        targets: true,
        cycleMarks: true,
        hosodaWaves: false,
        positionTool: false,
        timeWindows: true,
      });
    } else if (preset === 'system_only') {
      setLayers({
        sIchi: true,
        mIchi: true,
        lIchi: false,
        sFld: false,
        mFld: true,
        lFld: false,
        sCloud: true,
        mCloud: false,
        eszZone: true,
        boundaries: true,
        targets: true,
        cycleMarks: true,
        hosodaWaves: true,
        positionTool: true,
        timeWindows: true,
      });
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-sm text-slate-200">کنترل لایه‌های تصویری ارکستر</h3>
        </div>

        {/* Preset quick actions */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setPreset('all')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            نمایش کامل
          </button>
          <button
            onClick={() => setPreset('system_only')}
            className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-colors"
          >
            استراتژی طوفان
          </button>
          <button
            onClick={() => setPreset('clean')}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            خلوت
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
        {/* Layer 1: S-Ichi */}
        <button
          onClick={() => toggle('sIchi')}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
            layers.sIchi
              ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-800/40 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>لایه S-Ichi (۹،۲۶)</span>
          </div>
          {layers.sIchi ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        {/* Layer 2: M-Ichi */}
        <button
          onClick={() => toggle('mIchi')}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
            layers.mIchi
              ? 'bg-purple-950/40 border-purple-500/50 text-purple-300'
              : 'bg-slate-800/40 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            <span>لایه M-Ichi (۱۳۰)</span>
          </div>
          {layers.mIchi ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        {/* Layer 3: L-Ichi */}
        <button
          onClick={() => toggle('lIchi')}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
            layers.lIchi
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              : 'bg-slate-800/40 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>لایه L-Ichi (۶۵۰)</span>
          </div>
          {layers.lIchi ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        {/* Clouds Toggle */}
        <button
          onClick={() => {
            const next = !(layers.sCloud || layers.mCloud);
            setLayers((p) => ({ ...p, sCloud: next, mCloud: next }));
          }}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
            layers.sCloud || layers.mCloud
              ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-300'
              : 'bg-slate-800/40 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>ابرهای کومو (Kumo)</span>
          </div>
          {layers.sCloud ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        {/* FLD Toggle */}
        <button
          onClick={() => {
            const next = !(layers.sFld || layers.mFld);
            setLayers((p) => ({ ...p, sFld: next, mFld: next, lFld: next }));
          }}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
            layers.mFld
              ? 'bg-yellow-950/40 border-yellow-500/50 text-yellow-300'
              : 'bg-slate-800/40 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-yellow-400" />
            <span>خطوط جابجاشده FLD</span>
          </div>
          {layers.mFld ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        {/* ESZ Zone Toggle */}
        <button
          onClick={() => toggle('eszZone')}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
            layers.eszZone
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
              : 'bg-slate-800/40 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded bg-amber-400"></span>
            <span>منطقه آرامش (ESZ)</span>
          </div>
          {layers.eszZone ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        {/* Boundaries Toggle */}
        <button
          onClick={() => toggle('boundaries')}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
            layers.boundaries
              ? 'bg-red-950/40 border-red-500/50 text-red-300'
              : 'bg-slate-800/40 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-red-500"></span>
            <span>مرزهای انفجار (EB)</span>
          </div>
          {layers.boundaries ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        {/* Targets & SL Toggle */}
        <button
          onClick={() => toggle('targets')}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
            layers.targets
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-800/40 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>حد سود و ضرر</span>
          </div>
          {layers.targets ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        {/* Cycle Marks Toggle */}
        <button
          onClick={() => toggle('cycleMarks')}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
            layers.cycleMarks
              ? 'bg-blue-950/40 border-blue-500/50 text-blue-300'
              : 'bg-slate-800/40 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span>چرخه‌های ۹ کندلی</span>
          </div>
          {layers.cycleMarks ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        {/* Layer: Wave Targets */}
        <button
          onClick={() => toggle('hosodaWaves')}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
            layers.hosodaWaves ?? true
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
              : 'bg-slate-800/40 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>امواج و اهداف قیمتی N و E</span>
          </div>
          {(layers.hosodaWaves ?? true) ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        {/* Layer: TradingView Position Box */}
        <button
          onClick={() => toggle('positionTool')}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
            layers.positionTool ?? true
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-800/40 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
            <span>جعبه پوزیشن دقیق</span>
          </div>
          {(layers.positionTool ?? true) ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>

        {/* Layer: Taitou Suchi Time Windows */}
        <button
          onClick={() => toggle('timeWindows')}
          className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
            layers.timeWindows ?? true
              ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300'
              : 'bg-slate-800/40 border-slate-800 text-slate-500'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>پنجره تقارن زمانی</span>
          </div>
          {(layers.timeWindows ?? true) ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
