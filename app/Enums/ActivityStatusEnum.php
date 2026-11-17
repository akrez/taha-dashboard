<?php

namespace App\Enums;

enum ActivityStatusEnum
{
    use Enum;

    case InProgress;
    case FinalDelivery;
    case TemporaryDelivery;
    case NotDelivered;
}
