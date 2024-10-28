# medusa-notification-courier
courier notification provider for Medusa v2


### Medusa Config
```json
module.exports = defineConfig({
  projectConfig: {
   ....
  },
  modules: {
    .....
    [Modules.NOTIFICATION]: {
      resolve: "@medusajs/medusa/notification",
      options: {
        providers: [
          {
            resolve: "medusa-notification-courier",
            id: "courier",
            options: {
              authToken: process.env.COURIER_API_KEY,
              useCourierTemplate:process.env.COURIER_TEMPLATE
            }
          }
        ]
      }
    }
    ....
  }
})
```
- **COURIER_API_KEY**: Courier api key
- **COURIER_TEMPLATE**: If true, use the email template provided by courier, otherwise use a custom html template

### Example
```typescript

export default async function orderPlaceHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)

  const notificationModuleService = container.resolve(
    Modules.NOTIFICATION
  )
  const orderModule = container.resolve(
    Modules.ORDER
  )
  const order = await orderModule.retrieveOrder(data.id);
  try {
    const notification_data = {
      to: order.email,
      channel: "email",
      // template:"RT67R871X4M3Y9NRV1JS1CB1DXNR",  <- COURIER_TEMPLATE is TRUE
      template: "<p>Order Info</p>",           //  <- COURIER_TEMPLATE is FALSE
      trigger_type: 'order.placed',
      resource_id: order.id,
      resource_type: Modules.ORDER,
      data: {
        subject: 'email subject'
        first_name: order.shipping_address.first_name,
        last_name: order.shipping_address.last_name,
        items: order.items,
      }
    };
    if (order.customer_id) {
      notification_data['receiver_id'] = order.customer_id
    }
    const res = await notificationModuleService.createNotifications(notification_data)
    return res
  } catch (e) {
    logger.error(`[Courier Notification Error]: ${e.message}`);
  }


}

export const config: SubscriberConfig = {
  event: "order.placed",
}

```