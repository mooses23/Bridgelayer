import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure neon for Node.js environment
neonConfig.webSocketConstructor = ws;

async function seedIntegrationData() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🌱 Seeding integration data...');

    // Sample platform integrations with firm-level API key management
    const platformIntegrations = [
      {
        name: 'DocuSign',
        description: 'Digital signature and document management platform for legal agreements',
        category: 'Document Management',
        provider: 'DocuSign Inc.',
        authType: 'API_KEY',
        status: 'active',
        version: '2.1',
        settings: JSON.stringify({
          baseUrl: 'https://account-d.docusign.com',
          requiredScopes: ['signature', 'extended'],
          webhookSupport: true
        })
      },
      {
        name: 'QuickBooks',
        description: 'Accounting and financial management software for law firms',
        category: 'Finance',
        provider: 'Intuit Inc.',
        authType: 'OAUTH2',
        status: 'active',
        version: '3.0',
        settings: JSON.stringify({
          baseUrl: 'https://sandbox-quickbooks.api.intuit.com',
          requiredScopes: ['com.intuit.quickbooks.accounting'],
          oauthFlow: 'authorization_code'
        })
      },
      {
        name: 'Google Workspace',
        description: 'Email, calendar, and document collaboration suite',
        category: 'Communication',
        provider: 'Google LLC',
        authType: 'OAUTH2',
        status: 'active',
        version: '1.0',
        settings: JSON.stringify({
          baseUrl: 'https://www.googleapis.com',
          requiredScopes: ['email', 'calendar', 'drive'],
          oauthFlow: 'authorization_code'
        })
      },
      {
        name: 'Slack',
        description: 'Team communication and collaboration platform',
        category: 'Communication',
        provider: 'Slack Technologies',
        authType: 'API_KEY',
        status: 'active',
        version: '1.7',
        settings: JSON.stringify({
          baseUrl: 'https://slack.com/api',
          webhookSupport: true,
          botTokenRequired: true
        })
      },
      {
        name: 'Microsoft 365',
        description: 'Office productivity suite with email and calendar',
        category: 'Communication',
        provider: 'Microsoft Corporation',
        authType: 'OAUTH2',
        status: 'active',
        version: '2.0',
        settings: JSON.stringify({
          baseUrl: 'https://graph.microsoft.com',
          requiredScopes: ['Mail.Read', 'Calendars.ReadWrite'],
          oauthFlow: 'authorization_code'
        })
      },
      {
        name: 'Dropbox Business',
        description: 'Cloud storage and file sharing for legal documents',
        category: 'Cloud Storage',
        provider: 'Dropbox Inc.',
        authType: 'API_KEY',
        status: 'active',
        version: '2.0',
        settings: JSON.stringify({
          baseUrl: 'https://api.dropboxapi.com',
          teamFolderSupport: true,
          versioningSupport: true
        })
      },
      {
        name: 'OpenAI',
        description: 'AI-powered document analysis and legal research assistant',
        category: 'AI',
        provider: 'OpenAI',
        authType: 'API_KEY',
        status: 'active',
        version: '1.0',
        settings: JSON.stringify({
          baseUrl: 'https://api.openai.com',
          models: ['gpt-4o', 'gpt-4o-mini'],
          perUserApiKey: true,
          note: 'API keys are managed per-user for security'
        })
      },
      {
        name: 'Clio',
        description: 'Legal practice management software integration',
        category: 'Analytics',
        provider: 'Clio',
        authType: 'OAUTH2',
        status: 'active',
        version: '4.0',
        settings: JSON.stringify({
          baseUrl: 'https://app.clio.com/api/v4',
          requiredScopes: ['read', 'write'],
          oauthFlow: 'authorization_code'
        })
      },
      {
        name: 'Zoom',
        description: 'Video conferencing and meeting scheduling platform',
        category: 'Communication',
        provider: 'Zoom Video Communications',
        authType: 'API_KEY',
        status: 'active',
        version: '2.0',
        settings: JSON.stringify({
          baseUrl: 'https://api.zoom.us/v2',
          webhookSupport: true,
          meetingRecording: true
        })
      }
    ];

    // Clear existing platform integrations
    await pool.query('DELETE FROM platform_integrations');
    console.log('🗑️ Cleared existing platform integrations');

    // Insert platform integrations
    for (const integration of platformIntegrations) {
      await pool.query(`
        INSERT INTO platform_integrations (
          name, description, category, provider, auth_type, status, version, settings
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        integration.name,
        integration.description,
        integration.category,
        integration.provider,
        integration.authType,
        integration.status,
        integration.version,
        integration.settings
      ]);
    }

    console.log(`✅ Seeded ${platformIntegrations.length} platform integrations`);

    // Get firm IDs for sample firm integrations
    const firmsResult = await pool.query('SELECT id FROM firms WHERE onboarded = true LIMIT 3');
    const firmIds = firmsResult.rows.map(row => row.id);

    if (firmIds.length > 0) {
      // Get integration IDs
      const integrationsResult = await pool.query('SELECT id, name FROM platform_integrations WHERE name IN ($1, $2, $3)', 
        ['DocuSign', 'QuickBooks', 'Slack']);
      
      const integrationMap = {};
      integrationsResult.rows.forEach(row => {
        integrationMap[row.name] = row.id;
      });

      // Clear existing firm integrations
      await pool.query('DELETE FROM firm_integrations');
      console.log('🗑️ Cleared existing firm integrations');

      // Sample firm integrations with API credentials
      const firmIntegrations = [
        {
          firmId: firmIds[0],
          integrationId: integrationMap['DocuSign'],
          isEnabled: true,
          configuration: JSON.stringify({
            webhookUrl: `https://firm${firmIds[0]}.firmsync.com/webhooks/docusign`,
            defaultEnvelope: 'legal_agreement'
          }),
          apiCredentials: JSON.stringify({ apiKey: 'ds_demo_key_firm1_secure' }),
          webhookSecret: 'webhook_secret_123',
          syncStatus: 'connected'
        },
        {
          firmId: firmIds[0],
          integrationId: integrationMap['Slack'],
          isEnabled: true,
          configuration: JSON.stringify({
            defaultChannel: '#legal-updates',
            notificationTypes: ['document_signed', 'deadline_reminder']
          }),
          apiCredentials: JSON.stringify({ apiKey: 'xoxb-slack-token-firm1' }),
          syncStatus: 'connected'
        }
      ];

      if (firmIds.length > 1) {
        firmIntegrations.push({
          firmId: firmIds[1],
          integrationId: integrationMap['QuickBooks'],
          isEnabled: true,
          configuration: JSON.stringify({
            companyId: 'qb_company_456',
            syncFrequency: 'daily'
          }),
          apiCredentials: JSON.stringify({ 
            accessToken: 'qb_access_token_firm2',
            refreshToken: 'qb_refresh_token_firm2'
          }),
          syncStatus: 'connected'
        });
      }

      // Get admin user IDs for enabledBy field
      const adminResult = await pool.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['firm_admin']);
      const enabledBy = adminResult.rows.length > 0 ? adminResult.rows[0].id : 1;

      // Insert firm integrations
      for (const firmInteg of firmIntegrations) {
        await pool.query(`
          INSERT INTO firm_integrations (
            firm_id, integration_id, enabled_by, is_enabled, configuration, 
            api_credentials, webhook_secret, sync_status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          firmInteg.firmId,
          firmInteg.integrationId,
          enabledBy,
          firmInteg.isEnabled,
          firmInteg.configuration,
          firmInteg.apiCredentials,
          firmInteg.webhookSecret || null,
          firmInteg.syncStatus
        ]);
      }

      console.log(`✅ Seeded ${firmIntegrations.length} firm integrations with API credentials`);
    }

    console.log('🎉 Integration data seeding completed successfully!');
    console.log('📋 Summary:');
    console.log(`   • ${platformIntegrations.length} platform integrations available`);
    console.log(`   • API key management: firm-level (except OpenAI per-user)`);
    console.log(`   • Ready for integration dashboard testing`);

  } catch (error) {
    console.error('❌ Error seeding integration data:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedIntegrationData()
    .then(() => {
      console.log('✅ Integration seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Integration seeding failed:', error);
      process.exit(1);
    });
}

export { seedIntegrationData };