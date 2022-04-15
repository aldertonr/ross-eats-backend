const mongoose = require('mongoose');
const config = require('../../config');

const connectToDB = async () => {
  try {
    console.log('Connecting to MongoDB');
    await mongoose.connect(config.db_address);
    console.log('Connected');
  } catch (error) {
    console.error(`Error whilst connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = {
  connectToDB,
};
