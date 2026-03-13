import { createServerSupabaseClient } from '../lib/supabase/server';

const RAIN_BACKUP_LABEL = 'Cần phương án dự phòng mưa';

type ItineraryRow = {
  id: string;
  title: string;
  start_time: string | null;
  description: string | null;
  place: {
    id: string;
    name: string;
    is_indoor: boolean | null;
  } | null;
};

type SmartRecommendationResult = {
  rainySeasonMatched: boolean;
  flaggedCount: number;
  updatedItemIds: string[];
  flaggedItems: Array<{ id: string; title: string; placeName: string | null }>;
};

const isMonthInJuneOrJuly = (value: string) => {
  const month = new Date(value).getUTCMonth() + 1;
  return month === 6 || month === 7;
};

const isAfternoon = (timeValue: string | null) => {
  if (!timeValue) return false;
  const hour = Number.parseInt(timeValue.slice(0, 2), 10);
  return hour >= 12 && hour <= 17;
};

const isOutdoor = (isIndoor: boolean | null | undefined) => isIndoor === false;

export async function getSmartRecommendation(tripId: string): Promise<SmartRecommendationResult> {
  const supabase = createServerSupabaseClient();

  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('id, start_date, end_date')
    .eq('id', tripId)
    .single();

  if (tripError) {
    throw new Error(`Không thể đọc thông tin chuyến đi: ${tripError.message}`);
  }

  const rainySeasonMatched =
    isMonthInJuneOrJuly(trip.start_date) || isMonthInJuneOrJuly(trip.end_date);

  if (!rainySeasonMatched) {
    return {
      rainySeasonMatched: false,
      flaggedCount: 0,
      updatedItemIds: [],
      flaggedItems: [],
    };
  }

  const { data, error } = await supabase
    .from('itinerary_items')
    .select(
      `
        id,
        title,
        start_time,
        description,
        place:places(id, name, is_indoor)
      `,
    )
    .eq('trip_id', tripId)
    .order('start_time', { ascending: true });

  if (error) {
    throw new Error(`Không thể đọc itinerary_items: ${error.message}`);
  }

  const itineraryItems = (data ?? []) as ItineraryRow[];

  const targetItems = itineraryItems.filter((item) => {
    return isAfternoon(item.start_time) && isOutdoor(item.place?.is_indoor);
  });

  if (targetItems.length === 0) {
    return {
      rainySeasonMatched: true,
      flaggedCount: 0,
      updatedItemIds: [],
      flaggedItems: [],
    };
  }

  const updatedItemIds: string[] = [];

  for (const item of targetItems) {
    const currentDescription = (item.description ?? '').trim();
    const hasLabel = currentDescription.includes(RAIN_BACKUP_LABEL);

    if (hasLabel) {
      updatedItemIds.push(item.id);
      continue;
    }

    const nextDescription = currentDescription
      ? `${RAIN_BACKUP_LABEL} - ${currentDescription}`
      : RAIN_BACKUP_LABEL;

    const { error: updateError } = await supabase
      .from('itinerary_items')
      .update({ description: nextDescription })
      .eq('id', item.id);

    if (updateError) {
      throw new Error(`Không thể cập nhật item ${item.id}: ${updateError.message}`);
    }

    updatedItemIds.push(item.id);
  }

  return {
    rainySeasonMatched: true,
    flaggedCount: targetItems.length,
    updatedItemIds,
    flaggedItems: targetItems.map((item) => ({
      id: item.id,
      title: item.title,
      placeName: item.place?.name ?? null,
    })),
  };
}
