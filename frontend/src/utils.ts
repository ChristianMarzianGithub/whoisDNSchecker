export const isValidDomain = (value: string): boolean => /^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,}$/.test(value.trim());

export const toggleRecordType = (current: string[], type: string): string[] => {
  if (current.includes(type)) {
    const next = current.filter((item) => item !== type);
    return next.length ? next : ['A', 'AAAA'];
  }
  return [...current, type];
};
