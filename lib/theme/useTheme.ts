import { useColorScheme } from 'react-native';

export const Colors = {
    light: {
        background: '#FFFFFF',
        text: '#333333',
        textSecondary: '#666666',
        border: '#DDDDDD',
        card: '#F6F7F9',
        primary: '#0066CC',
        destructive: '#FF6B6B',
        warning: '#FFC107',
        success: '#28a745',
        tabIconDefault: '#999999',
        tabIconSelected: '#0066CC',
        headerBackground: '#FFFFFF',
    },
    dark: {
        background: '#121212',
        text: '#FFFFFF',
        textSecondary: '#AAAAAA',
        border: '#333333',
        card: '#1E1E1E',
        primary: '#4DA8DA',
        destructive: '#FF6B6B',
        warning: '#FFD700',
        success: '#28a745',
        tabIconDefault: '#666666',
        tabIconSelected: '#4DA8DA',
        headerBackground: '#1E1E1E',
    },
};

export function useTheme() {
    const colorScheme = useColorScheme(); // returns 'light' or 'dark'
    const isDark = colorScheme === 'dark';
    const colors = isDark ? Colors.dark : Colors.light;

    return {
        isDark,
        colors,
    };
}
