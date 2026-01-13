import { useTheme } from './ThemeSelection';
import Button from './Button';
import './ThemeButton.css';
import LightMode from './images/light.svg';
import DarkMode from './images/dark.svg';

const ThemeButton = () => {
    const { theme, setTheme } = useTheme();

    const isActive = (value) => theme === value;

    return (
        <div className="theme-buttons" role='theme-buttons' aria-label='Theme selector'>

            <Button
                aria-pressed={isActive('light')}
                onClick={() => setTheme('light')}
                className={isActive('light') ? 'theme-selected' : ''}
                aria-label="Switch to light theme"
            >
                <img
                    src={LightMode}>
                </img>

            </Button>
            <Button
                aria-pressed={isActive('dark')}
                onClick={() => setTheme('dark')}
                className={isActive('dark') ? 'theme-selected' : ''}
                aria-label="Switch to dark theme"
            >
                <img
                    src={DarkMode}>
                </img>
            </Button>
        </div>
    );
};

export default ThemeButton;