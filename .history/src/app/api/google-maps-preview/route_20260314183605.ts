import { NextResponse } from 'next/server';

type RoomOffer = {
  name: string;
  imageUrl: string | null;
  priceText: string;
  numericPrice: number;
};

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
  const pricePattern = /(?:₫\s*(?=[\d\.,]*\d)[\d\.,]+|(?=[\d\.,]*\d)[\d\.,]+\s*(?:₫|đ|vnd))/gi;
  const matches = html.match(pricePattern) ?? [];

  for (const candidate of matches) {
    const numeric = extractNumericPrice(candidate);
    if (numeric !== null && numeric >= 1000) {
      return formatVnd(numeric);
    }
  }

  return null;
};

function extractNumericPrice(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.replace(/[^\d]/g, '');
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatVnd(price: number): string {
  return `${new Intl.NumberFormat('vi-VN').format(price)}đ`;
}

const normalizeUrl = (value: string | null | undefined) => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  return trimmed;
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

const collectRoomOffersFromMasterRooms = (masterRooms: unknown): RoomOffer[] => {
  if (!Array.isArray(masterRooms)) {
    return [];
  }

  const offers: RoomOffer[] = [];

  const findFirstStringByKeys = (node: unknown, keys: string[]): string | null => {
    if (!node || typeof node !== 'object') {
      return null;
    }

    const queue: unknown[] = [node];
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || typeof current !== 'object') continue;

      if (Array.isArray(current)) {
        for (const item of current) queue.push(item);
        continue;
      }

      const dict = current as Record<string, unknown>;
      for (const key of keys) {
        const value = dict[key];
        if (typeof value === 'string' && value.trim()) {
          return value.trim();
        }
      }

      for (const value of Object.values(dict)) {
        if (value && typeof value === 'object') queue.push(value);
      }
    }

    return null;
  };

  const collectAllPrices = (node: unknown): number[] => {
    if (!node || typeof node !== 'object') {
      return [];
    }

    const values: number[] = [];
    const queue: unknown[] = [node];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || typeof current !== 'object') continue;

      if (Array.isArray(current)) {
        for (const item of current) queue.push(item);
        continue;
      }

      const dict = current as Record<string, unknown>;
      for (const [key, value] of Object.entries(dict)) {
        const keyLower = key.toLowerCase();
        if (keyLower.includes('price') || keyLower.includes('amount')) {
          const numeric = extractNumericPrice(value);
          if (numeric !== null) {
            values.push(numeric);
          }
        }

        if (value && typeof value === 'object') {
          queue.push(value);
        }
      }
    }

    return values;
  };

  for (const room of masterRooms) {
    const roomName =
      findFirstStringByKeys(room, ['name', 'displayName', 'roomTypeName', 'masterRoomName', 'title']) ||
      'Phòng';
    const imageUrl = normalizeUrl(findFirstStringByKeys(room, ['imageUrl', 'thumbnailUrl', 'photoUrl', 'url', 'image']));
    const prices = collectAllPrices(room).filter((price) => price > 0);
    if (prices.length === 0) {
      continue;
    }

    const numericPrice = Math.min(...prices);
    offers.push({
      name: roomName,
      imageUrl,
      priceText: formatVnd(numericPrice),
      numericPrice,
    });
  }

  return offers.sort((a, b) => a.numericPrice - b.numericPrice);
};

