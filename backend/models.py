from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Task(db.Model):
    __tablename__ = 'task'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    is_completed = db.Column(db.Boolean, default=False)
    deadline = db.Column(db.DateTime)  # 👈 Add this line
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'is_completed': self.is_completed,
            'deadline': self.deadline.isoformat() if self.deadline else None,  # 👈 Add this
            'created_at': self.created_at.isoformat()
        }

class Habit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(200))
    streak = db.Column(db.Integer, default=0)  # Current streak count
    best_streak = db.Column(db.Integer, default=0)  # Longest streak ever
    frequency = db.Column(db.String(20), default='daily')  # 'daily', 'weekly', etc.
    last_completed = db.Column(db.DateTime)  # Last time habit was marked done
    created_at = db.Column(db.DateTime, default=datetime.now)

