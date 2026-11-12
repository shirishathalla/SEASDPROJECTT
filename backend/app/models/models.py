import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Date, BigInteger, ForeignKey, Text, Float, Integer
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    pin_hash = Column(String(255), nullable=False)
    is_email_verified = Column(Boolean, default=False)
    biometrics_enabled = Column(Boolean, default=True)
    auto_lock_minutes = Column(Integer, default=5)
    created_at = Column(DateTime, default=datetime.utcnow)

    documents = relationship("Document", back_populates="owner", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=True)
    tags = Column(ARRAY(String), default=[])
    document_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=True, index=True)
    mime_type = Column(String(100), nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False)
    sha256_checksum = Column(String(64), nullable=False, index=True)
    
    # Encrypted Payload (AES-256-GCM)
    encrypted_blob = Column(Text, nullable=False)
    iv_nonce = Column(String(64), nullable=False)
    auth_tag = Column(String(64), nullable=False)

    ocr_extracted_text = Column(Text, nullable=True)
    ocr_confidence = Column(Float, default=0.0)
    is_favorite = Column(Boolean, default=False)
    health_consent_given = Column(Boolean, default=False)
    version = Column(Integer, default=1)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="documents")


class FamilyGroup(Base):
    __tablename__ = "family_groups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("FamilyMember", back_populates="group", cascade="all, delete-orphan")


class FamilyMember(Base):
    __tablename__ = "family_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("family_groups.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    email = Column(String(255), nullable=False)
    role = Column(String(20), default="viewer")  # owner, editor, viewer
    joined_at = Column(DateTime, default=datetime.utcnow)

    group = relationship("FamilyGroup", back_populates="members")


class DocumentShare(Base):
    __tablename__ = "document_shares"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    shared_by_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    shared_with_email = Column(String(255), nullable=False)
    permission = Column(String(20), default="viewer")
    created_at = Column(DateTime, default=datetime.utcnow)


class QRShare(Base):
    __tablename__ = "qr_shares"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    token = Column(String(64), unique=True, index=True, nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    password_hash = Column(String(255), nullable=True)
    permissions = Column(String(20), default="view")  # view, download
    access_count = Column(Integer, default=0)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class EmergencyContact(Base):
    __tablename__ = "emergency_contacts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    contact_name = Column(String(150), nullable=False)
    contact_email = Column(String(255), nullable=False)
    relationship = Column(String(50), nullable=False)
    accessible_docs = Column(ARRAY(String), default=[])
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=False)
    ip_address = Column(String(45), nullable=False)
    user_agent = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="audit_logs")