const getAgodaRoomData = async (sourceUrl: string, userAgent: string, referer?: string) => {
  const headers = {
    'user-agent': userAgent,
    'accept-language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
  };

  const pageResponse = await fetch(sourceUrl, {
    headers,
    redirect: 'follow',
    signal: AbortSignal.timeout(10000),
  });

  if (!pageResponse.ok) {
    throw new Error('Không thể truy cập trang Agoda.');
  }

  const finalUrl = pageResponse.url || sourceUrl;
  const htmlText = await pageResponse.text();

  const endpointMatch = htmlText.match(/\/api\/cronos\/property\/BelowFoldParams\/GetSecondaryData\?[^"'\s<]+/i);
  if (!endpointMatch) {
    const fallbackTitle = extractTitle(htmlText);
    const fallbackImage = extractMetaTag(htmlText, 'og:image');
    const fallbackPrice = extractPriceText(htmlText);

    return {
      title: fallbackTitle,
      imageUrl: fallbackImage,
      priceText: fallbackPrice,
      sourceUrl: finalUrl,
      roomOffers: [] as RoomOffer[],
    };
  }

  const endpointUrl = new URL(endpointMatch[0].replace(/&amp;/g, '&'), 'https://www.agoda.com').toString();

  const secondaryResponse = await fetch(endpointUrl, {
    headers: {
      ...headers,
      referer: referer || finalUrl,
      'x-requested-with': 'XMLHttpRequest',
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(10000),
  });

  if (!secondaryResponse.ok) {
    throw new Error('Không thể lấy dữ liệu phòng từ Agoda.');
  }

  const payload = (await secondaryResponse.json()) as Record<string, unknown>;
  const roomGridData = (payload.roomGridData ?? {}) as Record<string, unknown>;
  const inquiryProperty = (payload.inquiryProperty ?? {}) as Record<string, unknown>;

  const roomOffers = collectRoomOffersFromMasterRooms(roomGridData.masterRooms);

  const title =
    (typeof inquiryProperty.hotelNameEnglish === 'string' && inquiryProperty.hotelNameEnglish) ||
    (typeof inquiryProperty.placeName === 'string' && inquiryProperty.placeName) ||
    extractTitle(htmlText);

  const cheapestPriceValue = extractNumericPrice(inquiryProperty.cheapestPrice);
  const cheapestPrice = cheapestPriceValue !== null && cheapestPriceValue > 0 ? cheapestPriceValue : null;
  const fallbackPriceText = cheapestPrice !== null ? formatVnd(cheapestPrice) : extractPriceText(htmlText);
  const imageUrl = normalizeUrl(
    (typeof inquiryProperty.hotelImage === 'string' && inquiryProperty.hotelImage) ||
      extractMetaTag(htmlText, 'og:image'),
  );

  return {
    title,
    imageUrl,
    priceText: roomOffers[0]?.priceText ?? fallbackPriceText,
    sourceUrl: finalUrl,
    roomOffers,
  };
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
    const userAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

    if (parsed.hostname.includes('agoda.com')) {
      const agoda = await getAgodaRoomData(parsed.toString(), userAgent, parsed.toString());
      const minPrice = agoda.roomOffers.length > 0 ? agoda.roomOffers[0].priceText : agoda.priceText;
      const maxPrice =
        agoda.roomOffers.length > 0 ? agoda.roomOffers[agoda.roomOffers.length - 1].priceText : agoda.priceText;

      return NextResponse.json({
        title: agoda.title,
        imageUrl: normalizeUrl(agoda.imageUrl),
        priceText: agoda.priceText,
        minPriceText: minPrice,
        maxPriceText: maxPrice,
        roomOffers: agoda.roomOffers,
        sourceUrl: agoda.sourceUrl,
      });
    }

    const response = await fetch(parsed.toString(), {
      headers: { 'user-agent': userAgent },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Không thể truy cập link nguồn (Google Maps/Agoda).' }, { status: 502 });
    }

    const finalUrl = response.url || parsed.toString();
    const html = await response.text();

    const title = extractTitle(html);
    const imageUrl = normalizeUrl(extractMetaTag(html, 'og:image'));
    const priceText = extractPriceText(html);

    return NextResponse.json({
      title,
      imageUrl,
      priceText,
      minPriceText: priceText,
      maxPriceText: priceText,
      roomOffers: [],
      sourceUrl: finalUrl,
    });
  } catch {
    return NextResponse.json({ error: 'Không thể lấy dữ liệu từ link này lúc này.' }, { status: 500 });
  }
}
