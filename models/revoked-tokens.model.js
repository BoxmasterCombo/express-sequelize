'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RevokedTokens = sequelize.define('RevokedTokens', {
    accessToken: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    refreshToken: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    accessTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    refreshTokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'RevokedTokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return RevokedTokens;
};
