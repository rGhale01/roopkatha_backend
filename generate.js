import crypto from 'crypto';

const generateAppKey = () => {
  return crypto.randomBytes(32).toString('hex');
};

console.log('Generated APP_KEY:', generateAppKey());