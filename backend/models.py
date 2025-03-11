from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(256), nullable=True)  # OAuth users have no local password
    is_verified = db.Column(db.Boolean, default=False)
    verification_token = db.Column(db.String(100), unique=True, nullable=True)

class Freelancer(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    name = db.Column(db.String(100))
    business_name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))
    tax_number = db.Column(db.String(50))

class Client(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    business_name = db.Column(db.String(100))
    email = db.Column(db.String(100))
    phone = db.Column(db.String(20))
    address = db.Column(db.String(200))

class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    invoice_number = db.Column(db.String(50), unique=True)
    freelancer_id = db.Column(db.Integer, db.ForeignKey('freelancer.id'))
    client_id = db.Column(db.Integer, db.ForeignKey('client.id'))
    issue_date = db.Column(db.Date)
    due_date = db.Column(db.Date)
    subtotal = db.Column(db.Float)
    tax_amount = db.Column(db.Float)
    discount = db.Column(db.Float, default=0.0)
    total_amount = db.Column(db.Float)
    status = db.Column(db.String(20))
    payment_method = db.Column(db.String(50))

    freelancer = db.relationship('Freelancer', backref='invoices')
    client = db.relationship('Client', backref='invoices')

class InvoiceItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'))
    description = db.Column(db.String(200))
    quantity = db.Column(db.Float)
    rate = db.Column(db.Float)
    amount = db.Column(db.Float)

    invoice = db.relationship('Invoice', backref='items')
