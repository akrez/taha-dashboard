import { Box, Typography } from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';

const railWidth = { xs: 56, sm: 60, md: 64 };
const collapsedItemWidth = { xs: 48, sm: 52, md: 56 };
const overlayWidth = { xs: 176, sm: 220, md: 248 };
const expandedItemWidth = { xs: 168, sm: 212, md: 240 };

/**
 * Vertical rail beside the slideshow. It stays collapsed to an icon strip and
 * only the hovered link expands to reveal its title. The list is centered
 * vertically and scrolls when there are too many links to fit.
 */
export default function SlideshowSidebar({ links = [] }) {
    if (links.length === 0) {
        return null;
    }

    return (
        <Box
            component="aside"
            aria-label="لینک‌های نوار کناری اسلایدشو"
            sx={{
                position: 'relative',
                zIndex: 5,
                flexShrink: 0,
                alignSelf: 'stretch',
                display: 'flex',
                minHeight: 0,
                // Only this rail is part of the layout, so the slideshow never
                // resizes. The wider scroll area below is transparent and
                // overlays the slideshow.
                width: railWidth,
                background: 'linear-gradient(180deg, #050814 0%, #0b152d 55%, #040711 100%)',
                boxShadow:
                    'inset 0 0 0 1px rgba(59, 130, 246, 0.24), 0 12px 28px rgba(3, 7, 18, 0.45)',
            }}
        >
            <Box
                sx={{
                    flexShrink: 0,
                    alignSelf: 'stretch',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0,
                    width: overlayWidth,
                    p: 0.5,
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    pointerEvents: 'none',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': {
                        display: 'none',
                    },
                }}
            >
                <Box
                    sx={{
                        flexShrink: 0,
                        width: '100%',
                        my: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 0.75,
                    }}
                >
                    {links.map((link) => (
                        <Box
                            key={link.id}
                            component="a"
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={link.title}
                            sx={{
                                pointerEvents: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                flexShrink: 0,
                                width: collapsedItemWidth,
                                minHeight: 44,
                                px: 0.5,
                                py: 0.5,
                                borderRadius: 1.5,
                                overflowX: 'hidden',
                                color: 'common.white',
                                textDecoration: 'none',
                                transition:
                                    'width 240ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms ease',
                                '&:hover, &:focus-visible': {
                                    width: expandedItemWidth,
                                    bgcolor: 'rgba(10, 23, 48, 0.98)',
                                    boxShadow:
                                        '0 8px 22px rgba(3, 7, 18, 0.5), inset 0 0 0 1px rgba(59, 130, 246, 0.45)',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    flexShrink: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 1.5,
                                    overflow: 'hidden',
                                    bgcolor: 'rgba(255, 255, 255, 0.08)',
                                }}
                            >
                                {link.file_url ? (
                                    <Box
                                        component="img"
                                        src={link.file_url}
                                        alt=""
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            p: 0.4,
                                            objectFit: 'contain',
                                        }}
                                    />
                                ) : (
                                    <LinkIcon fontSize="small" sx={{ color: '#93c5fd' }} />
                                )}
                            </Box>
                            <Typography
                                variant="body2"
                                noWrap
                                sx={{
                                    minWidth: 0,
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {link.title}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}
