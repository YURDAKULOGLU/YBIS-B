# Implementation Plan: Mobile Google OAuth Integration

**Feature**: 003-mobile-google-oauth
**Created**: 2025-09-20
**Status**: Technical Planning
**Estimated Effort**: 2-3 days

---

## 📋 **Plan Overview**

Transform the existing mock authentication system into a full Google OAuth implementation with incremental permissions, error handling, and secure token management.

## 🎯 **Success Criteria**

- ✅ User can connect Google account via system browser OAuth flow
- ✅ Incremental permission requests work (profile → calendar → email → tasks)
- ✅ Failed OAuth scenarios handled gracefully with retry options
- ✅ Authentication persists across app restarts
- ✅ Chat interface proactively suggests Google connection
- ✅ Limited mode works for non-authenticated users

---

## 🔍 **Current State Analysis**

### **Existing Components**
- ✅ `src/stores/authStore.ts` - Full Zustand store with Zod validation (GOOD)
- ✅ `shared/state/auth.ts` - Simple auth store (DUPLICATE - needs removal)
- ✅ Chat interface working
- ✅ Backend Google OAuth implementation ready

### **Missing Components**
- ❌ Google OAuth native implementation
- ❌ Deep link handling
- ❌ Permission management system
- ❌ Error handling UI components
- ❌ OAuth flow integration with chat

### **Dependencies to Add**
- `react-native-app-auth` - OAuth2/OIDC client
- `react-native-keychain` - Secure token storage
- Deep linking configuration

---

## 🏗️ **Technical Architecture**

### **Data Flow**
```
Chat Interface
    ↓
Auth Service (OAuth + API calls)
    ↓
Auth Store (Zustand + persistence)
    ↓
Secure Storage (Keychain) + Backend Token Storage
```

### **Permission Levels**
```typescript
enum PermissionLevel {
  NONE = 'none',
  BASIC = 'basic',        // profile + email + calendar
  EMAIL = 'email',        // + gmail permissions
  TASKS = 'tasks',        // + tasks permissions
  FULL = 'full'           // all permissions
}
```

### **Error Handling Strategy**
```typescript
enum OAuthError {
  USER_CANCELLED = 'user_cancelled',
  NETWORK_ERROR = 'network_error',
  INVALID_CREDENTIALS = 'invalid_credentials',
  PERMISSION_DENIED = 'permission_denied',
  TOKEN_EXPIRED = 'token_expired'
}
```

---

## 📂 **File Structure Changes**

### **New Files to Create**
```
src/
├── services/
│   ├── authService.ts          # Google OAuth implementation
│   └── permissionService.ts    # Permission management
├── components/
│   ├── auth/
│   │   ├── OAuthButton.tsx     # Connect Google button
│   │   ├── PermissionModal.tsx # Permission request UI
│   │   └── AuthError.tsx       # Error display component
│   └── chat/
│       └── GoogleSuggestion.tsx # AI suggestion for Google connection
├── hooks/
│   └── useOAuth.ts             # OAuth flow hook
└── types/
    └── auth.ts                 # OAuth-specific types
```

### **Files to Modify**
```
src/stores/authStore.ts         # Add Google OAuth methods
src/screens/ChatScreen.tsx      # Add Google connection suggestions
src/components/chat/MessageBubble.tsx # Handle auth-related messages
App.tsx                         # Deep link configuration
package.json                    # Add OAuth dependencies
android/app/src/main/AndroidManifest.xml # Deep link setup
ios/YBISMobile/Info.plist       # Deep link setup (if iOS)
```

### **Files to Remove**
```
shared/state/auth.ts            # Remove duplicate auth store
```

---

## 🔧 **Implementation Steps**

### **Phase 1: Setup & Dependencies (Day 1 Morning)**
1. **Add OAuth Dependencies**
   ```bash
   npm install react-native-app-auth react-native-keychain
   cd ios && pod install  # if iOS support needed
   ```

2. **Configure Deep Linking**
   - Add URL scheme: `ybis://auth`
   - Update Android manifest
   - Update iOS info.plist (if needed)

3. **Clean Up Duplicate Auth**
   - Remove `shared/state/auth.ts`
   - Update any imports to use `src/stores/authStore.ts`

### **Phase 2: Core OAuth Service (Day 1 Afternoon)**
4. **Create Auth Service**
   ```typescript
   // src/services/authService.ts
   class AuthService {
     async initiateOAuth(permissionLevel: PermissionLevel): Promise<OAuthResult>
     async refreshToken(): Promise<string>
     async revokeAccess(): Promise<void>
     getRequiredScopes(level: PermissionLevel): string[]
   }
   ```

