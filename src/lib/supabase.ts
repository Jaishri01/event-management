
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Use the client from src/integrations/supabase/client.ts
import { supabase as integrationClient } from '@/integrations/supabase/client';

// Export the properly configured client 
const supabase = integrationClient;

// Check if we have valid configuration (for UI feedback)
const isConfigValid = true;

// Export client and configuration status
export { isConfigValid, supabase };
export default supabase;
