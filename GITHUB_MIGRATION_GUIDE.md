# GitHub Migration Guide for FIRMSYNC

This guide will help you migrate your FIRMSYNC project from Replit to GitHub.

## Pre-Migration Checklist

### ✅ Files Created for GitHub
- [x] README.md - Comprehensive project documentation
- [x] .gitignore - Excludes sensitive files and build artifacts
- [x] .env.example - Environment variable template
- [x] LICENSE - MIT license for open source
- [x] CONTRIBUTING.md - Contributor guidelines
- [x] .github/workflows/ci.yml - GitHub Actions CI/CD pipeline

### 📋 What to Exclude from Git
The following files/folders will be automatically ignored:
- `node_modules/` - Dependencies (will be installed via npm)
- `.env` - Your actual environment variables (contains secrets)
- `firms/` - User data and uploaded files
- `audit-reports/` - System audit files
- `attached_assets/` - Temporary development files
- Various test and debug files

## Step-by-Step Migration Process

### 1. Create GitHub Repository

1. Go to GitHub.com and create a new repository
2. Name it `firmsync` (or your preferred name)
3. Make it **Private** initially (since it contains business logic)
4. Don't initialize with README (we already have one)

### 2. Initialize Git in Your Project

```bash
# Initialize git repository
git init

# Add all files (gitignore will handle exclusions)
git add .

# Make initial commit
git commit -m "Initial commit: FIRMSYNC AI Legal Document Analysis Platform"

# Add your GitHub repository as origin
git remote add origin https://github.com/your-username/firmsync.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Environment Setup for Contributors

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Then fill in your actual values:
```env
DATABASE_URL=your_postgresql_connection_string
OPENAI_API_KEY=your_openai_api_key
SESSION_SECRET=your_32_character_session_secret
JWT_SECRET=your_32_character_jwt_secret
```

### 4. GitHub Actions Setup

The CI/CD pipeline will automatically:
- Run tests on every push/PR
- Perform security audits
- Type check your code
- Build the application
- Deploy to production (when configured)

### 5. Repository Settings Configuration

#### Security Settings
1. Go to Settings → Secrets and variables → Actions
2. Add these secrets:
   - `DATABASE_URL` - Production database connection
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `JWT_SECRET` - Production JWT secret
   - `SESSION_SECRET` - Production session secret

#### Branch Protection
1. Go to Settings → Branches
2. Add protection rule for `main` branch:
   - Require status checks to pass
   - Require up-to-date branches
   - Restrict pushes to main

## Database Migration Considerations

### From Replit to Production

1. **Export Current Data** (if needed):
   ```bash
   # In Replit, export your current database
   pg_dump $DATABASE_URL > firmsync_backup.sql
   ```

2. **Set up Production Database**:
   - Use a service like Neon, Supabase, or AWS RDS
   - Update `DATABASE_URL` in your production environment

3. **Schema Migration**:
   ```bash
   # Push your schema to new database
   npm run db:push
   
   # Seed initial data
   npm run seed
   ```

## Deployment Options

### Option 1: Vercel (Recommended for Full-Stack)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Configure build settings:
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Option 2: Railway
1. Connect GitHub repository to Railway
2. Add environment variables
3. Railway auto-detects Node.js and deploys

### Option 3: DigitalOcean App Platform
1. Create new app from GitHub repository
2. Configure environment variables
3. Set up database component

### Option 4: AWS/Google Cloud
1. Use container deployment with Docker
2. Set up load balancer and database
3. Configure environment variables

## File Structure After Migration

```
firmsync/
├── .github/
│   └── workflows/
│       └── ci.yml
├── client/
├── server/
├── shared/
├── verticals/
├── scripts/
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
├── README.md
└── package.json
```

## Important Notes

### Security Considerations
- Never commit `.env` files to Git
- Rotate all secrets when moving to production
- Use different secrets for development and production
- Enable GitHub security features (Dependabot, CodeQL)

### Database Considerations
- Production database should be separate from development
- Use connection pooling for production
- Set up regular backups
- Monitor database performance

### AI Integration
- Monitor OpenAI API usage and costs
- Set up usage alerts
- Consider API rate limiting
- Have fallback handling for API failures

## Post-Migration Testing

1. **Clone fresh repository**:
   ```bash
   git clone https://github.com/your-username/firmsync.git
   cd firmsync
   npm install
   ```

2. **Test local development**:
   ```bash
   npm run dev
   ```

3. **Verify all features work**:
   - User authentication
   - Document upload and analysis
   - Admin panel functionality
   - Multi-tenant isolation

## Collaboration Workflow

### For Team Members
1. Fork the repository
2. Create feature branches
3. Submit pull requests
4. Code review process
5. Merge to main after approval

### Release Process
1. Create release branches from main
2. Update version in package.json
3. Create GitHub release with changelog
4. Deploy to production

## Troubleshooting

### Common Issues
1. **Build failures**: Check Node.js version compatibility
2. **Database connection**: Verify DATABASE_URL format
3. **Missing secrets**: Ensure all environment variables are set
4. **Authentication issues**: Verify JWT and session secrets

### Getting Help
- Check GitHub Issues for known problems
- Review CONTRIBUTING.md for development setup
- Create new issues for bugs or feature requests

---

**Your FIRMSYNC project is now ready for GitHub! 🚀**

The migration preserves all your AI legal document analysis features, multi-tenant architecture, and enterprise-grade security while making it ready for collaborative development and production deployment.