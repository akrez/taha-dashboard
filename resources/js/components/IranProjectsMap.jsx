import { useState } from 'react';
import {
    Apartment as ApartmentIcon,
    CalendarToday as CalendarTodayIcon,
    CheckCircle as CheckCircleIcon,
    Engineering as EngineeringIcon,
    FiberManualRecord as LiveDotIcon,
    Insights as InsightsIcon,
    LocationOn as LocationOnIcon,
    Paid as PaidIcon,
    Place as PlaceIcon,
    TrendingUp as TrendingUpIcon,
    WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import {
    Avatar,
    Box,
    Card,
    Chip,
    Divider,
    LinearProgress,
    Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { IRAN_PROVINCES } from './iranProvincesData';

const CITY_ORDER = ['tehran', 'isfahan', 'tabriz', 'mashhad', 'shiraz'];

const CITY_PROJECTS = {
    tehran: {
        city: 'تهران',
        province: 'استان تهران',
        provinceName: 'تهران',
        point: [395, 289],
        accent: '#38bdf8',
        description: 'توسعه شبکه حمل‌ونقل ریلی و پروژه‌های عمران شهری پایتخت',
        stats: {
            total: 12,
            active: 8,
            done: 3,
            delayed: 1,
            progress: 68,
            budget: '۴٬۸۰۰',
            workforce: '۲٬۴۵۰',
        },
        projects: [
            {
                name: 'خط ۶ مترو تهران – قطعه جنوبی',
                contractor: 'شرکت کیسون',
                progress: 82,
                status: 'در حال اجرا',
            },
            {
                name: 'تقاطع غیرهمسطح بزرگراه امام علی',
                contractor: 'عمران پایتخت',
                progress: 64,
                status: 'در حال اجرا',
            },
            {
                name: 'مجتمع ایستگاهی پایانه شرق',
                contractor: 'بنا گستر',
                progress: 100,
                status: 'تکمیل شده',
            },
        ],
    },
    isfahan: {
        city: 'اصفهان',
        province: 'استان اصفهان',
        provinceName: 'اصفهان',
        point: [417, 430],
        accent: '#22d3ee',
        description: 'احیای محور تاریخی زاینده‌رود و توسعه خطوط ریلی شهری',
        stats: {
            total: 9,
            active: 5,
            done: 3,
            delayed: 1,
            progress: 61,
            budget: '۳٬۲۰۰',
            workforce: '۱٬۶۸۰',
        },
        projects: [
            {
                name: 'خط ۲ مترو اصفهان – فاز شرقی',
                contractor: 'مترو اصفهان',
                progress: 71,
                status: 'در حال اجرا',
            },
            {
                name: 'ساماندهی محور زاینده‌رود',
                contractor: 'آب و عمران زاینده',
                progress: 48,
                status: 'در حال اجرا',
            },
            {
                name: 'کتابخانه مرکزی اصفهان',
                contractor: 'معماران نقش جهان',
                progress: 100,
                status: 'تکمیل شده',
            },
        ],
    },
    tabriz: {
        city: 'تبریز',
        province: 'استان آذربایجان شرقی',
        provinceName: 'آذربایجان شرقی',
        point: [149, 158],
        accent: '#a78bfa',
        description: 'توسعه حمل‌ونقل شهری و احیای بافت تاریخی بازار تبریز',
        stats: {
            total: 7,
            active: 4,
            done: 2,
            delayed: 1,
            progress: 54,
            budget: '۲٬۴۰۰',
            workforce: '۱٬۲۴۰',
        },
        projects: [
            {
                name: 'خط ۱ مترو تبریز – توسعه شمالی',
                contractor: 'مترو تبریز',
                progress: 76,
                status: 'در حال اجرا',
            },
            {
                name: 'احیای بافت تاریخی بازار تبریز',
                contractor: 'مرمت آذر',
                progress: 58,
                status: 'در حال اجرا',
            },
            {
                name: 'پارکینگ طبقاتی مرکز شهر',
                contractor: 'عمران آذربایجان',
                progress: 100,
                status: 'تکمیل شده',
            },
        ],
    },
    mashhad: {
        city: 'مشهد',
        province: 'استان خراسان رضوی',
        provinceName: 'خراسان رضوی',
        point: [770, 258],
        accent: '#34d399',
        description: 'توسعه قطار شهری و مجموعه‌های فرهنگی – ورزشی زیارتی',
        stats: {
            total: 8,
            active: 6,
            done: 2,
            delayed: 0,
            progress: 72,
            budget: '۳٬۶۰۰',
            workforce: '۲٬۱۰۰',
        },
        projects: [
            {
                name: 'قطار شهری مشهد – خط ۳',
                contractor: 'قطار شهری مشهد',
                progress: 79,
                status: 'در حال اجرا',
            },
            {
                name: 'مجموعه ورزشی و فرهنگی ثامن',
                contractor: 'عمران توس',
                progress: 66,
                status: 'در حال اجرا',
            },
            {
                name: 'تقاطع غیرهمسطح آزادی',
                contractor: 'راه‌سازان خراسان',
                progress: 100,
                status: 'تکمیل شده',
            },
        ],
    },
    shiraz: {
        city: 'شیراز',
        province: 'استان فارس',
        provinceName: 'فارس',
        point: [460, 628],
        accent: '#fbbf24',
        description: 'توسعه خطوط مترو و زیرساخت‌های بهداشتی و درمانی فارس',
        stats: {
            total: 6,
            active: 3,
            done: 2,
            delayed: 1,
            progress: 45,
            budget: '۱٬۹۰۰',
            workforce: '۹۸۰',
        },
        projects: [
            {
                name: 'خط ۳ مترو شیراز',
                contractor: 'مترو فارس',
                progress: 52,
                status: 'در حال اجرا',
            },
            {
                name: 'ساماندهی حاشیه رودخانه خشک',
                contractor: 'آب و فاضلاب فارس',
                progress: 38,
                status: 'در حال اجرا',
            },
            {
                name: 'بیمارستان هزار تختخوابی شیراز',
                contractor: 'سازندگان پارس',
                progress: 24,
                status: 'تأخیر',
            },
        ],
    },
};

const CITY_BY_PROVINCE = Object.fromEntries(
    CITY_ORDER.map((key) => [CITY_PROJECTS[key].provinceName, key]),
);

const STATUS_META = {
    'در حال اجرا': { color: '#1d4ed8', bg: 'rgba(37, 99, 235, 0.1)' },
    'تکمیل شده': { color: '#047857', bg: 'rgba(5, 150, 105, 0.1)' },
    'تأخیر': { color: '#b45309', bg: 'rgba(217, 119, 6, 0.12)' },
};

function StatusChip({ status }) {
    const meta = STATUS_META[status] ?? STATUS_META['در حال اجرا'];

    return (
        <Chip
            label={status}
            size="small"
            sx={{
                height: 22,
                flexShrink: 0,
                bgcolor: meta.bg,
                color: meta.color,
                fontWeight: 700,
                fontSize: '0.68rem',
                '& .MuiChip-label': { px: 1 },
            }}
        />
    );
}

function StatTile({ icon, label, value, suffix, color }) {
    return (
        <Box
            sx={{
                p: 1.5,
                borderRadius: 2,
                border: '1px solid rgba(226, 232, 240, 0.9)',
                bgcolor: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                minWidth: 0,
            }}
        >
            <Box
                sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1.5,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: alpha(color, 0.11),
                    color,
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        color: '#64748b',
                        fontSize: '0.68rem',
                        lineHeight: 1.4,
                    }}
                >
                    {label}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    <Typography
                        sx={{
                            color: '#0f172a',
                            fontWeight: 800,
                            fontSize: '1.05rem',
                            lineHeight: 1.2,
                        }}
                    >
                        {value}
                    </Typography>
                    {suffix && (
                        <Typography
                            sx={{
                                color: '#64748b',
                                fontSize: '0.63rem',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {suffix}
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
}

function IranMap({ activeKey, onSelect }) {
    const [hoveredProvince, setHoveredProvince] = useState(null);
    const activeProvince = CITY_PROJECTS[activeKey].provinceName;

    return (
        <Box
            sx={{
                position: 'relative',
                overflow: 'hidden',
                height: '100%',
                minHeight: { xs: 360, md: 460 },
                p: { xs: 2, sm: 2.5 },
                display: 'flex',
                flexDirection: 'column',
                color: '#ffffff',
                background:
                    'radial-gradient(circle at 78% 16%, rgba(56, 189, 248, 0.22), transparent 34%), radial-gradient(circle at 18% 86%, rgba(37, 99, 235, 0.24), transparent 42%), linear-gradient(155deg, #060b1d 0%, #0b1533 48%, #060b1d 100%)',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                        'linear-gradient(rgba(96, 165, 250, 0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(96, 165, 250, 0.055) 1px, transparent 1px)',
                    backgroundSize: '34px 34px',
                    maskImage:
                        'radial-gradient(circle at 50% 50%, #000 0%, transparent 78%)',
                    pointerEvents: 'none',
                },
                '@keyframes mapPulse': {
                    '0%': { transform: 'scale(0.55)', opacity: 0.55 },
                    '75%': { transform: 'scale(2.2)', opacity: 0 },
                    '100%': { transform: 'scale(2.2)', opacity: 0 },
                },
                '& .map-pulse': {
                    transformBox: 'fill-box',
                    transformOrigin: 'center',
                    animation: 'mapPulse 2.6s ease-out infinite',
                    pointerEvents: 'none',
                },
                '& .map-city-label': {
                    paintOrder: 'stroke',
                    fontFamily: 'Vazir, system-ui, sans-serif',
                    pointerEvents: 'none',
                },
            }}
        >
            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 1,
                }}
            >
                <Box>
                    <Typography
                        sx={{
                            fontWeight: 800,
                            fontSize: { xs: '0.95rem', sm: '1.02rem' },
                            lineHeight: 1.35,
                        }}
                    >
                        پراکندگی پروژه‌های استانی
                    </Typography>
                    <Typography
                        sx={{
                            color: 'rgba(191, 219, 254, 0.72)',
                            fontSize: '0.7rem',
                            mt: 0.35,
                        }}
                    >
                        نقشه تعاملی – ۵ استان دارای پروژه فعال
                    </Typography>
                </Box>
                <Chip
                    icon={<PlaceIcon sx={{ fontSize: '14px !important' }} />}
                    label="نقشه تعاملی"
                    size="small"
                    sx={{
                        height: 24,
                        bgcolor: 'rgba(56, 189, 248, 0.14)',
                        color: '#7dd3fc',
                        border: '1px solid rgba(56, 189, 248, 0.3)',
                        fontWeight: 600,
                        fontSize: '0.66rem',
                        '& .MuiChip-icon': { color: '#7dd3fc' },
                    }}
                />
            </Box>

            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 0.5,
                }}
            >
                <Box
                    component="svg"
                    viewBox="0 0 1000 907"
                    role="img"
                    aria-label="نقشه تعاملی استان‌های ایران"
                    sx={{
                        display: 'block',
                        width: '100%',
                        maxWidth: 470,
                        maxHeight: { xs: 320, md: 380 },
                        height: 'auto',
                        overflow: 'visible',
                        filter: 'drop-shadow(0 12px 28px rgba(2, 6, 23, 0.55))',
                    }}
                >
                    <defs>
                        <linearGradient id="provinceActive" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#38bdf8" />
                            <stop offset="55%" stopColor="#2563eb" />
                            <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                        <linearGradient id="provinceIdle" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(148, 197, 255, 0.2)" />
                            <stop offset="100%" stopColor="rgba(96, 165, 250, 0.1)" />
                        </linearGradient>
                    </defs>

                    <g>
                        {IRAN_PROVINCES.map((province) => {
                            const projectCityKey = CITY_BY_PROVINCE[province.name];
                            const isActive = province.name === activeProvince;
                            const isHovered = province.name === hoveredProvince;
                            const hasProject = Boolean(projectCityKey);

                            let fill = 'url(#provinceIdle)';
                            let stroke = 'rgba(96, 165, 250, 0.3)';
                            let strokeWidth = 1;

                            if (hasProject) {
                                fill = 'rgba(37, 99, 235, 0.5)';
                                stroke = 'rgba(147, 197, 253, 0.7)';
                            }
                            if (isHovered && hasProject) {
                                fill = 'rgba(96, 165, 250, 0.78)';
                                stroke = '#bae6fd';
                                strokeWidth = 1.6;
                            }
                            if (isActive) {
                                fill = 'url(#provinceActive)';
                                stroke = '#7dd3fc';
                                strokeWidth = 1.8;
                            }

                            return (
                                <path
                                    key={`${province.id}-${province.nameEn}`}
                                    d={province.d}
                                    fill={fill}
                                    stroke={stroke}
                                    strokeWidth={strokeWidth}
                                    strokeLinejoin="round"
                                    style={{
                                        cursor: hasProject ? 'pointer' : 'default',
                                        transition:
                                            'fill 220ms ease, stroke 220ms ease, stroke-width 220ms ease',
                                    }}
                                    onMouseEnter={() => {
                                        setHoveredProvince(province.name);
                                        if (projectCityKey) {
                                            onSelect(projectCityKey);
                                        }
                                    }}
                                    onMouseLeave={() => setHoveredProvince(null)}
                                    onClick={() => {
                                        if (projectCityKey) {
                                            onSelect(projectCityKey);
                                        }
                                    }}
                                >
                                    <title>{province.name}</title>
                                </path>
                            );
                        })}
                    </g>

                    {CITY_ORDER.map((key) => {
                        const city = CITY_PROJECTS[key];
                        const [cx, cy] = city.point;
                        const isActive = key === activeKey;

                        return (
                            <g
                                key={key}
                                style={{ cursor: 'pointer' }}
                                onMouseEnter={() => onSelect(key)}
                                onClick={() => onSelect(key)}
                            >
                                {isActive && (
                                    <circle
                                        className="map-pulse"
                                        cx={cx}
                                        cy={cy}
                                        r={20}
                                        fill={city.accent}
                                    />
                                )}
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={isActive ? 12 : 9}
                                    fill={isActive ? city.accent : '#dbeafe'}
                                    stroke="#040711"
                                    strokeWidth={3}
                                    style={{ transition: 'r 180ms ease, fill 180ms ease' }}
                                />
                                <circle cx={cx} cy={cy} r={3.5} fill="#ffffff" />
                                <text
                                    className="map-city-label"
                                    x={cx}
                                    y={cy + (isActive ? 45 : 40)}
                                    textAnchor="middle"
                                    fontSize={isActive ? 34 : 30}
                                    fontWeight={800}
                                    fill={isActive ? '#e0f2fe' : 'rgba(224, 242, 254, 0.78)'}
                                    stroke="#040711"
                                    strokeWidth={8}
                                    strokeLinejoin="round"
                                >
                                    {city.city}
                                </text>
                            </g>
                        );
                    })}
                </Box>
            </Box>

            <Box
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.75,
                    justifyContent: 'center',
                    mt: 0.5,
                }}
            >
                {CITY_ORDER.map((key) => {
                    const city = CITY_PROJECTS[key];
                    const isActive = key === activeKey;

                    return (
                        <Chip
                            key={key}
                            label={city.city}
                            size="small"
                            onClick={() => onSelect(key)}
                            icon={
                                <LiveDotIcon
                                    sx={{
                                        fontSize: '9px !important',
                                        color: isActive ? '#7dd3fc' : 'rgba(148, 197, 255, 0.55)',
                                    }}
                                />
                            }
                            sx={{
                                height: 25,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                color: isActive ? '#e0f2fe' : 'rgba(191, 219, 254, 0.72)',
                                bgcolor: isActive
                                    ? 'rgba(56, 189, 248, 0.16)'
                                    : 'rgba(148, 197, 255, 0.07)',
                                border: isActive
                                    ? '1px solid rgba(56, 189, 248, 0.45)'
                                    : '1px solid rgba(148, 197, 255, 0.16)',
                                transition: 'all 180ms ease',
                                '&:hover': {
                                    bgcolor: 'rgba(56, 189, 248, 0.16)',
                                    color: '#e0f2fe',
                                },
                            }}
                        />
                    );
                })}
            </Box>
        </Box>
    );
}

