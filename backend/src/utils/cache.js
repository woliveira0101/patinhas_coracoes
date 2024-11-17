const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient(process.env.REDIS_URL);

const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);

const cache = {
  get: async (key) => {
    const value = await getAsync(key);
    return JSON.parse(value);
  },
  set: async (key, value, expiryInSeconds = 3600) => {
    await setAsync(key, JSON.stringify(value), 'EX', expiryInSeconds);
  },
};

module.exports = cache;
