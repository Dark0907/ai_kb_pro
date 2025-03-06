import { defineStore } from 'pinia'
import { ref } from 'vue'
import laws from '../assets/mock/laws.json'
import cases from '../assets/mock/cases.json'

export const useReferenceStore = defineStore('reference', () => {
  // 状态
  const references = ref([])
  const activeReference = ref(null)
  const isLoading = ref(false)
  const showReferencePanel = ref(false)

  // 获取引用
  const fetchReferences = async (referenceIds) => {
    try {
      isLoading.value = true
      // 模拟API调用
      // const response = await api.post('/references', { ids: referenceIds })
      // references.value = response.data
      
      // 从本地数据中获取引用
      const lawRefs = referenceIds
        .filter(ref => ref.type === 'law')
        .map(ref => {
          const law = laws.find(l => l.id === ref.id)
          return law ? { ...law, refType: 'law' } : null
        })
        .filter(Boolean)
      
      const caseRefs = referenceIds
        .filter(ref => ref.type === 'case')
        .map(ref => {
          const caseItem = cases.find(c => c.id === ref.id)
          return caseItem ? { ...caseItem, refType: 'case' } : null
        })
        .filter(Boolean)
      
      references.value = [...lawRefs, ...caseRefs]
      
      // 自动显示引用面板
      showReferencePanel.value = true
    } catch (error) {
      console.error('获取引用失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 设置活动引用
  const setActiveReference = (reference) => {
    activeReference.value = reference
  }

  // 清除引用
  const clearReferences = () => {
    references.value = []
    activeReference.value = null
    showReferencePanel.value = false
  }
  
  // 设置引用面板显示状态
  const setShowReferencePanel = (show) => {
    showReferencePanel.value = show
  }

  return {
    references,
    activeReference,
    isLoading,
    showReferencePanel,
    fetchReferences,
    setActiveReference,
    clearReferences,
    setShowReferencePanel
  }
}) 