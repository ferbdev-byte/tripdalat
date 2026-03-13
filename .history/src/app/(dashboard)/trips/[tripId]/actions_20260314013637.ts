'use server';

import { createServerSupabaseClient } from '../../../../lib/supabase/server';

type ConfirmSwapInput = {
  itineraryItemId: string;
  fromPlaceId: string;
  toPlaceId: string;
};

type ConfirmSwapResult = {
  ok: boolean;
  message: string;
};

export async function confirmRainSwapAction(
  input: ConfirmSwapInput,
): Promise<ConfirmSwapResult> {
  const supabase = createServerSupabaseClient();

  const { data: item, error: itemError } = await supabase
    .from('itinerary_items')
    .select('id, description')
    .eq('id', input.itineraryItemId)
    .single();

  if (itemError) {
    return {
      ok: false,
      message: `Không đọc được itinerary item: ${itemError.message}`,
    };
  }

  const { data: places, error: placeError } = await supabase
    .from('places')
    .select('id, name')
    .in('id', [input.fromPlaceId, input.toPlaceId]);

  if (placeError) {
    return {
      ok: false,
      message: `Không đọc được thông tin địa điểm: ${placeError.message}`,
    };
  }

  const fromPlaceName = places?.find((place) => place.id === input.fromPlaceId)?.name ?? 'điểm A';
  const toPlaceName = places?.find((place) => place.id === input.toPlaceId)?.name ?? 'điểm B';

  const note = `Đã tự động đổi từ điểm ${fromPlaceName} sang điểm ${toPlaceName} do dự báo mưa`;
  const currentDescription = (item.description ?? '').trim();
  const nextDescription = currentDescription ? `${currentDescription}\n${note}` : note;

  const { error: updateError } = await supabase
    .from('itinerary_items')
    .update({
      place_id: input.toPlaceId,
      description: nextDescription,
    })
    .eq('id', input.itineraryItemId);

  if (updateError) {
    return {
      ok: false,
      message: `Không thể cập nhật itinerary item: ${updateError.message}`,
    };
  }

  return {
    ok: true,
    message: note,
  };
}
