// 显示加载状态
function showLoading() {
  const petListEl = document.getElementById('petList')
  petListEl.innerHTML = `
    <div class="loading-state">
      <i class="fas fa-spinner"></i>
      <p>正在加载宠物信息...</p>
    </div>
  `
}

// 页面加载时获取可领养宠物
async function loadAvailablePets() {
    showLoading()
    
    try {
      // 先尝试获取所有数据
      const { data: allData, error: allError } = await window.supabase
        .from('pets')
        .select('*')
      
      console.log('所有宠物数据:', allData)
      console.log('查询错误:', allError)
      
      if (allError) {
        console.error('获取宠物失败:', allError)
        const petListEl = document.getElementById('petList')
        petListEl.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>加载失败</h3>
            <p>${allError.message || '无法获取宠物信息，请稍后重试'}</p>
            <p style="margin-top: 1rem; font-size: 0.9rem; color: #999;">错误代码: ${allError.code || '未知'}</p>
            <p style="font-size: 0.9rem; color: #999;">提示: 请检查 Supabase RLS 策略设置</p>
          </div>
        `
        return
      }
      
      if (!allData || allData.length === 0) {
        console.warn('数据库中没有数据或 RLS 策略阻止了访问')
        console.log('可能的原因:')
        console.log('1. Supabase RLS (Row Level Security) 策略阻止了匿名用户读取数据')
        console.log('2. 数据库中确实没有数据')
        console.log('解决方案: 在 Supabase Dashboard 中为 pets 表添加 RLS 策略:')
        console.log('   - 进入 Authentication > Policies')
        console.log('   - 为 pets 表添加策略: "Allow SELECT for anonymous users"')
        
        const petListEl = document.getElementById('petList')
        petListEl.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-shield-alt"></i>
            <h3>无法获取数据</h3>
            <p>查询成功但返回空结果，这通常是因为 RLS (行级安全) 策略设置问题。</p>
            <div style="margin-top: 1.5rem; padding: 1rem; background: #f5f5f5; border-radius: 8px; text-align: left; max-width: 600px; margin-left: auto; margin-right: auto;">
              <h4 style="color: #2E7D32; margin-bottom: 0.5rem;">解决步骤：</h4>
              <ol style="text-align: left; padding-left: 1.5rem; color: #666; line-height: 1.8;">
                <li>登录 Supabase Dashboard</li>
                <li>进入你的项目</li>
                <li>点击左侧菜单 "Authentication" → "Policies"</li>
                <li>找到 "pets" 表</li>
                <li>点击 "New Policy" 或编辑现有策略</li>
                <li>选择 "For full customization"</li>
                <li>策略名称: "Allow public read"</li>
                <li>Allowed operation: SELECT</li>
                <li>Target roles: anon</li>
                <li>USING expression: true</li>
                <li>保存策略</li>
              </ol>
            </div>
          </div>
        `
        return
      }
      
      // 在前端过滤未领养的宠物
      // 处理不同的布尔值格式：false, 'false', null, undefined
      const availablePets = allData.filter(pet => {
        const isAdopted = pet.is_adopted
        // 如果 is_adopted 为 false, null, undefined, 'false', 0 都视为未领养
        return !isAdopted || 
               isAdopted === false || 
               isAdopted === 'false' || 
               isAdopted === null || 
               isAdopted === undefined ||
               isAdopted === 0
      })
      
      console.log('过滤后的可用宠物:', availablePets)
      console.log('原始数据中的 is_adopted 值:', allData.map(p => ({ 
        id: p.id, 
        name: p.name, 
        is_adopted: p.is_adopted, 
        type: typeof p.is_adopted 
      })))
      
      // 存储到全局变量供筛选使用
      allAvailablePets = availablePets
      renderPetList(availablePets)
      
    } catch (err) {
      console.error('加载宠物时发生错误:', err)
      const petListEl = document.getElementById('petList')
      petListEl.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>加载失败</h3>
          <p>${err.message || '发生未知错误，请刷新页面重试'}</p>
        </div>
      `
    }
  }
  
  // 渲染宠物列表
  function renderPetList(pets) {
    const petListEl = document.getElementById('petList')
    petListEl.innerHTML = ''
  
    if (pets.length === 0) {
      petListEl.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-heart"></i>
          <h3>暂无可领养的宠物</h3>
          <p>目前没有可领养的宠物，请稍后再来看看吧~</p>
        </div>
      `
      return
    }
  
    pets.forEach(pet => {
      const petCard = document.createElement('div')
      petCard.className = 'pet-card'
      petCard.innerHTML = `
        <img src="${pet.image_url || 'https://picsum.photos/id/237/200'}" alt="${pet.name}">
        <h3>${pet.name}</h3>
        <p>类型: ${pet.type}</p>
        <p>年龄: ${pet.age}岁</p>
        <a href="pet-detail.html?id=${pet.id}" class="btn">查看详情</a>
      `
      petListEl.appendChild(petCard)
    })
  }
  
  // 搜索和筛选功能
  document.getElementById('search').addEventListener('input', filterPets)
  document.getElementById('petType').addEventListener('change', filterPets)
  
  // 存储所有可用宠物数据
  let allAvailablePets = []
  
  async function filterPets() {
    const searchTerm = document.getElementById('search').value.toLowerCase()
    const petType = document.getElementById('petType').value
    
    showLoading()
  
    try {
      // 获取所有数据
      const { data, error } = await window.supabase
        .from('pets')
        .select('*')
      
      if (error) {
        console.error('筛选失败:', error)
        const petListEl = document.getElementById('petList')
        petListEl.innerHTML = `
          <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>筛选失败</h3>
            <p>${error.message || '无法筛选宠物信息，请稍后重试'}</p>
          </div>
        `
        return
      }
      
      // 在前端进行过滤
      let filteredPets = data.filter(pet => {
        // 过滤未领养的
        const isAdopted = pet.is_adopted
        const isAvailable = !isAdopted || 
                           isAdopted === false || 
                           isAdopted === 'false' || 
                           isAdopted === null || 
                           isAdopted === undefined ||
                           isAdopted === 0
        
        if (!isAvailable) return false
        
        // 按名称搜索
        if (searchTerm && !pet.name?.toLowerCase().includes(searchTerm)) {
          return false
        }
        
        // 按类型筛选
        if (petType && pet.type !== petType) {
          return false
        }
        
        return true
      })
      
      console.log('筛选结果:', filteredPets)
      allAvailablePets = filteredPets
      renderPetList(filteredPets)
      
    } catch (err) {
      console.error('筛选时发生错误:', err)
      const petListEl = document.getElementById('petList')
      petListEl.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>筛选失败</h3>
          <p>${err.message || '发生未知错误'}</p>
        </div>
      `
    }
  }
  
  // 测试 Supabase 连接
  async function testSupabaseConnection() {
    console.log('=== 测试 Supabase 连接 ===')
    console.log('Supabase URL:', window.supabase?.supabaseUrl)
    console.log('Supabase Client:', window.supabase ? '已初始化' : '未初始化')
    
    if (!window.supabase) {
      console.error('Supabase 客户端未初始化！')
      return
    }
    
    // 测试简单查询
    const { data, error, count } = await window.supabase
      .from('pets')
      .select('*', { count: 'exact' })
    
    console.log('测试查询结果:')
    console.log('- 数据:', data)
    console.log('- 错误:', error)
    console.log('- 数量:', count)
    
    if (error) {
      console.error('查询错误详情:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
    } else if (count === 0 && data && data.length === 0) {
      console.warn('⚠️ 查询成功但返回空结果 - 很可能是 RLS 策略问题')
    }
    
    return { data, error, count }
  }
  
  // 初始化页面
  // 先测试连接
  testSupabaseConnection().then(() => {
    loadAvailablePets()
  })