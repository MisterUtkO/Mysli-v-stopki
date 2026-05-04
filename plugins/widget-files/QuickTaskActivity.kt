package space.manus.eisenhower.priority.app.t20260205144419.widget

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle

/**
 * Transparent trampoline Activity launched by the home screen widget.
 *
 * Using a real Activity as the PendingIntent target instead of a deep-link
 * ACTION_VIEW intent eliminates the cold-start white/black flicker that occurs
 * when Android has to resolve the URI and start the main process from scratch.
 *
 * Attributes set in AndroidManifest:
 *   theme="@android:style/Theme.Translucent.NoTitleBar"
 *   noHistory="true"
 *   excludeFromRecents="true"
 */
class QuickTaskActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Forward to the main app via deep link so Expo Router can handle routing
        val deepLinkIntent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse("eisenhower://quick-task")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or
                    Intent.FLAG_ACTIVITY_CLEAR_TOP or
                    Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        startActivity(deepLinkIntent)
        finish()
    }
}
