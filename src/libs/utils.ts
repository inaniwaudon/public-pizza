export const fullToHalf = (str: string) =>
  str
    .replace(/[Ａ-Ｚａ-ｚ０-９．＠]/g, (s) =>
      String.fromCharCode(s.charCodeAt(0) - 0xfee0),
    )
    .replace(/[ー―−]/, "-");

export const halfToFull = (str: string) =>
  str.replace(/[A-Za-z0-9.@]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) + 0xfee0),
  );

export const displayDateTime = (str: string) => {
  const zeroPadding = (no: number) => `0${no}`.slice(-2);

  const date = new Date(str);
  const month = zeroPadding(date.getMonth() + 1);
  const dateStr = zeroPadding(date.getDate());
  const hours = zeroPadding(date.getHours());
  const minutes = zeroPadding(date.getMinutes());

  return `${date.getFullYear()}/${month}/${dateStr} ${hours}:${minutes}`;
};
