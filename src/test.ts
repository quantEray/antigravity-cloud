import * as os from 'os';
import * as path from 'path';
import { encryptPayload, decryptPayload } from './crypto';
import { PathNormalizer } from './pathNormalizer';
import { DeltaEngine } from './deltaEngine';

async function runTests() {
  console.log('Running Antigravity Anywhere Core Tests...');

  // Test 1: Crypto Encryption & Gzip Decryption
  const testSecret = 'SuperSecret123!';
  const originalData = JSON.stringify({ hello: 'world', convId: 'test-123', path: '/Users/eray/test' });

  const encrypted = encryptPayload(originalData, testSecret);
  const decrypted = decryptPayload(encrypted, testSecret);

  if (decrypted !== originalData) {
    throw new Error('Crypto Test Failed: Decrypted data does not match original data.');
  }
  console.log('✓ Crypto AES-256-GCM + Gzip Test Passed.');

  // Test 2: Path Normalization
  const userHome = PathNormalizer.denormalize('${USER_HOME}');
  const normalized = PathNormalizer.normalize(`${userHome}/Desktop/TestProject`);
  if (!normalized.startsWith('${USER_HOME}')) {
    throw new Error('Path Normalizer Test Failed: Did not replace user home.');
  }
  console.log('✓ Path Normalizer Test Passed.');

  // Test 3: Local Data Directory Scan Test
  const antigravityDataDir = path.join(os.homedir(), '.gemini', 'antigravity-ide');
  const bundle = await DeltaEngine.scanDataDirectory(antigravityDataDir);
  const groups = DeltaEngine.groupFilesByConversation(bundle);

  console.log(`✓ Real Scan Test Passed: Found ${bundle.files.length} total files across ${groups.length} conversations!`);

  const rawJson = JSON.stringify(bundle);
  const rawMb = (Buffer.byteLength(rawJson) / (1024 * 1024)).toFixed(2);
  const encPayload = encryptPayload(rawJson, 'test1234');
  const encMb = (Buffer.byteLength(encPayload) / (1024 * 1024)).toFixed(2);

  console.log(`📦 PAYLOAD DATA SIZE SUMMARY:`);
  console.log(`   • Raw Uncompressed JSON Size: ${rawMb} MB`);
  console.log(`   • Gzip Compressed & AES-256 Encrypted Size: ${encMb} MB`);

  for (const group of groups.slice(0, 5)) {
    console.log(`   • [${group.id}] ${group.title} (${group.files.length} files)`);
  }

  console.log('ALL CORE TESTS PASSED SUCCESSFULLY! 🚀');
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
