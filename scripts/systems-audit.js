
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class SystemsAudit {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      overall_status: 'PENDING',
      critical_issues: [],
      warnings: [],
      recommendations: [],
      security_findings: [],
      performance_metrics: {},
      audit_sections: {}
    };
  }

  log(section, level, message, details = null) {
    const entry = {
      section,
      level,
      message,
      details,
      timestamp: new Date().toISOString()
    };

    if (level === 'CRITICAL') {
      this.results.critical_issues.push(entry);
    } else if (level === 'WARNING') {
      this.results.warnings.push(entry);
    } else if (level === 'RECOMMENDATION') {
      this.results.recommendations.push(entry);
    } else if (level === 'SECURITY') {
      this.results.security_findings.push(entry);
    }

    console.log(`[${level}] ${section}: ${message}`);
    if (details) console.log(`  Details: ${JSON.stringify(details, null, 2)}`);
  }

  async auditDatabaseSchema() {
    console.log('\n=== DATABASE SCHEMA AUDIT ===');
    this.results.audit_sections.database = { status: 'RUNNING' };

    try {
      // Check if schema file exists and is valid
      const schemaPath = 'shared/schema.ts';
      if (fs.existsSync(schemaPath)) {
        const schemaContent = fs.readFileSync(schemaPath, 'utf8');
        
        // Check for audit table presence
        if (schemaContent.includes('auditLogs')) {
          this.log('DATABASE', 'INFO', 'Audit logging table found in schema');
        } else {
          this.log('DATABASE', 'CRITICAL', 'Audit logging table missing from schema');
        }

        // Check for required indexes
        const requiredTables = ['users', 'firms', 'documents', 'auditLogs', 'notifications'];
        const missingTables = requiredTables.filter(table => !schemaContent.includes(table));
        
        if (missingTables.length > 0) {
          this.log('DATABASE', 'CRITICAL', 'Missing required tables', { missing: missingTables });
        }

        this.results.audit_sections.database.status = 'COMPLETED';
      } else {
        this.log('DATABASE', 'CRITICAL', 'Schema file not found');
        this.results.audit_sections.database.status = 'FAILED';
      }
    } catch (error) {
      this.log('DATABASE', 'CRITICAL', 'Database schema audit failed', { error: error.message });
      this.results.audit_sections.database.status = 'FAILED';
    }
  }

  async auditAuditLogging() {
    console.log('\n=== AUDIT LOGGING SYSTEM AUDIT ===');
    this.results.audit_sections.audit_logging = { status: 'RUNNING' };

    try {
      // Check audit service
      const auditServicePath = 'server/services/auditService.ts';
      if (fs.existsSync(auditServicePath)) {
        const auditService = fs.readFileSync(auditServicePath, 'utf8');
        
        // Check for required audit actions
        const requiredActions = [
          'DOC_UPLOAD', 'DOC_REVIEW_COMPLETED', 'LOGIN', 'CONFIG_CHANGE',
          'USER_CREATED', 'FIRM_SETTINGS_UPDATE'
        ];
        
        const missingActions = requiredActions.filter(action => !auditService.includes(action));
        if (missingActions.length > 0) {
          this.log('AUDIT', 'WARNING', 'Missing audit action constants', { missing: missingActions });
        }

        // Check for proper error handling
        if (auditService.includes('try') && auditService.includes('catch')) {
          this.log('AUDIT', 'INFO', 'Audit service has proper error handling');
        } else {
          this.log('AUDIT', 'CRITICAL', 'Audit service lacks proper error handling');
        }

        this.results.audit_sections.audit_logging.status = 'COMPLETED';
      } else {
        this.log('AUDIT', 'CRITICAL', 'Audit service not found');
        this.results.audit_sections.audit_logging.status = 'FAILED';
      }
    } catch (error) {
      this.log('AUDIT', 'CRITICAL', 'Audit logging system audit failed', { error: error.message });
      this.results.audit_sections.audit_logging.status = 'FAILED';
    }
  }

  async auditSecurity() {
    console.log('\n=== SECURITY AUDIT ===');
    this.results.audit_sections.security = { status: 'RUNNING' };

    try {
      // Check for sensitive file exposure
      const sensitivePatterns = [
        { pattern: /password/i, severity: 'HIGH' },
        { pattern: /secret/i, severity: 'HIGH' },
        { pattern: /api[_-]?key/i, severity: 'HIGH' },
        { pattern: /token/i, severity: 'MEDIUM' },
        { pattern: /private[_-]?key/i, severity: 'CRITICAL' }
      ];

      const filesToCheck = [
        'server/routes.ts',
        'server/services/openai.ts',
        '.env',
        'server/db.ts'
      ];

      for (const file of filesToCheck) {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          
          for (const { pattern, severity } of sensitivePatterns) {
            if (pattern.test(content)) {
              this.log('SECURITY', 'SECURITY', `Potential sensitive data in ${file}`, { 
                pattern: pattern.toString(), 
                severity 
              });
            }
          }
        }
      }

      // Check for CORS configuration
      const routesPath = 'server/routes.ts';
      if (fs.existsSync(routesPath)) {
        const routes = fs.readFileSync(routesPath, 'utf8');
        if (!routes.includes('cors')) {
          this.log('SECURITY', 'WARNING', 'No CORS configuration found');
        }
      }

      // Check for rate limiting
      if (fs.existsSync(routesPath)) {
        const routes = fs.readFileSync(routesPath, 'utf8');
        if (!routes.includes('rateLimit') && !routes.includes('express-rate-limit')) {
          this.log('SECURITY', 'RECOMMENDATION', 'Consider implementing rate limiting');
        }
      }

      this.results.audit_sections.security.status = 'COMPLETED';
    } catch (error) {
      this.log('SECURITY', 'CRITICAL', 'Security audit failed', { error: error.message });
      this.results.audit_sections.security.status = 'FAILED';
    }
  }

  async auditFileSystem() {
    console.log('\n=== FILE SYSTEM AUDIT ===');
    this.results.audit_sections.filesystem = { status: 'RUNNING' };

    try {
      // Check critical directories
      const criticalDirs = [
        'server/services',
        'client/src/pages',
        'shared',
        'firms',
        'verticals'
      ];

      for (const dir of criticalDirs) {
        if (!fs.existsSync(dir)) {
          this.log('FILESYSTEM', 'CRITICAL', `Critical directory missing: ${dir}`);
        } else {
          const stats = fs.statSync(dir);
          this.log('FILESYSTEM', 'INFO', `Directory exists: ${dir}`, {
            isDirectory: stats.isDirectory(),
            size: this.getDirectorySize(dir)
          });
        }
      }

      // Check for uploaded files security
      const firmsDir = 'firms';
      if (fs.existsSync(firmsDir)) {
        const firms = fs.readdirSync(firmsDir);
        let totalFiles = 0;
        let totalSize = 0;

        for (const firm of firms) {
          const firmPath = path.join(firmsDir, firm);
          if (fs.statSync(firmPath).isDirectory()) {
            const filesDir = path.join(firmPath, 'files');
            if (fs.existsSync(filesDir)) {
              const files = fs.readdirSync(filesDir);
              totalFiles += files.length;
              totalSize += this.getDirectorySize(filesDir);
            }
          }
        }

        this.results.performance_metrics.uploaded_files = {
          total_files: totalFiles,
          total_size_mb: Math.round(totalSize / (1024 * 1024) * 100) / 100,
          firms_count: firms.length
        };
      }

      this.results.audit_sections.filesystem.status = 'COMPLETED';
    } catch (error) {
      this.log('FILESYSTEM', 'CRITICAL', 'File system audit failed', { error: error.message });
      this.results.audit_sections.filesystem.status = 'FAILED';
    }
  }

  async auditAPIEndpoints() {
    console.log('\n=== API ENDPOINTS AUDIT ===');
    this.results.audit_sections.api = { status: 'RUNNING' };

    try {
      const routesPath = 'server/routes.ts';
      if (fs.existsSync(routesPath)) {
        const routes = fs.readFileSync(routesPath, 'utf8');
        
        // Extract API endpoints
        const endpointPattern = /app\.(get|post|put|delete)\("([^"]+)"/g;
        const endpoints = [];
        let match;
        
        while ((match = endpointPattern.exec(routes)) !== null) {
          endpoints.push({
            method: match[1].toUpperCase(),
            path: match[2]
          });
        }

        this.results.performance_metrics.api_endpoints = {
          total_endpoints: endpoints.length,
          endpoints: endpoints
        };

        // Check for critical endpoints
        const criticalEndpoints = [
          '/api/audit-logs',
          '/api/documents',
          '/api/users',
          '/api/firm'
        ];

        const foundEndpoints = endpoints.map(e => e.path);
        const missingCritical = criticalEndpoints.filter(ep => 
          !foundEndpoints.some(found => found.includes(ep))
        );

        if (missingCritical.length > 0) {
          this.log('API', 'WARNING', 'Missing critical endpoints', { missing: missingCritical });
        }

        // Check for error handling patterns
        if (!routes.includes('try') || !routes.includes('catch')) {
          this.log('API', 'CRITICAL', 'API routes lack proper error handling');
        }

        this.results.audit_sections.api.status = 'COMPLETED';
      } else {
        this.log('API', 'CRITICAL', 'Routes file not found');
        this.results.audit_sections.api.status = 'FAILED';
      }
    } catch (error) {
      this.log('API', 'CRITICAL', 'API endpoints audit failed', { error: error.message });
      this.results.audit_sections.api.status = 'FAILED';
    }
  }

  async auditDependencies() {
    console.log('\n=== DEPENDENCIES AUDIT ===');
    this.results.audit_sections.dependencies = { status: 'RUNNING' };

    try {
      // Check package.json
      if (fs.existsSync('package.json')) {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        
        this.results.performance_metrics.dependencies = {
          total_dependencies: Object.keys(packageJson.dependencies || {}).length,
          total_dev_dependencies: Object.keys(packageJson.devDependencies || {}).length
        };

        // Check for security-critical packages
        const securityPackages = ['helmet', 'express-rate-limit', 'cors', 'bcrypt'];
        const missingSecurityPackages = securityPackages.filter(pkg => 
          !packageJson.dependencies?.[pkg] && !packageJson.devDependencies?.[pkg]
        );

        if (missingSecurityPackages.length > 0) {
          this.log('DEPENDENCIES', 'RECOMMENDATION', 'Consider adding security packages', 
            { missing: missingSecurityPackages });
        }

        this.results.audit_sections.dependencies.status = 'COMPLETED';
      } else {
        this.log('DEPENDENCIES', 'CRITICAL', 'package.json not found');
        this.results.audit_sections.dependencies.status = 'FAILED';
      }
    } catch (error) {
      this.log('DEPENDENCIES', 'CRITICAL', 'Dependencies audit failed', { error: error.message });
      this.results.audit_sections.dependencies.status = 'FAILED';
    }
  }

  async auditConfiguration() {
    console.log('\n=== CONFIGURATION AUDIT ===');
    this.results.audit_sections.configuration = { status: 'RUNNING' };

    try {
      // Check environment configuration
      const configFiles = [
        '.replit',
        'tsconfig.json',
        'vite.config.ts',
        'tailwind.config.ts'
      ];

      for (const file of configFiles) {
        if (fs.existsSync(file)) {
          this.log('CONFIG', 'INFO', `Configuration file found: ${file}`);
        } else {
          this.log('CONFIG', 'WARNING', `Configuration file missing: ${file}`);
        }
      }

      // Check vertical configurations
      const verticalsDir = 'verticals';
      if (fs.existsSync(verticalsDir)) {
        const verticals = fs.readdirSync(verticalsDir).filter(item => 
          fs.statSync(path.join(verticalsDir, item)).isDirectory()
        );

        this.results.performance_metrics.verticals = {
          total_verticals: verticals.length,
          verticals: verticals
        };

        for (const vertical of verticals) {
          const configPath = path.join(verticalsDir, vertical, 'config.json');
          if (!fs.existsSync(configPath)) {
            this.log('CONFIG', 'WARNING', `Vertical missing config: ${vertical}`);
          }
        }
      }

      this.results.audit_sections.configuration.status = 'COMPLETED';
    } catch (error) {
      this.log('CONFIG', 'CRITICAL', 'Configuration audit failed', { error: error.message });
      this.results.audit_sections.configuration.status = 'FAILED';
    }
  }

  getDirectorySize(dirPath) {
    let totalSize = 0;
    try {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = fs.statSync(filePath);
        if (stats.isDirectory()) {
          totalSize += this.getDirectorySize(filePath);
        } else {
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Handle permission errors silently
    }
    return totalSize;
  }

  generateReport() {
    console.log('\n=== GENERATING AUDIT REPORT ===');

    // Determine overall status
    if (this.results.critical_issues.length > 0) {
      this.results.overall_status = 'CRITICAL';
    } else if (this.results.warnings.length > 0) {
      this.results.overall_status = 'WARNING';
    } else {
      this.results.overall_status = 'HEALTHY';
    }

    // Generate summary
    const summary = {
      audit_completion_time: new Date().toISOString(),
      overall_status: this.results.overall_status,
      total_critical_issues: this.results.critical_issues.length,
      total_warnings: this.results.warnings.length,
      total_recommendations: this.results.recommendations.length,
      total_security_findings: this.results.security_findings.length,
      sections_completed: Object.values(this.results.audit_sections).filter(s => s.status === 'COMPLETED').length,
      sections_failed: Object.values(this.results.audit_sections).filter(s => s.status === 'FAILED').length
    };

    // Save detailed report
    const reportPath = `audit-reports/systems-audit-${Date.now()}.json`;
    
    // Ensure reports directory exists
    if (!fs.existsSync('audit-reports')) {
      fs.mkdirSync('audit-reports', { recursive: true });
    }

    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

    // Print executive summary
    console.log('\n' + '='.repeat(80));
    console.log('SYSTEMS AUDIT EXECUTIVE SUMMARY');
    console.log('='.repeat(80));
    console.log(`Overall Status: ${this.results.overall_status}`);
    console.log(`Critical Issues: ${this.results.critical_issues.length}`);
    console.log(`Warnings: ${this.results.warnings.length}`);
    console.log(`Recommendations: ${this.results.recommendations.length}`);
    console.log(`Security Findings: ${this.results.security_findings.length}`);
    console.log(`\nDetailed report saved to: ${reportPath}`);
    
    if (this.results.critical_issues.length > 0) {
      console.log('\nCRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION:');
      this.results.critical_issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.section}] ${issue.message}`);
      });
    }

    if (this.results.recommendations.length > 0) {
      console.log('\nTOP RECOMMENDATIONS:');
      this.results.recommendations.slice(0, 5).forEach((rec, index) => {
        console.log(`${index + 1}. [${rec.section}] ${rec.message}`);
      });
    }

    console.log('\n' + '='.repeat(80));
    return reportPath;
  }

  async runFullAudit() {
    console.log('Starting comprehensive systems audit...');
    console.log(`Audit initiated at: ${new Date().toISOString()}`);
    
    await this.auditDatabaseSchema();
    await this.auditAuditLogging();
    await this.auditSecurity();
    await this.auditFileSystem();
    await this.auditAPIEndpoints();
    await this.auditDependencies();
    await this.auditConfiguration();

    return this.generateReport();
  }
}

// Run the audit
async function main() {
  const audit = new SystemsAudit();
  try {
    const reportPath = await audit.runFullAudit();
    console.log(`\nAudit completed successfully. Report: ${reportPath}`);
    process.exit(0);
  } catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
  }
}

// Run the audit if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default SystemsAudit;
