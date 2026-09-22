import React from 'react';
import { MarketAsset } from '../types';
import { Coins, CircleDollarSign, Zap } from 'lucide-react';

interface AssetSelectorProps {
  assets: MarketAsset[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({ assets, selectedId, onSelect }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-slate-400 font-medium ml-1">انتخاب چارت بازار:</span>
      {assets.map((asset) => {
        const isSelected = asset.id === selectedId;
        return (
          <button
            key={asset.id}
            onClick={() => onSelect(asset.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isSelected
                ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {asset.id === 'btc_usdt' ? (
              <Coins className="w-3.5 h-3.5 text-amber-400" />
            ) : asset.id === 'gold_1m' ? (
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <CircleDollarSign className="w-3.5 h-3.5 text-yellow-400" />
            )}
            <span>{asset.name}</span>
            <span className="text-[10px] text-slate-500 font-mono">({asset.timeframe.split(' ')[0]})</span>
          </button>
        );
      })}
    </div>
  );
};
