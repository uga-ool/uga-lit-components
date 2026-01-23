# API Versions (Working to a Common Version)
**Developer Platform (January 2026)**

This document explains how versioning works in the Brightspace API and how to work with different API versions.

---

## Overview

A deployed LMS will not have a tightly coupled relationship with client applications wanting to use its Brightspace API. The organization managing a deployed LMS may have little control over the deployed clients wanting access, and vice-versa. Accordingly, the Brightspace API assumes that clients make an effort to determine what version of support the API can provide, and negotiate with the service to a version that both parties can work with.

---

## Key Versioning Concepts

The Brightspace API has flexibility built in to help it support a varied population of clients:

### API Components Present in a Deployed LMS

Product version will present multiple component versions; this approach allows overlapped versions to facilitate the transition of client applications dependent upon a particular version of a feature set.

### Product Version

A deployed LMS service will have an overall version or brand (such as "20.20.1") that represents the collection of features comprised within the overall, installed product release. This product version is not visible from within the API itself; rather, it implies the collective set of API component versions its API components can provide.

### API Component

Each product component or tool installed in the service will have a set of actions it can support. These actions are grouped together into a set of routes, branching out from the `/d2l/api` root with a `D2LPRODUCT` string (for example, the `/d2l/api/lp/1.23/users/whoami` action is provided by the Learning Platform product component, identified by the `lp` D2LPRODUCT string).

### API Contract Version

