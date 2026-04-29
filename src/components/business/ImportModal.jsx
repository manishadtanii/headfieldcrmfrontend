import { useState, useRef } from 'react';
import {
  Upload, X, FileSpreadsheet, CheckCircle2, AlertTriangle,
  Download, RefreshCw, AlertCircle, ChevronDown, ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { baAPI } from '../../api';

const REASON_COLOR = {
  'Empty row': '#94a3b8',
};
const getReasonColor = (reason) => {
  for (const key of Object.keys(REASON_COLOR)) {
    if (reason.includes(key)) return REASON_COLOR[key];
  }
  return '#94a3b8';
};

export default function ImportModal({ open, onClose, onSuccess, slug }) {
  const [file, setFile]         = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [showAll, setShowAll]   = useState(false);
  const inputRef = useRef();

  if (!open) return null;

  const handleFile = (f) => {
    if (!f) return;
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!allowed.includes(f.type)) {
      toast.error('Only .xlsx or .xls files allowed');
      return;
    }
    setFile(f);
    setResult(null);
    setShowAll(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    if (!file) { toast.error('Please select a file first'); return; }
    setLoading(true);
    try {
      const res = await baAPI.importLeads(slug, file);
      const d   = res.data.data;
      setResult(d);
      if (d.inserted > 0) {
        toast.success(`${d.inserted} leads imported successfully!`);
        onSuccess(d.batchId);
      } else {
        toast.error('0 leads imported — check skipped rows.');
      }
    } catch (err) {
      const errData = err?.response?.data;
      // If backend returned partial data (all duplicates), show result screen
      if (errData?.data) {
        setResult(errData.data);
        toast.error(errData.message || 'Import failed');
      } else {
        toast.error(errData?.message || 'Import failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null); setResult(null); setLoading(false); setShowAll(false);
    onClose();
  };

  // Download skipped rows as CSV
  const downloadSkipped = () => {
    if (!result?.skippedDetails?.length) return;
    const headers = ['Excel Row', 'Name', 'Phone', 'Reason'];
    const rows    = result.skippedDetails.map(s => [
      s.row, s.name || '—', s.phone || '—', s.reason,
    ]);
    const csv  = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `skipped_leads_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Skipped leads downloaded!');
  };

  // Download sample template with new column headers
  const downloadSample = () => {
    const csv = [
      'Sr.,FirstName,MidName,LastName,Phone,Email,Address1,Address2,Address3,Zip,RM Name,Feedback,Source,Budget,Requirement,Notes',
      '1,Rahul,,Sharma,9876543210,rahul@email.com,123 MG Road,Andheri West,,400058,Suresh Kumar,Interested in 2BHK,IndiaMart,45L,2BHK,Ready to visit site',
      '2,Priya,A,Singh,9123456789,priya@email.com,Sector 14,,Gurgaon,122001,Amit Shah,,99acres,60L,3BHK,',
      '3,Vijay,,,8888777766,,,,,,,,Walk-In,,Office Space,',
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'leads_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  // Categorize skip reasons
  const categorize = (details = []) => {
    const groups = {};
    for (const s of details) {
      groups[s.reason] = (groups[s.reason] || 0) + 1;
    }
    return groups;
  };

  const displayedSkipped = showAll
    ? (result?.skippedDetails || [])
    : (result?.skippedDetails || []).slice(0, 8);

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div
        className="modal"
        style={{ maxWidth: 580, maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header" style={{ flexShrink: 0 }}>
          <div>
            <div className="modal-title">Import Leads from Excel</div>
            <div className="modal-subtitle">Upload .xlsx or .xls file</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={handleClose}><X size={18} /></button>
        </div>

        {/* Scrollable Body */}
        <div className="modal-body" style={{ overflowY: 'auto', flex: 1 }}>
          {!result ? (
            <>
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? '#818cf8' : file ? '#34d399' : 'var(--border)'}`,
                  borderRadius: 14,
                  padding: '36px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragging ? 'rgba(129,140,248,0.06)' : file ? 'rgba(52,211,153,0.06)' : 'var(--bg-elevated)',
                  transition: 'all .2s',
                  marginBottom: 16,
                }}
              >
                <input ref={inputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                {file ? (
                  <>
                    <FileSpreadsheet size={40} color="#34d399" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {(file.size / 1024).toFixed(1)} KB · Click to change file
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Drag & drop your Excel file here</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>or click to browse · .xlsx / .xls only</div>
                  </>
                )}
              </div>

              {/* Template download */}
              <button
                onClick={downloadSample}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '9px', borderRadius: 10, background: 'none', border: '1px dashed var(--border)', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 14 }}
              >
                <Download size={13} /> Download Sample Template
              </button>

              {/* Column guide */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '12px 16px', fontSize: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Supported columns <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(all optional — only blank rows skipped)</span></div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {[
                    'FirstName', 'MidName', 'LastName', 'Name',
                    'Phone', 'Email', 'Address1', 'Address2', 'Address3',
                    'Zip', 'RM Name', 'Feedback',
                    'Source', 'Budget', 'Requirement', 'Location', 'Notes', 'Sr.',
                  ].map((field) => (
                    <span key={field} style={{ padding: '2px 9px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      {field}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                  💡 Old format (Name + Phone) still works. New format (FirstName, LastName, Address1-3, etc.) also works.
                </div>
              </div>
            </>
          ) : (
            /* ── Result Screen ─────────────────────────────── */
            <>
              {/* Summary cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                <div style={{ background: '#34d39912', border: '1px solid #34d39930', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                  <CheckCircle2 size={22} color="#34d399" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 30, fontWeight: 800, color: '#34d399', lineHeight: 1 }}>{result.inserted}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Imported ✓</div>
                </div>
                <div style={{ background: '#ef444412', border: '1px solid #ef444430', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                  <AlertTriangle size={22} color="#ef4444" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 30, fontWeight: 800, color: '#ef4444', lineHeight: 1 }}>{result.skipped}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Skipped ✗</div>
                </div>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px', textAlign: 'center' }}>
                  <FileSpreadsheet size={22} color="var(--text-muted)" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{result.total}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Total rows</div>
                </div>
              </div>

              {/* Skip reason breakdown */}
              {result.skipped > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 7 }}>
                      <AlertCircle size={14} color="#ef4444" /> Skip Reason Breakdown
                    </div>
                    <button onClick={downloadSkipped}
                      style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 8, background: '#818cf818', border: '1px solid #818cf840', cursor: 'pointer', fontSize: 11, fontWeight: 700, color: '#818cf8' }}>
                      <Download size={11} /> Download CSV
                    </button>
                  </div>

                  {/* Reason pills */}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {Object.entries(categorize(result.skippedDetails)).map(([reason, count]) => (
                      <span key={reason} style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: `${getReasonColor(reason)}15`, color: getReasonColor(reason), border: `1px solid ${getReasonColor(reason)}30` }}>
                        {reason}: {count}
                      </span>
                    ))}
                  </div>

                  {/* Skipped rows table */}
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 8 }}>
                    {/* Table header */}
                    <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 120px 1fr', padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      <span>Row</span><span>Name</span><span>Phone</span><span>Reason</span>
                    </div>

                    {/* Rows */}
                    <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                      {displayedSkipped.map((s, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 120px 1fr', padding: '8px 12px', borderBottom: i < displayedSkipped.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>#{s.row}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>{s.name || '—'}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>{s.phone || '—'}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: getReasonColor(s.reason) }}>{s.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Show more toggle */}
                  {result.skippedDetails.length > 8 && (
                    <button onClick={() => setShowAll(s => !s)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '8px', borderRadius: 8, background: 'none', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
                      {showAll ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show all {result.skippedDetails.length} skipped</>}
                    </button>
                  )}
                </>
              )}

              {/* Success bar */}
              {result.inserted > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#34d39912', border: '1px solid #34d39930', borderRadius: 10 }}>
                  <CheckCircle2 size={16} color="#34d399" />
                  <div style={{ fontSize: 13, color: '#34d399', fontWeight: 600 }}>
                    {result.inserted} leads successfully added to your CRM. You can now assign them to employees.
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ flexShrink: 0 }}>
          <button className="btn btn-ghost" onClick={handleClose}>
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button
              className="btn btn-primary"
              onClick={handleImport}
              disabled={!file || loading}
              style={{ display: 'flex', alignItems: 'center', gap: 7 }}
            >
              {loading
                ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Importing…</>
                : <><Upload size={14} /> Import Leads</>}
            </button>
          )}
          {result && result.skipped > 0 && (
            <button onClick={downloadSkipped}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10, background: '#818cf8', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700, color: 'white' }}>
              <Download size={13} /> Download Skipped ({result.skipped})
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
