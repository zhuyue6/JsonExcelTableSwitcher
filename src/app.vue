<template>
  <div class="main-container flex flex-col items-center">
    <div 
      class="min-w-[800px]"
    >
      <el-upload
        class="upload-demo mt-10 w-[400px] m-auto"
        :limit="1"
        accept=".xlsx,.xls"
        :auto-upload="false"
        :on-change="changeFile"
      >
      <template #tip>
        <div class="el-upload__tip">
          支持xlsx、xls类型文件
        </div>
      </template>
        <el-button type="primary">上传文件</el-button>
      </el-upload>
      <div class="flex items-center mb-6">
        <div class="flex flex-grow mr-2 items-center">
          <div class="shrink-0 w-[120px] text-right">请输入内容：</div>
          <el-input
            ref="inputRef"
            v-model="state.text"
            :rows="10"
            type="textarea"
            placeholder="请输入JSON或JS对象字符串，不需要输入最外面的小括号{}， 如：aaa: 111"
          />
        </div>
        <div class="flex flex-col">
          <el-button
            class="mb-2 "
            size="large"
            type="primary"
            @click="textSwitchTable"
            >
            json转换table
          </el-button>
          <el-button
            class="mb-2"
            size="large"
            type="primary"
            @click="tableSwitchText"
            >
            table转换json
          </el-button>
          <el-button
            class="mb-2"
            size="large"
            type="primary"
            @click="copyInput"
            >
            复制输入框内容
          </el-button>
          <el-button
            class="mb-2"
            size="large"
            type="primary"
            @click="copyTable"
            >
            复制表格内容
          </el-button>
        </div>
      </div>

      <div class="flex flex-col">
        <div class="flex items-center">
          <div class="shrink-0 w-[120px] text-right">选择sheet：</div>
          <el-select
            v-model="state.selectedSheet"
            placeholder="请选择sheet."
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
          <div class="shrink-0 w-[120px] text-right">key列数：</div>
          <el-input 
            class="mr-2"
            v-model="state.keyCol" 
            placeholder="请输入数字，以哪列作为JSON key" />
          <div class="shrink-0 w-[120px] text-right">value列数：</div>
          <el-input
            v-model="state.keyValue"
            placeholder="请输入数字，以哪列作为JSON value"  />
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
</template>

<script setup lang="ts">
  import { reactive, ref, type Ref } from 'vue'
  import { ElInput, UploadFile, ElMessage  } from 'element-plus'
  import { read, WorkSheet } from 'xlsx'

  interface State {
    text: string
    selected: string
    tableData: Record<string, string>[]
    columns: {
      label: string,
      prop: string
    }[]
    keyCol: string,
    keyValue: string
    selectedSheet: string,
    sheets: Sheet[]
  }

  interface Sheet {
      label: string,
      value: string,
      data: Record<string, string>[],
      keyMap: Record<string, string>
  }

  const state:State = reactive({
    columns: [{
      label: '键值',
      prop: 'key'
    }, {
      label: '键名',
      prop: 'value'
    }],
    selected: '1',
    text: '',
    tableData: [],
    keyCol: '1',
    keyValue: '2',
    selectedSheet: '',
    sheets: []
  })
  const inputRef: null | Ref<typeof ElInput> = ref(null)

  function getText() {
    const text = (new Function(`return {${state.text.replaceAll('，', ',').replaceAll('：', ':')}}`))();
    let parseText = null
    try {
      parseText = JSON.parse(JSON.stringify(text))
    } catch (e) {}
    return parseText
  }

  function patchTable(text: string) {
    if (!text) {
      return alert('请输入对象类型的字符串')
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
      label: '键值',
      prop: 'key'
    }, {
      label: '键名',
      prop: 'value'
    }]
    state.keyCol = '1'
    state.keyValue = '2'
    const text = getText()
    patchTable(text)
  }

  function tableSwitchText() {
    const jsonStr: Record<string, string> = {}
    if (Number(state.keyCol) < 0 || Number(state.keyValue) < 0) {
      return ElMessage({
        message: '输入的col需要大于0',
        type: 'warning',
      })
    }
    if (Number(state.keyCol) > state.columns.length || Number(state.keyValue) > state.columns.length) {
       return ElMessage({
        message: '输入的col不能大于表格的cols',
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

    let str = '';
    list.forEach((item=> str += `"${item['key']}": "${item['value']}", \n` ))

    state.text = str
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
    if (workbookSheets) {

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
      message: '复制成功',
      type: 'success',
    })
  }

  function copyTable() {
    const tableElement = document.querySelector('.el-table__body-wrapper')
    const range = new Range()
    // range.setStartBefore(tbodyElement.children[0]);
    // // Range 结束位置在 li 3
    // range.setEndAfter(tbodyElement.children?.at(-1));
    range.selectNode(tableElement)
    const selection = window.getSelection();
    selection.removeAllRanges()
    selection.addRange(range);
    document.execCommand('copy')
    // navigator.clipboard.writeText(cloneContents)
    return ElMessage({
      message: '复制成功',
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