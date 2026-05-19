# Security Specification - Ruang Bertumbuh

## 1. Data Invariants
- A **User** profile must belong to the authenticated user.
- A **Reflection** must always have a `userId` that matches the creator's `uid`.
- Reflections cannot be modified to change ownership or the original creation timestamp.
- All strings must have size limits to prevent resource exhaustion attacks.

## 2. The "Dirty Dozen" Payloads (Red Team Audit)

### P1: Identity Spoofing (Create Reflection for others)
```json
{
  "userId": "other_user_id",
  "content": "I am hacking",
  "type": "text",
  "timestamp": "server_timestamp"
}
```
*Expected: PERMISSION_DENIED (userId doesn't match auth.uid)*

### P2: Key Injection (Ghost Fields)
```json
{
  "userId": "my_uid",
  "content": "Normal content",
  "type": "text",
  "timestamp": "server_timestamp",
  "isAdmin": true
}
```
*Expected: PERMISSION_DENIED (Extra field 'isAdmin' not allowed)*

### P3: Resource Poisoning (Giant Content)
```json
{
  "userId": "my_uid",
  "content": "[10MB string...]",
  "type": "text",
  "timestamp": "server_timestamp"
}
```
*Expected: PERMISSION_DENIED (Content size > 10,000)*

### P4: Ownership Hijack (Update Reflection userId)
```json
{
  "userId": "other_user_id"
}
```
*Expected: PERMISSION_DENIED (Cannot change userId)*

### P5: Temporal Tampering (Update Timestamp)
```json
{
  "timestamp": "2020-01-01T00:00:00Z"
}
```
*Expected: PERMISSION_DENIED (Timestamp is immutable)*

### P6: Unauthorized List (Query others' reflections)
```javascript
db.collection('reflections').get() // Without 'where' clause
```
*Expected: PERMISSION_DENIED (Rule must enforce matching userId on resource.data)*

### P7: ID Poisoning (1.5KB Document ID)
```javascript
db.collection('reflections').doc("A".repeat(1500)).set({...})
```
*Expected: PERMISSION_DENIED (isValidId enforces size check)*

### P8: Bypass Auth (Metadata Write)
```javascript
// Guest write
db.collection('users').doc('target_uid').set({ email: 'evil@dev.com' })
```
*Expected: PERMISSION_DENIED (Requires authentication)*

### P9: Privilege Escalation (Set own role)
```json
{
  "uid": "my_uid",
  "email": "my@email.com",
  "createdAt": "server_timestamp",
  "role": "admin"
}
```
*Expected: PERMISSION_DENIED (Strict key check on User profile)*

### P10: PII Leak (Read other user profile)
```javascript
db.collection('users').doc('someone_else').get()
```
*Expected: PERMISSION_DENIED (isOwner check)*

### P11: Type Poisoning (String as List)
```json
{
  "content": ["Array", "instead", "of", "string"]
}
```
*Expected: PERMISSION_DENIED (is string check)*

### P12: Invalid Enum (Wrong type)
```json
{
  "type": "video"
}
```
*Expected: PERMISSION_DENIED (Only 'text' or 'audio' allowed)*
