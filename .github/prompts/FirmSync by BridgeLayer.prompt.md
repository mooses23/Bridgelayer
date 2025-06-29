---
mode: agent
---
Expected output and any relevant constraints for this task. 
You are a developer and programmer working on the BridgeLayer platform - a comprehensive multi-vertical authentication and document management system. The platform supports multiple industry verticals including FIRMSYNC (legal), MEDSYNC (medical), EDUSYNC (education), and HRSYNC (HR), with a sophisticated three-tier role model.

The BridgeLayer platform features:
- **Multi-Vertical Architecture**: Extensible plugin system supporting multiple industries
- **Three-Tier Role Model**: Platform Admin → Owner (Bridgelayer) → Tenant (Individual Firms)
- **Dual Authentication**: Session-based web + JWT API authentication
- **Multi-Tenant Isolation**: Complete data segregation per firm across all verticals

The platform is production-ready with comprehensive authentication, document processing, and multi-industry support built into the core architecture.

The BridgeLayer platform's multi-vertical structure enables:

**Platform Admin Role** (handles ALL firm onboarding):
- Cross-platform system administration and firm onboarding across all verticals
- **Admin Navigation**: Left side nav with dual workspace onboarding system and integrated verification
- Comprehensive firm onboarding through multi-step wizard in admin interface
- Final verification step integrated into admin navigation (previously "ghost mode")
- Platform-level configuration and multi-vertical oversight

**Owner (Bridgelayer) Role** (operational management only):
- Multi-tenant operational management within assigned verticals (post-onboarding)
- **NO firm onboarding responsibilities** (this is exclusively an Admin function)
- Client relationship management and service delivery oversight
- Access to onboarded firms for operational purposes

**Tenant (Individual Firms) Role**:
- Individual firms using vertical-specific services (legal, medical, education, HR)
- Document processing and internal user management within firm boundaries
- Isolated firm-scoped access within assigned vertical 


**Platform Admin Dashboard** (handles ALL firm onboarding):
- Product selector: Choose vertical to manage (FIRMSYNC, MEDSYNC, EDUSYNC, HRSYNC)
- **Left Side Navigation with Dual Workspace Onboarding**:
  - **Firms**: Create and manage firm records across all verticals
  - **Onboarding**: Multi-step wizard with integrated verification (final step)
  - **Vertical Configs**: Industry-specific configurations and prompts
  - **Integrations**: Cross-platform third-party integrations
  - **Analytics**: Multi-vertical platform oversight
  - **Settings**: System-wide platform configuration

**Multi-Vertical Onboarding Process** (Admin-only):
1. **Platform Admin** creates new firm record (any vertical)
2. **Admin** runs comprehensive onboarding wizard through left navigation
3. **Admin** completes integrated verification step (final onboarding step)
4. **Admin** launches firm for client use
5. **Owner (Bridgelayer)** manages operational aspects post-onboarding
6. **Tenant (Firm)** accesses vertical-specific customized portal
        - Step1: Create Law Firm Onboarding File
        - Step 1: Enter Law Firm Information;
          - Sub-step: Enter law firm name, address, phone number, email, and logo
          - Sub-step: Select type of law practiced by the firm (e.g., criminal, family, corporate)
          - Sub-step: Select region of practice (e.g., state, country)
          - Sub-step: Save law firm information
      - Left Side Dashboard "llm Prompts "
          - Sub-step: Admins llm will create a extremely detailed base prompt for each llm powering the tabs (e.g., clients, cases, documents, calendar, tasks, billing, paralegal+ overhead tabs)
          - Sub-step: Singular large text box where you can select a base prompt for all llms,a specific tab llm (include all). each must have editable custom prompts preloaded for each llm
          - Sub-step: Configure prompts for each llm to ensure they provide relevant insights and assistance
          - Sub-step: Review and Save llm prompts
    - left side Dashboard "Firm Integration" for managing 3rd party integrations 
      - Step1: Select 3rd Party Integration;
        - Sub-step: Choose from a list of available integrations (e.g., document management systems, billing software, case management tools)
        - Sub-step: Configure integration settings (e.g., API keys, authentication)
        - Sub-step: Save integration settings
      - Step2: Test Integration;
        - Sub-step: Run a test to ensure the integration is working correctly
        - Sub-step: Review test results and make adjustments if necessary
    - left side Dashboard "Templated Onboarding" for customizing the firmsync website template for each law firm and managing and completing the onboarding process
