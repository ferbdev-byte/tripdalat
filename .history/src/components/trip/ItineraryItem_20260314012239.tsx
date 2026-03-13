import { AlertTriangle, MapPin } from 'lucide-react';

const RAIN_BACKUP_LABEL = 'Cần phương án dự phòng mưa';

type ItineraryItemData = {
  id: string;
  title: string;
  placeName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  description?: string | null;
};

type ItineraryItemProps = {
  item: ItineraryItemData;
  isRaining?: boolean;
  onSuggestIndoorCafe?: () => void;
};

export function ItineraryItem({
  item,
  isRaining = false,
  onSuggestIndoorCafe,
}: ItineraryItemProps) {
  const hasRainBackupLabel = (item.description ?? '').includes(RAIN_BACKUP_LABEL);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-slate-900">{item.title}</h4>
          {(item.startTime || item.endTime) && (
            <p className="mt-1 text-sm text-slate-500">
              {item.startTime ?? '--:--'} - {item.endTime ?? '--:--'}
            </p>
          )}
        </div>

        {hasRainBackupLabel && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            Cảnh báo mưa
          </span>
        )}
      </div>

      {item.placeName && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-slate-600">
          <MapPin className="h-4 w-4" />
          {item.placeName}
        </p>
      )}

      {item.description && (
        <p className="mt-3 text-sm leading-6 text-slate-700">{item.description}</p>
      )}

      {isRaining && (
        <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50/70 p-3">
          <p className="text-sm text-amber-800">Dự báo đang có mưa, nên ưu tiên địa điểm trong nhà.</p>
          <button
            type="button"
            onClick={onSuggestIndoorCafe}
            className="mt-2 inline-flex items-center rounded-md bg-amber-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-amber-600"
          >
            Xem quán cafe gần đây có mái che
          </button>
        </div>
      )}
    </article>
  );
}
