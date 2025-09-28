# Subscription Integration Guide

> This guide will help you integrate the Dodo Payments Subscription Product into your website.

## Prerequisites

To integrate the Dodo Payments API, you'll need:

* A Dodo Payments merchant account
* API credentials (API key and webhook secret key) from the dashboard

If you don't have an account yet, you can get your business approved by [contacting the founder](https://demo.dodopayments.com/) or by filling out this [form](https://dodopayments.com/early-access).

For a more detailed guide on the prerequisites, check this [section](/developer-resources/integration-guide#dashboard-setup).

## API Integration

### Payment Links

Dodo Payments supports two types of payment links:

#### 1. Static Payment Links

[Detailed Guide](/developer-resources/integration-guide#1-static-payment-links)

#### 2. Dynamic Payment Links

Created via API call or our SDK with customer details. Here's an example:

There are two APIs for creating dynamic payment links:

* **Subscription Payment Link API** - [API reference](/api-reference/subscriptions/post-subscriptions)
* **One-time Payment Link API** - [API reference](/api-reference/payments/post-payments)

The guide below focuses on subscription payment link creation.

For detailed instructions on integrating one-time products, refer to this [One-time Integration Guide](/developer-resources/integration-guide).

<Info>Make sure you are passing `payment_link = true` to get payment link </Info>

<Tabs>
  <Tab title="Node.js SDK">
    ```javascript
    import DodoPayments from 'dodopayments';

    const client = new DodoPayments({
    bearerToken: process.env['DODO_PAYMENTS_API_KEY'], // This is the default and can be omitted
    });

    async function main() {
    const subscription = await client.subscriptions.create({
    billing: { city: 'city', country: 'IN', state: 'state', street: 'street', zipcode: 89789 },
    customer: { customer_id: 'customer_id' },
    product_id: 'product_id',
    payment_link: true,
    return_url: 'https://example.com/success',
    quantity: 1,
    });

    console.log(subscription.subscription_id);
    }

    main();
    ```
  </Tab>

  <Tab title="Python SDK">
    ```python
    import os
    from dodopayments import DodoPayments

    client = DodoPayments(
      bearer_token=os.environ.get("DODO_PAYMENTS_API_KEY"),  # This is the default and can be omitted
    )
    subscription = client.subscriptions.create(
      billing={
          "city": "city",
          "country": "IN",
          "state": "state",
          "street": "street",
          "zipcode": 54535,
      },
      customer={
          "customer_id": "customer_id"
      },
      product_id="product_id",
      quantity=1,
      payment_link: true,
      return_url: 'https://example.com/success',
    )
    print(subscription.subscription_id)
    ```
  </Tab>

  <Tab title="GO SDK">
    ```go
    package main

    import (
    "context"
    "fmt"

    "github.com/dodopayments/dodopayments-go"
    "github.com/dodopayments/dodopayments-go/option"
    )

    func main() {
    client := dodopayments.NewClient(
      option.WithBearerToken("My Bearer Token"), // defaults to os.LookupEnv("DODO_PAYMENTS_API_KEY")
    )
    subscription, err := client.Subscriptions.New(context.TODO(), dodopayments.SubscriptionNewParams{
      Billing: dodopayments.F(dodopayments.SubscriptionNewParamsBilling{
        City: dodopayments.F("city"),
        Country: dodopayments.F(dodopayments.CountryCodeIn),
        State: dodopayments.F("state"),
        Street: dodopayments.F("street"),
        Zipcode: dodopayments.F(int64(65787)),
      }),
      Customer: dodopayments.F[dodopayments.SubscriptionNewParamsCustomerUnion](dodopayments.SubscriptionNewParamsCustomerAttachExistingCustomer{
        CustomerID: dodopayments.F("customer_id"),
      }),
      ProductID: dodopayments.F("product_id"),
      Quantity: dodopayments.F(int64(1)),
    })
    if err != nil {
      panic(err.Error())
    }
    fmt.Printf("%+v\n", subscription.SubscriptionID)
    }
    ```
  </Tab>

  <Tab title="Api Reference">
    ```javascript
    import { NextRequest, NextResponse } from "next/server";      

    export async function POST(request: NextRequest) {
    try {
    const body = await request.json();
    const { formData, cartItems } = paymentRequestSchema.parse(body);

    const response = await fetch(`${process.env.NEXT_PUBLIC_DODO_TEST_API}/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DODO_API_KEY}`, // Replace with your API secret key generated from the Dodo Payments Dashboard
    },
    body: JSON.stringify({
      billing: {
        city: formData.city,
        country: formData.country,
        state: formData.state,
        street: formData.addressLine,
        zipcode: parseInt(formData.zipCode),
      },
      customer: {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        phone_number: formData.phoneNumber || undefined,
      },
      payment_link: true,
      product_id: id,
      quantity: 1,
      return_url: process.env.NEXT_PUBLIC_RETURN_URL,
    }),
    });

    if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    return NextResponse.json(
      { error: "Payment link creation failed", details: errorData },
      { status: response.status }
    );
    }

    const data = await response.json();
    return NextResponse.json({ paymentLink: data.payment_link });
    } catch (err) {
    console.error("Payment error:", err);
    return NextResponse.json(
    {
      error: err instanceof Error ? err.message : "An unknown error occurred",
    },
    { status: 500 }
    );
    }
    }
    ```
  </Tab>
</Tabs>

### API Response

The following is an example of the response:

```json
{
  "client_secret": "<string>",
  "customer": {
    "customer_id": "<string>",
    "email": "<string>",
    "name": "<string>"
  },
  "metadata": {},
  "payment_link": "<string>",
  "recurring_pre_tax_amount": 1,
  "subscription_id": "<string>"
}
```

Redirect the customer to `payment_link`.

### Webhooks

When integrating subscriptions, you'll receive webhooks to track the subscription lifecycle. These webhooks help you manage subscription states and payment scenarios effectively.

To set up your webhook endpoint, please follow our [Detailed Integration Guide](/developer-resources/integration-guide#implementing-webhooks).

#### Subscription Event Types

The following webhook events track subscription status changes:

1. **`subscription.active`** - Subscription is successfully activated.
2. **`subscription.on_hold`** - Subscription is put on hold due to failed renewal.
3. **`subscription.failed`** - Subscription creation failed during mandate creation.
4. **`subscription.renewed`** - Subscription is renewed for the next billing period.

For reliable subscription lifecycle management, we recommend tracking these subscription events.

#### Payment Scenarios

**Successful Payment Flow**

When a payment succeeds, you'll receive the following webhooks:

1. `subscription.active` - Indicates subscription activation
2. `payment.succeeded` - Confirms the initial payment:
   * For immediate billing (0 trial days): Expect within 2-10 minutes
   * For trial days: whenever that ends
3. `subscription.renewed` - Indicates payment deduction and renewal for next cycle. (Basically, whenever payment gets deducted for subscription products, you will get `subscription.renewed` webhook along with `payment.succeeded`)

**Payment Failure Scenarios**

1. Subscription Failure

* `subscription.failed` - Subscription creation failed due to failure to create a mandate.
* `payment.failed` - Indicates failed payment.

<Info>**Best Practice**: To simplify implementation, we recommend primarily tracking subscription events for managing the subscription lifecycle.</Info>

### Sample Subscription event payload

***

| Property      | Type   | Required | Description                                                                                  |
| ------------- | ------ | -------- | -------------------------------------------------------------------------------------------- |
| `business_id` | string | Yes      | The unique identifier for the business                                                       |
| `timestamp`   | string | Yes      | The timestamp of when the event occurred (not necessarily the same as when it was delivered) |
| `type`        | string | Yes      | The type of event. See [Event Types](#event-types)                                           |
| `data`        | object | Yes      | The main data payload. See [Data Object](#data-object)                                       |

## Changing Subscription Plans

You can upgrade or downgrade a subscription plan using the change plan API endpoint. This allows you to modify the subscription's product, quantity, and handle proration.

<Card title="Change Plan API Reference" icon="arrows-rotate" href="/api-reference/subscriptions/change-plan">
  For detailed information about changing subscription plans, please refer to our Change Plan API documentation.
</Card>

### Proration Options

When changing subscription plans, you have two options for handling the immediate charge:

#### 1. `prorated_immediately`

* Calculates the prorated amount based on the remaining time in the current billing cycle
* Charges the customer only for the difference between the old and new plan
* During a trial period, this will immediately switch the user to the new plan, charging the customer right away

#### 2. `full_immediately`

* Charges the customer the full subscription amount for the new plan
* Ignores any remaining time or credits from the previous plan
* Useful when you want to reset the billing cycle or charge the full amount regardless of proration

#### 3. `difference_immediately`

* When upgrading, the customer is immediately charged the difference between the two plan amounts.
* For example, if the current plan is 30 Dollars and the customer upgrades to an 80 Dollars, they are charged \$50 instantly.
* When downgrading, the unused amount from the current plan is added as internal credit and automatically applied to future subscription renewals.
* For example, if the current plan is 50 Dollars and the customer switches to a 20 Dollars plan, the remaining \$30 is credited and used toward the next billing cycle.

### Behavior

* When you invoke this API, Dodo Payments immediately initiates a charge based on your selected proration option
* If the plan change is a downgrade and you use `prorated_immediately`, credits will be automatically calculated and added to the subscription's credit balance. These credits are specific to that subscription and will only be used to offset future recurring payments of the same subscription
* The `full_immediately` option bypasses credit calculations and charges the complete new plan amount

<Tip>
  **Choose your proration option carefully**: Use `prorated_immediately` for fair billing that accounts for unused time, or `full_immediately` when you want to charge the complete new plan amount regardless of the current billing cycle.
</Tip>

### Charge Processing

* The immediate charge initiated upon plan change usually completes processing in less than 2 minutes
* If this immediate charge fails for any reason, the subscription is automatically placed on hold until the issue is resolved

## On-Demand Subscriptions

<Info>
  On-demand subscriptions let you charge customers flexibly, not just on a fixed schedule. Contact support to enable this feature.
</Info>

**To create an on-demand subscription:**

To create an on-demand subscription, use the [POST /subscriptions](/api-reference/subscriptions/post-subscriptions) API endpoint and include the `on_demand` field in your request body. This allows you to authorize a payment method without an immediate charge, or set a custom initial price.

**To charge an on-demand subscription:**

For subsequent charges, use the [POST /subscriptions/charge](/api-reference/subscriptions/create-charge) endpoint and specify the amount to charge the customer for that transaction.

<Note>
  For a complete, step-by-step guide—including request/response examples, safe retry policies, and webhook handling—see the <a href="/developer-resources/ondemand-subscriptions">On-Demand Subscriptions Guide</a>.
</Note>
# Payments Integration Guide

> This guide will help you integrate the Dodo Payments API into your website.

## Prerequisites

To integrate the Dodo Payments API, you'll need:

* A Dodo Payments merchant account
* API Credentials (API key and webhook secret key) from dashboard

If you don't have an account yet, you can get your business approved by [contacting the founder](https://demo.dodopayments.com/) or by filling out this [form](https://dodopayments.com/early-access).

## Dashboard Setup

1. Navigate to the [Dodo Payments Dashboard](https://app.dodopayments.com/)

2. Create a product (one-time payment or subscription)
   * [Detailed Guide](/guides/one-time-product)

3. Test the checkout flow:
   * Click the share button on the product page
   * Open the link in your browser
   * Use test card number: `4242 4242 4242 4242`
   * Enter any future expiration date and any 3-digit CVV

4. Generate your API key:
   * Go to Settings > API
   * [Detailed Guide](/api-reference/introduction#api-key-generation)
   * Copy the API key the in env named DODO\_PAYMENTS\_API\_KEY

5. Configure webhooks:
   * Go to Settings > Webhooks
   * Create a webhook URL for payment notifications
   * [Detailed Guide](/guides/webhook-setup)
   * Copy the webhook secret key in env

## API Integration

### Payment Links

Dodo Payments supports two types of payment links for integrating payments into your website:

* **Static Payment Links**: Instantly shareable URLs for quick, no-code payment collection.
* **Dynamic Payment Links**: Programmatically generate payment links with custom details using the API or SDKs.

For a seamless in-page experience, you can use our **Overlay Checkout** integration, which embeds the Dodo Payments checkout on your site by leveraging these payment links.

#### 1. Static Payment Links

Static payment links let you quickly accept payments by sharing a simple URL. You can customize the checkout experience by passing query parameters to pre-fill customer details, control form fields, and add custom metadata.

<Steps>
  <Step title="Construct your payment link">
    Start with the base URL and append your product ID:

    ```text
    https://checkout.dodopayments.com/buy/{productid}
    ```
  </Step>

  <Step title="Add core parameters">
    Include essential query parameters:

    * <ParamField query="quantity" type="integer" default="1">Number of items to purchase.</ParamField>
    * <ParamField query="redirect_url" type="string" required>URL to redirect after payment completion.</ParamField>

    <Note>
      The redirect URL will include payment details as query parameters, for example:<br />
      <code>[https://example.com/?payment\_id=pay\_ts2ySpzg07phGeBZqePbH\&status=succeeded](https://example.com/?payment_id=pay_ts2ySpzg07phGeBZqePbH\&status=succeeded)</code>
    </Note>
  </Step>

  <Step title="Pre-fill customer information (optional)">
    Add customer or billing fields as query parameters to streamline checkout.

    <AccordionGroup>
      <Accordion title="Supported Customer Fields">
        * <ParamField query="fullName" type="string">Customer's full name (ignored if firstName or lastName is provided).</ParamField>
        * <ParamField query="firstName" type="string">Customer's first name.</ParamField>
        * <ParamField query="lastName" type="string">Customer's last name.</ParamField>
        * <ParamField query="email" type="string">Customer's email address.</ParamField>
        * <ParamField query="country" type="string">Customer's country.</ParamField>
        * <ParamField query="addressLine" type="string">Street address.</ParamField>
        * <ParamField query="city" type="string">City.</ParamField>
        * <ParamField query="state" type="string">State or province.</ParamField>
        * <ParamField query="zipCode" type="string">Postal/ZIP code.</ParamField>
        * <ParamField query="showDiscounts" type="boolean">true or false</ParamField>
      </Accordion>
    </AccordionGroup>
  </Step>

  <Step title="Control form fields (optional)">
    <Info>
      You can disable specific fields to make them read-only for the customer. This is useful when you already have the customer's details (e.g., logged-in users).
    </Info>

    To disable a field, provide its value and set the corresponding <code>disable...</code> flag to <code>true</code>:

    <CodeGroup>
      ```text Example
      &email=alice@example.com&disableEmail=true
      ```
    </CodeGroup>

    <Tabs>
      <Tab title="Disable Flags Table">
        | Field        | Disable Flag         | Required Parameter |
        | ------------ | -------------------- | ------------------ |
        | Full Name    | `disableFullName`    | `fullName`         |
        | First Name   | `disableFirstName`   | `firstName`        |
        | Last Name    | `disableLastName`    | `lastName`         |
        | Email        | `disableEmail`       | `email`            |
        | Country      | `disableCountry`     | `country`          |
        | Address Line | `disableAddressLine` | `addressLine`      |
        | City         | `disableCity`        | `city`             |
        | State        | `disableState`       | `state`            |
        | ZIP Code     | `disableZipCode`     | `zipCode`          |
      </Tab>
    </Tabs>

    <Tip>
      Disabling fields helps prevent accidental changes and ensures data consistency.
    </Tip>
  </Step>

  <Step title="Add advanced controls (optional)">
    * <ParamField query="paymentCurrency" type="string">Specifies the payment currency. Defaults to the billing country's currency.</ParamField>
    * <ParamField query="showCurrencySelector" type="boolean" default="true">Show or hide the currency selector.</ParamField>
    * <ParamField query="paymentAmount" type="integer">Amount in cents (for Pay What You Want pricing only).</ParamField>
    * <ParamField query="metadata_*" type="string">Custom metadata fields (e.g., <code>metadata\_orderId=123</code>).</ParamField>
  </Step>

  <Step title="Share the link">
    Send the completed payment link to your customer. When they visit, all query parameters are collected and stored with a session ID. The URL is then simplified to include just the session parameter (e.g., <code>?session=sess\_1a2b3c4d</code>). The stored information persists through page refreshes and is accessible throughout the checkout process.

    <Check>
      The customer's checkout experience is now streamlined and personalized based on your parameters.
    </Check>
  </Step>
</Steps>

#### 2. Dynamic Payment Links

Created via API call or our sdk with customer details. Here's an example:

There are two APIs for creating dynamic payment links:

* One-time Payment Link API [API reference](/api-reference/payments/post-payments)
* Subscription Payment Link API [API reference](/api-reference/subscriptions/post-subscriptions)

The guide below is for one-time payment link creation.

For detailed instructions on integrating subscriptions, refer to this [Subscription Integration Guide](/developer-resources/subscription-integration-guide).

<Info>Make sure you are passing `payment_link = true` to get payment link </Info>

<Tabs>
  <Tab title="Node.js SDK">
    ```javascript
    import DodoPayments from 'dodopayments';

    const client = new DodoPayments({
    bearerToken: process.env['DODO_PAYMENTS_API_KEY'], // This is the default and can be omitted
    });

    async function main() {
    const payment = await client.payments.create({
    payment_link: true,
    billing: { city: 'city', country: 'AF', state: 'state', street: 'street', zipcode: 0 },
    customer: { email: 'email@email.com', name: 'name' },
    product_cart: [{ product_id: 'product_id', quantity: 0 }],
    });

    console.log(payment.payment_id);
    }

    main();
    ```
  </Tab>

  <Tab title="Python SDK">
    ```python
    import os
    from dodopayments import DodoPayments

    client = DodoPayments(
    bearer_token=os.environ.get("DODO_PAYMENTS_API_KEY"),  # This is the default and can be omitted (if using same name `DODO_PAYMENTS_API_KEY`)
    )
    payment = client.payments.create(
    payment_link=True,
    billing={
        "city": "city",
        "country": "AF",
        "state": "state",
        "street": "street",
        "zipcode": 0,
    },
    customer={
        "email": "email@email.com",
        "name": "name",
    },
    product_cart=[{
        "product_id": "product_id",
        "quantity": 0,
    }],
    )
    print(payment.payment_link)
    ```
  </Tab>

  <Tab title="Go SDK">
    ```go
    package main

    import (
    "context"
    "fmt"

    "github.com/dodopayments/dodopayments-go"
    "github.com/dodopayments/dodopayments-go/option"
    )

    func main() {
    client := dodopayments.NewClient(
    option.WithBearerToken("My Bearer Token"), // defaults to os.LookupEnv("DODO_PAYMENTS_API_KEY")
    )
    payment, err := client.Payments.New(context.TODO(), dodopayments.PaymentNewParams{
    PaymentLink: dodopayments.F(true),
    Billing: dodopayments.F(dodopayments.PaymentNewParamsBilling{
      City: dodopayments.F("city"),
      Country: dodopayments.F(dodopayments.CountryCodeAf),
      State: dodopayments.F("state"),
      Street: dodopayments.F("street"),
      Zipcode: dodopayments.F(int64(0)),
    }),
    Customer: dodopayments.F(dodopayments.PaymentNewParamsCustomer{
      Email: dodopayments.F("email"),
      Name: dodopayments.F("name"),
    }),
    ProductCart: dodopayments.F([]dodopayments.PaymentNewParamsProductCart{dodopayments.PaymentNewParamsProductCart{
      ProductID: dodopayments.F("product_id"),
      Quantity: dodopayments.F(int64(0)),
    }}),
    })
    if err != nil {
    panic(err.Error())
    }
    fmt.Printf("%+v\n", payment.PaymentLink)
    }

    ```
  </Tab>

  <Tab title="Api Reference">
    ```javascript
    import { NextRequest, NextResponse } from "next/server";      

    export async function POST(request: NextRequest) {
    try {
    const body = await request.json();
    const { formData, cartItems } = paymentRequestSchema.parse(body);

    const response = await fetch(`${process.env.NEXT_PUBLIC_DODO_TEST_API}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DODO_API_KEY}`, // Replace with your API secret key generated from the Dodo Payments Dashboard
      },
      body: JSON.stringify({
        billing: {
          city: formData.city,
          country: formData.country,
          state: formData.state,
          street: formData.addressLine,
          zipcode: parseInt(formData.zipCode),
        },
        customer: {
          email: formData.email,
          name: `${formData.firstName} ${formData.lastName}`,
          phone_number: formData.phoneNumber || undefined,
        },
        payment_link: true,
        product_cart: cartItems.map((id) => ({
          product_id: id,
          quantity: 1,
        })),
        return_url: process.env.NEXT_PUBLIC_RETURN_URL,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      return NextResponse.json(
        { error: "Payment link creation failed", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ paymentLink: data.payment_link });
    } catch (err) {
    console.error("Payment error:", err);
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "An unknown error occurred",
      },
      { status: 500 }
    );
    }
    }
    ```
  </Tab>
</Tabs>

You can see all our available SDKs on [Dodo Payments SDK](developer-resources/dodo-payments-sdks) page.

For detailed API request body requirements, consult our [API Reference](/api-reference/payments/post-payments).

<Info>After creating the payment link, redirect your customers to complete their payment.</Info>

#### 3. Overlay Checkout

For a seamless in-page checkout experience, explore our [Overlay Checkout](/developer-resources/overlay-checkout) integration that allows customers to complete payments without leaving your website.

### Implementing Webhooks

Set up an API endpoint to receive payment notifications. Here's an example using Next.js:

```javascript
import { Webhook } from "standardwebhooks";
import { headers } from "next/headers";
import { WebhookPayload } from "@/types/api-types";

const webhook = new Webhook(process.env.DODO_WEBHOOK_KEY!); // Replace with your secret key generated from the Dodo Payments Dashboard

export async function POST(request: Request) {
  const headersList = headers();
  const rawBody = await request.text();

  const webhookHeaders = {
    "webhook-id": headersList.get("webhook-id") || "",
    "webhook-signature": headersList.get("webhook-signature") || "",
    "webhook-timestamp": headersList.get("webhook-timestamp") || "",
  };

  await webhook.verify(rawBody, webhookHeaders);
  const payload = JSON.parse(rawBody) as WebhookPayload;
  
  // Process the payload according to your business logic
}
```

Our webhook implementation follows the [Standard Webhooks](https://standardwebhooks.com/) specification. For webhook type definitions, refer to our [Webhook Event Guide](/developer-resources/webhooks/intents/webhook-events-guide).

You can refer to this project with demo implementation on [GitHub](https://github.com/dodopayments/dodo-checkout-demo) using Next.js and TypeScript.

You can check out the live implementation [here](https://atlas.dodopayments.com/).
