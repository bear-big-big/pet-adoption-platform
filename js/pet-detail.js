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
  
    const { data, error } = await window.supabase
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
  
  // 显示错误提示
  function showError(message, details = '') {
    const errorMsg = details 
      ? `${message}\n\n${details}\n\n请检查 Supabase RLS 策略设置。`
      : message
    
    alert(errorMsg)
    console.error('提交错误:', message, details)
  }

  // 处理领养表单提交
  document.getElementById('adoptForm').addEventListener('submit', async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const petId = document.getElementById('petId').value

    // 显示提交中状态
    const submitBtn = e.target.querySelector('button[type="submit"]')
    const originalText = submitBtn.textContent
    submitBtn.disabled = true
    submitBtn.textContent = '提交中...'

    try {
      // 1. 创建领养人记录
      const { data: adopter, error: adopterError } = await window.supabase
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
        console.error('创建领养人记录失败:', adopterError)
        
        // 检查是否是 RLS 策略问题
        if (adopterError.message && adopterError.message.includes('row-level security')) {
          showError(
            '提交失败：RLS 策略限制',
            '无法创建领养人记录。请在 Supabase Dashboard 中为 "adopters" 表添加 INSERT 策略：\n\n' +
            '1. 进入 Authentication > Policies\n' +
            '2. 找到 "adopters" 表\n' +
            '3. 添加策略：允许 anon 角色执行 INSERT 操作'
          )
        } else {
          showError('提交失败: ' + adopterError.message)
        }
        
        submitBtn.disabled = false
        submitBtn.textContent = originalText
        return
      }

      // 2. 创建领养记录
      const { error: adoptionError } = await window.supabase
        .from('adoptions')
        .insert([{
          pet_id: petId,
          adopter_id: adopter.id,
          adoption_date: new Date().toISOString().split('T')[0],
          status: '申请中'
        }])

      if (adoptionError) {
        console.error('创建领养记录失败:', adoptionError)
        
        // 检查是否是 RLS 策略问题
        if (adoptionError.message && adoptionError.message.includes('row-level security')) {
          showError(
            '提交失败：RLS 策略限制',
            '无法创建领养记录。请在 Supabase Dashboard 中为 "adoptions" 表添加 INSERT 策略：\n\n' +
            '1. 进入 Authentication > Policies\n' +
            '2. 找到 "adoptions" 表\n' +
            '3. 添加策略：允许 anon 角色执行 INSERT 操作'
          )
        } else {
          showError('提交失败: ' + adoptionError.message)
        }
        
        submitBtn.disabled = false
        submitBtn.textContent = originalText
        return
      }

      // 成功提示
      alert('领养申请已提交！请等待审核')
      window.location.href = 'index.html'
      
    } catch (err) {
      console.error('提交时发生未知错误:', err)
      showError('提交失败', '发生未知错误，请稍后重试')
      submitBtn.disabled = false
      submitBtn.textContent = originalText
    }
  })
  
  // 初始化页面
  loadPetDetail()