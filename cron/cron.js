const cron = require('node-cron');
const { RevokedTokens } = require('../db');
const { Op } = require('sequelize');

// Schedule a task to run every day at midnight (00:00)
cron.schedule('0 0 * * * ', () => {
  console.log('Cron job executed every day at midnight');
  const now = new Date();

  // Delete all revoked tokens
  RevokedTokens.destroy({
    where: {
      refreshTokenExpiresAt: {
        [Op.lt]: now,
      },
    },
  });
});