const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/dist')));
  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html')));
}

const analyzeDiff = (diffText) => {
  const analysis = { riskLevel: 'Low', summary: [], flags: [], fileTypes: new Set() };
  
  const filePattern = /diff --git a\/([^\s]+)/g;
  let match;
  while ((match = filePattern.exec(diffText)) !== null) {
    const filepath = match[1];
    if (filepath.endsWith('.jsx') || filepath.endsWith('.tsx')) analysis.fileTypes.add('React Component');
    else if (filepath.endsWith('.hh') || filepath.endsWith('.php')) analysis.fileTypes.add('Hack/PHP Backend');
    else if (filepath.endsWith('.py')) analysis.fileTypes.add('Python');
    else if (filepath.endsWith('.sql')) analysis.fileTypes.add('SQL Migration');
    else if (filepath.endsWith('.css') || filepath.endsWith('.scss')) analysis.fileTypes.add('Styling');
  }
  
  let riskScore = 0;
  
  if (/DROP\s+TABLE|ALTER\s+TABLE|DELETE\s+FROM|TRUNCATE/i.test(diffText)) {
    analysis.flags.push({ type: 'danger', msg: 'Destructive database operation detected.' });
    riskScore += 5;
  }
  
  if (/Auth::|PrivacyCheck|ViewerContext|\.env|config\.|secrets/i.test(diffText)) {
    analysis.flags.push({ type: 'warning', msg: 'Authentication, privacy, or config change.' });
    riskScore += 2;
  }
  
  if (/torch\.(nn\.|optim|load|save)/i.test(diffText)) {
    analysis.flags.push({ type: 'warning', msg: 'PyTorch model logic modified (FAIR team relevance).' });
    riskScore += 2;
  }
  
  if (/console\.log|var_dump|print_r|pdb\.set_trace/i.test(diffText)) {
    analysis.flags.push({ type: 'info', msg: 'Debug artifact (console.log, var_dump, etc.) left in code.' });
  }
  
  if (analysis.fileTypes.has('React Component') && /useEffect|useState|useContext/.test(diffText)) {
    analysis.summary.push('Modifies React component logic or hooks.');
  }
  
  if (analysis.fileTypes.has('Styling') && riskScore === 0) {
    analysis.summary.push('Primarily a CSS/styling update.');
  }
  
  if (analysis.fileTypes.has('Python') && /class.*\(nn\.Module\)/.test(diffText)) {
    analysis.summary.push('Defines or modifies a PyTorch neural network module.');
  }
  
  if (/^\+\s*\/\/\s*TODO:|^#\s*TODO:/m.test(diffText)) {
    analysis.summary.push('Contains TODO comments – may indicate incomplete work.');
  }
  
  if (analysis.summary.length === 0) {
    analysis.summary.push('General code update with no clear pattern.');
  }
  
  if (riskScore >= 5) analysis.riskLevel = 'High';
  else if (riskScore >= 2) analysis.riskLevel = 'Medium';
  else analysis.riskLevel = 'Low';
  
  return { ...analysis, fileTypes: Array.from(analysis.fileTypes) };
};

app.post('/api/analyze', (req, res) => {
  const diff = typeof req.body === 'string' ? req.body : req.body?.diff;
  if (!diff || diff.trim().length === 0) {
    return res.status(400).json({ error: 'No diff content provided' });
  }
  
  setTimeout(() => {
    const result = analyzeDiff(diff);
    res.json(result);
  }, 600);
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