function ProjectRow({ project, accent }) {
    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                p: { xs: 1, sm: 1.25 },
                borderRadius: 2,
                border: '1px solid rgba(226, 232, 240, 0.85)',
                bgcolor: '#f8fafc',
                transition: 'all 180ms ease',
                '&:hover': {
                    borderColor: alpha(accent, 0.45),
                    bgcolor: '#ffffff',
                    boxShadow: `0 6px 18px ${alpha(accent, 0.1)}`,
                },
            }}
        >
            <Box
                sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 1.5,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: alpha(accent, 0.1),
                    color: accent,
                }}
            >
                <EngineeringIcon sx={{ fontSize: 18 }} />
            </Box>

            <Box sx={{ flex: 1, minWidth: { xs: 140, sm: 160 } }}>
                <Typography
                    sx={{
                        color: '#0f172a',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        lineHeight: 1.45,
                    }}
                    noWrap
                >
                    {project.name}
                </Typography>
                <Typography sx={{ color: '#64748b', fontSize: '0.68rem', mt: 0.15 }}>
                    پیمانکار: {project.contractor}
                </Typography>
            </Box>

            <Box sx={{ width: { xs: 100, sm: 120 }, flexShrink: 0 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mb: 0.4,
                    }}
                >
                    <Typography sx={{ color: '#94a3b8', fontSize: '0.6rem' }}>
                        پیشرفت
                    </Typography>
                    <Typography
                        sx={{ color: '#334155', fontWeight: 700, fontSize: '0.65rem' }}
                    >
                        {project.progress}٪
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={project.progress}
                    sx={{
                        height: 5,
                        borderRadius: 3,
                        bgcolor: '#e2e8f0',
                        '& .MuiLinearProgress-bar': {
                            borderRadius: 3,
                            background:
                                project.progress === 100
                                    ? 'linear-gradient(90deg, #059669, #34d399)'
                                    : `linear-gradient(90deg, ${accent}, #38bdf8)`,
                        },
                    }}
                />
            </Box>

            <StatusChip status={project.status} />
        </Box>
    );
}

