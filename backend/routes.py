from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity
)
from flask_bcrypt import Bcrypt
import secrets
import google.auth.transport.requests
import google.oauth2.id_token

from models import db, User
from flask_mail import Message, Mail
from config import Config

bcrypt = Bcrypt()
mail = Mail()

# Create Blueprint for routes
routes_bp = Blueprint("routes", __name__)

# -------------------- Helper Functions --------------------
def send_verification_email(email: str, token: str, app):
    """
    Sends a verification email with a verification link.
    """
    verification_link = f"{Config.PREFERRED_URL_SCHEME}://{Config.SERVER_NAME}/verify/{token}"

    msg = Message(
        subject="Verify your FreelanceBill account",
        recipients=[email],
        body=f"Please click the link below to verify your account:\n{verification_link}\n\n"
             f"If you did not register, ignore this email."
    )

    with app.app_context():
        mail.send(msg)

def send_password_recovery_email(email: str, token: str, app):
    """
    Sends a password recovery email with a reset link.
    """
    reset_link = f"{Config.PREFERRED_URL_SCHEME}://{Config.SERVER_NAME}/reset-password/{token}"

    msg = Message(
        subject="Reset your FreelanceBill password",
        recipients=[email],
        body=f"To reset your password, click the link below:\n{reset_link}\n\n"
             f"If you did not request this, ignore this email."
    )

    with app.app_context():
        mail.send(msg)

# -------------------- Routes --------------------
@routes_bp.route("/")
def home():
    return "Welcome to FreelanceBill!", 200

@routes_bp.route("/register", methods=["POST"])
def register():
    """
    Registers a new user and sends a verification email.
    """
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if User.query.filter_by(username=username).first():
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    verification_token = secrets.token_urlsafe(32)

    new_user = User(username=username, password=hashed_password, is_verified=False, verification_token=verification_token)
    db.session.add(new_user)
    db.session.commit()

    send_verification_email(username, verification_token, request.app)

    return jsonify({"message": "User registered. Check your email to verify."}), 201

@routes_bp.route("/verify/<token>", methods=["GET"])
def verify_email(token):
    """
    Verifies the user's email if the token matches.
    """
    user = User.query.filter_by(verification_token=token).first()
    if not user:
        return jsonify({"message": "Invalid verification token."}), 400

    user.is_verified = True
    user.verification_token = None
    db.session.commit()

    return redirect(f'{Config.FRONTEND_URL}/verify-success', code=302)

@routes_bp.route("/login", methods=["POST"])
def login():
    """
    Logs in the user with JWT authentication.
    """
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = User.query.filter_by(username=username).first()
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"message": "Invalid credentials"}), 401

    if not user.is_verified:
        return jsonify({"message": "Email not verified. Check your inbox."}), 403

    access_token = create_access_token(identity=username)
    return jsonify({"token": access_token}), 200

@routes_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    """
    Allows authenticated users to change their password.
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

@routes_bp.route("/recover-password", methods=["POST"])
def recover_password():
    """
    Initiates password recovery by sending an email with a reset link.
    """
    data = request.get_json()
    email = data.get("email")

    user = User.query.filter_by(username=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    recovery_token = secrets.token_urlsafe(32)
    user.verification_token = recovery_token
    db.session.commit()

    send_password_recovery_email(email, recovery_token, request.app)

    return jsonify({"message": "Password recovery email sent"}), 200

@routes_bp.route("/login/google", methods=["POST"])
def login_google():
    """
    Handles Google OAuth login.
    """
    data = request.get_json()
    if not data or "token" not in data:
        return jsonify({"error": "No token provided"}), 400

    id_token_str = data["token"]
    try:
        id_info = google.oauth2.id_token.verify_oauth2_token(
            id_token_str,
            google.auth.transport.requests.Request(),
            Config.GOOGLE_CLIENT_ID
        )

        email = id_info.get("email")
        if not email:
            return jsonify({"error": "Email not provided by Google"}), 400

        user = User.query.filter_by(username=email).first()
        if not user:
            user = User(username=email, password=None, is_verified=True)
            db.session.add(user)
            db.session.commit()

        access_token = create_access_token(identity=email)
        return jsonify({"token": access_token, "user": {"email": email}}), 200

    except ValueError:
        return jsonify({"error": "Invalid or expired ID token"}), 401
