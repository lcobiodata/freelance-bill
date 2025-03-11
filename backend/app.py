from authlib.integrations.flask_client import OAuth
from flask import Flask, request, jsonify, redirect, url_for, session
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager
from flask_mail import Mail, Message
from dotenv import load_dotenv
import os
import secrets

# Load environment variables
load_dotenv()

app = Flask(__name__)

# General Flask Configurations
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = os.getenv("SQLALCHEMY_TRACK_MODIFICATIONS") == "True"
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")  # Flask session secret key
app.config["SERVER_NAME"] = os.getenv("SERVER_NAME")
app.config["PREFERRED_URL_SCHEME"] = os.getenv("PREFERRED_URL_SCHEME")

# Google OAuth Configuration
app.config["GOOGLE_CLIENT_ID"] = os.getenv("GOOGLE_CLIENT_ID")
app.config["GOOGLE_CLIENT_SECRET"] = os.getenv("GOOGLE_CLIENT_SECRET")

# Email Configuration (Zoho SMTP)
app.config["MAIL_SERVER"] = os.getenv("MAIL_SERVER")
app.config["MAIL_PORT"] = int(os.getenv("MAIL_PORT", 587))
app.config["MAIL_USE_TLS"] = os.getenv("MAIL_USE_TLS") == "True"
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")

# Enable CORS for frontend
CORS(app, supports_credentials=True, origins=[f"http://{os.getenv('SERVER_NAME').split(':')[0]}:3000"])

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
oauth = OAuth(app)
mail = Mail(app)

# Google OAuth Client Registration
google = oauth.register(
    name="google",
    client_id=app.config["GOOGLE_CLIENT_ID"],
    client_secret=app.config["GOOGLE_CLIENT_SECRET"],
    access_token_url="https://oauth2.googleapis.com/token",
    authorize_url="https://accounts.google.com/o/oauth2/auth",
    client_kwargs={"scope": "openid email profile"},
)

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

# Register route with email verification
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    verification_token = secrets.token_urlsafe(32)
    new_user = User(username=username, password=hashed_password, verification_token=verification_token)
    db.session.add(new_user)
    db.session.commit()

    # Send verification email
    verification_link = f"{request.host_url}verify/{verification_token}"
    msg = Message("Verify Your Email", sender=app.config["MAIL_USERNAME"], recipients=[username])
    msg.body = f"Click the link to verify your email: {verification_link}"
    mail.send(msg)

    return jsonify({"message": "User registered successfully. Check your email for verification."}), 201

# Email verification route
@app.route('/verify/<token>', methods=['GET'])
def verify_email(token):
    user = User.query.filter_by(verification_token=token).first()
    if not user:
        return jsonify({"message": "Invalid or expired verification token"}), 400
    user.is_verified = True
    user.verification_token = None
    db.session.commit()
    return jsonify({"message": "Email verified successfully!"}), 200

# Login route
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401
    if not user.is_verified:
        return jsonify({"message": "Please verify your email before logging in"}), 403

    access_token = create_access_token(identity=username)
    return jsonify({"token": access_token}), 200

# Google OAuth Login
@app.route('/login/google')
def login_google():
    redirect_uri = url_for("authorize_google", _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/authorize/google')
def authorize_google():
    token = google.authorize_access_token()
    user_info = google.get("https://www.googleapis.com/oauth2/v2/userinfo").json()
    
    user = User.query.filter_by(username=user_info["email"]).first()
    if not user:
        new_user = User(username=user_info["email"], password=None, is_verified=True)
        db.session.add(new_user)
        db.session.commit()
    
    access_token = create_access_token(identity=user_info["email"])
    return jsonify({"token": access_token, "user": user_info})

# Protected route
@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify({"message": f"Hello, {current_user}!"}), 200

# ---------------------------- Run Server ----------------------------
if __name__ == "__main__":
    app.run(debug=True)
