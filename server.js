const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './conf.env' });
const app = require('./app.js');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection succesful!'));

// console.log(process.env)

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`this app running on port ${port}`);
});
