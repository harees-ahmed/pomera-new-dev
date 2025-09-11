import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    console.log('Adding sample data...');
    
    // Add a sample company
    const sampleCompany = {
      company_name: 'Sample Healthcare Corp',
      industry: 'Healthcare',
      company_size: '51-200',
      annual_revenue: '5M-10M',
      company_website: 'https://samplehealthcare.com',
      company_status: 'lead',
      lead_source: 'Website',
      lead_score: 'Warm',
      staffing_needs_overview: 'Looking for temporary nursing staff',
      immediate_positions: 5,
      annual_positions: 20,
      opportunity_value: 50000,
      position_names: 'Registered Nurse, LPN',
      position_type: 'Temp',
      additional_staffing_details: 'Need immediate coverage for maternity leave'
    };
    
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert([sampleCompany])
      .select()
      .single();
    
    if (companyError) {
      return Response.json({
        success: false,
        error: 'Failed to create sample company',
        details: companyError.message,
        hint: companyError.hint,
        code: companyError.code
      });
    }
    
    // Add sample dimension data if tables exist
    const dimensionData = [
      {
        table: 'dim_company_status',
        data: { status_id: 1, status_name: 'Lead', display_order: 1, is_active: true }
      },
      {
        table: 'dim_lead_source', 
        data: { source_id: 1, source_name: 'Website', display_order: 1, is_active: true }
      },
      {
        table: 'dim_lead_score',
        data: { score_id: 1, score_name: 'Warm', display_order: 1, is_active: true, score_color: '#f59e0b' }
      }
    ];
    
    const dimensionResults = [];
    
    for (const dim of dimensionData) {
      try {
        const { error } = await supabase
          .from(dim.table)
          .insert([dim.data]);
        
        dimensionResults.push({
          table: dim.table,
          success: !error,
          error: error?.message
        });
      } catch (err) {
        dimensionResults.push({
          table: dim.table,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }
    
    return Response.json({
      success: true,
      message: 'Sample data added successfully',
      company: company,
      dimensionResults
    });
    
  } catch (error) {
    console.error('Add sample data error:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
