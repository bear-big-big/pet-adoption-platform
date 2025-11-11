// 替换为你的Supabase项目信息（从Supabase控制台获取）
const supabaseUrl = 'https://rvkzslbnjorbpwgmrsso.supabase.co'
const supabaseKey = 'sb_publishable_Lz1eyGlI4cDHTI-AZOLq8A_ft_QqWTd'

const { createClient } = supabase
const supabase = createClient(supabaseUrl, supabaseKey)

// 导出供其他页面使用
window.supabase = supabase