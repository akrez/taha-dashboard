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
        borderColor: '#6ee7b7',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.25)',
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
                // Gradient from dark green to lighter emerald green (as requested)
                background: 'linear-gradient(90deg, #13694c 0%, #0a4f37 40%, #052c1e 75%, #021a12 100%)',
                color: '#ffffff',
                pt: { xs: 5, md: 6 },
                pb: 2.5,
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
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
                                    bgcolor: '#34d399',
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
                            فعالیت خود را بصورت حرفه‌ای در زمینه‌های : 
                            تونل انتقال آب ، سد ، نیروگاه و فضاهای زیر زمینی ، تونل های جاده ای
                            درون شهری و برون شهری ، ابنیه و عملیات سویل (ساختمان اداری ، پارکینگ ،
                            موج شکن) ، تونل و ایستگاه های مترو و راه آهن آغاز و به عنوان موفق ترین
                            موسسه اجرایی در سطح کشور شناخته شده است.
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
                                    bgcolor: '#34d399',
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
                                                  color: '#a7f3d0',
                                                  transform: 'translateX(-3px)',
                                              }
                                            : {},
                                    }}
                                >
                                    <Box
                                        sx={{
                                            color: '#6ee7b7',
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
                                        bgcolor: '#34d399',
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
                                            color: '#6ee7b7',
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
                        borderTop: '1px solid rgba(255, 255, 255, 0.15)',
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
