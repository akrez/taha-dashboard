import {
    Box,
    Button,
    Container,
    Typography,
} from '@mui/material';
import {
    HomeWork as HomeWorkIcon,
    Mail as MailIcon,
    Phone as PhoneIcon,
    AlternateEmail as AlternateEmailIcon,
    Print as PrintIcon,
    Login as LoginIcon,
    LogoutOutlined,
} from '@mui/icons-material';
import { logout } from '../auth';

const authButtonSx = {
    bgcolor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.35)',
    color: '#ffffff',
    px: 3.5,
    py: 0.85,
    borderRadius: '8px',
    backdropFilter: 'blur(8px)',
    fontSize: '0.9rem',
    fontWeight: 600,
    textTransform: 'none',
    width: { xs: '100%', sm: 'auto' },
    minWidth: 160,
    transition: 'all 0.25s ease',
    '&:hover': {
        bgcolor: 'rgba(255, 255, 255, 0.22)',
        borderColor: '#38bdf8',
        boxShadow: '0 4px 18px rgba(37, 99, 235, 0.35)',
        transform: 'translateY(-2px)',
    },
};

export default function Footer({ visits, authenticated = false }) {
    // Visit stats arrive with the single home API payload.
    const visitTotal =
        visits?.currentYearTotal != null
            ? Number(visits.currentYearTotal).toLocaleString('fa-IR')
            : null;

    const contactItems = [
        {
            icon: <HomeWorkIcon sx={{ fontSize: 20 }} />,
            text: 'تهران ، بزرگراه بسیج ، بلوار شهیدان سرباز ، ضلع جنوبی ورزشگاه تختی ، خیابان شهید تجاره ، ...',
            multiline: true,
        },
        {
            icon: <MailIcon sx={{ fontSize: 20 }} />,
            text: '۱۷۵۵۸-۱۳۳۱۱',
            isLtr: false,
        },
        {
            icon: <PhoneIcon sx={{ fontSize: 20 }} />,
            text: '۰۲۱-۳۳۲۳۰۵۰۰',
            href: 'tel:02133230500',
            isLtr: false,
        },
        {
            icon: <AlternateEmailIcon sx={{ fontSize: 20 }} />,
            text: 'hara@shrud.ir',
            href: 'mailto:hara@shrud.ir',
            isLtr: true,
        },
        {
            icon: <PrintIcon sx={{ fontSize: 20 }} />,
            text: '۰۲۱-۳۳۲۳۰۵۳۷',
            href: 'tel:02133230537',
            isLtr: false,
        },
    ];

    return (
        <Box
            component="footer"
            sx={{
                width: '100%',
                position: 'relative',
                overflow: 'hidden',
                // Rich Blue-Black gradient with subtle blue glow
                background: 'linear-gradient(90deg, #050814 0%, #0b152d 35%, #0d1935 65%, #040711 100%)',
                color: '#ffffff',
                pt: { xs: 5, md: 6 },
                pb: 2.5,
                borderTop: '1px solid rgba(59, 130, 246, 0.25)',
                boxShadow: '0 -4px 25px rgba(3, 7, 18, 0.6)',
            }}
        >
            <Container maxWidth="xl" sx={{ px: { xs: 2.5, sm: 4, md: 6 } }}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'stretch', md: 'flex-start' },
                        gap: { xs: 4, md: 5 },
                    }}
                >
                    {/* ستون اول: درباره موسسه (Right column in RTL) */}
                    <Box sx={{ flex: { md: 5 }, minWidth: 0 }}>
                        <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                                fontWeight: 700,
                                fontSize: '1.15rem',
                                color: '#ffffff',
                                mb: 2.2,
                                display: 'inline-block',
                                position: 'relative',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: -6,
                                    right: 0,
                                    width: 32,
                                    height: 3,
                                    borderRadius: 2,
                                    bgcolor: '#38bdf8',
                                },
                            }}
                        >
                            درباره مهندسین مشاور
                        </Typography>

                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255, 255, 255, 0.85)',
                                lineHeight: 2.1,
                                textAlign: 'justify',
                                fontSize: '0.875rem',
                                fontWeight: 400,
                            }}
                        >
                            خدمات مهندسی جهت مطالعه، طراحی، نظارت فنی بر عملیات اجرایی در زمینه: انجام طرح های مهندسی آب شامل سدسازی، تاسیسات آب و فاضلاب، شبکه های آبیاری و زهکش ،خطوط انتقال و تصویه خانه آب 2 نقشه برداری شامل: نقشه برداری زمینی، هیدروگرافی، فتوگرامتری و میکروژیودزی 3 سدسازی و نیروگاه های برق آبی4 پایدارسازی سازه ها و تاسیسات زیربنایی در برابر زلزله و علاج بخشی سازه ها 5 تولید و توزیع و انتقال نیرو 6 خطوط انتقال نفت و گاز 7 مطالعات زیست محیطی
                        </Typography>
                    </Box>

                    {/* ستون دوم: ارتباط با ما (Center column in RTL) */}
                    <Box sx={{ flex: { md: 5 }, minWidth: 0 }}>
                        <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                                fontWeight: 700,
                                fontSize: '1.15rem',
                                color: '#ffffff',
                                mb: 2.2,
                                display: 'inline-block',
                                position: 'relative',
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    bottom: -6,
                                    right: 0,
                                    width: 32,
                                    height: 3,
                                    borderRadius: 2,
                                    bgcolor: '#38bdf8',
                                },
                            }}
                        >
                            ارتباط با ما
                        </Typography>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.6 }}>
                            {contactItems.map((item, index) => (
                                <Box
                                    key={index}
                                    component={item.href ? 'a' : 'div'}
                                    href={item.href}
                                    sx={{
                                        display: 'flex',
                                        alignItems: item.multiline ? 'flex-start' : 'center',
                                        gap: 1.5,
                                        color: 'rgba(255, 255, 255, 0.88)',
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease',
                                        '&:hover': item.href
                                            ? {
                                                color: '#93c5fd',
                                                transform: 'translateX(-3px)',
                                            }
                                            : {},
                                    }}
                                >
                                    <Box
                                        sx={{
                                            color: '#60a5fa',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            mt: item.multiline ? 0.4 : 0,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {item.icon}
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        dir={item.isLtr ? 'ltr' : 'rtl'}
                                        sx={{
                                            fontSize: '0.875rem',
                                            lineHeight: 1.7,
                                        }}
                                    >
                                        {item.text}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* ستون سوم: اطلاعات بازدیدکننده (Left column in RTL) */}
                    <Box
                        sx={{
                            flex: { md: 3 },
                            minWidth: 0,
                            position: 'relative',
                            minHeight: 180,
                        }}
                    >
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography
                                variant="h6"
                                component="h3"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '1.15rem',
                                    color: '#ffffff',
                                    mb: 2.2,
                                    display: 'inline-block',
                                    position: 'relative',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        bottom: -6,
                                        right: 0,
                                        width: 32,
                                        height: 3,
                                        borderRadius: 2,
                                        bgcolor: '#38bdf8',
                                    },
                                }}
                            >
                                اطلاعات بازدیدکننده
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 3 }}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'rgba(255, 255, 255, 0.88)',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    بازدیدهای سال جاری :{' '}
                                    <Box
                                        component="span"
                                        sx={{
                                            fontWeight: 700,
                                            color: '#38bdf8',
                                            display: 'inline-block',
                                        }}
                                    >
                                        {visitTotal ?? '—'}
                                    </Box>
                                </Typography>
                            </Box>

                            <Typography
                                variant="subtitle2"
                                sx={{
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    fontSize: '0.95rem',
                                    mb: 1.5,
                                }}
                            >
                                {authenticated ? 'خروج از سیستم' : 'ورود به سیستم'}
                            </Typography>

                            {authenticated ? (
                                <Button
                                    variant="outlined"
                                    onClick={logout}
                                    startIcon={<LogoutOutlined />}
                                    sx={authButtonSx}
                                >
                                    خروج
                                </Button>
                            ) : (
                                <Button
                                    variant="outlined"
                                    component="a"
                                    href="/login"
                                    startIcon={<LoginIcon sx={{ transform: 'scaleX(-1)' }} />}
                                    sx={authButtonSx}
                                >
                                    ورود
                                </Button>
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* زیر این سه تا ستون، نوشته دقیقا مانند شکل */}
                <Box
                    sx={{
                        mt: { xs: 4, md: 5 },
                        pt: 2.5,
                        borderTop: '1px solid rgba(59, 130, 246, 0.2)',
                        textAlign: 'center',
                    }}
                >
                    {/* نام مدیریت فناوری اطلاعات و ارتباطات + کپی رایت، به هم چسبیده و وسط‌چین */}
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.82)',
                            fontSize: { xs: '0.78rem', sm: '0.875rem' },
                            fontWeight: 500,
                            display: 'block',
                            textAlign: 'center',
                        }}
                    >
                        مدیریت فناوری اطلاعات و ارتباطات &copy;1404 - 1405
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
