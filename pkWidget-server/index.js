import axios from 'axios';
import cors from 'cors';
import crypto from 'crypto';
import express from 'express';

import config from './config.js';

const server = express();
server.use(cors());

server.listen(config.port, () => {
  if (!config.api_key || config.api_key === '') {
    console.log('┌─────────────────────────────────────────────────────┐');
    console.log('│ API key is not specified! Please edit the config.js │');
    console.log('└─────────────────────────────────────────────────────┘');
  } else {
    console.log(`listening on port ${config.port}...`);
  }
});

server.get('/upload', async (req, res) => {
  const totalSizeBytes = encodeURIComponent(req.query.total_size_bytes);
  const upload = await axios.post(
    `${config.pkEndpoint}/uploads`,
    {
      total_size_bytes: totalSizeBytes,
      storage_type: 'local',
      api_key: config.api_key,
    }
  );

  const token = await axios.post(
    `${config.pkEndpoint}/uploads/${upload.data.id}/token`,
    { api_key: config.api_key }
  );

  res.send(JSON.stringify({
    upload_id: upload.data.id,
    jwt: token.data.jwt
  }));
});

server.get('/createApp', async (req, res) => {
  const platform = encodeURIComponent(req.query.platform);
  const app = await axios.post(
    `${config.pkEndpoint}/apps`,
    {
      name: crypto.randomBytes(16).toString("hex"),
      platform,
      api_key: config.api_key,
    }
  );

  const version = await axios.post(
    `${config.pkEndpoint}/apps/${app.data.secret}/versions`,
    {
      label: '1.0',
      api_key: config.api_key,
    }
  );

  res.send(JSON.stringify({
    app_secret: app.data.secret,
    version_id: version.data.id,
  }));
});

server.get('/process', async (req, res) => {
  const appSecret = encodeURIComponent(req.query.app_secret);
  const versionID = encodeURIComponent(req.query.version_id);
  const process = await axios.put(
    `${config.pkEndpoint}/apps/${appSecret}/versions/${versionID}/content_file`,
    {
      api_key: config.api_key,
      upload_id: req.query.upload_id,
    }
  );

  res.send(JSON.stringify(process.data));
});

server.get('/publish', async (req, res) => {
  const appSecret = encodeURIComponent(req.query.app_secret);
  const publish = await axios.post(
    `${config.pkEndpoint}/apps/${appSecret}/versions/1/publish`,
    {
      api_key: config.api_key,
    }
  );

  res.send(JSON.stringify(publish.data));
});

server.get('/fetchApp', async (req, res) => {
  const appSecret = encodeURIComponent(req.query.app_secret);
  const app = await axios.get(
    `${config.pkEndpoint}/apps/${appSecret}?api_key=${config.api_key}`,
    {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );

  res.send(JSON.stringify(app.data));
});