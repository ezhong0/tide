package ai.tide.app.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

// Tide Color Palette
val TidePrimary = Color(0xFF0066FF)
val TideSecondary = Color(0xFF00CC88)
val TideBackground = Color(0xFFFAFBFC)
val TideError = Color(0xFFFF3B30)
val TideSuccess = Color(0xFF34C759)
val TideWarning = Color(0xFFFF9500)

// Light color scheme
private val TideLightColorScheme = lightColorScheme(
    primary = TidePrimary,
    secondary = TideSecondary,
    tertiary = Color(0xFF7C4DFF),
    error = TideError,
    background = TideBackground,
    surface = Color.White,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onTertiary = Color.White,
    onError = Color.White,
    onBackground = Color(0xFF1C1C1E),
    onSurface = Color(0xFF1C1C1E),
)

// Dark color scheme
private val TideDarkColorScheme = darkColorScheme(
    primary = TidePrimary,
    secondary = TideSecondary,
    tertiary = Color(0xFF7C4DFF),
    error = TideError,
    background = Color(0xFF121212),
    surface = Color(0xFF1E1E1E),
    onPrimary = Color.White,
    onSecondary = Color.White,
    onTertiary = Color.White,
    onError = Color.White,
    onBackground = Color(0xFFE0E0E0),
    onSurface = Color(0xFFE0E0E0),
)

@Composable
fun TideTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context)
            else dynamicLightColorScheme(context)
        }

        darkTheme -> TideDarkColorScheme
        else -> TideLightColorScheme
    }

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.primary.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = TideTypography,
        content = content
    )
}
