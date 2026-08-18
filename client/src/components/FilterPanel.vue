<template>
  <div class="card mb-3 p-3 bg-light">
    <div class="row g-2 align-items-end">
      <div 
        v-for="filter in filters" 
        :key="filter.key" 
        class="col-auto"
        :class="filter.class || 'col-lg-2 col-md-3 col-sm-6'"
      >
        <label class="form-label mb-0 small fw-bold">{{ filter.label }}</label>
        
        <input
          v-if="filter.type === 'text'"
          type="text"
          class="form-control form-control-sm"
          v-model="localFilters[filter.key]"
          :placeholder="filter.placeholder || 'Поиск...'"
          @input="onFilterChange"
        />
        
        <input
          v-else-if="filter.type === 'number_min'"
          type="number"
          class="form-control form-control-sm"
          v-model="localFilters[filter.key]"
          :placeholder="filter.placeholder || 'От'"
          @input="onFilterChange"
          min="0"
          step="1"
        />
        
        <input
          v-else-if="filter.type === 'number_max'"
          type="number"
          class="form-control form-control-sm"
          v-model="localFilters[filter.key]"
          :placeholder="filter.placeholder || 'До'"
          @input="onFilterChange"
          min="0"
          step="1"
        />

        <select
          v-else-if="filter.type === 'select'"
          class="form-select form-select-sm"
          v-model="localFilters[filter.key]"
          @change="onFilterChange"
        >
          <option value="">{{ filter.placeholder || 'Все' }}</option>
          <option 
            v-for="option in filter.options" 
            :key="option.id || option.value" 
            :value="option.id || option.value"
          >
            {{ option.name || option.label }}
          </option>
        </select>

        <input
          v-else-if="filter.type === 'date'"
          type="date"
          class="form-control form-control-sm"
          v-model="localFilters[filter.key]"
          @input="onFilterChange"
        />
      </div>
      
      <div class="col-auto">
        <button 
          class="btn btn-outline-secondary btn-sm" 
          @click="resetFilters"
          v-if="hasActiveFilters"
        >
         Сбросить все
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'

const props = defineProps({
  filters: {
    type: Array,
    default: () => []
  },
  initialValues: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['filter-change', 'filter-reset'])

const localFilters = reactive({ ...props.initialValues })

const hasActiveFilters = computed(() => {
  return Object.values(localFilters).some(val => val !== '' && val !== null && val !== undefined)
})

function onFilterChange() {
  const cleanFilters = {}
  Object.keys(localFilters).forEach(key => {
    const val = localFilters[key]
    if (val !== '' && val !== null && val !== undefined) {
      cleanFilters[key] = val
    }
  })
  emit('filter-change', cleanFilters)
}

function resetFilters() {
  Object.keys(localFilters).forEach(key => {
    localFilters[key] = ''
  })
  emit('filter-reset')
  onFilterChange()
}

watch(() => props.initialValues, (newVal) => {
  Object.keys(newVal).forEach(key => {
    if (key in localFilters) {
      localFilters[key] = newVal[key]
    }
  })
}, { deep: true })
</script>

<style scoped>
.form-control-sm, .form-select-sm {
  font-size: 0.875rem;
  padding: 0.25rem 0.5rem;
}
</style>