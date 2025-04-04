
import { createClient } from '@supabase/supabase-js';

// Try to get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For development only - remove these in production
const devFallbackUrl = 'https://your-project.supabase.co';
const devFallbackKey = 'your-anon-key';

// Use environment variables if available, otherwise use fallbacks for development
const url = supabaseUrl || devFallbackUrl;
const key = supabaseAnonKey || devFallbackKey;

// Check if we have valid configuration
const isConfigValid = url !== 'https://your-project.supabase.co' && key !== 'your-anon-key';

// Create Supabase client with the configuration
const supabase = createClient(url, key);

// Export client and configuration status
export { isConfigValid };
export default supabase;
