# Integrating with the Integrated Learning Platform UI
**Developer Platform (January 2026)**

This document describes the various options for integrating your applications into the D2L Integrated Learning Platform (ILP) user interface.

---

## Overview

Users wanting to integrate their own applications into the ILP user interface have several options. The choice depends on:
- What kind of experience you're trying to provide users
- What level of context you need passed between your application and the ILP

The integration options range from simple URL launch points to in-depth Learning Tools Interoperability® (LTI®).

---

## Context Depth Options

D2L's ILP supports connections to your application with various depths of context (letting you know who's connecting, from where, and why).

### Integration Matrix

| Context Depth | Loose UI Integration | Tight UI Integration |
|---------------|---------------------|---------------------|
| **Minimal** | Simple link in navigation bar | Custom widget with HTML |
| **Complex** | External Learning Tool quicklink (LTI) | Custom widget with LTI launch |

---

## Simple URLs

Each org unit can have a collection of links defined as resources it can draw upon. Simple links consist of a URL (which can include query parameters) paired with a descriptive title.

### Referrer Header

Your application can use the referrer HTTP header to detect that the request comes from a D2L ILP service, and then make Brightspace API calls to gather more data. However, since all Brightspace API calls need to be made within the context of a particular user, unless your application already knows the right user context, you'll probably need more contextual information.

### Replacement Strings

When you define a simple link, you can inline replacement strings in the URL text. These replacement strings get expanded by the Learning Service when the user clicks on the link, allowing your application to receive some contextual information directly encoded in the full URL of the request (for example, a user name, or organization name).

