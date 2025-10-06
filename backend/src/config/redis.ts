import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redis: RedisClientType;

export async function connectRedis() {
  try {
    redis = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redis.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redis.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });

    redis.on('ready', () => {
      logger.info('✅ Redis ready for operations');
    });

    redis.on('end', () => {
      logger.info('✅ Redis connection ended');
    });

    await redis.connect();
  } catch (error) {
    logger.error('❌ Redis connection failed:', error);
    throw error;
  }
}

export async function disconnectRedis() {
  try {
    if (redis) {
      await redis.quit();
      logger.info('✅ Redis disconnected successfully');
    }
  } catch (error) {
    logger.error('❌ Redis disconnection failed:', error);
    throw error;
  }
}

export { redis };