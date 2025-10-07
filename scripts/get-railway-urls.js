#!/usr/bin/env node

/**
 * Get Railway service URLs and test health endpoints
 */

const { execSync } = require('child_process');

async function main() {
  console.log('🔍 Getting Railway service URLs...\n');

  try {
    // Get Railway project info
    const projectInfo = JSON.parse(
      execSync('railway list --json', { encoding: 'utf-8' })
    );

    const tideProject = projectInfo.find(p => p.name === 'tide');
    if (!tideProject) {
      console.error('❌ Tide project not found');
      process.exit(1);
    }

    console.log('✓ Found tide project\n');

    const services = tideProject.services.edges.map(e => e.node);
    console.log(`Found ${services.length} services:\n`);

    // Test each service
    const results = [];

    for (const service of services) {
      const serviceName = service.name;
      console.log(`\n🧪 Testing ${serviceName}...`);

      try {
        // Try to get service domain - this might not work without proper linking
        // We'll need to construct the Railway URLs manually
        const possibleUrls = [
          `https://${serviceName}-production.up.railway.app`,
          `https://${serviceName}-production-${tideProject.id.substring(0, 8)}.up.railway.app`,
        ];

        let tested = false;
        for (const url of possibleUrls) {
          try {
            const response = await fetch(`${url}/health`, {
              method: 'GET',
              signal: AbortSignal.timeout(5000)
            });

            if (response.ok) {
              const data = await response.json();
              console.log(`  ✓ ${serviceName} is healthy`);
              console.log(`  URL: ${url}`);
              console.log(`  Status: ${JSON.stringify(data, null, 2)}`);
              results.push({ service: serviceName, url, status: 'healthy', data });
              tested = true;
              break;
            }
          } catch (err) {
            // Try next URL
            continue;
          }
        }

        if (!tested) {
          console.log(`  ⚠ Could not determine URL for ${serviceName}`);
          console.log(`  Try: railway domain --service ${serviceName}`);
          results.push({ service: serviceName, status: 'unknown' });
        }
      } catch (error) {
        console.log(`  ✗ ${serviceName} failed: ${error.message}`);
        results.push({ service: serviceName, status: 'failed', error: error.message });
      }
    }

    // Summary
    console.log('\n\n================================');
    console.log('📊 Summary');
    console.log('================================\n');

    const healthy = results.filter(r => r.status === 'healthy');
    const failed = results.filter(r => r.status === 'failed');
    const unknown = results.filter(r => r.status === 'unknown');

    console.log(`✅ Healthy: ${healthy.length}`);
    healthy.forEach(r => console.log(`   - ${r.service}: ${r.url}`));

    console.log(`\n⚠️  Unknown: ${unknown.length}`);
    unknown.forEach(r => console.log(`   - ${r.service}`));

    console.log(`\n❌ Failed: ${failed.length}`);
    failed.forEach(r => console.log(`   - ${r.service}: ${r.error}`));

    if (healthy.length === services.length) {
      console.log('\n🎉 All services are healthy!');
      process.exit(0);
    } else {
      console.log('\n\n💡 To manually check service URLs:');
      console.log('   1. Visit your Railway dashboard');
      console.log('   2. Click on each service');
      console.log('   3. Look for the "Settings > Networking" section');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
