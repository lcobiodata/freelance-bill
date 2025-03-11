from flask import Flask, request, jsonify, session, redirect
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, JWTManager
)
from flask_mail import Mail, Message
from flask_migrate import Migrate
from flask_session import Session
from dotenv import load_dotenv
import secrets
import os

# Google verification
import google.auth.transport.requests
import google.oauth2.id_token

# Importing models
from models import db, User, Freelancer, Client, Invoice, InvoiceItem

# If you created a config.py, you can do:
from config import Config

load_dotenv()

app = Flask(__name__)

# -------------------- Configuration --------------------
app.config.from_object(Config)

# Initialize session, mail, and other extensions
Session(app)
mail = Mail(app)
db.init_app(app)  # Initialize the database from models.py
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

# CORS for local dev: allow requests from React dev server on port 3000
CORS(app, supports_credentials=True, origins=[
    f"http://{os.getenv('SERVER_NAME').split(':')[0]}:3000"
])

# Create database tables
with app.app_context():
    db.create_all()

# -------------------- Helper Function --------------------
def send_verification_email(email: str, token: str):
    """
    Sends a verification email containing a link to /verify/<token>.
    """
    verification_link = (
        f"{app.config['PREFERRED_URL_SCHEME']}://{app.config['SERVER_NAME']}/verify/{token}"
    )

    msg = Message(
        subject="Verify your FreelanceBill account",
        recipients=[email],  # Send to the user's email
        body=f"Thank you for registering!\n\n"
             f"Please click the link below to verify your account:\n"
             f"{verification_link}\n\n"
             f"If you did not register, you can safely ignore this email."
    )

    mail.send(msg)

def send_password_recovery_email(email: str, token: str):
    """
    Sends a password recovery email containing a link to /reset-password/<token>.
    """
    reset_link = (
        f"{app.config['PREFERRED_URL_SCHEME']}://{app.config['SERVER_NAME']}/reset-password/{token}"
    )

    msg = Message(
        subject="Reset your FreelanceBill password",
        recipients=[email],  # Send to the user's email
        body=f"To reset your password, please click the link below:\n"
             f"{reset_link}\n\n"
             f"If you did not request a password reset, you can safely ignore this email."
    )

    mail.send(msg)


# -------------------- Routes --------------------
@app.route("/")
def home():
    return "Welcome to FreelanceBill!", 200


@app.route("/register", methods=["POST"])
def register():
    """
    Registers a new user. Generates a verification token and sends an email
    with the link to verify.
    """
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    print(f"REGISTER endpoint: username={username}, password={password}")

    # Check if user exists
    if User.query.filter_by(username=username).first():
        return jsonify({"message": "User already exists"}), 400

    # Hash password
    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    # Generate a token for verification
    verification_token = secrets.token_urlsafe(32)

    # Create the new user with is_verified=False
    new_user = User(
        username=username,
        password=hashed_password,
        is_verified=False,
        verification_token=verification_token
    )
    db.session.add(new_user)
    db.session.commit()

    # Send a verification email
    send_verification_email(username, verification_token)

    return jsonify({"message": "User registered. Please check your email to verify."}), 201


@app.route("/verify/<token>", methods=["GET"])
def verify_email(token):
    """
    Verifies the user's email address if the token matches.
    """
    user = User.query.filter_by(verification_token=token).first()
    if not user:
        return jsonify({"message": "Invalid verification token."}), 400

    # Mark the user as verified
    user.is_verified = True
    user.verification_token = None
    db.session.commit()

    # Redirect to the frontend verification success page
    return redirect(f'{app.config["FRONTEND_URL"]}/verify-success', code=302)


@app.route("/login", methods=["POST"])
def login():
    """
    Traditional login route. Checks if user is verified before issuing JWT.
    """
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"message": "Invalid credentials"}), 401

    # OPTIONAL: If you want to enforce verification:
    if not user.is_verified:
        return jsonify({"message": "Email not verified. Please check your inbox."}), 403

    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    access_token = create_access_token(identity=username)
    return jsonify({"token": access_token}), 200


@app.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    """
    Change password route. Requires JWT for authentication.
    """
    data = request.get_json()
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    if not current_password or not new_password:
        return jsonify({"message": "Current password and new password are required"}), 400

    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()

    if not bcrypt.check_password_hash(user.password, current_password):
        return jsonify({"message": "Current password is incorrect"}), 401

    hashed_new_password = bcrypt.generate_password_hash(new_password).decode("utf-8")
    user.password = hashed_new_password
    db.session.commit()

    return jsonify({"message": "Password changed successfully"}), 200


@app.route("/recover-password", methods=["POST"])
def recover_password():
    """
    Password recovery route. Sends an email with a link to reset the password.
    """
    data = request.get_json()
    email = data.get("email")

    user = User.query.filter_by(username=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Generate a token for password recovery
    recovery_token = secrets.token_urlsafe(32)
    user.verification_token = recovery_token
    db.session.commit()

    # Send a password recovery email
    send_password_recovery_email(email, recovery_token)

    return jsonify({"message": "Password recovery email sent"}), 200


@app.route("/login/google", methods=["POST"])
def login_google():
    """
    Client-side Google login flow.
    Expects JSON payload: {"token": "<Google ID token>"}
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

        # Create or fetch the user, mark as verified automatically (since Google verified)
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


# # Protected route example
# @app.route("/protected", methods=["GET"])
# @jwt_required()
# def protected():
#     """
#     Protected route example. Only accessible if you have a valid JWT.
#     """
#     current_user = get_jwt_identity()
#     return jsonify({"message": f"Hello, {current_user}!"}), 200


# -------------------- Run --------------------
if __name__ == "__main__":
    app.run(debug=True)