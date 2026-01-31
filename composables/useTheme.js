export const useTheme = () => {
    const isDark = useState('theme', () => false)

    const initTheme = () => {
        if (process.client) {
            const savedTheme = localStorage.getItem('theme')
            if (savedTheme) {
                isDark.value = savedTheme === 'dark'
            } else {
                // Default to light as requested, or check system preference if needed
                // isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
                isDark.value = false
            }
        }
    }

    const toggleTheme = () => {
        isDark.value = !isDark.value
        if (process.client) {
            localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
        }
    }

    return {
        isDark,
        initTheme,
        toggleTheme
    }
}
