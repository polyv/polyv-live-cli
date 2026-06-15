/**
 * Cleanup script for test channels
 *
 * Run with: npx tsx scripts/cleanup-test-channels.ts
 *
 * This script lists and deletes channels with test-related names
 * Uses batch delete API for efficiency
 */

import axios from 'axios';
import { config } from 'dotenv';
import { generateSignature } from '../src/auth/signature.js';

config();

const APP_ID = process.env.POLYV_APP_ID || '';
const APP_SECRET = process.env.POLYV_APP_SECRET || '';

if (!APP_ID || !APP_SECRET) {
  console.error('Please configure POLYV_APP_ID and POLYV_APP_SECRET in .env');
  process.exit(1);
}

async function listAllChannels(): Promise<any[]> {
  const allChannels: any[] = [];
  let page = 1;
  const pageSize = 20;

  while (true) {
    try {
      const timestamp = Date.now();
      const { sign } = generateSignature({ appId: APP_ID, timestamp, page, pageSize }, { appSecret: APP_SECRET });

      const response = await axios.get('https://api.polyv.net/live/v3/channel/basic/list', {
        params: { appId: APP_ID, timestamp, sign, page, pageSize }
      });

      const contents = response.data?.data?.contents || [];

      if (contents.length === 0) {
        break;
      }

      allChannels.push(...contents);

      const totalPages = response.data?.data?.totalPages || 1;
      if (page >= totalPages) {
        break;
      }
      page++;
    } catch (error: any) {
      console.error('Failed to list channels:', error.response?.data || error.message);
      break;
    }
  }

  return allChannels;
}

async function batchDeleteChannels(channelIds: string[]): Promise<boolean> {
  if (channelIds.length === 0) return true;

  try {
    const timestamp = Date.now();
    const { sign } = generateSignature({ appId: APP_ID, timestamp }, { appSecret: APP_SECRET });

    const response = await axios.post(
      `https://api.polyv.net/live/v3/channel/basic/batch-delete?appId=${APP_ID}&timestamp=${timestamp}&sign=${sign}`,
      { channelIds: channelIds.map(id => Number(id)) },
      { headers: { 'Content-Type': 'application/json' } }
    );

    return response.data?.code === 200;
  } catch (error: any) {
    console.error('Batch delete failed:', error.response?.data || error.message);
    return false;
  }
}

async function main() {
  console.log('Fetching all channels...\n');

  const channels = await listAllChannels();

  if (channels.length === 0) {
    console.log('No channels found.');
    return;
  }

  console.log(`Found ${channels.length} total channels`);

  // Filter test channels
  const testPatterns = [
    /^SDK Test/i,
    /^Updated Channel/i,
    /^Channel to Delete/i,
    /^Direct Test/i,
    /^SDK Debug/i,
    /Test/i,
  ];

  const testChannels = channels.filter((ch: any) =>
    testPatterns.some(pattern => pattern.test(ch.name || ''))
  );

  console.log(`Found ${testChannels.length} test channels to clean up\n`);

  if (testChannels.length === 0) {
    console.log('No test channels to clean up.');
    return;
  }

  console.log('Test channels to delete:');
  testChannels.forEach((ch: any) => {
    console.log(`  - ${ch.channelId}: ${ch.name}`);
  });
  console.log();

  // Batch delete (max 100 per request)
  const channelIds = testChannels.map((ch: any) => String(ch.channelId));
  const batchSize = 100;
  let deleted = 0;
  let failed = 0;

  for (let i = 0; i < channelIds.length; i += batchSize) {
    const batch = channelIds.slice(i, i + batchSize);
    process.stdout.write(`Deleting batch ${Math.floor(i / batchSize) + 1} (${batch.length} channels)... `);

    const success = await batchDeleteChannels(batch);
    if (success) {
      console.log('✓');
      deleted += batch.length;
    } else {
      console.log('✗');
      failed += batch.length;
    }
  }

  console.log(`\nDeleted: ${deleted}`);
  console.log(`Failed: ${failed}`);
}

main().catch(console.error);
