import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    direction: 'rtl',
    palette: {
        mode: 'light',
        primary: {
            main: '#1a237e',
            light: '#534bae',
            dark: '#000051',
        },
        secondary: {
            main: '#0d47a1',
        },
        background: {
            default: '#f4f6f8',
            paper: '#ffffff',
        },
    },
    shape: {
        borderRadius: 8,
    },
    typography: {
        fontFamily: '"Vazirmatn", system-ui, -apple-system, sans-serif',
    },
    components: {
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
