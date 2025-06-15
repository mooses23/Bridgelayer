import { db } from './server/db.ts';
import { 
  availableIntegrations, 
  platformSettings, 
  documentTypeTemplates,
  systemAdmins
} from './shared/schema.ts';

async function seedAdminData() {
  console.log('🌱 Seeding admin panel data...');

  try {
    // Create system admin user first
    await db.insert(systemAdmins).values({
      email: 'admin@bridgelayer.com',
      username: 'bridgelayer_admin',
      password: 'temp_admin_password_123',
      firstName: 'BridgeLayer',
      lastName: 'Admin',
      role: 'super_admin'
    }).onConflictDoNothing();

    // Insert available integrations
    const integrations = [
      {
        name: 'google_drive',
        displayName: 'Google Drive',
        description: 'Cloud storage integration for document sync',
        oauthConfig: {
          clientId: '',
          clientSecret: '',
          scopes: ['https://www.googleapis.com/auth/drive.readonly']
        },
        isActive: true,
        requiresSetup: true,
        iconUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/googledrive.svg'
      },
      {
        name: 'dropbox',
        displayName: 'Dropbox',
        description: 'Cloud storage integration for file management',
        oauthConfig: {
          clientId: '',
          clientSecret: '',
          scopes: ['files.content.read']
        },
        isActive: true,
        requiresSetup: true,
        iconUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/dropbox.svg'
      },
      {
        name: 'sharepoint',
        displayName: 'Microsoft SharePoint',
        description: 'Enterprise document management integration',
        oauthConfig: {
          clientId: '',
          clientSecret: '',
          scopes: ['Files.Read.All']
        },
        isActive: false,
        requiresSetup: true,
        iconUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftsharepoint.svg'
      },
      {
        name: 'onedrive',
        displayName: 'Microsoft OneDrive',
        description: 'Personal cloud storage integration',
        oauthConfig: {
          clientId: '',
          clientSecret: '',
          scopes: ['Files.Read']
        },
        isActive: true,
        requiresSetup: true,
        iconUrl: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftonedrive.svg'
      }
    ];

    for (const integration of integrations) {
      await db.insert(availableIntegrations).values(integration).onConflictDoNothing();
    }

    // Insert platform settings
    const settings = [
      {
        key: 'ai_features_enabled',
        value: true,
        description: 'Enable AI document analysis across all firms',
        category: 'ai'
      },
      {
        key: 'max_documents_per_firm',
        value: 1000,
        description: 'Maximum documents allowed per firm',
        category: 'limits'
      },
      {
        key: 'max_file_size_mb',
        value: 10,
        description: 'Maximum file size in megabytes',
        category: 'limits'
      },
      {
        key: 'openai_model',
        value: 'gpt-4o',
        description: 'OpenAI model used for document analysis',
        category: 'ai'
      },
      {
        key: 'analysis_timeout_seconds',
        value: 120,
        description: 'Timeout for AI analysis requests',
        category: 'ai'
      },
      {
        key: 'billing_enabled',
        value: false,
        description: 'Enable billing and subscription management',
        category: 'billing'
      },
      {
        key: 'maintenance_mode',
        value: false,
        description: 'Enable maintenance mode across platform',
        category: 'features'
      },
      {
        key: 'auto_backup_enabled',
        value: true,
        description: 'Enable automatic database backups',
        category: 'features'
      },
      {
        key: 'webhook_notifications',
        value: true,
        description: 'Enable webhook notifications for integrations',
        category: 'features'
      },
      {
        key: 'max_concurrent_analyses',
        value: 5,
        description: 'Maximum concurrent AI analyses per firm',
        category: 'limits'
      }
    ];

    for (const setting of settings) {
      await db.insert(platformSettings).values({
        ...setting,
        updatedBy: 1
      }).onConflictDoNothing();
    }

    // Insert document type templates
    const docTypes = [
      {
        name: 'nda',
        displayName: 'Non-Disclosure Agreement',
        category: 'corporate',
        vertical: 'firmsync',
        defaultConfig: {
          summarize: true,
          risk: true,
          clauses: true,
          crossref: false,
          formatting: true
        },
        keywords: ['confidential', 'non-disclosure', 'proprietary', 'trade secret'],
        isActive: true,
        createdBy: 1
      },
      {
        name: 'employment_contract',
        displayName: 'Employment Contract',
        category: 'employment',
        vertical: 'firmsync',
        defaultConfig: {
          summarize: true,
          risk: true,
          clauses: true,
          crossref: true,
          formatting: true
        },
        keywords: ['employment', 'employee', 'salary', 'benefits', 'termination'],
        isActive: true,
        createdBy: 1
      },
      {
        name: 'lease_agreement',
        displayName: 'Lease Agreement',
        category: 'real_estate',
        vertical: 'firmsync',
        defaultConfig: {
          summarize: true,
          risk: true,
          clauses: true,
          crossref: true,
          formatting: true
        },
        keywords: ['lease', 'rent', 'tenant', 'landlord', 'property'],
        isActive: true,
        createdBy: 1
      },
      {
        name: 'patient_consent',
        displayName: 'Patient Consent Form',
        category: 'medical',
        vertical: 'medsync',
        defaultConfig: {
          summarize: true,
          risk: true,
          clauses: false,
          crossref: false,
          formatting: true
        },
        keywords: ['patient', 'consent', 'treatment', 'medical', 'hipaa'],
        isActive: true,
        createdBy: 1
      },
      {
        name: 'enrollment_agreement',
        displayName: 'Student Enrollment Agreement',
        category: 'academic',
        vertical: 'edusync',
        defaultConfig: {
          summarize: true,
          risk: false,
          clauses: true,
          crossref: false,
          formatting: true
        },
        keywords: ['student', 'enrollment', 'tuition', 'academic', 'education'],
        isActive: true,
        createdBy: 1
      },
      {
        name: 'employee_handbook',
        displayName: 'Employee Handbook',
        category: 'policy',
        vertical: 'hrsync',
        defaultConfig: {
          summarize: true,
          risk: false,
          clauses: false,
          crossref: true,
          formatting: true
        },
        keywords: ['employee', 'handbook', 'policy', 'procedures', 'hr'],
        isActive: true,
        createdBy: 1
      }
    ];

    for (const docType of docTypes) {
      await db.insert(documentTypeTemplates).values(docType).onConflictDoNothing();
    }

    console.log('✅ Admin panel data seeded successfully!');
    console.log(`   - ${integrations.length} available integrations`);
    console.log(`   - ${settings.length} platform settings`);
    console.log(`   - ${docTypes.length} document type templates`);

  } catch (error) {
    console.error('❌ Error seeding admin data:', error);
    throw error;
  }
}

// Run the seeding
seedAdminData()
  .then(() => {
    console.log('🎉 Admin panel ready for BridgeLayer staff!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });