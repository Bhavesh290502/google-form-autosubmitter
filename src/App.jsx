import React, { useState, useEffect } from 'react';

function App() {
  const [formUrl, setFormUrl] = useState('');
  const [parsedFields, setParsedFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  
  // Bulk upload states
  const [csvFile, setCsvFile] = useState(null);
  const [fieldMapping, setFieldMapping] = useState({});
  const [usePuppeteer, setUsePuppeteer] = useState(false);

  const handleParseForm = async () => {
    setLoading(true);
    setStatus('Parsing form...');
    try {
      const res = await fetch('/api/parse-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setParsedFields(data.data.fields);
        setStatus('Form parsed successfully!');
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatus('Failed to parse form.');
    }
    setLoading(false);
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Submitting...');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formUrl, formData, usePuppeteer }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Successfully submitted!');
        setLogs(prev => [`[SUCCESS] Submitted single entry.`, ...prev]);
      } else {
        setStatus(`Error: ${data.error}`);
        setLogs(prev => [`[ERROR] ${data.error}`, ...prev]);
      }
    } catch (err) {
      setStatus('Submission failed.');
      setLogs(prev => [`[ERROR] Submission failed.`, ...prev]);
    }
    setLoading(false);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) return alert('Please select a CSV file');

    setLoading(true);
    setStatus('Uploading and starting bulk submission...');
    const formDataPayload = new FormData();
    formDataPayload.append('csvFile', csvFile);
    formDataPayload.append('formUrl', formUrl);
    formDataPayload.append('fieldMapping', JSON.stringify(fieldMapping));
    formDataPayload.append('usePuppeteer', usePuppeteer);

    try {
      const res = await fetch('/api/bulk-submit', {
        method: 'POST',
        body: formDataPayload,
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Bulk submission started! Check backend logs.');
        setLogs(prev => [`[INFO] Bulk submission started with ${csvFile.name}.`, ...prev]);
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (err) {
      setStatus('Bulk submission request failed.');
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      <header>
        <h1>Google Form Auto-Submitter</h1>
        <p className="subtitle">High-performance form automation</p>
      </header>

      <main>
        <section className="card">
          <h2>1. Target Form</h2>
          <div className="input-group">
            <input 
              type="text" 
              placeholder="Enter Google Form URL (viewform)" 
              value={formUrl}
              onChange={(e) => setFormUrl(e.target.value)}
              className="glass-input"
            />
            <button onClick={handleParseForm} disabled={loading || !formUrl} className="primary-btn">
              {loading ? 'Processing...' : 'Parse Form'}
            </button>
          </div>
          <p className="status-text">{status}</p>
        </section>

        {parsedFields.length > 0 && (
          <div className="grid-container">
            <section className="card">
              <h2>2A. Single Submission</h2>
              <form onSubmit={handleSingleSubmit} className="dynamic-form">
                {parsedFields.map((field) => (
                  <div key={field.id} className="input-group">
                    <label>{field.id}</label>
                    <input 
                      type="text" 
                      placeholder={`Enter value for ${field.id}`}
                      onChange={(e) => setFormData({...formData, [field.id]: e.target.value})}
                      className="glass-input"
                      required
                    />
                  </div>
                ))}
                
                <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                  <input type="checkbox" id="pup-single" checked={usePuppeteer} onChange={e => setUsePuppeteer(e.target.checked)} style={{width: 'auto'}} />
                  <label htmlFor="pup-single">Use Browser Automation (Bypasses 401 Blocks, slower)</label>
                </div>

                <button type="submit" disabled={loading} className="primary-btn w-full">Submit Entry</button>
              </form>
            </section>

            <section className="card">
              <h2>2B. Bulk CSV Submission</h2>
              <form onSubmit={handleBulkSubmit} className="dynamic-form">
                <div className="input-group">
                  <label>CSV File</label>
                  <input 
                    type="file" 
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files[0])}
                    className="file-input"
                  />
                </div>
                
                <div className="mapping-section">
                  <h3>Map CSV Columns to Fields</h3>
                  <p className="help-text">Example: "wallet" -> "entry.123456"</p>
                  {parsedFields.map(field => (
                    <div key={field.id} className="input-group mapping-row">
                      <span>{field.id}</span>
                      <input 
                        type="text" 
                        placeholder="CSV Column Name" 
                        onChange={(e) => setFieldMapping({...fieldMapping, [e.target.value]: field.id})}
                        className="glass-input"
                      />
                    </div>
                  ))}
                </div>
                
                <button type="submit" disabled={loading || !csvFile} className="secondary-btn w-full">
                  Start Bulk Submission
                </button>
              </form>
            </section>
          </div>
        )}

        <section className="card logs-card">
          <h2>Submission Logs</h2>
          <div className="logs-container">
            {logs.length === 0 ? <p className="empty-logs">No logs yet...</p> : null}
            {logs.map((log, i) => (
              <div key={i} className={`log-entry ${log.includes('SUCCESS') ? 'success' : log.includes('ERROR') ? 'error' : 'info'}`}>
                {log}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
