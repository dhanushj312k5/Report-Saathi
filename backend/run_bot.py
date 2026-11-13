#!/usr/bin/env python3
"""
Convenience entry point to run the ReportSaathi Telegram Bot.
Usage:
    cd backend
    ./venv/bin/python run_bot.py
"""
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.bot.telegram_bot import run_bot

if __name__ == "__main__":
    run_bot()
