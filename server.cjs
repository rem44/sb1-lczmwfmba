const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Configuration CORS pour Railway et développement local
app.use(cors({
  origin: [
    'super-scraper-production.up.railway.app',
    'http://localhost:5173',
    'http://localhost:5000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Parsing du JSON dans les requêtes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Stockage en mémoire pour les jobs de scraping
const scraperJobs = {};

// Route de vérification de santé
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route pour des données de test
app.get('/api/data', (req, res) => {
  console.log('Data requested');
  res.json({ message: "Voici vos données!", data: [1, 2, 3] });
});

// Route pour démarrer le scraper
app.post('/api/scraper/start', (req, res) => {
  const { username, password, searchTerms } = req.body;
  
  if (!username || !password) {
    console.log('Validation failed: missing username or password');
    return res.status(400).json({ 
      status: 'error', 
      message: 'Le nom d\'utilisateur et le mot de passe sont requis' 
    });
  }
  
  const jobId = Date.now().toString();
  
  scraperJobs[jobId] = {
    id: jobId,
    username,
    searchTerms: searchTerms || [],
    status: 'initializing',
    progress: 0,
    startTime: new Date().toISOString()
  };
  
  console.log(`Job créé: ${jobId} pour l'utilisateur ${username}`);
  
  simulateScrapingProcess(jobId);
  
  res.json({
    status: 'success',
    message: 'Job de scraping démarré avec succès',
    jobId
  });
});

// Route POST pour /api/scraper (pour la compatibilité)
app.post('/api/scraper', (req, res) => {
  const { username, password, searchTerms } = req.body;
  
  if (!username || !password) {
    console.log('Validation failed: missing username or password');
    return res.status(400).json({ 
      status: 'error', 
      message: 'Le nom d\'utilisateur et le mot de passe sont requis' 
    });
  }
  
  const jobId = Date.now().toString();
  
  scraperJobs[jobId] = {
    id: jobId,
    username,
    searchTerms: searchTerms || [],
    status: 'initializing',
    progress: 0,
    startTime: new Date().toISOString()
  };
  
  console.log(`Job créé: ${jobId} pour l'utilisateur ${username}`);
  
  simulateScrapingProcess(jobId);
  
  res.json({
    status: 'success',
    message: 'Job de scraping démarré avec succès',
    jobId
  });
});

// Route pour vérifier le statut d'un job
app.get('/api/scraper/status/:id', (req, res) => {
  const jobId = req.params.id;
  
  if (!scraperJobs[jobId]) {
    console.log(`Job non trouvé: ${jobId}`);
    return res.status(404).json({
      status: 'error',
      message: 'Job non trouvé'
    });
  }
  
  console.log(`Status requested for job: ${jobId}, current status: ${scraperJobs[jobId].status}`);
  
  res.json({
    id: jobId,
    status: scraperJobs[jobId].status,
    progress: scraperJobs[jobId].progress,
    startTime: scraperJobs[jobId].startTime,
    results: scraperJobs[jobId].results || []
  });
});

// Fonction pour simuler le processus de scraping
async function simulateScrapingProcess(jobId) {
  const job = scraperJobs[jobId];
  if (!job) return;
  
  const steps = [
    { status: 'initializing', progress: 0, delay: 2000 },
    { status: 'launching_browser', progress: 10, delay: 2000 },
    { status: 'logging_in', progress: 20, delay: 3000 },
    { status: 'searching', progress: 40, delay: 3000 },
    { status: 'processing_results', progress: 60, delay: 3000 },
    { status: 'downloading_documents', progress: 80, delay: 3000 },
    { status: 'completed', progress: 100, delay: 0 }
  ];
  
  for (const step of steps) {
    job.status = step.status;
    job.progress = step.progress;
    
    console.log(`Job ${jobId} mis à jour: status=${step.status}, progress=${step.progress}`);
    
    if (step.status === 'completed') {
      job.results = [
        {
          id: '1',
          title: 'Rénovation de bureaux administratifs',
          organization: 'Ministère des Transports',
          publicationDate: '2023-05-01',
          closingDate: '2023-06-01',
          documents: [
            { name: 'Document principal.pdf', size: '1.2 MB' },
            { name: 'Annexe technique.pdf', size: '0.8 MB' }
          ]
        },
        {
          id: '2',
          title: 'Fourniture de matériel informatique',
          organization: 'Centre de services scolaire de Montréal',
          publicationDate: '2023-05-05',
          closingDate: '2023-06-05',
          documents: [
            { name: 'Devis technique.pdf', size: '2.5 MB' },
            { name: 'Formulaire de soumission.xlsx', size: '0.3 MB' }
          ]
        }
      ];
    }
    
    if (step.delay > 0) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }
  }
}

// Route pour lister tous les jobs
app.get('/api/jobs', (req, res) => {
  console.log('Liste des jobs demandée');
  
  const jobsList = Object.keys(scraperJobs).map(key => ({
    id: scraperJobs[key].id,
    status: scraperJobs[key].status,
    progress: scraperJobs[key].progress,
    startTime: scraperJobs[key].startTime
  }));
  
  res.json({
    status: 'success',
    count: jobsList.length,
    jobs: jobsList
  });
});

// Gestionnaire d'erreurs pour les exceptions non gérées
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err);
  res.status(500).json({
    status: 'error',
    message: 'Une erreur est survenue sur le serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log(`Vérification de santé: http://localhost:${PORT}/api/health`);
  console.log(`API de scraping (start): http://localhost:${PORT}/api/scraper/start`);
  console.log(`API de scraping: http://localhost:${PORT}/api/scraper`);
  console.log(`Liste des jobs: http://localhost:${PORT}/api/jobs`);
});
