# ✅ How to Test Payment Method Toggles

## 🔧 Fixed Issues:

1. ✅ Improved localStorage parsing logic
2. ✅ Added proper state initialization
3. ✅ Added debug logging to console
4. ✅ Fixed toggle state persistence

---

## 📋 Testing Steps:

### Step 1: Open Browser DevTools Console
- Press `F12` or `Ctrl+Shift+I` in your browser
- Click on "Console" tab
- Keep this open while testing

### Step 2: Go to Admin Payment Settings
- Navigate to: `http://localhost:5080/admin`
- Click "Payment Settings" in the left sidebar

### Step 3: Test Toggle UPI OFF
1. Find the "UPI Payment" toggle
2. Click it to turn OFF (switch should move left)
3. Click "Save Settings" button
4. Look at console - you should see logs like:
   ```
   Settings saved to localStorage: {
     payment_upi_enabled: "false",
     payment_razorpay_enabled: "true",
     ...
   }
   ```

### Step 4: Test Toggle Razorpay OFF
1. Find the "Razorpay" toggle
2. Click it to turn OFF
3. Click "Save Settings"
4. Console should show:
   ```
   Settings saved to localStorage: {
     payment_upi_enabled: "true",
     payment_razorpay_enabled: "false",
     ...
   }
   ```

### Step 5: Refresh Page & Verify Settings Persist
1. Press `F5` to refresh the page
2. Toggles should show the same state as before
3. Console should log:
   ```
   Loading settings from localStorage: {
     savedUpiEnabled: "false" (or "true"),
     savedRazorpayEnabled: "true" (or "false"),
     ...
   }
   ```

### Step 6: Test Payment Dialog (Client Side)
1. Go to client page with a project purchase option
2. Click "Buy Project" button to open payment dialog
3. Check browser console - should show:
   ```
   PaymentOptionsDialog: Loading settings from localStorage
   PaymentOptionsDialog: Parsed states {
     upiEnabledState: false (or true),
     razorpayEnabledState: true (or false)
   }
   ```

### Step 7: Verify Correct Payment Method Shows
- If UPI is disabled: Only Razorpay tab should appear
- If Razorpay is disabled: Only UPI tab should appear
- If both enabled: Both tabs should appear
- If UPI disabled: No UPI QR code or UPI ID section shown
- If Razorpay disabled: No "Pay with Razorpay" button shown

---

## 🧪 Test Scenarios:

### Scenario 1: Only UPI Enabled
```
Admin Page:
✓ UPI toggle = ON
✓ Razorpay toggle = OFF
✓ Click "Save Settings"

Client Page:
✓ Only "UPI Payment" tab visible
✓ Razorpay button NOT visible
✓ Can only pay via UPI
```

### Scenario 2: Only Razorpay Enabled
```
Admin Page:
✓ UPI toggle = OFF
✓ Razorpay toggle = ON
✓ Click "Save Settings"

Client Page:
✓ Only "Razorpay" tab visible
✓ "Pay with Razorpay" button visible
✓ UPI section NOT visible
```

### Scenario 3: Both Enabled
```
Admin Page:
✓ UPI toggle = ON
✓ Razorpay toggle = ON
✓ Click "Save Settings"

Client Page:
✓ Both "UPI Payment" and "Razorpay" tabs visible
✓ Can switch between tabs
✓ Both payment methods available
```

### Scenario 4: Error Case - Both Disabled
```
Admin Page:
✓ Try to disable both toggles
✓ Click "Save Settings"

Result: Should show error message
"Please enable at least one payment method"
```

---

## 🔍 Console Debug Output

### When Saving Settings:
```
Settings saved to localStorage: {
  payment_upi_enabled: "true",
  payment_razorpay_enabled: "false",
  payment_upi_id: "nandishgs1@ibl"
}
```

### When Loading Settings:
```
Loading settings from localStorage: {
  savedUpiId: "nandishgs1@ibl",
  savedUpiEnabled: "true",
  savedRazorpayEnabled: "false",
  savedQrCode: "exists" or "null"
}
Settings loaded: {
  upiEnabledState: true,
  razorpayEnabledState: false
}
```

### In Payment Dialog:
```
PaymentOptionsDialog: Loading settings from localStorage
  {savedUpiEnabled: "true", savedRazorpayEnabled: "false"}
PaymentOptionsDialog: Parsed states
  {upiEnabledState: true, razorpayEnabledState: false}
```

---

## ✅ Expected Behavior:

### Before Fix:
- ❌ Toggles always showed OFF even when turned ON
- ❌ Payment dialog showed both methods regardless of settings
- ❌ Refresh would lose toggle states

### After Fix:
- ✅ Toggles stay ON/OFF as set
- ✅ Payment dialog shows only enabled methods
- ✅ Settings persist after refresh
- ✅ Console logs show proper state transitions
- ✅ Error if trying to disable both methods

---

## 🚀 Quick Test Checklist:

- [ ] Toggle UPI OFF → Save → Verify console logs `payment_upi_enabled: "false"`
- [ ] Toggle Razorpay ON → Save → Verify console logs `payment_razorpay_enabled: "true"`
- [ ] Refresh page → Verify settings persist in toggles
- [ ] Open payment dialog → Should show only enabled methods
- [ ] Try to disable both → Should show error message
- [ ] Check console for proper debug output

---

## 🐛 If Still Having Issues:

1. **Open DevTools Console (F12)**
2. **Paste this to clear localStorage:**
   ```javascript
   localStorage.removeItem("payment_upi_enabled");
   localStorage.removeItem("payment_razorpay_enabled");
   localStorage.removeItem("payment_upi_id");
   localStorage.removeItem("payment_qr_code");
   ```

3. **Refresh page**

4. **Both toggles should be ON** (defaults)

5. **Try toggling again**

---

## 📞 Summary:

The payment method toggles now properly:
- Save toggle state to localStorage
- Load and restore toggle state on page refresh
- Show only enabled payment methods to clients
- Prevent disabling both methods
- Log debug info to console for troubleshooting
