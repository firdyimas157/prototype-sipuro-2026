import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || process.env.CPORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-key-change-this',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  database: {
    url: process.env.DATABASE_URL,
  },
};