module.exports = (sequelize, Sequelize) => {
  const OTP = sequelize.define('otp', {
    userid: {
      type: Sequelize.INTEGER,
      notEmpty: true,
      notNull: true,
      unique: true
    },
    otpcode: {
      type: Sequelize.INTEGER,
      allowNull: true,
    }
  })
  return OTP;
}