Each product component can provide its own versions of the routes it provides. These versions are of the major-minor type ("1.23"), and appear in the route with a `D2LVERSION` string (again, for example, the `/d2l/api/lp/1.23/users/whoami` action is provided by version 1.23 of the `lp` product component's API contract).

Each product component may expose a set of experimental routes in a special unstable version namespace. For example, you might find an experimental version of the whoami action at `/d2l/api/lp/unstable/users/whoami`.

---

## When a Version Number Changes

We classify changes appearing in the API as either non-breaking or breaking.

### Non-Breaking Changes

Non-breaking changes include:
- Pure additions to the API (additions of properties on resources returned from an action, accepting these resources with or without the property inbound to the server, or adding new resources or new actions)
- The new appearance of properties within JSON structures, because we assume that clients use forgiving, not strict, parsing on the JSON they receive from Brightspace

**Version Number Impact:**
- Minor non-breaking changes or fixes will not change a product component's API contract version number
- More significant non-breaking changes can increment the minor component of the product component's API contract version number (for example, from `1.23` to `1.24`)

### Breaking Changes

Breaking changes include:
- Updates to the API (change of how a client calls an action, or what the action does)
- Deprecations (removing actions or resources)

**Version Number Impact:**
- Breaking changes will prompt a change to the product component's API contract major version number

In the "What's in the Brightspace developer platform?" topic we maintain a table summarizing the various version associations for each major product component.

---

## Checking for Version Support

Most commonly, you'll want to know if the deployed LMS service "supports your application"; that is, you'll want to know if the product components in that service provide the right versions of the product component features you need to use. We recommend that the right time to verify this is when your application gets launched (if it's short running), and if necessary with daily frequency (if it's very long running). The steps to verify the service's supported versions are quite light on bandwidth and performance.

### Example

Suppose your application requires that the `lp` product component supports API version `1.23` actions, to perform basic user lookups. However, your application also requires API version `2.5` from the service's `ep` product component, to gain access to ePortfolio artifacts.

To test this, you would use the `POST /d2l/api/versions/check` action, providing a JSON block like this:

```json
[
  {
    "ProductCode": "lp",
    "Version": "1.23"
  },
  {
    "ProductCode": "ep",
    "Version": "2.5"
  }
]
```

The service returns a JSON data block something like this:

```json
{
  "Supported": true,
  "Versions": [
    {
      "ProductCode": "lp",
      "Version": "1.23",
      "Supported": true,
      "LatestVersion": "1.29"
    },
    {
      "ProductCode": "ep",
      "Version": "2.5",
      "Supported": true,
      "LatestVersion": "2.5"
    }
  ]
}
```

From the returned data you only need to examine the top-level `Supported` property to know if the complete set of your support requests are possible. If the top level `Supported` property is `false`, then you will need to look for the `Supported` properties in each composite included in the `Versions` array to find the product component that doesn't meet your requirements.

See the API properties topic for more detailed information on the kinds of version verification actions you can take.

---

## Dealing with Mismatches

We recommend that clients be as visible and descriptive to their users as possible regarding the disposition of the connection between the client application and the back-end LMS:

- **If a server version is not as advanced as the level of support required by your client application:** We advise you to inform the user to contact the system administrators of the back-end LMS.
- **If the deployed client application is not as advanced as the level of support offered by the back-end LMS:** We advise you to suggest to the user that it might be a good idea to update the client application to a more recent version.

For the purposes of easy maintenance and support of your customer deployments, we recommend that you have the same code base cope with multiple API versions, adapting to new features dynamically as you negotiate the API version to use with the service.

---

## Unstable API Contract

We reserve a special API contract version namespace for unstable API routes, called `unstable`. API routes that we classify as experimental or in development can appear in a product component's `unstable` API contract version, and then they may be migrated over into a properly numbered API contract.

The `unstable` API contract is subject to change at any time and while you may find using the routes useful, D2L does not officially provide support for these routes.

D2L's general intention is to migrate unstable routes into the stable API contracts, but as part of their use internally or by partners, we may make improvements that will fundamentally change their functionality.

**You are welcome to prototype with or investigate these features, but please do not expect to be writing production code that uses them.**

---

## Dealing with Deprecation

API contract versions are loosely coupled with the product component releases that introduce them. As a consequence, when a Learning Suite platform release gradually moves out of full support from D2L, the API contract version originating with that Learning Suite also gradually moves out of full support. To help customers move from an older API contract onto a newer one, the deprecation process happens gradually.

For more precise information on milestone dates for a Learning Suite platform release, please contact your organization's approved support contact, or your account or partner manager.

### Deprecation

When an Integrated Learning Platform release reaches the "End of Maintenance" milestone in its lifecycle, the Brightspace API contracts introduced with that release become **deprecated**. When we mark an API contract version for deprecation, this action has the following implications:

- It won't receive prioritized support or attention: D2L may perform maintenance on the API routes, especially in response to critical or security-related issues, but these will get evaluated on a case-by-case basis.
- You should put a priority on planning the transition of all your work off the deprecated API contract.

### Obsolescence

After a period of time in deprecation, D2L can plan to actively remove an API contract. This is most likely to occur when a Learning Suite platform release reaches the "End of Support" milestone in its lifecycle:

- Obsolete API contracts may have their access entirely removed from the back-end service, so that calling them could generate an error (most likely 404 Not Found).
- The API contract may remain in your platform release, but its presence can no longer be depended upon, and you should put a high priority on transitioning all your work away from the obsolete API contract.

### EOL (End of Life)

At any time after obsolescence, D2L can follow through to enact the removal of an API contract from its releases. This will happen when a Learning Suite platform feature or component reaches the "End of Life" milestone in its lifecycle:

- End of Life API contracts will have their access entirely removed from the back-end service, so that calling them will generate an error (most likely, 404 Not Found).
- The API contract will no longer remain in your platform release, and you should put a very high priority on transitioning away from any use of that removed End of Life API contract.

---

## Planning the Transition

Several features of the Brightspace APIs help make the transition away from an older API contract reasonably easy.

### Backward Compatibility

First, subsequent API contracts tend to be super-sets of the contracts that preceded them. In other words, if a route exists under the 1.23 API contract version, you can likely use exactly the same route simply by switching to the 1.24 API contract; the second of these routes includes the functionality of the first:

```
/d2l/api/lp/1.23/users/whoami
/d2l/api/lp/1.24/users/whoami
```

In a few cases, the appearance of the same route in a future API contract version might expose more or the same functionality, but in a different way. These backwards-incompatibilities will be documented in the API reference.

### JSON Structure Compatibility

Second, the JSON structures our API produces and consumes tend to be super-sets of the structures that preceded them. Your client code should be prepared to be forgiving of structure properties that you don't know about; if so, you can likely just advance to the newer version of a route with minimal immediate need to worry about additional properties in the associated structures.

In a few cases, again, a newer version of a structure will remove properties that appeared in older versions. These backwards incompatibilities will be documented in the API reference.

### Best Practices

For the most part, if you follow the suggested model of:
- Checking for version support
- Planning for tolerance in interpretation of the data structures involved in the API contracts

The effort of a transition from an older API contract to a newer one should pose minimal effort.

---

## Summary

1. **Check version support** when your application launches (or periodically for long-running apps)
2. **Use version checking APIs** to verify compatibility before making calls
3. **Handle version mismatches gracefully** with clear user messaging
4. **Avoid unstable APIs** in production code
5. **Plan transitions** from deprecated/obsolete APIs well in advance
6. **Be forgiving** when parsing JSON responses to handle new fields gracefully
7. **Stay informed** about deprecation timelines through your support contacts

---

**Source:** API versions (working to a common version) — Developer Platform (January 2026)
