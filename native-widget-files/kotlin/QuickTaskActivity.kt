package com.eisenhower.widget

import android.app.Activity
import android.app.AlertDialog
import android.content.ContentValues
import android.database.sqlite.SQLiteDatabase
import android.os.Bundle
import android.text.InputType
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.Toast
import java.util.UUID

/**
 * QuickTaskActivity — показывает нативный диалог добавления задачи
 * прямо поверх рабочего стола, без запуска основного приложения.
 *
 * Пишет задачу напрямую в SQLite-базу expo-sqlite (eisenhower_v2.db).
 * После сохранения (или отмены) Activity завершается, приложение не открывается.
 *
 * Атрибуты в AndroidManifest:
 *   theme="@android:style/Theme.Dialog"
 *   noHistory="true"
 *   excludeFromRecents="true"
 */
class QuickTaskActivity : Activity() {

    private val DB_NAME = "eisenhower_v2.db"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val input = EditText(this).apply {
            inputType = InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_SENTENCES
            hint = "Название задачи"
            setSingleLine(false)
            maxLines = 3
        }

        val container = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            val pad = (16 * resources.displayMetrics.density).toInt()
            setPadding(pad, pad / 2, pad, 0)
            addView(input)
        }

        AlertDialog.Builder(this)
            .setTitle("Быстрая задача")
            .setView(container)
            .setPositiveButton("Добавить") { _, _ ->
                val title = input.text.toString().trim()
                if (title.isNotEmpty()) {
                    saveTask(title)
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

    /**
     * Сохраняет задачу напрямую в SQLite-базу expo-sqlite.
     * Используем getDatabasePath() — это стандартный путь Android для хранения БД.
     */
    private fun saveTask(title: String) {
        val dbPath = getDatabasePath(DB_NAME).absolutePath
        try {
            val db = SQLiteDatabase.openOrCreateDatabase(dbPath, null)
            val now = System.currentTimeMillis()
            val id = UUID.randomUUID().toString()

            val values = ContentValues().apply {
                put("id", id)
                put("title", title)
                put("description", "")
                put("importance", 4)
                put("urgency", 4)
                put("status", "not_started")
                put("quadrant", "Q4")
                put("priorityScore", 0)
                put("sortOrder", 0)
                put("createdAt", now)
                put("updatedAt", now)
            }

            db.insertOrThrow("tasks", null, values)
            db.close()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
