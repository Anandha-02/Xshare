# 📖 API Specification – Xshare

This document describes the REST API endpoints for **Xshare** (file transfer & authentication service).

---

## 🔑 Authentication APIs

### **Register a new user**
**POST** `/api/auth/register`

**Request Body**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
