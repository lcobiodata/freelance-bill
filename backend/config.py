# config.py (OPTIONAL separate file)
# or you can keep these in your main app if you prefer.

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Frontend URL
    FRONTEND_URL = os.getenv("FRONTEND_URL")
    
    # General Flask Config
    SECRET_KEY = os.getenv("SECRET_KEY")
    SQLALCHEMY_DATABASE_URI = os.getenv("SQLALCHEMY_DATABASE_URI")
    SQLALCHEMY_TRACK_MODIFICATIONS = os.getenv("SQLALCHEMY_TRACK_MODIFICATIONS") == "True"
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
    
    # Session config
    SESSION_TYPE = os.getenv("SESSION_TYPE", "filesystem")
    SESSION_PERMANENT = False

    # Email Config (ZeptoMail)
    MAIL_SERVER = os.getenv("MAIL_SERVER")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_USE_SSL = os.getenv("MAIL_USE_SSL") == "True"
    MAIL_USE_TLS = os.getenv("MAIL_USE_TLS") == "True"
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_DEFAULT_SENDER = os.getenv("MAIL_DEFAULT_SENDER", "noreply@freelancebill.com")

    # Google OAuth Config
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    # GOOGLE_CLIENT_SECRET not needed for client-side flow

    # URL & Server
    SERVER_NAME = os.getenv("SERVER_NAME")
    PREFERRED_URL_SCHEME = os.getenv("PREFERRED_URL_SCHEME", "http")
    FLASK_ENV = os.getenv("FLASK_ENV", "development")