5. **Update Auth Store**
   - Add Google OAuth methods
   - Add permission level tracking
   - Add token management
   - Integrate with backend auth endpoints

### **Phase 3: UI Components (Day 2 Morning)**
6. **Create OAuth Components**
   - `OAuthButton.tsx` - Connect/disconnect Google
   - `PermissionModal.tsx` - Permission request dialog
   - `AuthError.tsx` - Error message display

7. **Update Chat Interface**
   - Add proactive Google connection suggestion
   - Handle authentication-required scenarios
   - Show permission upgrade prompts

### **Phase 4: Permission Management (Day 2 Afternoon)**
8. **Permission Service**
   ```typescript
   class PermissionService {
     async checkPermission(required: PermissionLevel): Promise<boolean>
     async requestUpgrade(to: PermissionLevel): Promise<boolean>
     async hasScope(scope: string): Promise<boolean>
   }
   ```

9. **Incremental Permission Flow**
   - Basic permissions on initial connection
   - Email permissions when user requests Gmail features
   - Tasks permissions when user requests task features

### **Phase 5: Error Handling & Polish (Day 3)**
10. **Error Handling**
    - Network connectivity issues
    - OAuth cancellation scenarios
    - Token expiration handling
    - Permission denial responses

11. **Integration Testing**
    - Test all OAuth scenarios
    - Test permission upgrades
    - Test error recovery
    - Test persistence across app restarts

12. **Security Verification**
    - Verify token storage security
    - Test token refresh mechanism
    - Validate deep link security

---

## 🔗 **API Integration Points**

### **Backend Endpoints to Use**
```typescript
// Existing backend endpoints
POST /auth/google/tokens    # Exchange auth code for tokens
GET /auth/google/status     # Get current auth status
POST /auth/google/refresh   # Refresh access token
DELETE /auth/google/revoke  # Revoke tokens
```

### **Mobile API Client Updates**
```typescript
// Add to @ybis/api-client
interface AuthEndpoints {
  exchangeAuthCode(code: string): Promise<TokenResponse>
  getAuthStatus(): Promise<AuthStatus>
  refreshToken(): Promise<TokenResponse>
  revokeAccess(): Promise<void>
}
```

---

## 🧪 **Testing Strategy**

### **Unit Tests**
- AuthService OAuth flow logic
- PermissionService permission checking
- Auth store state management
- Error handling scenarios

### **Integration Tests**
- OAuth flow end-to-end
- Permission upgrade flows
- Token persistence and refresh
- Backend API integration

### **Manual Testing Scenarios**
```
✅ Fresh install → OAuth flow → Success
✅ Fresh install → OAuth flow → User cancels
✅ Existing user → App restart → Auto-login
✅ Network error → Retry flow
✅ Permission upgrade → Calendar access
✅ Permission upgrade → Gmail access
✅ Permission upgrade → Tasks access
✅ Account disconnect → Limited mode
```

---

## ⚠️ **Risk Mitigation**

### **Technical Risks**
- **OAuth Library Compatibility**: Test react-native-app-auth with RN 0.81.4
- **Deep Link Conflicts**: Ensure unique URL scheme
- **Token Security**: Verify keychain integration works correctly
- **Backend Integration**: Test all API endpoints thoroughly

### **UX Risks**
- **OAuth Complexity**: Keep UI simple, provide clear instructions
- **Permission Fatigue**: Only request permissions when needed
- **Error Recovery**: Always provide clear retry options

### **Security Risks**
- **Token Exposure**: Never log tokens, use secure storage
- **Deep Link Hijacking**: Validate incoming auth responses
- **MITM Attacks**: Use PKCE for OAuth flow

---

## 📊 **Success Metrics**

### **Technical Metrics**
- OAuth success rate > 95%
- Token refresh success rate > 99%
- App startup time < 2s with auth check
- Zero security vulnerabilities

### **User Experience Metrics**
- Time to complete OAuth < 30 seconds
- Permission upgrade acceptance rate > 80%
- Error recovery success rate > 90%
- User retention after OAuth setup > 85%

---

## 🔄 **Post-Implementation**

### **Immediate Follow-ups**
- Monitor OAuth success/failure rates
- Collect user feedback on flow complexity
- Performance testing with auth flows
- Security audit of token handling

### **Future Enhancements**
- Biometric authentication for app access
- Multiple Google account support
- OAuth for other services (Microsoft, etc.)
- Advanced permission management UI

---

**This plan provides a comprehensive roadmap for implementing secure, user-friendly Google OAuth integration in the YBIS mobile app.**