<?php

namespace App\Enums;

enum PermissionEnum
{
    use Enum;

    case VisitIndex;
    case Slide;
    case Link;
    case UserIndex;
    case UserManager;
}