**Multi-Vertical Template System**:
- **Vertical-Specific Templates**: Industry-tailored templates for legal, medical, education, and HR
- **Dynamic Configuration**: Templates automatically adapt based on firm's assigned vertical
- **Admin Customization**: Platform Admin customizes templates during onboarding wizard
- **Integrated Verification**: Final step includes access verification and firm launch capabilities
        - Step1: View Template;
            - Sub-step: View the firmsync website template with mock firm data
        - Step2: Customize Template; upload the llm prompts,integrations, and the remaining info needed to fuly customize the firmsync website for the law firm
            - Sub-step: Edit the template to include the law firm's unique information (firm name & Logo)
            - Sub-step: configure the template to include the law firm's specific needs (e.g., practice areas, regions of practice)
            - Sub-step: Save the customized template
        - Step3: Complete Onboarding;
            - Sub-step: Review the customized template to ensure it meets the law firm's needs
            - Sub-step: Create a new law firm user account with the law firm's credentials
            - Sub-step: Send the law firm user account credentials to the law firm
            - Sub-step: Notify the law firm that their firmsync website is ready for use
    - left side Dashboard "User Management" for managing law firm user accounts
      - Step1: View Law Firm User Accounts;
        - Sub-step: View a list of all law firm user accounts created on the firmsync website
        - Sub-step: Search for specific law firm user accounts by name or email
      - Step2: Edit Law Firm User Account;
        - Sub-step: Select a law firm user account to edit
        - Sub-step: Update law firm user account information (e.g., name, email, password)
        - Sub-step: Save changes to the law firm user account
      - Step3: Delete Law Firm User Account;
        - Sub-step: Select a law firm user account to delete
        - Sub-step: Confirm deletion of the law firm user account
        - Sub-step: Remove the law firm user account from the firmsync website
      - Step4: View Law Firm User Account Details;
        - Sub-step: Select a law firm user account to view details
        - Sub-step: View law firm user account information, including name, email, and role
      - Step5: Manage Law Firm User Roles;
        - Sub-step: Assign roles to law firm user accounts (e.g., admin, attorney, paralegal)
        - Sub-step: Update roles for existing law firm user accounts
        - Sub-step: Remove roles from law firm user accounts
      - Step6: Manage Law Firm User Permissions;
        - Sub-step: Assign permissions to law firm user accounts based on their roles
        - Sub-step: Update permissions for existing law firm user accounts
        - Sub-step: Remove permissions from law firm user accounts
      - Step7: View Law Firm User Account Activity;
        - Sub-step: View a log of activities performed by law firm user accounts (e.g., logins, edits, deletions)
        - Sub-step: Filter activity logs by date, user, or action
      - Step8: Manage Law Firm User Account Notifications;
        - Sub-step: Configure notification settings for law firm user accounts (e.g., email notifications, in-app notifications)
        - Sub-step: Enable or disable notifications for specific actions (e.g., new case assignments, task updates)
      - Step9: Manage Law Firm User Account Security;
        - Sub-step: Enable two-factor authentication for law firm user accounts
        - Sub-step: Configure password policies for law firm user accounts (e.g., minimum password length, complexity requirements)
        - Sub-step: Monitor security events related to law firm user accounts (e.g., failed login attempts, suspicious activity)
      - Step10: Manage Law Firm User Account Preferences;
        - Sub-step: Allow law firm users to set their preferences for the firmsync website
        - Sub-step: Configure language settings, notification preferences, and display options
      - Step11: Manage Law Firm User Account Support;
        - Sub-step: Provide support options for law firm users (e.g., help center, FAQs, contact support)
        - Sub-step: Allow law firm users to submit support requests or feedback
        - Sub-step: Track support requests and responses for law firm users
      - Step12: Manage Law Firm User Account Audit Trail;
        - Sub-step: Maintain an audit trail of changes made to law firm user accounts
        - Sub-step: Track who made changes, when they were made, and what changes were made
        - Sub-step: Allow admins to review the audit trail for compliance and security purposes
      - Step13: Manage Law Firm User Account Customization;
        - Sub-step: Allow law firm users to customize their profiles (e.g., profile picture, bio, contact information)
        - Sub-step: Enable law firm users to set preferences for the firmsync website (e.g., theme, layout, notifications)
        - Sub-step: Save and apply customization settings for law firm user accounts

 
 
 
 
 
 
 
 
 
 
 
 
 firmsync website Summary:
    -designed to be a comprehensive tool for small law firms, providing them with a platform to manage their operations efficiently while leveraging AI capabilities. 
    -The website will be built with a focus on user experience, security, and scalability. 
    The main Feature is that hidden sperate llms are powering tabs 'clients', 'cases', 'documents', 'calendar', 'tasks', 'Billing', and 'paralegal+  overhead tab' to assist law firms in managing their operations effectively. The llms will be trained on legal data to provide relevant insights and assistance.

  Firmsync website we are using to land the onboarding and recreating new login with user credentials for law firms, and the admin dashboard to manage the firmsync website.

  - Firmsync Website
    - Home Page with a brief introduction to the services offered,why choose us, and a request to contact us for sign up
      - Login Page with fields for email and password, and a "Forgot Password?" link
      - Firmsync Website- user specialized.
         - left side tab  Dashboard with an overview of the law firm's activities, including recent cases, tasks, and notifications
         - left side tab  Clients with a list of the law firm's clients, including contact information and case details
         - left side tab  Cases with a list of the law firm's cases, including case status, deadlines, and assigned attorneys
         - left side tab  Documents with a file management system for storing and organizing legal documents
         - left side tab  Calendar with a calendar view of upcoming court dates, deadlines, and appointments
         - left side tab  Tasks with a task management system for assigning and tracking tasks related to cases and clients
         - left side tab  Paralegal+ with a 4 overhead tab option for paralegals to manage their tasks, including
           - overhead tab1  Research with a drop downmenu for selecting different types of legal research tasks, such as case law, statutes, and regulations.
           - overhead tab2  Document Generation with a drop down menu for selecting different types of legal documents to generate, such as contracts, pleadings, and motions, text box for entering the content, and a button to generate the document
           - overhead tab3  Document Analysis with a drop down menu for selecting different types of document analysis tasks, such as contract review, legal writing, and citation checking, text box for entering the content, and a button to analyze the document
           - overhead tab4  Case Management with a drop down menu for selecting different types of case management tasks, such as case tracking, deadline management, and task assignment, text box for entering the content, and a button to manage the case. 
             - hidden settings with password protection to change prompt of the llm powering each overhead tab
         - left side tab billing with a billing management system;
              - Collapsable Section with a page specialized in hosting a 3rd party billing management system, to display the billing management system's interface within the firmssync website, when the law firm has a billing management system integrated.we wiill extract the billing managment data exposed to us to help fuel our llms.
              - Overview of billing status, including outstanding invoices and payment history
              - Ability to generate and send invoices to clients
              - Integration with payment processing systems for online payments
              - Reporting tools for tracking billing performance and revenue
         - left side tab  Settings with; 
           - Profile with fields for the law firm's name, address, phone number, email, and logo
           - Integrations with a list of available third-party applications that can be signed in with auth persistence to the firmsync website, such as document management systems, billing software, and case management tools
           - Website Settings with options for customizing the firmsync website's appearance, such as color scheme, logo, and layout
           - Password Management with options for changing the law firm's password and managing user accounts
         - left side tab  Help with a help center for frequently asked questions, tutorials, and support contact information
    - Footer with links to the firm's privacy policy, terms of service, and contact information
    - Responsive design for optimal viewing on desktop and mobile devices


    














    llms powering the tabs;
    - Clients llm for managing client information and interactions
    - Cases llm for managing case details and status
    - Documents llm for managing legal documents and file storage
    - Calendar llm for managing court dates, deadlines, and appointments
    - Billing llm for managing billing and invoicing
    - Paralegal+ llm for managing paralegal tasks, including research,
     Document generation, 
     Document analysis,
     Case Generator,

    Document1002 -  llm in charge of accepting a document and extracting the text from it, then using that text to answer questions about the document
    Document1003 -  llm in charge of accepting a document and extracting the text from it, then using that text to give you context of what legal document it is, and what it is about, and then using that text to answer questions about the document
    Document1004 -  llm in charge of accepting a document and extracting the text from it, then using that text to give you context of what legal document it is, and what it is about, and then using that text to answer questions about the document
    Document1005 -  llm in charge of accepting a document and extracting the text from it, then using that text to answer questions about the document
    Document1006 -  llm in charge of accepting a document and extracting the text from it, then using that text to answer questions about the document
    Document1007 -  llm in charge of accepting a document and extracting the text from it, then using that text to answer questions about the document
    Document1008 -  llm in charge of accepting a document and extracting the text from it, then using that text to answer questions about the document
    Document1009 -  llm in charge of accepting a document and extracting the text from it, then using that text to answer questions about the document
    Document1010 -  llm in charge of accepting a document and extracting the text from it, then using that text to answer questions about the document
    Document1011 -  llm in charge of accepting a document and extracting the text from it, then using that text to answer questions about the document



    llm logic
    admin llm will create a extremely detailed base prompt based of onboarding file for each llm powering the tabs (e.g., clients, cases, documents, calendar, tasks, billing, paralegal+ overhead tabs)
    singular large text box where admin can edit a base prompt for all llms,a specific tab llm (include all). each must have editable custom prompts preloaded for each llm
    configure prompts for each llm to ensure they provide relevant insights and assistance
    review and Save llm prompts. the drop down menus must display the documents custom documents in the firmsync interface, and the llm must be able to access the documents in the firmsync interface to answer questions about them.
    the llmsin firmsync must be able to access all the data in the fimsync interface, including the documents, clients, cases, calendar, tasks, and billing data, to provide relevant insights and assistance.