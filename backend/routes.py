from flask import Blueprint, request, jsonify, redirect, current_app as app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
import secrets
import google.auth.transport.requests
import google.oauth2.id_token

from models import db, User, Client, Invoice, InvoiceItem
from flask_mail import Message, Mail
from config import Config
from datetime import datetime

bcrypt = Bcrypt()
mail = Mail()

# Create Blueprint for routes
routes_bp = Blueprint("routes", __name__)

# -------------------- Helper Functions --------------------
def send_verification_email(email: str, token: str):
    """
    Sends an email with a verification link that redirects to the React frontend.
    """
    verification_link = f"{Config.PREFERRED_URL_SCHEME}://{Config.SERVER_NAME}/verify/{token}"

    msg = Message(
        subject="Verify Your FreelanceBill Account",
        recipients=[email],
        body=f"Please click the link below to verify your account:\n{verification_link}\n\n"
             f"If you did not register, you can safely ignore this email."
    )

    mail.send(msg)

def send_password_recovery_email(email: str, token: str):
    """
    Sends a password recovery email with a reset link to the React frontend.
    """
    reset_link = f"{Config.FRONTEND_URL}/reset-password/{token}"  # Redirects to React

    msg = Message(
        subject="Reset Your FreelanceBill Password",
        recipients=[email],
        body=f"To reset your password, please click the link below:\n{reset_link}\n\n"
             f"If you did not request a password reset, you can safely ignore this email."
    )

    mail.send(msg)

