import { Router } from 'express';

const router = Router();

// Mock data for demonstration
const mockAnalyticsData = {
  tenants: { total: 125 },
  activeUsers: { active: 342 },
  revenue: { revenue: 245760 },
  salesChasers: [
    {
      id: '1',
      name: 'Sarah Johnson',
      clientsBrought: 15,
      revenueGenerated: 85000,
      commissionPercentage: 8.5,
      commissionDue: 7225
    },
    {
      id: '2',
      name: 'Michael Chen',
      clientsBrought: 22,
      revenueGenerated: 120000,
      commissionPercentage: 9.0,
      commissionDue: 10800
    },
    {
      id: '3',
      name: 'Emily Davis',
      clientsBrought: 18,
      revenueGenerated: 95000,
      commissionPercentage: 8.0,
      commissionDue: 7600
    },
    {
      id: '4',
      name: 'David Rodriguez',
      clientsBrought: 12,
      revenueGenerated: 68000,
      commissionPercentage: 7.5,
      commissionDue: 5100
    },
    {
      id: '5',
      name: 'Jessica Wilson',
      clientsBrought: 25,
      revenueGenerated: 140000,
      commissionPercentage: 9.5,
      commissionDue: 13300
    },
    {
      id: '6',
      name: 'Robert Brown',
      clientsBrought: 8,
      revenueGenerated: 45000,
      commissionPercentage: 7.0,
      commissionDue: 3150
    },
    {
      id: '7',
      name: 'Amanda Lee',
      clientsBrought: 16,
      revenueGenerated: 92000,
      commissionPercentage: 8.2,
      commissionDue: 7544
    },
    {
      id: '8',
      name: 'Christopher Taylor',
      clientsBrought: 19,
      revenueGenerated: 105000,
      commissionPercentage: 8.8,
      commissionDue: 9240
    },
    {
      id: '9',
      name: 'Lisa Anderson',
      clientsBrought: 13,
      revenueGenerated: 78000,
      commissionPercentage: 7.8,
      commissionDue: 6084
    },
    {
      id: '10',
      name: 'Mark Thompson',
      clientsBrought: 21,
      revenueGenerated: 115000,
      commissionPercentage: 9.2,
      commissionDue: 10580
    },
    {
      id: '11',
      name: 'Nicole Garcia',
      clientsBrought: 14,
      revenueGenerated: 82000,
      commissionPercentage: 7.6,
      commissionDue: 6232
    }
  ],
  tenantGrowth: [
    { month: 'Jan', tenants: 95 },
    { month: 'Feb', tenants: 102 },
    { month: 'Mar', tenants: 108 },
    { month: 'Apr', tenants: 115 },
    { month: 'May', tenants: 119 },
    { month: 'Jun', tenants: 125 }
  ],
  revenueByChaser: [
    { name: 'Jessica Wilson', revenue: 140000, percentage: 15.2 },
    { name: 'Michael Chen', revenue: 120000, percentage: 13.1 },
    { name: 'Mark Thompson', revenue: 115000, percentage: 12.5 },
    { name: 'Christopher Taylor', revenue: 105000, percentage: 11.4 },
    { name: 'Emily Davis', revenue: 95000, percentage: 10.3 },
    { name: 'Amanda Lee', revenue: 92000, percentage: 10.0 },
    { name: 'Sarah Johnson', revenue: 85000, percentage: 9.2 },
    { name: 'Nicole Garcia', revenue: 82000, percentage: 8.9 },
    { name: 'Lisa Anderson', revenue: 78000, percentage: 8.5 },
    { name: 'David Rodriguez', revenue: 68000, percentage: 7.4 },
    { name: 'Robert Brown', revenue: 45000, percentage: 4.9 }
  ],
  inactiveTenants: [
    {
      id: '1',
      name: 'Dormant Law Firm',
      lastActivity: '2024-11-15',
      daysInactive: 45
    },
    {
      id: '2', 
      name: 'Quiet Legal Services',
      lastActivity: '2024-10-20',
      daysInactive: 68
    },
    {
      id: '3',
      name: 'Silent Partners LLC',
      lastActivity: '2024-12-01',
      daysInactive: 32
    }
  ]
};

// Get total tenants
router.get('/tenants', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockAnalyticsData.tenants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tenants data'
    });
  }
});

// Get active users
router.get('/active-users', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockAnalyticsData.activeUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active users data'
    });
  }
});

// Get monthly revenue
router.get('/revenue', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockAnalyticsData.revenue
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue data'
    });
  }
});

// Get sales chasers data
router.get('/sales-chasers', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockAnalyticsData.salesChasers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch sales chasers data'
    });
  }
});

// Get tenant growth data
router.get('/tenant-growth', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockAnalyticsData.tenantGrowth
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tenant growth data'
    });
  }
});

// Get revenue by chaser data
router.get('/revenue-by-chaser', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockAnalyticsData.revenueByChaser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch revenue by chaser data'
    });
  }
});

// Get inactive tenants
router.get('/inactive-tenants', (req, res) => {
  try {
    res.json({
      success: true,
      data: mockAnalyticsData.inactiveTenants
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch inactive tenants data'
    });
  }
});

export default router;
