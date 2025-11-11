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
    
    // 先尝试获取所有数据，用于调试
    const { data: allData, error: allError } = await window.supabase
      .from('pets')
      .select('*')
    
    console.log('所有宠物数据:', allData)
    console.log('查询错误:', allError)
    
    // 然后查询未领养的宠物
    const { data, error } = await window.supabase
      .from('pets')
      .select('*')
      .eq('is_adopted', false)  // 只显示未被领养的
  
    console.log('未领养宠物数据:', data)
    console.log('查询错误:', error)
  
    if (error) {
      console.error('获取宠物失败:', error)
      const petListEl = document.getElementById('petList')
      petListEl.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>加载失败</h3>
          <p>${error.message || '无法获取宠物信息，请稍后重试'}</p>
          <p style="margin-top: 1rem; font-size: 0.9rem; color: #999;">错误详情: ${JSON.stringify(error)}</p>
        </div>
      `
      return
    }
  
    // 如果查询结果为空，但所有数据不为空，说明可能是过滤条件问题
    if ((!data || data.length === 0) && allData && allData.length > 0) {
      console.warn('查询结果为空，但数据库中有数据。可能是 is_adopted 字段值的问题')
      console.log('所有数据中的 is_adopted 值:', allData.map(p => ({ id: p.id, name: p.name, is_adopted: p.is_adopted, type: typeof p.is_adopted })))
      
      // 尝试使用字符串 'false' 或布尔值 false
      const { data: data2 } = await window.supabase
        .from('pets')
        .select('*')
        .or('is_adopted.eq.false,is_adopted.is.null')
      
      console.log('使用 or 查询的结果:', data2)
      
      if (data2 && data2.length > 0) {
        renderPetList(data2)
        return
      }
      
      // 如果还是空，直接显示所有数据（临时方案）
      renderPetList(allData.filter(p => !p.is_adopted || p.is_adopted === false || p.is_adopted === 'false'))
      return
    }
  
    renderPetList(data)
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
  
  async function filterPets() {
    const searchTerm = document.getElementById('search').value.toLowerCase()
    const petType = document.getElementById('petType').value
    
    showLoading()
  
    // 使用 or 查询来处理可能的布尔值类型问题
    let query = window.supabase
      .from('pets')
      .select('*')
      .or('is_adopted.eq.false,is_adopted.is.null')
  
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`)
    }
    if (petType) {
      query = query.eq('type', petType)
    }
  
    const { data, error } = await query
    
    console.log('筛选结果:', data)
    
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
    
    renderPetList(data)
  }
  
  // 初始化页面
  loadAvailablePets()