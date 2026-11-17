<?php

namespace App\Enums;

enum ContractTypeEnum
{
    use Enum;

    case DI;
    case GH;
    case GHD;
}
