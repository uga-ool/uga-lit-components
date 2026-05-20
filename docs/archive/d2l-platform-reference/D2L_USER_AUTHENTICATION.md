# Managing Learning Service User Authentication
**Developer Platform (January 2026)**

This document explains the various ways an administrator can configure the back-end Learning Service to handle authenticating users, and how this affects the Brightspace API.

---

## Overview

In order to get a full understanding of how the legacy ID-key authentication system works, it is helpful to understand the various ways an administrator can configure the back-end Learning Service to handle authenticating users. You can also read this page if you're interested in learning how your team can organize your back-end Learning Service to accommodate a variety of different ways to do user-authentication.

---

## Simple Authentication Scenarios

In the simple authentication scenarios, the Learning Service itself acts as the authentication provider. When you want to use the Learning Service, you provide your user name and password through the Learning Service's web UI, and once successfully authenticated, you can freely use all the functionality the Service has approved for your user account.

The Learning Service generally has two approaches to simple authentication: it either supports deep linking or it does not (a system configurable option). But, in either case, the simple authentication scenarios take place through the resource pointed at by the **org login path**.

### Org Login Path

The `OrgLoginPath` configuration DOME variable points at a URL that the LMS should use as the entry point for a resource to handle user authentication. With both of the simple authentication scenarios, if the user has not yet authenticated with the Learning Service then, when the user tries to open any URL provided by the Learning Service, it redirects to the URL specified in the `OrgLoginPath`. Likewise, when the user explicitly logs in, the service redirects the browser to the `OrgLoginPath` URL.

In the simple authentication scenarios, the org login path indicates a URL provided by the service itself that acts as the user-authentication entry point. By default, the D2L Brightspace integrated learning platform gets deployed with a simple login page template that serves as the index page for the service's domain, and has the `OrgLoginPath` set to point to the root of your service's domain (that is, `https://devcop.brightspace.com/` for our Developer test instance or in your case, whatever the domain root is for your service).

This default login page template will generate and pass to the client's browser a page containing a simple form to collect the user's name and password and POST them to service's internal web UI login route (`/d2l/lp/auth/login/login.d2l`). Also, by default, the login page template contains code to preserve the page the user was trying to reach when the service redirected the browser to the org login path. Deep-linkable pages in the service have code to attach their URL as a `target` to any redirection to the org login path; third-party links to the org login path should do the same if they want users to be directed back to them after authentication.

### Accounting for Deep-Linking

**If the LMS has deep-linking turned off:**
- It will not respect the `target` query parameter on any request to POST to the service's login API route
- When the service redirects a not-yet-authenticated user to the login page, the service will lose any context about where the user wanted to go originally
- When the user has authenticated, the service will redirect the browser back to the user's default home page after the user has successfully authenticated, regardless of how the user came to the org login path in the first place

**If the LMS has deep-linking turned on:**
- The service's login API route will respect the `target` query parameter passed to it upon POST
- When the service redirects a not-yet-authenticated user to the org login path, if the redirection carries a `target` query parameter, the service will redirect the browser back to that target after the user has successfully authenticated
- If redirection to the org login path does not carry a `target` query parameter, the service will redirect the browser back to the user's default home page (exactly as if the LMS had deep-linking turned off)

### Managing Your Site's Login Page Template

The ASP page that provides the template for your Learning Service's login page lives by default at `/portal/<org_short_name>/index.asp`. You can change the contents of that file to customize your site's login page.

However, in order for your org login page to support deep-linking, it must properly handle the `target` query parameter that deep-linkable pages will attach to the redirection to the org login path.

**Example code for handling the target parameter:**

```asp
<%
' See if login failed '
dim failed
failed = Request.QueryString("failed")
dim target
target = Request.QueryString("target")
dim loginUrl
loginUrl = "/d2l/lp/auth/login/login.d2l"
if (target <> "") then
  loginUrl = loginUrl & "?TARGET=" & server.URLEncode(target)
end if
%>
```

In particular, your login page needs to pass that target on to the resource that actually handles user authentication so that, when finished, that resource will either direct the flow to the user's original target or pass that target on to the next link in the login chain.

### How This Affects the Brightspace API

As part of the legacy three-legged authentication system, the first step involves calling the Brightspace API route, `GET /d2l/auth/api/token` and providing it with an `x_target` query parameter to tell the Learning Service where it should redirect the flow back to when the user has finished authenticating (and the service has tokens to hand back to the API caller).

The handler for the API route will, if the user hasn't yet authenticated, redirect through the org login path with a target parameter that captures both the Learning Service's route tasked with passing back user tokens, and the original `x_target` URL:

```
https://learnserv.myOrg.edu/?target=%2Fd2l%2Fauth%2Fapi%2Ftoken%3Fx_target%3D%252Fhttp%253A%252F%252FclientURLHandler.com%252Fprocess%252FuserTokens
```

Note that now the doubly-embedded `x_target` must have another level of url-encoding, so for example the url-encoded slash character (`/`) `%2F` becomes `%252F`.

