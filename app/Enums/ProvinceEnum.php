<?php

namespace App\Enums;

/**
 * استان‌های ایران.
 *
 * عنوان فارسی هر استان از فایل ترجمه `lang/fa.json` با کلید
 * `enums.ProvinceEnum.<NAME>` خوانده می‌شود (روش `trans()`).
 */
enum ProvinceEnum
{
    use Enum;

    case ALBORZ;
    case ARDABIL;
    case AZERBAIJAN_GHARBI;
    case AZERBAIJAN_SHARGHI;
    case BUSHEHR;
    case CHAHARMAHAL_VA_BAKHTIARI;
    case ESFAHAN;
    case FARS;
    case GILAN;
    case GOLESTAN;
    case HAMEDAN;
    case HORMOZGAN;
    case ILAM;
    case KERMAN;
    case KERMANSHAH;
    case KHORASAN_JONOOBI;
    case KHORASAN_RAZAVI;
    case KHORASAN_SHOMALI;
    case KHUZESTAN;
    case KOHGILUYEH_VA_BOYER_AHMAD;
    case KORDESTAN;
    case LORESTAN;
    case MARKAZI;
    case MAZANDARAN;
    case QAZVIN;
    case QOM;
    case SEMNAN;
    case SISTAN_VA_BALUCHESTAN;
    case TEHRAN;
    case YAZD;
    case ZANJAN;
}
