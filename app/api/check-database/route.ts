import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Checking database tables...');
    
    // Check if companies table exists and has data
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(1);
    
    // Check if dimension tables exist
    const { data: statuses, error: statusesError } = await supabase
      .from('dim_company_status')
      .select('*')
      .limit(1);
    
    const { data: sources, error: sourcesError } = await supabase
      .from('dim_lead_source')
      .select('*')
      .limit(1);
    
    const { data: scores, error: scoresError } = await supabase
      .from('dim_lead_score')
      .select('*')
      .limit(1);
    
    return Response.json({
      success: true,
      tables: {
        companies: {
          exists: !companiesError,
          error: companiesError?.message,
          count: companies?.length || 0,
          data: companies || []
        },
        dim_company_status: {
          exists: !statusesError,
          error: statusesError?.message,
          count: statuses?.length || 0,
          data: statuses || []
        },
        dim_lead_source: {
          exists: !sourcesError,
          error: sourcesError?.message,
          count: sources?.length || 0,
          data: sources || []
        },
        dim_lead_score: {
          exists: !scoresError,
          error: scoresError?.message,
          count: scores?.length || 0,
          data: scores || []
        }
      }
    });
    
  } catch (error) {
    console.error('Database check error:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
