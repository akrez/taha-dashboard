import { useEffect, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

const AUTOPLAY_MS = 5000;
const FADE_MS = 600;

/**
 * Auto-advancing carousel of the slides marked as visible, shown on the home
 * page for every visitor. The slides come from the single home API payload.
 */
export default function SlidesCarousel({ slides = [] }) {
    const [index, setIndex] = useState(0);

    // A timeout keyed on the current slide: changing the slide (automatically
    // or by hand) restarts the countdown, so a manual jump is never followed
    // by an immediate automatic advance.
    useEffect(() => {
        if (slides.length < 2) {
            return undefined;
        }

        const timer = setTimeout(() => {
            setIndex((current) => (current + 1) % slides.length);
        }, AUTOPLAY_MS);

        return () => clearTimeout(timer);
    }, [index, slides.length]);

    if (slides.length === 0) {
        return null;
    }

    const current = Math.min(index, slides.length - 1);

    const go = (step) => setIndex((current + step + slides.length) % slides.length);

    return (
        <Box
            sx={{
                position: 'relative',
                height: { xs: 220, sm: 300, md: 380 },
                borderRadius: 0,
                overflow: 'hidden',
                bgcolor: 'grey.900',
            }}
        >
            {slides.map((slide, slideIndex) => (
                <Box
                    key={slide.id}
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        opacity: slideIndex === current ? 1 : 0,
                        transition: `opacity ${FADE_MS}ms ease`,
                    }}
                >
                    <Box
                        component="img"
                        src={slide.image_url ?? ''}
                        alt={slide.caption}
                        sx={{
                            display: 'block',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />

                    <Box
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'flex-end',
                            pointerEvents: 'none',
                        }}
                    >
                        <Box
                            sx={{
                                width: '100%',
                                px: 3,
                                pt: 1.5,
                                pb: 4.5,
                                textAlign: 'center',
                                color: 'common.white',
                                bgcolor: 'rgba(0, 0, 0, 0.5)',
                            }}
                        >
                            <Typography variant="h6">{slide.caption}</Typography>
                            {slide.description && (
                                <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                                    {slide.description}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Box>
            ))}

            {slides.length > 1 && (
                <>
                    <IconButton
                        onClick={() => go(-1)}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: 8,
                            zIndex: 2,
                            transform: 'translateY(-50%)',
                            color: 'common.white',
                            bgcolor: 'rgba(0,0,0,0.25)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.45)' },
                        }}
                    >
                        <ChevronRight />
                    </IconButton>
                    <IconButton
                        onClick={() => go(1)}
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            right: 8,
                            zIndex: 2,
                            transform: 'translateY(-50%)',
                            color: 'common.white',
                            bgcolor: 'rgba(0,0,0,0.25)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.45)' },
                        }}
                    >
                        <ChevronLeft />
                    </IconButton>

                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 10,
                            left: '50%',
                            zIndex: 2,
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            gap: 0.75,
                        }}
                    >
                        {slides.map((slide, dotIndex) => (
                            <Box
                                key={slide.id}
                                onClick={() => setIndex(dotIndex)}
                                sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    cursor: 'pointer',
                                    bgcolor:
                                        dotIndex === current
                                            ? 'common.white'
                                            : 'rgba(255,255,255,0.5)',
                                }}
                            />
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
}
