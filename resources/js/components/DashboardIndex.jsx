import { useId } from 'react';
import { SparkLineChart } from '@mui/x-charts';
import { Link as LinkIcon } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
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

function VisitChart({ title, subtitle, labels, data, color }) {
    const gradientId = `area-grad-${useId().replace(/:/g, '')}`;
    return (
        <Card
            sx={{
                height: '100%',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderTop: `3px solid ${color}`,
                    pointerEvents: 'none',
                    zIndex: 1,
                },
            }}
        >
            <svg width="0" height="0" style={{ position: 'absolute' }}>
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.5" />
                        <stop offset="100%" stopColor={color} stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
            <Box sx={{ px: 2, pt: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {subtitle}
                </Typography>
            </Box>
            <Box sx={{ mt: 'auto', p: 0 }}>
                <SparkLineChart
                    data={data}
                    plotType="line"
                    height={120}
                    color={color}
                    area
                    curve="catmullRom"
                    showTooltip
                    showHighlight
                    valueFormatter={(v) => `${v} بازدید`}
                    xAxis={{ data: labels }}
                    sx={{ width: '100%', '& .MuiMarkElement-root': { display: 'none' } }}
                    margin={{ top: 8, right: 0, bottom: 2, left: 0 }}
                    slotProps={{ area: { fill: `url(#${gradientId})` } }}
                />
            </Box>
        </Card>
    );
}

export default function DashboardIndex() {
    // The date, visit stats and slides are fetched once by HomeIndex and shared
    // through the router outlet context.
    const { visits, slides, links, loading } = useOutletContext() ?? {};
    // The payload carries every link shown on the home page; each bar renders
    // only the ones pinned to its own position.
    const topLinks = (links ?? []).filter((link) => link.show_in_top);
    const bottomLinks = (links ?? []).filter((link) => link.show_in_bottom);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

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
                        p: 3,
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

            <Box
                sx={{
                    display: 'grid',
                    gap: 2,
                    px: { xs: 2, sm: 3 },
                    mt: 3,
                    mb: 3,
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'repeat(3, minmax(0, 1fr))',
                    },
                }}
            >
                <VisitChart
                    title="بازدید ساعتی"
                    subtitle="۲۴ ساعت اخیر"
                    labels={(visits?.hourlyChart.labels ?? []).map((h) => `${Number(h)}:00`)}
                    data={visits?.hourlyChart.data ?? []}
                    color="#1a237e"
                />
                <VisitChart
                    title="بازدید روزانه"
                    subtitle="۳۰ روز اخیر"
                    labels={(visits?.dailyChart.labels ?? []).map((d) => `روز ${Number(d)}`)}
                    data={visits?.dailyChart.data ?? []}
                    color="#3949ab"
                />
                <VisitChart
                    title="بازدید ماهانه"
                    subtitle="۱۲ ماه اخیر"
                    labels={(visits?.monthlyChart.labels ?? []).map((m) => faMonths[Number(m) - 1] ?? m)}
                    data={visits?.monthlyChart.data ?? []}
                    color="#00acc1"
                />
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
