from flask import Flask, request, jsonify   
from flask_cors import CORS
from models import db, Task
from models import Habit
from dotenv import load_dotenv
import os
import requests
import threading
import time
from datetime import datetime, timedelta
from sqlalchemy import text
from flask import redirect

load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/tasks/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PATCH", "DELETE", "PUT"],
        "allow_headers": ["Content-Type"]
    },
    r"/habits/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PATCH", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DB_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

# Telegram Notification Function (Non-blocking)
def send_telegram_notification(message):
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    
    if not bot_token or not chat_id:
        print("Telegram credentials not configured!")
        return False

    def send_notification_async():
        try:
            response = requests.post(
                f'https://api.telegram.org/bot{bot_token}/sendMessage',
                json={
                    'chat_id': chat_id,
                    'text': message,
                    'parse_mode': 'Markdown'
                },
                timeout=10  # Increased timeout
            )
            response.raise_for_status()
            print(f"✅ Telegram notification sent: {message[:50]}...")
            return True
        except requests.exceptions.Timeout:
            print(f"⏰ Telegram notification timeout: {message[:50]}...")
            return False
        except requests.exceptions.ConnectionError:
            print(f"🌐 Telegram connection error: {message[:50]}...")
            return False
        except Exception as e:
            print(f"❌ Failed to send Telegram notification: {str(e)}")
            return False

    # Send notification in background thread to avoid blocking API responses
    thread = threading.Thread(target=send_notification_async)
    thread.daemon = True
    thread.start()
    return True

# Background deadline checker
def check_deadlines():
    notified_tasks = set()  # Track notified tasks to prevent duplicates
    
    while True:
        try:
            with app.app_context():
                now = datetime.now()  # Using local time instead of UTC
                
                # 1. Check approaching tasks (next 24 hours)
                soon = now + timedelta(hours=24)
                approaching_tasks = Task.query.filter(
                    Task.deadline <= soon,
                    Task.deadline > now,
                    Task.is_completed == False,
                    ~Task.id.in_(notified_tasks)
                ).all()

                for task in approaching_tasks:
                    # Skip if task was created very recently (within 10 minutes) to avoid duplicate with "New Task Added" notification
                    if task.created_at and (now - task.created_at).total_seconds() < 600:  # 10 minutes
                        notified_tasks.add(task.id)
                        continue
                        
                    message = (
                        f"⏰ *Task Deadline Approaching*\n"
                        f"• Title: {task.title}\n"
                        f"• Deadline: {task.deadline.strftime('%Y-%m-%d %H:%M')}"
                    )
                    send_telegram_notification(message)
                    notified_tasks.add(task.id)

                # 2. Check overdue tasks
                overdue_tasks = Task.query.filter(
                    Task.deadline <= now,
                    Task.is_completed == False,
                    ~Task.id.in_(notified_tasks)
                ).all()

                for task in overdue_tasks:
                    message = (
                        f"🔴 *Task Overdue*\n"
                        f"• Title: {task.title}\n"
                        f"• Deadline was: {task.deadline.strftime('%Y-%m-%d %H:%M')}"
                    )
                    send_telegram_notification(message)
                    notified_tasks.add(task.id)

                # Clear old notifications periodically
                if now.hour == 0:  # Reset at midnight
                    notified_tasks.clear()

        except Exception as e:
            print(f"Deadline check error: {str(e)}")
            try:
                db.session.rollback()
            except:
                pass  # Ignore rollback errors in background thread
        
        time.sleep(60)  # Check every minute

# Database session cleanup
@app.teardown_appcontext
def shutdown_session(exception=None):
    db.session.remove()

# Create tables
with app.app_context():
    db.create_all()

# Routes
@app.route('/tasks', methods=['GET'])
def get_tasks():
    try:
        tasks = Task.query.all()
        return jsonify([{
            'id': t.id,
            'title': t.title,
            'description': t.description,
            'is_completed': t.is_completed,
            'deadline': t.deadline.isoformat() if t.deadline else None,
            'created_at': t.created_at.isoformat()
        } for t in tasks])
    except Exception as e:
        print(f"Database error: {str(e)}")
        return jsonify({'error': 'Server error'}), 500

@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    new_task = Task(
        title=data['title'],
        description=data.get('description', ''),
        deadline=datetime.fromisoformat(data['deadline']) if data.get('deadline') else None
    )
    db.session.add(new_task)
    db.session.commit()
    
    # Send notification for all new tasks with deadlines
    if new_task.deadline:
        send_telegram_notification(
            f"📝 *New Task Added*\n"
            f"• Title: {new_task.title}\n"
            f"• Due: {new_task.deadline.strftime('%Y-%m-%d %H:%M')}"
        )
    
    return jsonify(new_task.to_dict()), 201

