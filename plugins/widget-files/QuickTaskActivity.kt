package space.manus.eisenhower.priority.app.t20260205144419.widget

import android.app.Activity
import android.content.ContentValues
import android.database.sqlite.SQLiteDatabase
import android.graphics.Color
import android.graphics.Typeface
import android.os.Bundle
import android.text.InputType
import android.view.Gravity
import android.view.WindowManager
import android.widget.*
import java.io.File

/**
 * QuickTaskActivity — нативный диалог быстрого добавления задачи.
 *
 * Полностью повторяет функционал экрана quick-task в приложении:
 * - поле названия
 * - SeekBar важности (1–7)
 * - SeekBar срочности (1–7)
 *
 * Пишет напрямую в expo-sqlite БД (filesDir/SQLite/eisenhower_v2.db).
 * Не запускает основное приложение.
 */
class QuickTaskActivity : Activity() {

    private val DB_NAME = "eisenhower_v2.db"
    private var importance = 5
    private var urgency = 5

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Настройка окна как диалог
        window.setGravity(Gravity.CENTER)
        window.setLayout(
            (resources.displayMetrics.widthPixels * 0.92).toInt(),
            WindowManager.LayoutParams.WRAP_CONTENT
        )

        val dp = resources.displayMetrics.density
        val pad16 = (16 * dp).toInt()
        val pad8 = (8 * dp).toInt()
        val pad12 = (12 * dp).toInt()

