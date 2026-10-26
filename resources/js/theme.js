import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    direction: 'rtl',
    palette: {
        mode: 'light',
        primary: {
            main: '#0a1128',
            light: '#1c2d5a',
            dark: '#040711',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#2563eb',
            light: '#3b82f6',
            dark: '#1d4ed8',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f1f5f9',
            paper: '#ffffff',
        },
    },
    shape: {
        borderRadius: 8,
    },
    typography: {
        fontFamily: '"Vazir", system-ui, -apple-system, sans-serif',
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(90deg, #050814 0%, #0c162f 40%, #0d1935 70%, #050814 100%)',
                    borderBottom: '1px solid rgba(59, 130, 246, 0.22)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.35)',
                },
            },
        },
        MuiDialogContent: {
            styleOverrides: {
                root: {
                    // MUI zeroes the content's top padding when it follows a DialogTitle
                    // (`.MuiDialogTitle-root + &`). Restore it so the floating label of
                    // the first field isn't clipped by the content's overflow.
                    '.MuiDialogTitle-root + &': {
                        paddingTop: 20,
                    },
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    // MUI defaults this to 8px; line it up with the 24px used by
                    // DialogTitle and DialogContent.
                    padding: '12px 24px',
                },
            },
        },
    },
});

export default theme;
