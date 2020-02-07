const date = new Date();

const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();
const dayOfWeekStr = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

export {year, month, day, dayOfWeekStr};
