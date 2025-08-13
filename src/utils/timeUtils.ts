// Time utility functions for dynamic time handling

export const getCurrentDate = () => new Date();

export const getCurrentMonth = () => getCurrentDate().getMonth(); // 0-11

export const getCurrentYear = () => getCurrentDate().getFullYear();

export const getMonthNames = () => [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const getShortMonthNames = () => [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

export const isCurrentOrPastMonth = (monthIndex: number, year?: number) => {
  const currentDate = getCurrentDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  if (year && year < currentYear) return true;
  if (year && year > currentYear) return false;
  
  return monthIndex <= currentMonth;
};

export const isFutureMonth = (monthIndex: number, year?: number) => {
  return !isCurrentOrPastMonth(monthIndex, year);
};

export const getRemainingMonthsInYear = () => {
  const currentMonth = getCurrentMonth();
  return 11 - currentMonth; // 0-based month, so 11 is December
};

export const getMonthsFromCurrent = (includeCurrent = false) => {
  const currentMonth = getCurrentMonth();
  const startMonth = includeCurrent ? currentMonth : currentMonth + 1;
  
  return getShortMonthNames().slice(startMonth);
};

export const getFutureMonthsForYear = (year: number) => {
  const currentYear = getCurrentYear();
  const currentMonth = getCurrentMonth();
  
  if (year > currentYear) {
    // Future year - all months are available
    return getShortMonthNames().map((month, index) => ({ month, index, editable: true }));
  } else if (year === currentYear) {
    // Current year - only future months are editable
    return getShortMonthNames().map((month, index) => ({
      month,
      index,
      editable: index > currentMonth
    }));
  } else {
    // Past year - no months are editable
    return getShortMonthNames().map((month, index) => ({ month, index, editable: false }));
  }
};

export const formatDateForDisplay = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTimeForDisplay = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateTimeForDisplay = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return `${formatDateForDisplay(dateObj)} at ${formatTimeForDisplay(dateObj)}`;
};

export const getTimeAgo = (date: Date | string) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = getCurrentDate();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  if (diffInDays < 7) return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  
  return formatDateForDisplay(dateObj);
};

export const getCurrentQuarter = () => {
  const month = getCurrentMonth();
  return Math.floor(month / 3) + 1; // Q1, Q2, Q3, Q4
};

export const getQuarterMonths = (quarter: number) => {
  const startMonth = (quarter - 1) * 3;
  return getShortMonthNames().slice(startMonth, startMonth + 3);
};

export const isWorkingHour = () => {
  const hour = getCurrentDate().getHours();
  return hour >= 8 && hour <= 18; // 8 AM to 6 PM
};

export const getBusinessDaysUntil = (targetDate: Date) => {
  const current = getCurrentDate();
  let count = 0;
  const date = new Date(current);
  
  while (date < targetDate) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++;
    }
  }
  
  return count;
};
