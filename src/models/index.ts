const Sequelize = require('sequelize');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const db = {};
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  dialectOptions: {
    charset: 'utf8mb4',
    dateStrings: true,
    typeCast: true
  },
  timezone: '+09:00'
});
fs.readdirSync(__dirname)
  .filter(function(file: string | string[]) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
  })
  .forEach(function(file) {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

db.Refugee.hasMany(db.VisitLog, { foreignKey: 'id' });
db.VisitLog.belongsTo(db.Refugee, { foreignKey: 'refugee_id' });

db.Operator = Sequelize.Op;

module.exports = db;