'use client';

import { motion } from 'framer-motion';
import { Camera, ChevronDown, Coffee, ExternalLink, MapPin, Shirt, ShoppingBag, Snowflake, Umbrella, UtensilsCrossed, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Drawer } from 'vaul';
import confetti from 'canvas-confetti';
import { DALAT_LOCAL_DISCOVERY } from '../../constants/dalat-data';

type TimelineCategory = 'cafe' | 'food' | 'sightseeing' | 'hotel' | 'shopping' | 'other';

type TimelineItem = {
  id: string;
  title: string;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  place: {
    id: string;
    name: string;
    category: TimelineCategory;
    is_indoor: boolean;
    latitude: number;
    longitude: number;
    outfit_concept: string;
    temp_advice: string;
    photo_spot_tips: string[];
    opening_hours?: string | { open: string; close: string };
    address?: string;
  } | null;
  estimated_cost?: number;
};

type ItineraryTimelineProps = {
  items: TimelineItem[];
  selectedPoiId: string | null;
  isRaining: boolean;
  hourlyTemperatureByHour: Record<string, number>;
  lateWarningsByItemId: Record<string, string>;
  capturedPhotoItemIds: Set<string>;
  travelMinutesByItemId: Record<string, number>;
  onSetTravelMinutes: (itemId: string, minutesValue: string) => void;
  onCapturePhoto: (itemId: string) => void;
  onFocusPlaceOnMap: (placeId: string, options?: { zoomLevel?: number; scrollToMap?: boolean }) => void;
  onSuggestIndoorCafe: () => void;
};

const categoryIconMap: Record<TimelineCategory, typeof Coffee> = {
  cafe: Coffee,
  food: UtensilsCrossed,
  sightseeing: Camera,
  hotel: MapPin,
  shopping: ShoppingBag,
  other: MapPin,
};

