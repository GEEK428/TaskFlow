const { z } = require('zod');
const dotenv = require('dotenv');

// Load env variables first
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('5000'),
  MONGO_URI: z.string().url(),
  JWT_SECRET: z.string().min(1),
  GEMINI_API_KEY: z.string().min(1),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

function validateEnv() {
  // Deep clean ALL process.env variables for any bleed-over characters
  const cleanEnv = {};
  Object.keys(process.env).forEach(key => {
    if (typeof process.env[key] === 'string') {
      // Only remove trailing whitespace and newlines
      const value = process.env[key].split(/[\s\n\r]/)[0].trim();
      cleanEnv[key] = value;
    } else {
      cleanEnv[key] = process.env[key];
    }
  });

  const result = envSchema.safeParse(cleanEnv);

  if (!result.success) {
    console.error('❌ Environment Validation Failed:');
    result.error.issues.forEach((issue) => {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`);
    });
    // Fallback to defaults if validation fails
    process.env.PORT = '5000';
    return null;
  }

  // Update process.env with cleaned values
  Object.assign(process.env, result.data);
  return result.data;
}

module.exports = validateEnv;
