const { createClient } = supabase
const supabaseUrl = 'https://rvkzslbnjorbpwgmrsso.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2a3pzbGJuam9yYnB3Z21yc3NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4MTU0MzcsImV4cCI6MjA3ODM5MTQzN30.lydL1j6Wfk5n3kqC7pZO-yjgVRNlMioZXUmXAGvRPVw'
window.supabase = createClient(supabaseUrl, supabaseKey)