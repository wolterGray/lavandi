export function stampSectionMeta(overrides, sectionKey) {
  if (!sectionKey) return overrides;
  return {
    ...overrides,
    _adminMeta: {
      ...overrides?._adminMeta,
      sections: {
        ...overrides?._adminMeta?.sections,
        [sectionKey]: new Date().toISOString(),
      },
    },
  };
}

export function getSectionMeta(overrides, sectionKey) {
  return overrides?._adminMeta?.sections?.[sectionKey] ?? null;
}
