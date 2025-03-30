from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Enum as SQLAlchemyEnum
from enum import Enum

db = SQLAlchemy()

# ----------------- Enumerations -----------------
class InvoiceStatus(Enum):
    UNPAID = 'Unpaid'
    PAID = 'Paid'
    OVERDUE = 'Overdue'
    CANCELLED = 'Cancelled'

class PaymentMethod(Enum):
    CASH = 'Cash'
    CHECK = 'Check'
    BANK_TRANSFER = 'Bank Transfer'
    CREDIT_CARD = 'Credit Card'
    DEBIT_CARD = 'Debit Card'
    DIRECT_DEBIT = 'Direct Debit'
    PAYPAL = 'PayPal'
    STRIPE = 'Stripe'
    BARTER_TRADE = 'Barter Trade'
    OTHER = 'Other'

class Currency(Enum):
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"
    # Add more currencies as needed

class ItemType(Enum):
    SERVICE = 'Service'
    PRODUCT = 'Product'

class ItemUnit(Enum):
    HOUR = 'Hour'
    ITEM = 'Item'

# ----------------- Models -----------------

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=True)  # OAuth users have no local password
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), nullable=True)
    name = db.Column(db.String(100), nullable=False)
    business_name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200), nullable=False)
    tax_number = db.Column(db.String(50))

    # Relationships
    clients = db.relationship('Client', backref='user', cascade='all, delete-orphan')
    invoices = db.relationship('Invoice', back_populates='user', cascade='all, delete-orphan')

class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)  # Associate with User
    name = db.Column(db.String(100), nullable=False)
    business_name = db.Column(db.String(100))
    email = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    tax_number = db.Column(db.String(50))

    invoices = db.relationship('Invoice', back_populates='client', cascade='all, delete-orphan')

class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'), nullable=False)
    invoice_number = db.Column(db.String(50), nullable=False)
    issue_date = db.Column(db.Date, nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    currency = db.Column(SQLAlchemyEnum(Currency), nullable=False)
    tax_rate = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    total_discount = db.Column(db.Float, nullable=False)
    tax_amount = db.Column(db.Float, nullable=False)
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.Enum(InvoiceStatus), nullable=False)
    payment_method = db.Column(db.Enum(PaymentMethod), nullable=False)
    payment_details = db.Column(db.String(200), nullable=False)
    payment_date = db.Column(db.Date)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'invoice_number', name='unique_user_invoice_number'),
    )

    # Relationships
    user = db.relationship('User', back_populates='invoices')
    client = db.relationship('Client', back_populates='invoices')
    items = db.relationship('InvoiceItem', back_populates='invoice', cascade='all, delete-orphan')

class InvoiceItem(db.Model):
    __tablename__ = 'invoice_item'
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'), nullable=False)
    item_type = db.Column(db.Enum(ItemType), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    unit = db.Column(db.Enum(ItemUnit), nullable=False)
    rate = db.Column(db.Float, nullable=False)
    discount = db.Column(db.Float, nullable=False)
    gross_amount = db.Column(db.Float, nullable=False)
    net_amount = db.Column(db.Float, nullable=False)

    # Relationships
    invoice = db.relationship('Invoice', back_populates='items')
