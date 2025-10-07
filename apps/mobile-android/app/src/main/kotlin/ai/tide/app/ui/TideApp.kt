package ai.tide.app.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import ai.tide.app.ui.features.auth.AuthScreen
import ai.tide.app.ui.features.auth.AuthViewModel
import ai.tide.app.ui.features.chat.ChatScreen
import ai.tide.app.ui.features.email.EmailScreen
import ai.tide.app.ui.features.calendar.CalendarScreen
import ai.tide.app.ui.features.settings.SettingsScreen

@Composable
fun TideApp(
    authViewModel: AuthViewModel = hiltViewModel()
) {
    val isAuthenticated by authViewModel.isAuthenticated.collectAsState()

    if (isAuthenticated) {
        MainScreen()
    } else {
        AuthScreen()
    }
}

@Composable
fun MainScreen() {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    Scaffold(
        bottomBar = {
            NavigationBar {
                bottomNavItems.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.label) },
                        label = { Text(item.label) },
                        selected = currentDestination?.hierarchy?.any { it.route == item.route } == true,
                        onClick = {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = "chat",
            modifier = Modifier.padding(paddingValues)
        ) {
            composable("chat") { ChatScreen() }
            composable("email") { EmailScreen() }
            composable("calendar") { CalendarScreen() }
            composable("settings") { SettingsScreen() }
        }
    }
}

data class BottomNavItem(
    val route: String,
    val label: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector
)

val bottomNavItems = listOf(
    BottomNavItem("chat", "Chat", Icons.Filled.ChatBubble),
    BottomNavItem("email", "Email", Icons.Filled.Email),
    BottomNavItem("calendar", "Calendar", Icons.Filled.CalendarToday),
    BottomNavItem("settings", "Settings", Icons.Filled.Settings),
)