@app.route('/tasks/<int:id>/complete', methods=['PATCH'])
def complete_task(id):
    task = Task.query.get_or_404(id)
    task.is_completed = True
    db.session.commit()
    send_telegram_notification(f"✅ *Task Completed*\n• Title: {task.title}")
    return jsonify(task.to_dict())

@app.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    task = Task.query.get_or_404(id)
    db.session.delete(task)
    db.session.commit()
    return '', 204

@app.route('/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    task = Task.query.get_or_404(id)
    data = request.get_json()
    
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data.get('description', '')
    if 'deadline' in data:
        task.deadline = datetime.fromisoformat(data['deadline']) if data['deadline'] else None
    
    db.session.commit()
    
    if task.deadline and (task.deadline - datetime.now()) <= timedelta(hours=24):
        send_telegram_notification(
            f"🔄 *Task Updated*\n"
            f"• Title: {task.title}\n"
            f"• New Due: {task.deadline.strftime('%Y-%m-%d %H:%M')}"
        )
    
    return jsonify(task.to_dict())

@app.route('/tasks/<int:id>/status', methods=['PATCH'])
def update_task_status(id):
    task = Task.query.get_or_404(id)
    data = request.get_json()
    
    if 'is_completed' in data:
        task.is_completed = data['is_completed']
        db.session.commit()
        status = "Completed" if task.is_completed else "Reopened"
        send_telegram_notification(f"🔄 *Task {status}*\n• Title: {task.title}")
    
    return jsonify(task.to_dict())

@app.route('/test-telegram')
def test_notification():
    bot_token = os.getenv('TELEGRAM_BOT_TOKEN')
    chat_id = os.getenv('TELEGRAM_CHAT_ID')
    
    if not bot_token or not chat_id:
        return jsonify({
            'success': False, 
            'error': 'Telegram credentials not configured',
            'bot_token': 'Not set' if not bot_token else 'Set',
            'chat_id': 'Not set' if not chat_id else 'Set'
        }), 400
    
    send_telegram_notification("🔔 *Test Notification*\n• This is a test message from your task manager\n• Time: " + datetime.now().strftime('%Y-%m-%d %H:%M:%S'))
    return jsonify({
        'success': True, 
        'message': 'Test notification sent',
        'bot_token': 'Set',
        'chat_id': 'Set',
        'timestamp': datetime.now().isoformat()
    })


# Habit tracker code starts here 
# Habits CRUD
@app.route('/habits', methods=['GET'])
def get_habits():
    habits = Habit.query.all()
    return jsonify([{
        'id': h.id,
        'title': h.title,
        'streak': h.streak,
        'best_streak': h.best_streak,
        'last_completed': h.last_completed.isoformat() if h.last_completed else None
    } for h in habits])

@app.route('/habits', methods=['POST'])
def add_habit():
    data = request.get_json()
    new_habit = Habit(
        title=data['title'],
        description=data.get('description', ''),
        frequency=data.get('frequency', 'daily')
    )
    db.session.add(new_habit)
    db.session.commit()
    return jsonify({'id': new_habit.id}), 201

@app.route('/habits/<int:id>/complete', methods=['PATCH'])
def complete_habit(id):
    habit = Habit.query.get_or_404(id)
    today = datetime.now().date()
    
    # Check if already completed today
    if habit.last_completed and habit.last_completed.date() == today:
        return jsonify({'error': 'Habit already completed today'}), 400
    
    # Update streak
    yesterday = today - timedelta(days=1)
    if habit.last_completed and habit.last_completed.date() == yesterday:
        habit.streak += 1
    else:
        habit.streak = 1  # Reset streak if broken
    
    if habit.streak > habit.best_streak:
        habit.best_streak = habit.streak
    
    habit.last_completed = datetime.now()
    db.session.commit()
    
    # Send Telegram notification
    send_telegram_notification(f"🔥 *Habit Completed!*\n• {habit.title}\n• Streak: {habit.streak} days")
    
    return jsonify({
        'streak': habit.streak,
        'best_streak': habit.best_streak
    })

@app.route('/habits/<int:id>', methods=['DELETE'])
def delete_habit(id):
    habit = Habit.query.get_or_404(id)
    db.session.delete(habit)
    db.session.commit()
    return '', 204

# Habit tracker code ends here 

if __name__ == '__main__':
    if not app.debug or os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
        thread = threading.Thread(target=check_deadlines)
        thread.daemon = True
        thread.start()
    app.run(debug=True)