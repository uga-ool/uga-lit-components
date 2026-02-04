# Typographical Conventions for D2L API Reference
**Developer Platform (January 2026)**

This document explains the typographical conventions used throughout the Brightspace API reference documentation.

---

## REST-like Action Presentation

Each entry in the reference for a REST-like action consists of:
- The HTTP method you're expected to use
- The route (portion of the URI to follow the Brightspace API service domain location)
- Any parameters the action requires

### Route Parameters

Route parameters represent values in the route itself. You can distinguish route parameters in the reference documentation by values included in parentheses within the route itself:

```
/d2l/api/lp/(version)/users/whoami
```

### Query Parameters

Query parameters are name-value pairs you pass as part of the action URL.

### Form Parameters

Form parameters are form-values you pass in a POST action.

---

## Action Properties Information

Each action entry in the reference comes with a set of relevant property descriptions:

### Parameters

Each action can have up to three sorts of parameters:
- **Simple (or route) parameters**: Values in the route itself, shown in parentheses
- **Query parameters**: Name-value pairs passed as part of the action URL
- **Form parameters**: Form-values passed in a POST action

### Status Codes

Each action typically returns `200 OK` upon success, and other status codes for various unsuccessful results.

### Versions

Each action shows version information for its presence in the API:
- If you see an API version number like `1.0+`, this indicates you can depend on that action in a product component's API from version 1.0 and forward
- When an action's behaviour changes, we note the version of the API supporting the new behaviour
- If an action gets deprecated, we note the version where that has happened

Each version entry in a route reference will indicate the product version (like `LMS v9.4.1`) where this change gets introduced. Alternatively, the notes might tie an API version to the release versions of one or more product components (like `LE v10.0`, `LR v5.6`).

Each action entry will also make relevant comments about what clients must provide as input to an action, and what they can expect to receive back from the server (if what they receive back is over and above the information related by the status codes).

---

## JSON Data Presentation

The Brightspace API passes data back and forth using standard JSON notation (RFC 8259). These reference pages provide lots of examples to show you the kinds of JSON data blocks the framework expects to receive and return back to callers.

**Terminology:** We use the term "JSON data block" to refer to a JSON document. We use the term "block" to reinforce that our APIs may return JSON arrays, objects, or in some cases simple JSON native data types (like JSON strings, numbers, `true`, `false`, or `null`).

**Field Order:** When providing or returning JSON objects across the Brightspace API, the order of fields in the JSON does not matter and can vary over time.

Rather than provide a precise schema for the various JSON data blocks, we provide you with a "looks-like" sample that uses several conventions you should remember.

### Comments

The JSON syntax does not support in-line comments, but you'll see them in the examples in this reference. We include them to help elucidate the format of our structures so that the "real JSON" you see in the structure is as close as possible to the actual format you'd see over the wire.

Our examples use:
- `/* ... */` for multi-line comments
- `// ...` for single-line comments

### Saving Space for Embedded Structures

Some of our JSON structures are quite complex (and some, theoretically non-terminating), and so we use several techniques to show you the structure in a way that isn't going to appear in the data passed over the wire. In particular, this happens with the way we describe array properties.

We'll document an array structure in one of these ways:

```json
{
  "ArrayOfElements": [ // Array of Element blocks
    {
      "FieldOne": <string>,
      "FieldTwo": <number>
    },
    { <composite:Element> }, ...
  ],
  "ACompactArrayOfElements": [ // Array of Element blocks
    { <composite:Element> }, ...
  ],
  "ASimpleArrayOfStrings": [ // Array of strings
    <string>,
    <string>,
    <string>, ...
  ]
}
```

**Ellipsis (`...`):** When you see the ellipsis `...` in our examples, that's an indication that the previous element can be repeated 0 or more times. However, as the ellipsis is not a valid JSON element, note that the server will actually send (or expect) a structure like this (where all the items in angle brackets are placeholders for those actual values):

```json
{
  "ArrayOfElements": [
    { "FieldOne": "FieldValue", "FieldTwo": 1.0 },
    { "FieldOne": "FieldValue", "FieldTwo": 1.0 }
  ],
  "ASimpleArrayOfStrings": [ "One", "Two", "Three" ]
}
```

### Field Value Placeholders

We use several ways to indicate general types of field values by writing placeholders, like this:

```json
{
  "StringField": <string>,
  "BlackOrWhiteStringField": "Black|White",
  "NumberField": <number>,
  "NumberFieldReadAsLong": <number:long>,
  "BooleanField": <boolean>, // May only have the literal values 'true' or 'false'
  "ArrayField": [ <ArrayElement>, ... ],
  "CompositeField": { <composite:CompositeObject> }
}
```

