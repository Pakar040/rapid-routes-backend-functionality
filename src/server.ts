import type { Request, Response } from 'express';

const express = require('express');
const path = require('path');
const app = express();

app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(3000, () => console.log('Server running at http://localhost:3000'));
