import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('Initializing database...');
    
    // Create dimension tables with sample data
    const dimensionTables = [
      {
        name: 'dim_company_status',
        data: [
          { status_id: 1, status_name: 'Lead', display_order: 1, is_active: true },
          { status_id: 2, status_name: 'Prospect', display_order: 2, is_active: true },
          { status_id: 3, status_name: 'Client', display_order: 3, is_active: true },
          { status_id: 4, status_name: 'Inactive', display_order: 4, is_active: true }
        ]
      },
      {
        name: 'dim_lead_source',
        data: [
          { source_id: 1, source_name: 'Website', display_order: 1, is_active: true },
          { source_id: 2, source_name: 'Referral', display_order: 2, is_active: true },
          { source_id: 3, source_name: 'Cold Call', display_order: 3, is_active: true },
          { source_id: 4, source_name: 'LinkedIn', display_order: 4, is_active: true },
          { source_id: 5, source_name: 'Trade Show', display_order: 5, is_active: true },
          { source_id: 6, source_name: 'Other', display_order: 6, is_active: true }
        ]
      },
      {
        name: 'dim_lead_score',
        data: [
          { score_id: 1, score_name: 'Hot', display_order: 1, is_active: true, score_color: '#ef4444' },
          { score_id: 2, score_name: 'Warm', display_order: 2, is_active: true, score_color: '#f59e0b' },
          { score_id: 3, score_name: 'Cold', display_order: 3, is_active: true, score_color: '#3b82f6' }
        ]
      },
      {
        name: 'dim_company_size',
        data: [
          { size_id: 1, size_name: '1-10', display_order: 1, is_active: true },
          { size_id: 2, size_name: '11-50', display_order: 2, is_active: true },
          { size_id: 3, size_name: '51-200', display_order: 3, is_active: true },
          { size_id: 4, size_name: '201-500', display_order: 4, is_active: true },
          { size_id: 5, size_name: '500+', display_order: 5, is_active: true }
        ]
      },
      {
        name: 'dim_annual_revenue',
        data: [
          { revenue_id: 1, revenue_range: '<1M', display_order: 1, is_active: true },
          { revenue_id: 2, revenue_range: '1M-5M', display_order: 2, is_active: true },
          { revenue_id: 3, revenue_range: '5M-10M', display_order: 3, is_active: true },
          { revenue_id: 4, revenue_range: '10M+', display_order: 4, is_active: true }
        ]
      },
      {
        name: 'dim_position_type',
        data: [
          { position_type_id: 1, position_type_name: 'Full-time', display_order: 1, is_active: true },
          { position_type_id: 2, position_type_name: 'Temp', display_order: 2, is_active: true },
          { position_type_id: 3, position_type_name: 'Contract', display_order: 3, is_active: true },
          { position_type_id: 4, position_type_name: 'Maternity', display_order: 4, is_active: true },
          { position_type_id: 5, position_type_name: 'Temp-to-Perm', display_order: 5, is_active: true }
        ]
      },
      {
        name: 'dim_note_type',
        data: [
          { note_type_id: 1, note_type_name: 'Call', display_order: 1, is_active: true },
          { note_type_id: 2, note_type_name: 'Email', display_order: 2, is_active: true },
          { note_type_id: 3, note_type_name: 'Meeting', display_order: 3, is_active: true },
          { note_type_id: 4, note_type_name: 'Follow-up', display_order: 4, is_active: true },
          { note_type_id: 5, note_type_name: 'Other', display_order: 5, is_active: true }
        ]
      },
      {
        name: 'dim_contact_method',
        data: [
          { method_id: 1, method_name: 'Email', display_order: 1, is_active: true },
          { method_id: 2, method_name: 'Phone', display_order: 2, is_active: true },
          { method_id: 3, method_name: 'Mobile', display_order: 3, is_active: true }
        ]
      },
      {
        name: 'dim_contact_type',
        data: [
          { contact_type_id: 1, contact_type_name: 'Primary Contact', display_order: 1, is_active: true },
          { contact_type_id: 2, contact_type_name: 'Decision Maker', display_order: 2, is_active: true },
          { contact_type_id: 3, contact_type_name: 'HR Contact', display_order: 3, is_active: true },
          { contact_type_id: 4, contact_type_name: 'Technical Contact', display_order: 4, is_active: true }
        ]
      },
      {
        name: 'dim_address_type',
        data: [
          { address_type_id: 1, address_type_name: 'Business', display_order: 1, is_active: true },
          { address_type_id: 2, address_type_name: 'Billing', display_order: 2, is_active: true },
          { address_type_id: 3, address_type_name: 'Shipping', display_order: 3, is_active: true }
        ]
      },
      {
        name: 'dim_file_category',
        data: [
          { category_id: 1, category_name: 'Contract', display_order: 1, is_active: true },
          { category_id: 2, category_name: 'Proposal', display_order: 2, is_active: true },
          { category_id: 3, category_name: 'Resume', display_order: 3, is_active: true },
          { category_id: 4, category_name: 'Other', display_order: 4, is_active: true }
        ]
      },
      {
        name: 'dim_industry',
        data: [
          { industry_id: 1, industry_name: 'Healthcare', display_order: 1, is_active: true },
          { industry_id: 2, industry_name: 'Technology', display_order: 2, is_active: true },
          { industry_id: 3, industry_name: 'Finance', display_order: 3, is_active: true },
          { industry_id: 4, industry_name: 'Manufacturing', display_order: 4, is_active: true },
          { industry_id: 5, industry_name: 'Retail', display_order: 5, is_active: true },
          { industry_id: 6, industry_name: 'Other', display_order: 6, is_active: true }
        ]
      }
    ];
    
    const results = [];
    
    for (const table of dimensionTables) {
      try {
        // Try to insert data (this will fail if table doesn't exist)
        const { error } = await supabase
          .from(table.name)
          .insert(table.data);
        
        if (error) {
          console.log(`Table ${table.name} doesn't exist or has issues:`, error.message);
          results.push({
            table: table.name,
            status: 'error',
            message: error.message
          });
        } else {
          console.log(`Successfully inserted data into ${table.name}`);
          results.push({
            table: table.name,
            status: 'success',
            message: `Inserted ${table.data.length} records`
          });
        }
      } catch (err) {
        console.log(`Error with table ${table.name}:`, err);
        results.push({
          table: table.name,
          status: 'error',
          message: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }
    
    return Response.json({
      success: true,
      message: 'Database initialization completed',
      results
    });
    
  } catch (error) {
    console.error('Database initialization error:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
