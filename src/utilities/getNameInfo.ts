export function getNameInfo(name: string) {
  const url = new URL(name, 'ium:/');
  return {
    url,
    name: url.pathname.split('/').pop() as string,
    relativePath: url.pathname,
  };
}
