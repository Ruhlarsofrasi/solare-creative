# Açık notlar

Bu dosya siteye dahil değildir (yayınlanmaz); yapılacak işlerin listesidir.

## Bekleyen
- Kullanıcı yeni görsel/video asset'lerini gönderecek.
- Kural: görüntü kalitesini düşüren hiçbir değişiklik sorulmadan yapılmaz.
- Müzik dosyasının adı tam olarak `public/audio/ambient.mp3` olmalı (bkz. `src/config/site.ts` → `audio.music`). Farklı adla site yerleşik sentez sesine döner.

## Düzeltildi (2026-11-19)
- Hizala açıkken yalnızca bulunulan gezegenin ekranları görünüyor; diğerleri hizalanırken katlanıp kayboluyor (genel görünümde hiçbiri).
- Tutulmada Ay artık kadrajın dışından girip dışına çıkıyor.
- Etiketler güneşin parlak halesinde de koyulaşıyor; tutulma sırasında koyulaşma kapanıyor.
- Müzik dosyası yanlış adla (`STREAMING-…mp3`, sonra `ambienmt.mp3`) duruyordu; `ambient.mp3` yapıldı.
