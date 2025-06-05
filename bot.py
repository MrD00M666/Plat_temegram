from telegram import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

# Обработчик команды для запуска приложения
async def start_kegel(update, context):
    keyboard = [
        [InlineKeyboardButton(
            "🏋️ Открыть упражнения Кегеля", 
            web_app=WebAppInfo(url="https://твой-username.github.io/Plat_temegram/")
        )]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await update.message.reply_text(
        "Добро пожаловать в приложение упражнений Кегеля!\n"
        "Нажмите кнопку ниже для начала тренировки:",
        reply_markup=reply_markup
    )

# Добавь обработчик команды
application.add_handler(CommandHandler("kegel", start_kegel))
