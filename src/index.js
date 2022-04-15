const express = require('express');
const cors = require('cors');
const config = require('../config');
const dbHelper = require('./libs/db_helper');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/account', require('./routes/account'));

app.use((req, res) => {
  res.status(404).json('Endpoint not found');
});

app.use((err, req, res) => {
  res.status(400).json(err.toString());
});

const startListening = (connAttempt = 0) => {
  if (connAttempt > 5) {
    console.error('MongoDB Connection Attempts Exceeded');
    process.exit(1);
  }
  dbHelper.connectToDB().then(() => {
    app.listen(config.default_port, () => console.log(`Listening on port ${config.default_port}`));
  }).catch(() => {
    setTimeout(() => startListening(connAttempt + 1), 1000);
  });
};

startListening();
