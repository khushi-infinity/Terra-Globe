import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useTranslation } from '../../i18n/useTranslation';
import {
  Activity,
  Trees,
  Trash2,
  Cpu,
  Droplets,
  Users,
  ChevronRight,
  X,
  Clock
} from 'lucide-react';

export const ActivityFeed: React.FC = () => {
  const { t } = useTranslation();
  const communityActions = useAppStore(s => s.communityActions);
  const isActivityFeedOpen = useAppStore(s => s.isActivityFeedOpen);
  const setActivityFeedOpen = useAppStore(s => s.setActivityFeedOpen);
  const currentLocation = useAppStore(s => s.currentLocation);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'tree_planting': return <Trees className="w-3.5 h-3.5 text-emerald-400" />;
      case 'cleanup_drive': return <Trash2 className="w-3.5 h-3.5 text-rose-400" />;
      case 'sensor_install': return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
      case 'water_restoration': return <Droplets className="w-3.5 h-3.5 text-blue-400" />;
      default: return <Activity className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <>
      {/* Floating Pill Trigger if closed */}
      {!isActivityFeedOpen && (
        <button
          onClick={() => setActivityFeedOpen(true)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-white/10 hover:border-emerald-500/50 text-xs text-white shadow-2xl backdrop-blur-2xl bg-[#090d16]/90 transition-all hover:scale-105"
        >
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-200">
            {t('activity.open', 'Community Action Stream')}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {communityActions.length} Drives
          </span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
        </button>
      )}

      {/* Expanded Activity Drawer */}
      {isActivityFeedOpen && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="rounded-2xl p-4 border border-white/10 shadow-2xl backdrop-blur-2xl bg-[#090d16]/95 text-white max-h-[60vh] flex flex-col">
            <div className="flex items-center justify-between pb-2.5 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white tracking-wide">
                  {t('activity.title', 'Live Ecological Action Stream')} ({currentLocation.name})
                </span>
              </div>
              <button
                onClick={() => setActivityFeedOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {communityActions.map(action => (
                <div
                  key={action.id}
                  className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/40 transition-all text-xs"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded-md bg-slate-900 border border-white/5 text-emerald-400">
                        {getActionIcon(action.type)}
                      </div>
                      <span className="font-semibold text-white truncate max-w-[140px]">
                        {action.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {action.timestamp}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 line-clamp-2 mb-2 leading-tight">
                    {action.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800">
                    <span className="text-slate-300 flex items-center gap-1">
                      <Users className="w-3 h-3 text-emerald-400" />
                      {action.participants} Volunteers
                    </span>
                    <span className="text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 font-semibold">
                      {action.targetMetric}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
