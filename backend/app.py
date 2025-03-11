from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_session import Session
from dotenv import load_dotenv
import os
import secrets

# For verifying Google ID tokens
import google.auth.transport.requests
import google.oauth2.id_token

# Load environment variables
load_dotenv()

app = Flask(__name__)

# General Flask Configurations
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = os.getenv("SQLALCHEMY_TRACK_MODIFICATIONS") == "True"
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["SERVER_NAME"] = os.getenv("SERVER_NAME")
app.config["PREFERRED_URL_SCHEME"] = os.getenv("PREFERRED_URL_SCHEME")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")  # Flask session secret key
app.config["SESSION_TYPE"] = os.getenv("SESSION_TYPE", "filesystem")  # Default to filesystem
app.config["SESSION_PERMANENT"] = False

# Google OAuth Configuration
app.config["GOOGLE_CLIENT_ID"] = os.getenv("GOOGLE_CLIENT_ID")
# NOTE: We don't need GOOGLE_CLIENT_SECRET for client-side flow

# Email Configuration (Zoho SMTP)
app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 587))
app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS") == "True"
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")

# Enable CORS for frontend
CORS(app, supports_credentials=True, origins=[f"http://{os.getenv('SERVER_NAME').split(':')[0]}:3000"])

# Initialize session
Session(app)

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
mail = Mail(app)
migrate = Migrate(app, db)

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=True)  # Nullable for OAuth users
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), unique=True, nullable=True)

# Initialize database
with app.app_context():
    db.create_all()

# ---------------------------- Routes ----------------------------
@app.route('/')
def home():
    return "Welcome to FreelanceBill!", 200

# Register route (with email verification disabled)
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    new_user = User(username=username, password=hashed_password, is_verified=True)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully."}), 201

# Login route (password-based)
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    access_token = create_access_token(identity=username)
    return jsonify({"token": access_token}), 200

# ---------------------------- NEW Google Login (Client-Side Flow) ----------------------------
@app.route('/login/google', methods=['POST'])
def login_google():
    """
    Expects a JSON payload: { "token": "<Google ID token>" }
    """
    data = request.get_json()
    if not data or "token" not in data:
        return jsonify({"error": "No token provided"}), 400

    id_token_str = data["token"]
    try:
        # Verify the token using google-auth
        id_info = google.oauth2.id_token.verify_oauth2_token(
            id_token_str,
            google.auth.transport.requests.Request(),
            app.config["GOOGLE_CLIENT_ID"]
        )
        # Extract the email (unique identifier)
        email = id_info.get("email")
        if not email:
            return jsonify({"error": "Email not provided by Google"}), 400

        # Create or fetch the user
        user = User.query.filter_by(username=email).first()
        if not user:
            user = User(username=email, password=None, is_verified=True)
            db.session.add(user)
            db.session.commit()

        # Generate our own JWT for the user
        access_token = create_access_token(identity=email)
        return jsonify({"token": access_token, "user": {"email": email}}), 200

    except ValueError:
        # Token verification failed
        return jsonify({"error": "Invalid or expired ID token"}), 401

# Protected route
@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"message": f"Hello, {current_user}!"}), 200

# ---------------------------- Run Server ----------------------------
if __name__ == "__main__":
    app.run(debug=True)
