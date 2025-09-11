import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('Checking RLS policies...');
    
    // Test a simple query to see if RLS is blocking access
    const { data, error } = await supabase
      .from('companies')
      .select('*');
    
    if (error) {
      return Response.json({
        success: false,
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        message: 'RLS might be blocking access or table doesn\'t exist'
      });
    }
    
    return Response.json({
      success: true,
      message: 'RLS check passed',
      dataCount: data?.length || 0,
      data: data || []
    });
    
  } catch (error) {
    console.error('RLS check error:', error);
    return Response.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
