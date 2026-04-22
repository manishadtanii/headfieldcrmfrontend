import { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle, AlertCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { baAPI } from '../../api';

export default function ImportModal({ open, onClose, onSuccess, slug }) {
  const [file, setFile]         = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null); // import result
  const inputRef = useRef();

  if (!open) return null;

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!allowed.includes(f.type)) {
      toast.error('Only .xlsx or .xls files allowed');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleImport = async () => {
    if (!file) { toast.error('Please select a file first'); return; }
    setLoading(true);
    try {
      const res = await baAPI.importLeads(slug, file);
      const d = res.data.data;
      setResult(d);
      toast.success(`${d.inserted} leads imported!`);
      onSuccess(d.batchId);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null); setResult(null); setLoading(false);
    onClose();
  };

  // Download sample template
  const downloadSample = () => {
    const csv = 'Name,Phone,Email,Alt Phone,Source,Budget,Requirement,Location,Priority,Notes\nRahul Sharma,9876543210,rahul@email.com,,IndiaMart,45L,2BHK,Noida,high,Interested in ready possession';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'leads_template.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <div className="modal-title">Import Leads from Excel</div>
            <div className="modal-subtitle">Upload .xlsx or .xls file</div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={handleClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {!result ? (
            <>
              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? 'var(--primary)' : file ? 'var(--success)' : 'var(--border)'}`,
                  borderRadius: 12,
                  padding: '36px 20px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragging ? 'rgba(99,102,241,0.05)' : file ? 'rgba(16,185,129,0.05)' : 'var(--bg-elevated)',
                  transition: 'all .2s',
                  marginBottom: 16,
                }}
              >
                <input ref={inputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                {file ? (
                  <>
                    <FileSpreadsheet size={36} color="var(--success)" style={{ margin: '0 auto 10px' }} />
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{file.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {(file.size / 1024).toFixed(1)} KB · Click to change
                    </div>
                  </>
                ) : (
                  <>
                    <Upload size={36} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
                    <div style={{ fontWeight: 600, fontSize: 14 }}>Drag & drop your Excel file here</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>or click to browse</div>
                  </>
                )}
              </div>

              {/* Template download */}
              <button className="btn btn-ghost" style={{ width: '100%', marginBottom: 16, fontSize: 13 }} onClick={downloadSample}>
                <Download size={14} /> Download Sample Template
              </button>

              {/* Column hint */}
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text-muted)' }}>
                <strong style={{ color: 'var(--text)' }}>Required columns:</strong> Name, Phone<br />
                <strong style={{ color: 'var(--text)' }}>Optional:</strong> Email, Alt Phone, Source, Budget, Requirement, Location, Priority, Notes
              </div>
            </>
          ) : (
            /* Result screen */
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <CheckCircle size={48} color="var(--success)" style={{ margin: '0 auto 16px' }} />
              <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>Import Complete!</div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', margin: '16px 0' }}>
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid var(--success)', borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--success)' }}>{result.inserted}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Imported</div>
                </div>
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--danger)' }}>{result.skipped}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Skipped</div>
                </div>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 800 }}>{result.total}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Total Rows</div>
                </div>
              </div>
              {result.skippedDetails?.length > 0 && (
                <div style={{ textAlign: 'left', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
                  <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--danger)' }}>Skipped rows:</div>
                  {result.skippedDetails.slice(0, 5).map((s, i) => (
                    <div key={i}>Row {s.row}: {s.reason}</div>
                  ))}
                  {result.skippedDetails.length > 5 && <div>+{result.skippedDetails.length - 5} more…</div>}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={handleClose}>
            {result ? 'Close' : 'Cancel'}
          </button>
          {!result && (
            <button className="btn btn-primary" onClick={handleImport} disabled={!file || loading}>
              {loading ? 'Importing…' : 'Import Leads'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
