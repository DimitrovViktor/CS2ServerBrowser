import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import fs from 'fs';
import multer, { StorageEngine } from 'multer';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // make limit 10mb

// PostgreSQL connection setup
const pool = new Pool({
  user: 'postgres',   
  host: 'localhost',
  database: 'database', 
  password: '', 
  port: 5432,
});

const Gamedig = require('gamedig');


// hardcoded sample of data
const servers = [
  {
    id: 1,
    ip: '202.181.188.156',
    port: 27016,
    name: 'CS2 Competitive #1',
    description: 'Official competitive matchmaking server',
    country_code: 'US',
    map: 'de_dust2',
    current_players: 10,
    max_players: 10,
    is_online: true,
    tags: ['competitive', '5v5', 'matchmaking']
  }
];

// query server
async function queryServer(ip: string, port: number) {
  try {
    const response = await Gamedig.query({
      type: 'cs2',
      host: ip,
      port: port,
      maxRetries: 1,
      timeout: 5000
    });
    
    return {
      success: true,
      data: {
        map: response.map,
        current_players: response.raw.numplayers || response.players.length,
        max_players: response.maxplayers,
        is_online: true
      }
    };
  } catch (error) {
    console.error(`Error querying server ${ip}:${port}:`, error);
    return {
      success: false,
      data: {
        map: 'Unknown',
        current_players: 0,
        max_players: 0,
        is_online: false
      }
    };
  }
}

let serverCache: any[] = [];

async function updateCache() {
  console.log('Updating server cache...');
  try {
    // fetch servers from database
    const result = await pool.query('SELECT id, ip, port FROM servers');
    const dbServers = result.rows;

    // query each server for live data
    const serverPromises = dbServers.map(async (server) => {
      const result = await queryServer(server.ip, server.port);
      return {
        ...server,
        ...result.data
      };
    });

    serverCache = await Promise.all(serverPromises);
    console.log('Server cache updated successfully');
  } catch (error) {
    console.error('Error updating server cache:', error);
  }
}

// update cache
updateCache();
setInterval(updateCache, 30000);

app.get('/api/servers', async (req, res) => {
  try {
    // Get static info from DB
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, 'supersecretkey');
        if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
          userId = (decoded as any).id;
        }
      } catch {}
    }
    const result = await pool.query(`
      SELECT s.*, 
        COALESCE(json_agg(t.name) FILTER (WHERE t.name IS NOT NULL), '[]') AS tags,
        (SELECT COUNT(*) FROM server_likes sl WHERE sl.server_id = s.id) AS likes,
        (SELECT COUNT(*) FROM server_likes sl WHERE sl.server_id = s.id AND sl.user_id = $1) > 0 AS liked_by_user
      FROM servers s
      LEFT JOIN server_tags st ON s.id = st.server_id
      LEFT JOIN tags t ON st.tag_id = t.id
      GROUP BY s.id
    `, [userId]);
    const dbServers = result.rows;

    // merge with cache
    const merged = dbServers.map(dbServer => {
      const live = serverCache.find(
        cached =>
          cached.ip === dbServer.ip &&
          cached.port === dbServer.port
      );
      return {
        ...dbServer,
        current_map: live?.map ?? dbServer.current_map,
        current_players: live?.current_players ?? dbServer.current_players,
        max_players: live?.max_players ?? dbServer.max_players,
        status: live?.is_online ? 'online' : 'offline'
      };
    });

    res.json(merged);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});


app.post('/api/servers/register', (req, res) => {
  const { ip, port, name } = req.body;
  
  if (!ip || !port || !name) {
    return res.status(400).json({ error: 'Missing required fields: ip, port, name' });
  }
  
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipRegex.test(ip)) {
    return res.status(400).json({ error: 'Invalid IP address format' });
  }
  
  if (port < 1 || port > 65535) {
    return res.status(400).json({ error: 'Port must be between 1 and 65535' });
  }
  
  const existingServer = servers.find(s => s.ip === ip && s.port === port);
  if (existingServer) {
    return res.status(409).json({ error: 'Server already registered' });
  }
  
  // create new server
  const newServer = {
    id: servers.length + 1,
    ip,
    port,
    name,
    description: '',
    country_code: '',
    map: '',
    current_players: 0,
    max_players: 0,
    is_online: false,
    tags: []
  };
  
  servers.push(newServer);
  
  res.status(201).json(newServer);
});

