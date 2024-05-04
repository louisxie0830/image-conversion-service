const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const { imageUploadHandler } = require('./routes/imageUploadHandler');

const app = express();
const port = process.env.PORT || 3000;
app.set('trust proxy', true);
app.use(helmet());
app.use(morgan('tiny'));
app.use(cors());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

// app.use(limiter);

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Image conversion Service!');
});

app.post('/upload', imageUploadHandler);

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) {
    return next(err);
  }
  const statusCode = err.status || 500;
  res.status(statusCode).send({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
