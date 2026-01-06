# 🔧 Tích Hợp Supabase Logging - Quick Integration Guide

## 🎯 3 Steps to Add Logging

### Step 1: Import
```typescript
import { 
  logCreateAction, 
  logUpdateAction, 
  logDeleteAction,
  logViewAction,
  logLoginAction,
  CurrentUser 
} from '../services/logHelpers';
```

### Step 2: Get Current User
```typescript
const currentUser: CurrentUser = {
  id: 'user-123',
  username: 'admin',
  email: 'admin@school.com',
  role: 'admin',
};
```

### Step 3: Call Logging Function
```typescript
await logCreateAction(currentUser, 'student', id, name, data);
```

---

## 📋 Integration Examples

### LoginPage.tsx
```typescript
async function handleLogin() {
  try {
    const user = await loginAPI(email, password);
    
    // ✅ LOG LOGIN
    await logLoginAction({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
    
    setCurrentUser(user);
  } catch (error) {
    // ✅ LOG ERROR
    await logErrorAction(
      { id: 'unknown', username: email, email, role: 'user' },
      'LOGIN',
      'authentication',
      error.message
    );
  }
}
```

### StudentList.tsx
```typescript
useEffect(() => {
  // ✅ LOG VIEW when component loads
  await logViewAction(currentUser, 'student');
  
  loadStudents();
}, []);

async function handleDelete(id: string, name: string) {
  await deleteAPI(id);
  
  // ✅ LOG DELETE
  await logDeleteAction(currentUser, 'student', id, name);
}
```

### StudentDialog.tsx
```typescript
async function handleSave() {
  try {
    if (isEdit) {
      // UPDATE
      const updated = await updateAPI(id, formData);
      
      // ✅ LOG UPDATE
      await logUpdateAction(
        currentUser,
        'student',
        id,
        formData.name,
        oldData,
        updated
      );
    } else {
      // CREATE
      const created = await createAPI(formData);
      
      // ✅ LOG CREATE
      await logCreateAction(
        currentUser,
        'student',
        created.id,
        created.name,
        formData
      );
    }
  } catch (error) {
    // ✅ LOG ERROR
    await logErrorAction(
      currentUser,
      isEdit ? 'UPDATE' : 'CREATE',
      'student',
      error.message
    );
  }
}
```

### AdminPanel.tsx
```typescript
import ActivityLogsPanel from './ActivityLogsPanel';

function AdminPanel() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {/* ✅ Add logging panel with 3 tabs */}
      <ActivityLogsPanel />
      
      {/* Shows: Activities | Logins | Statistics */}
    </div>
  );
}
```

---

## 📋 Function Reference

| Function | Use Case | Async |
|----------|----------|-------|
| `logCreateAction()` | When creating new object | ✅ Yes |
| `logUpdateAction()` | When updating object | ✅ Yes |
| `logDeleteAction()` | When deleting object | ✅ Yes |
| `logViewAction()` | When viewing list/detail | ✅ Yes |
| `logErrorAction()` | When error occurs | ✅ Yes |
| `logLoginAction()` | When user logs in | ✅ Yes |
| `logLogoutAction()` | When user logs out | ✅ Yes |

**All functions are ASYNC! Use `await`!**

---

## ⚡ Remember: Always Use `await`!

```typescript
// ❌ WRONG - Not awaiting
logCreateAction(user, 'student', id, name, data);

// ✅ CORRECT - With await
await logCreateAction(user, 'student', id, name, data);

// ✅ ALSO CORRECT - In async function
logCreateAction(user, 'student', id, name, data).catch(console.error);
```

---

## 🧪 Quick Test

```typescript
// Test in component
useEffect(() => {
  async function test() {
    await logCreateAction(
      currentUser,
      'student',
      'test-id',
      'Test Student',
      { name: 'Test' }
    );
    console.log('Log created!');
  }
  test();
}, []);

// Then check:
// 1. Supabase Dashboard → activity_logs table
// 2. Or go to Admin Panel → view in UI
```

---

## 🎓 Common Patterns

### Pattern 1: Try-Catch with Logging
```typescript
async function handleAction() {
  try {
    const result = await doSomething();
    
    await logCreateAction(user, 'resource', id, name, result);
    
    return result;
  } catch (error) {
    await logErrorAction(user, 'CREATE', 'resource', error.message);
    throw error;
  }
}
```

### Pattern 2: CRUD Operations
```typescript
// CREATE
const created = await api.create(data);
await logCreateAction(user, 'student', created.id, created.name, data);

// READ (VIEW)
const student = await api.get(id);
await logViewAction(user, 'student', id, student.name);

// UPDATE
const updated = await api.update(id, data);
await logUpdateAction(user, 'student', id, data.name, old, updated);

// DELETE
await api.delete(id);
await logDeleteAction(user, 'student', id, student.name, old);
```

### Pattern 3: List & Detail Views
```typescript
// List view
useEffect(() => {
  await logViewAction(currentUser, 'student');
}, []);

// Detail view
useEffect(() => {
  if (studentId) {
    await logViewAction(currentUser, 'student', studentId, student.name);
  }
}, [studentId]);
```

---

## 🚀 Integration Checklist

- [ ] Import functions in component
- [ ] Define `currentUser` variable
- [ ] Add `await logAction()` after success
- [ ] Add `await logError()` in catch blocks
- [ ] Add `ActivityLogsPanel` to admin page
- [ ] Test in browser
- [ ] Check Supabase dashboard
- [ ] See logs in admin UI

---

## 💡 Tips

1. **Always await** - All logging functions are async
2. **After success** - Log only after operation succeeds
3. **Include error logs** - Log failures too
4. **View logs** - Check Supabase or admin UI
5. **Test locally** - Verify before deploying

---

## 🆘 Troubleshooting

**Q: Logs not appearing?**
- Check `.env` - Supabase URL/key set?
- Check Supabase - tables exist?
- Check browser console - any errors?
- Check RLS - policy blocking?

**Q: Slow queries?**
- Add pagination (default 50/page)
- Use indexes (already created)
- Filter by date range

**Q: Can't see other users logs?**
- That's correct! RLS policy for privacy
- Only admin sees all logs
- Users see own logs only

---

**That's it! 🎉 You're ready to integrate logging!**
