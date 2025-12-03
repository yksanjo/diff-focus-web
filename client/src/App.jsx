import { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle, Info, Loader2 } from 'lucide-react';

function App() {
  const [diffText, setDiffText] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!diffText.trim()) {
      setError('Please paste a diff to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diff: diffText }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message || 'Failed to analyze diff');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level) => {
    switch (level) {
      case 'High': return 'bg-red-100 text-red-800 border-red-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getFlagIcon = (type) => {
    switch (type) {
      case 'danger': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      default: return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Diff-Focus
          </h1>
          <p className="text-gray-600">Generate context cards for code reviews</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Paste your diff here:
          </label>
          <textarea
            value={diffText}
            onChange={(e) => setDiffText(e.target.value)}
            placeholder="diff --git a/file.js b/file.js&#10;index 1234567..abcdefg 100644&#10;--- a/file.js&#10;+++ b/file.js&#10;@@ -1,3 +1,3 @@&#10;..."
            className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Diff'
            )}
          </button>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
            </div>
          )}
        </div>

        {analysis && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis Results</h2>
            
            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${getRiskColor(analysis.riskLevel)}`}>
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Risk Level: {analysis.riskLevel}</span>
              </div>
            </div>

            {analysis.fileTypes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">File Types:</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.fileTypes.map((type, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {analysis.summary.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary:</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {analysis.summary.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.flags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Flags:</h3>
                <div className="space-y-2">
                  {analysis.flags.map((flag, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-md">
                      {getFlagIcon(flag.type)}
                      <span className="text-gray-700">{flag.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

