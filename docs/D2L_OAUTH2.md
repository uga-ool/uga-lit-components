# OAuth 2.0 Authentication
**Developer Platform (January 2026)**

This document explains how to set up and use OAuth 2.0 authentication with the Brightspace API. For more information about the OAuth 2.0 protocol, including how to implement it in your application, see RFC 6749.

---

## Setting Up OAuth 2.0 Authentication

Follow these steps to set up OAuth 2.0 for your application:

### 1. Register Your Application

Register your application to receive OAuth 2.0 credentials. These values are required for obtaining an access token. Implement these credentials in your application.

### 2. Use the Authorization Code Grant Workflow

Use the Authorization Code Grant workflow defined in the OAuth 2.0 specification to retrieve an access token (either by writing code to support that workflow, or using an available library of your choice).

**Brightspace Service Endpoints:**
- **Authorization endpoint:** `https://auth.brightspace.com/oauth2/auth`
- **Token endpoint:** `https://auth.brightspace.com/core/connect/token`

### 3. Send Access Token in Authorization Header

Send your retrieved access token in the HTTP authorization header of each API call. The authorization header should be in the form of `Bearer accessToken`, where `accessToken` is the value of the access token provided by the Authentication Service:

```
GET https://someLMShost.edu/d2l/api/lp/1.50/users/whoami HTTP/1.1
Authentication: Bearer eyJ0eXAiOiJKV1Q ... {rest of bearer token}
```

For more information about bearer tokens and implementation details, see RFC 6750.

**Warning:** Note that your authentication is a bearer token, meaning anyone making the API call can use this token to authenticate the call. Accordingly, you should always use HTTPS to make API calls when using this authentication method, to keep your authentication token secure.

---

## OAuth2 Scopes in Our APIs

It's useful to understand how our API platform uses OAuth 2.0 scopes, both before you seek to register your application and before your application tries to retrieve an access token to use one or more API actions. Scopes determine which Brightspace API actions your application will have access to call; however, they don't in any way limit what your application can do with the actions they have access to: it's always the calling user context (the Brightspace user on behalf of whom the API action takes place) and that user's enrollment role in the relevant org unit context that ultimately determines what the application can do with Brightspace API actions.

### Specific Scopes

Our API actions that have specific scopes assigned to them will have a scope of this form:

```
<resource-group>:<resource>:<action>
```

For example, the action to retrieve the details for a user has the associated specific scope `users:userdata:read`.

When you register your application you should include each specific scope you want your application to use. When your application requests an access token, it should include each specific scope that it wants the access token to give it access to (note that, this list of scopes must be a subset of the ones the application was registered with).

#### Wildcarding Within Scopes

For convenience, when you register your application, you can use the `*` wildcard within the lists of scopes, for brevity's sake. For example, instead of registering with `users:userdata:delete`, `users:userdata:read`, `users:userdata:create`, and `users:userdata:update`, you can instead register your app with `users:userdata:*`. The wildcard here stands in for all actions associated with that resource-group and resource combination.

You can also use the wildcard in this way when you request an access token.

#### Insufficient Scopes

If you attempt to use an API action without having the correct scopes bound to the access token, you will get an error informing you that you have insufficient scopes to use the action.

### General Fallback Scope

Not all our API actions have specific scopes assigned to them yet. To support these actions, we have a single general fallback scope:

```
core:*:*
```

**Note:** This fallback scope does not appear in our scopes index nor in the API reference documentation for individual API actions.

In order to let your application use these you need to:
- Register to use the general fallback scope
- Ask for that scope when you request an access token

As we continue to provide new specific scopes for API routes, you should use those scopes; however, if an API action used the general fallback scope in the past it will continue to support that scope for access.

In the case of getting an error for insufficient scopes, the error message will signal that the general fallback scope could be used with the API action you attempted to use if it could apply to that action.

---

## Registering Using OAuth 2.0

### Register Your Application

1. From the **Admin Tools** menu, click **Manage Extensibility**.
2. Click **OAuth 2.0**.
3. Click **Register an app**.
4. In the **Application Name** field, enter the name of your app. Brightspace Learning Environment users see this name on the consent page.
5. In the **Redirect URI** field, enter the URI for the page that you want users to be redirected to after authorization is successful.
6. In the **Scope** field, enter a value that represents the scope of the resources you want the app to be able to access on behalf of the user. This value must take the form of a space-delimited string that describes the resource group type, the resource, and the permissions you want the app to have (`group:resource:permissions group2:resource2:permissions2`). For example, `data:aggregates:read`.

   There are two ways you can find the scope you need:
   - Use the scopes table that provides a list of scopes grouped by all the API calls that use each particular scope
   - Look in the API reference for particular routes to see the scope(s) required for each route

7. In the **Access Token Lifetime** field, enter a value in seconds that represents the amount of time that you want the token to be valid for. After this time, the token becomes invalid and the user is prompted to log in again.

   **Note:** You must provide a value between 1800 seconds (30 minutes) and 72000 seconds (20 hours).

8. To prompt users to grant the app consent to use their account, select the **Prompt for user consent** check box.
9. To enable the use of refresh tokens, select the **Enable refresh tokens** check box.
10. After reading the Non-Commercial Developer Agreement, select the **I accept the Non-Commercial Developer Agreement** check box stating you agree to the terms.
11. Click **Register**.

### Retrieve OAuth Credentials

1. From the **Admin Tools** menu, click **Manage Extensibility**.
2. Click **OAuth 2.0**.
3. Click the name of the application for which you want to retrieve credentials.
4. Make a note of the values in the **Client ID** and **Client secret** fields.

**Warning:** Failure to store and transmit these credentials securely compromises the security of your application and related data.

In the event that a set of credentials has been compromised, delete the application from the Manage Extensibility > OAuth 2.0 application list and register a new application to receive new credentials. Use caution when deleting an application, as this action cannot be reverted.

### Revoke Consent from an Authenticated App

When a user has consented to an app, the authentication service remembers the consent indefinitely unless it is revoked. If you revoke consent from an authenticated app, users are prompted for consent again the next time they attempt to authenticate.

1. Navigate to the **My Settings** widget.
2. Click **Account Settings**.
3. In the **Application Settings** section, click **Manage applications registered with OAuth 2.0**.
4. On the **Manage Applications** page, click the app that you want to revoke authentication from.
5. Click **Remove App**.

---

## Best Practices

1. **Always use HTTPS** when making API calls with bearer tokens
2. **Store credentials securely** - never expose Client ID or Client Secret in client-side code
3. **Use specific scopes** when possible instead of the general fallback scope
4. **Request only necessary scopes** - follow the principle of least privilege
5. **Handle token expiration** - implement refresh token logic if enabled
6. **Monitor consent** - allow users to revoke access when needed

---

**Source:** OAuth 2.0 authentication — Developer Platform (January 2026)
