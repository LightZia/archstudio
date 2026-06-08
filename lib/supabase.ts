import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vrhlqvuupscsfllcjdos.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZyaGxxdnV1cHNjc2ZsbGNqZG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDQ3NTgsImV4cCI6MjA5MTY4MDc1OH0.yDsVng5lOjHnM9DklClsN4R9l5hDjr-ih__EN3Uon9s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
