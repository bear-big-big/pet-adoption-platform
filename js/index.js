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
    
    const { data, error } = await window.supabase
      .from('pets')
      .select('*')
      .eq('is_adopted', false)  // 只显示未被领养的
  
    if (error) {
      console.error('获取宠物失败:', error)
      const petListEl = document.getElementById('petList')
      petListEl.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>加载失败</h3>
          <p>${error.message || '无法获取宠物信息，请稍后重试'}</p>
        </div>
      `
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
  
    let query = window.supabase.from('pets').select('*').eq('is_adopted', false)
  
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`)
    }
    if (petType) {
      query = query.eq('type', petType)
    }
  
    const { data, error } = await query
    
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