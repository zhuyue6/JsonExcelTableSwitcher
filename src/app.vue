<template>
 <el-config-provider :locale="state.elLocale">
    <div class="main-container flex flex-col items-center">
      <div 
        class="min-w-[1000px]"
      >
        <div class="flex items-center">
        <el-upload
          class="upload-demo mt-10 w-[400px] m-auto"
          :limit="1"
          accept=".xlsx,.xls"
          :auto-upload="false"
          :on-change="changeFile"
        >
        <template #tip>
          <div class="el-upload__tip">
            {{ t('limitFiles') }}
          </div>
        </template>
          <el-button type="primary">{{ t('btnUploadfile') }}</el-button>
        </el-upload>
        <div class="flex items-center mr-4">
          <span  class="mr-2">{{ t('labelComplete') }}</span>
          <el-select
            v-model="state.completion"
            :placeholder="t('tipComplete')"
            style="width: 240px"
            class="mb-2"
          >
            <el-option
              :label="t('yes')"
              :value="true"
            />
            <el-option
              :label="t('no')"
              :value="false"
            />
          </el-select>
        </div>
        <div class="flex items-center">
          <span class="mr-2">{{ t('labelLanguage') }}</span>
          <el-select
            v-model="state.lang"
            :placeholder="t('selectLangTip')"
            style="width: 240px"
            @change="selectLang"
            class="mb-2"
          >
            <el-option
              label="English"
              value="en"
            />
            <el-option
              label="简体中文"
              value="cn"
            />
          </el-select>
        </div>
        </div>
        <div class="flex items-center mb-6">
          <div class="flex flex-grow mr-2 items-center">
            <div class="shrink-0 w-[180px] text-right mr-2">{{ t('inputLabelTip') }}</div>
            <el-input
              ref="inputRef"
              v-model="state.text"
              :rows="10"
              type="textarea"
              class="mr-2"
              :placeholder="state.completion? t('inputTextTipSimple') : t('inputTextTip')"
            />
          </div>
          <div class="flex flex-col">
            <el-button
              class="mb-2 "
              size="large"
              type="primary"
              @click="textSwitchTable"
              >
              {{ t('btnJSON2Table') }}
            </el-button>
            <el-button
              class="mb-2"
              size="large"
              type="primary"
              @click="tableSwitchText"
              >
              {{ t('btnTable2JSON') }}
            </el-button>
            <el-button
              class="mb-2"
              size="large"
              type="primary"
              @click="copyInput"
              >
              {{ t('btnCopyInput' )}}
            </el-button>
            <el-button
              class="mb-2"
              size="large"
              type="primary"
              @click="copyTable"
              >
              {{ t('btnCopyTable') }}
            </el-button>
          </div>
        </div>

        <div class="flex flex-col">
          <div class="flex items-center">
            <div class="shrink-0 w-[180px] text-right  mr-2">{{ t('selectSheet') }}</div>
            <el-select
              v-model="state.selectedSheet"
              :placeholder="t('selectSheet')"
              style="width: 240px"
              @change="selectedSheet"
              class="mb-2"
            >
              <el-option
                :key="sheet.value"
                v-for="sheet of state.sheets"
                :label="sheet.label"
                :value="sheet.value"
              >
              </el-option>
            </el-select>
          </div>

          <div class="flex items-center mt-2 mb-2">
            <div class="shrink-0 w-[180px] text-right  mr-2">{{ t('selectColAsKey') }}</div>
            <el-input 
              class="mr-2"
              v-model="state.keyCol" 
              :placeholder="t('selectColAsKeyTip')" />
            <div class="shrink-0 w-[180px] text-right  mr-2">{{ t('selectColAsValue') }}</div>
            <el-input
              v-model="state.keyValue"
              :placeholder="t('selectColAsValueTip')"  />
          </div>
        </div>
        <el-table
          border
          :data="state.tableData"
          class="bottom-table_display"
          stripe
        >
          <el-table-column
            :key="column.prop"
            min-width="120"
            v-for="column of state.columns"
            :prop="column.prop"
            :label="column.label"
            />
        </el-table>
      </div>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
  import { reactive, ref, onMounted,type Ref } from 'vue'
  import { ElInput, UploadFile, ElMessage  } from 'element-plus'
  import cn from 'element-plus/es/locale/lang/zh-cn'
  import en from 'element-plus/es/locale/lang/en'
  import { read, WorkSheet } from 'xlsx'
  import { useI18n } from "vue-i18n"; 
  const { t, locale } = useI18n(); 

  interface State {
    text: string
    tableData: Record<string, string>[]
    columns: {
      label: string,
      prop: string
    }[]
    keyCol: string,
    keyValue: string
    selectedSheet: string,
    sheets: Sheet[],
    lang: string
    elLocale: Record<string, unknown>
    completion: boolean
  }

  interface Sheet {
      label: string,
      value: string,
      data: Record<string, string>[],
      keyMap: Record<string, string>
  }

  const state:State = reactive({
    columns: [{
      label: 'Key',
      prop: 'key'
    }, {
      label: 'Value',
      prop: 'value'
    }],
    text: '',
    tableData: [],
    keyCol: '1',
    keyValue: '2',
    selectedSheet: '',
    sheets: [],
    lang: 'en',
    elLocale: {},
    completion: true
  })
  const inputRef: null | Ref<typeof ElInput> = ref(null)

  onMounted(()=>{
    const lang = localStorage.getItem('lang') ?? 'en'
    selectLang(lang)
  })

  function selectLang(lang: string) {
    localStorage.setItem('lang', lang)
    state.lang = lang
    locale.value = lang
    if (lang === 'cn') {
      return state.elLocale = cn
    }
    state.elLocale = en
  }

  function getText() {
    const jsonStr = state.text.replaceAll('，', ',').replaceAll('：', ':').trim();
    if (/^{[\s\S]*}$/.test(jsonStr) && state.completion) {
      ElMessage({
        message: t('messageCompleteRemove'),
        type: 'warning',
      })
      return
    }
    
    if (!/^{[\s\S]*}$/.test(jsonStr) && !state.completion) {
      ElMessage({
        message: t('messageComplete'),
        type: 'warning',
      })
      return
    }
    const result = state.completion ? `{${jsonStr}}` : jsonStr;
    const text = (new Function(`return ${result}`))();
    let parseText = null
    try {
      parseText = JSON.parse(JSON.stringify(text))
    } catch (e) {}
    return parseText
  }

  function patchTable(text: string) {
    if (!text) {
      return
    }

    const list = []
    for (let [key, value] of Object.entries(text)) {
      list.push({
        key,
        value 
      })
    }
    state.tableData = list
  }

  function textSwitchTable() {
    state.columns = [{
      label: 'Key',
      prop: 'key'
    }, {
      label: 'Value',
      prop: 'value'
    }]
    state.keyCol = '1'
    state.keyValue = '2'
    const text = getText()
    patchTable(text)
  }

  function tableSwitchText() {
    const jsonStr: Record<string, string> = {}
    if (Number(state.keyCol) <= 0 || Number(state.keyValue) <= 0) {
      return ElMessage({
        message: t('messageInputGreater0'),
        type: 'warning',
      })
    }
    if (Number(state.keyCol) > state.columns.length || Number(state.keyValue) > state.columns.length) {
       return ElMessage({
        message: t('messageInputColGreaterTableCols'),
        type: 'warning',
      })
    }
    const list = state.tableData.map((item)=> {
      const key = state.columns?.[Number(state.keyCol) - 1]['prop']
      const value = state.columns?.[Number(state.keyValue) - 1]['prop']
      return {
        key: item[key] ?? '',
        value: item[value] ?? ''
      }
    })

    let str = state.completion ? '' : '{\n';
    list.forEach((item=> str += `"${item['key']}": "${item['value']}", \n` ))

    state.text = state.completion ? str : str + '}';
  }
  
  function changeFile(file: UploadFile) {
    const reader = new FileReader()
    reader.readAsArrayBuffer(file.raw)
    reader.onload = (e) => {
      const workbook = read(e.target.result, { type: 'array' })
      formatSheets(workbook.Sheets)
    }
  }

  function formatSheets(workbookSheets: { [sheet: string]: WorkSheet }) {
    if (!workbookSheets) {
      return
    }
    const sheets = []
    for (const [key, sheetValue] of Object.entries(workbookSheets)) {
      const sheet: Sheet = {
        label: key,
        value: key,
        data: [],
        keyMap: {}
      }

      // 先把列key获取到
      for (let [itemKey, itemValue] of Object.entries(sheetValue)) {
        const matched = /([A-z]+)([0-9]+)$/.exec(itemKey)
        if (!matched) {
          continue
        }
        const col = matched[1]
        const number = matched[2]
        if (Number(number) === 1) {
          sheet.keyMap[col] = itemValue['v']
        }
      }

      // 再遍历一次sheet值，把有key全部插入row
      for (let [itemKey, itemValue] of Object.entries(sheetValue)) {
        const matched = /([A-z]+)([0-9]+)$/.exec(itemKey)
        if (!matched) {
          continue
        }
        const col = matched[1]
        const number = matched[2]
        const colKey = sheet.keyMap[col]
        if (Number(number) === 1) {
          continue
        }
        if (sheet['data'][number]) {
          sheet['data'][number] = {
            ...sheet['data'][number],
            [colKey]: itemValue['v']
          }
        } else {
          sheet['data'][number] = {
            [colKey]: itemValue['v']
          }
        }
      }

      sheets.push(sheet)
    }
    state.sheets = sheets
    changeSheet(sheets[0])
  }

  function selectedSheet(sheetName: string) {
    for (const sheet of state.sheets) {
      if (sheet.value === sheetName) {
        changeSheet(sheet)
        break
      }
    }
  }

  function changeSheet(sheet: Sheet) {
    state.selectedSheet = sheet.value
    state.tableData = sheet.data
    state.columns = Object.values(sheet.keyMap).map((key)=>({
      label: key,
      prop: key
    }))
  }

  function copyInput() {
    inputRef.value?.select()
    document.execCommand('copy')
    return ElMessage({
      message: t('messageCopySuccess'),
      type: 'success',
    })
  }

  function copyTable() {
    const tableElement = document.querySelector('.el-table__body-wrapper')
    const range = new Range()
    range.selectNode(tableElement)
    const selection = window.getSelection();
    selection.removeAllRanges()
    selection.addRange(range);
    document.execCommand('copy')
    return ElMessage({
      message: t('messageCopySuccess'),
      type: 'success',
    })
  }

</script>

<style lang="scss" scoped>
  .main-container {
    :deep(.el-button+.el-button) {
      margin-left: 0;
    }
  }
</style>