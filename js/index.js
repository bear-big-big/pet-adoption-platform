// 页面加载时获取可领养宠物
async function loadAvailablePets() {
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('is_adopted', false)  // 只显示未被领养的
  
    if (error) {
      console.error('获取宠物失败:', error)
      return
    }
  
    renderPetList(data)
  }
  
  // 渲染宠物列表
  function renderPetList(pets) {
    const petListEl = document.getElementById('petList')
    petListEl.innerHTML = ''
  
    if (pets.length === 0) {
      petListEl.innerHTML = '<p>暂无可领养的宠物</p>'
      return
    }
  
    pets.forEach(pet => {
      const petCard = document.createElement('div')
      petCard.className = 'pet-card'
      petCard.innerHTML = `
        <img src="${pet.image_url || 'https://via.placeholder.com/200'}" alt="${pet.name}">
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
  
    let query = supabase.from('pets').select('*').eq('is_adopted', false)
  
    if (searchTerm) {
      query = query.ilike('name', `%${searchTerm}%`)
    }
    if (petType) {
      query = query.eq('type', petType)
    }
  
    const { data } = await query
    renderPetList(data)
  }
  
  // 初始化页面
  loadAvailablePets()