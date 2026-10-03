import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';
import {
  Camera, Sliders, ArrowLeft, Loader2, AlertCircle, Plus
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
      setPhotos(data?.data?.photos || []);
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200/90 px-4 sm:px-8 py-3.5 flex items-center justify-between bg-white sticky top-0 z-30 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-none">Physique Progression</h1>
              <p className="text-[11px] text-slate-500 mt-0.5">Visual before & after comparison</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Photo</span>
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Loading photo gallery studio...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-4 py-3 rounded-xl mb-6">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {!loading && (
          <>
            {/* Week Selector Controls */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 mb-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Before:</span>
                <select
                  value={selectedWeekA}
                  onChange={e => setSelectedWeekA(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-600 shadow-xs"
                >
                  <option value={1}>Week 1</option>
                  <option value={2}>Week 2</option>
                  <option value={3}>Week 3</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-slate-600 text-xs font-semibold">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Drag Slider to Compare</span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">After:</span>
                <select
                  value={selectedWeekB}
                  onChange={e => setSelectedWeekB(Number(e.target.value))}
                  className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-indigo-600 shadow-xs"
                >
                  <option value={4}>Week 4</option>
                  <option value={5}>Week 5</option>
                  <option value={6}>Week 6</option>
                </select>
              </div>
            </div>

            {/* Split Image Comparison Slider Box */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
              <div className="relative w-full h-80 sm:h-[420px] rounded-xl overflow-hidden select-none bg-slate-100 border border-slate-200">
                {/* Background After Image */}
                <img src={photoB} alt="After Physique" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs border border-slate-200 text-emerald-700 text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
                  AFTER (Week {selectedWeekB})
                </div>

                {/* Foreground Before Image (Clipped by slider position) */}
                <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
                  <img
                    src={photoA}
                    alt="Before Physique"
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%' }}
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-slate-200 text-slate-800 text-xs font-bold px-3 py-1 rounded-lg shadow-sm">
                    BEFORE (Week {selectedWeekA})
                  </div>
                </div>

                {/* Vertical Divider Handle */}
                <div className="absolute top-0 bottom-0 w-0.5 bg-white cursor-ew-resize shadow-lg z-20" style={{ left: `${sliderPos}%` }}>
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 border border-slate-200 flex items-center justify-center font-bold shadow-md text-xs">
                    ↔
                  </div>
                </div>

                {/* Interactive Slider Input */}
                <input
                  type="range" min="0" max="100" value={sliderPos}
                  onChange={e => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  aria-label="Comparison slider"
                />
              </div>

              <p className="text-center text-xs text-slate-400 mt-3">
                Drag the divider handle left or right to inspect muscle tone and body composition changes.
              </p>
            </div>

            {/* Photo Gallery Grid */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Saved Progress Photos</h3>
              {photos.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No photos uploaded yet. Click "Upload Photo" to begin logging.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  {photos.map(p => (
                    <div key={p._id} className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 group shadow-xs">
                      <div className="relative h-40">
                        <img src={p.imagePath} alt={`Week ${p.weekNumber}`} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-200" />
                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                          <span className="text-xs font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded-md">Week {p.weekNumber}</span>
                          <span className="text-[10px] font-semibold text-emerald-700 bg-white/90 border border-slate-200 px-1.5 py-0.5 rounded-md shadow-xs">
                            {p.moderationStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Weekly Progress Photo</h3>
            <p className="text-xs text-slate-500 mb-5">Record visual documentation of your transformation</p>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Week Number</label>
                <input
                  type="number" min="1" max="52" required
                  value={uploadForm.weekNumber}
                  onChange={e => setUploadForm({ ...uploadForm, weekNumber: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-600 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">View Angle</label>
                <select
                  value={uploadForm.viewType}
                  onChange={e => setUploadForm({ ...uploadForm, viewType: e.target.value })}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-600 shadow-sm"
                >
                  <option value="front">Front View</option>
                  <option value="back">Back View</option>
                  <option value="left">Left Side View</option>
                  <option value="right">Right Side View</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">Photo URL</label>
                <input
                  type="url" required
                  value={uploadForm.imageUrl}
                  onChange={e => setUploadForm({ ...uploadForm, imageUrl: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-indigo-600 shadow-sm"
                />
              </div>

              <div className="flex gap-2.5 mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-semibold disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
