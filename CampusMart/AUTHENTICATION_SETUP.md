# CampusMart Authentication Pages - Design Implementation

## 📁 Files Created/Modified

### CSS File
**Location:** `CampusMart/wwwroot/css/auth.css`

This file contains all styling for the authentication pages including:
- **Glassmorphic Card Design** - Modern blur and transparency effects
- **Responsive Layout** - Works on desktop and mobile devices
- **Form Styling** - Input fields, buttons, password toggles
- **Animations** - Smooth transitions between states
- **Overlay Effects** - Beautiful gradient overlays with SVG paths

### JavaScript File
**Location:** `CampusMart/wwwroot/js/auth.js`

This file contains all functionality for the authentication pages:
- `go(m)` - Toggle between login and register forms with animations
- `togglePw(id, btn)` - Show/hide password with eye icon
- `toast(msg, bg)` - Display toast notifications
- `forgotPw(e)` - Handle forgot password click
- `validateRegForm(e)` - Validate registration form (passwords match)

### Razor Views
**Location:** 
- `CampusMart/Views/Account/Login.cshtml`
- `CampusMart/Views/Account/Register.cshtml`

Both views now:
- Use **separate CSS and JS files** (no inline styles)
- Implement **ASP.NET Tag Helpers** (`asp-for`, `asp-action`, `asp-controller`, `asp-validation-for`)
- Feature the **glassmorphic design** from your design mockup
- Include **responsive mobile design**
- Support **password visibility toggle**
- Show **beautiful overlay animations**

---

## 🎨 Design Features

✅ **Glassmorphic Card** - Modern blur effect with semi-transparent background
✅ **Smooth Animations** - 0.9s transitions between login/register
✅ **Gradient Overlay** - Yellow/Gold gradient accent on the right side
✅ **Form Inputs** - Glassmorphic input fields with focus effects
✅ **Password Toggle** - Eye icon to show/hide passwords
✅ **Toast Notifications** - Success/error messages with slide-in animation
✅ **Mobile Responsive** - Full-width single form on mobile devices
✅ **Dark Theme** - Professional dark background with proper contrast

---

## 🔧 How to Use

### Login Page
- Navigate to: `/Account/Login`
- Shows login form by default
- Click "Register" tab or "Sign Up" button to switch to register

### Register Page
- Navigate to: `/Account/Register`
- Shows register form by default
- Click "Login" tab or "Sign In" button to switch to login

### Features
- **Password validation** - Ensures confirmation password matches
- **Forgot password** - Shows confirmation toast
- **Form submissions** - Uses ASP.NET model binding

---

## 📋 Model Mapping

**LoginViewModel** → Login.cshtml
- StudentId (Required)
- Password (Required)
- RememberMe (Optional)

**RegisterViewModel** → Register.cshtml
- FirstName (Required)
- LastName (Required)
- StudentId (Required)
- Email (Required)
- Department (Required)
- Password (Required, min 8 chars)
- ConfirmPassword (Required, must match Password)

---

## 🚀 File Locations

```
CampusMart/
├── wwwroot/
│   ├── css/
│   │   └── auth.css (NEW - All authentication styling)
│   └── js/
│       └── auth.js (NEW - All authentication functionality)
├── Views/
│   └── Account/
│       ├── Login.cshtml (UPDATED)
│       └── Register.cshtml (UPDATED)
└── Controllers/
    └── AccountController.cs (ALREADY FIXED)
```

---

## ✨ Customization

To modify colors, edit `CampusMart/wwwroot/css/auth.css`:
- **Primary Color:** Change `#FFE600` to your preferred color
- **Background:** Modify the gradient in `body` selector
- **Overlay Gradient:** Edit the SVG linearGradient colors

---

## 📱 Responsive Design

- **Desktop (769px+):** Full dual-form card with overlay animations
- **Mobile (<768px):** Single form per view with tab switching on mobile

Build Status: ✅ **Successful**