app.get('/api/servers/:id/status', async (req, res) => {
  const serverId = parseInt(req.params.id);
  const server = servers.find(s => s.id === serverId);
  
  if (!server) {
    return res.status(404).json({ error: 'Server not found' });
  }
  
  try {
    const result = await queryServer(server.ip, server.port);
    
    if (result.success) {
      res.json({
        ...server,
        ...result.data
      });
    } else {
      res.status(503).json({
        ...server,
        ...result.data,
        error: 'Server is offline or not responding'
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/servers/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM servers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Server not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// user registration
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ message: 'Missing username, email, or password' });

  try {
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    if (userCheck.rows.length > 0)
      return res.status(409).json({ message: 'Username or email already exists' });

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, permission_type`,
      [username, email, hash]
    );
    const user = result.rows[0];

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// user login
app.post('/api/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  if (!usernameOrEmail || !password)
    return res.status(400).json({ message: 'Missing username/email or password' });

  try {
    const result = await pool.query(
      'SELECT id, username, email, password_hash, permission_type FROM users WHERE username = $1 OR email = $1',
      [usernameOrEmail]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ message: 'Invalid credentials' });

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: { id: user.id, username: user.username, email: user.email, permission_type: user.permission_type }, token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

const JWT_SECRET = 'supersecretkey';

interface AuthenticatedRequest extends Request {
  user?: any;
}

// auth middleware
function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// protected server creation
app.post('/api/servers', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const { ip, port, name, description, country_code, current_map, game_mode, max_players, game, prime, banner_url, tags } = req.body;
  const owner_id = req.user.id;

  if (!ip || !port || !name || !game || !prime) {
    return res.status(400).json({ error: 'Missing required fields: ip, port, name, game, prime' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO servers (owner_id, ip, port, name, description, country_code, current_map, game_mode, max_players, game, prime, banner_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [owner_id, ip, port, name, description, country_code, current_map, game_mode, max_players, game, prime, banner_url]
    );
    const serverId = result.rows[0].id;
    if (Array.isArray(tags)) {
      for (const tag of tags) {

        const tagRes = await pool.query('INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id', [tag]);
        const tagId = tagRes.rows[0].id;

        await pool.query('INSERT INTO server_tags (server_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [serverId, tagId]);
      }
    }
    // update cache immediately after adding a server
    await updateCache();
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: (err as Error).message });
  }
});

// update server
app.put('/api/servers/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id;
  const { name, description, country_code, current_map, game_mode, max_players, game, prime, banner_url, tags } = req.body;
  try {
    const result = await pool.query(
      `UPDATE servers SET name=$1, description=$2, country_code=$3, current_map=$4, game_mode=$5, max_players=$6, game=$7, prime=$8, banner_url=$9, updated_at=NOW()
       WHERE id=$10 RETURNING *`,
      [name, description, country_code, current_map, game_mode, max_players, game, prime, banner_url, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Server not found' });

    await pool.query('DELETE FROM server_tags WHERE server_id = $1', [id]);

    if (Array.isArray(tags)) {
      for (const tag of tags) {
        const tagRes = await pool.query('INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id', [tag]);
        const tagId = tagRes.rows[0].id;
        await pool.query('INSERT INTO server_tags (server_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, tagId]);
      }
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// like endpoints
app.post('/api/servers/:id/like', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const serverId = parseInt(req.params.id);
  const userId = req.user.id;
  try {
    await pool.query(
      'INSERT INTO server_likes (user_id, server_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userId, serverId]
    );
    await pool.query(
      'UPDATE servers SET likes = likes + 1, total_likes = total_likes + 1 WHERE id = $1',
      [serverId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/servers/:id/unlike', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  const serverId = parseInt(req.params.id);
  const userId = req.user.id;
  try {
    const result = await pool.query(
      'DELETE FROM server_likes WHERE user_id = $1 AND server_id = $2 RETURNING id',
      [userId, serverId]
    );
    if ((result.rowCount as number) > 0) {
      await pool.query(
        'UPDATE servers SET likes = GREATEST(likes - 1, 0) WHERE id = $1',
        [serverId]
      );
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});


app.use('/images/banners', express.static(path.join(__dirname, '../csgo-server-browser/images/banners')));

// multer setup for banner uploads
const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../csgo-server-browser/images/banners');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `banner_${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});
const uploadBanner = multer({ storage: bannerStorage });

// banner upload endpoint
app.post(
  '/api/upload/banner',
  [authMiddleware, uploadBanner.single('banner')] as any[],
  (req: Request, res: Response) => {
    const file = req.file as Express.Multer.File | undefined;
    const oldBannerUrl = req.body.old_banner_url as string | undefined;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    // delete old banner file if provided
    if (oldBannerUrl) {
      const oldPath = path.join(__dirname, '../csgo-server-browser', oldBannerUrl.replace(/^\//, ''));
      fs.unlink(oldPath, err => {
        
      });
    }
    res.json({ banner_url: `/images/banners/${file.filename}` });
  }
);

app.get('/', (req, res) => {
  res.send('CSGO Server Browser API');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});