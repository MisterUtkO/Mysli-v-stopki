package space.manus.eisenhower.priority.app.t20260205144419.widget

import android.app.Activity
import android.app.AlertDialog
import android.content.ContentValues
import android.database.sqlite.SQLiteDatabase
import android.os.Bundle
import android.view.Gravity
import android.view.WindowManager
import android.widget.*
import java.util.UUID

/**
 * Native dialog Activity launched by the home screen widget.
 * Shows a simple input dialog, saves the task directly to SQLite,
 * then finishes without ever showing the main Expo/RN app.
 *
 * Theme in AndroidManifest: Theme.Dialog (or Theme.Translucent.NoTitleBar)
 * noHistory="true", excludeFromRecents="true"
 */
class QuickTaskActivity : Activity() {

    private val DB_NAME = "eisenhower_v2.db"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Make window float as dialog
        window.setGravity(Gravity.CENTER)
        window.setLayout(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT
        )

        showQuickTaskDialog()
    }

    private fun showQuickTaskDialog() {
        val input = EditText(this).apply {
            hint = "Описание задачи"
            setPadding(48, 24, 48, 24)
            minLines = 2
            maxLines = 5
        }

        AlertDialog.Builder(this)
            .setTitle("Быстрая задача")
            .setView(input)
            .setPositiveButton("Добавить") { _, _ ->
                val text = input.text.toString().trim()
                if (text.isNotEmpty()) {
                    saveTask(text)
                    Toast.makeText(this, "Задача добавлена", Toast.LENGTH_SHORT).show()
                }
                finish()
            }
            .setNegativeButton("Отмена") { _, _ ->
                finish()
            }
            .setOnCancelListener {
                finish()
            }
            .show()
    }

    private fun saveTask(description: String) {
        try {
            // expo-sqlite stores DB in app's standard database dir
            val dbPath = getDatabasePath(DB_NAME).absolutePath
            val db = SQLiteDatabase.openDatabase(
                dbPath,
                null,
                SQLiteDatabase.OPEN_READWRITE
            )

            val now = System.currentTimeMillis()
            val id = "task_${now}_${(Math.random() * 1000000).toLong()}"

            // Default values: importance=4, urgency=4 -> Q1 borderline
            // priorityScore = ((3/6 + 3/6) / 2) * 100 = 50
            val values = ContentValues().apply {
                put("id", id)
                put("title", description.take(50))
                put("description", description)
                put("importance", 4)
                put("urgency", 4)
                put("status", "not_started")
                put("quadrant", "Q1")
                put("priorityScore", 50)
                put("createdAt", now)
                put("updatedAt", now)
            }

            db.insert("tasks", null, values)
            db.close()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