Note that the last two of these indicate that they stand for an embedded array of `ArrayElement` items, and an embedded single instance of a `CompositeObject` composite field.

When we use the `[ <Type>,… ]` and `{ <composite:Type> }` placeholder syntax, you should be able to find the `Type` being declared in the reference's index, even if it's defined close-by in the same reference topic.

### Optional Values

In some cases, JSON fields are null-able: you can provide values for them, or you can provide `null` (we present either `null` first, or the other value first, whichever results in a clearer description):

```json
{
  "NullableNumber": <number>|null,
  "NullableString": <string>|null,
  "NullableObject": null|{ <composite:CompositeObject> }
}
```

**Note:** String properties differentiate between being provided as `null` or as empty:

```json
{
  "NullString": null,
  "EmptyString": ""
}
```

In some cases, an embedded composite or array property might have to be fully included, or be `null` – in these cases, we'll comment it as such.

In a few cases, the presence of a JSON field is actually optional: it can be present, or not present at all. In these cases, a comment will point this out. In this case, the `OptionalStringField` can have a string value, be `null`, or be missing entirely:

```json
{
  "OptionalStringField": <string>|null // Optional.
}
```

---

## Commonly Used Fields

Several JSON fields are so common that we don't fully expand them in our reference pages:

### RichText

Whenever you see a `{ <composite:RichText> }` field in a JSON example, that stands in for a composite block like this:

```json
{
  "Text": <string:plaintext_form_of_text>,
  "Html": <string:HTML_form_of_text>|null
}
```

**Note:** This structure does not guarantee that you'll always get both versions of a string: with some instances of its use, you might get only a text version, or only an HTML version, or both. Accordingly, callers should be prepared to handle results that may not always contain both formats.

### RichTextInput

Whenever you see a `{ <composite:RichTextInput> }` field in a JSON example, that stands in for a composite block like this:

```json
{
  "Content": <string>,
  "Type": "Text|Html"
}
```

**Note:** For the `type` field, you must provide either the value "Text" or "Html", depending upon the formatting of the content string you are providing to the back-end service.

---

## System-Specific Data Types

JSON fields are serialized as one of a number of simple types: number, string, boolean, array, object, or null. However, how you interpret these basic types varies depending upon context. In some cases, the Learning Framework passes you fields and expects you to interpret them in a particular way, and likewise when you provide data back to the framework.

### Basic Type Guidance

The guidance here about how to treat JSON basic types pertains across the entire Brightspace API. In general, the rule of thumb is "unless the documentation says otherwise, please assume…"

#### Array

Unless the documentation says otherwise, assume that:
- A JSON array does not have a constrained size
- JSON arrays are homogenous by basic type (the arrays do not contain mixed basic types)
- However, a JSON array containing JSON objects may contain objects of different composition (different field names, different number of fields, and so on)

#### Number

Unless the documentation specifies otherwise, JSON numbers sent across the API might well be in a 64-bit number space if carrying integer values. The system-specific types documented following that use a JSON number underlying value are more explicit about the types of values such fields contain.

#### Object

You should assume that as Brightspace APIs evolve, JSON objects in the Learning Framework API may contain new fields (even when encountered with legacy API versions). You should always be "forgiving on what you receive and strict in what you send" in JSON objects across the Learning Framework API: be prepared to encounter new fields that you may not understand in JSON objects you receive via the API and be prepared to provide JSON structures that conform closely to the structures as documented here.

#### null

Some fields in our JSON structures are explicitly nullable and are documented as such. Other fields in our JSON structures are implicitly nullable: in general, any field value that is represented as an object in the back-end service may be potentially nullable (most notably, this can be JSON string values).

As with objects, you should be defensive in how you write code:
- Be prepared to receive a `null` value across the API
- Do not send `null` across the API unless the documentation explicitly indicates a field is nullable

#### String

Unless the documentation specifies otherwise, you should consider JSON strings sent across the API as potentially unbounded in size. The system-specific types documented following that use a JSON string underlying value are more explicit about the types of values such fields contain.

---

## System-Specific Type Guidance

The field types here pertain across the entire Brightspace API. Certain sections of the API will also have fields specific to their own actions (often binding enumerated integer values to semantic types), and in these cases the reference page for the API section contains definitions for these fields.

### APIURL

A string value containing a fully formed URL you can use as the basis for another Brightspace API call related to the one that sent back this value (for example a `NextPage` API URL property sent back with a page of results). API clients should treat the exact form of this URL as opaque; it's form may well change over time.

**Note:** You still must use authentication with the API URL string when using it to make a call.

### CSV

