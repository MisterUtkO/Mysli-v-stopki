package expo.homewidget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.RemoteViews
import expo.homewidget.R

/**
 * Home Screen Widget Provider for Eisenhower Priority App
 * Provides quick access to create tasks, view matrix, and view kanban board
 */
class HomeWidgetProvider : AppWidgetProvider() {

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
        // Create RemoteViews for the widget layout
        val views = RemoteViews(context.packageName, R.layout.widget_layout)

        // Get the package name and scheme for deep links
        val packageName = context.packageName
        val scheme = "manus20260205144419" // From app.config.ts

        // Create Task Button
        val createTaskIntent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse("$scheme://create-task")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val createTaskPendingIntent = PendingIntent.getActivity(
            context,
            0,
            createTaskIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_create_task_btn, createTaskPendingIntent)

        // View Matrix Button
        val viewMatrixIntent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse("$scheme://matrix")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val viewMatrixPendingIntent = PendingIntent.getActivity(
            context,
            1,
            viewMatrixIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_view_matrix_btn, viewMatrixPendingIntent)

        // View Kanban Button
        val viewKanbanIntent = Intent(Intent.ACTION_VIEW).apply {
            data = Uri.parse("$scheme://kanban")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val viewKanbanPendingIntent = PendingIntent.getActivity(
            context,
            2,
            viewKanbanIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_view_kanban_btn, viewKanbanPendingIntent)

        // Update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}
