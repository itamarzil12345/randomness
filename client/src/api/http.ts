type RequestOptions = {
  method?: string;
  body?: unknown;
};

export const requestJson = async <T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> => {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
};
