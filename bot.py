from telegram import Update, WebAppInfo
from telegram.ext import Application, CommandHandler, MessageHandler, filters, ContextTypes
import json

BOT_TOKEN = '7901489953:AAHojbrC2xHbeQ7Wvj9jEtQaV0ceVlfCslI'
WEBAPP_URL = 'https://mrd00m666.github.io/Plat_temegram/'

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Отправляет сообщение с кнопкой для запуска игры"""
    await update.message.reply_text(
        "Нажмите кнопку ниже, чтобы начать игру!",
        reply_markup={
            "inline_keyboard": [[{
                "text": "🎮 Играть",
                "web_app": {"url": WEBAPP_URL}
            }]]
        }
    )

async def handle_webapp_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обрабатывает данные, отправленные из веб-приложения"""
    try:
        data = json.loads(update.message.web_app_data.data)
        if data.get('action') == 'saveScore':
            score = data.get('score', 0)
            await update.message.reply_text(f"🎉 Новый рекорд: {score}!")
    except Exception as e:
        print(f"Error handling webapp data: {e}")

def main():
    application = Application.builder().token(BOT_TOKEN).build()
    
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_webapp_data))
    
    application.run_polling()

if __name__ == '__main__':
    main() 