        // Корневой layout
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(pad16, pad16, pad16, pad12)
        }

        // Заголовок
        val title = TextView(this).apply {
            text = "Быстрая задача"
            textSize = 18f
            setTypeface(null, Typeface.BOLD)
            gravity = Gravity.CENTER
            setPadding(0, 0, 0, pad12)
        }
        root.addView(title)

        // Лейбл названия
        val labelTitle = TextView(this).apply {
            text = "Название"
            textSize = 13f
            setTextColor(Color.GRAY)
            setPadding(0, 0, 0, pad8 / 2)
        }
        root.addView(labelTitle)

        // Поле ввода
        val input = EditText(this).apply {
            inputType = InputType.TYPE_CLASS_TEXT or
                    InputType.TYPE_TEXT_FLAG_CAP_SENTENCES or
                    InputType.TYPE_TEXT_FLAG_MULTI_LINE
            hint = "Что нужно сделать?"
            maxLines = 3
            isSingleLine = false
            filters = arrayOf(android.text.InputFilter.LengthFilter(100))
            setPadding(pad12, pad8, pad12, pad8)
            background = android.graphics.drawable.GradientDrawable().apply {
                setColor(Color.parseColor("#F5F5F5"))
                cornerRadius = (8 * dp)
            }
        }
        root.addView(input)

        // SeekBar важности
        root.addView(makeSpacer(pad12))
        val importanceLabel = TextView(this).apply {
            text = "🎯 Важность: 5/7"
            textSize = 13f
            setPadding(0, 0, 0, pad8 / 2)
        }
        root.addView(importanceLabel)

        val importanceBar = SeekBar(this).apply {
            max = 6  // 0..6 = 1..7
            progress = 4  // дефолт 5
            setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(sb: SeekBar, p: Int, fromUser: Boolean) {
                    importance = p + 1
                    importanceLabel.text = "🎯 Важность: $importance/7"
                }
                override fun onStartTrackingTouch(sb: SeekBar) {}
                override fun onStopTrackingTouch(sb: SeekBar) {}
            })
        }
        root.addView(importanceBar)

        // SeekBar срочности
        root.addView(makeSpacer(pad8))
        val urgencyLabel = TextView(this).apply {
            text = "⏰ Срочность: 5/7"
            textSize = 13f
            setPadding(0, 0, 0, pad8 / 2)
        }
        root.addView(urgencyLabel)

        val urgencyBar = SeekBar(this).apply {
            max = 6
            progress = 4
            setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
                override fun onProgressChanged(sb: SeekBar, p: Int, fromUser: Boolean) {
                    urgency = p + 1
                    urgencyLabel.text = "⏰ Срочность: $urgency/7"
                }
                override fun onStartTrackingTouch(sb: SeekBar) {}
                override fun onStopTrackingTouch(sb: SeekBar) {}
            })
        }
        root.addView(urgencyBar)

        // Кнопки
        root.addView(makeSpacer(pad16))
        val btnRow = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.END
        }

        val btnCancel = Button(this).apply {
            text = "Отмена"
            setTextColor(Color.GRAY)
            background = null
            setOnClickListener { finish() }
        }

        val btnCreate = Button(this).apply {
            text = "Создать"
            setTextColor(Color.WHITE)
            background = android.graphics.drawable.GradientDrawable().apply {
                setColor(Color.parseColor("#6366F1"))
                cornerRadius = (8 * dp)
            }
            setPadding(pad16, pad8, pad16, pad8)
            setOnClickListener {
                val taskTitle = input.text.toString().trim()
                if (taskTitle.isEmpty()) {
                    Toast.makeText(this@QuickTaskActivity,
                        "Введите название задачи", Toast.LENGTH_SHORT).show()
                    return@setOnClickListener
                }
                saveTask(taskTitle, importance, urgency)
                Toast.makeText(this@QuickTaskActivity,
                    "✅ Задача добавлена", Toast.LENGTH_SHORT).show()
                finish()
            }
        }

        btnRow.addView(btnCancel)
        btnRow.addView(makeSpacer(pad8, horizontal = true))
        btnRow.addView(btnCreate)
        root.addView(btnRow)

        setContentView(root)
    }

    private fun makeSpacer(size: Int, horizontal: Boolean = false): android.view.View {
        return android.view.View(this).apply {
            layoutParams = if (horizontal)
                LinearLayout.LayoutParams(size, 1)
            else
                LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, size)
        }
    }

    /**
     * Сохраняет задачу напрямую в expo-sqlite БД.
     *
     * expo-sqlite хранит файл в filesDir/SQLite/<dbName>:
     * /data/data/<package>/files/SQLite/eisenhower_v2.db
     *
     * ID задачи совпадает с JS-форматом: task_<timestamp>_<random>
     * quadrant рассчитывается по матрице Эйзенхауэра
     */
    private fun saveTask(title: String, importance: Int, urgency: Int) {
        // expo-sqlite путь: filesDir/SQLite/<dbName>
        val dbFile = File(filesDir, "SQLite/$DB_NAME")
        dbFile.parentFile?.mkdirs()

        try {
            val db = SQLiteDatabase.openOrCreateDatabase(dbFile, null)

            val now = System.currentTimeMillis()
            // Формат ID совпадает с JS generateId()
            val random = (Math.random() * 36.0.pow(9)).toLong().toString(36)
            val id = "task_${now}_${random}"

            // Определяем квадрант по матрице Эйзенхауэра
            // importance >= 4 → важно, urgency >= 4 → срочно
            val quadrant = when {
                importance >= 4 && urgency >= 4 -> "Q1"
                importance >= 4 && urgency < 4  -> "Q2"
                importance < 4  && urgency >= 4 -> "Q3"
                else                            -> "Q4"
            }
            val priorityScore = importance * urgency

            val values = ContentValues().apply {
                put("id", id)
                put("title", title)
                put("description", title)  // quick task: description = title
                put("importance", importance)
                put("urgency", urgency)
                putNull("dueDate")
                putNull("dueTime")
                put("status", "not_started")
                put("quadrant", quadrant)
                put("priorityScore", priorityScore)
                putNull("emoji")
                put("sortOrder", 0)
                put("notificationFrequency", "global")
                put("attachments", "[]")   // JSON empty array
                put("isDeleted", 0)
                putNull("deletedAt")
                put("createdAt", now)
                put("updatedAt", now)
            }

            db.insertOrThrow("tasks", null, values)
            db.close()
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this,
                "Ошибка: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    private fun Double.pow(n: Int): Double {
        var result = 1.0
        repeat(n) { result *= this }
        return result
    }
}
