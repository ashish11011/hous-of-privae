export function formatNumberWithCommas(number: number) {
  if (number === null || number === undefined || isNaN(number)) return "";
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
