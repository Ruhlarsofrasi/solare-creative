# Açık notlar

Bu dosya siteye dahil değildir (yayınlanmaz); yapılacak işlerin listesidir.

## Karar bekliyor

**Hizala açıkken ekranlar (billboard) üst üste biniyor** (2026-11-19 bildirildi)
Gezegenler tek sıraya dizilince birbirine çok yaklaşıyor; bir gezegenin durağındayken komşu gezegenlerin ekranları kadraja girip üst üste biniyor (ör. Mimari durağında Dünya ve Venüs ekranları).
Seçenekler (görünümü etkiler, karar kullanıcıda):
- Hizalıyken yalnızca bulunulan gezegenin ekranları görünsün.
- Gezegenler tam tek çizgi yerine hafif kademeli dizilsin.
Kod: `src/scene/CameraRig.tsx` (ALIGN_ANGLE), `src/scene/Billboards.tsx`.

## Bekleyen
- Kullanıcı yeni görsel/video asset'lerini gönderecek.
- Kural: görüntü kalitesini düşüren hiçbir değişiklik sorulmadan yapılmaz.
- Müzik dosyasının adı tam olarak `public/audio/ambient.mp3` olmalı (bkz. `src/config/site.ts` → `audio.music`). Farklı adla site yerleşik sentez sesine döner.

## Düzeltildi (2026-11-19)
- Tutulmada Ay artık kadrajın dışından girip dışına çıkıyor.
- Etiketler güneşin parlak halesinde de koyulaşıyor; tutulma sırasında koyulaşma kapanıyor.
- Müzik dosyası yanlış adla (`STREAMING-…mp3`, sonra `ambienmt.mp3`) duruyordu; `ambient.mp3` yapıldı.
