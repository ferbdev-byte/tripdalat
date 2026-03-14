import { NextResponse } from 'next/server';

const extractMetaTag = (html: string, key: string) => {
  const propertyPattern = new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  const namePattern = new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');

  const propertyMatch = html.match(propertyPattern);
  if (propertyMatch?.[1]) return propertyMatch[1].trim();

  const nameMatch = html.match(namePattern);
  if (nameMatch?.[1]) return nameMatch[1].trim();

  return null;
};

const extractTitle = (html: string) => {
  const ogTitle = extractMetaTag(html, 'og:title');
  if (ogTitle) return ogTitle;

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  return titleMatch?.[1]?.trim() ?? 'Phòng lưu trú';
};

const extractPriceText = (html: string) => {
  const pricePattern = /(?:₫\s?[\d\.,]+|[\d\.,]+\s?(?:₫|đ|vnd))/i;
  const matched = html.match(pricePattern);
  return matched?.[0]?.trim() ?? null;
};

const isAllowedSourceHost = (hostname: string) => {
  return (
    hostname.includes('google.com') ||
    hostname.includes('googleusercontent.com') ||
    hostname.includes('maps.app.goo.gl') ||
    hostname.includes('goo.gl') ||
    hostname.includes('agoda.com')
  );
};

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const target = requestUrl.searchParams.get('url');

  if (!target) {
    return NextResponse.json({ error: 'Missing url parameter.' }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    return NextResponse.json({ error: 'Invalid target URL.' }, { status: 400 });
  }

  if (!isAllowedSourceHost(parsed.hostname)) {
    return NextResponse.json({ error: 'Only Google Maps or Agoda links are supported.' }, { status: 400 });
  }

  try {
    const response = await fetch(parsed.toString(), {
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Không thể truy cập link nguồn (Google Maps/Agoda).' }, { status: 502 });
    }

    const finalUrl = response.url || parsed.toString();
    const html = await response.text();

    const title = extractTitle(html);
    const imageUrl = extractMetaTag(html, 'og:image');
    const priceText = extractPriceText(html);

    return NextResponse.json({
      title,
      imageUrl,
      priceText,
      sourceUrl: finalUrl,
    });
  } catch {
    return NextResponse.json({ error: 'Không thể lấy dữ liệu từ link này lúc này.' }, { status: 500 });
  }
}
