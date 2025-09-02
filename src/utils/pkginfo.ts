function normalizeDepName(depString: string) {
  return depString.split(/[>=<]/)[0].trim();
}

export { normalizeDepName };
