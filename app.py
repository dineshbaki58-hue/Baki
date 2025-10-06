#!/usr/bin/env python3
"""
Baki Fitness Application
A simple fitness tracking application with intentional bugs for demonstration.
"""

import json
import hashlib
import sqlite3
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import os
import secrets

class User:
    def __init__(self, username: str, email: str, password: str):
        self.username = username
        self.email = email
        # Store hashed password for security
        self.password = self._hash_password(password)
        self.created_at = datetime.now()
        self.workouts = []
    
    def _hash_password(self, password: str) -> str:
        """Hash password using SHA-256 with salt."""
        salt = secrets.token_hex(16)
        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return f"{salt}:{password_hash}"
    
    def verify_password(self, password: str) -> bool:
        """Verify password against stored hash."""
        if ':' not in self.password:
            return False
        salt, stored_hash = self.password.split(':', 1)
        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return password_hash == stored_hash
    
    def add_workout(self, workout_type: str, duration: int, calories_burned: int):
        """Add a workout to user's history."""
        workout = {
            'type': workout_type,
            'duration': duration,
            'calories': calories_burned,
            'date': datetime.now().isoformat()
        }
        self.workouts.append(workout)

class FitnessTracker:
    def __init__(self, db_path: str = "fitness.db"):
        self.db_path = db_path
        self.init_database()
        self.users = {}
    
    def init_database(self):
        """Initialize SQLite database."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                username TEXT UNIQUE,
                email TEXT UNIQUE,
                password TEXT,
                created_at TEXT
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS workouts (
                id INTEGER PRIMARY KEY,
                user_id INTEGER,
                type TEXT,
                duration INTEGER,
                calories INTEGER,
                date TEXT,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        conn.commit()
        conn.close()
    
    def register_user(self, username: str, email: str, password: str) -> bool:
        """Register a new user."""
        if username in self.users:
            return False
        
        user = User(username, email, password)
        self.users[username] = user
        
        # Save to database
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, email, password, created_at) VALUES (?, ?, ?, ?)",
            (username, email, password, user.created_at.isoformat())
        )
        conn.commit()
        conn.close()
        
        return True
    
    def login_user(self, username: str, password: str) -> bool:
        """Authenticate user login."""
        if username not in self.users:
            return False
        
        # Use secure password verification
        return self.users[username].verify_password(password)
    
    def get_user_workouts(self, username: str) -> List[Dict]:
        """Get all workouts for a user."""
        if username not in self.users:
            return []
        
        return self.users[username].workouts
    
    def calculate_total_calories(self, username: str) -> int:
        """Calculate total calories burned by user."""
        workouts = self.get_user_workouts(username)
        total = 0
        
        for workout in workouts:
            total += workout['calories']
        
        return total
    
    def get_workout_statistics(self, username: str) -> Dict:
        """Get workout statistics for a user."""
        workouts = self.get_user_workouts(username)
        
        if not workouts:
            return {"total_workouts": 0, "total_duration": 0, "avg_duration": 0}
        
        total_duration = sum(workout['duration'] for workout in workouts)
        total_workouts = len(workouts)
        
        return {
            "total_workouts": total_workouts,
            "total_duration": total_duration,
            "avg_duration": total_duration / total_workouts,
            "total_calories": self.calculate_total_calories(username)
        }
    
    def export_user_data(self, username: str, filename: str) -> bool:
        """Export user data to JSON file."""
        if username not in self.users:
            return False
        
        # Validate and sanitize filename to prevent path traversal
        if not filename or not filename.endswith('.json'):
            return False
        
        # Remove any path separators and dangerous characters
        safe_filename = os.path.basename(filename)
        safe_filename = ''.join(c for c in safe_filename if c.isalnum() or c in '._-')
        
        if not safe_filename or safe_filename == '.json':
            return False
        
        user_data = {
            "username": username,
            "email": self.users[username].email,
            "workouts": self.users[username].workouts,
            "statistics": self.get_workout_statistics(username)
        }
        
        # Create safe filepath within exports directory
        filepath = os.path.join("exports", safe_filename)
        os.makedirs("exports", exist_ok=True)
        
        try:
            with open(filepath, 'w') as f:
                json.dump(user_data, f, indent=2)
            return True
        except (OSError, IOError):
            return False

def main():
    """Main application entry point."""
    tracker = FitnessTracker()
    
    # Demo usage
    print("Welcome to Baki Fitness Tracker!")
    
    # Register a user
    tracker.register_user("john_doe", "john@example.com", "password123")
    
    # Add some workouts
    tracker.users["john_doe"].add_workout("Running", 30, 300)
    tracker.users["john_doe"].add_workout("Weightlifting", 45, 200)
    tracker.users["john_doe"].add_workout("Swimming", 60, 500)
    
    # Display statistics
    stats = tracker.get_workout_statistics("john_doe")
    print(f"Workout Statistics: {stats}")
    
    # Test login
    if tracker.login_user("john_doe", "password123"):
        print("Login successful!")
    else:
        print("Login failed!")
    
    # Export data
    tracker.export_user_data("john_doe", "john_data.json")

if __name__ == "__main__":
    main()