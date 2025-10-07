package ai.tide.app

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class TideApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // Initialize app
        initializeApp()
    }

    private fun initializeApp() {
        // Performance monitoring
        if (BuildConfig.DEBUG) {
            println("🌊 Tide App Starting (Debug)")
        } else {
            println("🌊 Tide App Starting (Release)")
        }

        // Future: Initialize crash reporting, analytics, etc.
    }
}
