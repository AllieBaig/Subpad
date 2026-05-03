import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, 
  Trash2, 
  Play, 
  Star, 
  Search, 
  Plus, 
  History, 
  Copy, 
  ChevronRight,
  Filter,
  Check,
  AlertCircle,
  Zap,
  Clock
} from 'lucide-react';
import { useSettings } from '../SettingsContext';
import { HzProfile, HzProfileValues } from '../types';
import { format } from 'date-fns';
import { NumericKeypadInput } from './NumericKeypadInput';

export const HzProfiles: React.FC = () => {
  const { 
    hzProfiles, 
    saveHzProfile, 
    deleteHzProfile, 
    updateHzProfile, 
    applyHzProfile,
    settings 
  } = useSettings();

  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'name'>('recent');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<HzProfileValues | null>(null);

  const filteredProfiles = useMemo(() => {
    return hzProfiles
      .filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return b.updatedAt - a.updatedAt;
      });
  }, [hzProfiles, search, sortBy]);

  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const handleApply = async (profile: HzProfile) => {
    setIsApplying(profile.id);
    applyHzProfile(profile);
    
    // Artificial delay for feedback
    setTimeout(() => {
      setIsApplying(null);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }, 600);
  };

  const handleToggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setEditingValues(null);
    } else {
      const profile = hzProfiles.find(p => p.id === id);
      if (profile) {
        setExpandedId(id);
        setEditingValues({ ...profile.values });
      }
    }
  };

  const handleUpdateValue = (key: keyof HzProfileValues, value: number) => {
    if (!editingValues) return;
    const clamped = Math.max(1, Math.min(1900, value));
    setEditingValues({ ...editingValues, [key]: clamped });
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingValues) return;
    await updateHzProfile(id, { values: editingValues });
    setExpandedId(null);
    setEditingValues(null);
  };

  const handleStartCreate = () => {
    setIsCreating(true);
    setProfileName('');
    setEditingValues({
      binauralLeft: settings.binaural.leftFreq,
      binauralRight: settings.binaural.rightFreq,
      pureHz: settings.pureHz.frequency,
      isochronic: settings.isochronic.frequency,
      solfeggio: settings.solfeggio.frequency,
      schumann: settings.schumann.frequency,
      nature: settings.nature.frequency,
      noise: settings.noise.frequency,
      didgeridoo: settings.didgeridoo.frequency,
      shamanic: settings.shamanic.frequency,
      mentalToughness: settings.mentalToughness.frequency,
      masterHz: settings.syncLab.masterHz
    });
  };

  const handleFinalCreate = async () => {
    if (!profileName.trim() || !editingValues) return;
    await saveHzProfile(profileName.trim(), editingValues);
    setIsCreating(false);
    setEditingValues(null);
  };

  const LayerInput = ({ label, value, onUpdate }: { label: string, value: number, onUpdate: (v: number) => void }) => (
    <div className="flex items-center justify-between py-2 group/row">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider group-hover/row:text-purple-600 transition-colors uppercase">{label}</span>
      <div className="flex items-center gap-2">
        <NumericKeypadInput 
          value={value} 
          onCommit={onUpdate}
          min={1}
          max={1900}
          className="w-16 h-8 bg-gray-50 border border-gray-200 rounded-lg text-[11px] font-black text-center focus:ring-1 focus:ring-purple-500 outline-none transition-all"
        />
        <span className="text-[8px] font-black text-gray-400 uppercase">Hz</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute -top-6 left-1/2 -translate-x-1/2 z-[110] px-4 py-1.5 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg flex items-center gap-2 paper-emboss whitespace-nowrap pointer-events-none"
          >
            <Check className="w-3.5 h-3.5" />
            Applied Successfully
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Search */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <History className="w-4 h-4 text-purple-600" />
            Hz Profiles
          </h3>
          <button
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 paper-emboss"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Profile
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search Hz setups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all paper-emboss"
            />
          </div>
          <button
            onClick={() => setSortBy(sortBy === 'recent' ? 'name' : 'recent')}
            className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-600 flex items-center gap-2 hover:bg-gray-100 transition-all paper-emboss"
          >
            <Filter className="w-3.5 h-3.5" />
            {sortBy === 'recent' ? 'Recent' : 'Name'}
          </button>
        </div>
      </div>

      {/* Create Mode Modal Overlay */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden paper-emboss"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Save className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest text-gray-900">New Profile</span>
                </div>
                <button onClick={() => setIsCreating(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Profile Name</label>
                  <input
                    autoFocus
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g. Deep Meditation"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>

                {/* Layer Groups */}
                <div className="space-y-6">
                  <div>
                    <h5 className="text-[10px] font-black text-purple-500 uppercase tracking-[0.2em] mb-3 pb-1 border-b border-purple-100">Frequency Layers</h5>
                    <div className="grid gap-1">
                      <LayerInput label="Master Hz" value={editingValues?.masterHz || 1} onUpdate={(v) => handleUpdateValue('masterHz', v)} />
                      <LayerInput label="Binaural Left" value={editingValues?.binauralLeft || 1} onUpdate={(v) => handleUpdateValue('binauralLeft', v)} />
                      <LayerInput label="Binaural Right" value={editingValues?.binauralRight || 1} onUpdate={(v) => handleUpdateValue('binauralRight', v)} />
                      <LayerInput label="Pure Hz" value={editingValues?.pureHz || 1} onUpdate={(v) => handleUpdateValue('pureHz', v)} />
                      <LayerInput label="Isochronic" value={editingValues?.isochronic || 1} onUpdate={(v) => handleUpdateValue('isochronic', v)} />
                      <LayerInput label="Solfeggio" value={editingValues?.solfeggio || 1} onUpdate={(v) => handleUpdateValue('solfeggio', v)} />
                      <LayerInput label="Schumann" value={editingValues?.schumann || 1} onUpdate={(v) => handleUpdateValue('schumann', v)} />
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-3 pb-1 border-b border-indigo-100">Soundscape Layers</h5>
                    <div className="grid gap-1">
                      <LayerInput label="Nature" value={editingValues?.nature || 1} onUpdate={(v) => handleUpdateValue('nature', v)} />
                      <LayerInput label="Noise" value={editingValues?.noise || 1} onUpdate={(v) => handleUpdateValue('noise', v)} />
                      <LayerInput label="Didgeridoo" value={editingValues?.didgeridoo || 1} onUpdate={(v) => handleUpdateValue('didgeridoo', v)} />
                      <LayerInput label="Shamanic" value={editingValues?.shamanic || 1} onUpdate={(v) => handleUpdateValue('shamanic', v)} />
                      <LayerInput label="Mental Toughness" value={editingValues?.mentalToughness || 1} onUpdate={(v) => handleUpdateValue('mentalToughness', v)} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button
                  onClick={handleFinalCreate}
                  disabled={!profileName.trim()}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 paper-emboss"
                >
                  Save Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profiles List */}
      <div className="space-y-3">
        {filteredProfiles.length === 0 ? (
          <div className="py-12 text-center bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-[2.5rem] paper-emboss">
            <div className="w-16 h-16 bg-white rounded-full border border-gray-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <History className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-sm text-gray-900 font-bold">No Hz Profiles Yet</p>
            <p className="text-xs text-gray-500 px-8 mt-1">Create your first custom Hz preset by tapping "Create Profile" above.</p>
          </div>
        ) : (
          filteredProfiles.map((profile) => {
            const isExpanded = expandedId === profile.id;
            const isActive = settings.defaultHzProfileId === profile.id;

            return (
              <motion.div
                layout
                key={profile.id}
                className={`group relative bg-white border rounded-[2rem] transition-all hover:bg-gray-50 overflow-hidden paper-emboss ${
                  isActive ? 'border-purple-200 ring-2 ring-purple-500/10' : 'border-gray-100'
                }`}
              >
                {/* Main Card View */}
                <div 
                  className="p-5 cursor-pointer flex items-center justify-between gap-4"
                  onClick={() => handleToggleExpand(profile.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-purple-500 animate-pulse' : 'bg-gray-300'}`} />
                      <h4 className={`text-[13px] font-black truncate transition-colors ${isActive ? 'text-purple-700' : 'text-gray-900'}`}>
                        {profile.name}
                      </h4>
                      {profile.isDefault && (
                        <div className="px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-md text-[8px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                          <Star className="w-2.5 h-2.5 fill-amber-500" />
                          Default
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[9px] font-bold text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(profile.updatedAt, 'MMM d')}
                      </span>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 rounded-full">
                        <div className="w-1 h-1 rounded-full bg-purple-400" />
                        <span className="text-[9px] font-black text-gray-600 uppercase">
                          {profile.values.masterHz}Hz Master
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleApply(profile); }}
                      disabled={isApplying === profile.id}
                      className={`p-3 rounded-2xl transition-all shadow-md active:scale-95 paper-emboss flex items-center justify-center min-w-[40px] ${
                        isApplying === profile.id 
                          ? 'bg-emerald-500 text-white' 
                          : 'bg-purple-600 hover:bg-purple-700 text-white'
                      }`}
                      title="Apply Profile"
                    >
                      {isApplying === profile.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>
                    <div className="p-2 text-gray-300">
                      <ChevronRight size={18} className={`transition-transform duration-300 ${isExpanded ? 'rotate-90 text-purple-500' : ''}`} />
                    </div>
                  </div>
                </div>

                {/* Expanded Editor View */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 bg-gray-50/50"
                    >
                      <div className="p-6 space-y-8">
                        {/* Layer Groups */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] pb-2 border-b border-purple-100 flex items-center gap-2">
                              <Zap className="w-3.5 h-3.5" />
                              Frequency
                            </h5>
                            <div className="space-y-1 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                              <LayerInput label="Master Hz" value={editingValues?.masterHz || 1} onUpdate={(v) => handleUpdateValue('masterHz', v)} />
                              <LayerInput label="Binaural Left" value={editingValues?.binauralLeft || 1} onUpdate={(v) => handleUpdateValue('binauralLeft', v)} />
                              <LayerInput label="Binaural Right" value={editingValues?.binauralRight || 1} onUpdate={(v) => handleUpdateValue('binauralRight', v)} />
                              <LayerInput label="Pure Hz" value={editingValues?.pureHz || 1} onUpdate={(v) => handleUpdateValue('pureHz', v)} />
                              <LayerInput label="Isochronic" value={editingValues?.isochronic || 1} onUpdate={(v) => handleUpdateValue('isochronic', v)} />
                              <LayerInput label="Solfeggio" value={editingValues?.solfeggio || 1} onUpdate={(v) => handleUpdateValue('solfeggio', v)} />
                              <LayerInput label="Schumann" value={editingValues?.schumann || 1} onUpdate={(v) => handleUpdateValue('schumann', v)} />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h5 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] pb-2 border-b border-indigo-100 flex items-center gap-2">
                              <Filter className="w-3.5 h-3.5" />
                              Soundscape
                            </h5>
                            <div className="space-y-1 bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                              <LayerInput label="Nature" value={editingValues?.nature || 1} onUpdate={(v) => handleUpdateValue('nature', v)} />
                              <LayerInput label="Noise" value={editingValues?.noise || 1} onUpdate={(v) => handleUpdateValue('noise', v)} />
                              <LayerInput label="Didgeridoo" value={editingValues?.didgeridoo || 1} onUpdate={(v) => handleUpdateValue('didgeridoo', v)} />
                              <LayerInput label="Shamanic" value={editingValues?.shamanic || 1} onUpdate={(v) => handleUpdateValue('shamanic', v)} />
                              <LayerInput label="Mental Toughness" value={editingValues?.mentalToughness || 1} onUpdate={(v) => handleUpdateValue('mentalToughness', v)} />
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                          <button
                            onClick={() => handleSaveEdit(profile.id)}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg paper-emboss"
                          >
                            <Check className="w-4 h-4" />
                            Update Changes
                          </button>
                          
                          <div className="grid grid-cols-4 gap-2 w-full md:w-auto">
                            <button
                              onClick={() => updateHzProfile(profile.id, { isDefault: !profile.isDefault })}
                              className={`p-3 rounded-2xl border transition-all paper-emboss ${profile.isDefault ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-100'}`}
                              title="Set Default"
                            >
                              <Star className={`w-4 h-4 ${profile.isDefault ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => saveHzProfile(`${profile.name} (Copy)`, profile.values)}
                              className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all paper-emboss"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteHzProfile(profile.id)}
                              className="p-3 bg-red-50 border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-2xl transition-all paper-emboss"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setExpandedId(null)}
                              className="p-3 bg-white border border-gray-100 text-gray-400 hover:bg-gray-100 rounded-2xl transition-all paper-emboss"
                              title="Close"
                            >
                              <Plus className="w-4 h-4 rotate-45" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Info Card */}
      <div className="p-4 bg-purple-50/50 border border-purple-100/50 rounded-3xl flex items-start gap-4 shadow-sm paper-emboss">
        <div className="p-2 bg-white rounded-xl shadow-xs">
          <AlertCircle className="w-4 h-4 text-purple-600" />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-purple-900 uppercase tracking-widest">Hz Memory Sync</p>
          <p className="text-[10px] text-purple-600 font-bold leading-relaxed opacity-70">
            Profiles store a snapshot of ALL frequency values across the system. 
            Applying a profile instantly recalibrates all active audio layers without interruption.
          </p>
        </div>
      </div>
    </div>
  );
};
