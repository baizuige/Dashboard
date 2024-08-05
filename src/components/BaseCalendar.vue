<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <div class="calendar-header-left">
        <span class="month-container">{{ calendarState.curDate.month() + 1 }}月</span>
        <span class="year-container">{{ calendarState.curDate.year() }}</span>
      </div>
      <div class="calendar-header-right">
        <a-button class="prev-icon" @click="prevMonth">
          <template #icon>
            <LeftOutlined />
          </template>
        </a-button>
        <a-button type="link" class="today">今天 </a-button>
        <a-button class="next-icon" @click="nextMonth">
          <template #icon>
            <RightOutlined />
          </template>
        </a-button>
      </div>
    </div>
    <div class="calendar-body">
      <div class="calendar">
        <div class="calendar-row calendar-header">
          <div class="calendar-cell">W</div>
          <div class="calendar-cell">周一</div>
          <div class="calendar-cell">周二</div>
          <div class="calendar-cell">周三</div>
          <div class="calendar-cell">周四</div>
          <div class="calendar-cell">周五</div>
          <div class="calendar-cell">周六</div>
          <div class="calendar-cell">周日</div>
        </div>
        <div v-for="weekList in calendarState.list" :key="weekList" class="calendar-row">
          <div v-for="item in weekList" :key="item" class="calendar-cell">
            <div v-if="item.type == CalendarType.otherDay" class="cell-content other-day">
              <div>{{ item.text }}</div>
              <div class="income-container" v-if="item.date <= calendarState.today">
                <span v-if="item.income > 0">+</span>{{ item.income.toFixed(2) }}
              </div>
            </div>
            <div
              v-else
              @click="handleUpdateIncome(item)"
              :class="{
                profit: item.income > 0,
                loss: item.income < 0,
                'is-day': item.type == CalendarType.day,
                'is-old': item.date <= calendarState.today
              }"
              class="cell-content"
            >
              <div>{{ item.text }}</div>
              <div class="income-container" v-if="item.date <= calendarState.today">
                <span v-if="item.income > 0">+</span>{{ item.income.toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <a-modal
    width="300px"
    v-model:open="calendarState.showIncomeModal"
    title="收益记录"
    @ok="handleOk"
  >
    <div class="modal-container">
      <p>{{ calendarState.modalInfo.date.format('YYYY-MM-DD') }}</p>
      <div class="income-input">
        <a-input-number
          :precision="2"
          :controls="false"
          v-model:value="calendarState.modalInfo.income"
        />
      </div>
    </div>
  </a-modal>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { LeftOutlined, RightOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import weekday from 'dayjs/plugin/weekday'
import weekOfYear from 'dayjs/plugin/weekOfYear'
dayjs.locale('zh-cn')
dayjs.extend(weekday)
dayjs.extend(weekOfYear)

const CalendarType = {
  week: 0,
  day: 1,
  otherDay: 2
}

// const calendarState.incomeDetail = {
//   2024: {
//     7: {
//       1: -17.86,
//       2: 7.67,
//       3: 39.56,
//       4: 26.0,
//       5: -23.27
//     }
//   }
// }

const calendarState = reactive({
  list: [],
  curDate: dayjs(),
  today: dayjs(),
  showIncomeModal: false,
  modalInfo: {},
  incomeDetail: null
})

function getCalendarList() {
  const firstDayOfMonth = calendarState.curDate.startOf('month')
  const daysInMonth = calendarState.curDate.endOf('month').date()
  const firstDayOfWeek = firstDayOfMonth.weekday()
  calendarState.list = []

  let day = 1,
    nextMonthDay = 1
  for (let i = 0; i < 6; i++) {
    let row = []
    for (let j = 0; j < 7; j++) {
      if (i == 0 && j < firstDayOfWeek) {
        let temp = firstDayOfMonth.add(j - firstDayOfWeek, 'day')
        row.push({
          text: temp.date(),
          date: temp,
          type: CalendarType.otherDay
        })
      } else if (day > daysInMonth) {
        row.push({
          text: nextMonthDay,
          date: firstDayOfMonth.add(daysInMonth + nextMonthDay - 1, 'day'),
          type: CalendarType.otherDay
        })
        nextMonthDay++
      } else {
        row.push({
          text: day,
          date: firstDayOfMonth.add(day - 1, 'day'),
          type: CalendarType.day
        })
        day++
      }
    }
    let sum = 0
    row.forEach((v) => {
      let year = v.date.year()
      let month = v.date.month() + 1
      let day = v.date.date()
      const income = calendarState.incomeDetail?.[year]?.[month]?.[day]
      v.income = income
      if (!income && v.date <= calendarState.today) {
        v.income = 0
      }
      sum += v.income * 100 || 0
    })
    row.unshift({
      text: row[0].date.week(),
      date: row[0].date,
      income: sum / 100,
      type: CalendarType.week
    })
    calendarState.list.push(row)
  }
}

function prevMonth() {
  calendarState.curDate = calendarState.curDate.subtract(1, 'month')
  getCalendarList()
}

function nextMonth() {
  calendarState.curDate = calendarState.curDate.add(1, 'month')
  getCalendarList()
}

function handleUpdateIncome(item) {
  if (item.type != CalendarType.day || item.date > calendarState.today) {
    return
  }
  calendarState.showIncomeModal = true
  calendarState.modalInfo.date = item.date
  calendarState.modalInfo.income = item.income
}

function handleOk() {
  let date = calendarState.modalInfo.date
  let year = date.year()
  let month = date.month()
  let day = date.date()
  if (!calendarState.incomeDetail?.[year]) {
    calendarState.incomeDetail[year] = {}
  }
  if (!calendarState.incomeDetail[year][month + 1]) {
    calendarState.incomeDetail[year][month + 1] = {}
  }
  calendarState.incomeDetail[year][month + 1][day] = calendarState.modalInfo.income
  setIncomeDetail()
  getCalendarList()
  calendarState.showIncomeModal = false
}

function getIncomeDetail() {
  calendarState.incomeDetail = JSON.parse(localStorage.getItem('IncomeDetail')) || {}
}

function setIncomeDetail() {
  localStorage.setItem('IncomeDetail', JSON.stringify(calendarState.incomeDetail))
}

onMounted(() => {
  getIncomeDetail()
  getCalendarList()
})
</script>

<style scoped lang="scss">
.calendar-container {
  width: 400px;
  padding: 8px 0;
  .calendar-header {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    &-left {
      font-size: 20px;
      font-weight: 500;
      user-select: none;
      .year-container {
        margin-left: 4px;
        color: var(--primary-color);
      }
    }
    &-right {
      display: flex;
      line-height: 32px;
      .today {
        margin: 0 4px;
      }
    }
  }
  .calendar-body {
    margin-top: 12px;

    .calendar {
      width: 100%;
      font-size: 14px;
      line-height: 1;

      .calendar-row {
        display: flex;
        margin-bottom: 4px; // 行间距

        &.calendar-header {
          font-weight: bold;
        }
      }

      .calendar-cell {
        flex: 1;
        padding: 1px 2px;
        min-width: 0; // 允许内容溢出而不增加单元格大小
        text-align: center;

        &:first-child {
          margin-right: 10px; // 第一列和第二列之间的间距
          position: relative;

          &::after {
            content: '';
            position: absolute;
            right: -5px;
            top: 0;
            bottom: 0;
            width: 1px;
            background-color: #ebedf0;
          }
        }
      }

      .cell-content {
        padding: 8px 4px; // 减少内边距以适应更多内容
        border-radius: 4px;
        font-weight: 500;
        text-align: center;
        height: 50px; // 固定高度
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        user-select: none;
        &.is-old {
          background-color: gainsboro;
          &.is-day {
            cursor: pointer;
          }
        }
        &.other-day {
          opacity: 0.25;
        }
        overflow: hidden; // 防止内容溢出

        > div {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .income-container {
          font-size: 10px;
        }

        &.profit {
          background-color: rgba(255, 56, 56, 0.3);
          .income-container {
            color: rgba(235, 47, 6, 1);
          }
        }

        &.loss {
          background-color: rgba(16, 172, 132, 0.3);
          .income-container {
            color: rgba(16, 172, 132, 1);
          }
        }

        &:hover {
          &.profit {
            background-color: rgba(235, 47, 6, 1);
          }
          &.loss {
            background-color: rgba(16, 172, 132, 1);
          }
          &.profit,
          &.loss {
            color: var(--vt-c-white-soft);
            .income-container {
              color: var(--vt-c-white-soft);
            }
          }
        }
      }
    }
  }
}
.modal-container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.income-input {
  margin: 12px 0;
}
</style>
