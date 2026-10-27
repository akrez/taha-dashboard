import {
    BarChart,
    Gauge,
    gaugeClasses,
    LineChart,
    PieChart,
} from '@mui/x-charts';
import {
    AccessTime as AccessTimeIcon,
    Assessment as AssessmentIcon,
    BarChart as BarChartIcon,
    CalendarToday as CalendarTodayIcon,
    Engineering as EngineeringIcon,
    FiberManualRecord as LiveDotIcon,
    Insights as InsightsIcon,
    Link as LinkIcon,
    PieChart as PieChartIcon,
    Speed as SpeedIcon,
    Timeline as TimelineIcon,
} from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useOutletContext } from 'react-router-dom';
import SlidesCarousel from './SlidesCarousel';

const faMonths = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
];

function PremiumCard({ title, subtitle, icon, badge, kpiTotal, kpiLabel, kpiCurrent, kpiCurrentLabel, gradient, children }) {
    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 2.5,
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(226, 232, 240, 0.85)',
                transition: 'all 0.25s ease',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 24px rgba(37, 99, 235, 0.12)',
                    borderColor: 'rgba(59, 130, 246, 0.35)',
                },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    left: 0,
                    height: '3px',
                    background: gradient || 'linear-gradient(90deg, #0a1128 0%, #2563eb 50%, #38bdf8 100%)',
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    px: 2.5,
                    pt: 2.2,
                    pb: 1.2,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid rgba(241, 245, 249, 0.9)',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '8px',
                            bgcolor: 'rgba(37, 99, 235, 0.08)',
                            color: '#1d4ed8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        {icon}
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#0f172a', lineHeight: 1.3, fontSize: '0.95rem' }}>
                            {title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.73rem', display: 'block', mt: 0.25 }}>
                            {subtitle}
                        </Typography>
                    </Box>
                </Box>
                {badge && (
                    <Chip
                        label={badge}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(37, 99, 235, 0.08)',
                            color: '#1d4ed8',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            height: 22,
                        }}
                    />
                )}
            </Box>

            {/* KPI Stat Banner if provided */}
            {kpiTotal != null && (
                <Box
                    sx={{
                        px: 2.5,
                        py: 1.2,
                        bgcolor: 'rgba(248, 250, 252, 0.8)',
                        borderBottom: '1px solid rgba(226, 232, 240, 0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: 1,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75 }}>
                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500, fontSize: '0.72rem' }}>
                            {kpiLabel}:
                        </Typography>
                        <Typography variant="h6" fontWeight={700} sx={{ color: '#0a1128', fontSize: '1.05rem', lineHeight: 1 }}>
                            {kpiTotal}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.7rem' }}>
                            بازدید
                        </Typography>
                    </Box>

                    {kpiCurrent != null && (
                        <Chip
                            label={`${kpiCurrentLabel}: ${kpiCurrent}`}
                            size="small"
                            sx={{
                                bgcolor: '#e0f2fe',
                                color: '#0369a1',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: 22,
                            }}
                        />
                    )}
                </Box>
            )}

            {/* Chart Area */}
            <Box sx={{ p: 2, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {children}
            </Box>
        </Card>
    );
}

