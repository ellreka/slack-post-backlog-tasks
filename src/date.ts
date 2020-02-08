const date = new Date();

const year = date.getFullYear();
const month = ('0' + (date.getMonth() + 1)).slice(-2);
const day = ('0' + date.getDate()).slice(-2);
const dayOfWeekStr = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

export {year, month, day, dayOfWeekStr};
