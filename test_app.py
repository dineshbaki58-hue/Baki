#!/usr/bin/env python3
"""
Test file for Baki Fitness Application
"""

import unittest
import os
import tempfile
from app import FitnessTracker, User

class TestFitnessTracker(unittest.TestCase):
    def setUp(self):
        """Set up test fixtures."""
        self.temp_db = tempfile.NamedTemporaryFile(delete=False)
        self.temp_db.close()
        self.tracker = FitnessTracker(self.temp_db.name)
    
    def tearDown(self):
        """Clean up after tests."""
        os.unlink(self.temp_db.name)
        if os.path.exists("exports"):
            import shutil
            shutil.rmtree("exports")
    
    def test_user_registration(self):
        """Test user registration."""
        result = self.tracker.register_user("test_user", "test@example.com", "password123")
        self.assertTrue(result)
        self.assertIn("test_user", self.tracker.users)
    
    def test_duplicate_registration(self):
        """Test duplicate user registration."""
        self.tracker.register_user("test_user", "test@example.com", "password123")
        result = self.tracker.register_user("test_user", "test2@example.com", "password456")
        self.assertFalse(result)
    
    def test_login(self):
        """Test user login."""
        self.tracker.register_user("test_user", "test@example.com", "password123")
        self.assertTrue(self.tracker.login_user("test_user", "password123"))
        self.assertFalse(self.tracker.login_user("test_user", "wrong_password"))
    
    def test_workout_calculation(self):
        """Test workout calorie calculation."""
        self.tracker.register_user("test_user", "test@example.com", "password123")
        user = self.tracker.users["test_user"]
        
        user.add_workout("Running", 30, 300)
        user.add_workout("Weightlifting", 45, 200)
        
        total_calories = self.tracker.calculate_total_calories("test_user")
        # This should now be 500 (300 + 200) after fixing the bug
        self.assertEqual(total_calories, 500)
    
    def test_export_data_security(self):
        """Test export data with path traversal protection."""
        self.tracker.register_user("test_user", "test@example.com", "password123")
        
        # Test normal export
        self.assertTrue(self.tracker.export_user_data("test_user", "normal_export.json"))
        
        # Test path traversal attempts (should fail)
        self.assertFalse(self.tracker.export_user_data("test_user", "../../../etc/passwd"))
        self.assertFalse(self.tracker.export_user_data("test_user", "..\\..\\..\\windows\\system32"))
        self.assertFalse(self.tracker.export_user_data("test_user", "/etc/passwd"))
        
        # Test invalid filenames (should fail)
        self.assertFalse(self.tracker.export_user_data("test_user", "no_extension"))
        self.assertFalse(self.tracker.export_user_data("test_user", ""))
        self.assertFalse(self.tracker.export_user_data("test_user", ".json"))

if __name__ == "__main__":
    unittest.main()