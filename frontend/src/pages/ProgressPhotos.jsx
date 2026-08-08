import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  Camera, Sliders, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Upload, Plus
} from 'lucide-react';

export default function ProgressPhotos() {
  const navigate = useNavigate();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [sliderPos, setSliderPos] = useState(50);
  const [selectedWeekA, setSelectedWeekA] = useState(1);
  const [selectedWeekB, setSelectedWeekB] = useState(4);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    weekNumber: 5,
    viewType: 'front',
    imageUrl: '',
  });

  const fetchPhotos = async () => {
    try {
      const { data } = await api.get('/api/progress-photos');
      setPhotos(data.data.photos || []);
    } catch (err) {
      setError('Failed to load progress photos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPhotos(); }, []);

  const getPhotoForWeek = (week) => {
    return photos.find(p => p.weekNumber === Number(week))?.imagePath ||
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&auto=format&fit=crop&q=80';
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.imageUrl) return;
    setUploading(true);
    setError('');
    try {
      await api.post('/api/progress-photos', {
        weekNumber: uploadForm.weekNumber,
        viewType: uploadForm.viewType,
        imagePath: uploadForm.imageUrl,
      });
      setShowUploadModal(false);
      await fetchPhotos();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const photoA = getPhotoForWeek(selectedWeekA);
  const photoB = getPhotoForWeek(selectedWeekB);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-indigo-400" />
            <h1 className="text-lg font-bold">Progress Photos & Physique Comparison</h1>
          </div>
        </div>
        <button onClick={() => setShowUploadModal(true)}
          className="btn-gradient text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-lg shadow-violet-500/20">
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-slate-400 text-sm">Loading photo comparison studio...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 text-red-300 text-sm px-4 py-3 rounded-xl mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />{error}
          </div>
        )}

        {!loading && (
          <>
            {/* Week Selector Controls */}
            <div className="glass-panel border border-slate-800 rounded-3xl p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Before (Left):</span>
                <select value={selectedWeekA} onChange={e => setSelectedWeekA(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500">
                  <option value={1}>Week 1</option>
                  <option value={2}>Week 2</option>
                  <option value={3}>Week 3</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Sliders className="w-4 h-4 text-indigo-400" /> Interactive Split Comparison
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">After (Right):</span>
                <select value={selectedWeekB} onChange={e => setSelectedWeekB(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-indigo-500">
                  <option value={4}>Week 4</option>
                  <option value={5}>Week 5</option>
                  <option value={6}>Week 6</option>
                </select>
              </div>
            </div>

            {/* Split Image Comparison Slider Box */}
            <div className="glass-panel border border-slate-800 rounded-3xl p-4 sm:p-6 mb-8">
              <div className="relative w-full h-96 sm:h-[450px] rounded-2xl overflow-hidden select-none">
                {/* Background After Image (Full width) */}
                <img src={photoB} alt="After Physique" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl">
                  AFTER (Week {selectedWeekB}) ✓
                </div>

                {/* Foreground Before Image (Clipped by slider position) */}
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                  <img src={photoA} alt="Before Physique" className="absolute inset-0 w-full h-full object-cover max-w-none" style={{ width: '100%' }} />
                  <div className="absolute top-4 left-4 bg-slate-950/80 backdrop-blur-md border border-slate-800 text-violet-400 text-xs font-bold px-3 py-1.5 rounded-xl">
                    BEFORE (Week {selectedWeekA})
                  </div>
                </div>

                {/* Vertical Divider Handle */}
                <div className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-2xl z-20" style={{ left: `${sliderPos}%` }}>
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-slate-900 flex items-center justify-center font-black shadow-2xl text-xs">
                    ↔
                  </div>
                </div>

                {/* Slider Input */}
                <input
                  type="range" min="0" max="100" value={sliderPos}
                  onChange={e => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />
              </div>

              <p className="text-center text-xs text-slate-500 mt-3">
                💡 Drag the white divider bar left and right to inspect muscle definition and posture progress!
              </p>
            </div>

            {/* Photo Gallery Grid */}
            <div className="glass-panel border border-slate-800 rounded-3xl p-6">
              <h3 className="text-base font-bold text-white mb-4">Saved Progress Photo Logs</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {photos.map(p => (
                  <div key={p._id} className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group">
                    <img src={p.imagePath} alt={`Week ${p.weekNumber}`} className="w-full h-44 object-cover group-hover:scale-105 transition-all" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent opacity-80" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Week {p.weekNumber}</span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        {p.moderationStatus}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Add Weekly Progress Photo</h3>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Week Number</label>
                <input type="number" min="1" max="52" required value={uploadForm.weekNumber}
                  onChange={e => setUploadForm({ ...uploadForm, weekNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">View Angle</label>
                <select value={uploadForm.viewType} onChange={e => setUploadForm({ ...uploadForm, viewType: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500">
                  <option value="front">Frontal View</option>
                  <option value="back">Back View</option>
                  <option value="left">Left Side View</option>
                  <option value="right">Right Side View</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">Image URL or Photo Link</label>
                <input type="url" required value={uploadForm.imageUrl}
                  onChange={e => setUploadForm({ ...uploadForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500" />
              </div>

              <div className="flex gap-3 mt-6 pt-2">
                <button type="button" onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white text-sm font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={uploading}
                  className="flex-1 btn-gradient py-2.5 rounded-xl text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
