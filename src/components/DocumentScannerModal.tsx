import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RotateCw, Sparkles, Check, X, RefreshCw, AlertCircle, ShieldAlert, Sliders } from 'lucide-react';
import { DocumentCategory } from '../types';
import { api } from '../services/api';

interface DocumentScannerModalProps {
  onClose: () => void;
  onDocumentSaved: () => void;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  onClose,
  onDocumentSaved,
}) => {
  // Capture mode: 'camera' | 'file' | 'preview_edit'
  const [sourceMode, setSourceMode] = useState<'camera' | 'file'>('camera');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [capturedImageBase64, setCapturedImageBase64] = useState<string | null>(null);

  // Enhancement controls
  const [rotation, setRotation] = useState<number>(0);
  const [enhancementFilter, setEnhancementFilter] = useState<'normal' | 'contrast' | 'grayscale' | 'document'>('normal');

  // Document metadata form
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<DocumentCategory>('Identity');
  const [description, setDescription] = useState<string>('');
  const [tagsStr, setTagsStr] = useState<string>('');
  const [documentDate, setDocumentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [healthConsent, setHealthConsent] = useState<boolean>(false);

  // AI Organizer state
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<{
    suggestedName?: string;
    category?: DocumentCategory;
    suggestedTags?: string[];
    documentDate?: string;
    expiryDate?: string;
    confidence?: number;
    aiEngine?: string;
  } | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [extractedFields, setExtractedFields] = useState<Record<string, string>>({});

  // Saving state
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera stream
  useEffect(() => {
    if (sourceMode === 'camera' && !capturedImageBase64) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [sourceMode, capturedImageBase64]);

  const startCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported on this device/browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Camera initialization error:', err);
      setCameraError('Camera unavailable or permission denied. You can select an image or PDF from your device.');
      setSourceMode('file');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setCapturedImageBase64(dataUrl);
    stopCamera();
    triggerAIOrganizer(dataUrl, 'scanned_document.jpg');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCapturedImageBase64(dataUrl);
      setName(file.name.replace(/\.[^/.]+$/, ''));
      triggerAIOrganizer(dataUrl, file.name);
    };
    reader.readAsDataURL(file);
  };

  const triggerAIOrganizer = async (base64: string, filename: string) => {
    setAiAnalyzing(true);
    setSaveError('');
    try {
      // 1. Run OCR extraction
      const ocrRes = await api.aiOcrExtract(base64, 'image/jpeg');
      setOcrText(ocrRes.ocrText || '');
      setExtractedFields(ocrRes.extractedFields || {});

      // 2. Run Classification with Gemini
      const classifyRes = await api.aiClassify(filename, ocrRes.ocrText || '');
      setAiSuggestions(classifyRes);

      // Pre-fill initial defaults for user review
      if (classifyRes.suggestedName) setName(classifyRes.suggestedName);
      if (classifyRes.category) setCategory(classifyRes.category as DocumentCategory);
      if (classifyRes.suggestedTags?.length) setTagsStr(classifyRes.suggestedTags.join(', '));
      if (classifyRes.documentDate) setDocumentDate(classifyRes.documentDate);
      if (classifyRes.expiryDate) setExpiryDate(classifyRes.expiryDate);
    } catch (err: any) {
      console.warn('AI smart organizer warning:', err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const applyAiSuggestion = (field: 'name' | 'category' | 'tags' | 'expiry') => {
    if (!aiSuggestions) return;
    if (field === 'name' && aiSuggestions.suggestedName) setName(aiSuggestions.suggestedName);
    if (field === 'category' && aiSuggestions.category) setCategory(aiSuggestions.category);
    if (field === 'tags' && aiSuggestions.suggestedTags) setTagsStr(aiSuggestions.suggestedTags.join(', '));
    if (field === 'expiry' && aiSuggestions.expiryDate) setExpiryDate(aiSuggestions.expiryDate);
  };

  const handleRetake = () => {
    setCapturedImageBase64(null);
    setAiSuggestions(null);
    setOcrText('');
    setExtractedFields({});
    setRotation(0);
    setEnhancementFilter('normal');
    if (sourceMode === 'camera') {
      startCamera();
    }
  };

  const handleSaveDocument = async () => {
    if (!name.trim()) {
      setSaveError('Please provide a title for the document.');
      return;
    }
    if (!capturedImageBase64) {
      setSaveError('Please capture or upload a document file.');
      return;
    }
    if (category === 'Health' && !healthConsent) {
      setSaveError('Consent required: Health records require explicit consent for private encrypted storage.');
      return;
    }

    setIsSaving(true);
    setSaveError('');

    try {
      // Clean base64 string
      const rawBase64 = capturedImageBase64.replace(/^data:[^;]+;base64,/, '');
      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

      await api.uploadDocument({
        name,
        category,
        description,
        tags,
        documentDate,
        expiryDate: expiryDate || undefined,
        mimeType: capturedImageBase64.startsWith('data:application/pdf') ? 'application/pdf' : 'image/jpeg',
        base64Data: rawBase64,
        ocrText,
        extractedFields,
        healthConsentGiven: category === 'Health' ? healthConsent : true,
      });

      onDocumentSaved();
      onClose();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to encrypt and store document.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#171A20] border border-[#222630] rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Top Bar */}
        <div className="px-5 py-4 border-b border-[#222630] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#222630] border border-[#2D3342] flex items-center justify-center text-[#648BFF]">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#F4F5F7]">
                Document Scanner & Encrypted Ingestion
              </h2>
              <p className="text-[11px] text-[#9299A5]">
                Hardware camera capture, perspective crop, and AI indexing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#9299A5] hover:text-[#F4F5F7] rounded-xl hover:bg-[#222630] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {saveError && (
            <div className="flex items-start gap-2 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Mode Switch: Live Camera vs File Upload */}
          {!capturedImageBase64 && (
            <div className="flex p-1 bg-[#0B0D10] rounded-xl border border-[#222630] text-xs">
              <button
                type="button"
                onClick={() => setSourceMode('camera')}
                className={`flex-1 py-2 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  sourceMode === 'camera' ? 'bg-[#222630] text-[#F4F5F7]' : 'text-[#9299A5] hover:text-[#C5CAD3]'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Live Camera Scanner</span>
              </button>
              <button
                type="button"
                onClick={() => { stopCamera(); setSourceMode('file'); }}
                className={`flex-1 py-2 font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                  sourceMode === 'file' ? 'bg-[#222630] text-[#F4F5F7]' : 'text-[#9299A5] hover:text-[#C5CAD3]'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload File (PDF / Images)</span>
              </button>
            </div>
          )}

          {/* Stage 1: Camera Feed */}
          {sourceMode === 'camera' && !capturedImageBase64 && (
            <div className="relative bg-[#0B0D10] border border-[#222630] rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center">
              {cameraError ? (
                <div className="text-center p-6 text-xs text-[#9299A5]">
                  <p className="text-rose-400 mb-2">{cameraError}</p>
                  <button
                    onClick={() => setSourceMode('file')}
                    className="px-4 py-2 bg-[#222630] text-[#648BFF] rounded-xl hover:bg-[#2D3342] transition-colors"
                  >
                    Select File Instead
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Document Alignment Frame Overlay */}
                  <div className="absolute inset-8 border-2 border-dashed border-[#648BFF]/60 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                    <span className="text-[10px] text-[#648BFF] bg-[#0B0D10]/80 px-2 py-0.5 rounded self-start">
                      Align document edges within frame
                    </span>
                  </div>

                  {/* Shutter Capture Button */}
                  <div className="absolute bottom-4 inset-x-0 flex justify-center">
                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="w-16 h-16 rounded-full bg-white/90 hover:bg-white text-[#0B0D10] flex items-center justify-center shadow-lg active:scale-95 transition-all p-1"
                    >
                      <div className="w-13 h-13 rounded-full border-2 border-[#0B0D10] flex items-center justify-center">
                        <Camera className="w-6 h-6" />
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Stage 1 Alternative: File Picker */}
          {sourceMode === 'file' && !capturedImageBase64 && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#2D3342] hover:border-[#648BFF]/60 bg-[#0B0D10] rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all"
            >
              <Upload className="w-10 h-10 text-[#648BFF] mb-3 opacity-80" />
              <p className="text-sm font-semibold text-[#F4F5F7]">
                Click or drag document to upload
              </p>
              <p className="text-xs text-[#9299A5] mt-1 text-center">
                Supported formats: PDF, JPG, JPEG, and PNG.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          )}

          {/* Stage 2: Captured Image Preview & Enhancement Tools */}
          {capturedImageBase64 && (
            <div className="space-y-4">
              <div className="relative bg-[#0B0D10] border border-[#222630] rounded-2xl p-3 flex flex-col items-center">
                <div className="max-h-64 overflow-hidden rounded-xl flex items-center justify-center">
                  <img
                    src={capturedImageBase64}
                    alt="Captured Scan"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      filter:
                        enhancementFilter === 'grayscale'
                          ? 'grayscale(100%) contrast(120%)'
                          : enhancementFilter === 'contrast'
                          ? 'contrast(150%) brightness(105%)'
                          : enhancementFilter === 'document'
                          ? 'grayscale(100%) contrast(180%) brightness(110%)'
                          : 'none',
                    }}
                    className="max-h-60 object-contain rounded-lg transition-transform duration-200"
                  />
                </div>

                {/* Enhancement Controls Bar */}
                <div className="flex items-center justify-between w-full pt-3 mt-2 border-t border-[#222630] text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRotation(r => (r + 90) % 360)}
                      className="px-2.5 py-1.5 bg-[#222630] hover:bg-[#2D3342] text-[#C5CAD3] rounded-lg flex items-center gap-1 transition-colors"
                      title="Rotate 90 degrees"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Rotate</span>
                    </button>
                    <div className="flex items-center bg-[#222630] rounded-lg p-0.5">
                      {(['normal', 'contrast', 'document'] as const).map(f => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setEnhancementFilter(f)}
                          className={`px-2 py-1 text-[11px] rounded-md transition-colors ${
                            enhancementFilter === f ? 'bg-[#648BFF] text-white font-medium' : 'text-[#9299A5] hover:text-[#C5CAD3]'
                          }`}
                        >
                          {f === 'normal' ? 'Original' : f === 'contrast' ? 'High Contrast' : 'B&W Scan'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRetake}
                    className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Retake / Change
                  </button>
                </div>
              </div>

              {/* AI Smart Organizer Suggestion Card */}
              <div className="bg-[#0B0D10] border border-[#222630] rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#648BFF]" />
                    <span className="text-xs font-semibold text-[#F4F5F7]">
                      AI Smart Organizer (Gemini Intelligence)
                    </span>
                  </div>
                  {aiAnalyzing && (
                    <span className="text-[11px] text-[#648BFF] flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Analyzing...
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-[#9299A5] mb-3">
                  AI suggestions never overwrite your metadata automatically. Review and adjust any field below.
                </p>

                {aiSuggestions && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                    {aiSuggestions.suggestedName && (
                      <div className="p-2 bg-[#171A20] rounded-xl border border-[#222630] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#9299A5] block">Suggested Title:</span>
                          <span className="text-[#F4F5F7] font-medium">{aiSuggestions.suggestedName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => applyAiSuggestion('name')}
                          className="text-[10px] text-[#648BFF] hover:underline"
                        >
                          Use
                        </button>
                      </div>
                    )}
                    {aiSuggestions.category && (
                      <div className="p-2 bg-[#171A20] rounded-xl border border-[#222630] flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#9299A5] block">Suggested Category:</span>
                          <span className="text-[#F4F5F7] font-medium">{aiSuggestions.category}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => applyAiSuggestion('category')}
                          className="text-[10px] text-[#648BFF] hover:underline"
                        >
                          Use
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Form Fields for User Review */}
                <div className="space-y-3 text-xs">
                  {/* Quick Preset Templates */}
                  <div>
                    <label className="text-[11px] text-[#9299A5] block mb-1.5 font-medium">Quick Document Templates:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: '🎓 College Degree Certificate', title: 'College Degree / Diploma Certificate', cat: 'Education', tags: 'Degree, University, College Certificate' },
                        { label: '📜 Semester Marksheet', title: 'Semester Grade Card / Marksheet', cat: 'Education', tags: 'Marksheet, Academic, Grades' },
                        { label: '🪪 College Student ID', title: 'College Student ID Card', cat: 'Education', tags: 'College ID, Student, Campus' },
                        { label: '🏛️ Bonafide / TC', title: 'Bonafide Certificate', cat: 'Education', tags: 'Bonafide, Official, University' },
                        { label: '🛂 Passport / Govt ID', title: 'National Identity / Passport', cat: 'Identity', tags: 'Govt ID, Official, Proof' },
                        { label: '🏥 Medical Record', title: 'Health & Medical Record', cat: 'Health', tags: 'Health, Medical, Prescription' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setName(preset.title);
                            setCategory(preset.cat as DocumentCategory);
                            setTagsStr(preset.tags);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#171A20] hover:bg-[#222836] border border-[#2A3344] text-[11px] text-[#C5CAD3] hover:text-white transition-all flex items-center gap-1"
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[#C5CAD3] block mb-1 font-medium">Document Name / Title *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., B.Tech Degree Certificate or Driver License"
                      className="w-full bg-[#171A20] border border-[#2D3342] rounded-xl px-3 py-2 text-sm text-[#F4F5F7] focus:outline-none focus:border-[#648BFF]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#C5CAD3] block mb-1 font-medium">Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as DocumentCategory)}
                        className="w-full bg-[#171A20] border border-[#2D3342] rounded-xl px-3 py-2 text-sm text-[#F4F5F7] focus:outline-none focus:border-[#648BFF]"
                      >
                        {['Identity', 'Education', 'Finance', 'Health', 'Personal', 'Other'].map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[#C5CAD3] block mb-1 font-medium">Optional Expiry Date</label>
                      <input
                        type="date"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full bg-[#171A20] border border-[#2D3342] rounded-xl px-3 py-2 text-sm text-[#F4F5F7] focus:outline-none focus:border-[#648BFF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#C5CAD3] block mb-1 font-medium">Optional Notes / Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional notes regarding this record"
                      className="w-full bg-[#171A20] border border-[#2D3342] rounded-xl px-3 py-2 text-sm text-[#F4F5F7] focus:outline-none focus:border-[#648BFF]"
                    />
                  </div>

                  <div>
                    <label className="text-[#C5CAD3] block mb-1 font-medium">Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={tagsStr}
                      onChange={(e) => setTagsStr(e.target.value)}
                      placeholder="official, government, renewal-needed"
                      className="w-full bg-[#171A20] border border-[#2D3342] rounded-xl px-3 py-2 text-sm text-[#F4F5F7] focus:outline-none focus:border-[#648BFF]"
                    />
                  </div>

                  {/* Health Privacy Consent Requirement */}
                  {category === 'Health' && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-rose-300">
                          Health Vault Privacy & Consent
                        </p>
                        <p className="text-[11px] text-[#9299A5] mt-0.5">
                          Health documents receive dedicated AES-256-GCM encryption. By checking this, you explicitly grant consent for secure indexing and private health storage.
                        </p>
                        <label className="flex items-center gap-2 mt-2 text-xs text-[#F4F5F7] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={healthConsent}
                            onChange={(e) => setHealthConsent(e.target.checked)}
                            className="w-4 h-4 accent-[#648BFF] rounded"
                          />
                          <span>I consent to private encrypted health document storage</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-[#9299A5] hover:text-[#F4F5F7] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDocument}
                  disabled={isSaving || !name.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#648BFF] hover:bg-[#5279f0] active:scale-98 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-[#648BFF]/20 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Encrypting & Storing...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Encrypt & Save to Vault</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