Comma-separated list of values; for example, when passed as a query parameter, something like `?qparam=Val1,Val2,Val3`.

### D2LID

A value you should treat as a positive integer in the signed 64-bit number space (with values, therefore, ranging from 1 up to `LONG_MAX`). It's intended as a unique identifier, within the context of the resource class it identifies (thus, a user's UserID value should be unique with respect to the list of all users, but may be not be unique with respect to the list of all courses).

Different routes in the API can expect D2LID values passed in subtly different ways:
- In some routes, they should get passed as a JSON number type encoding a positive, 64-bit integer value
- In some routes, they should get passed as JSON strings which you'll need to interpret as a positive, 64-bit integer value
- In some routes, they get passed as quoted parameter values, or as route parameters; in these cases, the value must be passed as an URL-safe unicode string value, but the service must be able to interpret it as a positive 64-bit integer value

**Warning:** If you provide a string not interpretable as a numeric value, it can bring unintended consequences, especially if the identifier is a parameter within the route itself (this can cause the service to misunderstand what route action you're attempting, and assign your request to the wrong handler).

### D2LPRODUCT

A string value that you should interpret as an identifier for one of the D2L product components installed in your back-end LMS:
- `ep` – ePortfolio
- `le` – Learning Environment
- `lp` – Learning Platform
- `lr` – Learning Repository

### D2LVERSION

A string value that you should treat as a version specifier to indicate the version of the API you want to use. These version strings get built from a major and minor version number (for example: `1.0`).

**Note:** Each component in the back-end learning platform you're connecting to will have its own set of versions it can support.

### GUID / UUID

A string value that you should treat as a 128-bit globally-unique identifier value. You should only need to read and compare, not generate, GUID values. Occasionally, some components will use GUIDs as unique identifiers instead of D2LID values.

### LocalDate

A string value that you should treat as an ISO 8601 formatted date string in the service's local time zone. The service requires that the date string use the format `yyyy-MM-dd`. Note that each element must occupy the specified number of digits, so leading zeroes are required.

### LocalDateTime

A string value that you should treat as an ISO 8601 formatted date-time string in the service's "local" time zone, with the addition of a three-digit millisecond value appended to the time value. The service requires that the time string use the format `yyyy-MM-ddTHH:mm:ss.fff`. Note that each element must occupy the specified number of digits, so leading zeroes are required.

**Example:** To indicate that someone created a comment 67 milliseconds after May 20, 2046, 08:15:30hr in the local timezone, you'd see a property value like this: `"2046-05-20T08:15:30.067"`.

### Replacement Strings

The D2L integrated learning platform supports a macro facility called replacement strings. In some places in the LMS, a string used in the UI or to form an URL can include a special string of the form `{rStringName}` which gets expanded dynamically (either when the page gets rendered in the user's browser, or when the user clicks on a link).

### TenantID

A persistent, unique identifier for a Brightspace Tenant. Conceptually speaking, this maps closest to a historical D2L "Org": that is, the bounding bundle of data and features that comprises one set of users and roles, one set of org unit nodes, one set of organization-level configuration, and so forth.

### Timestamp / UnixTimestamp

An integer number value that you should treat as a standard Unix timestamp: the number of seconds since the Unix epoch (midnight, January 1st, 1970).

### TimeZone

A string value representing a time zone in the IANA Time Zone Database.

### UTCDateTime

A string value that you should treat as an ISO 8601 formatted date-time string in the `Z` (UTC+0) time zone, with the addition of a three-digit millisecond value appended to the time value (before the `Z` time zone specifier). The service requires that the time string use the format `yyyy-MM-ddTHH:mm:ss.fffZ`. Note that each element must occupy the specified number of digits, so leading zeroes are required.

**Example:** To indicate that someone created a comment 67 milliseconds after May 20, 2046, 08:15:30hr, EST (which is five hours behind UTC), you'd see a property value like this: `"2046-05-20T13:15:30.067Z"`.

### Application ID / Application Key / Application Signature / LMSID / LMSKEY

String values that form the basis of the Brightspace API's legacy authentication scheme. The `ID` and `Key` form a symmetric key pair, where the ID gets sent with the message (API call) and the Key gets held privately and used to generate a `Signature` value sent with the message, to vouch for the message's authenticity.

Each application using the Brightspace API must have its own Application ID-key pair, and can request from the back-end service a uniquely generated User ID/Key pair that corresponds to a single authenticated user known to the back-end service.

The back-end service also has an LMSID/LMSKEY pair that it uses for authenticated communication with D2L's Keytool service in order to synchronize its list of known Application ID-key pairs.

---

**Source:** Typographical conventions for this reference — Developer Platform (January 2026)
