package com.eisenhower.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import space.manus.eisenhower.priority.app.R

/**
 * Quick Task Widget Provider
 * Allows users to create tasks directly from home screen
 */
class QuickTaskWidget : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.widget_quick_task)

        // Launch QuickTaskActivity instead of a raw deep-link ACTION_VIEW intent.
        // A dedicated trampoline Activity eliminates the cold-start white/black
        // flicker that occurs when Android resolves the URI without a warm process.
        val intent = Intent(context, QuickTaskActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_button_quick_task, pendingIntent)
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}
