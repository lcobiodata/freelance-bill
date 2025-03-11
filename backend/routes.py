from flask import Blueprint, request, jsonify, redirect, current_app as app
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
def send_verification_email(email: str, token: str):
    """
    Sends a verification email with a verification link.
    """
    verification_link = f"{Config.PREFERRED_URL_SCHEME}://{Config.SERVER_NAME}/verify/{token}"

    msg = Message(
        subject="Verify your FreelanceBill account",
        recipients=[email],
        body=f"Please click the link below to verify your account:\n{verification_link}\n\n"
             f"If you did not register, you can safely ignore this email."
    )

    mail.send(msg)

def send_password_recovery_email(email: str, token: str):
    """
    Sends a password recovery email with a reset link.
    """
    reset_link = f"{Config.PREFERRED_URL_SCHEME}://{Config.SERVER_NAME}/reset-password/{token}"

    msg = Message(
        subject="Reset your FreelanceBill password",
        recipients=[email],
        body=f"To reset your password, please click the link below:\n{reset_link}\n\n"
             f"If you did not request a password reset, you can safely ignore this email."
    )

    mail.send(msg)

# -------------------- Routes --------------------
@routes_bp.route("/register", methods=["POST"])
def register():
    """
    Registers a new user. Generates a verification token and sends an email
    with the link to verify.
    """
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

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


@routes_bp.route("/verify/<token>", methods=["GET"])
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
    return redirect(f'{Config.FRONTEND_URL}/verify-success', code=302)


@routes_bp.route("/login", methods=["POST"])
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


@routes_bp.route("/change-password", methods=["POST"])
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


@routes_bp.route("/recover-password", methods=["POST"])
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


@routes_bp.route("/reset-password/<token>", methods=["GET", "POST"])
def reset_password(token):
    """
    Resets the user's password if the token matches.
    """
    user = User.query.filter_by(verification_token=token).first()
    if not user:
        return jsonify({"message": "Invalid or expired token."}), 400

    if request.method == "POST":
        data = request.form
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        if not new_password or not confirm_password:
            return jsonify({"message": "Both password fields are required."}), 400

        if new_password != confirm_password:
            return jsonify({"message": "Passwords do not match."}), 400

        # Hash the new password and update the user
        hashed_new_password = bcrypt.generate_password_hash(new_password).decode("utf-8")
        user.password = hashed_new_password
        user.verification_token = None  # Clear the token after successful reset
        db.session.commit()

        return jsonify({"message": "Password reset successful."}), 200

    # Render the password reset form
    return render_template_string('''
        <!doctype html>
        <title>Reset Password</title>
        <h1>Reset Password</h1>
        <form method="post">
            <label for="new_password">New Password:</label>
            <input type="password" id="new_password" name="new_password" required><br>
            <label for="confirm_password">Confirm Password:</label>
            <input type="password" id="confirm_password" name="confirm_password" required><br>
            <button type="submit">Reset Password</button>
        </form>
    ''')


@routes_bp.route("/login/google", methods=["POST"])
def login_google():
    """
    Client-side Google OAuth login flow.
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
            Config.GOOGLE_CLIENT_ID
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


@routes_bp.route("/update-email", methods=["POST"])
@jwt_required()
def update_email():
    """
    Update email route. Requires JWT for authentication.
    """
    data = request.get_json()
    new_email = data.get("new_email")

    if not new_email:
        return jsonify({"message": "New email is required"}), 400

    current_user = get_jwt_identity()
    user = User.query.filter_by(username=current_user).first()

    if User.query.filter_by(username=new_email).first():
        return jsonify({"message": "Email already in use"}), 400

    user.username = new_email
    user.is_verified = False  # Mark the new email as unverified
    verification_token = secrets.token_urlsafe(32)
    user.verification_token = verification_token
    db.session.commit()

    # Send a verification email to the new email address
    send_verification_email(new_email, verification_token)

    return jsonify({"message": "Email updated successfully. Please verify your new email."}), 200