import { useTheme } from '../../contexts/ThemeContext'
import { Sun, Moon } from 'lucide-react'

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        w-12 h-6 rounded-full transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${isDark
          ? 'bg-gray-700 hover:bg-gray-600'
          : 'bg-[#e8dfc8] hover:bg-[#dcd0b0]'
        }
      `}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
    >
      {/* Toggle circle */}
      <span
        className={`
          absolute inline-block w-5 h-5 rounded-full transition-all duration-300 ease-in-out
          transform shadow-lg
          ${isDark
            ? 'translate-x-3 bg-gray-900'
            : 'translate-x-[-11px] bg-[#fdfbf5]'
          }
        `}
      >
        {/* Icon inside the circle */}
        <span className="absolute inset-0 flex items-center justify-center">
          {isDark ? (
            <Moon className="w-3 h-3 text-blue-400" />
          ) : (
            <Sun className="w-3 h-3 text-yellow-500" />
          )}
        </span>
      </span>
      
      {/* Background icons */}
      <span className="absolute left-1.5 top-1">
        <Sun className={`w-3 h-3 transition-opacity duration-300 ${isDark ? 'opacity-30 text-gray-400' : 'opacity-0'}`} />
      </span>
      <span className="absolute right-1.5 top-1">
        <Moon className={`w-3 h-3 transition-opacity duration-300 ${isDark ? 'opacity-0' : 'opacity-30 text-gray-500'}`} />
      </span>
    </button>
  )
}

export default ThemeToggle