Thus, if we assume these simple authentication scenarios (where the org login path passes through the Learning Service site's login page template), this means that the service must preserve and carry forward the `x_target` parameter (originally provided to the `/d2l/auth/api/token` API call) through the entire authentication process:

1. Because the Brightspace API depends upon deep-linking, to support applications using the API, the service must have deep-linking turned on
2. Because the redirection through org login path (to authenticate the Learning Service user) passes through the login page template, that template must curate and pass forward the `target` parameter

---

## SSO Authentication Scenarios

In the SSO authentication scenarios, the Learning Service shares authentication with some other set of services. This can be a scenario where the LMS depends upon another service to provide user authentication, or it can be a scenario where the LMS provides user authentication for another service.

### Using SAML or CAS as an Authentication Provider

When the Learning Service depends on SAML or CAS to do user authentication, a typical setup:
- Configures the `OrgLoginPath` to point to the respective authentication method (`/d2l/lp/auth/saml/login` for SAML, `/d2l/custom/cas` for CAS)
- Configures the `d2l.Tools.Login.LoginPageType` config variable to point to `External Redirect`

The active authentication provider's configuration determines the actual URL it redirects to. For example, when using CAS, you specify the CAS Host Url here: `<instance root>/d2l/custom/config/<org id>/cd56d1e9-ea4a-4242-929d-76129739ee8f`

### Using Shibboleth as an Authentication Provider

When the Learning Service depends on Shibboleth to do user authentication, a typical setup:
- Employs a login page for the Learning Service (just as in the simple scenarios previously described)
- Sets the `OrgLoginPath` to point to this login page
- Provides a mechanism from within that login page to direct to the third-party authentication service, rather than the `/d2l/lp/auth/login/login.d2l` route

**Example link that might appear on the Learning Service login page:**

```html
<p>To login with your OrganizationWide credentials, click <br/>
<!-- line breaks in the URL to help readability, only -->
<a href="https://learnserv.myOrg.edu/shibboleth.sso/Login
?entityID=https://shibboleth.myOrg.edu/idp/shibboleth
&target=https%3A%2F%2Flearnserv.myOrg.edu%2Fd2l%2FshibbolethSSO%2Flogin.d2l">
[HERE]
</a>
</p>
```

The link here directs to an outgoing SSO route provided by the Learning Service (`href="https://learnserv.myOrg.edu/shibboleth.sso/Login"`); this route acts as the Shibboleth Service Provider. The HREF provides the Service Provider with two bits of information:

1. The location of the Identity Provider (`?entityID=https://shibboleth.myOrg.edu/shibboleth`) to redirect to in order to request the user be authenticated
2. The target URL the Identity Provider should call back to and provide the appropriate authenticated user token information (`&target=https%3A%2F%2Flearnserv.myOrg.edu%2Fd2l%2FshibbolethSSO%2Flogin.d2l`); notice that this target is URL-encoded to embed it within the IDP URL (value for the `entityID` parameter) passed to the Service Provider

The connection points for the Learning Service here amount to two:
- The resource it exposes to act as the Service Provider for authentication requests from the user
- The resource it exposes to act as the Service Provider to handle incoming authentication affirmations from the Identity Provider

### Supporting Deep-Linking

Notice that in this Shibboleth example, the Identity Provider receives no information about the resource at the Learning Service that the un-authenticated user was trying to reach: the only contextual information passed to the Identity Provider is the location of the callback entry point at the Service Provider.

If you want to provide that information, then you need to "double embed" a target in the callback URL; for example, here's what an attempt to visit the home page for a course with org unit ID 8083 might look like (note how the doubly-embedded target must have the percent characters url-encoded as well):

```html
<a href="https://learnserv.myOrg.edu/shibboleth.sso/Login
?entityID=https://shibboleth.myOrg.edu/idp/shibboleth
&target=https%3A%2F%2Flearnserv.myOrg.edu%2Fd2l%2FshibbolethSSO%2Flogin.d2l
%253Ftarget%253D%252Fd2l%252Fhome%252F8083">
[HERE]
</a>
```

In order to build this dynamically, if you use the D2L Learning Service's default template page, you'll need a similar approach to the one described previously in "Managing your site's login page template" to help preserve the incoming user-intended target resource. You will also need some assurance that your Service Provider and the Identity Provider will curate this embedded second target through to the callback to the Service Provider so that the Learning Service can pick it up and redirect the now-authenticated user to that page.

### How This Affects the Brightspace API

As with the simple authentication scenario, the Brightspace API client's first step during authentication is calling `/d2l/auth/api/token?x_target=https%3A%2F%2FclientURLHandler%2Ecom%2Fprocess%2FuserTokens`. The Brightspace API combines the `x_target` parameter into the `target` on the request to the org login path, as described previously in the simple authentication scenario section.

This entire chain of targets will need to get captured when sent to the Identity Provider so that the Service Provider's handler coming back from the IDP knows to redirect to the API user-token issuing route:

```html
<a href="https://learnserv.myOrg.edu/shibboleth.sso/Login
?entityID=https://shibboleth.myOrg.edu/idp/shibboleth
&target=https%3A%2F%2Flearnserv.myOrg.edu%2Fd2l%2FshibbolethSSO%2Flogin.d2l
%253Ftarget%253D%252Fd2l%252Fauth%252Fapi%252Ftoken
%25253Fx_target%25253Dhttp%25253A%25252F%25252FclientURLHandler.com%25252Fproces
[HERE]
</a>
```

Note that now the triply-embedded `x_target` must have yet another level of url-encoding, so for example the url-encoded slash character (`/`) `%2F` becomes `%25252F`.

---

## Acting as an Authentication Provider

When another service wants to use the LMS as an authentication provider, this might occur in one of two forms.

### Direct API Use

Some client applications need only to identify and authenticate the Learning Service user so that they can interact with the Learning Service within the permissions context of that user. This is the standard authentication model used by the Brightspace API.

### LTI

Some client applications need to support more than one Learning Service user, and have access to more context than simply the authenticated user. For these situations, the client application can use LTI®, pre-configured, so that the channel between the requester and the Learning Service is already pre-assured. LTI launches from the Learning Service get sent with contextual data, allowing the client application to recognize not only the user but a variety of other contextual data.

---

**Source:** Managing Learning Service user authentication — Developer Platform (January 2026)
