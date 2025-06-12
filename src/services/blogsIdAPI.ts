const BASE_URL = 'http://localhost:5000/api/blog-ids'; // change to production URL when deployed

export async function fetchBlogIds(): Promise<string[]> {
  const res = await fetch(BASE_URL);
  if (!res.ok) throw new Error('Failed to fetch blog IDs');
  return await res.json();
}

export async function saveBlogId(id: string): Promise<void> {
  await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
}