# -------------------- Authentication Routes --------------------
@routes_bp.route("/register", methods=["POST"])
def register():
    """
    Registers a new user. Generates a verification token and sends an email
    with the link to verify.
    """
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    name = data.get("name")
    business_name = data.get("business_name")
    email = data.get("email")
    phone = data.get("phone")
    address = data.get("address")
    tax_number = data.get("tax_number")

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
        verification_token=verification_token,
        name=name,
        business_name=business_name,
        email=email,
        phone=phone,
        address=address,
        tax_number=tax_number
    )
    db.session.add(new_user)
    db.session.commit()

    # Send a verification email
    send_verification_email(email, verification_token)

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
    Sends a password recovery email with a link to the React reset password page.
    """
    data = request.get_json()
    email = data.get("email")

    user = User.query.filter_by(username=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    # Generate a password reset token
    recovery_token = secrets.token_urlsafe(32)
    user.verification_token = recovery_token
    db.session.commit()

    # Send the password recovery email with a React frontend link
    send_password_recovery_email(email, recovery_token)

    return jsonify({"message": "Password recovery email sent. Please check your inbox."}), 200

@routes_bp.route("/reset-password/<token>", methods=["POST"])
def reset_password(token):
    """
    Resets the user's password if the token matches.
    """
    user = User.query.filter_by(verification_token=token).first()
    if not user:
        return jsonify({"message": "Invalid or expired token."}), 400

    data = request.get_json()
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

    return jsonify({"message": "Password reset successful. You can now log in."}), 200

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
        # Extract user information from the ID token
        email = id_info.get("email")
        name = id_info.get("name")

        if not email:
            return jsonify({"error": "Email not provided by Google"}), 400

        # Create or fetch the user, mark as verified automatically (since Google verified)
        user = User.query.filter_by(username=email).first()
        if not user:
            user = User(
                username=email,
                password=None,
                is_verified=True,
                name=name,
                email=email,
            )
            db.session.add(user)
            db.session.commit()

        # Generate our own JWT for the user
        access_token = create_access_token(identity=email)
        return jsonify({"token": access_token, "user": {"email": email, "name": name}}), 200

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

# -------------------- Client Routes --------------------
@routes_bp.route("/clients", methods=["GET"])
@jwt_required()
def get_clients():
    """ Fetch all clients for the authenticated user """
    current_user = get_jwt_identity()
    clients = Client.query.join(User).filter(User.username == current_user).all()

    return jsonify([{
        "id": client.id,
        "name": client.name,
        "business_name": client.business_name,
        "email": client.email,
        "phone": client.phone,
        "address": client.address
    } for client in clients]), 200

@routes_bp.route("/client", methods=["POST"])
@jwt_required()
def create_client():
    """ Create a new client """
    data = request.get_json()
    name = data.get("name")
    business_name = data.get("business_name")
    email = data.get("email")
    phone = data.get("phone")
    address = data.get("address")

    current_user = get_jwt_identity()
    user_id = User.query.filter_by(username=current_user).first().id

    client = Client(
        user_id=user_id,
        name=name,
        business_name=business_name,
        email=email,
        phone=phone,
        address=address
    )
    db.session.add(client)
    db.session.commit()
    return jsonify({"message": "Client created successfully", "client_id": client.id}), 201

# -------------------- Invoice Routes --------------------
@routes_bp.route("/invoices", methods=["GET"])
@jwt_required()
def get_invoices():
    """ Fetch all invoices for the authenticated user """
    current_user = get_jwt_identity()
    invoices = Invoice.query.join(Client).filter(Client.email == current_user).all()

    return jsonify([{
        "invoice_number": inv.invoice_number or "N/A",
        "client": inv.client.name if inv.client else "Unknown",
        "issue_date": inv.issue_date.strftime("%Y-%m-%d") if inv.issue_date else "N/A",
        "due_date": inv.due_date.strftime("%Y-%m-%d") if inv.due_date else "N/A",
        "total_amount": inv.total_amount or 0.0,
        "status": inv.status or "Pending",
    } for inv in invoices]), 200

@routes_bp.route("/invoice", methods=["POST"])
@jwt_required()
def create_invoice():
    """ Create a new invoice with line items """
    data = request.get_json()
    client_id = data.get("client_id")
    issue_date = datetime.strptime(data.get("issue_date"), "%Y-%m-%d")
    due_date = datetime.strptime(data.get("due_date"), "%Y-%m-%d")
    subtotal = data.get("subtotal")
    tax_amount = data.get("tax_amount", 0.0)
    discount = data.get("discount", 0.0)
    total_amount = data.get("total_amount")
    status = data.get("status", "Unpaid")
    items = data.get("items", [])

    invoice = Invoice(
        invoice_number=secrets.token_hex(5),
        client_id=client_id,
        issue_date=issue_date,
        due_date=due_date,
        subtotal=subtotal,
        tax_amount=tax_amount,
        discount=discount,
        total_amount=total_amount,
        status=status
    )
    db.session.add(invoice)
    db.session.flush()  # Ensure invoice ID is generated before adding items

    for item in items:
        invoice_item = InvoiceItem(
            invoice_id=invoice.id,
            description=item.get("description"),
            quantity=item.get("quantity"),
            rate=item.get("rate"),
            amount=item.get("amount")
        )
        db.session.add(invoice_item)

    db.session.commit()
    return jsonify({"message": "Invoice created successfully", "invoice_id": invoice.id}), 201

@routes_bp.route("/invoice/<int:invoice_id>/items", methods=["POST"])
@jwt_required()
def add_invoice_item(invoice_id):
    """ Add an item to an existing invoice """
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return jsonify({"message": "Invoice not found"}), 404

    data = request.get_json()
    invoice_item = InvoiceItem(
        invoice_id=invoice_id,
        description=data.get("description"),
        quantity=data.get("quantity"),
        rate=data.get("rate"),
        amount=data.get("amount")
    )
    db.session.add(invoice_item)
    db.session.commit()
    return jsonify({"message": "Item added successfully"}), 201

@routes_bp.route("/invoice/item/<int:item_id>", methods=["DELETE"])
@jwt_required()
def delete_invoice_item(item_id):
    """ Delete an invoice item """
    item = InvoiceItem.query.get(item_id)
    if not item:
        return jsonify({"message": "Item not found"}), 404
    db.session.delete(item)
    db.session.commit()
    return jsonify({"message": "Item deleted successfully"}), 200


@routes_bp.route("/invoice/<int:invoice_id>", methods=["DELETE"])
@jwt_required()
def delete_invoice(invoice_id):
    """ Delete an invoice """
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return jsonify({"message": "Invoice not found"}), 404
    db.session.delete(invoice)
    db.session.commit()
    return jsonify({"message": "Invoice deleted successfully"}), 200


# -------------------- Payment Tracking --------------------
@routes_bp.route("/invoice/<int:invoice_id>/mark-paid", methods=["POST"])
@jwt_required()
def mark_invoice_paid(invoice_id):
    """ Mark an invoice as paid """
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return jsonify({"message": "Invoice not found"}), 404
    invoice.status = "Paid"
    db.session.commit()
    return jsonify({"message": "Invoice marked as paid"}), 200


