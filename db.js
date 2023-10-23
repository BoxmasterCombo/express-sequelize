const { Sequelize } = require('sequelize');
const config = require('./config/config');
const path = require('path');
const fs = require('fs');

const sequelize = new Sequelize({
  dialect: config.dialect,
  username: config.username,
  password: config.password,
  database: config.database,
  host: config.host,
  port: config.port,
  sync: true,
});

try {
  sequelize.authenticate();
  console.log('Sequelize: Connection has been established successfully.');
} catch (error) {
  console.error('Sequelize: Unable to connect to the database:', error);
}

const db = {};

const modelsDir = path.join(__dirname, 'models');

fs.readdirSync(modelsDir)
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const model = require(path.join(modelsDir, file))(sequelize, Sequelize);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
