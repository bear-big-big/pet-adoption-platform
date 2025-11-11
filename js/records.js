// 加载领养记录（关联宠物和领养人信息）
async function loadAdoptionRecords() {
    // 1. 获取所有领养记录
    const { data: adoptions, error } = await supabase
      .from('adoptions')
      .select('*')
      .order('adoption_date', { ascending: false })
  
    if (error) {
      console.error('获取领养记录失败:', error)
      return
    }
  
    // 2. 批量获取关联的宠物和领养人信息
    const petIds = adoptions.map(a => a.pet_id)
    const adopterIds = adoptions.map(a => a.adopter_id)
  
    const { data: pets } = await supabase
      .from('pets')
      .select('id, name')
      .in('id', petIds)
  
    const { data: adopters } = await supabase
      .from('adopters')
      .select('id, name')
      .in('id', adopterIds)
  
    // 3. 组装数据并渲染
    const recordsWithDetails = adoptions.map(adoption => ({
      ...adoption,
      pet: pets.find(p => p.id === adoption.pet_id),
      adopter: adopters.find(a => a.id === adoption.adopter_id)
    }))
  
    renderRecords(recordsWithDetails)
  }
  
  // 渲染领养记录表格
  function renderRecords(records) {
    const tableBody = document.querySelector('#recordsTable tbody')
    tableBody.innerHTML = ''
  
    if (records.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="4">暂无领养记录</td></tr>'
      return
    }
  
    records.forEach(record => {
      const row = document.createElement('tr')
      row.innerHTML = `
        <td>${record.pet?.name || '未知宠物'}</td>
        <td>${record.adopter?.name || '未知领养人'}</td>
        <td>${record.adoption_date}</td>
        <td class="status ${record.status === '已批准' ? 'approved' : record.status === '已拒绝' ? 'rejected' : 'pending'}">
          ${record.status}
        </td>
      `
      tableBody.appendChild(row)
    })
  }
  
  // 初始化页面
  loadAdoptionRecords()