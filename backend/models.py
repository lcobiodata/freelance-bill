from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Enum as SQLAlchemyEnum
from enum import Enum
import pycountry

db = SQLAlchemy()

# ----------------- Enumerations -----------------
class InvoiceStatus(Enum):
    UNPAID = 'Unpaid'
    PAID = 'Paid'
    OVERDUE = 'Overdue'
    CANCELLED = 'Cancelled'

class InvoiceUnit(Enum):
    HOUR = 'Hour'
    ITEM = 'Item'

class PaymentMethod(Enum):
    CASH = 'Cash'
    BANK_TRANSFER = 'Bank Transfer'
    CREDIT_CARD = 'Credit Card'
    PAYPAL = 'PayPal'

# Wrapper class for Currency Enum
class Currency(Enum):
    pass

# Fetch all ISO 4217 currencies and dynamically add them to the Currency Enum
for currency in pycountry.currencies:
    setattr(Currency, currency.alpha_3, currency.alpha_3)

# ----------------- Models -----------------

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=True)  # OAuth users have no local password
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), unique=True, nullable=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    tax_number = db.Column(db.String(50))
    business_name = db.Column(db.String(100))

class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))  # Associate with User
    name = db.Column(db.String(100))
    business_name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))

    user = db.relationship('User', backref='clients')

class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'))
    issue_date = db.Column(db.Date)
    due_date = db.Column(db.Date)
    currency = db.Column(SQLAlchemyEnum(Currency))
    tax = db.Column(db.Float)
    status = db.Column(SQLAlchemyEnum(InvoiceStatus), default=InvoiceStatus.UNPAID)
    payment_method = db.Column(SQLAlchemyEnum(PaymentMethod))
    payment_date = db.Column(db.Date)

    user = db.relationship('User', backref='invoices')
    client = db.relationship('Client', backref='invoices')

class InvoiceItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'))
    quantity = db.Column(db.Float)
    unit = db.Column(SQLAlchemyEnum(InvoiceUnit))
    description = db.Column(db.String(200))
    rate = db.Column(db.Float)
    discount = db.Column(db.Float, default=0.0)

    invoice = db.relationship('Invoice', backref='items')