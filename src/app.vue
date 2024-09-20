<template>
  <div class="main-container flex flex-col items-center">
    <div 
      class="w-[800px]"
    >
    <div class="mb-2">
      请选择功能：
      <el-select
        v-model="state.selected"
        placeholder="请选择功能."
        style="width: 240px"
      >
        <el-option 
          label="JSON to Table"
          value="1">
        </el-option>
        <el-option 
          label="Excel to JSON"
          value="2">
        </el-option>
      </el-select>
    </div>
      <el-upload
        v-if="state.selected === '2'"
        class="upload-demo"
        :limit="1"
        accept=".xlsx"
        :auto-upload="false"
        @change="changeFile"
      >
        <el-button type="primary">上传文件</el-button>
      </el-upload>
      <div class="flex items-center mb-6">
        <div class="flex flex-grow mr-2">
          <el-input
            v-model="state.text"
            :rows="10"
            type="textarea"
            placeholder="请输入JSON或JS对象字符串，不需要输入最外面的小括号{}， 如：aaa: 111"
          />
        </div>
        <div class="flex flex-col">
          <el-button
            v-if="state.selected === '1'"
            class="mb-2 "
            size="large"
            type="primary"
            @click="textSwitchTable"
            >
            json转换table
          </el-button>
          <el-button
            v-if="state.selected === '2'"
            class="mb-2"
            size="large"
            type="primary"
            @click="tableSwitchText"
            >
            table转换json
          </el-button>
          <!-- <el-button
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
          </el-button> -->
        </div>
      </div>

      <el-select
        v-model="state.selectedSheet"
        placeholder="请选择sheet."
        style="width: 240px"
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
      <el-table
        border
        :data="state.tableData"
        stripe
      >
        <el-table-column
          :key="column.prop"
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
  import { ElInput, UploadFile } from 'element-plus'
  import { read, WorkSheet } from 'xlsx'

  interface State {
    text: string
    selected: string
    tableData: Record<string, string>[]
    columns: {
      label: string,
      prop: string
    }[]
    selectedSheet: string,
    sheets: WorkSheet[]
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
    selectedSheet: '',
    sheets: []
  })
  const inputRef: null | Ref<typeof ElInput> = ref(null)

  function getText() {
    const text = (new Function(`return {${state.text}}`))();
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
    const text = getText()
    patchTable(text)
  }

  function tableSwitchText() {
    const jsonStr: Record<string, string> = {}
    let str = '';
    for (let item of state.tableData) {
      // jsonStr[item['key'] as string] = item['value']
      str += `${item['key']}: ${item['value']}, \n` 
    }

    // const matchData = /^\{([^\{]+)}$/.exec(JSON.stringify(jsonStr))
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
    for (let [key, sheetValue] of Object.entries(workbookSheets)) {
      const sheet = {
        label: key,
        value: key,
        data: []
      }
      for (let [itemKey, itemValue] of Object.entries(sheetValue)) {
        const number = /([0-9]+)$/.exec(itemKey)?.[0]
        if (sheet[number]) {
          sheet[number] = {
            
          }
        }
      }

      sheets.push(sheet)
    }
    state.sheets = sheets
    changeSheet(sheets[0]?.value)
  }

  function changeSheet(sheetName: string) {
    state.selectedSheet = sheetName
  }

  function copyInput() {

  }

  function copyTable() {
    
  }

</script>

<style lang="scss" scoped>
  .main-container {
    :deep(.el-button+.el-button) {
      margin-left: 0;
    }
  }
</style>