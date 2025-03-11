from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_session import Session
from dotenv import load_dotenv
import os

from config import Config
from models import db
from routes import routes_bp  # Import the Blueprint from routes.py

load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
Session(app)
db.init_app(app)
bcrypt = Bcrypt(app)  # Initialize Bcrypt
jwt = JWTManager(app)
mail = Mail(app)
migrate = Migrate(app, db)

# CORS settings
CORS(app, supports_credentials=True, origins=[
    f"http://{os.getenv('SERVER_NAME').split(':')[0]}:3000"
])

# Register Blueprint for routes
app.register_blueprint(routes_bp)

# Create database tables
with app.app_context():
    db.create_all()

# Run the application
if __name__ == "__main__":
    app.run(debug=True)