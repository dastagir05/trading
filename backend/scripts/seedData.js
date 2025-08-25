const mongoose = require('mongoose');
const User = require('../models/user.model');
const Trade = require('../models/trade.model');
const AiTrade = require('../models/aiTrade.model');
const Settings = require('../models/settings.model');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/niveshnow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Trade.deleteMany({});
    await AiTrade.deleteMany({});
    await Settings.deleteMany({});

    // Create sample users
    const users = await User.create([
      {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+91 98765 43210',
        providerId: 'google_123',
        role: 'user',
        lastLogin: new Date(),
        totalMoney: 1500000,
        realisedPL: 25000,
        unrealisedPL: 5000,
        totalTrades: 45,
        winRate: 68
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+91 98765 43211',
        providerId: 'google_124',
        role: 'admin',
        lastLogin: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        totalMoney: 2000000,
        realisedPL: 35000,
        unrealisedPL: 8000,
        totalTrades: 67,
        winRate: 72
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        phone: '+91 98765 43212',
        providerId: 'google_125',
        role: 'user',
        lastLogin: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        totalMoney: 800000,
        realisedPL: -5000,
        unrealisedPL: -2000,
        totalTrades: 23,
        winRate: 45
      },
      {
        name: 'Alice Brown',
        email: 'alice@example.com',
        phone: '+91 98765 43213',
        providerId: 'google_126',
        role: 'user',
        lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        totalMoney: 1200000,
        realisedPL: 15000,
        unrealisedPL: 3000,
        totalTrades: 34,
        winRate: 58
      },
      {
        name: 'Charlie Wilson',
        email: 'charlie@example.com',
        phone: '+91 98765 43214',
        providerId: 'google_127',
        role: 'user',
        lastLogin: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        totalMoney: 600000,
        realisedPL: -8000,
        unrealisedPL: -1500,
        totalTrades: 18,
        winRate: 33
      }
    ]);

    console.log(`✅ Created ${users.length} users`);

    // Create sample trades
    const trades = await Trade.create([
      {
        userId: users[0]._id,
        symbol: 'RELIANCE',
        side: 'BUY',
        quantity: 100,
        price: 2500,
        realisedPL: 5000,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[0]._id,
        symbol: 'TCS',
        side: 'SELL',
        quantity: 50,
        price: 3500,
        realisedPL: -2000,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[1]._id,
        symbol: 'INFY',
        side: 'BUY',
        quantity: 200,
        price: 1500,
        realisedPL: 8000,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[2]._id,
        symbol: 'HDFC',
        side: 'BUY',
        quantity: 75,
        price: 1800,
        realisedPL: -3000,
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[3]._id,
        symbol: 'WIPRO',
        side: 'SELL',
        quantity: 120,
        price: 450,
        realisedPL: 4000,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log(`✅ Created ${trades.length} trades`);

    // Create sample AI trades
    const aiTrades = await AiTrade.create([
      {
        userId: users[0]._id,
        symbol: 'RELIANCE',
        side: 'BUY',
        quantity: 50,
        price: 2480,
        confidence: 85,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[1]._id,
        symbol: 'TCS',
        side: 'SELL',
        quantity: 100,
        price: 3520,
        confidence: 92,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        userId: users[3]._id,
        symbol: 'INFY',
        side: 'BUY',
        quantity: 150,
        price: 1480,
        confidence: 78,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log(`✅ Created ${aiTrades.length} AI trades`);

    // Create default settings
    const settings = new Settings();
    await settings.save();

    console.log('✅ Created default settings');

    console.log('🎉 Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