**Security Note:** Because this substitution happens directly in the text of the URL being directed to, the site handling the link cannot really be guaranteed of the integrity or authenticity of this contextual data unless the communication path between the LMS server and the site handling the link are secured by some external means (for example, if the LMS server and the handling site were both within the LMS organization's firewall).

---

## Context via LTI

An org unit's custom link can be, instead of just a simple URL link, a QuickLink (an ILP-specific connection to a well-defined type of system tool) pointing to an External Learning Tool (a custom-defined interface to an externally hosted tool, taking advantage of Learning Tools Interoperability® (LTI) to provide context).

You can define a custom link using LTI and then place that link in:
- The D2L Learning Environment's navigation bar
- On a homepage
- Within a course offering's course content (via the Course Builder tool)

These LTI links can pass your service a limited amount of pre-defined contextual information along with the HTTP request when an LMS user clicks the link.

### Workflow

1. **LTI Launch**: An LTI launch passes your application the context defined when the custom link was created. Some of the contextual information your application receives is defined within the LTI standard; D2L's implementation supports several additional custom properties that it can provide to your application.

2. **(Optional) LTI Result Data**: You can decide to use LTI's facility for posting result data back to the back-end Learning Service.

3. **(Optional) Brightspace APIs**: You can decide to use the Brightspace APIs to fetch more context around the request (more detail about a user's profile, for example), and to post result data back into the Learning Service.

### Data Exchange

When performing an LTI launch, tool consumers (the back-end learning service in this case) provide their context data to the tool provider (your service in this case) in POST form data.

---

## Context via Brightspace APIs

Given sufficient context from replacement strings (in a trusted fashion) or LTI, your application can use API calls to the Brightspace API to gather even more information about the context of the request and can then use these calls to take action.

---

## Launch Points

D2L's ILP provides several general launch points, or places where you can integrate with the standard LMS user interface.

### 1. Custom Links

Custom links can provide users with direct URL links to third-party tools. Custom links can be centrally managed (so that changes to a custom link will propagate to all the org units using the link). You can place custom links in:
- The user's navigation bar
- On an org unit homepage

**Use Case:** This approach is typical for supporting separate, parallel tools and applications. In these instances, the user interface for your application appears in a separate browser window, either replacing the ILP's UI in the same window, or prompting the browser to open a new tab or window and rendering your UI there.

#### Permissions

For each role, over each org unit, a set of navbar permissions control this technique:

- **Manage Navbars** and **Manage Navbar Themes**: Lets a user role add items (quick links or custom links) to the navigation bar.
- **Manage Custom Links**: Lets a user role create custom links for use within the org unit where they're created.
- **Share Custom Links**: Lets a user role share custom links to org units that are descendants from the org unit where they're created.

---

### 2. Quicklinks to External Learning Tools

Quicklinks to External Learning Tools can provide users with links to third-party applications and typically they get embedded in content or other input areas (most commonly used for educational content services). When a user defines a new External Learning Tool, part of the process can include an explicit use of LTI (to provide your application with some additional context data) and support a simple, single-sign-on capability.

#### Permissions

For each role, over each org unit, a set of External Learning Tools permissions control this technique:

- **Manage External Learning Tool Providers**: Lets a user role create, modify, or delete an entry for a Tool Provider.
- **Manage External Learning Tools Configuration**: Lets a user role create, modify, or delete an External Learning Tool entry.
- **Manage External Learning Tool Links**: Lets a user role create, modify, or delete a link to a configured External Learning Tool.
- **Launch External Learning Tool Links**: Lets a user role launch a link to an External Learning Tool.
- **Create Quicklinks from available External Learning Tools links**: Lets a user role create a new quicklink to an existing External Learning Tool.

---

### 3. Custom Widgets

By default, organization and course homepages get constructed out of a set of widgets. For example, a student's view of the organization homepage might be built from several system widgets: My Settings, My Courses, Events, News, and so forth. Custom widgets let you expand this visual experience by adding custom HTML into a defined frame that can later be placed on a homepage.

**Features:**
- Custom widgets can point to content resources in LE
- Can act as an IFrame to other systems (but without inherent single sign-on)
- Can be placed on the org page where they're created
- Can be shared to all (and only) its descendants

**Sharing Rules:**
- A custom widget can be created once at a department level, and then shared to all course offerings within that department
- If you create a custom widget in one department, you can't share it to another department: you'd have to re-create it

#### Permissions

For each role type, over each org unit type, a set of Homepage role permissions control this technique:

- **Manage Widgets**: Lets a user role place an existing widget available to the current org unit onto that org unit's home page.
- **Create/Edit Widgets**: Lets a user role create a custom widget so that the current org unit can use it.
- **Share Widgets** and **Delete Shared Widgets**: Lets a user role share a custom widget to org units that are descendants from the org unit where they're created.

**Note:** When using system-provided widgets, the permissions governing the system tool pertain to the content shown (or not shown) inside the widget. (So, when a user has the News widget embedded on a homepage, that user's role in that context determines the News permissions that will affect the content the user sees.)

---

## Integration Approaches Summary

### Simple URL Approach
- **Context**: Minimal (via replacement strings or referrer header)
- **UI Integration**: Loose (separate window/tab)
- **Best For**: Simple links to external tools
- **Security**: Requires trusted network or additional authentication

### LTI Approach
- **Context**: Rich (via LTI standard + D2L custom properties)
- **UI Integration**: Can be loose or tight
- **Best For**: External learning tools requiring authentication and context
- **Security**: Built-in LTI security mechanisms

### Custom Widget Approach
- **Context**: Minimal (via replacement strings) or Rich (via LTI)
- **UI Integration**: Tight (embedded in homepage)
- **Best For**: Content that should appear directly on the ILP homepage
- **Security**: Depends on whether using simple URLs or LTI

---

## Best Practices

1. **Choose the right integration method** based on your context needs and UI requirements
2. **Use LTI** when you need authenticated, secure context passing
3. **Use replacement strings** only in trusted network environments
4. **Consider permissions** - ensure users have appropriate permissions for the integration method you choose
5. **Test sharing behavior** - understand how widgets and links can be shared across org units
6. **Use Brightspace APIs** to gather additional context after initial launch

---

**Source:** Integrating with the Integrated Learning Platform UI — Developer Platform (January 2026)
