import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'tenant_hub_db.json');
const CONFIG_FILE = path.join(DATA_DIR, 'tenant_hub_config.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache backed by file
let dbCache: any = null;
let configCache: { url: string; anonKey: string } = { url: '', anonKey: '' };
let lastUpdated = Date.now();

// Load initial caches
try {
  if (fs.existsSync(DB_FILE)) {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    dbCache = JSON.parse(raw);
    console.log('[Server] Loaded database from disk');
  }
} catch (e) {
  console.error('[Server] Error reading db file:', e);
}

try {
  if (fs.existsSync(CONFIG_FILE)) {
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
    configCache = JSON.parse(raw);
  }
} catch (e) {
  console.error('[Server] Error reading config file:', e);
}

// Also check environment variables for Supabase config
if (!configCache.url && process.env.VITE_SUPABASE_URL) {
  configCache.url = process.env.VITE_SUPABASE_URL;
}
if (!configCache.anonKey && process.env.VITE_SUPABASE_ANON_KEY) {
  configCache.anonKey = process.env.VITE_SUPABASE_ANON_KEY;
}

function persistDb(data: any) {
  dbCache = data;
  lastUpdated = Date.now();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Server] Error saving db to disk:', e);
  }
}

function persistConfig(cfg: { url: string; anonKey: string }) {
  configCache = cfg;
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Server] Error saving config to disk:', e);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // --- API Endpoints ---

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: Date.now(), lastUpdated });
  });

  // Get Supabase configuration (accessible across devices: phone & laptop)
  app.get('/api/config/supabase', (_req: Request, res: Response) => {
    const url = configCache.url || process.env.VITE_SUPABASE_URL || '';
    const anonKey = configCache.anonKey || process.env.VITE_SUPABASE_ANON_KEY || '';
    res.json({
      url,
      anonKey,
      isConfigured: Boolean(url && anonKey),
    });
  });

  // Set Supabase configuration (updates on server so phone and laptop are both configured)
  app.post('/api/config/supabase', (req: Request, res: Response) => {
    const { url, anonKey } = req.body || {};
    const cleanUrl = String(url || '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
    const cleanKey = String(anonKey || '').trim();

    persistConfig({ url: cleanUrl, anonKey: cleanKey });
    console.log('[Server] Updated shared Supabase config:', cleanUrl ? 'Configured' : 'Cleared');
    res.json({
      success: true,
      url: cleanUrl,
      anonKey: cleanKey,
      isConfigured: Boolean(cleanUrl && cleanKey),
    });
  });

  // Get current DB state (shared across phone & laptop)
  app.get('/api/db', (_req: Request, res: Response) => {
    res.json({
      success: true,
      lastUpdated,
      data: dbCache,
    });
  });

  // Update DB state
  app.post('/api/db', (req: Request, res: Response) => {
    const incomingData = req.body;
    if (!incomingData || typeof incomingData !== 'object') {
      res.status(400).json({ success: false, error: 'Invalid database payload' });
      return;
    }

    persistDb(incomingData);
    res.json({ success: true, lastUpdated });
  });

  // Merge/Add a single Water record
  app.post('/api/water/record', (req: Request, res: Response) => {
    const { tableName, record } = req.body;
    if (!tableName || !record) {
      res.status(400).json({ success: false, error: 'Missing tableName or record' });
      return;
    }

    if (!dbCache) dbCache = { waterTables: {}, rentTables: {}, infoTables: {} };
    if (!dbCache.waterTables) dbCache.waterTables = {};
    if (!dbCache.waterTables[tableName]) dbCache.waterTables[tableName] = [];

    const list = dbCache.waterTables[tableName];
    const existingIdx = list.findIndex((r: any) => String(r.id) === String(record.id) || r.DATE === record.DATE);
    if (existingIdx !== -1) {
      list[existingIdx] = { ...list[existingIdx], ...record };
    } else {
      list.push(record);
    }

    persistDb(dbCache);
    res.json({ success: true, count: list.length, lastUpdated });
  });

  // Delete a Water record
  app.delete('/api/water/record', (req: Request, res: Response) => {
    const { tableName, recordId } = req.body;
    if (!tableName || !recordId) {
      res.status(400).json({ success: false, error: 'Missing tableName or recordId' });
      return;
    }

    if (dbCache?.waterTables?.[tableName]) {
      dbCache.waterTables[tableName] = dbCache.waterTables[tableName].filter(
        (r: any) => String(r.id) !== String(recordId) && r.DATE !== String(recordId)
      );
      persistDb(dbCache);
    }

    res.json({ success: true, lastUpdated });
  });

  // Merge/Add a Rent record
  app.post('/api/rent/record', (req: Request, res: Response) => {
    const { tableName, record } = req.body;
    if (!tableName || !record) {
      res.status(400).json({ success: false, error: 'Missing tableName or record' });
      return;
    }

    if (!dbCache) dbCache = { waterTables: {}, rentTables: {}, infoTables: {} };
    if (!dbCache.rentTables) dbCache.rentTables = {};
    if (!dbCache.rentTables[tableName]) dbCache.rentTables[tableName] = [];

    const list = dbCache.rentTables[tableName];
    const existingIdx = list.findIndex((r: any) => String(r.id) === String(record.id) || r.DATE === record.DATE);
    if (existingIdx !== -1) {
      list[existingIdx] = { ...list[existingIdx], ...record };
    } else {
      list.push(record);
    }

    persistDb(dbCache);
    res.json({ success: true, count: list.length, lastUpdated });
  });

  // Vite middleware in dev or static files in production
  const isProd = process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(__dirname, 'dist'));
  if (isProd) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Tenant Hub server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
