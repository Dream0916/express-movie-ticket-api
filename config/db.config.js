module.exports = {
  HOST: "localhost",
  USER: "postgres",
  PASSWORD: "orion199868",
  DB: "pjauth",
  dialect: "postgres",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};