const categoryLabelMap: Record<TimelineCategory, string> = {
  cafe: 'Cafe',
  food: 'Food',
  sightseeing: 'Sightseeing',
  hotel: 'Hotel',
  shopping: 'Shopping',
  other: 'Other',
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

const toRadians = (value: number) => (value * Math.PI) / 180;

const getDistanceKm = (
  pointA: { latitude: number; longitude: number },
  pointB: { latitude: number; longitude: number },
) => {
  const earthRadiusKm = 6371;
  const latDelta = toRadians(pointB.latitude - pointA.latitude);
  const lonDelta = toRadians(pointB.longitude - pointA.longitude);

  const a =
    Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
    Math.cos(toRadians(pointA.latitude)) *
      Math.cos(toRadians(pointB.latitude)) *
      Math.sin(lonDelta / 2) *
      Math.sin(lonDelta / 2);

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const fallbackImage = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80';

const toVnd = (value: number) => new Intl.NumberFormat('vi-VN').format(value);

const formatOpeningHours = (value?: string | { open: string; close: string }) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (value.open && value.close) return `${value.open} - ${value.close}`;
  return null;
};

export function ItineraryTimeline({
  items,
  selectedPoiId,
  isRaining,
  hourlyTemperatureByHour,
  lateWarningsByItemId,
  capturedPhotoItemIds,
  travelMinutesByItemId,
  onSetTravelMinutes,
  onCapturePhoto,
  onFocusPlaceOnMap,
  onSuggestIndoorCafe,
}: ItineraryTimelineProps) {
  const [detailItemId, setDetailItemId] = useState<string | null>(null);
  const [expandedItemIds, setExpandedItemIds] = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [photoMemoryByPlaceId, setPhotoMemoryByPlaceId] = useState<Record<string, boolean>>({});
  const discoveryById = useMemo(() => new Map(DALAT_LOCAL_DISCOVERY.map((poi) => [poi.id, poi])), []);
  const detailItem = useMemo(() => items.find((item) => item.id === detailItemId) ?? null, [detailItemId, items]);

  const openMotorcycleDirections = (latitude: number, longitude: number) => {
    const deepLink = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=motorcycle`;
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    // On mobile, navigating in the same tab gives OS a better chance to hand off to Google Maps app.
    if (isMobile) {
      window.location.href = deepLink;
      return;
    }

    window.open(deepLink, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setUserLocation(null);
      },
      { enableHighAccuracy: false, timeout: 6500, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  const toggleItemExpanded = (itemId: string) => {
    setExpandedItemIds((previous) => {
      const next = new Set(previous);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  return (
    <>
      <motion.div
        className="space-y-3.5 sm:space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {items.map((item, index) => {
          const category = item.place?.category ?? 'other';
          const CategoryIcon = categoryIconMap[category];
          const isSelected = selectedPoiId === item.place?.id;
          const distanceFromUserKm =
            userLocation && item.place
              ? getDistanceKm(userLocation, {
                  latitude: item.place.latitude,
                  longitude: item.place.longitude,
                })
              : null;
          const travelMode = distanceFromUserKm !== null && distanceFromUserKm < 1 ? 'walking' : 'motorcycle';
          const placeDiscovery = item.place ? discoveryById.get(item.place.id) : null;
          const menuItems = placeDiscovery?.menu_items ?? [];
          const averageMenuPrice =
            menuItems.length > 0
              ? Math.round(menuItems.reduce((sum, menuItem) => sum + menuItem.price, 0) / menuItems.length)
              : null;
          const hourKey = (item.start_time ?? '').slice(0, 2);
          const temperatureAtHour = hourlyTemperatureByHour[hourKey];
          const needsThickJacket = Number.isFinite(temperatureAtHour) && temperatureAtHour < 16;
          const isCaptured = capturedPhotoItemIds.has(item.id);
          const isExpanded = expandedItemIds.has(item.id);
          const lateWarningMessage = lateWarningsByItemId[item.id] ?? null;
          const googleMapsLink =
            item.place
              ? `https://www.google.com/maps/dir/?api=1&destination=${item.place.latitude},${item.place.longitude}&travelmode=${travelMode}`
              : null;

          return (
            <motion.article
              key={item.id}
              variants={itemVariants}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative pl-8 sm:pl-10"
              onMouseEnter={() => {
                if (item.place?.id) {
                  onFocusPlaceOnMap(item.place.id, { zoomLevel: 14, scrollToMap: false });
                }
              }}
              onClick={() => {
                if (item.place?.id) {
                  onFocusPlaceOnMap(item.place.id, { zoomLevel: 15, scrollToMap: true });
                }
              }}
            >
              {index < items.length - 1 && (
                <span className="absolute left-2.5 top-7 h-[calc(100%+1.1rem)] w-px bg-gradient-to-b from-[#7A9D8C]/50 to-[#A67B5B]/25 sm:left-3 sm:h-[calc(100%+1.5rem)]" />
              )}

              <span
                className={`absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300 ${
                  isSelected
                    ? 'border-[#7A9D8C] bg-[#7A9D8C] text-white ring-4 ring-[#7A9D8C]/20'
                    : 'border-[#7A9D8C]/35 bg-[#7A9D8C]/12 text-[#7A9D8C]'
                }`}
              >
                <CategoryIcon className="h-3.5 w-3.5" />
              </span>

              <motion.div
                whileHover={{
                  y: -4,
                  boxShadow: '0 0 0 1px rgba(122, 157, 140, 0.35), 0 20px 32px rgba(122, 157, 140, 0.18)',
                }}
                className={`rounded-3xl border bg-[#F9F9F9]/80 p-3.5 shadow-[0_10px_26px_rgba(74,74,74,0.09)] backdrop-blur-md transition-all duration-300 sm:p-6 ${
                  isSelected
                    ? 'border-[#7A9D8C]/55 ring-1 ring-[#7A9D8C]/35'
                    : 'border-[#A67B5B]/18 hover:border-[#A67B5B]/35'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs tracking-wide text-[#7A9D8C]">
                    {item.start_time ?? '--:--'} {item.end_time ? `→ ${item.end_time}` : ''}
                  </p>
                  <span className="rounded-full border border-[#A67B5B]/25 bg-[#A67B5B]/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#A67B5B]">
                    {categoryLabelMap[category]}
                  </span>
                  {item.place?.is_indoor && (
                    <span className="rounded-full border border-[#D4A5A5]/35 bg-[#D4A5A5]/18 px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#A36464]">
                      Indoor
                    </span>
                  )}
                  {typeof item.estimated_cost === 'number' && item.estimated_cost > 0 && (
                    <span className="rounded-full border border-[#7A9D8C]/30 bg-[#7A9D8C]/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#527061]">
                      ~{toVnd(item.estimated_cost)} VND
                    </span>
                  )}
                  {averageMenuPrice !== null && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#A67B5B]/30 bg-[#fff6ef] px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#7C5A42]">
                      <Wallet className="h-3 w-3" />
                      Giá TB: ~{toVnd(averageMenuPrice)}đ
                    </span>
                  )}
                </div>

                <h3 className="mt-2 text-lg text-[#4A4A4A] sm:text-xl" style={{ fontFamily: 'var(--font-heading), serif' }}>
                  {item.place?.name ?? item.title}
                </h3>
                <p className="mt-1 text-sm text-[#4A4A4A]/75">{item.title}</p>
                {item.description && <p className="mt-2 line-clamp-2 text-sm leading-7 text-[#4A4A4A]/70">{item.description}</p>}

                <div className="mt-4 flex flex-wrap gap-2">
                  {googleMapsLink && (
                    <a
                      href={googleMapsLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#7A9D8C]/35 bg-white/85 px-3 py-2 text-[11px] text-[#527061] transition hover:bg-white"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Dẫn đường · {travelMode === 'walking' ? 'Đi bộ' : 'Xe máy'}
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleItemExpanded(item.id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#A67B5B]/30 bg-white/85 px-3 py-2 text-[11px] text-[#7c5a42] transition hover:bg-white"
                  >
                    Chi tiết
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setDetailItemId(item.id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#A67B5B]/35 bg-white/85 px-3 py-2 text-[11px] text-[#7c5a42] transition hover:bg-white"
                  >
                    Xem chi tiết
                  </button>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      if (!isCaptured) {
                        confetti({
                          particleCount: 70,
                          spread: 60,
                          startVelocity: 35,
                          origin: { y: 0.7 },
                        });
                      }
                      onCapturePhoto(item.id);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] transition ${
                      isCaptured
                        ? 'border-[#7A9D8C]/45 bg-[#7A9D8C]/15 text-[#527061]'
                        : 'border-[#D4A5A5]/45 bg-white/85 text-[#A36464] hover:bg-white'
                    }`}
                  >
                    {isCaptured ? 'Captured' : 'Check-in Photo'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 space-y-3 rounded-2xl border border-[#A67B5B]/20 bg-white/70 p-3">
                    {item.place?.outfit_concept && (
                      <p className="inline-flex items-center gap-1 rounded-full border border-[#7A9D8C]/35 bg-[#7A9D8C]/10 px-2.5 py-1 text-[10px] uppercase tracking-wide text-[#527061]">
                        <Shirt className="h-3 w-3" />
                        Outfit: {item.place.outfit_concept}
                      </p>
                    )}

                    {item.place?.temp_advice && (
                      <div className="rounded-xl border border-[#7A9D8C]/25 bg-white/75 px-3 py-2 text-xs text-[#4A4A4A]/80">
                        <p>{item.place.temp_advice}</p>
                        {needsThickJacket && (
                          <p className="mt-1 inline-flex items-center gap-1.5 text-[#527061]">
                            <Snowflake className="h-3.5 w-3.5" />
                            Trời dưới 16°C, nhớ mang áo khoác dày.
                          </p>
                        )}
                      </div>
                    )}

                    {lateWarningMessage && (
                      <div className="rounded-xl border border-[#DA6B6B]/40 bg-[#ffecec] px-3 py-2 text-xs text-[#B24545]">
                        {lateWarningMessage}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#4A4A4A]/75">
                      <span>Di chuyển:</span>
                      <input
                        type="number"
                        min={0}
                        value={travelMinutesByItemId[item.id] ?? 0}
                        onChange={(event) => onSetTravelMinutes(item.id, event.target.value)}
                        className="w-20 rounded-lg border border-[#A67B5B]/25 bg-white/90 px-2 py-1.5 outline-none"
                        onClick={(event) => event.stopPropagation()}
                      />
                      <span>phút</span>
                    </div>

                    {isRaining && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSuggestIndoorCafe();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-[#D4A5A5]/45 bg-[#D4A5A5]/20 px-4 py-2 text-xs text-[#A36464] transition hover:bg-[#D4A5A5]/30"
                      >
                        <Umbrella className="h-3.5 w-3.5" />
                        Xem quán cafe gần đây có mái che
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.article>
          );
        })}
      </motion.div>

      <Drawer.Root open={Boolean(detailItem)} onOpenChange={(open) => !open && setDetailItemId(null)}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/30" />
          <Drawer.Content className="fixed inset-x-0 bottom-0 z-[61] flex max-h-[88vh] flex-col rounded-t-[28px] border border-white/40 bg-[#F9F9F9]/95 shadow-[0_-16px_40px_rgba(74,74,74,0.22)] backdrop-blur-xl focus:outline-none">
            <Drawer.Title className="sr-only">
              {detailItem ? `Chi tiết điểm đến ${detailItem.place?.name ?? detailItem.title}` : 'Chi tiết điểm đến'}
            </Drawer.Title>
            <div className="mx-auto mt-2 h-1.5 w-14 rounded-full bg-[#7A9D8C]/35" />
            {detailItem && (
              <>
                <div className="mx-auto mt-4 flex-1 max-w-2xl space-y-4 overflow-y-auto px-4 pb-28 sm:px-6">
                  {(() => {
                    const detailDiscovery = discoveryById.get(detailItem.place?.id ?? '');
                    const detailMenu = detailDiscovery?.menu_items ?? [];
                    const placeAddress = detailDiscovery?.address ?? detailItem.place?.address;
                    const placeOpeningHours = formatOpeningHours(detailDiscovery?.opening_hours ?? detailItem.place?.opening_hours);

                    return (
                      <>
                        <div className="overflow-hidden rounded-3xl border border-white/45">
                          <img
                            src={detailDiscovery?.image_url ?? fallbackImage}
                            alt={detailItem.place?.name ?? detailItem.title}
                            className="h-52 w-full object-cover sm:h-64"
                          />
                        </div>

                        <div className="rounded-2xl border border-[#7A9D8C]/22 bg-white/80 p-4">
                          <h4 className="text-2xl text-[#4A4A4A]" style={{ fontFamily: 'var(--font-heading), serif' }}>
                            {detailItem.place?.name ?? detailItem.title}
                          </h4>
                          {placeAddress && <p className="mt-2 text-sm text-[#4A4A4A]/80">{placeAddress}</p>}
                          {placeOpeningHours && (
                            <p className="mt-1 text-sm text-[#527061]">Giờ mở cửa: {placeOpeningHours}</p>
                          )}
                          <p className="mt-2 text-xs uppercase tracking-wide text-[#7A9D8C]">
                            {detailItem.start_time ?? '--:--'} {detailItem.end_time ? `→ ${detailItem.end_time}` : ''}
                          </p>
                          <p className="mt-2 text-sm text-[#4A4A4A]/80">{detailItem.title}</p>
                          {detailItem.description && <p className="mt-2 text-sm leading-7 text-[#4A4A4A]/75">{detailItem.description}</p>}
                          {typeof detailItem.estimated_cost === 'number' && detailItem.estimated_cost > 0 && (
                            <p className="mt-3 text-sm text-[#527061]">
                              Chi phí dự kiến: <strong>{toVnd(detailItem.estimated_cost)} VND</strong>
                            </p>
                          )}
                        </div>

                        {detailMenu.length > 0 && (
                          <div className="rounded-2xl border border-[#D4A5A5]/28 bg-[#fff8f8] p-4">
                            <p className="text-xs uppercase tracking-wide text-[#A36464]">Danh sách món ăn</p>
                            <ul className="mt-2 space-y-2">
                              {detailMenu.map((menuItem, index) => (
                                <li
                                  key={`${detailItem.id}-menu-${index}`}
                                  className="rounded-xl border border-[#D4A5A5]/20 bg-white px-3 py-2.5 text-sm text-[#4A4A4A]/85 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_18px_rgba(166,123,91,0.12)]"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <p className="font-semibold text-[#4A4A4A]">{menuItem.name}</p>
                                    <span className="whitespace-nowrap text-[#7C5A42]">{toVnd(menuItem.price)}đ</span>
                                  </div>
                                  <p className="mt-1 text-xs text-[#4A4A4A]/70">{menuItem.description}</p>
                                  {menuItem.address && <p className="mt-1 text-[11px] text-[#4A4A4A]/55">{menuItem.address}</p>}
                                  {menuItem.opening_hours && (
                                    <p className="mt-0.5 text-[11px] text-[#527061]">Giờ mở món: {menuItem.opening_hours}</p>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="rounded-2xl border border-[#A67B5B]/20 bg-[#fffaf6] p-4">
                          <p className="text-xs uppercase tracking-wide text-[#A67B5B]">Góc chụp ảnh đẹp</p>
                          <ul className="mt-2 space-y-1.5 text-sm text-[#4A4A4A]/80">
                            {(detailItem.place?.photo_spot_tips ?? ['Đứng lệch 1/3 khung hình để ảnh có chiều sâu.', 'Canh ánh sáng mềm trước hoàng hôn để da lên màu đẹp.']).map((tip, index) => (
                              <li key={`${detailItem.id}-tip-${index}`}>• {tip}</li>
                            ))}
                          </ul>

                          {detailItem.place?.id && (
                            <label className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#7A9D8C]/30 bg-white px-3 py-2 text-xs text-[#527061]">
                              <input
                                type="checkbox"
                                checked={Boolean(photoMemoryByPlaceId[detailItem.place.id])}
                                onChange={(event) => {
                                  setPhotoMemoryByPlaceId((previous) => ({
                                    ...previous,
                                    [detailItem.place!.id]: event.target.checked,
                                  }));
                                }}
                                className="h-3.5 w-3.5"
                              />
                              Đã có ảnh đẹp tại đây
                            </label>
                          )}
                        </div>

                        <div className="rounded-2xl border border-[#7A9D8C]/20 bg-white/80 p-4">
                          <p className="text-xs uppercase tracking-wide text-[#7A9D8C]">Mẹo nhỏ</p>
                          <ul className="mt-2 space-y-1.5 text-sm text-[#4A4A4A]/80">
                            <li>• Nên đến trước 4h chiều để còn bàn view đẹp và ánh sáng mềm.</li>
                            <li>• Chuẩn bị áo khoác mỏng vì nhiệt độ giảm nhanh về chiều.</li>
                            <li>• Nếu trời mưa, ưu tiên điểm indoor và tránh cung đường dốc xa.</li>
                          </ul>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {detailItem.place && (
                  <div className="border-t border-[#7A9D8C]/18 bg-[#F9F9F9]/98 px-4 pb-5 pt-3 sm:px-6">
                    <button
                      type="button"
                      onClick={() => openMotorcycleDirections(detailItem.place!.latitude, detailItem.place!.longitude)}
                      className="w-full rounded-2xl bg-[#7A9D8C] px-4 py-3 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(122,157,140,0.30)] transition hover:opacity-95"
                    >
                      Dẫn đường Xe máy
                    </button>
                  </div>
                )}
              </>
            )}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
