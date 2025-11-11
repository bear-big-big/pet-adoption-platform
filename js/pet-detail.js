// 获取URL中的宠物ID
function getPetId() {
    const params = new URLSearchParams(window.location.search)
    return params.get('id')
  }
  
  // 加载宠物详情
  async function loadPetDetail() {
    const petId = getPetId()
    if (!petId) {
      alert('未找到宠物信息')
      return
    }
  
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('id', petId)
      .single()
  
    if (error) {
      console.error('获取宠物详情失败:', error)
      return
    }
  
    renderPetDetail(data)
    // 存储宠物ID到表单
    document.getElementById('petId').value = petId
  }
  
  // 渲染宠物详情
  function renderPetDetail(pet) {
    const detailEl = document.getElementById('petDetail')
    detailEl.innerHTML = `
      <img src="${pet.image_url || 'https://via.placeholder.com/400'}" alt="${pet.name}">
      <div class="pet-info">
        <h2>${pet.name}</h2>
        <p><strong>类型:</strong> ${pet.type}</p>
        <p><strong>年龄:</strong> ${pet.age}岁</p>
        <p><strong>状态:</strong> ${pet.is_adopted ? '已领养' : '可领养'}</p>
        <p><strong>简介:</strong> ${pet.description}</p>
      </div>
    `
  }
  
  // 处理领养表单提交
  document.getElementById('adoptForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const petId = document.getElementById('petId').value
  
    // 1. 创建领养人记录
    const { data: adopter, error: adopterError } = await supabase
      .from('adopters')
      .insert([{
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        address: formData.get('address')
      }])
      .select()
      .single()
  
    if (adopterError) {
      alert('提交失败: ' + adopterError.message)
      return
    }
  
    // 2. 创建领养记录
    const { error: adoptionError } = await supabase
      .from('adoptions')
      .insert([{
        pet_id: petId,
        adopter_id: adopter.id,
        adoption_date: new Date().toISOString().split('T')[0],
        status: '申请中'
      }])
  
    if (adoptionError) {
      alert('提交失败: ' + adoptionError.message)
      return
    }
  
    alert('领养申请已提交！请等待审核')
    window.location.href = 'index.html'
  })
  
  // 初始化页面
  loadPetDetail()