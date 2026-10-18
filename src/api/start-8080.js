process.env.PORT = 8080;
const app = require('./index.js');

app.listen(process.env.PORT, '0.0.0.0', () => {
  console.log(`API listening on port ${process.env.PORT}`);
});
