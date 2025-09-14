const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 20],
      notEmpty: true
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [6, 255],
      notEmpty: true
    }
  },
  profilePicture: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  bio: {
    type: DataTypes.TEXT,
    validate: {
      len: [0, 500]
    },
    defaultValue: ''
  },
  isAdmin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastLogin: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  reviewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  watchlistCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  }
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

User.prototype.updateReviewCount = async function() {
  const Review = require('./Review');
  this.reviewCount = await Review.count({ where: { userId: this.id } });
  return await this.save();
};

User.prototype.updateWatchlistCount = async function() {
  const Watchlist = require('./Watchlist');
  this.watchlistCount = await Watchlist.count({ where: { userId: this.id } });
  return await this.save();
};

// Class methods
User.findByCredentials = async function(emailOrUsername) {
  const { Op } = require('sequelize');
  return await this.findOne({
    where: {
      [Op.or]: [
        { email: emailOrUsername.toLowerCase() },
        { username: emailOrUsername }
      ]
    }
  });
};

module.exports = User;