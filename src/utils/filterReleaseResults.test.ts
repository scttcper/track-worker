import { describe, expect, it } from 'vitest';

import { filterReleaseResults } from './filterReleaseResults';

describe('filterReleaseResults', () => {
  it.each([
    'The.Lord.Of.The.Rings.The.Return.Of.The.King.2003.SUBPAX-iNCiTE',
    'L.O.T.R.RETURN.OF.THE.KING.SCAN.HiRES-QCovER',
    'LOTR.Return.Of.The.King.CUSTOM.DVD.DISKS-SaNdS',
    '24.Season.04.CUSTOM.DVD.COVERS-VoMiT',
    'The.Hitchhikers.Guide.To.The.Galaxy.RETAiL.R1.COVERS-SCaNS',
    'Ace.Combat.RETAiL.PS2.DVD.COVER-SaNdS',
    'Lock.Stock.And.Two.Smoking.Barrels.HIGH.RES.DISC.LABEL-MRCOVER',
    'HARRY.POTTER.AND.THE.SORCERERS.STONE.CUSTOM.COVER-C',
    'STEPHEN.KINGS.SHAWSHANK.REDEMPTION.-.KING.OF.HORROR.CUSTOM.NORDIC.DVD-6POiNT6',
    'Live.Free.Or.Die.Hard.2007.NFOFIX.iNTERNAL.720p.BluRay.x264-EwDp',
    'Sex.And.The.City.S02E07.The.Chicken.Dance.iNTERNAL.XviD.DVDRip-RETRO',
    'Sex.And.The.City.S03E13.Escape.From.New.York.DVDRip.XviD.iNTERNAL-RETRO',
  ])('should filter release %s', release => {
    expect(filterReleaseResults(release)).toBeFalsy();
  });
});