export default function IranProjectsMap() {
    const [activeKey, setActiveKey] = useState('tehran');
    const data = CITY_PROJECTS[activeKey];
    const accent = data.accent;

    return (
        <Box sx={{ px: { xs: 2, sm: 3 }, mt: 3.5 }}>
            <Card
                sx={{
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    border: '1px solid rgba(226, 232, 240, 0.85)',
                    boxShadow: '0 8px 28px rgba(15, 23, 42, 0.08)',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        left: 0,
                        height: '3px',
                        zIndex: 2,
                        background:
                            'linear-gradient(90deg, #0a1128 0%, #2563eb 50%, #38bdf8 100%)',
                    },
                }}
            >
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(0, 2fr)' },
                        alignItems: 'stretch',
                    }}
                >
                    {/* در RTL اولین ستون سمت راست قرار می‌گیرد: نقشه */}
                    <IranMap activeKey={activeKey} onSelect={setActiveKey} />

                    {/* دو سوم سمت چپ: جزئیات پروژه‌های استان انتخاب‌شده */}
                    <Box
                        key={activeKey}
                        sx={{
                            p: { xs: 2, sm: 2.5, md: 3 },
                            bgcolor: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.75,
                            minWidth: 0,
                            '@keyframes infoFade': {
                                from: { opacity: 0, transform: 'translateY(8px)' },
                                to: { opacity: 1, transform: 'translateY(0)' },
                            },
                            animation: 'infoFade 320ms ease',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 1,
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                <Avatar
                                    sx={{
                                        width: 46,
                                        height: 46,
                                        bgcolor: alpha(accent, 0.12),
                                        color: accent,
                                    }}
                                >
                                    <LocationOnIcon />
                                </Avatar>
                                <Box>
                                    <Typography
                                        sx={{
                                            color: '#0f172a',
                                            fontWeight: 800,
                                            fontSize: { xs: '1rem', sm: '1.1rem' },
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        پروژه‌های {data.city}
                                    </Typography>
                                    <Typography
                                        sx={{ color: '#64748b', fontSize: '0.73rem', mt: 0.2 }}
                                    >
                                        {data.province} • {data.stats.total} پروژه ثبت‌شده
                                    </Typography>
                                </Box>
                            </Box>
                            <Chip
                                icon={<InsightsIcon sx={{ fontSize: '15px !important' }} />}
                                label="گزارش تجمیعی"
                                size="small"
                                sx={{
                                    height: 26,
                                    bgcolor: 'rgba(37, 99, 235, 0.07)',
                                    color: '#1d4ed8',
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                    '& .MuiChip-icon': { color: '#2563eb' },
                                }}
                            />
                        </Box>

                        <Typography
                            sx={{
                                color: '#475569',
                                fontSize: '0.78rem',
                                lineHeight: 1.9,
                            }}
                        >
                            {data.description}
                        </Typography>

                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(3, minmax(0, 1fr))',
                                },
                                gap: 1,
                            }}
                        >
                            <StatTile
                                icon={<ApartmentIcon sx={{ fontSize: 19 }} />}
                                label="پروژه‌های فعال"
                                value={data.stats.active}
                                suffix={`از ${data.stats.total}`}
                                color="#2563eb"
                            />
                            <StatTile
                                icon={<TrendingUpIcon sx={{ fontSize: 19 }} />}
                                label="پیشرفت میانگین"
                                value={`${data.stats.progress}٪`}
                                color="#059669"
                            />
                            <StatTile
                                icon={<PaidIcon sx={{ fontSize: 19 }} />}
                                label="اعتبار مصوب"
                                value={data.stats.budget}
                                suffix="میلیارد تومان"
                                color="#d97706"
                            />
                        </Box>

                        <Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 0.75,
                                    gap: 1,
                                    flexWrap: 'wrap',
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: '#0f172a',
                                        fontWeight: 700,
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    پیشرفت کلی مجموعه
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.6 }}>
                                    <Chip
                                        label={`${data.stats.active} فعال`}
                                        size="small"
                                        sx={{
                                            height: 22,
                                            fontSize: '0.66rem',
                                            fontWeight: 600,
                                            bgcolor: 'rgba(37, 99, 235, 0.08)',
                                            color: '#1d4ed8',
                                        }}
                                    />
                                    <Chip
                                        icon={
                                            <CheckCircleIcon
                                                sx={{ fontSize: '12px !important' }}
                                            />
                                        }
                                        label={`${data.stats.done} تکمیل‌شده`}
                                        size="small"
                                        sx={{
                                            height: 22,
                                            fontSize: '0.66rem',
                                            fontWeight: 600,
                                            bgcolor: 'rgba(5, 150, 105, 0.09)',
                                            color: '#047857',
                                            '& .MuiChip-icon': { color: '#059669' },
                                        }}
                                    />
                                    {data.stats.delayed > 0 && (
                                        <Chip
                                            icon={
                                                <WarningAmberIcon
                                                    sx={{ fontSize: '12px !important' }}
                                                />
                                            }
                                            label={`${data.stats.delayed} تأخیر`}
                                            size="small"
                                            sx={{
                                                height: 22,
                                                fontSize: '0.66rem',
                                                fontWeight: 600,
                                                bgcolor: 'rgba(217, 119, 6, 0.1)',
                                                color: '#b45309',
                                                '& .MuiChip-icon': { color: '#d97706' },
                                            }}
                                        />
                                    )}
                                </Box>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={data.stats.progress}
                                    sx={{
                                        flex: 1,
                                        height: 9,
                                        borderRadius: 5,
                                        bgcolor: '#e2e8f0',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 5,
                                            background: `linear-gradient(90deg, ${accent}, #2563eb)`,
                                        },
                                    }}
                                />
                                <Typography
                                    sx={{
                                        color: '#0f172a',
                                        fontWeight: 800,
                                        fontSize: '0.9rem',
                                        minWidth: 40,
                                    }}
                                >
                                    {data.stats.progress}٪
                                </Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ borderColor: 'rgba(226, 232, 240, 0.9)' }} />

                        <Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 1,
                                }}
                            >
                                <Typography
                                    sx={{
                                        color: '#0f172a',
                                        fontWeight: 700,
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    پروژه‌های شاخص
                                </Typography>
                                <Typography
                                    sx={{ color: '#94a3b8', fontSize: '0.68rem' }}
                                >
                                    پیمانکار • پیشرفت • وضعیت
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {data.projects.map((project) => (
                                    <ProjectRow
                                        key={project.name}
                                        project={project}
                                        accent={accent}
                                    />
                                ))}
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                mt: 'auto',
                                pt: 0.25,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1,
                                flexWrap: 'wrap',
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                                <CalendarTodayIcon
                                    sx={{ fontSize: 13, color: '#94a3b8' }}
                                />
                                <Typography
                                    sx={{ color: '#94a3b8', fontSize: '0.66rem' }}
                                >
                                    آخرین به‌روزرسانی: آبان ۱۴۰۵
                                </Typography>
                            </Box>
                            <Typography sx={{ color: '#cbd5e1', fontSize: '0.62rem' }}>
                                داده‌های این بخش نمایشی است
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Card>
        </Box>
    );
}
