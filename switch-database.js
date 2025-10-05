#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load database configurations
const configsPath = path.join(__dirname, 'database-configs.json');
const configs = JSON.parse(fs.readFileSync(configsPath, 'utf8'));

// Get the target configuration from command line argument
const targetConfig = process.argv[2];

if (!targetConfig) {
  console.log('🔧 Database Configuration Switcher');
  console.log('');
  console.log('Usage: node switch-database.js <config-name>');
  console.log('');
  console.log('Available configurations:');
  Object.keys(configs).forEach(key => {
    console.log(`  ${key}: ${configs[key].description}`);
  });
  console.log('');
  console.log('Examples:');
  console.log('  node switch-database.js sqlite');
  console.log('  node switch-database.js mysql-local');
  console.log('  node switch-database.js mysql-production');
  process.exit(1);
}

if (!configs[targetConfig]) {
  console.error(`❌ Configuration '${targetConfig}' not found.`);
  console.log('Available configurations:', Object.keys(configs).join(', '));
  process.exit(1);
}

// Update local.settings.json
const localSettingsPath = path.join(__dirname, 'api', 'local.settings.json');
const localSettings = JSON.parse(fs.readFileSync(localSettingsPath, 'utf8'));

// Merge the new environment variables
const newValues = { ...localSettings.Values, ...configs[targetConfig].environment };
localSettings.Values = newValues;

// Write back to file
fs.writeFileSync(localSettingsPath, JSON.stringify(localSettings, null, 2));

console.log(`✅ Switched to '${targetConfig}' configuration`);
console.log(`📝 Description: ${configs[targetConfig].description}`);
console.log('');
console.log('Updated environment variables:');
Object.entries(configs[targetConfig].environment).forEach(([key, value]) => {
  console.log(`  ${key}=${value}`);
});
console.log('');
console.log('🔄 Restart your server to apply the new configuration.');
