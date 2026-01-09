import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Play, Pause, Square, RefreshCw } from 'lucide-react';
import { referenceLibraryService, ReferenceAudio, TextSegment } from '../services/referenceLibraryService';
import PresetEditor from '../components/PresetEditor';

const AdminMode: React.FC = () => {
  const [presets, setPresets] = useState<ReferenceAudio[]>([]);
  const [references, setReferences] = useState<ReferenceAudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPreset, setEditingPreset] = useState<ReferenceAudio | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [selectedReference, setSelectedReference] = useState<ReferenceAudio | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load presets and references separately - if one fails, the other can still work
      let presetsData: ReferenceAudio[] = [];
      let refsData: ReferenceAudio[] = [];
      
      // Try to load presets
      try {
        presetsData = await referenceLibraryService.getPresets();
      } catch (error: any) {
        console.error('Failed to load presets:', error);
        // Presets might not exist yet, which is okay - continue with empty array
        presetsData = [];
      }
      
      // Try to load references
      try {
        refsData = await referenceLibraryService.getReferences();
      } catch (error: any) {
        console.error('Failed to load references:', error);
        // References might not exist yet, which is okay - continue with empty array
        refsData = [];
      }
      
      setPresets(presetsData);
      setReferences(refsData);
      
      // Only show error if BOTH failed and it's a connection issue
      // (Empty arrays are fine - just means no data yet)
    } catch (error: any) {
      console.error('Unexpected error loading data:', error);
      // Don't show alert for unexpected errors - let user see the empty state
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCreatingNew(true);
    setEditingPreset(null);
    setSelectedReference(null);
  };

  const handleEdit = (preset: ReferenceAudio) => {
    setEditingPreset(preset);
    setCreatingNew(false);
    setSelectedReference(preset);
  };

  const handleDelete = async (presetId: string) => {
    if (!confirm('Are you sure you want to delete this preset? It will be converted back to a regular reference.')) {
      return;
    }

    try {
      await referenceLibraryService.deletePreset(presetId);
      await loadData();
    } catch (error) {
      console.error('Failed to delete preset:', error);
      alert('Failed to delete preset. Please try again.');
    }
  };

  const handleSavePreset = async (
    referenceId: string,
    title: string,
    textSegments: TextSegment[],
    maqam?: string
  ) => {
    try {
      if (editingPreset) {
        await referenceLibraryService.updatePreset(
          editingPreset.id,
          textSegments,
          title,
          maqam
        );
      } else {
        await referenceLibraryService.createPreset(
          referenceId,
          title,
          textSegments,
          maqam
        );
      }
      await loadData();
      setCreatingNew(false);
      setEditingPreset(null);
      setSelectedReference(null);
    } catch (error) {
      console.error('Failed to save preset:', error);
      alert('Failed to save preset. Please try again.');
      throw error;
    }
  };

  const handleCancel = () => {
    setCreatingNew(false);
    setEditingPreset(null);
    setSelectedReference(null);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (creatingNew || editingPreset) {
    return (
      <PresetEditor
        reference={selectedReference || undefined}
        existingPreset={editingPreset || undefined}
        onSave={handleSavePreset}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Preset Manager</h1>
        <p className="text-slate-600">
          Create and manage training presets with synchronized Quranic text
        </p>
      </div>

      <div className="mb-6">
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Create New Preset
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-slate-500">Loading presets...</div>
        </div>
      ) : presets.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-500 mb-4">No presets created yet.</p>
          <p className="text-sm text-slate-400">
            Click "Create New Preset" to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {presets.map((preset) => (
            <div
              key={preset.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-800 mb-1">
                  {preset.title}
                </h3>
                {preset.maqam && (
                  <p className="text-sm text-slate-500">Maqam: {preset.maqam}</p>
                )}
                <p className="text-xs text-slate-400 mt-1">
                  Duration: {formatDuration(preset.duration)}
                </p>
                {preset.text_segments && (
                  <p className="text-xs text-slate-400">
                    {preset.text_segments.length} text segments
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(preset)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(preset.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMode;