export default function DashboardIndex() {
    const { visits, slides, links, loading } = useOutletContext();

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    const topLinks = (links ?? []).filter((link) => link.show_in_top);
    const bottomLinks = (links ?? []).filter((link) => link.show_in_bottom);

    // واقعی: داده‌های آمار زنده بازدیدها از بک‌اند
    const hourlyData = visits?.hourlyChart?.data ?? [];
    const hourlyLabels = (visits?.hourlyChart?.labels ?? []).map((h) => `${Number(h)}:00`);
    const totalHourly = hourlyData.reduce((acc, v) => acc + Number(v || 0), 0);
    const currentHour = visits?.currentHourTotal ?? (hourlyData[hourlyData.length - 1] || 0);

    const dailyData = visits?.dailyChart?.data ?? [];
    const dailyLabels = (visits?.dailyChart?.labels ?? []).map((d) => `روز ${Number(d)}`);
    const totalDaily = dailyData.reduce((acc, v) => acc + Number(v || 0), 0);
    const currentDay = visits?.currentDayTotal ?? (dailyData[dailyData.length - 1] || 0);

    const monthlyData = visits?.monthlyChart?.data ?? [];
    const monthlyLabels = (visits?.monthlyChart?.labels ?? []).map((m) => faMonths[Number(m) - 1] ?? m);
    const totalMonthly = monthlyData.reduce((acc, v) => acc + Number(v || 0), 0);
    const currentYear = visits?.currentYearTotal ?? totalMonthly;
    const currentMonth = visits?.currentMonthTotal ?? (monthlyData[monthlyData.length - 1] || 0);

    return (
        <>
            <Box sx={{ position: 'relative' }}>
                <Box
                    component="img"
                    src="/banner.png"
                    alt="بنر"
                    sx={{
                        display: 'block',
                        width: '100%',
                        height: 'auto',
                        borderRadius: 0,
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        justifyContent: 'flex-start',
                        p: { xs: 1.5, sm: 2.5, md: 3 },
                        pointerEvents: 'none',
                    }}
                >
                    <Box
                        component="img"
                        src="/logo.png"
                        alt="لوگوی پروژه"
                        sx={{
                            display: 'block',
                            width: 'auto',
                            height: '100%',
                            objectFit: 'contain',
                        }}
                    />
                </Box>
            </Box>

            {topLinks.length > 0 && (
                <Box
                    component="nav"
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: { xs: 0.5, sm: 1 },
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        px: { xs: 1, sm: 3 },
                        py: 0.75,
                        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.12)',
                    }}
                >
                    {topLinks.map((link) => (
                        <Button
                            key={link.id}
                            component="a"
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="inherit"
                            sx={{
                                px: { xs: 1, sm: 1.5 },
                                py: 0.5,
                                fontSize: 18,
                                fontWeight: 600,
                                textTransform: 'none',
                                transition: 'background-color 150ms ease',
                                '&:hover': {
                                    bgcolor: (theme) =>
                                        alpha(theme.palette.common.white, 0.18),
                                },
                            }}
                        >
                            {link.title}
                        </Button>
                    ))}
                </Box>
            )}

            <SlidesCarousel slides={slides} />

            {/* عنوان بخش آمار واقعی بازدیدها */}
            <Box
                sx={{
                    px: { xs: 2, sm: 3 },
                    mt: 3.5,
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box
                        sx={{
                            width: 4,
                            height: 24,
                            borderRadius: 2,
                            bgcolor: '#1d4ed8',
                        }}
                    />
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#0a1128', fontSize: '1.15rem' }}>
                        پایش زنده ترافیک و مراجعات به سامانه
                    </Typography>
                </Box>
                <Chip
                    icon={<LiveDotIcon sx={{ fontSize: '12px !important', color: '#22c55e !important' }} />}
                    label="آمار برخط و لحظه‌ای (داده‌های واقعی سرور)"
                    size="small"
                    sx={{
                        bgcolor: 'rgba(34, 197, 94, 0.1)',
                        color: '#15803d',
                        fontWeight: 600,
                        fontSize: '0.74rem',
                        border: '1px solid rgba(34, 197, 94, 0.25)',
                    }}
                />
            </Box>

            {/* ۳ نمودار واقعی بالا با طراحی مدرن و شکیل */}
            <Box
                sx={{
                    display: 'grid',
                    gap: 2.5,
                    px: { xs: 2, sm: 3 },
                    mb: 2,
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(3, minmax(0, 1fr))',
                    },
                }}
            >
                {/* نمودار واقعی ۱: بازدید ساعتی ۲۴ ساعت اخیر */}
                <PremiumCard
                    title="پایش ساعتی مراجعات"
                    subtitle="ترافیک کاربران در ۲۴ ساعت گذشته"
                    icon={<AccessTimeIcon fontSize="small" />}
                    badge="۲۴ ساعت گذشته"
                    kpiLabel="مجموع ۲۴ ساعت"
                    kpiTotal={Number(totalHourly).toLocaleString('fa-IR')}
                    kpiCurrentLabel="ساعت جاری"
                    kpiCurrent={Number(currentHour).toLocaleString('fa-IR')}
                    gradient="linear-gradient(90deg, #0a1128 0%, #1d4ed8 100%)"
                >
                    <Box sx={{ width: '100%', height: 230 }}>
                        <BarChart
                            xAxis={[{ scaleType: 'band', data: hourlyLabels.length ? hourlyLabels : ['۰۰:۰۰'] }]}
                            series={[
                                {
                                    data: hourlyData.length ? hourlyData : [0],
                                    label: 'تعداد بازدید',
                                    color: '#1d4ed8',
                                },
                            ]}
                            height={220}
                            margin={{ top: 20, bottom: 30, left: 35, right: 10 }}
                        />
                    </Box>
                </PremiumCard>

                {/* نمودار واقعی ۲: بازدید روزانه ۳۰ روز اخیر */}
                <PremiumCard
                    title="توزیع تردد ۳۰ روز اخیر"
                    subtitle="روند فعالیت کاربران در روزهای ماه"
                    icon={<CalendarTodayIcon fontSize="small" />}
                    badge="۳۰ روز گذشته"
                    kpiLabel="مجموع ۳۰ روز"
                    kpiTotal={Number(totalDaily).toLocaleString('fa-IR')}
                    kpiCurrentLabel="امروز"
                    kpiCurrent={Number(currentDay).toLocaleString('fa-IR')}
                    gradient="linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%)"
                >
                    <Box sx={{ width: '100%', height: 230 }}>
                        <BarChart
                            xAxis={[{ scaleType: 'band', data: dailyLabels.length ? dailyLabels : ['روز ۱'] }]}
                            series={[
                                {
                                    data: dailyData.length ? dailyData : [0],
                                    label: 'بازدید روزانه',
                                    color: '#2563eb',
                                },
                            ]}
                            height={220}
                            margin={{ top: 20, bottom: 30, left: 35, right: 10 }}
                        />
                    </Box>
                </PremiumCard>

                {/* نمودار واقعی ۳: عملکرد ماهانه ۱۲ ماه سال جاری */}
                <PremiumCard
                    title="روند بازدیدهای ماهانه"
                    subtitle="ترافیک تجمعی در ۱۲ ماه سال جاری"
                    icon={<InsightsIcon fontSize="small" />}
                    badge="سال جاری"
                    kpiLabel="کل سال"
                    kpiTotal={Number(currentYear).toLocaleString('fa-IR')}
                    kpiCurrentLabel="ماه جاری"
                    kpiCurrent={Number(currentMonth).toLocaleString('fa-IR')}
                    gradient="linear-gradient(90deg, #2563eb 0%, #0284c7 100%)"
                >
                    <Box sx={{ width: '100%', height: 230 }}>
                        <BarChart
                            xAxis={[{ scaleType: 'band', data: monthlyLabels.length ? monthlyLabels : ['فروردین'] }]}
                            series={[
                                {
                                    data: monthlyData.length ? monthlyData : [0],
                                    label: 'بازدید ماهانه',
                                    color: '#0284c7',
                                },
                            ]}
                            height={220}
                            margin={{ top: 20, bottom: 30, left: 35, right: 10 }}
                        />
                    </Box>
                </PremiumCard>
            </Box>

            {/* عنوان بخش داشبورد مدیریتی و شاخص‌های کلیدی عملکرد (۶ نمودار ارائه) */}
            <Box
                sx={{
                    px: { xs: 2, sm: 3 },
                    mt: 4,
                    mb: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 1.5,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <Box
                        sx={{
                            width: 4,
                            height: 24,
                            borderRadius: 2,
                            bgcolor: '#2563eb',
                        }}
                    />
                    <Typography variant="h6" fontWeight={700} sx={{ color: '#0a1128', fontSize: '1.15rem' }}>
                        داشبورد مدیریتی و تحلیل شاخص‌های عملکرد (KPI)
                    </Typography>
                </Box>
                <Chip
                    label="آمار و شاخص‌های تحلیلی پروژه‌ها"
                    size="small"
                    sx={{
                        bgcolor: '#0a1128',
                        color: '#ffffff',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        px: 0.5,
                    }}
                />
            </Box>

            {/* شبکه ۶ نمودار ارائه */}
            <Box
                sx={{
                    display: 'grid',
                    gap: 2.5,
                    px: { xs: 2, sm: 3 },
                    mb: 4,
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(2, minmax(0, 1fr))',
                        lg: 'repeat(3, minmax(0, 1fr))',
                    },
                }}
            >
                {/* نمودار ۱: پیشرفت فیزیکی پروژه‌ها (BarChart) */}
                <PremiumCard
                    title="پیشرفت فیزیکی پروژه‌ها"
                    subtitle="مقایسه درصد پیشرفت واقعی با برنامه مصوب"
                    icon={<EngineeringIcon fontSize="small" />}
                    badge="۵ پروژه فعال"
                >
                    <Box sx={{ width: '100%', height: 280 }}>
                        <BarChart
                            xAxis={[{ scaleType: 'band', data: ['خط ۷ مترو', 'تونل انتقال', 'میدان کتاب', 'سد مخزنی', 'خط ۳ مترو'] }]}
                            series={[
                                { data: [88, 74, 92, 65, 81], label: 'پیشرفت واقعی (٪)', color: '#1d4ed8' },
                                { data: [92, 80, 95, 70, 85], label: 'برنامه مصوب (٪)', color: '#93c5fd' },
                            ]}
                            height={270}
                            margin={{ top: 25, bottom: 35, left: 35, right: 10 }}
                        />
                    </Box>
                </PremiumCard>

                {/* نمودار ۲: روند ماهانه مصالح و عملیات اجرایی (LineChart با Area) */}
                <PremiumCard
                    title="عملیات بتن‌ریزی و خاکبرداری"
                    subtitle="روند اجرایی ۶ ماه اخیر پروژه‌ها (هزار مترمکعب)"
                    icon={<TimelineIcon fontSize="small" />}
                    badge="شش ماهه ۱۴۰۴"
                >
                    <Box sx={{ width: '100%', height: 280 }}>
                        <LineChart
                            xAxis={[{ scaleType: 'point', data: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'] }]}
                            series={[
                                { data: [4.2, 5.1, 6.8, 6.3, 7.9, 8.6], label: 'بتن‌ریزی (k m³)', color: '#2563eb', area: true },
                                { data: [7.5, 8.4, 9.6, 9.1, 11.2, 12.5], label: 'حفاری و خاکبرداری', color: '#38bdf8' },
                            ]}
                            height={270}
                            margin={{ top: 25, bottom: 35, left: 40, right: 15 }}
                        />
                    </Box>
                </PremiumCard>

                {/* نمودار ۳: توزیع تخصص‌های مهندسی (Donut PieChart) */}
                <PremiumCard
                    title="تفکیک حوزه‌های مهندسی"
                    subtitle="توزیع پروژه‌ها بر اساس دپارتمان‌های تخصصی"
                    icon={<PieChartIcon fontSize="small" />}
                    badge="۱۰۰٪ منابع"
                >
                    <Box sx={{ width: '100%', height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PieChart
                            series={[
                                {
                                    data: [
                                        { id: 0, value: 34, label: 'سازه و سیویل (۳۴٪)', color: '#0a1128' },
                                        { id: 1, value: 24, label: 'تاسیسات و برق (۲۴٪)', color: '#1d4ed8' },
                                        { id: 2, value: 20, label: 'ژئوتکنیک (۲۰٪)', color: '#2563eb' },
                                        { id: 3, value: 14, label: 'نقشه‌برداری (۱۴٪)', color: '#0284c7' },
                                        { id: 4, value: 8, label: 'کنترل کیفیت (۸٪)', color: '#38bdf8' },
                                    ],
                                    innerRadius: 50,
                                    outerRadius: 95,
                                    paddingAngle: 3,
                                    cornerRadius: 4,
                                    cx: 110,
                                },
                            ]}
                            height={260}
                        />
                    </Box>
                </PremiumCard>

                {/* نمودار ۴: شاخص‌های کلیدی راندمان و ایمنی (Dual Gauge) */}
                <PremiumCard
                    title="شاخص‌های راندمان و ایمنی (KPI)"
                    subtitle="ضریب تحقق برنامه و ضریب ایمنی کارگاه‌ها"
                    icon={<SpeedIcon fontSize="small" />}
                    badge="تایید HSE"
                >
                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: 1 }}>
                        <Box sx={{ textAlign: 'center' }}>
                            <Gauge
                                value={86}
                                startAngle={-110}
                                endAngle={110}
                                height={150}
                                width={140}
                                sx={{
                                    [`& .${gaugeClasses.valueText}`]: {
                                        fontSize: 22,
                                        fontWeight: 700,
                                        fill: '#0a1128',
                                    },
                                    [`& .${gaugeClasses.valueArc}`]: {
                                        fill: '#2563eb',
                                    },
                                    [`& .${gaugeClasses.referenceArc}`]: {
                                        fill: '#e2e8f0',
                                    },
                                }}
                                text={({ value }) => `${value}٪`}
                            />
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#1e293b', mt: -1.5 }}>
                                تحقق راندمان ماهانه
                            </Typography>
                            <Chip
                                label="وضعیت مطلوب (A+)"
                                size="small"
                                sx={{ bgcolor: '#dbeafe', color: '#1e40af', fontSize: '0.68rem', height: 20, mt: 0.75 }}
                            />
                        </Box>
                        <Box sx={{ textAlign: 'center' }}>
                            <Gauge
                                value={98}
                                startAngle={-110}
                                endAngle={110}
                                height={150}
                                width={140}
                                sx={{
                                    [`& .${gaugeClasses.valueText}`]: {
                                        fontSize: 22,
                                        fontWeight: 700,
                                        fill: '#0a1128',
                                    },
                                    [`& .${gaugeClasses.valueArc}`]: {
                                        fill: '#10b981',
                                    },
                                    [`& .${gaugeClasses.referenceArc}`]: {
                                        fill: '#e2e8f0',
                                    },
                                }}
                                text={({ value }) => `${value}٪`}
                            />
                            <Typography variant="body2" fontWeight={600} sx={{ color: '#1e293b', mt: -1.5 }}>
                                ضریب ایمنی و HSE
                            </Typography>
                            <Chip
                                label="بدون حادثه فردی"
                                size="small"
                                sx={{ bgcolor: '#dcfce7', color: '#15803d', fontSize: '0.68rem', height: 20, mt: 0.75 }}
                            />
                        </Box>
                    </Box>
                </PremiumCard>

                {/* نمودار ۵: شیفت‌های کاری ماشین‌آلات سنگین (Stacked BarChart) */}
                <PremiumCard
                    title="کارکرد ماشین‌آلات و شیفت‌ها"
                    subtitle="تفکیک ساعات کارکرد شیفت روز و شب در هفته"
                    icon={<BarChartIcon fontSize="small" />}
                    badge="مجموع شیفت‌ها"
                >
                    <Box sx={{ width: '100%', height: 280 }}>
                        <BarChart
                            xAxis={[{ scaleType: 'band', data: ['شنبه', '۱شنبه', '۲شنبه', '۳شنبه', '۴شنبه', '۵شنبه'] }]}
                            series={[
                                { data: [85, 92, 88, 95, 90, 60], label: 'شیفت روز (ساعت)', stack: 'shift', color: '#1e3a8a' },
                                { data: [65, 70, 75, 72, 68, 40], label: 'شیفت شب (ساعت)', stack: 'shift', color: '#60a5fa' },
                            ]}
                            height={270}
                            margin={{ top: 25, bottom: 35, left: 35, right: 10 }}
                        />
                    </Box>
                </PremiumCard>

                {/* نمودار ۶: تبادل مدارک فنی و ترافیک هفتگی (Smooth Curve LineChart) */}
                <PremiumCard
                    title="تبادل مستندات و نقشه‌ها"
                    subtitle="ترافیک دانلود مدارک فنی و اسناد پیمان"
                    icon={<AssessmentIcon fontSize="small" />}
                    badge="۷ روز گذشته"
                >
                    <Box sx={{ width: '100%', height: 280 }}>
                        <LineChart
                            xAxis={[{ scaleType: 'point', data: ['شنبه', '۱شنبه', '۲شنبه', '۳شنبه', '۴شنبه', '۵شنبه', 'جمعه'] }]}
                            series={[
                                { data: [420, 580, 690, 650, 720, 480, 260], label: 'دانلود نقشه و مدارک', color: '#0a1128', curve: 'catmullRom' },
                                { data: [850, 1120, 1340, 1280, 1410, 920, 510], label: 'ترافیک سامانه (نفر)', color: '#2563eb', curve: 'catmullRom', area: true },
                            ]}
                            height={270}
                            margin={{ top: 25, bottom: 35, left: 40, right: 15 }}
                        />
                    </Box>
                </PremiumCard>
            </Box>

            {bottomLinks.length > 0 && (
                <Box
                    sx={{
                        display: 'grid',
                        gap: 2,
                        px: { xs: 2, sm: 3 },
                        mb: 3,
                        gridTemplateColumns: {
                            xs: 'repeat(3, minmax(0, 1fr))',
                            sm: 'repeat(4, minmax(0, 1fr))',
                            md: 'repeat(6, minmax(0, 1fr))',
                            xl: 'repeat(12, minmax(0, 1fr))',
                        },
                    }}
                >
                    {bottomLinks.map((link) => (
                        <Card
                            key={link.id}
                            component="a"
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            elevation={0}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                overflow: 'hidden',
                                textDecoration: 'none',
                                color: 'text.primary',
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'transform 150ms ease, box-shadow 150ms ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: 3,
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    aspectRatio: '1 / 1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'action.hover',
                                    backgroundImage: link.file_url
                                        ? `url(${link.file_url})`
                                        : 'none',
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            >
                                {!link.file_url && <LinkIcon color="disabled" />}
                            </Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    p: 1,
                                    fontWeight: 700,
                                    textAlign: 'center',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {link.title}
                            </Typography>
                        </Card>
                    ))}
                </Box>
            )}
        </>
    );
}
