const cover =
  /SCAN.HiRES|High.(Res|Resolution).(Covers?|DISC)|(Scan|R1|R2|PL|DVD|Internal|Retail|CUSTOM).Covers?|Cover.Pack|CUSTOM.DVD.DISKS|Retail.HiRES|SaNdS|QCovER|BluRaycover|CUSTOM.NORDIC.DVD/i;
const fix = /\b((dir|nfo|sub)fix)\b/i;
const subs = /\b(subpack|SUBPAX?)\b/i;
const isTv =
  /S?(?<season>(?<!\d+)(?:\d{1,2})(?!\d+))(?:[ex]|\W[ex]|_){1,2}(?<episode>(?!265|264)\d{2,3})/i;

// ignore these Anastasia.1997.Hybrid.1080p.BluRay.Remux.AVC.DTS-HD.MA.5.1-NOGRP
const isNogrp = /\bRemux\b.*-NOGRP$/i;

/**
 * @returns false if release should be filtered
 */
export function filterReleaseResults(release: string): boolean {
  return (
    !cover.test(release) &&
    !fix.test(release) &&
    !subs.test(release) &&
    !isTv.test(release) &&
    !isNogrp.test(release)
  );
}
