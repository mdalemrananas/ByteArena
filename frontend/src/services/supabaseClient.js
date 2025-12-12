import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gdajuzpzmwykuhrhowxn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdkYWp1enB6bXd5a3Vocmhvd3huIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjIzODMsImV4cCI6MjA4MDMzODM4M30.x96pN9MTuoIgeFzc0lXWR0KtLzOlovkCGvMKq4vGkak'

export const supabase = createClient(supabaseUrl, supabaseKey)
