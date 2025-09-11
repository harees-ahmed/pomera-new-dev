import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('companies')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase error:', error);
      return Response.json({ 
        success: false, 
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
    }
    
    // Test getting companies
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('*')
      .limit(5);
    
    if (companiesError) {
      console.error('Companies query error:', companiesError);
      return Response.json({ 
        success: false, 
        error: companiesError.message,
        details: companiesError.details,
        hint: companiesError.hint,
        code: companiesError.code
      });
    }
    
    // Test getting dimension tables
    const { data: statuses, error: statusesError } = await supabase
      .from('dim_company_status')
      .select('*')
      .limit(5);
    
    return Response.json({ 
      success: true,
      connection: 'OK',
      companiesCount: companies?.length || 0,
      companies: companies || [],
      statusesCount: statuses?.length || 0,
      statuses: statuses || [],
      statusesError: statusesError?.message || null
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
