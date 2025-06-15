import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadText = (file: string): string => fs.readFileSync(path.join(__dirname, '../../prompts/base', file), 'utf-8');
const loadJson = (file: string): any => JSON.parse(fs.readFileSync(path.join(__dirname, '../../prompts/filetypes', file), 'utf-8'));

export async function assemblePrompt(docType: string = 'contract'): Promise<string> {
  try {
    const config = loadJson(`${docType}.json`);
    const parts: string[] = [];

    parts.push(loadText('trustLayerEnhancer.txt'));
    parts.push(loadText('riskProfileBalancer.txt'));

    if (config.enabled_features.summarize)  parts.push(loadText('summarize.txt'));
    if (config.enabled_features.risk)       parts.push(loadText('risk.txt'));
    if (config.enabled_features.clauses)    parts.push(loadText('clauses.txt'));
    if (config.enabled_features.crossref)   parts.push(loadText('crossref.txt'));
    if (config.enabled_features.formatting) parts.push(loadText('formatting.txt'));

    if (config.custom_instructions) parts.push(config.custom_instructions);

    return parts.join('\n\n');
  } catch (error) {
    console.warn(`Failed to load configuration for ${docType}, using default contract config:`, error);
    return assemblePrompt('contract');
  }
}

export function getDocumentTypeFromContent(content: string): string {
  const lowerContent = content.toLowerCase();
  
  // Legal document type detection based on keywords and phrases
  if (lowerContent.includes('acquisition') || lowerContent.includes('acquire') || lowerContent.includes('purchase of assets')) {
    return 'acquisition_agreement';
  }
  if (lowerContent.includes('arbitration') || lowerContent.includes('arbitrator') || lowerContent.includes('binding arbitration')) {
    return 'arbitration_agreement';
  }
  if (lowerContent.includes('asset purchase') || lowerContent.includes('purchase of assets') || lowerContent.includes('asset sale')) {
    return 'asset_purchase_agreement';
  }
  if (lowerContent.includes('assignment') || lowerContent.includes('assign') || lowerContent.includes('transfer of rights')) {
    return 'assignment_agreement';
  }
  if (lowerContent.includes('buy-sell') || lowerContent.includes('buy sell') || lowerContent.includes('buyout')) {
    return 'buy_sell_agreement';
  }
  if (lowerContent.includes('commercial lease') || (lowerContent.includes('lease') && lowerContent.includes('commercial'))) {
    return 'commercial_lease';
  }
  if (lowerContent.includes('confidentiality') || lowerContent.includes('confidential information') || lowerContent.includes('proprietary')) {
    return 'confidentiality_agreement';
  }
  if (lowerContent.includes('consulting') || lowerContent.includes('consultant') || lowerContent.includes('advisory')) {
    return 'consulting_agreement';
  }
  if (lowerContent.includes('copyright license') || lowerContent.includes('copyright') || lowerContent.includes('creative commons')) {
    return 'copyright_license';
  }
  if (lowerContent.includes('deed of trust') || lowerContent.includes('trustee') || lowerContent.includes('beneficiary')) {
    return 'deed_of_trust';
  }
  if (lowerContent.includes('discovery') || lowerContent.includes('interrogatories') || lowerContent.includes('requests for production') || lowerContent.includes('bates')) {
    return 'discovery';
  }
  if (lowerContent.includes('distribution') || lowerContent.includes('distributor') || lowerContent.includes('reseller')) {
    return 'distribution_agreement';
  }
  if (lowerContent.includes('employment') || lowerContent.includes('employee') || lowerContent.includes('employer')) {
    return 'employment';
  }
  if (lowerContent.includes('equipment lease') || (lowerContent.includes('lease') && lowerContent.includes('equipment'))) {
    return 'equipment_lease';
  }
  if (lowerContent.includes('escrow') || lowerContent.includes('escrow agent') || lowerContent.includes('held in escrow')) {
    return 'escrow_agreement';
  }
  if (lowerContent.includes('franchise') || lowerContent.includes('franchisor') || lowerContent.includes('franchisee')) {
    return 'franchise_agreement';
  }
  if (lowerContent.includes('guaranty') || lowerContent.includes('guarantee') || lowerContent.includes('guarantor')) {
    return 'guaranty_agreement';
  }
  if (lowerContent.includes('indemnity') || lowerContent.includes('indemnification') || lowerContent.includes('hold harmless')) {
    return 'indemnity_agreement';
  }
  if (lowerContent.includes('independent contractor') || lowerContent.includes('contractor') || lowerContent.includes('freelancer')) {
    return 'independent_contractor_agreement';
  }
  if (lowerContent.includes('joint venture') || lowerContent.includes('partnership') || lowerContent.includes('collaboration')) {
    return 'joint_venture_agreement';
  }
  if (lowerContent.includes('lease') || lowerContent.includes('rental') || lowerContent.includes('tenant') || lowerContent.includes('landlord')) {
    return 'lease';
  }
  if (lowerContent.includes('license') || lowerContent.includes('licensing') || lowerContent.includes('licensed')) {
    return 'licensing_agreement';
  }
  if (lowerContent.includes('litigation') || lowerContent.includes('complaint') || lowerContent.includes('plaintiff')) {
    return 'litigation';
  }
  if (lowerContent.includes('living will') || lowerContent.includes('advance directive') || lowerContent.includes('end of life')) {
    return 'living_will';
  }
  if (lowerContent.includes('loan') || lowerContent.includes('borrower') || lowerContent.includes('lender')) {
    return 'loan_agreement';
  }
  if (lowerContent.includes('maintenance') || lowerContent.includes('service agreement') || lowerContent.includes('support')) {
    return 'maintenance_agreement';
  }
  if (lowerContent.includes('mediation') || lowerContent.includes('mediator') || lowerContent.includes('mediated')) {
    return 'mediation_agreement';
  }
  if (lowerContent.includes('merger') || lowerContent.includes('merge') || lowerContent.includes('consolidation')) {
    return 'merger_agreement';
  }
  if (lowerContent.includes('mortgage') || lowerContent.includes('mortgagor') || lowerContent.includes('mortgagee')) {
    return 'mortgage';
  }
  if (lowerContent.includes('non-disclosure') || lowerContent.includes('nda')) {
    return 'nda';
  }
  if (lowerContent.includes('non-compete') || lowerContent.includes('noncompete') || lowerContent.includes('competition restriction')) {
    return 'non_compete_agreement';
  }
  if (lowerContent.includes('non-solicitation') || lowerContent.includes('nonsolicitation') || lowerContent.includes('solicitation restriction')) {
    return 'non_solicitation_agreement';
  }
  if (lowerContent.includes('novation') || lowerContent.includes('substitute') || lowerContent.includes('replacement')) {
    return 'novation_agreement';
  }
  if (lowerContent.includes('operating agreement') || lowerContent.includes('llc') || lowerContent.includes('limited liability')) {
    return 'operating_agreement';
  }
  if (lowerContent.includes('option') || lowerContent.includes('stock option') || lowerContent.includes('exercise')) {
    return 'option_agreement';
  }
  if (lowerContent.includes('partnership') || lowerContent.includes('partner') || lowerContent.includes('general partnership')) {
    return 'partnership_agreement';
  }
  if (lowerContent.includes('patent') || lowerContent.includes('patent license') || lowerContent.includes('invention')) {
    return 'patent_license';
  }
  if (lowerContent.includes('power of attorney') || lowerContent.includes('attorney-in-fact') || lowerContent.includes('agent')) {
    return 'power_of_attorney';
  }
  if (lowerContent.includes('privacy policy') || lowerContent.includes('data protection') || lowerContent.includes('personal information')) {
    return 'privacy_policy';
  }
  if (lowerContent.includes('promissory note') || lowerContent.includes('promissory') || lowerContent.includes('note payable')) {
    return 'promissory_note';
  }
  if (lowerContent.includes('purchase agreement') || lowerContent.includes('sale agreement') || lowerContent.includes('buyer')) {
    return 'purchase_agreement';
  }
  if (lowerContent.includes('release') || lowerContent.includes('waiver') || lowerContent.includes('discharged')) {
    return 'release_agreement';
  }
  if (lowerContent.includes('security agreement') || lowerContent.includes('security interest') || lowerContent.includes('collateral')) {
    return 'security_agreement';
  }
  if (lowerContent.includes('service agreement') || lowerContent.includes('services') || lowerContent.includes('professional services')) {
    return 'service_agreement';
  }
  if (lowerContent.includes('settlement') || lowerContent.includes('settle') || lowerContent.includes('dismiss')) {
    return 'settlement';
  }
  if (lowerContent.includes('severance') || lowerContent.includes('termination benefits') || lowerContent.includes('separation')) {
    return 'severance_agreement';
  }
  if (lowerContent.includes('shareholder') || lowerContent.includes('stockholder') || lowerContent.includes('shares')) {
    return 'shareholder_agreement';
  }
  if (lowerContent.includes('software license') || lowerContent.includes('software') || lowerContent.includes('application')) {
    return 'software_license';
  }
  if (lowerContent.includes('stock purchase') || lowerContent.includes('equity') || lowerContent.includes('investment')) {
    return 'stock_purchase_agreement';
  }
  if (lowerContent.includes('subscription') || lowerContent.includes('recurring') || lowerContent.includes('monthly fee')) {
    return 'subscription_agreement';
  }
  if (lowerContent.includes('supply') || lowerContent.includes('supplier') || lowerContent.includes('vendor')) {
    return 'supply_agreement';
  }
  if (lowerContent.includes('terms of service') || lowerContent.includes('terms of use') || lowerContent.includes('website terms')) {
    return 'terms_of_service';
  }
  if (lowerContent.includes('trademark') || lowerContent.includes('brand') || lowerContent.includes('mark')) {
    return 'trademark_license';
  }
  if (lowerContent.includes('trust') || lowerContent.includes('trustee') || lowerContent.includes('beneficiary')) {
    return 'trust_agreement';
  }
  if (lowerContent.includes('vendor') || lowerContent.includes('supplier') || lowerContent.includes('procurement')) {
    return 'vendor_agreement';
  }
  if (lowerContent.includes('waiver') || lowerContent.includes('waive') || lowerContent.includes('relinquish')) {
    return 'waiver_agreement';
  }
  if (lowerContent.includes('warranty') || lowerContent.includes('guarantee') || lowerContent.includes('warrants')) {
    return 'warranty_agreement';
  }
  if (lowerContent.includes('will') || lowerContent.includes('testament') || lowerContent.includes('bequest') || lowerContent.includes('executor')) {
    return 'will';
  }
  
  // Default to general contract
  return 'contract';
}